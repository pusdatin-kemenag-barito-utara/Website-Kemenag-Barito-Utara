package handlers

import (
	"context"
	"strings"
	"time"

	"kemenag-backend/internal/config"
	"kemenag-backend/internal/db"
	"kemenag-backend/internal/response"

	"github.com/gofiber/fiber/v2"
	"github.com/jackc/pgx/v5/pgxpool"
)

// beritaRow bentuk mentah berita.
type beritaRow struct {
	ID, Slug, Title, Excerpt, Category, Content string
	CoverImage                                  any
	IsPublished                                 bool
	PublishedAt, CreatedAt, UpdatedAt           *time.Time
	Views                                       int64
	CoverSizeKB                                 int
	Reactions                                   []int64
	AuthorName                                  any
}

func scanBeritaRow(scanner interface{ Scan(...any) error }, withContent bool) (*beritaRow, error) {
	r := &beritaRow{}
	if withContent {
		err := scanner.Scan(&r.ID, &r.Slug, &r.Title, &r.Excerpt, &r.Category, &r.Content,
			&r.CoverImage, &r.IsPublished, &r.PublishedAt, &r.CreatedAt, &r.UpdatedAt, &r.Views, &r.CoverSizeKB,
			&r.Reactions)
		return r, err
	}
	err := scanner.Scan(&r.ID, &r.Slug, &r.Title, &r.Excerpt, &r.Category,
		&r.CoverImage, &r.IsPublished, &r.PublishedAt, &r.CreatedAt, &r.UpdatedAt, &r.Views)
	return r, err
}

func beritaToMap(r *beritaRow, withContent bool) fiber.Map {
	m := fiber.Map{
		"id":           r.ID,
		"slug":         r.Slug,
		"title":        r.Title,
		"excerpt":      r.Excerpt,
		"category":     r.Category,
		"cover_image":  r.CoverImage,
		"is_published": r.IsPublished,
		"published_at": fmtTime(r.PublishedAt),
		"created_at":   fmtTime(r.CreatedAt),
		"updated_at":   fmtTime(r.UpdatedAt),
		"views":        r.Views,
	}
	if withContent {
		m["content"] = r.Content
		if len(r.Reactions) == 3 {
			m["reaction_bermanfaat"] = r.Reactions[0]
			m["reaction_inspiratif"] = r.Reactions[1]
			m["reaction_informatif"] = r.Reactions[2]
		}
	}
	return m
}

const beritaCols = `id, slug, title, excerpt, category, cover_image, is_published, published_at, created_at, updated_at, views`

// BeritaListHandler — GET /api/berita (list + pagination, cari berita.js)
func BeritaListHandler(c *fiber.Ctx) error {
	ctx, cancel := context.WithTimeout(c.Context(), 10*time.Second)
	defer cancel()
	pool := db.Get()
	if pool == nil {
		return response.Error(c, 503, "Database tidak tersedia", "DB_UNAVAILABLE")
	}

	page := c.QueryInt("page", 1)
	if page < 1 {
		page = 1
	}
	limit := c.QueryInt("limit", 18)
	if limit < 1 || limit > 100 {
		limit = 18
	}
	offset := (page - 1) * limit

	where := "is_published = true"
	args := []any{limit, offset}

	if category := strings.TrimSpace(c.Query("category")); category != "" && category != "all" {
		where += " AND category = $" + itoa(len(args)+1)
		args = append(args, category)
	}
	if q := strings.TrimSpace(c.Query("q")); q != "" {
		where += " AND (title ILIKE $" + itoa(len(args)+1) + " OR excerpt ILIKE $" + itoa(len(args)+1) + ")"
		args = append(args, "%"+q+"%")
	}
	if month := strings.TrimSpace(c.Query("month")); len(month) == 7 {
		where += " AND to_char(published_at AT TIME ZONE 'UTC', 'YYYY-MM') = $" + itoa(len(args)+1)
		args = append(args, month)
	}

	var total int64
	countQuery := "SELECT COUNT(*) FROM kemenag_website.berita WHERE " + where
	_ = pool.QueryRow(ctx, countQuery, args[2:]...).Scan(&total)

	sortBy := strings.TrimSpace(c.Query("sort"))
	var orderBy string
	switch sortBy {
	case "oldest":
		orderBy = "published_at ASC, created_at ASC"
	case "popular":
		orderBy = "views DESC, published_at DESC, created_at DESC"
	default:
		orderBy = "published_at DESC, created_at DESC"
	}

	query := "SELECT " + beritaCols + " FROM kemenag_website.berita WHERE " + where +
		" ORDER BY " + orderBy + " LIMIT $1 OFFSET $2"
	rows, err := pool.Query(ctx, query, args...)
	if err != nil {
		return response.Error(c, 500, "Gagal mengambil berita", "DB_ERROR")
	}
	defer rows.Close()

	list := []fiber.Map{}
	for rows.Next() {
		r, err := scanBeritaRow(rows, false)
		if err != nil {
			continue
		}
		list = append(list, beritaToMap(r, false))
	}

	response.CDNCacheControl(c, 60, 120)
	return c.JSON(fiber.Map{
		"items": list,
		"total": total,
		"page":  page,
		"limit": limit,
	})
}

// BeritaMonthsHandler — GET /api/berita/months (bulan publikasi berita)
func BeritaMonthsHandler(c *fiber.Ctx) error {
	ctx, cancel := context.WithTimeout(c.Context(), 8*time.Second)
	defer cancel()
	pool := db.Get()
	if pool == nil {
		return response.Error(c, 503, "Database tidak tersedia", "DB_UNAVAILABLE")
	}
	rows, err := pool.Query(ctx, `
		SELECT DISTINCT to_char(published_at, 'YYYY-MM') AS month_key
		FROM kemenag_website.berita
		WHERE is_published = true AND published_at IS NOT NULL
		ORDER BY month_key DESC`)
	if err != nil {
		return response.Error(c, 500, "Gagal mengambil daftar bulan.", "DB_ERROR")
	}
	defer rows.Close()

	formatter := newIntlMonth()
	var months []fiber.Map
	for rows.Next() {
		var key string
		if err := rows.Scan(&key); err != nil || len(key) != 7 {
			continue
		}
		t, err := time.Parse("2006-01", key)
		if err != nil {
			continue
		}
		months = append(months, fiber.Map{
			"value": key,
			"label": formatter(t),
		})
	}
	response.CDNCacheControl(c, 300, 600)
	return c.JSON(fiber.Map{"months": months})
}

func newIntlMonth() func(time.Time) string {
	return func(t time.Time) string {
		names := []string{
			"Januari", "Februari", "Maret", "April", "Mei", "Juni",
			"Juli", "Agustus", "September", "Oktober", "November", "Desember",
		}
		return names[t.Month()-1] + " " + itoa(t.Year())
	}
}

// BeritaDetailHandler — GET /api/berita/:slug (detail + reactions + author)
func BeritaDetailHandler(c *fiber.Ctx) error {
	ctx, cancel := context.WithTimeout(c.Context(), 10*time.Second)
	defer cancel()
	pool := db.Get()
	if pool == nil {
		return response.Error(c, 503, "Database tidak tersedia", "DB_UNAVAILABLE")
	}
	slug := strings.TrimSpace(c.Params("slug"))

	var r beritaRow
	var reactB, reactI, reactN int64
	err := pool.QueryRow(ctx, `
		SELECT id, slug, title, excerpt, category, content, cover_image, is_published,
		       published_at, created_at, updated_at, views, cover_size_kb,
		       reaction_bermanfaat, reaction_inspiratif, reaction_informatif
		FROM kemenag_website.berita WHERE slug = $1 AND is_published = true LIMIT 1`, slug).
		Scan(&r.ID, &r.Slug, &r.Title, &r.Excerpt, &r.Category, &r.Content, &r.CoverImage, &r.IsPublished,
			&r.PublishedAt, &r.CreatedAt, &r.UpdatedAt, &r.Views, &r.CoverSizeKB,
			&reactB, &reactI, &reactN)
	if err != nil {
		return response.Error(c, 404, "Berita tidak ditemukan.", "NOT_FOUND")
	}
	r.Reactions = []int64{reactB, reactI, reactN}

	// author name
	var authorName any
	_ = pool.QueryRow(ctx, `
		SELECT p.name FROM kemenag_website.berita b
		LEFT JOIN kemenag_pusdatin.profiles p ON p.id = b.author_id
		WHERE b.id = $1`, r.ID).Scan(&authorName)

	m := beritaToMap(&r, true)
	m["author"] = authorName

	// berita terkait
	related, _ := getRelatedBerita(ctx, pool, r.ID, r.Category, 5)
	m["related"] = related
	// adjacent (prev/next)
	prev, next := getAdjacentBerita(ctx, pool, r.PublishedAt, r.ID)
	m["prev"] = prev
	m["next"] = next

	return response.JSON(c, 200, fiber.Map{"berita": m})
}

func getRelatedBerita(ctx context.Context, pool *pgxpool.Pool, id, category string, limit int) ([]fiber.Map, error) {
	rows, err := pool.Query(ctx, `
		SELECT `+beritaCols+` FROM kemenag_website.berita
		WHERE is_published = true AND id <> $1 AND category = $2
		ORDER BY published_at DESC LIMIT $3`, id, category, limit)
	if err != nil {
		return nil, err
	}
	defer rows.Close()
	out := []fiber.Map{}
	for rows.Next() {
		r, err := scanBeritaRow(rows, false)
		if err == nil {
			out = append(out, beritaToMap(r, false))
		}
	}
	return out, nil
}

func getAdjacentBerita(ctx context.Context, pool *pgxpool.Pool, publishedAt *time.Time, id string) (any, any) {
	var prev, next any
	if publishedAt == nil {
		return nil, nil
	}
	var pID, pSlug, pTitle, pCategory string
	var pCover any
	var pDate *time.Time
	err := pool.QueryRow(ctx, `
		SELECT id, slug, title, category, cover_image, published_at FROM kemenag_website.berita
		WHERE is_published = true AND published_at < $1 AND id <> $2
		ORDER BY published_at DESC LIMIT 1`, publishedAt.Format(time.RFC3339), id).
		Scan(&pID, &pSlug, &pTitle, &pCategory, &pCover, &pDate)
	if err == nil {
		prev = fiber.Map{"id": pID, "slug": pSlug, "title": pTitle, "category": pCategory,
			"cover_image": pCover, "published_at": fmtTime(pDate)}
	}

	var nID, nSlug, nTitle, nCategory string
	var nCover any
	var nDate *time.Time
	err = pool.QueryRow(ctx, `
		SELECT id, slug, title, category, cover_image, published_at FROM kemenag_website.berita
		WHERE is_published = true AND published_at > $1 AND id <> $2
		ORDER BY published_at ASC LIMIT 1`, publishedAt.Format(time.RFC3339), id).
		Scan(&nID, &nSlug, &nTitle, &nCategory, &nCover, &nDate)
	if err == nil {
		next = fiber.Map{"id": nID, "slug": nSlug, "title": nTitle, "category": nCategory,
			"cover_image": nCover, "published_at": fmtTime(nDate)}
	}
	return prev, next
}

// BeritaViewHandler — POST /api/berita/:slug/view
func BeritaViewHandler(c *fiber.Ctx) error {
	ctx, cancel := context.WithTimeout(c.Context(), 5*time.Second)
	defer cancel()
	pool := db.Get()
	if pool == nil {
		return response.Error(c, 503, "Database tidak tersedia", "DB_UNAVAILABLE")
	}
	slug := strings.TrimSpace(c.Params("slug"))
	var newViews int64
	err := pool.QueryRow(ctx,
		`UPDATE kemenag_website.berita SET views = views + 1 WHERE slug = $1 AND is_published = true RETURNING views`, slug).Scan(&newViews)
	if err != nil {
		return response.Error(c, 500, "Gagal memperbarui views", "DB_ERROR")
	}
	return response.OK(c, fiber.Map{"ok": true, "views": newViews})
}

// BeritaReactGetHandler — GET /api/berita/:slug/react
func BeritaReactGetHandler(c *fiber.Ctx) error {
	ctx, cancel := context.WithTimeout(c.Context(), 5*time.Second)
	defer cancel()
	pool := db.Get()
	if pool == nil {
		return response.Error(c, 503, "Database tidak tersedia", "DB_UNAVAILABLE")
	}
	slug := strings.TrimSpace(c.Params("slug"))
	var b, i, inf int
	err := pool.QueryRow(ctx, `
		SELECT COALESCE(reaction_bermanfaat, 0), COALESCE(reaction_inspiratif, 0), COALESCE(reaction_informatif, 0)
		FROM kemenag_website.berita WHERE slug = $1`, slug).Scan(&b, &i, &inf)
	if err != nil {
		return response.Error(c, 404, "Berita tidak ditemukan.", "NOT_FOUND")
	}
	return response.OK(c, fiber.Map{
		"bermanfaat": b, "inspiratif": i, "informatif": inf,
		"reaction_bermanfaat": b, "reaction_inspiratif": i, "reaction_informatif": inf,
	})
}

// BeritaReactHandler — POST /api/berita/:slug/react
func BeritaReactHandler(c *fiber.Ctx) error {
	ctx, cancel := context.WithTimeout(c.Context(), 5*time.Second)
	defer cancel()
	pool := db.Get()
	if pool == nil {
		return response.Error(c, 503, "Database tidak tersedia", "DB_UNAVAILABLE")
	}
	slug := strings.TrimSpace(c.Params("slug"))

	var body struct {
		Type         string `json:"type"`
		Action       string `json:"action"`
		PreviousType string `json:"previousType"`
	}
	if err := c.BodyParser(&body); err != nil {
		return response.Error(c, 400, "Body tidak valid.", "INVALID_BODY")
	}
	if body.Type != "bermanfaat" && body.Type != "inspiratif" && body.Type != "informatif" {
		return response.Error(c, 400, "Tipe reaksi tidak valid.", "INVALID_TYPE")
	}

	col := "reaction_" + body.Type
	delta := 1
	if body.Action == "remove" {
		delta = -1
	}
	if body.Action == "switch" && (body.PreviousType == "bermanfaat" || body.PreviousType == "inspiratif" || body.PreviousType == "informatif") {
		prevCol := "reaction_" + body.PreviousType
		_, _ = pool.Exec(ctx,
			"UPDATE kemenag_website.berita SET "+prevCol+" = GREATEST(0, "+prevCol+" - 1) WHERE slug = $1", slug)
	}

	_, err := pool.Exec(ctx,
		"UPDATE kemenag_website.berita SET "+col+" = GREATEST(0, "+col+" + $1) WHERE slug = $2",
		delta, slug)
	if err != nil {
		return response.Error(c, 500, "Gagal memperbarui reaksi", "DB_ERROR")
	}

	var b, i, inf int
	_ = pool.QueryRow(ctx, `
		SELECT COALESCE(reaction_bermanfaat, 0), COALESCE(reaction_inspiratif, 0), COALESCE(reaction_informatif, 0)
		FROM kemenag_website.berita WHERE slug = $1`, slug).Scan(&b, &i, &inf)
	return response.OK(c, fiber.Map{
		"bermanfaat": b, "inspiratif": i, "informatif": inf,
		"reaction_bermanfaat": b, "reaction_inspiratif": i, "reaction_informatif": inf,
	})
}

// GaleriPublicHandler — GET /api/galeri
func GaleriPublicHandler(c *fiber.Ctx) error {
	ctx, cancel := context.WithTimeout(c.Context(), 8*time.Second)
	defer cancel()
	pool := db.Get()
	if pool == nil {
		return response.Error(c, 503, "Database tidak tersedia", "DB_UNAVAILABLE")
	}
	page := c.QueryInt("page", 1)
	if page < 1 {
		page = 1
	}
	limit := c.QueryInt("limit", 24)
	if limit < 1 || limit > 100 {
		limit = 24
	}
	offset := (page - 1) * limit

	var total int64
	_ = pool.QueryRow(ctx, `SELECT COUNT(*) FROM kemenag_website.galeri WHERE is_published = true`).Scan(&total)

	rows, err := pool.Query(ctx, `
		SELECT id, title, image_url, link_url, source_type, source_id, is_published, published_at, created_at
		FROM kemenag_website.galeri WHERE is_published = true
		ORDER BY published_at DESC LIMIT $1 OFFSET $2`, limit, offset)
	if err != nil {
		return response.Error(c, 500, "Gagal mengambil galeri", "DB_ERROR")
	}
	defer rows.Close()

	list := []fiber.Map{}
	for rows.Next() {
		var id, title, imageURL string
		var linkURL, sourceType, sourceID, publishedAt, createdAt any
		var isPublished bool
		if err := rows.Scan(&id, &title, &imageURL, &linkURL, &sourceType, &sourceID, &isPublished, &publishedAt, &createdAt); err != nil {
			continue
		}
		if strings.HasPrefix(imageURL, "/storage/") {
			imageURL = config.Cfg.SupabaseURL + "/storage/v1/object/public/cms-media/" + strings.TrimPrefix(imageURL, "/storage/")
		} else if strings.HasPrefix(imageURL, "/api/storage/media/") {
			imageURL = config.Cfg.SupabaseURL + "/storage/v1/object/public/cms-media/" + strings.TrimPrefix(imageURL, "/api/storage/media/")
		}
		list = append(list, fiber.Map{
			"id": id, "title": title, "image_url": imageURL, "link_url": linkURL,
			"source_type": sourceType, "source_id": sourceID, "is_published": isPublished,
			"published_at": publishedAt, "created_at": createdAt,
		})
	}

	response.CDNCacheControl(c, 300, 600)
	return c.JSON(fiber.Map{"items": list, "total": total, "page": page, "limit": limit})
}

func itoa(n int) string {
	if n == 0 {
		return "0"
	}
	neg := n < 0
	if neg {
		n = -n
	}
	var buf [20]byte
	i := len(buf)
	for n > 0 {
		i--
		buf[i] = byte('0' + n%10)
		n /= 10
	}
	if neg {
		i--
		buf[i] = '-'
	}
	return string(buf[i:])
}
