package services

import (
	"context"
	"fmt"
	"sync"
	"time"

	"kemenag-backend/internal/cache"
)

var (
	memTotal   int64 = initialTotal
	memToday   int64 = 0
	memDate    string
	memMu      sync.RWMutex
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

// GetVisitorStats: total + hari ini (pola visitor-tracker).
func GetVisitorStats(ctx context.Context) (int64, int64) {
	today := todayStrWIB()

	memMu.RLock()
	if memDate != today {
		memMu.RUnlock()
		memMu.Lock()
		if memDate != today {
			memDate = today
			memToday = 0
		}
		memMu.Unlock()
		memMu.RLock()
	}
	total := memTotal
	todayCount := memToday
	memMu.RUnlock()

	if cache.HasRedis() {
		if pending, err := cache.Get(ctx, "visitor:total_pending"); err == nil {
			pn := parseIntSafe(pending)
			total += pn
		}
		if rt, err := cache.Get(ctx, "visitor:today:"+today); err == nil {
			rtn := parseIntSafe(rt)
			if rtn > todayCount {
				todayCount = rtn
			}
		}
	}

	return total, todayCount
}

// IncrementVisitorStats: +1 total & hari ini (Redis pending + flush 30s / fallback in-memory).
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

	// Fallback in-memory
	memMu.Lock()
	if memDate != today {
		memDate = today
		memToday = 0
	}
	memTotal++
	memToday++
	memMu.Unlock()
}

// flushVisitorStats: GETDEL pending → update memory.
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

	memMu.Lock()
	memTotal += delta
	memMu.Unlock()
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
