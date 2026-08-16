package handlers

import (
	"context"
	"strings"
	"sync"
	"time"

	"kemenag-backend/internal/db"
	"kemenag-backend/internal/middleware"
	"kemenag-backend/internal/response"
	"kemenag-backend/internal/services"

	"github.com/gofiber/fiber/v2"
)

// SeksiPublicHandler — GET /api/seksi (urutan organisasi + komposisi kepala)
func SeksiPublicHandler(c *fiber.Ctx) error {
	ctx, cancel := context.WithTimeout(c.Context(), 8*time.Second)
	defer cancel()
	pool := db.Get()
	if pool == nil {
		return response.Error(c, 503, "Database tidak tersedia", "DB_UNAVAILABLE")
	}

	rows, err := pool.Query(ctx, `
		SELECT s.id, s.slug, s.judul, s.nama_kepala, s.nip_kepala, s.foto_kepala, s.deskripsi, s.foto_kepala_y,
		       COUNT(p.id) AS pegawai_count
		FROM kemenag_website.seksi s
		LEFT JOIN kemenag_website.pegawai_seksi p ON p.seksi_id = s.id
		GROUP BY s.id
		ORDER BY s.created_at ASC`)
	if err != nil {
		return response.Error(c, 500, "Gagal mengambil seksi", "DB_ERROR")
	}
	defer rows.Close()

	var seksi []fiber.Map
	for rows.Next() {
		var id, slug, judul, namaKepala string
		var nipKepala, fotoKepala, deskripsi any
		var fotoY, pegawaiCount int
		if err := rows.Scan(&id, &slug, &judul, &namaKepala, &nipKepala, &fotoKepala, &deskripsi, &fotoY, &pegawaiCount); err != nil {
			continue
		}
		seksi = append(seksi, fiber.Map{
			"id":             id,
			"slug":           slug,
			"judul":          judul,
			"nama_kepala":    namaKepala,
			"nip_kepala":     nipKepala,
			"foto_kepala":    fotoKepala,
			"foto_kepala_y":  fotoY,
			"deskripsi":      deskripsi,
			"pegawai_count":  pegawaiCount,
		})
	}

	response.CDNCacheControl(c, 600, 1200)
	return c.JSON(fiber.Map{"seksi": seksi})
}

// SeksiDetailPublicHandler — GET /api/seksi/:slug
func SeksiDetailPublicHandler(c *fiber.Ctx) error {
	ctx, cancel := context.WithTimeout(c.Context(), 8*time.Second)
	defer cancel()
	pool := db.Get()
	if pool == nil {
		return response.Error(c, 503, "Database tidak tersedia", "DB_UNAVAILABLE")
	}

	slug := strings.TrimSpace(c.Params("slug"))
	if slug == "" {
		return response.Error(c, 400, "Slug seksi diperlukan", "BAD_REQUEST")
	}

	var id, seksiSlug, judul, namaKepala string
	var nipKepala, fotoKepala, deskripsi any
	var fotoY int
	err := pool.QueryRow(ctx, `
		SELECT id, slug, judul, nama_kepala, nip_kepala, foto_kepala, deskripsi, foto_kepala_y
		FROM kemenag_website.seksi
		WHERE slug = $1 OR id::text = $1
		LIMIT 1`, slug).Scan(&id, &seksiSlug, &judul, &namaKepala, &nipKepala, &fotoKepala, &deskripsi, &fotoY)
	if err != nil {
		return response.Error(c, 404, "Seksi tidak ditemukan", "NOT_FOUND")
	}

	// Ambil seluruh pegawai seksi terkait
	pRows, err := pool.Query(ctx, `
		SELECT id, nama, nip, jabatan, foto, sort_order, foto_y
		FROM kemenag_website.pegawai_seksi
		WHERE seksi_id = $1
		ORDER BY sort_order ASC, created_at ASC`, id)
	var pegawaiList []fiber.Map
	if err == nil {
		defer pRows.Close()
		for pRows.Next() {
			var pID, pNama string
			var pNip, pJabatan, pFoto any
			var pSort, pFotoY int
			if err := pRows.Scan(&pID, &pNama, &pNip, &pJabatan, &pFoto, &pSort, &pFotoY); err == nil {
				pegawaiList = append(pegawaiList, fiber.Map{
					"id":         pID,
					"nama":       pNama,
					"nip":        pNip,
					"jabatan":    pJabatan,
					"foto":       pFoto,
					"foto_y":     pFotoY,
					"sort_order": pSort,
				})
			}
		}
	}
	if pegawaiList == nil {
		pegawaiList = []fiber.Map{}
	}

	response.CDNCacheControl(c, 600, 1200)
	return c.JSON(fiber.Map{
		"seksi": fiber.Map{
			"id":            id,
			"slug":          seksiSlug,
			"judul":         judul,
			"nama_kepala":   namaKepala,
			"nip_kepala":    nipKepala,
			"foto_kepala":   fotoKepala,
			"foto_kepala_y": fotoY,
			"deskripsi":     deskripsi,
			"pegawai":       pegawaiList,
		},
	})
}

// StaticPagesHandler — GET /api/static-pages (?slug=)
func StaticPagesHandler(c *fiber.Ctx) error {
	ctx, cancel := context.WithTimeout(c.Context(), 8*time.Second)
	defer cancel()
	pool := db.Get()
	if pool == nil {
		return response.Error(c, 503, "Database tidak tersedia", "DB_UNAVAILABLE")
	}

	slug := strings.TrimSpace(c.Query("slug"))

	var rows any
	var err error
	if slug != "" {
		var id, pageSlug, title, content string
		var description any
		var isPublished bool
		var updatedAt *time.Time
		err = pool.QueryRow(ctx, `
			SELECT id, slug, title, description, content, is_published, updated_at
			FROM kemenag_website.static_pages
			WHERE slug = $1 AND is_published = true LIMIT 1`, slug).
			Scan(&id, &pageSlug, &title, &description, &content, &isPublished, &updatedAt)
		if err != nil {
			return response.Error(c, 404, "Halaman tidak ditemukan.", "PAGE_NOT_FOUND")
		}
		response.CDNCacheControl(c, 600, 1200)
		return c.JSON(fiber.Map{
			"id":           id,
			"slug":         pageSlug,
			"title":        title,
			"description":  description,
			"content":      content,
			"is_published": isPublished,
			"updated_at":   fmtTime(updatedAt),
		})
	}
	_ = rows

	cur, err := pool.Query(ctx, `
		SELECT id, slug, title, description, content, is_published, updated_at
		FROM kemenag_website.static_pages
		WHERE is_published = true
		ORDER BY updated_at DESC`)
	if err != nil {
		return response.Error(c, 500, "Gagal mengambil halaman", "DB_ERROR")
	}
	defer cur.Close()

	out := []fiber.Map{}
	for cur.Next() {
		var id, pageSlug, title, content string
		var description any
		var isPublished bool
		var updatedAt *time.Time
		if err := cur.Scan(&id, &pageSlug, &title, &description, &content, &isPublished, &updatedAt); err != nil {
			continue
		}
		out = append(out, fiber.Map{
			"id": id, "slug": pageSlug, "title": title,
			"description": description, "content": content,
			"is_published": isPublished, "updated_at": fmtTime(updatedAt),
		})
	}

	response.CDNCacheControl(c, 600, 1200)
	return c.JSON(fiber.Map{"pages": out})
}

// SearchHandler — GET /api/search (full-text ILIKE concurrent 7 tabel)
func SearchHandler(c *fiber.Ctx) error {
	query := strings.TrimSpace(c.Query("q"))
	if len(query) < 2 {
		return response.Error(c, 400, "Query minimal 2 karakter.", "QUERY_TOO_SHORT")
	}
	limit := 10
	if v := c.QueryInt("limit"); v > 0 && v <= 50 {
		limit = v
	}

	ctx, cancel := context.WithTimeout(c.Context(), 5*time.Second)
	defer cancel()
	pool := db.Get()
	if pool == nil {
		return response.Error(c, 503, "Database tidak tersedia", "DB_UNAVAILABLE")
	}

	pattern := "%" + query + "%"

	var results []fiber.Map
	var mu sync.Mutex
	var wg sync.WaitGroup

	appendResults := func(items []fiber.Map) {
		if len(items) == 0 {
			return
		}
		mu.Lock()
		results = append(results, items...)
		mu.Unlock()
	}

	// 1. Berita
	wg.Add(1)
	go func() {
		defer wg.Done()
		rows, err := pool.Query(ctx, `
			SELECT id, slug, title, excerpt, category, cover_image, published_at, views
			FROM kemenag_website.berita
			WHERE is_published = true AND (title ILIKE $1 OR excerpt ILIKE $1 OR category ILIKE $1)
			ORDER BY published_at DESC LIMIT $2`, pattern, limit)
		if err != nil {
			return
		}
		defer rows.Close()
		var out []fiber.Map
		for rows.Next() {
			var id, slug, title, excerpt, category string
			var cover any
			var publishedAt *time.Time
			var views int64
			if err := rows.Scan(&id, &slug, &title, &excerpt, &category, &cover, &publishedAt, &views); err != nil {
				continue
			}
			out = append(out, fiber.Map{
				"id":           id,
				"slug":         slug,
				"title":        title,
				"excerpt":      excerpt,
				"description":  excerpt,
				"category":     category,
				"cover_image":  cover,
				"published_at": fmtTime(publishedAt),
				"views":        views,
				"type":         "berita",
				"section":      "Berita",
				"href":         "/berita/" + slug,
			})
		}
		appendResults(out)
	}()

	// 2. Layanan PTSP
	wg.Add(1)
	go func() {
		defer wg.Done()
		rows, err := pool.Query(ctx, `
			SELECT id, name, slug
			FROM kemenag_ptsp.ptsp_services
			WHERE is_active = true AND (name ILIKE $1 OR slug ILIKE $1)
			ORDER BY sort_order ASC LIMIT $2`, pattern, limit)
		if err != nil {
			return
		}
		defer rows.Close()
		var out []fiber.Map
		for rows.Next() {
			var id int64
			var name, slug string
			if err := rows.Scan(&id, &name, &slug); err != nil {
				continue
			}
			out = append(out, fiber.Map{
				"id":          stringify(id),
				"title":       name,
				"description": "Layanan Digital PTSP Kemenag Barito Utara",
				"category":    "PTSP",
				"slug":        slug,
				"type":        "layanan",
				"section":     "Layanan",
				"href":        "https://ptsp.kemenag-baritoutara.com/",
			})
		}
		appendResults(out)
	}()

	// 3. Laporan
	wg.Add(1)
	go func() {
		defer wg.Done()
		rows, err := pool.Query(ctx, `
			SELECT d.id, d.title, d.description, d.year, d.file_url, d.file_name, c.slug AS category_slug, c.title AS category_title
			FROM kemenag_website.report_documents d
			JOIN kemenag_website.report_categories c ON c.id = d.category_id
			WHERE d.is_published = true AND (d.title ILIKE $1 OR d.description ILIKE $1)
			ORDER BY d.updated_at DESC LIMIT $2`, pattern, limit)
		if err != nil {
			return
		}
		defer rows.Close()
		var out []fiber.Map
		for rows.Next() {
			var id, title string
			var description, year, fileURL, fileName, catSlug, catTitle any
			if err := rows.Scan(&id, &title, &description, &year, &fileURL, &fileName, &catSlug, &catTitle); err != nil {
				continue
			}
			out = append(out, fiber.Map{
				"id":          id,
				"title":       title,
				"description": description,
				"year":        year,
				"category":    catTitle,
				"slug":        catSlug,
				"file_url":    fileURL,
				"file_name":   fileName,
				"type":        "laporan",
				"section":     "Laporan",
				"href":        "/laporan/" + stringify(catSlug),
			})
		}
		appendResults(out)
	}()

	// 4. Halaman Statis
	wg.Add(1)
	go func() {
		defer wg.Done()
		rows, err := pool.Query(ctx, `
			SELECT id, slug, title, description, updated_at
			FROM kemenag_website.static_pages
			WHERE is_published = true AND (title ILIKE $1 OR description ILIKE $1 OR content ILIKE $1)
			ORDER BY updated_at DESC LIMIT $2`, pattern, limit)
		if err != nil {
			return
		}
		defer rows.Close()
		var out []fiber.Map
		for rows.Next() {
			var id, slug, title string
			var description any
			var updatedAt *time.Time
			if err := rows.Scan(&id, &slug, &title, &description, &updatedAt); err != nil {
				continue
			}
			out = append(out, fiber.Map{
				"id":          id,
				"slug":        slug,
				"title":       title,
				"description": description,
				"updated_at":  fmtTime(updatedAt),
				"type":        "halaman",
				"section":     "Halaman",
				"category":    "Informasi",
				"href":        "/" + slug,
			})
		}
		appendResults(out)
	}()

	// 5. Dokumen Publik
	wg.Add(1)
	go func() {
		defer wg.Done()
		rows, err := pool.Query(ctx, `
			SELECT id, slug, title, description, category, file_url, is_external, is_available
			FROM kemenag_website.dokumen
			WHERE is_published = true AND (title ILIKE $1 OR description ILIKE $1)
			ORDER BY published_at DESC LIMIT $2`, pattern, limit)
		if err != nil {
			return
		}
		defer rows.Close()
		var out []fiber.Map
		for rows.Next() {
			var id, slug, title, description, category string
			var fileURL any
			var isExternal, isAvailable bool
			if err := rows.Scan(&id, &slug, &title, &description, &category, &fileURL, &isExternal, &isAvailable); err != nil {
				continue
			}
			out = append(out, fiber.Map{
				"id":           id,
				"slug":         slug,
				"title":        title,
				"description":  description,
				"category":     category,
				"file_url":     fileURL,
				"is_external":  isExternal,
				"is_available": isAvailable,
				"type":         "dokumen",
				"section":      "Dokumen",
				"href":         "/informasi",
			})
		}
		appendResults(out)
	}()

	// 6. Seksi
	wg.Add(1)
	go func() {
		defer wg.Done()
		rows, err := pool.Query(ctx, `
			SELECT id, slug, judul, deskripsi
			FROM kemenag_website.seksi
			WHERE judul ILIKE $1 OR deskripsi ILIKE $1
			ORDER BY created_at ASC LIMIT $2`, pattern, limit)
		if err != nil {
			return
		}
		defer rows.Close()
		var out []fiber.Map
		for rows.Next() {
			var id, slug, judul, deskripsi string
			if err := rows.Scan(&id, &slug, &judul, &deskripsi); err != nil {
				continue
			}
			out = append(out, fiber.Map{
				"id":          id,
				"slug":        slug,
				"title":       judul,
				"judul":       judul,
				"description": deskripsi,
				"type":        "seksi",
				"section":     "Layanan",
				"category":    "Seksi & Unit",
				"href":        "/profil/struktur-organisasi",
			})
		}
		appendResults(out)
	}()

	wg.Wait()

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
func VisitorStatsHandler(c *fiber.Ctx) error {
	ctx, cancel := context.WithTimeout(c.Context(), 6*time.Second)
	defer cancel()
	total, today := services.GetVisitorStats(ctx)
	response.CDNCacheControl(c, 0, 0)
	return c.JSON(fiber.Map{"total": total, "today": today})
}

// VisitorIncrementHandler — POST /api/visitors
func VisitorIncrementHandler(c *fiber.Ctx) error {
	ctx, cancel := context.WithTimeout(c.Context(), 6*time.Second)
	defer cancel()

	path := ""
	var body fiber.Map
	if err := c.BodyParser(&body); err == nil {
		if p, ok := body["path"].(string); ok {
			path = p
		}
	}
	services.IncrementVisitorStats(ctx, path)
	return response.OK(c, fiber.Map{"ok": true})
}

// MaintenanceStatusHandler — GET /api/maintenance-status
func MaintenanceStatusHandler(c *fiber.Ctx) error {
	c.Set("Cache-Control", "no-store")
	c.Set("CDN-Cache-Control", "no-store")
	return c.JSON(fiber.Map{"maintenance": false})
}

var _ = middleware.GetClientIP