package handlers

import (
	"context"
	"strings"
	"sync"
	"time"

	"kemenag-backend/internal/db"
	"kemenag-backend/internal/lib"
	"kemenag-backend/internal/middleware"
	"kemenag-backend/internal/response"
	"kemenag-backend/internal/services"

	"github.com/gofiber/fiber/v2"
	"github.com/jackc/pgx/v5/pgxpool"
)

func adminIP(c *fiber.Ctx) any {
	return middleware.GetClientIP(c)
}

type cachedAdminBerita struct {
	payload   fiber.Map
	expiresAt time.Time
}

var (
	adminBeritaCacheMu sync.RWMutex
	adminBeritaCache   *cachedAdminBerita
)

// InvalidateAdminBeritaCache membersihkan cache daftar berita admin.
func InvalidateAdminBeritaCache() {
	adminBeritaCacheMu.Lock()
	adminBeritaCache = nil
	adminBeritaCacheMu.Unlock()
	InvalidateDashboardStatsCache()
}

// AdminBeritaListHandler — GET /api/admin/berita
func AdminBeritaListHandler(c *fiber.Ctx) error {
	_, _, err := middleware.RequireAdmin(c, middleware.AdminAuthOpts{Permission: "berita:view", AllowEditor: true})
	if err != nil {
		return err
	}

	limit := c.QueryInt("limit", 1000)
	if limit < 1 {
		limit = 1000
	}
	page := c.QueryInt("page", 1)
	if page < 1 {
		page = 1
	}
	offset := (page - 1) * limit

	where := "1=1"
	var filterArgs []any
	if q := strings.TrimSpace(c.Query("q")); q != "" {
		where += " AND (title ILIKE $" + itoa(len(filterArgs)+1) + " OR slug ILIKE $" + itoa(len(filterArgs)+1) + ")"
		filterArgs = append(filterArgs, "%"+q+"%")
	}
	if cat := strings.TrimSpace(c.Query("category")); cat != "" && cat != "all" {
		where += " AND category = $" + itoa(len(filterArgs)+1)
		filterArgs = append(filterArgs, cat)
	}
	if pub := c.Query("is_published"); pub == "true" || pub == "false" {
		where += " AND is_published = $" + itoa(len(filterArgs)+1)
		filterArgs = append(filterArgs, pub == "true")
	}

	isDefaultList := where == "1=1" && limit >= 500 && page == 1
	if isDefaultList {
		adminBeritaCacheMu.RLock()
		if adminBeritaCache != nil && time.Now().Before(adminBeritaCache.expiresAt) {
			cached := adminBeritaCache.payload
			adminBeritaCacheMu.RUnlock()
			return response.OK(c, cached)
		}
		adminBeritaCacheMu.RUnlock()
	}

	ctx, cancel := context.WithTimeout(c.Context(), 10*time.Second)
	defer cancel()
	pool := db.Get()
	if pool == nil {
		return response.Error(c, 503, "Database tidak tersedia", "DB_UNAVAILABLE")
	}

	var total int64
	_ = pool.QueryRow(ctx, "SELECT COUNT(*) FROM kemenag_website.berita WHERE "+where, filterArgs...).Scan(&total)

	listArgs := append([]any{}, filterArgs...)
	limitIdx := len(listArgs) + 1
	offsetIdx := len(listArgs) + 2
	listArgs = append(listArgs, limit, offset)

	query := `SELECT ` + beritaCols + ` FROM kemenag_website.berita WHERE ` + where + `
		ORDER BY created_at DESC LIMIT $` + itoa(limitIdx) + ` OFFSET $` + itoa(offsetIdx)

	rows, err := pool.Query(ctx, query, listArgs...)
	if err != nil {
		return response.Error(c, 500, "Gagal mengambil berita.", "DB_ERROR")
	}
	defer rows.Close()

	list := []fiber.Map{}
	for rows.Next() {
		r, err := scanBeritaRow(rows, false)
		if err == nil {
			list = append(list, beritaToMap(r, false))
		}
	}

	result := fiber.Map{"items": list, "total": total, "page": page, "limit": limit}
	if isDefaultList {
		adminBeritaCacheMu.Lock()
		adminBeritaCache = &cachedAdminBerita{
			payload:   result,
			expiresAt: time.Now().Add(30 * time.Second),
		}
		adminBeritaCacheMu.Unlock()
	}

	return response.OK(c, result)
}

// AdminBeritaGetHandler — GET /api/admin/berita/:id
func AdminBeritaGetHandler(c *fiber.Ctx) error {
	_, _, err := middleware.RequireAdmin(c, middleware.AdminAuthOpts{Permission: "berita:update", AllowEditor: true})
	if err != nil {
		return err
	}
	ctx, cancel := context.WithTimeout(c.Context(), 8*time.Second)
	defer cancel()
	pool := db.Get()
	if pool == nil {
		return response.Error(c, 503, "Database tidak tersedia", "DB_UNAVAILABLE")
	}

	var r beritaRow
	var reactB, reactI, reactN int64
	err = pool.QueryRow(ctx, `
		SELECT id, slug, title, excerpt, category, content, cover_image, is_published,
		       published_at, created_at, updated_at, views, cover_size_kb,
		       reaction_bermanfaat, reaction_inspiratif, reaction_informatif
		FROM kemenag_website.berita WHERE id = $1 LIMIT 1`, c.Params("id")).
		Scan(&r.ID, &r.Slug, &r.Title, &r.Excerpt, &r.Category, &r.Content, &r.CoverImage, &r.IsPublished,
			&r.PublishedAt, &r.CreatedAt, &r.UpdatedAt, &r.Views, &r.CoverSizeKB,
			&reactB, &reactI, &reactN)
	if err != nil {
		return response.Error(c, 404, "Berita tidak ditemukan.", "NOT_FOUND")
	}
	r.Reactions = []int64{reactB, reactI, reactN}

	m := beritaToMap(&r, true)
	if len(r.Reactions) == 3 {
		m["reactions"] = fiber.Map{
			"bermanfaat": r.Reactions[0], "inspiratif": r.Reactions[1], "informatif": r.Reactions[2],
		}
	}
	return response.OK(c, fiber.Map{"berita": m})
}

// validateBeritaPayload validasi + normalisasi payload berita.
func validateBeritaPayload(body fiber.Map, _ bool) (fiber.Map, error) {
	title := lib.CleanString(body["title"], 200)
	content := lib.CleanHTML(body["content"], 60000)
	excerpt := lib.CleanString(body["excerpt"], 500)
	category := lib.CleanString(body["category"], 100)
	if category == "" {
		category = "Umum"
	}
	slug := lib.CleanString(body["slug"], 200)

	errors := []fiber.Map{}
	if len(title) < 3 {
		errors = append(errors, lib.I("title", "Judul minimal 3 karakter."))
	}
	if len(content) < 20 {
		errors = append(errors, lib.I("content", "Konten minimal 20 karakter."))
	}
	if len(errors) > 0 {
		return nil, &validationErr{msg: "Validasi gagal.", code: "VALIDATION_ERROR", errors: errors}
	}

	out := fiber.Map{
		"title":   title,
		"content": content,
		"excerpt": excerpt,
		"category": category,
		"slug":    slug,
	}
	if v, ok := body["is_published"].(bool); ok {
		out["is_published"] = v
	} else {
		out["is_published"] = lib.ToBool(body["is_published"])
	}
	if body["published_at"] != nil {
		if s := lib.ToDateISO(body["published_at"]); s != "" {
			out["published_at"] = s
		}
	}
	return out, nil
}

type validationErr struct {
	msg    string
	code   string
	errors []fiber.Map
}

func (e *validationErr) Error() string {
	return e.msg
}

// AdminBeritaCreateHandler — POST /api/admin/berita
func AdminBeritaCreateHandler(c *fiber.Ctx) error {
	session, pc, err := middleware.RequireAdmin(c, middleware.AdminAuthOpts{Permission: "berita:create", AllowEditor: true})
	if err != nil {
		return err
	}

	var raw fiber.Map
	if err := c.BodyParser(&raw); err != nil {
		return response.Error(c, 400, "Body tidak valid.", "INVALID_BODY")
	}
	data, err := validateBeritaPayload(raw, false)
	if err != nil {
		if ve, ok := err.(*validationErr); ok {
			return response.ValidationErr(c, 400, ve.msg, ve.code, ve.errors)
		}
		return response.Error(c, 400, err.Error(), "VALIDATION_ERROR")
	}

	ctx, cancel := context.WithTimeout(c.Context(), 20*time.Second)
	defer cancel()
	pool := db.Get()

	// cover upload
	coverURL := ""
	coverRaw := raw["cover_image"]
	if coverRaw == nil || coverRaw == "" {
		coverRaw = raw["cover_upload_base64"]
	}
	if coverRaw != nil {
		if s := lib.CleanString(coverRaw, 20_000_000); strings.HasPrefix(s, "data:image/") {
			_, publicURL, _, size, err := services.Storage.UploadBase64Image(ctx, s, "berita", "cover")
			if err != nil {
				return response.Error(c, 400, "Gagal upload cover: "+err.Error(), "UPLOAD_FAILED")
			}
			coverURL = publicURL
			data["cover_size_bytes"] = size
			data["cover_size_kb"] = int(size / 1024)
		} else if s := lib.CleanString(coverRaw, 2000); s != "" {
			coverURL = s
		}
	}
	data["cover_image"] = coverURL

	// slug unik
	slug := lib.CleanString(data["slug"], 200)
	if slug == "" {
		slug = lib.Slugify(lib.CleanString(data["title"], 200))
	}
	slug = ensureUniqueSlug(ctx, pool, "berita", slug, "")
	data["slug"] = slug

	// published_at
	publishedAt := time.Now().UTC().Format(time.RFC3339)
	if v, ok := data["published_at"].(string); ok && v != "" {
		publishedAt = v
	}

	// editor tanpa publish → draft
	canPublish := pc.IsSuperAdmin || pc.IsAdmin
	if !canPublish {
		canPublish = middleware.HasPermission(pc, "berita:publish")
	}
	if !canPublish {
		data["is_published"] = false
	}

	authorID := session.UserID()
	if authorID == "" {
		authorID = session.ProfileID()
	}
	authorIDArg := any(nil)
	if authorID != "" {
		authorIDArg = authorID
	}

	coverKB := 0
	if v, ok := data["cover_size_kb"].(int); ok {
		coverKB = v
	}
	var coverBytes int64 = 0
	if v, ok := data["cover_size_bytes"].(int64); ok {
		coverBytes = v
	}

	var newID string
	err = pool.QueryRow(ctx, `
		INSERT INTO kemenag_website.berita
			(slug, title, excerpt, category, content, cover_image, is_published, published_at,
			 author_id, views, cover_size_kb, cover_size_bytes)
		VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,0,$10,$11)
		RETURNING id`,
		data["slug"], data["title"], data["excerpt"], data["category"], data["content"],
		data["cover_image"], data["is_published"], publishedAt, authorIDArg,
		coverKB, coverBytes).Scan(&newID)
	if err != nil {
		return response.Error(c, 500, "Gagal menyimpan berita: "+err.Error(), "DB_ERROR")
	}

	// audit + invalidasi
	services.Audit.Record(struct {
		Action      string
		Entity      string
		EntityID    string
		PerformedBy string
		Before      any
		After       any
		IP          any
	}{
		Action: "create", Entity: "berita", EntityID: newID,
		PerformedBy: session.UserEmail(), After: fiber.Map{"title": data["title"], "slug": data["slug"]}, IP: adminIP(c),
	})
	services.CacheBust()
	InvalidateAdminBeritaCache()
	services.Realtime.BroadcastRefresh("berita")

	// push notifikasi (fire and forget)
	if lib.ToBool(data["is_published"]) {
		go services.SendNewsPushNotification(
			lib.CleanString(data["title"], 200),
			lib.CleanString(data["slug"], 200),
			lib.CleanString(data["excerpt"], 500),
			coverURL,
		)
	}

	return response.OK(c, fiber.Map{"id": newID, "slug": data["slug"], "is_published": data["is_published"]})
}

// AdminBeritaUpdateHandler — PUT /api/admin/berita/:id
func AdminBeritaUpdateHandler(c *fiber.Ctx) error {
	session, pc, err := middleware.RequireAdmin(c, middleware.AdminAuthOpts{Permission: "berita:update", AllowEditor: true})
	if err != nil {
		return err
	}

	var raw fiber.Map
	if err := c.BodyParser(&raw); err != nil {
		return response.Error(c, 400, "Body tidak valid.", "INVALID_BODY")
	}
	data, err := validateBeritaPayload(raw, true)
	if err != nil {
		if ve, ok := err.(*validationErr); ok {
			return response.ValidationErr(c, 400, ve.msg, ve.code, ve.errors)
		}
		return response.Error(c, 400, err.Error(), "VALIDATION_ERROR")
	}

	ctx, cancel := context.WithTimeout(c.Context(), 20*time.Second)
	defer cancel()
	pool := db.Get()

	id := c.Params("id")
	var oldCover any
	var oldPublished bool
	var oldKB int
	var oldBytes int64
	err = pool.QueryRow(ctx, `SELECT cover_image, is_published, COALESCE(cover_size_kb, 0), COALESCE(cover_size_bytes, 0) FROM kemenag_website.berita WHERE id = $1`, id).
		Scan(&oldCover, &oldPublished, &oldKB, &oldBytes)
	if err != nil {
		return response.Error(c, 404, "Berita tidak ditemukan.", "NOT_FOUND")
	}

	// cover baru
	coverURL := ""
	coverRaw := raw["cover_image"]
	if coverRaw == nil || coverRaw == "" {
		coverRaw = raw["cover_upload_base64"]
	}
	coverKB := oldKB
	coverBytes := oldBytes

	if coverRaw != nil {
		s := lib.CleanString(coverRaw, 20_000_000)
		if strings.HasPrefix(s, "data:image/") {
			_, publicURL, _, size, err := services.Storage.UploadBase64Image(ctx, s, "berita", "cover")
			if err != nil {
				return response.Error(c, 400, "Gagal upload cover: "+err.Error(), "UPLOAD_FAILED")
			}
			coverURL = publicURL
			coverBytes = size
			coverKB = int(size / 1024)
			// hapus cover lama
			if oc, ok := oldCover.(string); ok && services.IsCMSStorageURL(oc) {
				go services.Storage.RemoveFileByPublicUrl(ctx, oc)
			}
		} else if s := lib.CleanString(coverRaw, 2000); s != "" {
			coverURL = s
		} else if oc, ok := oldCover.(string); ok && oc != "" && !services.IsCMSStorageURL(oc) {
			coverURL = oc // pertahankan URL eksternal
		}
	}
	if coverURL == "" {
		if oc, ok := oldCover.(string); ok {
			coverURL = oc
		}
	}
	data["cover_image"] = coverURL

	// slug unik (kecuali id sendiri)
	slug := lib.CleanString(data["slug"], 200)
	if slug == "" {
		slug = lib.Slugify(lib.CleanString(data["title"], 200))
	}
	data["slug"] = ensureUniqueSlug(ctx, pool, "berita", slug, id)

	// publish rule
	newPublished := lib.ToBool(data["is_published"])
	canPublish := pc.IsSuperAdmin || pc.IsAdmin || middleware.HasPermission(pc, "berita:publish")
	if !canPublish {
		newPublished = false
	}

	publishedAt := time.Now().UTC().Format(time.RFC3339)
	if v, ok := data["published_at"].(string); ok && v != "" {
		publishedAt = v
	}

	_, err = pool.Exec(ctx, `
		UPDATE kemenag_website.berita SET
			slug = $1, title = $2, excerpt = $3, category = $4, content = $5,
			cover_image = $6, is_published = $7, published_at = $8, cover_size_kb = $9, cover_size_bytes = $10,
			updated_at = now()
		WHERE id = $11`,
		data["slug"], data["title"], data["excerpt"], data["category"], data["content"],
		data["cover_image"], newPublished, publishedAt,
		coverKB, coverBytes, id)
	if err != nil {
		return response.Error(c, 500, "Gagal update berita: "+err.Error(), "DB_ERROR")
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
		Action: "update", Entity: "berita", EntityID: id,
		PerformedBy: session.UserEmail(), Before: fiber.Map{"is_published": oldPublished},
		After: fiber.Map{"title": data["title"], "slug": data["slug"], "is_published": newPublished}, IP: adminIP(c),
	})
	services.CacheBust()
	InvalidateAdminBeritaCache()
	services.Realtime.BroadcastRefresh("berita")

	// push jika draft → publish
	if newPublished && !oldPublished {
		go services.SendNewsPushNotification(
			lib.CleanString(data["title"], 200),
			lib.CleanString(data["slug"], 200),
			lib.CleanString(data["excerpt"], 500),
			coverURL,
		)
	}

	return response.OK(c, fiber.Map{"id": id, "slug": data["slug"], "is_published": newPublished})
}

// AdminBeritaDeleteHandler — DELETE /api/admin/berita/:id
func AdminBeritaDeleteHandler(c *fiber.Ctx) error {
	session, _, err := middleware.RequireAdmin(c, middleware.AdminAuthOpts{Permission: "berita:delete", AllowEditor: true})
	if err != nil {
		return err
	}
	ctx, cancel := context.WithTimeout(c.Context(), 10*time.Second)
	defer cancel()
	pool := db.Get()

	id := c.Params("id")
	var cover any
	err = pool.QueryRow(ctx, `SELECT cover_image FROM kemenag_website.berita WHERE id = $1`, id).Scan(&cover)
	if err != nil {
		return response.Error(c, 404, "Berita tidak ditemukan.", "NOT_FOUND")
	}
	if cc, ok := cover.(string); ok && services.IsCMSStorageURL(cc) {
		go services.Storage.RemoveFileByPublicUrl(ctx, cc)
	}
	_, _ = pool.Exec(ctx, `DELETE FROM kemenag_website.berita WHERE id = $1`, id)

	services.Audit.Record(struct {
		Action      string
		Entity      string
		EntityID    string
		PerformedBy string
		Before      any
		After       any
		IP          any
	}{
		Action: "delete", Entity: "berita", EntityID: id, PerformedBy: session.UserEmail(), IP: adminIP(c),
	})
	services.CacheBust()
	InvalidateAdminBeritaCache()
	services.Realtime.BroadcastRefresh("berita")
	return response.OK(c, fiber.Map{"ok": true})
}

// AdminBeritaUploadImageHandler — POST /api/admin/berita/upload-image
func AdminBeritaUploadImageHandler(c *fiber.Ctx) error {
	if _, _, err := middleware.RequireAdmin(c, middleware.AdminAuthOpts{AllowEditor: true}); err != nil {
		return err
	}
	var body struct {
		ImageBase64 string `json:"image_base64"`
	}
	if err := c.BodyParser(&body); err != nil {
		return response.Error(c, 400, "Body tidak valid.", "INVALID_BODY")
	}
	if !strings.HasPrefix(body.ImageBase64, "data:image/") {
		return response.Error(c, 400, "Format gambar tidak valid.", "INVALID_IMAGE")
	}

	ctx, cancel := context.WithTimeout(c.Context(), 20*time.Second)
	defer cancel()
	_, publicURL, _, _, err := services.Storage.UploadBase64Image(ctx, body.ImageBase64, "berita-content", "inline")
	if err != nil {
		return response.Error(c, 400, "Gagal upload: "+err.Error(), "UPLOAD_FAILED")
	}
	return response.OK(c, fiber.Map{"ok": true, "url": publicURL, "path": services.ExtractStoragePath(publicURL)})
}

// ensureUniqueSlug port cms-utils (query unik + suffix -1..-100).
func ensureUniqueSlug(ctx context.Context, pool *pgxpool.Pool, table, baseSlug, currentID string) string {
	if table == "" || baseSlug == "" {
		return baseSlug
	}
	candidate := baseSlug
	for i := 1; i <= 100; i++ {
		var exists string
		var err error
		if currentID != "" {
			err = pool.QueryRow(ctx,
				"SELECT id FROM kemenag_website."+table+" WHERE slug = $1 AND id <> $2 LIMIT 1",
				candidate, currentID).Scan(&exists)
		} else {
			err = pool.QueryRow(ctx,
				"SELECT id FROM kemenag_website."+table+" WHERE slug = $1 LIMIT 1", candidate).Scan(&exists)
		}
		if err != nil {
			return candidate
		}
		candidate = baseSlug + "-" + itoa(i)
	}
	return baseSlug + "-" + itoa(int(time.Now().Unix()))
}