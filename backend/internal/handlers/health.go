package handlers

import (
	"context"
	"encoding/json"
	"time"

	"kemenag-backend/internal/db"
	"kemenag-backend/internal/response"
	"kemenag-backend/internal/services"

	"github.com/gofiber/fiber/v2"
)

// HealthHandler — GET /api/health
func HealthHandler(c *fiber.Ctx) error {
	start := time.Now()
	dbStatus := "ok"
	ctx, cancel := context.WithTimeout(c.Context(), 2*time.Second)
	defer cancel()
	if db.Get() == nil {
		dbStatus = "unavailable"
	} else if err := db.Get().Ping(ctx); err != nil {
		dbStatus = "error"
	}
	c.Set("Cache-Control", "no-cache, no-store")
	return c.JSON(fiber.Map{
		"status":  "ok",
		"service": "kemenag-barito-utara-api",
		"db":      dbStatus,
		"timestamp": time.Now().Format(time.RFC3339),
		"uptime":  int(time.Since(start).Seconds()),
		"env":     "production",
	})
}

// PortalHandler — GET /api/portal (statistik + 5 berita terbaru)
func PortalHandler(c *fiber.Ctx) error {
	ctx, cancel := context.WithTimeout(c.Context(), 8*time.Second)
	defer cancel()
	pool := db.Get()
	if pool == nil {
		return response.Error(c, 503, "Database tidak tersedia", "DB_UNAVAILABLE")
	}

	var beritaCount, galeriCount, laporanCount int64
	_ = pool.QueryRow(ctx, `SELECT COUNT(*) FROM kemenag_website.berita WHERE is_published = true`).Scan(&beritaCount)
	_ = pool.QueryRow(ctx, `SELECT COUNT(*) FROM kemenag_website.galeri WHERE is_published = true`).Scan(&galeriCount)
	_ = pool.QueryRow(ctx, `SELECT COUNT(*) FROM kemenag_website.report_documents WHERE is_published = true`).Scan(&laporanCount)

	rows, err := pool.Query(ctx, `
		SELECT id, slug, title, excerpt, category, cover_image, is_published, published_at, created_at, updated_at, views
		FROM kemenag_website.berita
		WHERE is_published = true
		ORDER BY published_at DESC
		LIMIT 5`)
	if err != nil {
		return response.Error(c, 500, "Gagal mengambil data: "+err.Error(), "DB_ERROR")
	}
	defer rows.Close()

	latest := []fiber.Map{}
	for rows.Next() {
		var id, slug, title, excerpt, category string
		var coverImage any
		var isPublished bool
		var publishedAt, createdAt, updatedAt *time.Time
		var views int64
		if err := rows.Scan(&id, &slug, &title, &excerpt, &category, &coverImage, &isPublished, &publishedAt, &createdAt, &updatedAt, &views); err != nil {
			continue
		}
		latest = append(latest, fiber.Map{
			"id":           id,
			"slug":         slug,
			"title":        title,
			"excerpt":      excerpt,
			"category":     category,
			"cover_image":  coverImage,
			"is_published": isPublished,
			"published_at": fmtTime(publishedAt),
			"created_at":   fmtTime(createdAt),
			"updated_at":   fmtTime(updatedAt),
			"views":        views,
		})
	}

	// Query site settings for portal
	settingsRows, sErr := pool.Query(ctx, `SELECT key, value FROM kemenag_website.site_settings`)
	settingsMap := fiber.Map{}
	antiCopas := false
	if sErr == nil {
		defer settingsRows.Close()
		for settingsRows.Next() {
			var k string
			var vRaw []byte
			if err := settingsRows.Scan(&k, &vRaw); err == nil {
				var val any
				if len(vRaw) > 0 && json.Unmarshal(vRaw, &val) == nil {
					settingsMap[k] = val
					if k == "fitur_anti_copas" {
						if b, ok := val.(bool); ok {
							antiCopas = b
						}
					}
				} else {
					settingsMap[k] = string(vRaw)
				}
			}
		}
	}

	response.CDNCacheControl(c, 300, 300)
	return c.JSON(fiber.Map{
		"beritaCount":      beritaCount,
		"galeriCount":      galeriCount,
		"laporanCount":     laporanCount,
		"latestBerita":     latest,
		"settings":         settingsMap,
		"fitur_anti_copas": antiCopas,
		"portalUpdated":    time.Now().Format(time.RFC3339),
	})
}

func fmtTime(t *time.Time) any {
	if t == nil {
		return nil
	}
	return t.Format(time.RFC3339)
}


// CacheVersionHandler � GET /api/cache-version (untuk invalidasi FE)
func CacheVersionHandler(c *fiber.Ctx) error {
	return c.JSON(fiber.Map{"version": services.CacheVersion()})
}
