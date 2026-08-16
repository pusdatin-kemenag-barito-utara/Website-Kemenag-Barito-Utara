package handlers

import (
	"context"
	"encoding/json"
	"fmt"
	"net/http"
	"net/url"
	"regexp"
	"strings"
	"time"

	"kemenag-backend/internal/db"
	"kemenag-backend/internal/lib"
	"kemenag-backend/internal/middleware"
	"kemenag-backend/internal/response"
	"kemenag-backend/internal/services"

	"github.com/gofiber/fiber/v2"
)

var youtubeIDRe = regexp.MustCompile(`(?:youtube\.com/(?:watch\?v=|embed/|shorts/|live/)|youtu\.be/)([A-Za-z0-9_-]{6,15})`)

func extractYoutubeID(raw string) string {
	raw = strings.TrimSpace(raw)
	if m := youtubeIDRe.FindStringSubmatch(raw); len(m) > 1 {
		return m[1]
	}
	if raw != "" && len(raw) <= 15 && !strings.Contains(raw, "/") && !strings.Contains(raw, ".") {
		return raw
	}
	return ""
}

func fetchYoutubeInfo(videoID string) (title string, thumb string, err error) {
	u := fmt.Sprintf("https://www.youtube.com/oembed?url=%s&format=json", url.QueryEscape("https://www.youtube.com/watch?v="+videoID))
	req, err := http.NewRequest(http.MethodGet, u, nil)
	if err != nil {
		return "", "", err
	}
	req.Header.Set("User-Agent", "Mozilla/5.0 (KemenagBarut/1.0)")
	client := &http.Client{Timeout: 10 * time.Second}
	resp, err := client.Do(req)
	if err != nil {
		return "", "", err
	}
	defer resp.Body.Close()
	if resp.StatusCode != http.StatusOK {
		return "", "", fmt.Errorf("oembed status %d", resp.StatusCode)
	}
	var out struct {
		Title       string `json:"title"`
		AuthorName  string `json:"author_name"`
		ThumbnailURL string `json:"thumbnail_url"`
	}
	if err := json.NewDecoder(resp.Body).Decode(&out); err != nil {
		return "", "", err
	}
	thumb = out.ThumbnailURL
	if thumb == "" {
		thumb = "https://i.ytimg.com/vi/" + videoID + "/hqdefault.jpg"
	}
	return out.Title, thumb, nil
}

// AdminYoutubeListHandler — GET /api/admin/youtube
func AdminYoutubeListHandler(c *fiber.Ctx) error {
	if _, _, err := middleware.RequireAdmin(c, middleware.AdminAuthOpts{AllowEditor: true}); err != nil {
		return err
	}
	ctx, cancel := context.WithTimeout(c.Context(), 8*time.Second)
	defer cancel()
	pool := db.Get()

	rows, err := pool.Query(ctx, `
		SELECT id, title, youtube_id, is_published, sort_order, created_at, updated_at
		FROM kemenag_website.youtube_videos
		ORDER BY is_published DESC, sort_order ASC, updated_at DESC`)
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
	return response.OK(c, list)
}

// AdminYoutubeCreateHandler — POST /api/admin/youtube
func AdminYoutubeCreateHandler(c *fiber.Ctx) error {
	session, _, err := middleware.RequireAdmin(c, middleware.AdminAuthOpts{Permission: "youtube:manage"})
	if err != nil {
		return err
	}
	var body fiber.Map
	if err := c.BodyParser(&body); err != nil {
		return response.Error(c, 400, "Body tidak valid.", "INVALID_BODY")
	}
	rawURL := lib.CleanString(body["url"], 2000)
	if rawURL == "" {
		rawURL = lib.CleanString(body["youtube_id"], 200)
	}
	videoID := extractYoutubeID(rawURL)
	if videoID == "" {
		return response.Error(c, 400, "URL video YouTube tidak valid.", "VALIDATION_ERROR")
	}

	title := lib.CleanString(body["title"], 250)
	if title == "" {
		t, _, ierr := fetchYoutubeInfo(videoID)
		if ierr == nil && t != "" {
			title = t
		}
	}
	if title == "" {
		title = "Video YouTube"
	}

	ctx, cancel := context.WithTimeout(c.Context(), 15*time.Second)
	defer cancel()
	pool := db.Get()

	var exists int
	_ = pool.QueryRow(ctx, `SELECT 1 FROM kemenag_website.youtube_videos WHERE youtube_id = $1`, videoID).Scan(&exists)
	if exists == 1 {
		return response.Error(c, 409, "Video sudah pernah ditambahkan.", "DUPLICATE_VIDEO")
	}

	var newID string
	err = pool.QueryRow(ctx, `
		INSERT INTO kemenag_website.youtube_videos (title, youtube_id, is_published, sort_order)
		VALUES ($1,$2,$3,$4) RETURNING id`,
		title, videoID, lib.ToBool(body["is_published"]), lib.ToInt(body["sort_order"])).Scan(&newID)
	if err != nil {
		return response.Error(c, 500, "Gagal menyimpan video.", "DB_ERROR")
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
		Action: "create", Entity: "youtube_videos", EntityID: newID, PerformedBy: session.UserEmail(),
		After: fiber.Map{"title": title}, IP: adminIP(c),
	})
	services.CacheBust()
	services.Realtime.BroadcastRefresh("youtube")
	return response.OK(c, fiber.Map{"id": newID, "title": title})
}

// AdminYoutubeInfoHandler — GET /api/admin/youtube/info?url=... or ?id=...
func AdminYoutubeInfoHandler(c *fiber.Ctx) error {
	if _, _, err := middleware.RequireAdmin(c, middleware.AdminAuthOpts{AllowEditor: true}); err != nil {
		return err
	}
	raw := c.Query("url")
	if raw == "" {
		raw = c.Query("id")
	}
	videoID := extractYoutubeID(raw)
	if videoID == "" {
		return response.Error(c, 400, "URL video YouTube tidak valid.", "VALIDATION_ERROR")
	}
	title, thumb, err := fetchYoutubeInfo(videoID)
	if err != nil {
		return response.Error(c, 422, "Gagal mengambil info video: "+err.Error(), "YT_FETCH_FAILED")
	}
	return response.OK(c, fiber.Map{"youtube_id": videoID, "title": title, "thumbnail": thumb})
}

// AdminYoutubeUpdateHandler — PATCH /api/admin/youtube/:id
func AdminYoutubeUpdateHandler(c *fiber.Ctx) error {
	session, _, err := middleware.RequireAdmin(c, middleware.AdminAuthOpts{Permission: "youtube:manage"})
	if err != nil {
		return err
	}
	var body fiber.Map
	if err := c.BodyParser(&body); err != nil {
		return response.Error(c, 400, "Body tidak valid.", "INVALID_BODY")
	}
	id := c.Params("id")

	ctx, cancel := context.WithTimeout(c.Context(), 10*time.Second)
	defer cancel()
	pool := db.Get()

	title := lib.CleanString(body["title"], 250)
	if title != "" {
		_, _ = pool.Exec(ctx, `UPDATE kemenag_website.youtube_videos SET title = $1, updated_at = now() WHERE id = $2`, title, id)
	}
	if v, ok := body["is_published"]; ok {
		_, _ = pool.Exec(ctx, `UPDATE kemenag_website.youtube_videos SET is_published = $1, updated_at = now() WHERE id = $2`, lib.ToBool(v), id)
	}
	if v, ok := body["sort_order"]; ok {
		_, _ = pool.Exec(ctx, `UPDATE kemenag_website.youtube_videos SET sort_order = $1, updated_at = now() WHERE id = $2`, lib.ToInt(v), id)
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
		Action: "update", Entity: "youtube_videos", EntityID: id, PerformedBy: session.UserEmail(),
		After: fiber.Map{"title": title}, IP: adminIP(c),
	})
	services.CacheBust()
	services.Realtime.BroadcastRefresh("youtube")
	return response.OK(c, fiber.Map{"ok": true})
}

// AdminYoutubeDeleteHandler — DELETE /api/admin/youtube/:id
func AdminYoutubeDeleteHandler(c *fiber.Ctx) error {
	session, _, err := middleware.RequireAdmin(c, middleware.AdminAuthOpts{Permission: "youtube:manage"})
	if err != nil {
		return err
	}
	id := c.Params("id")
	ctx, cancel := context.WithTimeout(c.Context(), 10*time.Second)
	defer cancel()
	pool := db.Get()
	_, _ = pool.Exec(ctx, `DELETE FROM kemenag_website.youtube_videos WHERE id = $1`, id)

	services.Audit.Record(struct {
		Action      string
		Entity      string
		EntityID    string
		PerformedBy string
		Before      any
		After       any
		IP          any
	}{
		Action: "delete", Entity: "youtube_videos", EntityID: id, PerformedBy: session.UserEmail(), IP: adminIP(c),
	})
	services.CacheBust()
	services.Realtime.BroadcastRefresh("youtube")
	return response.OK(c, fiber.Map{"ok": true})
}