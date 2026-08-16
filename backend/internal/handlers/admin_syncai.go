package handlers

import (
	"context"
	"fmt"
	"regexp"
	"strings"
	"time"

	"kemenag-backend/internal/db"
	"kemenag-backend/internal/middleware"
	"kemenag-backend/internal/response"
	"kemenag-backend/internal/services"

	"github.com/gofiber/fiber/v2"
)

var htmlTagRe = regexp.MustCompile(`<[^>]+>`)
var wsRe = regexp.MustCompile(`\s+`)

func stripHTML(raw string) string {
	out := htmlTagRe.ReplaceAllString(raw, " ")
	out = wsRe.ReplaceAllString(out, " ")
	return strings.TrimSpace(out)
}

func vecToString(v []float64) string {
	var sb strings.Builder
	sb.WriteString("[")
	for i, f := range v {
		if i > 0 {
			sb.WriteString(",")
		}
		sb.WriteString(fmt.Sprintf("%.10g", f))
	}
	sb.WriteString("]")
	return sb.String()
}

// AdminSyncAIHandler — POST /api/admin/sync-ai
// Embed seluruh berita published ke ai_knowledge_base (Gemini text-embedding-004, 768D).
func AdminSyncAIHandler(c *fiber.Ctx) error {
	if _, _, err := middleware.RequireAdmin(c, middleware.AdminAuthOpts{Permission: "ai:manage"}); err != nil {
		return err
	}

	ctx, cancel := context.WithTimeout(context.Background(), 240*time.Second)
	defer cancel()
	pool := db.Get()

	limit := c.QueryInt("limit", 100)
	if limit < 1 {
		limit = 100
	}
	if limit > 300 {
		limit = 300
	}

	rows, err := pool.Query(ctx, `
		SELECT id, slug, title, excerpt, content
		FROM kemenag_website.berita
		WHERE is_published = true
		ORDER BY published_at DESC
		LIMIT $1`, limit)
	if err != nil {
		return response.Error(c, 500, "Gagal membaca berita.", "DB_ERROR")
	}
	defer rows.Close()

	type newsItem struct {
		ID    string
		Slug  string
		Title string
		Body  string
	}
	items := []newsItem{}
	for rows.Next() {
		var it newsItem
		var excerpt, content any
		if err := rows.Scan(&it.ID, &it.Slug, &it.Title, &excerpt, &content); err != nil {
			continue
		}
		body := fmt.Sprintf("%v", excerpt)
		if c, ok := content.(string); ok && c != "" {
			body = c
		}
		body = stripHTML(body)
		if len(body) > 6000 {
			body = body[:6000]
		}
		if body != "" {
			it.Body = body
			items = append(items, it)
		}
	}

	if len(items) == 0 {
		return response.OK(c, fiber.Map{"synced": 0, "failed": 0, "total": 0})
	}

	// hapus semua knowledge lama bertipe berita dulu (tidak ada unique constraint)
	_, _ = pool.Exec(ctx, `DELETE FROM kemenag_website.ai_knowledge_base WHERE source_type = 'berita'`)

	synced := 0
	failed := 0
	for _, it := range items {
		emb, err := services.EmbedQuery(ctx, it.Title+"\n\n"+it.Body)
		if err != nil {
			failed++
			continue
		}
		sourceURL := "https://baritoutara.kemenag.go.id/berita/" + it.Slug
		_, err = pool.Exec(ctx, `
			INSERT INTO kemenag_website.ai_knowledge_base (title, content_summary, source_type, source_url, embedding)
			VALUES ($1, $2, 'berita', $3, $4::vector)`,
			it.Title, it.Body, sourceURL, vecToString(emb))
		if err != nil {
			failed++
			continue
		}
		synced++
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
		Action: "sync", Entity: "ai_knowledge_base", PerformedBy: "system",
		After: fiber.Map{"synced": synced, "failed": failed}, IP: adminIP(c),
	})
	services.CacheBust()
	return response.OK(c, fiber.Map{"synced": synced, "failed": failed, "total": len(items)})
}