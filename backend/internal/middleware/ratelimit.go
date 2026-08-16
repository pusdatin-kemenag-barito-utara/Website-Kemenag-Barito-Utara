package middleware

import (
	"context"
	"strings"
	"time"

	"kemenag-backend/internal/cache"

	"github.com/gofiber/fiber/v2"
)

// RateLimitOpts konfigurasi rate limiter (pola rate-limit.ts Next.js).
type RateLimitOpts struct {
	Key      string
	Limit    int
	WindowMs int64
}

// GetClientIP membaca IP dari header proxy.
func GetClientIP(c *fiber.Ctx) string {
	forwarded := c.Get("x-forwarded-for")
	if forwarded != "" {
		return strings.TrimSpace(strings.Split(forwarded, ",")[0])
	}
	realIP := c.Get("x-real-ip")
	if realIP != "" {
		return strings.TrimSpace(realIP)
	}
	return "unknown"
}

// CheckRateLimit memeriksa apakah key melebihi batas rate limit.
// Mengembalikan (allowed bool, retryAfter int64).
func CheckRateLimit(ctx context.Context, key string, limit int, windowSec int64) (bool, int64) {
	if limit <= 0 {
		limit = 10
	}
	if windowSec <= 0 {
		windowSec = 60
	}

	fullKey := "rl:" + key
	count, err := cache.Incr(ctx, fullKey)
	if err != nil {
		return true, 0
	}

	if count == 1 {
		_ = cache.Expire(ctx, fullKey, time.Duration(windowSec)*time.Second)
	}

	if count > int64(limit) {
		ttl, _ := cache.TTL(ctx, fullKey)
		retryAfter := windowSec
		if ttl > 0 {
			retryAfter = int64(ttl.Seconds())
		}
		return false, retryAfter
	}
	return true, 0
}

// RateLimit middleware — Redis INCR+EXPIRE dengan fallback in-memory.
func RateLimit(opts RateLimitOpts) fiber.Handler {
	limit := opts.Limit
	if limit <= 0 {
		limit = 10
	}
	windowMs := opts.WindowMs
	if windowMs <= 0 {
		windowMs = 60_000
	}
	windowSec := maxInt64(1, windowMs/1000)

	return func(c *fiber.Ctx) error {
		key := opts.Key
		if strings.Contains(key, "{ip}") {
			key = strings.ReplaceAll(key, "{ip}", GetClientIP(c))
		}

		ctx, cancel := context.WithTimeout(c.Context(), 3*time.Second)
		defer cancel()

		allowed, retryAfter := CheckRateLimit(ctx, key, limit, windowSec)
		if !allowed {
			c.Set("Retry-After", itoa64(retryAfter))
			return responseJSON(c, 429, fiber.Map{
				"message":    "Terlalu banyak permintaan. Silakan coba lagi nanti.",
				"code":       "RATE_LIMITED",
				"retryAfter": retryAfter,
			})
		}

		return c.Next()
	}
}

func responseJSON(c *fiber.Ctx, status int, body any) error {
	c.Set("Cache-Control", "no-store")
	c.Set("Retry-After", c.Get("Retry-After"))
	return c.Status(status).JSON(body)
}

func maxInt64(a, b int64) int64 {
	if a > b {
		return a
	}
	return b
}

func itoa64(n int64) string {
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
