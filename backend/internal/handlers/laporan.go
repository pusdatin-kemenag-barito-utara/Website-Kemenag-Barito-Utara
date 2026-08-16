package handlers

import (
	"context"
	"io"
	"net/http"
	"strings"
	"time"

	"kemenag-backend/internal/db"
	"kemenag-backend/internal/middleware"
	"kemenag-backend/internal/response"

	"github.com/gofiber/fiber/v2"
)

// LaporanCategoriesHandler — GET /api/laporan (kategori + dokumen kosong)
func LaporanCategoriesHandler(c *fiber.Ctx) error {
	ctx, cancel := context.WithTimeout(c.Context(), 8*time.Second)
	defer cancel()
	pool := db.Get()
	if pool == nil {
		return response.Error(c, 503, "Database tidak tersedia", "DB_UNAVAILABLE")
	}

	rows, err := pool.Query(ctx, `
		SELECT id, slug, title, description, intro, sort_order, is_active
		FROM kemenag_website.report_categories
		WHERE is_active = true
		ORDER BY sort_order ASC, title ASC`)
	if err != nil {
		return response.Error(c, 500, "Gagal mengambil kategori laporan", "DB_ERROR")
	}
	defer rows.Close()

	categories := []fiber.Map{}
	for rows.Next() {
		var id, slug, title, description, intro string
		var sortOrder int
		var isActive bool
		if err := rows.Scan(&id, &slug, &title, &description, &intro, &sortOrder, &isActive); err != nil {
			continue
		}
		categories = append(categories, fiber.Map{
			"id": id, "slug": slug, "title": title, "description": description,
			"intro": intro, "sort_order": sortOrder, "is_active": isActive,
		})
	}

	response.CDNCacheControl(c, 300, 600)
	return c.JSON(fiber.Map{"categories": categories})
}

// LaporanCategoryHandler — GET /api/laporan/:slug (dokumen per kategori + tahun)
func LaporanCategoryHandler(c *fiber.Ctx) error {
	ctx, cancel := context.WithTimeout(c.Context(), 8*time.Second)
	defer cancel()
	pool := db.Get()
	if pool == nil {
		return response.Error(c, 503, "Database tidak tersedia", "DB_UNAVAILABLE")
	}
	slug := strings.TrimSpace(c.Params("slug"))

	var catID, catSlug, catTitle, catDescription, catIntro string
	var catSortOrder int
	err := pool.QueryRow(ctx, `
		SELECT id, slug, title, description, intro, sort_order
		FROM kemenag_website.report_categories
		WHERE slug = $1 AND is_active = true LIMIT 1`, slug).
		Scan(&catID, &catSlug, &catTitle, &catDescription, &catIntro, &catSortOrder)
	if err != nil {
		return response.Error(c, 404, "Kategori laporan tidak ditemukan.", "NOT_FOUND")
	}

	yearStr := strings.TrimSpace(c.Query("year"))
	year := 0
	if yearStr != "" {
		y := c.QueryInt("year")
		if y >= 2000 && y <= 2100 {
			year = y
		}
	}

	where := "d.category_id = $1 AND d.is_published = true"
	args := []any{catID}
	if year > 0 {
		where += " AND d.year = $2"
		args = append(args, year)
	}

	var total int64
	_ = pool.QueryRow(ctx,
		"SELECT COUNT(*) FROM kemenag_website.report_documents d WHERE "+where, args...).Scan(&total)

	rows, err := pool.Query(ctx, `
		SELECT d.id, d.title, d.description, d.year, d.file_name, d.file_path, d.file_url,
		       d.mime_type, d.file_size, d.sort_order, d.view_count, d.download_count, d.updated_at
		FROM kemenag_website.report_documents d WHERE `+where+`
		ORDER BY d.year DESC, d.sort_order ASC, d.title ASC`, args...)
	if err != nil {
		return response.Error(c, 500, "Gagal mengambil dokumen", "DB_ERROR")
	}
	defer rows.Close()

	docs := []fiber.Map{}
	yearSet := map[int]bool{}
	for rows.Next() {
		var id, title string
		var description, docYear, fileName, filePath, fileURL, mimeType any
		var fileSize, sortOrder, viewCount, downloadCount any
		var updatedAt *time.Time
		if err := rows.Scan(&id, &title, &description, &docYear, &fileName, &filePath, &fileURL,
			&mimeType, &fileSize, &sortOrder, &viewCount, &downloadCount, &updatedAt); err != nil {
			continue
		}
		if y, ok := docYear.(int); ok {
			yearSet[y] = true
		} else if y, ok := docYear.(int64); ok {
			yearSet[int(y)] = true
		}
		docs = append(docs, fiber.Map{
			"id": id, "title": title, "description": description, "year": docYear,
			"file_name": fileName, "file_path": filePath, "file_url": fileURL,
			"mime_type": mimeType, "file_size": fileSize, "sort_order": sortOrder,
			"view_count": viewCount, "download_count": downloadCount, "updated_at": fmtTime(updatedAt),
		})
	}

	availableYears := []int{}
	for y := range yearSet {
		availableYears = append(availableYears, y)
	}
	// urut descending (insertion sort kecil)
	for i := 0; i < len(availableYears); i++ {
		for j := i + 1; j < len(availableYears); j++ {
			if availableYears[j] > availableYears[i] {
				availableYears[i], availableYears[j] = availableYears[j], availableYears[i]
			}
		}
	}

	response.CDNCacheControl(c, 300, 600)
	return c.JSON(fiber.Map{
		"category": fiber.Map{
			"id": catID, "slug": catSlug, "title": catTitle,
			"description": catDescription, "intro": catIntro, "sort_order": catSortOrder,
		},
		"documents":       docs,
		"total":           total,
		"availableYears":  availableYears,
		"currentYear":     year,
	})
}

// laporanDoc look up dokumen + increment count.
func getLaporanDoc(ctx context.Context, id string, increment string) (fileURL, fileName, mimeType string, status int) {
	pool := db.Get()
	if pool == nil {
		return "", "", "", 503
	}
	var url, name, mime any
	err := pool.QueryRow(ctx, `
		SELECT file_url, file_name, mime_type
		FROM kemenag_website.report_documents
		WHERE id = $1 AND is_published = true LIMIT 1`, id).Scan(&url, &name, &mime)
	if err != nil {
		return "", "", "", 404
	}
	if increment != "" {
		_, _ = pool.Exec(ctx, "UPDATE kemenag_website.report_documents SET "+increment+" = "+increment+" + 1 WHERE id = $1", id)
	}
	fileURL = strAny(url)
	fileName = strAny(name)
	mimeType = strAny(mime)
	return fileURL, fileName, mimeType, 200
}

// streamRemoteFile proxy fetch upstream file dengan header konten.
func streamRemoteFile(c *fiber.Ctx, fileURL string, disposition, fallbackName string, extraHeaders map[string]string) error {
	if fileURL == "" {
		return response.Error(c, 404, "File tidak ditemukan.", "FILE_NOT_FOUND")
	}

	req, err := http.NewRequestWithContext(c.Context(), http.MethodGet, fileURL, nil)
	if err != nil {
		return response.Error(c, 502, "URL file tidak valid.", "BAD_UPSTREAM")
	}
	req.Header.Set("User-Agent", "KemenagBarut-CMS/1.0")

	client := &http.Client{Timeout: 60 * time.Second}
	resp, err := client.Do(req)
	if err != nil {
		return response.Error(c, 502, "Gagal mengambil file upstream.", "UPSTREAM_ERROR")
	}
	defer resp.Body.Close()

	if resp.StatusCode >= 400 {
		io.Copy(io.Discard, io.LimitReader(resp.Body, 4096))
		return response.Error(c, 502, "Upstream mengembalikan "+itoa(resp.StatusCode), "UPSTREAM_ERROR")
	}

	contentType := resp.Header.Get("Content-Type")
	if contentType == "" {
		contentType = "application/pdf"
	}
	if fallbackName == "" {
		fallbackName = "document.pdf"
	}
	filename := sanitizeFilename(fallbackName)

	c.Set("Content-Type", contentType)
	c.Set("Content-Disposition", disposition+`; filename="`+filename+`"`)
	c.Set("Cache-Control", "public, max-age=3600")
	c.Set("Access-Control-Allow-Origin", "*")
	c.Set("Accept-Ranges", "bytes")
	if len := resp.Header.Get("Content-Length"); len != "" {
		c.Set("Content-Length", len)
	}
	for k, v := range extraHeaders {
		c.Set(k, v)
	}

	c.Status(200)
	if _, err := io.Copy(c, resp.Body); err != nil {
		return err
	}
	return nil
}

// LaporanViewProxyHandler — GET /api/laporan/view/:id
func LaporanViewProxyHandler(c *fiber.Ctx) error {
	id := strings.TrimSpace(c.Params("id"))
	ctx, cancel := context.WithTimeout(c.Context(), 8*time.Second)
	defer cancel()
	fileURL, fileName, mimeType, status := getLaporanDoc(ctx, id, "view_count")
	if status != 200 {
		return response.Error(c, status, "Dokumen tidak ditemukan.", "NOT_FOUND")
	}
	_ = mimeType
	return streamRemoteFile(c, fileURL, "inline", fileName, nil)
}

// LaporanDownloadProxyHandler — GET /api/laporan/download/:id
func LaporanDownloadProxyHandler(c *fiber.Ctx) error {
	id := strings.TrimSpace(c.Params("id"))
	ctx, cancel := context.WithTimeout(c.Context(), 8*time.Second)
	defer cancel()
	fileURL, fileName, mimeType, status := getLaporanDoc(ctx, id, "download_count")
	if status != 200 {
		return response.Error(c, status, "Dokumen tidak ditemukan.", "NOT_FOUND")
	}
	_ = mimeType
	return streamRemoteFile(c, fileURL, "attachment", fileName, nil)
}

func strAny(v any) string {
	if v == nil {
		return ""
	}
	if s, ok := v.(string); ok {
		return s
	}
	return ""
}

func sanitizeFilename(name string) string {
	name = strings.TrimSpace(name)
	name = strings.ReplaceAll(name, `"`, "")
	name = strings.ReplaceAll(name, "\n", "")
	if name == "" {
		return "document.pdf"
	}
	return name
}

var _ = middleware.GetClientIP
