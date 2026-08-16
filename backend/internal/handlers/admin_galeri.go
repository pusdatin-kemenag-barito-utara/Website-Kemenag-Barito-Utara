package handlers

import (
	"context"
	"fmt"
	"strings"
	"sync"
	"time"

	"kemenag-backend/internal/db"
	"kemenag-backend/internal/lib"
	"kemenag-backend/internal/middleware"
	"kemenag-backend/internal/response"
	"kemenag-backend/internal/services"

	"github.com/gofiber/fiber/v2"
)

// AdminGaleriListHandler — GET /api/admin/galeri
func AdminGaleriListHandler(c *fiber.Ctx) error {
	if _, _, err := middleware.RequireAdmin(c, middleware.AdminAuthOpts{}); err != nil {
		return err
	}
	ctx, cancel := context.WithTimeout(c.Context(), 10*time.Second)
	defer cancel()
	pool := db.Get()

	page := c.QueryInt("page", 1)
	if page < 1 {
		page = 1
	}
	limit := c.QueryInt("limit", 16)
	if limit < 1 {
		limit = 16
	}
	offset := (page - 1) * limit

	q := strings.TrimSpace(c.Query("q"))
	year := c.QueryInt("year", 0)

	whereClauses := []string{"1=1"}
	args := []any{}
	argIdx := 1

	if q != "" {
		whereClauses = append(whereClauses, fmt.Sprintf("(title ILIKE $%d)", argIdx))
		args = append(args, "%"+q+"%")
		argIdx++
	}

	if year > 0 {
		whereClauses = append(whereClauses, fmt.Sprintf("(EXTRACT(YEAR FROM published_at) = $%d OR EXTRACT(YEAR FROM created_at) = $%d)", argIdx, argIdx))
		args = append(args, year)
		argIdx++
	}

	whereSQL := strings.Join(whereClauses, " AND ")

	var total int64
	countQuery := fmt.Sprintf("SELECT COUNT(*) FROM kemenag_website.galeri WHERE %s", whereSQL)
	if err := pool.QueryRow(ctx, countQuery, args...).Scan(&total); err != nil {
		total = 0
	}

	dataArgs := append([]any{}, args...)
	dataArgs = append(dataArgs, limit, offset)
	query := fmt.Sprintf(`
		SELECT id, title, image_url, link_url, source_type, source_id, is_published, published_at, created_at, updated_at, image_size_kb
		FROM kemenag_website.galeri
		WHERE %s
		ORDER BY published_at DESC NULLS LAST, created_at DESC
		LIMIT $%d OFFSET $%d`, whereSQL, argIdx, argIdx+1)

	rows, err := pool.Query(ctx, query, dataArgs...)
	if err != nil {
		return response.Error(c, 500, "Gagal mengambil galeri.", "DB_ERROR")
	}
	defer rows.Close()

	list := []fiber.Map{}
	for rows.Next() {
		var id, title, imageURL string
		var linkURL, sourceType, sourceID, publishedAt, createdAt, updatedAt any
		var isPublished bool
		var imageSizeKB int
		if err := rows.Scan(&id, &title, &imageURL, &linkURL, &sourceType, &sourceID, &isPublished, &publishedAt, &createdAt, &updatedAt, &imageSizeKB); err != nil {
			continue
		}
		list = append(list, fiber.Map{
			"id": id, "title": title, "image_url": imageURL, "link_url": linkURL,
			"source_type": sourceType, "source_id": sourceID, "is_published": isPublished,
			"published_at": publishedAt, "created_at": createdAt, "updated_at": updatedAt,
			"image_size_kb": imageSizeKB,
		})
	}

	totalPages := int((total + int64(limit) - 1) / int64(limit))
	if totalPages < 1 {
		totalPages = 1
	}

	// Distinct available years
	availableYears := []int{}
	yearRows, err := pool.Query(ctx, `
		SELECT DISTINCT EXTRACT(YEAR FROM published_at)::int AS y
		FROM kemenag_website.galeri
		WHERE published_at IS NOT NULL
		ORDER BY y DESC`)
	if err == nil {
		for yearRows.Next() {
			var y int
			if err := yearRows.Scan(&y); err == nil && y > 0 {
				availableYears = append(availableYears, y)
			}
		}
		yearRows.Close()
	}

	return response.OK(c, fiber.Map{
		"items":          list,
		"total":          total,
		"page":           page,
		"limit":          limit,
		"totalPages":     totalPages,
		"availableYears": availableYears,
		"pagination": fiber.Map{
			"total":      total,
			"page":       page,
			"limit":      limit,
			"totalPages": totalPages,
		},
	})
}

// uploadGalleryImages upload massal base64 secara paralel dengan worker pool.
func uploadGalleryImages(ctx context.Context, uploads []any, defaultTitle string) ([]fiber.Map, error) {
	type result struct {
		idx  int
		item fiber.Map
		err  error
	}

	resChan := make(chan result, len(uploads))
	var wg sync.WaitGroup

	// Batasi konkurensi upload ke storage maks 6 worker bersamaan
	sem := make(chan struct{}, 6)

	for i, u := range uploads {
		title := defaultTitle
		var dataURL string

		switch item := u.(type) {
		case string:
			dataURL = lib.CleanString(item, 20_000_000)
		case map[string]any:
			t := lib.CleanString(item["title"], 200)
			if t != "" {
				title = t
			}
			raw := item["image_base64"]
			if raw == nil || raw == "" {
				raw = item["image_url"]
			}
			if raw == nil || raw == "" {
				raw = item["gallery_upload_base64"]
			}
			if raw == nil || raw == "" {
				raw = item["base64"]
			}
			dataURL = lib.CleanString(raw, 20_000_000)
		}

		if !strings.HasPrefix(dataURL, "data:image/") {
			continue
		}
		if title == "" {
			title = "Dokumentasi Galeri"
		}

		wg.Add(1)
		go func(index int, dURL, t string) {
			defer wg.Done()
			sem <- struct{}{}
			defer func() { <-sem }()

			_, publicURL, _, size, err := services.Storage.UploadBase64Image(ctx, dURL, "galeri", "galeri")
			if err != nil {
				resChan <- result{idx: index, err: err}
				return
			}
			resChan <- result{
				idx: index,
				item: fiber.Map{
					"title":            t,
					"image_url":        publicURL,
					"image_size_kb":    int(size / 1024),
					"image_size_bytes": size,
				},
			}
		}(i, dataURL, title)
	}

	wg.Wait()
	close(resChan)

	var out []fiber.Map
	for r := range resChan {
		if r.err == nil && r.item != nil {
			out = append(out, r.item)
		}
	}
	return out, nil
}

// AdminGaleriCreateHandler — POST /api/admin/galeri (massal)
func AdminGaleriCreateHandler(c *fiber.Ctx) error {
	session, _, err := middleware.RequireAdmin(c, middleware.AdminAuthOpts{})
	if err != nil {
		return err
	}
	var body struct {
		Title       string `json:"title"`
		PublishedAt string `json:"published_at"`
		Uploads     []any  `json:"gallery_uploads"`
	}
	if err := c.BodyParser(&body); err != nil {
		return response.Error(c, 400, "Body tidak valid.", "INVALID_BODY")
	}
	if len(body.Uploads) == 0 {
		return response.Error(c, 400, "Tidak ada gambar diunggah.", "NO_UPLOADS")
	}

	ctx, cancel := context.WithTimeout(c.Context(), 60*time.Second)
	defer cancel()
	pool := db.Get()

	title := lib.CleanString(body.Title, 200)
	if title == "" {
		title = "Dokumentasi Galeri"
	}

	items, err := uploadGalleryImages(ctx, body.Uploads, title)
	if err != nil {
		return response.Error(c, 400, "Gagal upload: "+err.Error(), "UPLOAD_FAILED")
	}
	if len(items) == 0 {
		return response.Error(c, 400, "Semua gambar gagal diproses atau format tidak didukung.", "UPLOAD_FAILED")
	}

	var publishedAt any = nil
	if body.PublishedAt != "" {
		if t, err := time.Parse(time.RFC3339, body.PublishedAt); err == nil {
			publishedAt = t
		}
	}

	count := 0
	for _, item := range items {
		rowSourceID := newUUID()
		_, err := pool.Exec(ctx, `
			INSERT INTO kemenag_website.galeri (title, image_url, source_type, source_id, is_published, published_at, image_size_kb, image_size_bytes)
			VALUES ($1,$2,'manual',$3,true,$4,$5,$6)`,
			item["title"], item["image_url"], rowSourceID, publishedAt, item["image_size_kb"], item["image_size_bytes"])
		if err == nil {
			count++
		}
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
		Action: "create", Entity: "galeri", PerformedBy: session.UserEmail(),
		After: fiber.Map{"count": count}, IP: adminIP(c),
	})
	services.CacheBust()
	services.Realtime.BroadcastRefresh("galeri")
	return response.OK(c, fiber.Map{"created": count, "message": "Visual galeri berhasil disimpan."})
}

// AdminGaleriUpdateHandler — PUT /api/admin/galeri?id=
func AdminGaleriUpdateHandler(c *fiber.Ctx) error {
	session, _, err := middleware.RequireAdmin(c, middleware.AdminAuthOpts{})
	if err != nil {
		return err
	}
	var body fiber.Map
	if err := c.BodyParser(&body); err != nil {
		return response.Error(c, 400, "Body tidak valid.", "INVALID_BODY")
	}
	id := strings.TrimSpace(c.Query("id"))
	if id == "" {
		return response.Error(c, 400, "Parameter id wajib.", "ID_REQUIRED")
	}

	ctx, cancel := context.WithTimeout(c.Context(), 15*time.Second)
	defer cancel()
	pool := db.Get()

	var oldImage string
	err = pool.QueryRow(ctx, `SELECT image_url FROM kemenag_website.galeri WHERE id = $1`, id).Scan(&oldImage)
	if err != nil {
		return response.Error(c, 404, "Gambar tidak ditemukan.", "NOT_FOUND")
	}

	title := lib.CleanString(body["title"], 200)
	if title == "" {
		title = "Dokumentasi Galeri"
	}
	imageURL := oldImage
	fotoRaw := body["gallery_upload_base64"]
	if fotoRaw == nil || fotoRaw == "" {
		fotoRaw = body["image_url"]
	}
	if fotoRaw == nil || fotoRaw == "" {
		fotoRaw = body["image_base64"]
	}
	if v := lib.CleanString(fotoRaw, 20_000_000); strings.HasPrefix(v, "data:image/") {
		_, publicURL, _, _, err := services.Storage.UploadBase64Image(ctx, v, "galeri", "galeri")
		if err != nil {
			return response.Error(c, 400, "Gagal upload: "+err.Error(), "UPLOAD_FAILED")
		}
		imageURL = publicURL
		if services.IsCMSStorageURL(oldImage) {
			go services.Storage.RemoveFileByPublicUrl(ctx, oldImage)
		}
	} else if v := lib.CleanString(body["image_url"], 2000); v != "" {
		imageURL = v
	}

	var publishedAt any = nil
	if pStr := lib.CleanString(body["published_at"], 100); pStr != "" {
		if t, err := time.Parse(time.RFC3339, pStr); err == nil {
			publishedAt = t
		}
	}

	_, err = pool.Exec(ctx, `
		UPDATE kemenag_website.galeri SET title = $1, image_url = $2, published_at = COALESCE($3, published_at), updated_at = now()
		WHERE id = $4`, title, imageURL, publishedAt, id)
	if err != nil {
		return response.Error(c, 500, "Gagal update galeri.", "DB_ERROR")
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
		Action: "update", Entity: "galeri", EntityID: id, PerformedBy: session.UserEmail(),
		After: fiber.Map{"title": title}, IP: adminIP(c),
	})
	services.CacheBust()
	services.Realtime.BroadcastRefresh("galeri")
	return response.OK(c, fiber.Map{"ok": true})
}

// AdminGaleriDeleteHandler — DELETE /api/admin/galeri?id=
func AdminGaleriDeleteHandler(c *fiber.Ctx) error {
	session, _, err := middleware.RequireAdmin(c, middleware.AdminAuthOpts{})
	if err != nil {
		return err
	}
	id := strings.TrimSpace(c.Query("id"))
	if id == "" {
		return response.Error(c, 400, "Parameter id wajib.", "ID_REQUIRED")
	}

	ctx, cancel := context.WithTimeout(c.Context(), 10*time.Second)
	defer cancel()
	pool := db.Get()

	var oldImage string
	err = pool.QueryRow(ctx, `SELECT image_url FROM kemenag_website.galeri WHERE id = $1`, id).Scan(&oldImage)
	if err != nil {
		return response.Error(c, 404, "Gambar tidak ditemukan.", "NOT_FOUND")
	}
	if services.IsCMSStorageURL(oldImage) {
		go services.Storage.RemoveFileByPublicUrl(ctx, oldImage)
	}
	_, _ = pool.Exec(ctx, `DELETE FROM kemenag_website.galeri WHERE id = $1`, id)

	services.Audit.Record(struct {
		Action      string
		Entity      string
		EntityID    string
		PerformedBy string
		Before      any
		After       any
		IP          any
	}{
		Action: "delete", Entity: "galeri", EntityID: id, PerformedBy: session.UserEmail(), IP: adminIP(c),
	})
	services.CacheBust()
	services.Realtime.BroadcastRefresh("galeri")
	return response.OK(c, fiber.Map{"ok": true})
}