package handlers

import (
	"context"
	"encoding/json"
	"time"

	"kemenag-backend/internal/db"
	"kemenag-backend/internal/middleware"
	"kemenag-backend/internal/response"
	"kemenag-backend/internal/services"

	"github.com/gofiber/fiber/v2"
)

// PublicSettingsHandler — GET /api/settings & GET /api/pengaturan (public settings for frontend & footer)
func PublicSettingsHandler(c *fiber.Ctx) error {
	ctx, cancel := context.WithTimeout(c.Context(), 8*time.Second)
	defer cancel()
	pool := db.Get()

	rows, err := pool.Query(ctx, `SELECT key, value, updated_at FROM kemenag_website.site_settings ORDER BY key ASC`)
	if err != nil {
		return response.Error(c, 500, "Gagal memuat pengaturan.", "DB_ERROR")
	}
	defer rows.Close()

	settings := fiber.Map{}
	for rows.Next() {
		var key string
		var valueRaw []byte
		var updatedAt *time.Time
		if err := rows.Scan(&key, &valueRaw, &updatedAt); err != nil {
			continue
		}
		var v any
		if len(valueRaw) > 0 && json.Unmarshal(valueRaw, &v) == nil {
			settings[key] = v
		} else {
			settings[key] = string(valueRaw)
		}
	}
	c.Set("Cache-Control", "public, max-age=60, s-maxage=300, stale-while-revalidate=600")
	return response.OK(c, settings)
}

// AdminPengaturanGetHandler — GET /api/admin/pengaturan
func AdminPengaturanGetHandler(c *fiber.Ctx) error {
	if _, _, err := middleware.RequireAdmin(c, middleware.AdminAuthOpts{AllowEditor: true}); err != nil {
		return err
	}
	return PublicSettingsHandler(c)
}

// AdminPengaturanSaveHandler — POST /api/admin/pengaturan
func AdminPengaturanSaveHandler(c *fiber.Ctx) error {
	session, _, err := middleware.RequireAdmin(c, middleware.AdminAuthOpts{Permission: "pengaturan:manage"})
	if err != nil {
		return err
	}
	var body fiber.Map
	if err := c.BodyParser(&body); err != nil {
		return response.Error(c, 400, "Body tidak valid.", "INVALID_BODY")
	}

	ctx, cancel := context.WithTimeout(c.Context(), 15*time.Second)
	defer cancel()
	pool := db.Get()

	saved := 0
	for key, rawValue := range body {
		if key == "" {
			continue
		}
		valueJSON, err := json.Marshal(rawValue)
		if err != nil {
			continue
		}
		_, err = pool.Exec(ctx, `
			INSERT INTO kemenag_website.site_settings (key, value, updated_at)
			VALUES ($1, $2::jsonb, now())
			ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value, updated_at = now()`,
			key, string(valueJSON))
		if err != nil {
			continue
		}
		saved++
	}

	services.Audit.Record(struct {
		Action      string
		Entity      string
		EntityID    string
		PerformedBy string
		Before      any
		After       any
		IP          any
	}{
		Action: "update", Entity: "site_settings", PerformedBy: session.UserEmail(),
		After: fiber.Map{"keys_saved": saved}, IP: adminIP(c),
	})
	services.CacheBust()
	services.Realtime.BroadcastRefresh("pengaturan")
	return response.OK(c, fiber.Map{"saved": saved})
}