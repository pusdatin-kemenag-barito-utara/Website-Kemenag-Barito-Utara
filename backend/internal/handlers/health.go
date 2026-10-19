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

// PortalHandler — GET /api/portal (statistik + 5 berita terbaru via PocketBase dengan stale fallback)
func PortalHandler(c fiber.Ctx) error {
	ctx, cancel := context.WithTimeout(c.Context(), 8*time.Second)
	defer cancel()

	pbURL := config.Cfg.PocketBaseURL
	client := db.Client()

	// Fetch 5 berita terbaru
	beritaReq, _ := http.NewRequestWithContext(ctx, http.MethodGet,
		pbURL+"/api/collections/berita/records?filter=(is_published=true)&sort=-created&perPage=5", nil)
	var latest []fiber.Map
	var beritaCount int64 = 0

	fetchSuccess := false
	if resp, err := client.Do(beritaReq); err == nil {
		defer resp.Body.Close()
		if resp.StatusCode == 200 {
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
				fetchSuccess = true
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
	}

	payload := fiber.Map{
		"beritaCount":      beritaCount,
		"galeriCount":      10,
		"laporanCount":     5,
		"latestBerita":     latest,
		"settings":         fiber.Map{},
		"fitur_anti_copas": false,
		"portalUpdated":    time.Now().Format(time.RFC3339),
	}

	if fetchSuccess && len(latest) > 0 {
		if b, err := json.Marshal(payload); err == nil {
			_ = cache.Set(ctx, "cache:portal:data", string(b), 24*time.Hour)
		}
	} else {
		// Fallback ke stale cache jika PocketBase bermasalah
		if cachedStr, errC := cache.Get(ctx, "cache:portal:data"); errC == nil && cachedStr != "" {
			var cachedPayload fiber.Map
			if json.Unmarshal([]byte(cachedStr), &cachedPayload) == nil {
				c.Set("X-Cache-Status", "STALE-FALLBACK")
				response.CDNCacheControl(c, 60, 60)
				return c.JSON(cachedPayload)
			}
		}
	}

	response.CDNCacheControl(c, 300, 300)
	return c.JSON(payload)
}


// CacheVersionHandler — GET /api/cache-version (untuk invalidasi FE)
func CacheVersionHandler(c fiber.Ctx) error {
	return c.JSON(fiber.Map{"version": services.CacheVersion()})
}
