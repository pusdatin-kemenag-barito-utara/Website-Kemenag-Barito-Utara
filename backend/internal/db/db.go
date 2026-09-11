package db

import (
	"context"
	"fmt"
	"log"
	"os"
	"strconv"
	"sync"
	"time"

	"github.com/jackc/pgx/v5"
	"github.com/jackc/pgx/v5/pgxpool"
)

var (
	pool   *pgxpool.Pool
	poolMu sync.RWMutex
)

// Init membuat koneksi pool PostgreSQL tunggal.
func Init(databaseURL string) (*pgxpool.Pool, error) {
	if databaseURL == "" {
		return nil, fmt.Errorf("DATABASE_URL tidak diatur")
	}

	cfg, err := pgxpool.ParseConfig(databaseURL)
	if err != nil {
		return nil, fmt.Errorf("pgx parse config: %w", err)
	}

	// Kompatibilitas PgBouncer / Supabase Connection Pooler (port 6543)
	// Mode SimpleProtocol menonaktifkan client-side prepared statement cache yang konflik di PgBouncer
	cfg.ConnConfig.DefaultQueryExecMode = pgx.QueryExecModeSimpleProtocol
	cfg.ConnConfig.ConnectTimeout = 5 * time.Second

	maxConns := 20
	if v := os.Getenv("DB_MAX_CONNS"); v != "" {
		if n, err := strconv.Atoi(v); err == nil && n > 0 {
			maxConns = n
		}
	}
	minConns := 2
	if v := os.Getenv("DB_MIN_CONNS"); v != "" {
		if n, err := strconv.Atoi(v); err == nil && n >= 0 {
			minConns = n
		}
	}

	cfg.MaxConns = int32(maxConns)
	cfg.MinConns = int32(minConns)
	cfg.MaxConnLifetime = 30 * time.Minute
	cfg.MaxConnIdleTime = 5 * time.Minute
	cfg.HealthCheckPeriod = 15 * time.Second

	p, err := pgxpool.NewWithConfig(context.Background(), cfg)
	if err != nil {
		return nil, fmt.Errorf("pgx pool: %w", err)
	}

	const maxAttempts = 5
	var lastErr error
	var pingDuration time.Duration

	for attempt := 1; attempt <= maxAttempts; attempt++ {
		pingStart := time.Now()
		ctx, cancel := context.WithTimeout(context.Background(), 4*time.Second)
		err = p.Ping(ctx)
		cancel()
		if err == nil {
			pingDuration = time.Since(pingStart)
			lastErr = nil
			break
		}
		lastErr = err
		log.Printf("[db] percobaan koneksi ke-%d/%d gagal: %v (mencoba ulang dalam 2s...)", attempt, maxAttempts, err)
		if attempt < maxAttempts {
			time.Sleep(2 * time.Second)
		}
	}

	if lastErr != nil {
		p.Close()
		return nil, fmt.Errorf("ping database gagal setelah %d percobaan: %w", maxAttempts, lastErr)
	}

	poolMu.Lock()
	pool = p
	poolMu.Unlock()

	log.Printf("[db] koneksi PostgreSQL berhasil (ping: %v)", pingDuration.Round(100*time.Microsecond))
	return p, nil
}

// Ping mengecek latensi PostgreSQL dan statistik koneksi pool saat ini.
func Ping(ctx context.Context) (time.Duration, *pgxpool.Stat, error) {
	p := Get()
	if p == nil {
		return 0, nil, fmt.Errorf("pool database belum diinisialisasi")
	}
	start := time.Now()
	err := p.Ping(ctx)
	return time.Since(start), p.Stat(), err
}

func Get() *pgxpool.Pool {
	poolMu.RLock()
	defer poolMu.RUnlock()
	return pool
}

func Close() {
	poolMu.RLock()
	defer poolMu.RUnlock()
	if pool != nil {
		pool.Close()
	}
}