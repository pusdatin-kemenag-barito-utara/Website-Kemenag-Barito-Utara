package handlers

import (
	"context"
	"encoding/json"
	"fmt"
	"sort"
	"strings"
	"sync"
	"time"

	"kemenag-backend/internal/cache"
	"kemenag-backend/internal/db"
	"kemenag-backend/internal/response"

	"github.com/gofiber/fiber/v2"
	"github.com/jackc/pgx/v5/pgxpool"
)

type homeBeritaGroup struct {
	Category   string      `json:"category"`
	Items      []fiber.Map `json:"items"`
	TotalCount int64       `json:"totalCount"`
}

func queryHomeBerita(ctx context.Context, pool *pgxpool.Pool, where string, order string, args ...any) []fiber.Map {
	rows, err := pool.Query(ctx, `
		SELECT `+beritaCols+` FROM kemenag_website.berita
		WHERE `+where+` ORDER BY `+order, args...)
	if err != nil {
		return []fiber.Map{}
	}
	defer rows.Close()
	out := []fiber.Map{}
	for rows.Next() {
		r, err := scanBeritaRow(rows, false)
		if err == nil {
			out = append(out, beritaToMap(r, false))
		}
	}
	return out
}

// HomeHandler — GET /api/home (agregat data beranda, paritas beranda/page.js).
func HomeHandler(c *fiber.Ctx) error {
	ctx, cancel := context.WithTimeout(c.Context(), 15*time.Second)
	defer cancel()

	// 1. Cek cache
	const cacheKey = "home:aggregate"
	if cached, err := cache.Get(ctx, cacheKey); err == nil && cached != "" {
		c.Set("Content-Type", "application/json")
		response.CDNCacheControl(c, 300, 600)
		return c.SendString(cached)
	}

	pool := db.Get()
	if pool == nil {
		return response.Error(c, 503, "Database tidak tersedia", "DB_UNAVAILABLE")
	}

	var (
		wg           sync.WaitGroup
		hariIni      []fiber.Map
		latest       []fiber.Map
		nasional     []fiber.Map
		popular      []fiber.Map
		grouped      []homeBeritaGroup
		galeri       []fiber.Map
		slides       []fiber.Map
		testimonials []fiber.Map
		ptsp         []fiber.Map
		totalBerita  int64
		totalPtsp    int64
	)

	// Jalankan sub-query secara paralel (mengurangi latency 12 query berurutan)
	wg.Add(8)

	// 1) Hari ini, Latest, Nasional, Popular
	go func() {
		defer wg.Done()
		hariIni = queryHomeBerita(ctx, pool, "is_published = true", "published_at DESC, created_at DESC LIMIT 3")
		latest = queryHomeBerita(ctx, pool, "is_published = true AND category IN ('Umum','Kegiatan')", "published_at DESC, created_at DESC LIMIT 6")
		nasional = queryHomeBerita(ctx, pool, "is_published = true AND category = 'Nasional'", "published_at DESC, created_at DESC LIMIT 3")
		popular = queryHomeBerita(ctx, pool, "is_published = true AND published_at >= NOW() - INTERVAL '14 days'", "views DESC, published_at DESC LIMIT 5")
	}()

	// 2) Grouped per kategori
	go func() {
		defer wg.Done()
		gList := []homeBeritaGroup{}
		rows, err := pool.Query(ctx, `
			SELECT `+beritaCols+` FROM kemenag_website.berita
			WHERE is_published = true AND category NOT IN ('Umum','Kegiatan','Nasional')
			ORDER BY published_at DESC, created_at DESC LIMIT 60`)
		if err == nil {
			defer rows.Close()
			counts := map[string]int64{}
			countRows, cerr := pool.Query(ctx, `SELECT category, COUNT(*)::bigint FROM kemenag_website.berita WHERE is_published = true GROUP BY category`)
			if cerr == nil {
				for countRows.Next() {
					var cat string
					var n int64
					if countRows.Scan(&cat, &n) == nil {
						counts[cat] = n
					}
				}
				countRows.Close()
			}

			byCat := map[string][]fiber.Map{}
			for rows.Next() {
				r, err := scanBeritaRow(rows, false)
				if err != nil {
					continue
				}
				m := beritaToMap(r, false)
				cat := strings.TrimSpace(stringify(m["category"]))
				if len(byCat[cat]) < 3 {
					byCat[cat] = append(byCat[cat], m)
				}
			}
			for cat, items := range byCat {
				gList = append(gList, homeBeritaGroup{
					Category: cat, Items: items, TotalCount: counts[cat],
				})
			}
			sort.SliceStable(gList, func(i, j int) bool {
				w := func(cat string) int {
					l := strings.ToLower(cat)
					switch {
					case strings.Contains(l, "tata usaha") || strings.Contains(l, "subbag"):
						return 1
					case strings.Contains(l, "madrasah"):
						return 2
					case strings.Contains(l, "diniyah") || strings.Contains(l, "pontren"):
						return 3
					case strings.Contains(l, "bimas islam"):
						return 4
					case strings.Contains(l, "bimas kristen"):
						return 5
					case strings.Contains(l, "zakat") || strings.Contains(l, "wakaf"):
						return 6
					case strings.Contains(l, "hindu"):
						return 7
					case strings.Contains(l, "urusan agama") || strings.Contains(l, "kua"):
						return 8
					}
					return 99
				}
				wi, wj := w(gList[i].Category), w(gList[j].Category)
				if wi != wj {
					return wi < wj
				}
				return gList[i].Category < gList[j].Category
			})
		}
		grouped = gList
	}()

	// 3) Galeri
	go func() {
		defer wg.Done()
		gList := []fiber.Map{}
		rows, err := pool.Query(ctx, `
			SELECT id, title, image_url, link_url, published_at
			FROM kemenag_website.galeri
			WHERE is_published = true
			ORDER BY published_at DESC, created_at DESC LIMIT 12`)
		if err == nil {
			defer rows.Close()
			for rows.Next() {
				var id, title, imageURL string
				var linkURL any
				var publishedAt any
				if rows.Scan(&id, &title, &imageURL, &linkURL, &publishedAt) == nil {
					gList = append(gList, fiber.Map{
						"id": id, "title": title, "image_url": imageURL,
						"imageUrl": imageURL, "link_url": linkURL,
						"published_at": publishedAt, "publishedAt": publishedAt,
					})
				}
			}
		}
		galeri = gList
	}()

	// 4) Slides
	go func() {
		defer wg.Done()
		sList := []fiber.Map{}
		rows, err := pool.Query(ctx, `
			SELECT id, title, caption, image_url, category, is_published, sort_order, updated_at
			FROM kemenag_website.homepage_slides
			WHERE is_published = true
			ORDER BY sort_order ASC, updated_at DESC`)
		if err == nil {
			defer rows.Close()
			for rows.Next() {
				var id, title, caption, imageURL, category string
				var isPublished bool
				var sortOrder int
				var updatedAt *time.Time
				if rows.Scan(&id, &title, &caption, &imageURL, &category, &isPublished, &sortOrder, &updatedAt) == nil {
					sList = append(sList, fiber.Map{
						"id": id, "title": title, "caption": caption, "image_url": imageURL,
						"category": category, "is_published": isPublished, "sort_order": sortOrder,
						"updated_at": updatedAt,
					})
				}
			}
		}
		slides = sList
	}()

	// 5) Testimonials
	go func() {
		defer wg.Done()
		tList := []fiber.Map{}
		rows, err := pool.Query(ctx, `
			SELECT id, name, role, content, rating, avatar, sort_order
			FROM kemenag_website.testimonials
			WHERE is_active = true
			ORDER BY sort_order ASC, created_at ASC`)
		if err == nil {
			defer rows.Close()
			for rows.Next() {
				var id, name, role, content string
				var rating, sortOrder int
				var avatar any
				if rows.Scan(&id, &name, &role, &content, &rating, &avatar, &sortOrder) == nil {
					tList = append(tList, fiber.Map{
						"id": id, "name": name, "role": role, "content": content,
						"rating": rating, "avatar": avatar, "sort_order": sortOrder,
					})
				}
			}
		}
		testimonials = tList
	}()

	// 6) PTSP Services
	go func() {
		defer wg.Done()
		pList := []fiber.Map{}
		rows, err := pool.Query(ctx, `
			SELECT id, name, slug
			FROM kemenag_ptsp.ptsp_services
			WHERE is_active = true AND category = 'public'
			ORDER BY sort_order ASC`)
		if err == nil {
			defer rows.Close()
			for rows.Next() {
				var id int64
				var name, slug string
				if rows.Scan(&id, &name, &slug) == nil {
					pList = append(pList, fiber.Map{"id": stringify(id), "name": name, "slug": slug})
				}
			}
		}
		ptsp = pList
	}()

	// 7) Counts
	go func() {
		defer wg.Done()
		_ = pool.QueryRow(ctx, `SELECT COUNT(*) FROM kemenag_website.berita WHERE is_published = true`).Scan(&totalBerita)
	}()

	go func() {
		defer wg.Done()
		_ = pool.QueryRow(ctx, `SELECT COUNT(*) FROM kemenag_ptsp.ptsp_services WHERE is_active = true`).Scan(&totalPtsp)
	}()

	wg.Wait()

	payload := fiber.Map{
		"hariIni":      hariIni,
		"latest":       latest,
		"nasional":     nasional,
		"popular":      popular,
		"grouped":      grouped,
		"galeri":       galeri,
		"slides":       slides,
		"testimonials": testimonials,
		"ptsp":         ptsp,
		"totalBerita":  totalBerita,
		"totalPtsp":    totalPtsp,
		"stats": fiber.Map{
			"totalBerita": totalBerita,
			"totalPtsp":   totalPtsp,
		},
	}

	if jsonBytes, err := json.Marshal(payload); err == nil {
		_ = cache.Set(ctx, cacheKey, string(jsonBytes), 60*time.Second)
	}

	response.CDNCacheControl(c, 300, 600)
	return c.JSON(payload)
}

// YoutubePublicHandler — GET /api/youtube (video published untuk halaman video).
func YoutubePublicHandler(c *fiber.Ctx) error {
	ctx, cancel := context.WithTimeout(c.Context(), 8*time.Second)
	defer cancel()

	const cacheKey = "home:youtube"
	if cached, err := cache.Get(ctx, cacheKey); err == nil && cached != "" {
		c.Set("Content-Type", "application/json")
		response.CDNCacheControl(c, 300, 600)
		return c.SendString(cached)
	}

	pool := db.Get()
	if pool == nil {
		return response.Error(c, 503, "Database tidak tersedia", "DB_UNAVAILABLE")
	}
	rows, err := pool.Query(ctx, `
		SELECT id, title, youtube_id, is_published, sort_order, created_at, updated_at
		FROM kemenag_website.youtube_videos
		WHERE is_published = true
		ORDER BY sort_order ASC, updated_at DESC`)
	if err != nil {
		return response.Error(c, 500, "Gagal memuat video.", "DB_ERROR")
	}
	defer rows.Close()

	list := []fiber.Map{}
	for rows.Next() {
		var id, title, youtubeID string
		var isPublished bool
		var sortOrder int
		var createdAt, updatedAt *time.Time
		if err := rows.Scan(&id, &title, &youtubeID, &isPublished, &sortOrder, &createdAt, &updatedAt); err != nil {
			continue
		}
		list = append(list, fiber.Map{
			"id": id, "title": title, "youtube_id": youtubeID, "is_published": isPublished,
			"sort_order": sortOrder, "created_at": fmtTime(createdAt), "updated_at": fmtTime(updatedAt),
		})
	}

	if jsonBytes, err := json.Marshal(list); err == nil {
		_ = cache.Set(ctx, cacheKey, string(jsonBytes), 120*time.Second)
	}

	response.CDNCacheControl(c, 300, 600)
	return c.JSON(list)
}

func stringify(v any) string {
	switch t := v.(type) {
	case string:
		return t
	case int64:
		return itoa(int(t))
	case int:
		return itoa(t)
	case float64:
		return fmtFloat(t)
	default:
		return ""
	}
}

func fmtFloat(f float64) string {
	if f == float64(int64(f)) {
		return itoa(int(f))
	}
	return strings.TrimRight(strings.TrimRight(fmt.Sprintf("%f", f), "0"), ".")
}