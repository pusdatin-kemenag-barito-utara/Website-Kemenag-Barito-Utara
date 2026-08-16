package handlers

import (
	"context"
	"encoding/json"
	"fmt"
	"math"
	"strings"
	"sync"
	"time"

	"kemenag-backend/internal/cache"
	"kemenag-backend/internal/config"
	"kemenag-backend/internal/db"
	"kemenag-backend/internal/middleware"
	"kemenag-backend/internal/response"
	"kemenag-backend/internal/services"

	"github.com/gofiber/fiber/v2"
)

// sessionPublic mengubah SessionContext jadi map publik (tanpa user token).
func sessionPublic(s *middleware.SessionContext) fiber.Map {	profile := fiber.Map{}
	if s.Profile != nil {
		for k, v := range s.Profile {
			profile[k] = v
		}
	}
	user := fiber.Map{}
	if s.User != nil {
		user = fiber.Map{
			"id":            s.User.ID,
			"email":         s.User.Email,
			"app_metadata":  s.User.AppMetadata,
			"user_metadata": s.User.UserMetadata,
		}
	}
	return fiber.Map{
		"user":            user,
		"profile":         profile,
		"claims":          user["app_metadata"],
		"role":            s.Role,
		"isAuthenticated": s.IsAuthenticated,
		"isAdmin":         s.IsAdmin,
		"isEditor":        s.IsEditor,
		"hasAdminAccess":  s.HasAdminAccess,
	}
}

// AdminSummaryHandler — GET /api/admin
func AdminSummaryHandler(c *fiber.Ctx) error {
	session, pc, err := middleware.RequireAdmin(c, middleware.AdminAuthOpts{AllowEditor: true})
	if err != nil {
		return err
	}
	return response.OK(c, fiber.Map{
		"user": sessionPublic(session),
		"permissions": fiber.Map{
			"isAdmin":  pc.IsAdmin || pc.IsSuperAdmin,
			"isEditor": pc.IsEditor,
			"list":     pc.Permissions,
		},
	})
}

// AdminSessionHandler — GET /api/admin/session
// Kontrak = route Next /api/admin/session: {authenticated, user, permissions}.
func AdminSessionHandler(c *fiber.Ctx) error {
	session := middleware.LoadSession(c)

	user := fiber.Map(nil)
	if session.IsAuthenticated {
		user = fiber.Map{
			"id":         session.ProfileID(),
			"email":      session.UserEmail(),
			"full_name":  profileStr(session.Profile, "name"),
			"role":       session.Role,
			"avatar_url": profileStr(session.Profile, "avatar_url"),
		}
	}

	return response.OK(c, fiber.Map{
		"authenticated": session.IsAuthenticated,
		"user":          user,
		"permissions": fiber.Map{
			"isAdmin":            session.IsAdmin,
			"isEditor":           session.IsEditor,
			"hasAdminPanelAccess": session.HasAdminAccess,
			"role":               session.Role,
		},
	})
}

// AdminMyPermissionsHandler — GET /api/admin/my-permissions
// Kontrak = route Next: {ok, permissionContext: {role, email, isAdmin, isEditor, ...}}.
func AdminMyPermissionsHandler(c *fiber.Ctx) error {
_, pc, err := middleware.RequireAdmin(c, middleware.AdminAuthOpts{AllowEditor: true})
	if err != nil {
		return err
	}
	return response.OK(c, fiber.Map{
		"permissionContext": fiber.Map{
			"role":          pc.Role,
			"email":         pc.Email,
			"isSuperAdmin":  pc.IsSuperAdmin,
			"isAdmin":       pc.IsAdmin,
			"isEditor":      pc.IsEditor,
			"isActive":      pc.IsActive,
			"approved":      pc.Approved,
			"requestStatus": map[bool]string{true: "approved", false: "pending"}[pc.Approved],
			"permissions":   pc.Permissions,
		},
	})
}

// AdminLoginHandler — POST /api/admin/login
func AdminLoginHandler(c *fiber.Ctx) error {
	ip := middleware.GetClientIP(c)

	// rate limit IP: 30/menit
	if err := checkRate(c, "admin:login:"+ip, 30, 60000); err != nil {
		return err
	}

	var body struct {
		Email         string `json:"email"`
		Password      string `json:"password"`
		TurnstileToken string `json:"turnstileToken"`
	}
	if err := c.BodyParser(&body); err != nil {
		return response.Error(c, 400, "Body tidak valid.", "INVALID_BODY")
	}
	email := strings.ToLower(strings.TrimSpace(body.Email))
	if email == "" || body.Password == "" {
		return response.Error(c, 400, "Email dan password wajib diisi.", "VALIDATION_ERROR")
	}

	// rate limit per email: 15/15 menit
	if err := checkRate(c, "admin:login:email:"+email, 15, 15*60000); err != nil {
		return response.Error(c, 429, "Terlalu banyak percobaan login. Akun dikunci sementara.", "ACCOUNT_LOCKED")
	}

	// Turnstile (opsional jika tidak dikonfigurasi)
	ctx, cancel := context.WithTimeout(c.Context(), 10*time.Second)
	defer cancel()

	if config.Cfg.TurnstileSecret != "" {
		if !services.VerifyTurnstile(ctx, body.TurnstileToken) {
			return response.Error(c, 403, "Verifikasi captcha gagal. Silakan coba lagi.", "CAPTCHA_FAILED")
		}
	}

	session, err := services.Supabase.SignIn(ctx, email, body.Password)
	if err != nil {
		return response.Error(c, 401, "Email atau password salah.", "INVALID_CREDENTIALS")
	}

	// Reset rate limit key saat login berhasil
	_ = cache.Del(ctx, "rl:admin:login:email:"+email)
	_ = cache.Del(ctx, "rl:admin:login:"+ip)

	// cek role admin/editor
	sessCtx := middleware.BuildSessionFromUser(ctx, &session.User)
	if !sessCtx.HasAdminAccess {
		_ = services.Supabase.SignOut(ctx, session.AccessToken)
		return response.Error(c, 403, "Akun ini tidak memiliki hak akses admin.", "NOT_ADMIN")
	}

	// audit login
	services.Audit.Record(struct {
		Action      string
		Entity      string
		EntityID    string
		PerformedBy string
		Before      any
		After       any
		IP          any
	}{
		Action: "login", Entity: "auth", PerformedBy: email, IP: ip,
	})

	// set cookie sesi (agar FE Astro bisa baca)
	cfg := config.Cfg

	// Simpan session dalam cookie JSON base64 (banding @supabase/ssr)
	sessJSON, _ := json.Marshal(map[string]any{
		"access_token":  session.AccessToken,
		"refresh_token": session.RefreshToken,
		"expires_at":    session.ExpiresAt,
		"expires_in":    session.ExpiresIn,
		"token_type":    session.TokenType,
		"user": fiber.Map{
			"id": session.User.ID, "email": session.User.Email,
			"app_metadata": session.User.AppMetadata, "user_metadata": session.User.UserMetadata,
		},
	})
	cookieValue := base64StdEncode(sessJSON)
	secure := c.Protocol() == "https" || (strings.HasPrefix(cfg.SiteURL, "https://") && !strings.Contains(c.Hostname(), "localhost") && !strings.Contains(c.Hostname(), "127.0.0.1"))
	c.Cookie(&fiber.Cookie{
		Name:     middleware.CookieName,
		Value:    cookieValue,
		Path:     "/",
		MaxAge:   int(session.ExpiresIn),
		Secure:   secure,
		HTTPOnly: true,
		SameSite: "Lax",
	})

	return response.OK(c, fiber.Map{
		"ok":   true,
		"user": fiber.Map{
			"id": session.User.ID, "email": session.User.Email,
			"app_metadata": session.User.AppMetadata, "user_metadata": session.User.UserMetadata,
		},
		"permissions": fiber.Map{
			"isAdmin":  sessCtx.IsAdmin,
			"isEditor": sessCtx.IsEditor,
		},
	})
}

// AdminLogoutHandler — POST /api/admin/logout
func AdminLogoutHandler(c *fiber.Ctx) error {
	accessToken := middleware.GetAccessTokenFromCookie(c)
	if accessToken != "" {
		ctx, cancel := context.WithTimeout(c.Context(), 5*time.Second)
		defer cancel()
		_ = services.Supabase.SignOut(ctx, accessToken)
	}
	c.ClearCookie(middleware.CookieName)
	return response.OK(c, fiber.Map{"ok": true})
}

// AdminUpdateProfileHandler — POST /api/admin/update-profile
func AdminUpdateProfileHandler(c *fiber.Ctx) error {
	ip := middleware.GetClientIP(c)
	if err := checkRate(c, "admin:update-profile:"+ip, 10, 60000); err != nil {
		return err
	}

	var body struct {
		AccessToken string `json:"accessToken"`
		FullName    string `json:"fullName"`
		AvatarBase64 string `json:"avatar"` // data URL
	}
	if err := c.BodyParser(&body); err != nil {
		return response.Error(c, 400, "Body tidak valid.", "INVALID_BODY")
	}
	if body.AccessToken == "" {
		return response.Error(c, 401, "Unauthorized.", "AUTH_REQUIRED")
	}

	ctx, cancel := context.WithTimeout(c.Context(), 15*time.Second)
	defer cancel()

	user, err := services.Supabase.GetUser(ctx, body.AccessToken)
	if err != nil {
		return response.Error(c, 401, "Unauthorized.", "AUTH_REQUIRED")
	}

	// avatar upload
	avatarURL := ""
	if strings.HasPrefix(body.AvatarBase64, "data:image/") {
		_, avatarURL, _, _, err = services.Storage.UploadBase64Image(ctx, body.AvatarBase64, "avatars", "avatar")
		if err != nil {
			return response.Error(c, 400, "Gagal upload avatar: "+err.Error(), "UPLOAD_FAILED")
		}
	}

	attrs := map[string]any{}
	if body.FullName != "" {
		attrs["user_metadata"] = map[string]any{"full_name": body.FullName}
	}
	if avatarURL != "" {
		meta := map[string]any{}
		if u, ok := attrs["user_metadata"].(map[string]any); ok {
			meta = u
		}
		meta["avatar_url"] = avatarURL
		attrs["user_metadata"] = meta
	}

	if len(attrs) > 0 {
		if _, err := services.Supabase.AdminUpdateUser(ctx, user.ID, attrs); err != nil {
			return response.Error(c, 500, "Gagal update profil.", "UPDATE_FAILED")
		}
	}

	pool := db.Get()
	if pool != nil && body.FullName != "" {
		_, _ = pool.Exec(ctx,
			`UPDATE kemenag_website.admin_users SET full_name = $1, updated_at = now() WHERE user_id = $2`,
			body.FullName, user.ID)
	}

	return response.OK(c, fiber.Map{"ok": true, "avatar_url": avatarURL})
}

// AdminUpdatePasswordHandler — POST /api/admin/update-password (OTP Redis)
func AdminUpdatePasswordHandler(c *fiber.Ctx) error {
	ip := middleware.GetClientIP(c)
	if err := checkRate(c, "admin:update-password:"+ip, 5, 60000); err != nil {
		return err
	}

	var body struct {
		Email       string `json:"email"`
		OtpCode     string `json:"otpCode"`
		NewPassword string `json:"newPassword"`
	}
	if err := c.BodyParser(&body); err != nil {
		return response.Error(c, 400, "Body tidak valid.", "INVALID_BODY")
	}
	if len(body.NewPassword) < 8 {
		return response.Error(c, 400, "Password minimal 8 karakter.", "VALIDATION_ERROR")
	}

	ctx, cancel := context.WithTimeout(c.Context(), 15*time.Second)
	defer cancel()

	// validasi otp
	key := "otp:" + strings.TrimSpace(body.Email)
	otp, err := getCache(ctx, key)
	if err != nil || otp == "" || !strings.EqualFold(otp, strings.TrimSpace(body.OtpCode)) {
		return response.Error(c, 400, "Kode OTP tidak valid atau sudah kedaluwarsa.", "INVALID_OTP")
	}

	// cari user by email lalu update password
	users, err := services.Supabase.AdminListUsers(ctx)
	if err != nil {
		return response.Error(c, 500, "Gagal mencari pengguna.", "LOOKUP_FAILED")
	}
	for _, u := range users {
		if strings.EqualFold(u.Email, strings.TrimSpace(body.Email)) {
			_, err := services.Supabase.AdminUpdateUser(ctx, u.ID, map[string]any{"password": body.NewPassword})
			if err != nil {
				return response.Error(c, 500, "Gagal memperbarui password.", "UPDATE_FAILED")
			}
			_ = delCache(ctx, key)
			return response.OK(c, fiber.Map{"ok": true})
		}
	}
	return response.Error(c, 404, "Pengguna tidak ditemukan.", "USER_NOT_FOUND")
}

type cachedDashboardStats struct {
	payload   fiber.Map
	expiresAt time.Time
}

var (
	dashboardStatsCacheMu sync.RWMutex
	dashboardStatsCache   *cachedDashboardStats
)

// InvalidateDashboardStatsCache membersihkan cache dashboard saat ada mutasi data.
func InvalidateDashboardStatsCache() {
	dashboardStatsCacheMu.Lock()
	dashboardStatsCache = nil
	dashboardStatsCacheMu.Unlock()
}

// AdminDashboardStatsHandler — GET /api/admin/dashboard/stats
func AdminDashboardStatsHandler(c *fiber.Ctx) error {
	if _, _, err := middleware.RequireAdmin(c, middleware.AdminAuthOpts{}); err != nil {
		return err
	}

	// 1. Cek in-memory cache terlebih dahulu (0ms response)
	dashboardStatsCacheMu.RLock()
	if dashboardStatsCache != nil && time.Now().Before(dashboardStatsCache.expiresAt) {
		cached := dashboardStatsCache.payload
		dashboardStatsCacheMu.RUnlock()
		return response.OK(c, cached)
	}
	dashboardStatsCacheMu.RUnlock()

	ctx, cancel := context.WithTimeout(c.Context(), 6*time.Second)
	defer cancel()
	pool := db.Get()
	if pool == nil {
		return response.Error(c, 503, "Database tidak tersedia", "DB_UNAVAILABLE")
	}

	start := time.Now()

	var (
		totalBerita, totalPublished, totalDraft, totalViews, recent7 int64
		totalSlides, totalGallery, totalReportDocs, totalYoutubeVideos int64
		topBerita                                                    []fiber.Map
		categoryDistribution                                         []fiber.Map
		trend                                                        []fiber.Map
	)

	var wg sync.WaitGroup
	wg.Add(4)

	// Query 1: Single combined counts aggregation
	go func() {
		defer wg.Done()
		combinedQuery := `
			SELECT
				(SELECT COUNT(*) FROM kemenag_website.berita) AS total_berita,
				(SELECT COUNT(*) FROM kemenag_website.berita WHERE is_published = true) AS total_published,
				(SELECT COUNT(*) FROM kemenag_website.berita WHERE is_published = false) AS total_draft,
				(SELECT COALESCE(SUM(views), 0) FROM kemenag_website.berita) AS total_views,
				(SELECT COUNT(*) FROM kemenag_website.berita WHERE created_at >= NOW() - INTERVAL '7 days') AS recent_7,
				(SELECT COUNT(*) FROM kemenag_website.homepage_slides) AS total_slides,
				(SELECT COUNT(*) FROM kemenag_website.galeri) AS total_gallery,
				(SELECT COUNT(*) FROM kemenag_website.report_documents WHERE is_published = true) AS total_report_docs,
				(SELECT COUNT(*) FROM kemenag_website.youtube_videos) AS total_youtube_videos
		`
		_ = pool.QueryRow(ctx, combinedQuery).Scan(
			&totalBerita, &totalPublished, &totalDraft, &totalViews, &recent7,
			&totalSlides, &totalGallery, &totalReportDocs, &totalYoutubeVideos,
		)
	}()

	// Query 2: Top 5 Berita
	go func() {
		defer wg.Done()
		rows, err := pool.Query(ctx, `
			SELECT id, title, slug, COALESCE(views, 0) AS views, is_published
			FROM kemenag_website.berita
			WHERE is_published = true
			ORDER BY views DESC
			LIMIT 5`)
		if err == nil {
			defer rows.Close()
			var list []fiber.Map
			for rows.Next() {
				var id, title, slug string
				var views int64
				var isPub bool
				if err := rows.Scan(&id, &title, &slug, &views, &isPub); err == nil {
					list = append(list, fiber.Map{
						"id": id, "title": title, "slug": slug,
						"views": views, "is_published": isPub,
					})
				}
			}
			topBerita = list
		}
	}()

	// Query 3: Trend 14 hari
	go func() {
		defer wg.Done()
		days := 14
		trendMap := make(map[string]int64, days)
		var trendDates []string
		for i := days - 1; i >= 0; i-- {
			d := time.Now().AddDate(0, 0, -i)
			key := d.Format("2006-01-02")
			trendMap[key] = 0
			trendDates = append(trendDates, key)
		}

		rows, err := pool.Query(ctx, `
			SELECT TO_CHAR(COALESCE(published_at, created_at), 'YYYY-MM-DD') AS day, COUNT(*) AS count
			FROM kemenag_website.berita
			WHERE is_published = true AND COALESCE(published_at, created_at) >= NOW() - INTERVAL '14 days'
			GROUP BY day`)
		if err == nil {
			defer rows.Close()
			for rows.Next() {
				var day string
				var count int64
				if err := rows.Scan(&day, &count); err == nil {
					trendMap[day] = count
				}
			}
		}

		trendList := make([]fiber.Map, 0, len(trendDates))
		for _, d := range trendDates {
			trendList = append(trendList, fiber.Map{"date": d, "count": trendMap[d]})
		}
		trend = trendList
	}()

	// Query 4: Distribusi Kategori (Top 4)
	go func() {
		defer wg.Done()
		rows, err := pool.Query(ctx, `
			SELECT COALESCE(NULLIF(TRIM(category), ''), 'Umum') AS name, COUNT(*) AS count
			FROM kemenag_website.berita
			GROUP BY name
			ORDER BY count DESC
			LIMIT 4`)
		if err == nil {
			defer rows.Close()
			var list []fiber.Map
			for rows.Next() {
				var name string
				var count int64
				if err := rows.Scan(&name, &count); err == nil {
					list = append(list, fiber.Map{"name": name, "count": count})
				}
			}
			categoryDistribution = list
		}
	}()

	wg.Wait()

	// Calculate percentages
	for i := range categoryDistribution {
		count, _ := categoryDistribution[i]["count"].(int64)
		pct := 0
		if totalBerita > 0 {
			pct = int(math.Round(float64(count) / float64(totalBerita) * 100))
		}
		categoryDistribution[i]["percentage"] = pct
	}

	responseTimeMs := int64(time.Since(start).Milliseconds())
	if responseTimeMs < 1 {
		responseTimeMs = 1
	}

	result := fiber.Map{
		"ok": true,
		"summary": fiber.Map{
			"totalBerita":        totalBerita,
			"totalPublished":     totalPublished,
			"totalDraft":         totalDraft,
			"totalViews":         totalViews,
			"recent7":            recent7,
			"totalReportDocs":    totalReportDocs,
			"totalSlides":        totalSlides,
			"totalGallery":       totalGallery,
			"totalYoutubeVideos": totalYoutubeVideos,
		},
		"categoryDistribution": categoryDistribution,
		"trend":                trend,
		"topBerita":            topBerita,
		"recentActivity":       []fiber.Map{},
		"responseTimeMs":       responseTimeMs,
	}

	// Cache result for 45 seconds
	dashboardStatsCacheMu.Lock()
	dashboardStatsCache = &cachedDashboardStats{
		payload:   result,
		expiresAt: time.Now().Add(45 * time.Second),
	}
	dashboardStatsCacheMu.Unlock()

	return response.OK(c, result)
}

func checkRate(c *fiber.Ctx, key string, limit int, windowMs int64) error {
	windowSec := windowMs / 1000
	if windowSec <= 0 {
		windowSec = 60
	}
	ctx, cancel := context.WithTimeout(c.Context(), 3*time.Second)
	defer cancel()

	allowed, retryAfter := middleware.CheckRateLimit(ctx, key, limit, windowSec)
	if !allowed {
		c.Set("Retry-After", fmt.Sprintf("%d", retryAfter))
		return response.Error(c, 429, "Terlalu banyak percobaan login. Silakan coba beberapa saat lagi.", "RATE_LIMITED")
	}
	return nil
}

// profileStr membaca nilai string dari map profil (default kosong).
func profileStr(m map[string]any, key string) string {
	if m == nil {
		return ""
	}
	if v, ok := m[key].(string); ok {
		return v
	}
	return ""
}

func getCache(ctx context.Context, key string) (string, error) {
	var err error
	val, err := cacheGet(ctx, key)
	return val, err
}

func delCache(ctx context.Context, key string) error {
	return cacheDel(ctx, key)
}

// helper stubs untuk kompatibilitas (dipakai update-password)
var _ = json.Marshal