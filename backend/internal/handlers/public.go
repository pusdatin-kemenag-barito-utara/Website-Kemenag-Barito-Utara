package handlers

import (
	"context"
	"encoding/json"
	"fmt"
	"net/http"
	"net/url"
	"strconv"
	"strings"
	"time"

	"kemenag-backend/internal/config"
	"kemenag-backend/internal/db"
	"kemenag-backend/internal/middleware"
	"kemenag-backend/internal/response"
	"kemenag-backend/internal/services"

	"github.com/gofiber/fiber/v3"
)

// SeksiPublicHandler — GET /api/seksi (via PocketBase)
func SeksiPublicHandler(c fiber.Ctx) error {
	ctx, cancel := context.WithTimeout(c.Context(), 8*time.Second)
	defer cancel()

	pbURL := config.Cfg.PocketBaseURL

	req, err := http.NewRequestWithContext(ctx, http.MethodGet, pbURL+"/api/collections/seksi/records?perPage=50", nil)
	if err != nil {
		return response.Error(c, 500, "Gagal membangun request", "INTERNAL_ERROR")
	}

	client := &http.Client{Timeout: 5 * time.Second}
	resp, err := client.Do(req)
	if err != nil {
		return response.Error(c, 502, "Gagal mengambil data seksi dari PocketBase", "UPSTREAM_ERROR")
	}
	defer resp.Body.Close()

	var data struct {
		Items []fiber.Map `json:"items"`
	}
	if err := json.NewDecoder(resp.Body).Decode(&data); err != nil {
		return response.Error(c, 500, "Gagal memproses response", "PARSE_ERROR")
	}

	// Agregasi jumlah pegawai_seksi per seksi
	pegawaiReq, errP := http.NewRequestWithContext(ctx, http.MethodGet, pbURL+"/api/collections/pegawai_seksi/records?perPage=200&sort=sort_order", nil)
	if errP == nil {
		if respP, errPDo := client.Do(pegawaiReq); errPDo == nil {
			defer respP.Body.Close()
			var dataP struct {
				Items []fiber.Map `json:"items"`
			}
			if json.NewDecoder(respP.Body).Decode(&dataP) == nil {
				counts := make(map[string]int)
				for _, p := range dataP.Items {
					if sid, ok := p["seksi_id"].(string); ok && sid != "" {
						counts[sid]++
					}
				}
				for i, s := range data.Items {
					sid, _ := s["id"].(string)
					origID, _ := s["original_id"].(string)
					cnt := counts[sid]
					if origID != "" && origID != sid {
						cnt += counts[origID]
					}
					s["pegawai_count"] = cnt
					data.Items[i] = s
				}
			}
		}
	}

	response.CDNCacheControl(c, 600, 1200)
	return c.JSON(fiber.Map{"seksi": data.Items})
}

// SeksiDetailPublicHandler — GET /api/seksi/:slug
func SeksiDetailPublicHandler(c fiber.Ctx) error {
	ctx, cancel := context.WithTimeout(c.Context(), 8*time.Second)
	defer cancel()

	slug := strings.TrimSpace(c.Params("slug"))
	if slug == "" {
		return response.Error(c, 400, "Slug seksi diperlukan", "BAD_REQUEST")
	}

	pbURL := config.Cfg.PocketBaseURL

	reqURL := fmt.Sprintf("%s/api/collections/seksi/records?filter=(slug='%s')&perPage=1", pbURL, url.QueryEscape(slug))
	req, _ := http.NewRequestWithContext(ctx, http.MethodGet, reqURL, nil)

	client := &http.Client{Timeout: 5 * time.Second}
	resp, err := client.Do(req)
	if err != nil {
		return response.Error(c, 502, "Upstream error", "UPSTREAM_ERROR")
	}
	defer resp.Body.Close()

	var res struct {
		Items []fiber.Map `json:"items"`
	}
	if json.NewDecoder(resp.Body).Decode(&res) == nil && len(res.Items) > 0 {
		seksi := res.Items[0]
		seksiID, _ := seksi["id"].(string)
		origID, _ := seksi["original_id"].(string)

		// Fetch staf pegawai_seksi yang terhubung ke seksi ini
		filterCond := fmt.Sprintf("seksi_id='%s'", seksiID)
		if origID != "" && origID != seksiID {
			filterCond = fmt.Sprintf("seksi_id='%s'||seksi_id='%s'", seksiID, origID)
		}

		pegawaiReqURL := fmt.Sprintf("%s/api/collections/pegawai_seksi/records?filter=(%s)&sort=sort_order&perPage=100", pbURL, url.QueryEscape(filterCond))
		pegawaiReq, errP := http.NewRequestWithContext(ctx, http.MethodGet, pegawaiReqURL, nil)
		var pegawaiItems []fiber.Map
		if errP == nil {
			if respP, errPDo := client.Do(pegawaiReq); errPDo == nil {
				defer respP.Body.Close()
				var pData struct {
					Items []fiber.Map `json:"items"`
				}
				if json.NewDecoder(respP.Body).Decode(&pData) == nil {
					pegawaiItems = pData.Items
				}
			}
		}

		if pegawaiItems == nil {
			pegawaiItems = []fiber.Map{}
		}
		seksi["pegawai"] = pegawaiItems
		seksi["pegawai_count"] = len(pegawaiItems)

		response.CDNCacheControl(c, 600, 1200)
		return c.JSON(fiber.Map{"seksi": seksi})
	}

	return response.Error(c, 404, "Seksi tidak ditemukan", "NOT_FOUND")
}

// StaticPagesHandler — GET /api/static-pages (?slug=)
func StaticPagesHandler(c fiber.Ctx) error {
	ctx, cancel := context.WithTimeout(c.Context(), 8*time.Second)
	defer cancel()

	pbURL := config.Cfg.PocketBaseURL

	slug := strings.TrimSpace(c.Query("slug"))
	var reqURL string
	if slug != "" {
		reqURL = fmt.Sprintf("%s/api/collections/static_pages/records?filter=(slug='%s')&perPage=1", pbURL, url.QueryEscape(slug))
	} else {
		reqURL = fmt.Sprintf("%s/api/collections/static_pages/records?perPage=50", pbURL)
	}

	req, _ := http.NewRequestWithContext(ctx, http.MethodGet, reqURL, nil)
	client := &http.Client{Timeout: 5 * time.Second}
	resp, err := client.Do(req)
	if err != nil {
		return response.Error(c, 502, "Upstream error", "UPSTREAM_ERROR")
	}
	defer resp.Body.Close()

	var res struct {
		Items []fiber.Map `json:"items"`
	}
	_ = json.NewDecoder(resp.Body).Decode(&res)

	if slug != "" {
		if len(res.Items) > 0 {
			response.CDNCacheControl(c, 600, 1200)
			return c.JSON(res.Items[0])
		}
		return response.Error(c, 404, "Halaman tidak ditemukan", "PAGE_NOT_FOUND")
	}

	response.CDNCacheControl(c, 600, 1200)
	return c.JSON(fiber.Map{"pages": res.Items})
}

// SearchHandler — GET /api/search via PocketBase
func SearchHandler(c fiber.Ctx) error {
	query := strings.TrimSpace(c.Query("q"))
	if len(query) < 2 {
		return response.Error(c, 400, "Query minimal 2 karakter.", "QUERY_TOO_SHORT")
	}
	limit := 10
	if v, err := strconv.Atoi(c.Query("limit")); err == nil && v > 0 && v <= 50 {
		limit = v
	}

	ctx, cancel := context.WithTimeout(c.Context(), 5*time.Second)
	defer cancel()

	pbURL := config.Cfg.PocketBaseURL

	var results []fiber.Map
	client := &http.Client{Timeout: 4 * time.Second}

	// 1. Berita search
	filter := fmt.Sprintf("(is_published=true && (title ~ '%s' || excerpt ~ '%s'))", query, query)
	reqURL := fmt.Sprintf("%s/api/collections/berita/records?filter=%s&perPage=%d", pbURL, url.QueryEscape(filter), limit)
	if req, err := http.NewRequestWithContext(ctx, http.MethodGet, reqURL, nil); err == nil {
		if resp, err := client.Do(req); err == nil {
			defer resp.Body.Close()
			var data struct {
				Items []struct {
					ID          string `json:"id"`
					Slug        string `json:"slug"`
					Title       string `json:"title"`
					Excerpt     string `json:"excerpt"`
					Category    string `json:"category"`
					CoverImage  string `json:"cover_image"`
					CoverFile   string `json:"cover_file"`
					PublishedAt string `json:"published_at"`
					Created     string `json:"created"`
					Views       int64  `json:"views"`
				} `json:"items"`
			}
			if json.NewDecoder(resp.Body).Decode(&data) == nil {
				for _, it := range data.Items {
					results = append(results, fiber.Map{
						"id":           it.ID,
						"slug":         it.Slug,
						"title":        it.Title,
						"excerpt":      it.Excerpt,
						"description":  it.Excerpt,
						"category":     it.Category,
						"cover_image":  it.CoverImage,
						"published_at": it.PublishedAt,
						"views":        it.Views,
						"type":         "berita",
						"section":      "Berita",
						"href":         "/berita/" + it.Slug,
					})
				}
			}
		}
	}

	if results == nil {
		results = []fiber.Map{}
	}

	response.CDNCacheControl(c, 120, 300)
	return c.JSON(fiber.Map{
		"results": results,
		"items":   results,
		"total":   len(results),
		"query":   query,
	})
}

// VisitorStatsHandler — GET /api/visitors
func VisitorStatsHandler(c fiber.Ctx) error {
	ctx, cancel := context.WithTimeout(c.Context(), 6*time.Second)
	defer cancel()
	total, today := services.GetVisitorStats(ctx)
	response.CDNCacheControl(c, 0, 0)
	return c.JSON(fiber.Map{"total": total, "today": today})
}

// VisitorIncrementHandler — POST /api/visitors
func VisitorIncrementHandler(c fiber.Ctx) error {
	ctx, cancel := context.WithTimeout(c.Context(), 6*time.Second)
	defer cancel()

	path := ""
	var body fiber.Map
	if err := c.Bind().Body(&body); err == nil {
		if p, ok := body["path"].(string); ok {
			path = p
		}
	}
	services.IncrementVisitorStats(ctx, path)
	return response.OK(c, fiber.Map{"ok": true})
}

// MaintenanceStatusHandler — GET /api/maintenance-status
func MaintenanceStatusHandler(c fiber.Ctx) error {
	c.Set("Cache-Control", "no-store")
	c.Set("CDN-Cache-Control", "no-store")
	return c.JSON(fiber.Map{"maintenance": false})
}

// BeritaViewIncrementHandler — POST /api/berita/:slug/view
func BeritaViewIncrementHandler(c fiber.Ctx) error {
	ctx, cancel := context.WithTimeout(c.Context(), 8*time.Second)
	defer cancel()

	slug := strings.TrimSpace(c.Params("slug"))
	if slug == "" {
		return response.Error(c, 400, "Slug berita diperlukan", "BAD_REQUEST")
	}

	record, err := db.GetRecordBySlug(ctx, "berita", slug)
	if err != nil {
		return response.Error(c, 404, "Berita tidak ditemukan", "NOT_FOUND")
	}

	id, _ := record["id"].(string)
	if id == "" {
		return response.Error(c, 404, "ID berita tidak valid", "NOT_FOUND")
	}

	patch := map[string]any{
		"views+": 1,
	}

	resBytes, err := db.PatchRecord(ctx, "berita", id, patch)
	if err != nil {
		return response.Error(c, 500, "Gagal memperbarui view count", "INTERNAL_ERROR")
	}

	var updated map[string]any
	_ = json.Unmarshal(resBytes, &updated)

	views := 0
	if v, ok := updated["views"].(float64); ok {
		views = int(v)
	}

	return response.OK(c, fiber.Map{
		"ok":    true,
		"views": views,
		"id":    id,
		"slug":  slug,
	})
}

// BeritaReactionHandler — POST /api/berita/:slug/reaction
func BeritaReactionHandler(c fiber.Ctx) error {
	ctx, cancel := context.WithTimeout(c.Context(), 8*time.Second)
	defer cancel()

	slug := strings.TrimSpace(c.Params("slug"))
	if slug == "" {
		return response.Error(c, 400, "Slug berita diperlukan", "BAD_REQUEST")
	}

	var body struct {
		Action       string `json:"action"`       // "add", "remove", "switch"
		Type         string `json:"type"`         // "bermanfaat", "inspiratif", "informatif"
		PreviousType string `json:"previousType"` // untuk action "switch"
	}

	if err := c.Bind().Body(&body); err != nil {
		return response.Error(c, 400, "Format request tidak valid", "BAD_REQUEST")
	}

	validTypes := map[string]bool{"bermanfaat": true, "inspiratif": true, "informatif": true}
	if !validTypes[body.Type] {
		return response.Error(c, 400, "Tipe reaksi tidak valid", "INVALID_TYPE")
	}

	record, err := db.GetRecordBySlug(ctx, "berita", slug)
	if err != nil {
		return response.Error(c, 404, "Berita tidak ditemukan", "NOT_FOUND")
	}

	id, _ := record["id"].(string)
	if id == "" {
		return response.Error(c, 404, "ID berita tidak valid", "NOT_FOUND")
	}

	patch := map[string]any{}
	switch body.Action {
	case "add":
		patch["reaction_"+body.Type+"+"] = 1
	case "remove":
		patch["reaction_"+body.Type+"-"] = 1
	case "switch":
		if validTypes[body.PreviousType] && body.PreviousType != body.Type {
			patch["reaction_"+body.PreviousType+"-"] = 1
		}
		patch["reaction_"+body.Type+"+"] = 1
	default:
		return response.Error(c, 400, "Aksi reaksi tidak valid", "INVALID_ACTION")
	}

	resBytes, err := db.PatchRecord(ctx, "berita", id, patch)
	if err != nil {
		return response.Error(c, 500, "Gagal memperbarui reaksi berita", "INTERNAL_ERROR")
	}

	var updated map[string]any
	_ = json.Unmarshal(resBytes, &updated)

	return response.OK(c, fiber.Map{
		"ok":     true,
		"record": updated,
	})
}

// YoutubePublicHandler — GET /api/youtube (via PocketBase)
func YoutubePublicHandler(c fiber.Ctx) error {
	ctx, cancel := context.WithTimeout(c.Context(), 8*time.Second)
	defer cancel()

	pbURL := config.Cfg.PocketBaseURL

	req, err := http.NewRequestWithContext(ctx, http.MethodGet, pbURL+"/api/collections/youtube_videos/records?filter=(is_published=true)&sort=sort_order&perPage=50", nil)
	if err != nil {
		return response.Error(c, 500, "Gagal membangun request", "INTERNAL_ERROR")
	}

	client := &http.Client{Timeout: 5 * time.Second}
	resp, err := client.Do(req)
	if err != nil {
		return response.Error(c, 502, "Gagal mengambil video dari PocketBase", "UPSTREAM_ERROR")
	}
	defer resp.Body.Close()

	var data struct {
		Items []fiber.Map `json:"items"`
	}
	if err := json.NewDecoder(resp.Body).Decode(&data); err != nil {
		return response.Error(c, 500, "Gagal memproses response", "PARSE_ERROR")
	}

	response.CDNCacheControl(c, 300, 600)
	return c.JSON(data.Items)
}

// SettingsHandler — GET /api/settings (via PocketBase)
func SettingsHandler(c fiber.Ctx) error {
	ctx, cancel := context.WithTimeout(c.Context(), 8*time.Second)
	defer cancel()

	pbURL := config.Cfg.PocketBaseURL

	req, err := http.NewRequestWithContext(ctx, http.MethodGet, pbURL+"/api/collections/site_settings/records?perPage=100", nil)
	if err != nil {
		return response.Error(c, 500, "Gagal membangun request", "INTERNAL_ERROR")
	}

	client := &http.Client{Timeout: 5 * time.Second}
	resp, err := client.Do(req)
	if err != nil {
		return response.Error(c, 502, "Gagal mengambil pengaturan dari PocketBase", "UPSTREAM_ERROR")
	}
	defer resp.Body.Close()

	var data struct {
		Items []struct {
			Key   string `json:"key"`
			Value any    `json:"value"`
		} `json:"items"`
	}
	if err := json.NewDecoder(resp.Body).Decode(&data); err != nil {
		return response.Error(c, 500, "Gagal memproses response", "PARSE_ERROR")
	}

	settingsMap := make(map[string]any)
	var identityObj map[string]any

	for _, item := range data.Items {
		if item.Key == "identity" {
			if m, ok := item.Value.(map[string]any); ok {
				identityObj = m
			}
		}
		settingsMap[item.Key] = item.Value
	}

	// Fallback nilai dari identityObj jika field individual kosong
	for k, v := range identityObj {
		if existing, exists := settingsMap[k]; !exists || existing == "" || existing == nil {
			settingsMap[k] = v
		}
	}

	response.CDNCacheControl(c, 60, 300)
	return c.JSON(settingsMap)
}

var _ = middleware.GetClientIP