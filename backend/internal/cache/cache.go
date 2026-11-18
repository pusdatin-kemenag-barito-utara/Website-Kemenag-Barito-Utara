package cache

import (
	"context"
	"log"
	neturl "net/url"
	"os"
	"strings"
	"sync"
	"time"

	"github.com/redis/go-redis/v9"
)

var (
	rdb      *redis.Client
	rdbSetup bool
	rdbMu    sync.RWMutex
	rdbURL   string

	reconnectMu     sync.Mutex
	reconnectCancel context.CancelFunc

	memoryStore = struct {
		sync.RWMutex
		data map[string]memoryEntry
	}{data: map[string]memoryEntry{}}
)

const (
	l1CacheMaxTTL        = 60 * time.Second
	redisDialTimeout     = 2500 * time.Millisecond
	redisRWTimeout       = 1500 * time.Millisecond
	reconnectInterval    = 15 * time.Second
	maxReconnectAttempts = 20
)

type memoryEntry struct {
	value     string
	expiresAt time.Time
}

var cleanupOnce sync.Once

func startMemoryCleanup() {
	go func() {
		ticker := time.NewTicker(5 * time.Minute)
		defer ticker.Stop()
		for range ticker.C {
			memoryStore.Lock()
			now := time.Now()
			for k, v := range memoryStore.data {
				if !v.expiresAt.IsZero() && now.After(v.expiresAt) {
					delete(memoryStore.data, k)
				}
			}
			memoryStore.Unlock()
		}
	}()
}

// isInternalDockerHostOnLocalMachine mendeteksi hostname internal container Docker/Coolify
// yang dijalankan langsung di mesin development lokal (di luar Docker).
func isInternalDockerHostOnLocalMachine(rawURL string) bool {
	u, err := neturl.Parse(rawURL)
	if err != nil {
		return false
	}
	host := strings.ToLower(strings.TrimSpace(u.Hostname()))
	if host == "" || host == "localhost" || host == "127.0.0.1" || host == "::1" {
		return false
	}
	if strings.Contains(host, ".") {
		return false
	}
	if _, err := os.Stat("/.dockerenv"); err == nil {
		return false
	}
	if os.Getenv("COOLIFY_URL") != "" || os.Getenv("COOLIFY_FQDN") != "" || os.Getenv("KUBERNETES_SERVICE_HOST") != "" {
		return false
	}
	return true
}

func isL1CacheEligible(key string) bool {
	return !strings.HasPrefix(key, "visitor:") &&
		!strings.HasPrefix(key, "rl:") &&
		!strings.HasPrefix(key, "cache:v")
}

func connectRedis(rawURL string) (*redis.Client, time.Duration, error) {
	opts, err := redis.ParseURL(rawURL)
	if err != nil {
		return nil, 0, err
	}
	opts.DialTimeout = redisDialTimeout
	opts.ReadTimeout = redisRWTimeout
	opts.WriteTimeout = redisRWTimeout

	client := redis.NewClient(opts)
	ctx, cancel := context.WithTimeout(context.Background(), redisDialTimeout)
	defer cancel()

	startPing := time.Now()
	if err := client.Ping(ctx).Err(); err != nil {
		_ = client.Close()
		return nil, 0, err
	}
	return client, time.Since(startPing), nil
}

func startReconnectLoop(rawURL string) {
	reconnectMu.Lock()
	if reconnectCancel != nil {
		reconnectCancel()
	}
	ctx, cancel := context.WithCancel(context.Background())
	reconnectCancel = cancel
	reconnectMu.Unlock()

	go func() {
		ticker := time.NewTicker(reconnectInterval)
		defer ticker.Stop()

		for attempt := 1; attempt <= maxReconnectAttempts; attempt++ {
			select {
			case <-ctx.Done():
				return
			case <-ticker.C:
			}

			client, pingDur, err := connectRedis(rawURL)
			if err != nil {
				continue
			}

			rdbMu.Lock()
			if rdb != nil {
				_ = rdb.Close()
			}
			rdb = client
			rdbURL = rawURL
			rdbMu.Unlock()

			log.Printf("[cache] koneksi Redis tersambung kembali pada percobaan #%d (ping: %v) — mode Hybrid L1+L2 aktif",
				attempt, pingDur.Round(100*time.Microsecond))
			return
		}
	}()
}

// Init membuat koneksi Redis opsional. Gagal → fallback L1 in-memory + auto-reconnect di container.
func Init(url string) {
	cleanupOnce.Do(startMemoryCleanup)

	rdbMu.Lock()
	rdbSetup = true
	rdbURL = url
	rdbMu.Unlock()

	if url == "" {
		log.Println("[cache] Redis tidak dikonfigurasi — memakai L1 In-Memory Store (<1ms)")
		return
	}

	if _, err := redis.ParseURL(url); err != nil {
		log.Printf("[cache] REDIS_URL tidak valid (%v) — memakai L1 In-Memory Store", err)
		return
	}

	if isInternalDockerHostOnLocalMachine(url) {
		log.Println("[cache] Mode lokal terdeteksi (host internal Coolify) — memakai L1 In-Memory Store (<1ms)")
		return
	}

	client, pingDuration, err := connectRedis(url)
	if err != nil {
		log.Printf("[cache] koneksi Redis gagal (%v) — memakai L1 In-Memory Store (auto-reconnect aktif)", err)
		rdbMu.Lock()
		rdb = nil
		rdbMu.Unlock()
		startReconnectLoop(url)
		return
	}

	rdbMu.Lock()
	rdb = client
	rdbMu.Unlock()
	log.Printf("[cache] koneksi Redis berhasil (ping: %v) — Hybrid L1+L2 Cache aktif", pingDuration.Round(100*time.Microsecond))
}

// Ping mengecek status koneksi Redis dan mengembalikan latensi. Jika in-memory, mengembalikan 0.
func Ping(ctx context.Context) (time.Duration, error) {
	rdbMu.RLock()
	r := rdb
	rdbMu.RUnlock()
	if r == nil {
		return 0, nil
	}
	start := time.Now()
	err := r.Ping(ctx).Err()
	return time.Since(start), err
}

// HasRedis: true jika Redis aktif (bukan hanya in-memory).
func HasRedis() bool {
	rdbMu.RLock()
	defer rdbMu.RUnlock()
	return rdb != nil
}

// Get mengambil data dari L1 In-Memory terlebih dahulu (untuk key non-counter), lalu fallback ke L2 Redis.
func Get(ctx context.Context, key string) (string, error) {
	l1Eligible := isL1CacheEligible(key)
	if l1Eligible {
		if val, err := memoryGet(key); err == nil {
			return val, nil
		}
	}

	rdbMu.RLock()
	r := rdb
	rdbMu.RUnlock()
	if r != nil {
		val, err := r.Get(ctx, key).Result()
		if err == nil && l1Eligible {
			memorySet(key, val, l1CacheMaxTTL)
		}
		return val, err
	}
	return memoryGet(key)
}

// Set menyimpan data ke L1 In-Memory sekaligus ke L2 Redis (bila aktif).
func Set(ctx context.Context, key string, value string, ttl time.Duration) error {
	memorySet(key, value, ttl)

	rdbMu.RLock()
	r := rdb
	rdbMu.RUnlock()
	if r != nil {
		return r.Set(ctx, key, value, ttl).Err()
	}
	return nil
}

// Del menghapus key dari L1 In-Memory sekaligus dari L2 Redis.
func Del(ctx context.Context, keys ...string) error {
	memoryDel(keys...)

	rdbMu.RLock()
	r := rdb
	rdbMu.RUnlock()
	if r != nil {
		return r.Del(ctx, keys...).Err()
	}
	return nil
}

// DelPrefix menghapus semua key berawalan prefix dari L1 In-Memory sekaligus L2 Redis (SCAN).
func DelPrefix(ctx context.Context, prefix string) error {
	memoryDelPrefix(prefix)

	rdbMu.RLock()
	r := rdb
	rdbMu.RUnlock()
	if r != nil {
		var cursor uint64
		for {
			var keys []string
			var err error
			keys, cursor, err = r.Scan(ctx, cursor, prefix+"*", 100).Result()
			if err != nil {
				return err
			}
			if len(keys) > 0 {
				_ = r.Del(ctx, keys...).Err()
			}
			if cursor == 0 {
				break
			}
		}
		return nil
	}
	return nil
}

func Incr(ctx context.Context, key string) (int64, error) {
	rdbMu.RLock()
	r := rdb
	rdbMu.RUnlock()
	if r != nil {
		return r.Incr(ctx, key).Result()
	}
	return memoryIncr(key), nil
}

func IncrBy(ctx context.Context, key string, n int64) (int64, error) {
	rdbMu.RLock()
	r := rdb
	rdbMu.RUnlock()
	if r != nil {
		return r.IncrBy(ctx, key, n).Result()
	}
	return memoryIncrBy(key, n), nil
}

func Expire(ctx context.Context, key string, ttl time.Duration) error {
	rdbMu.RLock()
	r := rdb
	rdbMu.RUnlock()
	if r != nil {
		return r.Expire(ctx, key, ttl).Err()
	}
	memoryExpire(key, ttl)
	return nil
}

func TTL(ctx context.Context, key string) (time.Duration, error) {
	rdbMu.RLock()
	r := rdb
	rdbMu.RUnlock()
	if r != nil {
		return r.TTL(ctx, key).Result()
	}
	return memoryTTL(key), nil
}

func HIncrBy(ctx context.Context, key, field string, n int64) (int64, error) {
	rdbMu.RLock()
	r := rdb
	rdbMu.RUnlock()
	if r != nil {
		return r.HIncrBy(ctx, key, field, n).Result()
	}
	return memoryHIncrBy(key, field, n), nil
}

func HGetAll(ctx context.Context, key string) (map[string]string, error) {
	rdbMu.RLock()
	r := rdb
	rdbMu.RUnlock()
	if r != nil {
		return r.HGetAll(ctx, key).Result()
	}
	return memoryHGetAll(key), nil
}

func EvalGetDel(ctx context.Context, key string) (int64, error) {
	rdbMu.RLock()
	r := rdb
	rdbMu.RUnlock()
	if r != nil {
		// GETDEL atomic (Redis 6.2+)
		return r.GetDel(ctx, key).Int64()
	}
	return memoryGetDel(key)
}

// Close menutup koneksi Redis (dipanggil saat shutdown).
func Close() {
	reconnectMu.Lock()
	if reconnectCancel != nil {
		reconnectCancel()
		reconnectCancel = nil
	}
	reconnectMu.Unlock()

	rdbMu.Lock()
	defer rdbMu.Unlock()
	if rdb != nil {
		_ = rdb.Close()
		rdb = nil
	}
}

// ---------------- In-memory fallback & L1 cache ----------------

func memoryGet(key string) (string, error) {
	memoryStore.RLock()
	defer memoryStore.RUnlock()
	e, ok := memoryStore.data[key]
	if !ok || (!e.expiresAt.IsZero() && time.Now().After(e.expiresAt)) {
		return "", redis.Nil
	}
	return e.value, nil
}

func memorySet(key, value string, ttl time.Duration) {
	memoryStore.Lock()
	defer memoryStore.Unlock()
	var exp time.Time
	if ttl > 0 {
		exp = time.Now().Add(ttl)
	}
	memoryStore.data[key] = memoryEntry{value: value, expiresAt: exp}
}

func memoryDel(keys ...string) {
	memoryStore.Lock()
	defer memoryStore.Unlock()
	for _, k := range keys {
		delete(memoryStore.data, k)
	}
}

func memoryDelPrefix(prefix string) {
	memoryStore.Lock()
	defer memoryStore.Unlock()
	for k := range memoryStore.data {
		if strings.HasPrefix(k, prefix) {
			delete(memoryStore.data, k)
		}
	}
}

func memoryIncr(key string) int64 {
	memoryStore.Lock()
	defer memoryStore.Unlock()
	e, ok := memoryStore.data[key]
	now := time.Now()
	if !ok || (!e.expiresAt.IsZero() && now.After(e.expiresAt)) {
		e = memoryEntry{}
	}
	n, _ := parseI64(e.value)
	n++
	memoryStore.data[key] = memoryEntry{value: itoa(n), expiresAt: e.expiresAt}
	return n
}

func memoryIncrBy(key string, n int64) int64 {
	memoryStore.Lock()
	defer memoryStore.Unlock()
	e, ok := memoryStore.data[key]
	now := time.Now()
	if !ok || (!e.expiresAt.IsZero() && now.After(e.expiresAt)) {
		e = memoryEntry{}
	}
	cur, _ := parseI64(e.value)
	cur += n
	memoryStore.data[key] = memoryEntry{value: itoa(cur), expiresAt: e.expiresAt}
	return cur
}

func memoryExpire(key string, ttl time.Duration) {
	memoryStore.Lock()
	defer memoryStore.Unlock()
	e, ok := memoryStore.data[key]
	if ok {
		e.expiresAt = time.Now().Add(ttl)
		memoryStore.data[key] = e
	}
}

func memoryTTL(key string) time.Duration {
	memoryStore.RLock()
	defer memoryStore.RUnlock()
	e, ok := memoryStore.data[key]
	if !ok {
		return -2 * time.Second
	}
	if e.expiresAt.IsZero() {
		return -1 * time.Second
	}
	if time.Now().After(e.expiresAt) {
		return -2 * time.Second
	}
	return time.Until(e.expiresAt)
}

func memoryGetDel(key string) (int64, error) {
	memoryStore.Lock()
	defer memoryStore.Unlock()
	e, ok := memoryStore.data[key]
	if !ok {
		return 0, redis.Nil
	}
	delete(memoryStore.data, key)
	n, _ := parseI64(e.value)
	return n, nil
}

func memoryHIncrBy(key, field string, n int64) int64 {
	memoryStore.Lock()
	defer memoryStore.Unlock()
	// simpan hash sebagai prefiks field:key
	hk := "h:" + key + ":" + field
	e, ok := memoryStore.data[hk]
	now := time.Now()
	if !ok || (!e.expiresAt.IsZero() && now.After(e.expiresAt)) {
		e = memoryEntry{}
	}
	cur, _ := parseI64(e.value)
	cur += n
	memoryStore.data[hk] = memoryEntry{value: itoa(cur), expiresAt: e.expiresAt}
	return cur
}

func memoryHGetAll(key string) map[string]string {
	memoryStore.RLock()
	defer memoryStore.RUnlock()
	out := map[string]string{}
	prefix := "h:" + key + ":"
	for k, e := range memoryStore.data {
		if len(k) > len(prefix) && k[:len(prefix)] == prefix {
			out[k[len(prefix):]] = e.value
		}
	}
	return out
}

func parseI64(s string) (int64, bool) {
	var n int64
	if s == "" {
		return 0, false
	}
	for _, c := range s {
		if c < '0' || c > '9' {
			return 0, false
		}
		n = n*10 + int64(c-'0')
	}
	return n, true
}

func itoa(n int64) string {
	if n == 0 {
		return "0"
	}
	neg := n < 0
	if neg {
		n = -n
	}
	var buf [20]byte
	i := len(buf)
	for n > 0 {
		i--
		buf[i] = byte('0' + n%10)
		n /= 10
	}
	if neg {
		i--
		buf[i] = '-'
	}
	return string(buf[i:])
}

var _ = rdbURL