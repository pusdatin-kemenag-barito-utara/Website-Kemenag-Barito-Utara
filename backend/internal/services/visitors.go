package services

import (
	"context"
	"encoding/json"
	"fmt"
	"log"
	"sync"
	"time"

	"kemenag-backend/internal/cache"
	"kemenag-backend/internal/db"
)

const (
	visitorKey     = "visitor_stats"
	initialTotal   = 1860
	visitorFlush   = 30 * time.Second
	visitorTTL     = 48 * time.Hour
)

var (
	visitorMu     sync.Mutex
	visitorTimer  *time.Timer
)

func todayStrWIB() string {
	return time.Now().Add(7 * time.Hour).UTC().Format("2006-01-02")
}

// GetVisitorStats: total + hari ini (pola visitor-tracker.ts).
func GetVisitorStats(ctx context.Context) (int64, int64) {
	today := todayStrWIB()
	total := int64(initialTotal)
	var dbToday int64

	pool := db.Get()
	if pool != nil {
		var valueJSON []byte
		err := pool.QueryRow(ctx,
			`SELECT value FROM kemenag_website.site_settings WHERE key = $1`, visitorKey).Scan(&valueJSON)
		if err == nil {
			var data map[string]any
			_ = json.Unmarshal(valueJSON, &data)
			if t, ok := data["total"]; ok {
				if f, ok := toF64(t); ok && f > initialTotal {
					total = int64(f)
				}
			}
			if d, ok := data["todayDate"].(string); ok && d == today {
				if c, ok := toF64(data["todayCount"]); ok {
					dbToday = int64(c)
				}
			}
		} else {
			// seed
			_, _ = pool.Exec(ctx,
				`INSERT INTO kemenag_website.site_settings (key, value, updated_at)
				 VALUES ($1, $2::jsonb, now()) ON CONFLICT (key) DO NOTHING`,
				visitorKey, `{"total":1860,"todayCount":0,"todayDate":"`+today+`"}`)
		}
	}

	todayCount := dbToday

	if cache.HasRedis() {
		if pending, err := cache.Get(ctx, "visitor:total_pending"); err == nil {
			pn := parseIntSafe(pending)
			total += pn
		}
		if rt, err := cache.Get(ctx, "visitor:today:"+today); err == nil {
			rtn := parseIntSafe(rt)
			if rtn > dbToday {
				todayCount = rtn
			} else if rtn > 0 && rtn < dbToday {
				pending, _ := cache.Get(ctx, "visitor:total_pending")
				todayCount = dbToday + parseIntSafe(pending)
			}
		}
	}

	return total, todayCount
}

// IncrementVisitorStats: +1 total & hari ini (Redis pending + flush 30s / fallback DB).
func IncrementVisitorStats(ctx context.Context, path string) {
	today := todayStrWIB()

	if path != "" && cache.HasRedis() {
		_, _ = cache.HIncrBy(ctx, "visitor:pages", path, 1)
		_ = cache.Expire(ctx, "visitor:pages", visitorTTL)
	}

	if cache.HasRedis() {
		_, _ = cache.Incr(ctx, "visitor:total_pending")
		_, _ = cache.Incr(ctx, "visitor:today:"+today)
		_ = cache.Expire(ctx, "visitor:today:"+today, visitorTTL)

		visitorMu.Lock()
		if visitorTimer == nil {
			visitorTimer = time.AfterFunc(visitorFlush, flushVisitorStats)
		}
		visitorMu.Unlock()
		return
	}

	// Fallback tanpa Redis: update langsung DB
	pool := db.Get()
	if pool == nil {
		return
	}
	now := time.Now().UTC().Format(time.RFC3339)
	_, _ = pool.Exec(ctx, `
		INSERT INTO kemenag_website.site_settings (key, value, updated_at)
		VALUES ($1, $2::jsonb, $3)
		ON CONFLICT (key) DO UPDATE SET
			value = jsonb_set(
				jsonb_set(
					jsonb_set(
						COALESCE(kemenag_website.site_settings.value, '{}'::jsonb),
						'{total}',
						(GREATEST(COALESCE((kemenag_website.site_settings.value->>'total')::int, 1860), 1860) + 1)::text::jsonb
					),
					'{todayCount}',
					(CASE
						WHEN kemenag_website.site_settings.value->>'todayDate' = $4
						THEN COALESCE((kemenag_website.site_settings.value->>'todayCount')::int, 0) + 1
						ELSE 1
					END)::text::jsonb
				),
				'{todayDate}',
				to_jsonb($4::text)
			),
			updated_at = $3`,
		visitorKey,
		`{"total":1861,"todayCount":1,"todayDate":"`+today+`"}`,
		now,
		today,
	)
}

// flushVisitorStats: GETDEL pending → update DB + heal redis.
func flushVisitorStats() {
	visitorMu.Lock()
	visitorTimer = nil
	visitorMu.Unlock()

	if !cache.HasRedis() {
		return
	}
	ctx, cancel := context.WithTimeout(context.Background(), 15*time.Second)
	defer cancel()

	delta, err := cache.EvalGetDel(ctx, "visitor:total_pending")
	if err != nil || delta <= 0 {
		return
	}

	today := todayStrWIB()
	redisToday := int64(0)
	if rt, err := cache.Get(ctx, "visitor:today:"+today); err == nil {
		redisToday = parseIntSafe(rt)
	}

	pool := db.Get()
	if pool == nil {
		return
	}

	var valueJSON []byte
	err = pool.QueryRow(ctx,
		`SELECT value FROM kemenag_website.site_settings WHERE key = $1`, visitorKey).Scan(&valueJSON)
	if err != nil {
		// insert seed
		_, _ = pool.Exec(ctx,
			`INSERT INTO kemenag_website.site_settings (key, value, updated_at)
			 VALUES ($1, $2::jsonb, now())`,
			visitorKey,
			`{"total":`+itoa(delta+initialTotal)+`,"todayCount":`+itoa(redisToday)+`,"todayDate":"`+today+`"}`)
		return
	}

	var data map[string]any
	_ = json.Unmarshal(valueJSON, &data)
	dbTotal := int64(initialTotal)
	if t, ok := toF64(data["total"]); ok && t > initialTotal {
		dbTotal = int64(t)
	}
	newTotal := dbTotal + delta

	dbToday := int64(0)
	if d, ok := data["todayDate"].(string); ok && d == today {
		if c, ok := toF64(data["todayCount"]); ok {
			dbToday = int64(c)
		}
	}
	syncedToday := dbToday + delta
	if redisToday > dbToday {
		syncedToday = redisToday
	}

	if redisToday < syncedToday {
		_ = cache.Set(ctx, "visitor:today:"+today, itoa(syncedToday), visitorTTL)
	}

	_, _ = pool.Exec(ctx,
		`UPDATE kemenag_website.site_settings
		 SET value = $2::jsonb, updated_at = now()
		 WHERE key = $1`,
		visitorKey,
		`{"total":`+itoa(newTotal)+`,"todayCount":`+itoa(syncedToday)+`,"todayDate":"`+today+`"}`)
}

func toF64(v any) (float64, bool) {
	switch t := v.(type) {
	case float64:
		return t, true
	case int64:
		return float64(t), true
	case int:
		return float64(t), true
	case string:
		var f float64
		_, err := fmtSscan(t, &f)
		return f, err == nil
	}
	return 0, false
}

func parseIntSafe(s string) int64 {
	var n int64
	for _, c := range s {
		if c < '0' || c > '9' {
			break
		}
		n = n*10 + int64(c-'0')
	}
	return n
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

func fmtSscan(s string, v *float64) (int, error) {
	_, err := fmt.Sscan(s, v)
	if err != nil {
		return 0, err
	}
	return 1, nil
}

var _ = log.Println
