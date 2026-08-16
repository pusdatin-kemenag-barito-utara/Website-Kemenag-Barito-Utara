package handlers

import (
	"context"
	"fmt"
	"io"
	"mime"
	"net/url"
	"path/filepath"
	"regexp"
	"strconv"
	"strings"
	"time"

	"kemenag-backend/internal/db"
	"kemenag-backend/internal/lib"
	"kemenag-backend/internal/middleware"
	"kemenag-backend/internal/response"
	"kemenag-backend/internal/services"

	"github.com/gofiber/fiber/v2"
)

// AdminLaporanListHandler — GET /api/admin/laporan
func AdminLaporanListHandler(c *fiber.Ctx) error {
	if _, _, err := middleware.RequireAdmin(c, middleware.AdminAuthOpts{AllowEditor: true}); err != nil {
		return err
	}
	ctx, cancel := context.WithTimeout(c.Context(), 10*time.Second)
	defer cancel()
	pool := db.Get()

	// 1. Ambil semua kategori beserta jumlah dokumennya
	catRows, err := pool.Query(ctx, `
		SELECT c.id, c.slug, c.title, c.description, c.intro, c.sort_order, c.is_active,
		       COUNT(d.id) AS document_count
		FROM kemenag_website.report_categories c
		LEFT JOIN kemenag_website.report_documents d ON d.category_id = c.id
		GROUP BY c.id ORDER BY c.sort_order ASC, c.title ASC`)
	if err != nil {
		return response.Error(c, 500, "Gagal mengambil kategori.", "DB_ERROR")
	}
	defer catRows.Close()

	categories := []fiber.Map{}
	for catRows.Next() {
		var id, cSlug, title, description, intro string
		var sortOrder int
		var isActive bool
		var docCount int64
		if err := catRows.Scan(&id, &cSlug, &title, &description, &intro, &sortOrder, &isActive, &docCount); err == nil {
			categories = append(categories, fiber.Map{
				"id":             id,
				"slug":           cSlug,
				"title":          title,
				"description":    description,
				"intro":          intro,
				"sort_order":     sortOrder,
				"is_active":      isActive,
				"document_count": docCount,
			})
		}
	}

	slug := strings.TrimSpace(c.Query("slug"))
	if slug == "" && len(categories) > 0 {
		slug = categories[0]["slug"].(string)
	}

	if slug == "" {
		return response.OK(c, fiber.Map{
			"categories":     categories,
			"activeCategory": nil,
			"documents":      []any{},
			"total":          0,
			"totalPages":     1,
			"page":           1,
			"limit":          20,
			"availableYears": []int{},
		})
	}

	// 2. Ambil detail kategori aktif
	var activeCat fiber.Map
	for _, cat := range categories {
		if cat["slug"] == slug {
			activeCat = cat
			break
		}
	}

	var catID string
	if activeCat != nil {
		catID = activeCat["id"].(string)
	} else {
		err := pool.QueryRow(ctx, `SELECT id FROM kemenag_website.report_categories WHERE slug = $1`, slug).Scan(&catID)
		if err != nil {
			return response.Error(c, 404, "Kategori tidak ditemukan.", "NOT_FOUND")
		}
	}

	// 3. Filter query dokumen
	year := c.QueryInt("year")
	searchQuery := strings.TrimSpace(c.Query("q"))
	page := c.QueryInt("page", 1)
	if page < 1 {
		page = 1
	}
	limit := c.QueryInt("limit", 20)
	if limit < 1 {
		limit = 20
	}
	offset := (page - 1) * limit

	whereClauses := []string{"category_id = $1"}
	queryArgs := []any{catID}

	if year >= 2000 && year <= 2100 {
		whereClauses = append(whereClauses, fmt.Sprintf("year = $%d", len(queryArgs)+1))
		queryArgs = append(queryArgs, year)
	}

	if searchQuery != "" {
		whereClauses = append(whereClauses, fmt.Sprintf("(title ILIKE $%d OR description ILIKE $%d)", len(queryArgs)+1, len(queryArgs)+2))
		queryArgs = append(queryArgs, "%"+searchQuery+"%", "%"+searchQuery+"%")
	}

	whereSql := strings.Join(whereClauses, " AND ")

	// Total count
	var total int64
	_ = pool.QueryRow(ctx, "SELECT COUNT(*) FROM kemenag_website.report_documents WHERE "+whereSql, queryArgs...).Scan(&total)

	// Documents query with LIMIT and OFFSET
	limitArgIdx := len(queryArgs) + 1
	offsetArgIdx := len(queryArgs) + 2
	docQueryArgs := append(queryArgs, limit, offset)

	docSql := fmt.Sprintf(`
		SELECT id, title, description, year, file_name, file_path, file_url, mime_type, file_size, sort_order, is_published, view_count, download_count, created_at, updated_at
		FROM kemenag_website.report_documents WHERE %s
		ORDER BY year DESC NULLS LAST, sort_order ASC, created_at DESC LIMIT $%d OFFSET $%d`, whereSql, limitArgIdx, offsetArgIdx)

	rows, err := pool.Query(ctx, docSql, docQueryArgs...)
	if err != nil {
		return response.Error(c, 500, "Gagal mengambil dokumen.", "DB_ERROR")
	}
	defer rows.Close()

	docs := []fiber.Map{}
	for rows.Next() {
		var id, title string
		var description, docYear, fileName, filePath, fileURL, mimeType any
		var fileSize, sortOrder, viewCount, downloadCount any
		var isPublished bool
		var createdAt, updatedAt *time.Time
		if err := rows.Scan(&id, &title, &description, &docYear, &fileName, &filePath, &fileURL,
			&mimeType, &fileSize, &sortOrder, &isPublished, &viewCount, &downloadCount, &createdAt, &updatedAt); err == nil {
			docs = append(docs, fiber.Map{
				"id":             id,
				"title":          title,
				"description":    description,
				"year":           docYear,
				"file_name":      fileName,
				"file_path":      filePath,
				"file_url":       fileURL,
				"mime_type":      mimeType,
				"file_size":      fileSize,
				"sort_order":     sortOrder,
				"is_published":   isPublished,
				"view_count":     viewCount,
				"download_count": downloadCount,
				"created_at":     fmtTime(createdAt),
				"updated_at":     fmtTime(updatedAt),
			})
		}
	}

	// Available years for this category
	yearRows, err := pool.Query(ctx, `SELECT DISTINCT year FROM kemenag_website.report_documents WHERE category_id = $1 AND year IS NOT NULL AND year >= 2000 ORDER BY year DESC`, catID)
	years := []int{}
	if err == nil {
		defer yearRows.Close()
		for yearRows.Next() {
			var y int
			if err := yearRows.Scan(&y); err == nil {
				years = append(years, y)
			}
		}
	}

	totalPages := 1
	if total > 0 && limit > 0 {
		totalPages = int((total + int64(limit) - 1) / int64(limit))
	}

	return response.OK(c, fiber.Map{
		"categories":     categories,
		"activeCategory": activeCat,
		"documents":      docs,
		"total":          total,
		"totalPages":     totalPages,
		"page":           page,
		"limit":          limit,
		"availableYears": years,
	})
}

var filenameRe = regexp.MustCompile(`[^a-zA-Z0-9._-]+`)

func safeBaseFilename(name string) string {
	name = strings.TrimSpace(name)
	name = filenameRe.ReplaceAllString(name, "-")
	name = strings.Trim(name, "-")
	if name == "" {
		name = "dokumen"
	}
	if len(name) > 120 {
		name = name[:120]
	}
	return name
}

// AdminLaporanUploadHandler — POST /api/admin/laporan/upload (multipart files[])
func AdminLaporanUploadHandler(c *fiber.Ctx) error {
	session, _, err := middleware.RequireAdmin(c, middleware.AdminAuthOpts{Permission: "laporan:manage", AllowEditor: true})
	if err != nil {
		return err
	}

	categoryID := strings.TrimSpace(c.FormValue("categoryId"))
	categorySlug := strings.TrimSpace(c.FormValue("categorySlug"))
	titlePrefix := strings.TrimSpace(c.FormValue("title"))
	description := strings.TrimSpace(c.FormValue("description"))
	isPublished := c.FormValue("is_published") != "false"

	year := time.Now().Year()
	if yStr := strings.TrimSpace(c.FormValue("year")); yStr != "" {
		if y, err := strconv.Atoi(yStr); err == nil && y >= 2000 && y <= 2100 {
			year = y
		}
	}

	if categoryID == "" && categorySlug == "" {
		return response.Error(c, 400, "Kategori wajib dipilih.", "VALIDATION_ERROR")
	}

	ctx, cancel := context.WithTimeout(c.Context(), 120*time.Second)
	defer cancel()
	pool := db.Get()

	// resolve kategori
	if categoryID == "" {
		err := pool.QueryRow(ctx, `SELECT id FROM kemenag_website.report_categories WHERE slug = $1`, categorySlug).Scan(&categoryID)
		if err != nil {
			return response.Error(c, 404, "Kategori tidak ditemukan.", "NOT_FOUND")
		}
	}

	form, err := c.MultipartForm()
	if err != nil {
		return response.Error(c, 400, "Form tidak valid.", "INVALID_FORM")
	}
	files := form.File["files"]
	if len(files) == 0 {
		return response.Error(c, 400, "Tidak ada file PDF yang dipilih.", "NO_FILES")
	}

	created := 0
	var createdDocs []fiber.Map
	var errors []string
	for i, fh := range files {
		if fh.Size > 50*1024*1024 {
			errors = append(errors, fh.Filename+" melebihi 50MB")
			continue
		}
		ext := strings.ToLower(filepath.Ext(fh.Filename))
		if ext != ".pdf" {
			errors = append(errors, fh.Filename+" bukan PDF")
			continue
		}

		src, err := fh.Open()
		if err != nil {
			errors = append(errors, fh.Filename+": gagal membaca file")
			continue
		}
		data, err := io.ReadAll(io.LimitReader(src, 50*1024*1024+1))
		src.Close()
		if err != nil || len(data) == 0 {
			errors = append(errors, fh.Filename+": data file kosong")
			continue
		}
		if len(data) < 4 || string(data[:4]) != "%PDF" {
			errors = append(errors, fh.Filename+" bukan file PDF valid")
			continue
		}

		stem := safeBaseFilename(strings.TrimSuffix(fh.Filename, ".pdf"))
		storagePath := "laporan/files/" + stem + "-" + fmt.Sprintf("%d", time.Now().UnixNano()) + ".pdf"
		if err := services.Storage.UploadObject(ctx, services.LaporanBucket, storagePath, data, "application/pdf", true); err != nil {
			errors = append(errors, fh.Filename+": upload gagal")
			continue
		}

		title := titlePrefix
		if title == "" {
			title = stem
		}
		if len(files) > 1 && titlePrefix != "" {
			title = fmt.Sprintf("%s - Bagian %d", titlePrefix, i+1)
		}
		title = lib.CleanString(title, 180)

		var newID string
		err = pool.QueryRow(ctx, `
			INSERT INTO kemenag_website.report_documents
				(category_id, title, description, year, file_name, file_path, mime_type, file_size, is_published, created_by)
			VALUES ($1,$2,$3,$4,$5,$6,'application/pdf',$7,$8,$9)
			RETURNING id`,
			categoryID, title, lib.CleanString(description, 2000), year, fh.Filename, storagePath, fh.Size, isPublished, session.UserID()).Scan(&newID)
		if err != nil {
			errors = append(errors, fh.Filename+": simpan DB gagal")
			continue
		}
		created++
		createdDocs = append(createdDocs, fiber.Map{
			"id":           newID,
			"title":        title,
			"description":  description,
			"year":         year,
			"file_name":    fh.Filename,
			"file_path":    storagePath,
			"file_size":    fh.Size,
			"is_published": isPublished,
		})
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
		Action: "create", Entity: "laporan_dokumen", PerformedBy: session.UserEmail(),
		After: fiber.Map{"created": created}, IP: adminIP(c),
	})
	services.CacheBust()
	services.Realtime.BroadcastRefresh("laporan")
	return response.OK(c, fiber.Map{"created": created, "documents": createdDocs, "errors": errors, "message": fmt.Sprintf("%d dokumen berhasil diunggah.", created)})
}

// AdminLaporanUpdateHandler — PUT /api/admin/laporan/:id (multipart atau JSON)
func AdminLaporanUpdateHandler(c *fiber.Ctx) error {
	session, _, err := middleware.RequireAdmin(c, middleware.AdminAuthOpts{Permission: "laporan:manage", AllowEditor: true})
	if err != nil {
		return err
	}
	id := c.Params("id")
	ctx, cancel := context.WithTimeout(c.Context(), 120*time.Second)
	defer cancel()
	pool := db.Get()

	var oldFilePath string
	err = pool.QueryRow(ctx, `SELECT file_path FROM kemenag_website.report_documents WHERE id = $1`, id).Scan(&oldFilePath)
	if err != nil {
		return response.Error(c, 404, "Dokumen tidak ditemukan.", "NOT_FOUND")
	}

	contentType := c.Get("Content-Type")
	title := ""
	description := ""
	year := 0
	isPublished := true

	if strings.HasPrefix(contentType, "multipart/form-data") {
		form, err := c.MultipartForm()
		if err != nil {
			return response.Error(c, 400, "Form tidak valid.", "INVALID_FORM")
		}
		title = strings.TrimSpace(c.FormValue("title"))
		if title == "" {
			return response.Error(c, 400, "Judul wajib diisi.", "VALIDATION_ERROR")
		}
		description = c.FormValue("description")
		year = c.QueryInt("year")
		if y := c.FormValue("year"); y != "" {
			year = atoiSafe(y)
		}
		if pub := c.FormValue("is_published"); pub != "" {
			isPublished = pub == "true" || pub == "1"
		}

		if fhs, ok := form.File["file"]; ok && len(fhs) > 0 {
			fh := fhs[0]
			if fh.Size > 50*1024*1024 {
				return response.Error(c, 400, "File PDF maksimal 50MB.", "FILE_TOO_LARGE")
			}
			ext := strings.ToLower(filepath.Ext(fh.Filename))
			if ext != ".pdf" {
				return response.Error(c, 400, "File harus PDF.", "INVALID_FILE_TYPE")
			}
			src, err := fh.Open()
			if err != nil {
				return response.Error(c, 400, "Gagal membaca file.", "READ_FAILED")
			}
			data, _ := io.ReadAll(io.LimitReader(src, 50*1024*1024+1))
			src.Close()

			stem := safeBaseFilename(strings.TrimSuffix(fh.Filename, ".pdf"))
			storagePath := "laporan/files/" + stem + "-" + fmt.Sprintf("%d", time.Now().UnixNano()) + ".pdf"
			if err := services.Storage.UploadObject(ctx, services.LaporanBucket, storagePath, data, "application/pdf", true); err != nil {
				return response.Error(c, 500, "Upload file gagal.", "UPLOAD_FAILED")
			}
			// hapus file lama
			if oldFilePath != "" {
				go services.Storage.RemoveObject(ctx, services.LaporanBucket, oldFilePath)
			}
			_, err = pool.Exec(ctx, `
				UPDATE kemenag_website.report_documents SET
					title = $1, description = $2, year = $3, file_name = $4, file_path = $5,
					file_size = $6, is_published = $7, updated_at = now()
				WHERE id = $8`,
				lib.CleanString(title, 180), lib.CleanString(description, 2000), year, fh.Filename, storagePath, fh.Size, isPublished, id)
			if err != nil {
				return response.Error(c, 500, "Gagal update dokumen.", "DB_ERROR")
			}
		} else {
			// metadata only
			_, err := pool.Exec(ctx, `
				UPDATE kemenag_website.report_documents SET
					title = $1, description = $2, year = $3, is_published = $4, updated_at = now()
				WHERE id = $5`,
				lib.CleanString(title, 180), lib.CleanString(description, 2000), year, isPublished, id)
			if err != nil {
				return response.Error(c, 500, "Gagal update dokumen.", "DB_ERROR")
			}
		}
	} else {
		// JSON metadata only
		var body fiber.Map
		if err := c.BodyParser(&body); err != nil {
			return response.Error(c, 400, "Body tidak valid.", "INVALID_BODY")
		}
		title = lib.CleanString(body["title"], 180)
		if title == "" {
			return response.Error(c, 400, "Judul wajib diisi.", "VALIDATION_ERROR")
		}
		description = lib.CleanString(body["description"], 2000)
		if y, ok := body["year"]; ok {
			year = lib.ToInt(y)
		}
		if pub, ok := body["is_published"]; ok {
			if b, ok := pub.(bool); ok {
				isPublished = b
			}
		}
		_, err := pool.Exec(ctx, `
			UPDATE kemenag_website.report_documents SET
				title = $1, description = $2, year = $3, is_published = $4, updated_at = now()
			WHERE id = $5`, title, description, year, isPublished, id)
		if err != nil {
			return response.Error(c, 500, "Gagal update dokumen.", "DB_ERROR")
		}
	}

	// Ambil dokumen terbaru setelah update
	var updatedDoc fiber.Map
	var docTitle string
	var docDesc, docYear, docFileName, docFilePath, docFileURL, docMime, docSize, docSort, docViews, docDownloads any
	var docPub bool
	var docCreated, docUpdated *time.Time
	if err := pool.QueryRow(ctx, `
		SELECT id, title, description, year, file_name, file_path, file_url, mime_type, file_size, sort_order, is_published, view_count, download_count, created_at, updated_at
		FROM kemenag_website.report_documents WHERE id = $1`, id).Scan(
		&id, &docTitle, &docDesc, &docYear, &docFileName, &docFilePath, &docFileURL, &docMime, &docSize, &docSort, &docPub, &docViews, &docDownloads, &docCreated, &docUpdated); err == nil {
		updatedDoc = fiber.Map{
			"id":             id,
			"title":          docTitle,
			"description":    docDesc,
			"year":           docYear,
			"file_name":      docFileName,
			"file_path":      docFilePath,
			"file_url":       docFileURL,
			"mime_type":      docMime,
			"file_size":      docSize,
			"sort_order":     docSort,
			"is_published":   docPub,
			"view_count":     docViews,
			"download_count": docDownloads,
			"created_at":     fmtTime(docCreated),
			"updated_at":     fmtTime(docUpdated),
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
		Action: "update", Entity: "laporan_dokumen", EntityID: id, PerformedBy: session.UserEmail(),
		After: fiber.Map{"title": title}, IP: adminIP(c),
	})
	services.CacheBust()
	services.Realtime.BroadcastRefresh("laporan")
	return response.OK(c, fiber.Map{"ok": true, "document": updatedDoc, "message": "Dokumen berhasil diperbarui."})
}

// AdminLaporanDeleteHandler — DELETE /api/admin/laporan/:id
func AdminLaporanDeleteHandler(c *fiber.Ctx) error {
	session, _, err := middleware.RequireAdmin(c, middleware.AdminAuthOpts{Permission: "laporan:manage", AllowEditor: true})
	if err != nil {
		return err
	}
	id := c.Params("id")
	ctx, cancel := context.WithTimeout(c.Context(), 10*time.Second)
	defer cancel()
	pool := db.Get()

	var filePath string
	err = pool.QueryRow(ctx, `SELECT file_path FROM kemenag_website.report_documents WHERE id = $1`, id).Scan(&filePath)
	if err != nil {
		return response.Error(c, 404, "Dokumen tidak ditemukan.", "NOT_FOUND")
	}
	if filePath != "" {
		go services.Storage.RemoveObject(ctx, services.LaporanBucket, filePath)
	}
	_, _ = pool.Exec(ctx, `DELETE FROM kemenag_website.report_documents WHERE id = $1`, id)

	services.Audit.Record(struct {
		Action      string
		Entity      string
		EntityID    string
		PerformedBy string
		Before      any
		After       any
		IP          any
	}{
		Action: "delete", Entity: "laporan_dokumen", EntityID: id, PerformedBy: session.UserEmail(), IP: adminIP(c),
	})
	services.CacheBust()
	services.Realtime.BroadcastRefresh("laporan")
	return response.OK(c, fiber.Map{"ok": true})
}

// AdminLaporanViewIncrementHandler — POST /api/admin/laporan/view
func AdminLaporanViewIncrementHandler(c *fiber.Ctx) error {
	var body struct {
		ID string `json:"id"`
	}
	if err := c.BodyParser(&body); err != nil {
		return response.Error(c, 400, "Body tidak valid.", "INVALID_BODY")
	}
	if body.ID == "" {
		return response.Error(c, 400, "ID wajib.", "ID_REQUIRED")
	}
	ctx, cancel := context.WithTimeout(c.Context(), 5*time.Second)
	defer cancel()
	pool := db.Get()
	_, _ = pool.Exec(ctx, `UPDATE kemenag_website.report_documents SET view_count = view_count + 1 WHERE id = $1`, body.ID)
	return response.OK(c, fiber.Map{"ok": true})
}

// AdminLaporanViewProxyHandler — GET /api/admin/laporan/view/:id
func AdminLaporanViewProxyHandler(c *fiber.Ctx) error {
	id := c.Params("id")
	ctx, cancel := context.WithTimeout(c.Context(), 8*time.Second)
	defer cancel()
	fileURL, fileName, _, status := getLaporanDoc(ctx, id, "view_count")
	if status != 200 {
		return response.Error(c, status, "Dokumen tidak ditemukan.", "NOT_FOUND")
	}
	return streamRemoteFile(c, fileURL, "inline", fileName, nil)
}

func atoiSafe(s string) int {
	n := 0
	neg := false
	for i, r := range s {
		if i == 0 && (r == '-' || r == '+') {
			neg = r == '-'
			continue
		}
		if r < '0' || r > '9' {
			return 0
		}
		n = n*10 + int(r-'0')
	}
	if neg {
		return -n
	}
	return n
}

var _ = mime.TypeByExtension
var _ = url.QueryEscape
