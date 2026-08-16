package handlers

import (
	"context"
	"fmt"
	"math"
	"strings"
	"time"

	"kemenag-backend/internal/db"
	"kemenag-backend/internal/lib"
	"kemenag-backend/internal/middleware"
	"kemenag-backend/internal/response"
	"kemenag-backend/internal/services"

	"github.com/gofiber/fiber/v2"
)

// AdminSlidesListHandler — GET /api/admin/homepage-slides
func AdminSlidesListHandler(c *fiber.Ctx) error {
	if _, _, err := middleware.RequireAdmin(c, middleware.AdminAuthOpts{}); err != nil {
		return err
	}
	ctx, cancel := context.WithTimeout(c.Context(), 8*time.Second)
	defer cancel()
	pool := db.Get()
	if pool == nil {
		return response.Error(c, 503, "Database tidak tersedia", "DB_UNAVAILABLE")
	}

	where := "1=1"
	var filterArgs []any

	if q := strings.TrimSpace(c.Query("q")); q != "" {
		where += fmt.Sprintf(" AND (title ILIKE $%d OR caption ILIKE $%d)", len(filterArgs)+1, len(filterArgs)+1)
		filterArgs = append(filterArgs, "%"+q+"%")
	}
	if cat := strings.TrimSpace(c.Query("category")); cat != "" && cat != "all" {
		where += fmt.Sprintf(" AND LOWER(category) = $%d", len(filterArgs)+1)
		filterArgs = append(filterArgs, strings.ToLower(cat))
	}
	if pub := c.Query("is_published"); pub == "true" || pub == "false" {
		where += fmt.Sprintf(" AND is_published = $%d", len(filterArgs)+1)
		filterArgs = append(filterArgs, pub == "true")
	}

	var total int64
	_ = pool.QueryRow(ctx, "SELECT COUNT(*) FROM kemenag_website.homepage_slides WHERE "+where, filterArgs...).Scan(&total)

	var publishedCount, draftCount int64
	_ = pool.QueryRow(ctx, "SELECT COUNT(*) FROM kemenag_website.homepage_slides WHERE is_published = true").Scan(&publishedCount)
	_ = pool.QueryRow(ctx, "SELECT COUNT(*) FROM kemenag_website.homepage_slides WHERE is_published = false").Scan(&draftCount)

	page := c.QueryInt("page", 1)
	if page < 1 {
		page = 1
	}
	limit := c.QueryInt("limit", 12)
	if limit < 1 {
		limit = 12
	}
	offset := (page - 1) * limit
	if offset < 0 {
		offset = 0
	}

	listArgs := append([]any{}, filterArgs...)
	limitIdx := len(listArgs) + 1
	offsetIdx := len(listArgs) + 2
	listArgs = append(listArgs, limit, offset)

	query := fmt.Sprintf(`
		SELECT id, title, caption, image_url, is_published, sort_order, created_at, updated_at, category
		FROM kemenag_website.homepage_slides
		WHERE %s
		ORDER BY is_published DESC, sort_order ASC, updated_at DESC
		LIMIT $%d OFFSET $%d`, where, limitIdx, offsetIdx)

	rows, err := pool.Query(ctx, query, listArgs...)
	if err != nil {
		return response.Error(c, 500, "Gagal mengambil slide.", "DB_ERROR")
	}
	defer rows.Close()

	list := []fiber.Map{}
	for rows.Next() {
		var id, title, caption, imageURL, category string
		var isPublished bool
		var sortOrder int
		var createdAt, updatedAt *time.Time
		if err := rows.Scan(&id, &title, &caption, &imageURL, &isPublished, &sortOrder, &createdAt, &updatedAt, &category); err != nil {
			continue
		}
		list = append(list, fiber.Map{
			"id": id, "title": title, "caption": caption, "image_url": imageURL,
			"is_published": isPublished, "sort_order": sortOrder,
			"created_at": fmtTime(createdAt), "updated_at": fmtTime(updatedAt), "category": category,
		})
	}

	totalPages := int(math.Ceil(float64(total) / float64(limit)))
	if totalPages < 1 {
		totalPages = 1
	}

	// Fetch dynamic categories from both homepage_slides and seksi tables
	categoryList := []fiber.Map{
		{"id": "utama", "label": "Infografis Utama (Tengah)"},
		{"id": "islam", "label": "Mutiara Hikmah Islam"},
		{"id": "kristen", "label": "Renungan Iman Kristen"},
		{"id": "katolik", "label": "Renungan Iman Katolik"},
		{"id": "hindu", "label": "Dharma Wacana Hindu"},
	}
	catSeen := map[string]bool{
		"utama": true, "islam": true, "kristen": true, "katolik": true, "hindu": true,
	}

	catRows, catErr := pool.Query(ctx, `
		SELECT DISTINCT category FROM kemenag_website.homepage_slides WHERE category IS NOT NULL AND category != ''
		UNION
		SELECT slug AS category FROM kemenag_website.seksi WHERE slug IS NOT NULL AND slug != ''
		ORDER BY category ASC`)
	if catErr == nil {
		defer catRows.Close()
		for catRows.Next() {
			var rawCat string
			if err := catRows.Scan(&rawCat); err == nil {
				cleaned := strings.TrimSpace(strings.ToLower(rawCat))
				if cleaned != "" && !catSeen[cleaned] {
					catSeen[cleaned] = true
					displayLabel := strings.Title(strings.ReplaceAll(cleaned, "-", " "))
					categoryList = append(categoryList, fiber.Map{
						"id":    cleaned,
						"label": displayLabel,
					})
				}
			}
		}
	}

	return response.OK(c, fiber.Map{
		"items":          list,
		"total":          total,
		"publishedCount": publishedCount,
		"draftCount":     draftCount,
		"categories":     categoryList,
		"pagination": fiber.Map{
			"currentPage":    page,
			"totalPages":     totalPages,
			"totalItems":     total,
			"totalPublished": publishedCount,
			"pageSize":       limit,
		},
	})
}

// AdminSlidesCreateHandler — POST /api/admin/homepage-slides
func AdminSlidesCreateHandler(c *fiber.Ctx) error {
	session, _, err := middleware.RequireAdmin(c, middleware.AdminAuthOpts{})
	if err != nil {
		return err
	}
	var body fiber.Map
	if err := c.BodyParser(&body); err != nil {
		return response.Error(c, 400, "Body tidak valid.", "INVALID_BODY")
	}
	title := lib.CleanString(body["title"], 200)
	if title == "" {
		return response.Error(c, 400, "Judul wajib diisi.", "VALIDATION_ERROR")
	}
	caption := lib.CleanString(body["caption"], 500)
	category := lib.CleanString(body["category"], 50)
	if category == "" {
		category = "utama"
	}
	sortOrder := lib.ToInt(body["sort_order"])
	isPublished := lib.ToBool(body["is_published"])

	ctx, cancel := context.WithTimeout(c.Context(), 15*time.Second)
	defer cancel()
	pool := db.Get()

	imageURL := ""
	if v := lib.CleanString(body["image_upload_base64"], 20_000_000); strings.HasPrefix(v, "data:image/") {
		_, publicURL, _, _, err := services.Storage.UploadBase64Image(ctx, v, "homepage-slides", "slide")
		if err != nil {
			return response.Error(c, 400, "Gagal upload gambar: "+err.Error(), "UPLOAD_FAILED")
		}
		imageURL = publicURL
	} else {
		imageURL = lib.CleanString(body["image_url"], 2000)
		if imageURL == "" {
			return response.Error(c, 400, "Gambar wajib diunggah.", "VALIDATION_ERROR")
		}
	}

	var newID string
	err = pool.QueryRow(ctx, `
		INSERT INTO kemenag_website.homepage_slides (title, caption, image_url, is_published, sort_order, category)
		VALUES ($1,$2,$3,$4,$5,$6) RETURNING id`,
		title, caption, imageURL, isPublished, sortOrder, category).Scan(&newID)
	if err != nil {
		return response.Error(c, 500, "Gagal menyimpan slide.", "DB_ERROR")
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
		Action: "create", Entity: "homepage_slides", EntityID: newID, PerformedBy: session.UserEmail(),
		After: fiber.Map{"title": title}, IP: adminIP(c),
	})
	services.CacheBust()
	InvalidateDashboardStatsCache()
	services.Realtime.BroadcastRefresh("slider")
	return response.OK(c, fiber.Map{"id": newID})
}

// AdminSlidesUpdateHandler — PATCH /api/admin/homepage-slides/:id
func AdminSlidesUpdateHandler(c *fiber.Ctx) error {
	session, _, err := middleware.RequireAdmin(c, middleware.AdminAuthOpts{})
	if err != nil {
		return err
	}
	var body fiber.Map
	if err := c.BodyParser(&body); err != nil {
		return response.Error(c, 400, "Body tidak valid.", "INVALID_BODY")
	}
	id := c.Params("id")

	ctx, cancel := context.WithTimeout(c.Context(), 15*time.Second)
	defer cancel()
	pool := db.Get()

	var oldTitle, oldCaption, oldCategory, oldImage string
	var oldPublished bool
	var oldSortOrder int
	err = pool.QueryRow(ctx, `SELECT title, caption, category, image_url, is_published, sort_order FROM kemenag_website.homepage_slides WHERE id = $1`, id).
		Scan(&oldTitle, &oldCaption, &oldCategory, &oldImage, &oldPublished, &oldSortOrder)
	if err != nil {
		return response.Error(c, 404, "Slide tidak ditemukan.", "NOT_FOUND")
	}

	title := oldTitle
	if v, ok := body["title"].(string); ok && strings.TrimSpace(v) != "" {
		title = lib.CleanString(v, 200)
	}

	caption := oldCaption
	if v, ok := body["caption"].(string); ok {
		caption = lib.CleanString(v, 500)
	}

	category := oldCategory
	if v, ok := body["category"].(string); ok && strings.TrimSpace(v) != "" {
		category = lib.CleanString(v, 50)
	}

	isPublished := oldPublished
	if _, ok := body["is_published"]; ok {
		isPublished = lib.ToBool(body["is_published"])
	}

	sortOrder := oldSortOrder
	if _, ok := body["sort_order"]; ok {
		sortOrder = lib.ToInt(body["sort_order"])
	}

	imageURL := oldImage
	if v := lib.CleanString(body["image_upload_base64"], 20_000_000); strings.HasPrefix(v, "data:image/") {
		_, publicURL, _, _, err := services.Storage.UploadBase64Image(ctx, v, "homepage-slides", "slide")
		if err != nil {
			return response.Error(c, 400, "Gagal upload gambar: "+err.Error(), "UPLOAD_FAILED")
		}
		imageURL = publicURL
		if services.IsCMSStorageURL(oldImage) {
			go services.Storage.RemoveFileByPublicUrl(ctx, oldImage)
		}
	} else if v := lib.CleanString(body["image_url"], 2000); v != "" {
		imageURL = v
	}

	_, err = pool.Exec(ctx, `
		UPDATE kemenag_website.homepage_slides SET
			title = $1, caption = $2, image_url = $3, is_published = $4, sort_order = $5, category = $6,
			updated_at = now()
		WHERE id = $7`, title, caption, imageURL, isPublished, sortOrder, category, id)
	if err != nil {
		return response.Error(c, 500, "Gagal update slide.", "DB_ERROR")
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
		Action: "update", Entity: "homepage_slides", EntityID: id, PerformedBy: session.UserEmail(),
		After: fiber.Map{"title": title, "is_published": isPublished}, IP: adminIP(c),
	})
	services.CacheBust()
	InvalidateDashboardStatsCache()
	services.Realtime.BroadcastRefresh("slider")
	return response.OK(c, fiber.Map{"ok": true, "is_published": isPublished})
}

// AdminSlidesDeleteHandler — DELETE /api/admin/homepage-slides/:id
func AdminSlidesDeleteHandler(c *fiber.Ctx) error {
	session, _, err := middleware.RequireAdmin(c, middleware.AdminAuthOpts{})
	if err != nil {
		return err
	}
	id := c.Params("id")
	ctx, cancel := context.WithTimeout(c.Context(), 10*time.Second)
	defer cancel()
	pool := db.Get()

	var oldImage string
	err = pool.QueryRow(ctx, `SELECT image_url FROM kemenag_website.homepage_slides WHERE id = $1`, id).Scan(&oldImage)
	if err != nil {
		return response.Error(c, 404, "Slide tidak ditemukan.", "NOT_FOUND")
	}
	if services.IsCMSStorageURL(oldImage) {
		go services.Storage.RemoveFileByPublicUrl(ctx, oldImage)
	}
	_, _ = pool.Exec(ctx, `DELETE FROM kemenag_website.homepage_slides WHERE id = $1`, id)

	services.Audit.Record(struct {
		Action      string
		Entity      string
		EntityID    string
		PerformedBy string
		Before      any
		After       any
		IP          any
	}{
		Action: "delete", Entity: "homepage_slides", EntityID: id, PerformedBy: session.UserEmail(), IP: adminIP(c),
	})
	services.CacheBust()
	InvalidateDashboardStatsCache()
	services.Realtime.BroadcastRefresh("slider")
	return response.OK(c, fiber.Map{"ok": true})
}