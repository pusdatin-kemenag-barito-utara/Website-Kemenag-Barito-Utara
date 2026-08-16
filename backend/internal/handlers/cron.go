package handlers

import (
	"context"
	"crypto/subtle"
	"strings"
	"time"

	"kemenag-backend/internal/config"
	"kemenag-backend/internal/db"
	"kemenag-backend/internal/response"
	"kemenag-backend/internal/services"

	"github.com/gofiber/fiber/v2"
)

func cronAuthorized(c *fiber.Ctx) bool {
	secret := config.Cfg.CRONSecret
	if secret == "" {
		return false
	}
	auth := c.Get("Authorization")
	key := c.Query("key")
	if strings.HasPrefix(auth, "Bearer ") {
		key = strings.TrimPrefix(auth, "Bearer ")
	}
	if key == "" {
		return false
	}
	return subtle.ConstantTimeCompare([]byte(key), []byte(secret)) == 1
}

// CronPublishBeritaHandler — GET/POST /api/cron/publish-berita
func CronPublishBeritaHandler(c *fiber.Ctx) error {
	if !cronAuthorized(c) {
		return response.Error(c, 401, "Unauthorized.", "UNAUTHORIZED")
	}

	ctx, cancel := context.WithTimeout(c.Context(), 30*time.Second)
	defer cancel()
	pool := db.Get()
	if pool == nil {
		return response.Error(c, 503, "Database tidak tersedia", "DB_UNAVAILABLE")
	}

	tag, err := pool.Exec(ctx, `
		UPDATE kemenag_website.berita
		SET is_published = true, updated_at = now()
		WHERE is_published = false
		  AND published_at IS NOT NULL
		  AND published_at <= now()`)
	if err != nil {
		return response.Error(c, 500, "Gagal publish berita.", "DB_ERROR")
	}
	published := tag.RowsAffected()

	// invalidasi API cache
	services.CacheBust()

	return response.OK(c, fiber.Map{"published": published})
}

// CronPruneAuditHandler — GET/POST /api/cron/prune-audit (no-op, ditangani pusdatin)
func CronPruneAuditHandler(c *fiber.Ctx) error {
	if !cronAuthorized(c) {
		return response.Error(c, 401, "Unauthorized.", "UNAUTHORIZED")
	}
	return response.OK(c, fiber.Map{"deleted": 0})
}