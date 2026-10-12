package handlers

import (
	"context"
	"encoding/json"
	"fmt"
	"net/http"
	"time"

	"kemenag-backend/internal/cache"
	"kemenag-backend/internal/config"
	"kemenag-backend/internal/db"
	"kemenag-backend/internal/response"
	"kemenag-backend/internal/services"

	"github.com/gofiber/fiber/v3"
)

// HealthHandler — GET /api/health
func HealthHandler(c fiber.Ctx) error {
	start := time.Now()
	dbStatus := "ok"
	var dbLatencyMs int64
	ctx, cancel := context.WithTimeout(c.Context(), 2*time.Second)
	defer cancel()
	dbStart := time.Now()
	if lat, err := db.Ping(ctx); err != nil {
		dbStatus = "error"
	} else {
		dbLatencyMs = lat.Milliseconds()
		if dbLatencyMs == 0 {
			dbLatencyMs = time.Since(dbStart).Milliseconds()
		}
	}

	cacheStatus := "in-memory"
	var cacheLatencyMs int64
	if cache.HasRedis() {
		cacheStatus = "redis"
		if lat, err := cache.Ping(ctx); err == nil {
			cacheLatencyMs = lat.Milliseconds()
		} else {
			cacheStatus = "redis_error"
		}
	}

	c.Set("Cache-Control", "no-cache, no-store")
	return c.JSON(fiber.Map{
		"status":        "ok",
		"service":       "kemenag-barito-utara-api",
		"version":       "fiber/v3.5.0",
		"db":            dbStatus,
		"db_latency":    fmt.Sprintf("%dms", dbLatencyMs),
		"cache":         cacheStatus,
		"cache_latency": fmt.Sprintf("%dms", cacheLatencyMs),
		"timestamp":     time.Now().Format(time.RFC3339),
		"uptime_s":      int(time.Since(start).Seconds()),
	})
}

// PortalHandler — GET /api/portal (statistik + 5 berita terbaru)
// PortalHandler — GET /api/portal (statistik + 5 berita terbaru via PocketBase)
func PortalHandler(c fiber.Ctx) error {
	ctx, cancel := context.WithTimeout(c.Context(), 8*time.Second)
	defer cancel()

	pbURL := config.Cfg.PocketBaseURL

	client := &http.Client{Timeout: 5 * time.Second}

	// Fetch 5 berita terbaru
	beritaReq, _ := http.NewRequestWithContext(ctx, http.MethodGet,
		pbURL+"/api/collections/berita/records?filter=(is_published=true)&sort=-created&perPage=5", nil)
	var latest []fiber.Map
	var beritaCount int64 = 0

	if resp, err := client.Do(beritaReq); err == nil {
		defer resp.Body.Close()
		var res struct {
			TotalItems int64 `json:"totalItems"`
			Items      []struct {
				ID          string `json:"id"`
				Slug        string `json:"slug"`
				Title       string `json:"title"`
				Excerpt     string `json:"excerpt"`
				Category    string `json:"category"`
				CoverImage  any    `json:"cover_image"`
				IsPublished bool   `json:"is_published"`
				PublishedAt string `json:"published_at"`
				Created     string `json:"created"`
				Updated     string `json:"updated"`
				Views       int64  `json:"views"`
			} `json:"items"`
		}
		if json.NewDecoder(resp.Body).Decode(&res) == nil {
			beritaCount = res.TotalItems
			for _, item := range res.Items {
				pubAt := item.PublishedAt
				if pubAt == "" {
					pubAt = item.Created
				}
				latest = append(latest, fiber.Map{
					"id":           item.ID,
					"slug":         item.Slug,
					"title":        item.Title,
					"excerpt":      item.Excerpt,
					"category":     item.Category,
					"cover_image":  item.CoverImage,
					"is_published": item.IsPublished,
					"published_at": pubAt,
					"created_at":   item.Created,
					"updated_at":   item.Updated,
					"views":        item.Views,
				})
			}
		}
	}

	response.CDNCacheControl(c, 300, 300)
	return c.JSON(fiber.Map{
		"beritaCount":      beritaCount,
		"galeriCount":      10,
		"laporanCount":     5,
		"latestBerita":     latest,
		"settings":         fiber.Map{},
		"fitur_anti_copas": false,
		"portalUpdated":    time.Now().Format(time.RFC3339),
	})
}

func fmtTime(t *time.Time) any {
	if t == nil {
		return nil
	}
	return t.Format(time.RFC3339)
}

// CacheVersionHandler — GET /api/cache-version (untuk invalidasi FE)
func CacheVersionHandler(c fiber.Ctx) error {
	return c.JSON(fiber.Map{"version": services.CacheVersion()})
}
