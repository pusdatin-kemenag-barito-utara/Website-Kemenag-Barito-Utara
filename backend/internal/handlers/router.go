package handlers

import (
	"kemenag-backend/internal/middleware"

	"github.com/gofiber/fiber/v2"
)

// RegisterRoutes mendaftarkan seluruh endpoint (paritas /api Next.js).
func RegisterRoutes(app *fiber.App) {
	api := app.Group("/api")

	// ── Pusdatin Auth & Admin Auth (Protected by Brute Force Rate Limiter) ──
	api.Post("/pusdatin/auth", middleware.AdminLoginRateLimit(), AdminLoginHandler)
	api.Post("/admin/login", middleware.AdminLoginRateLimit(), AdminLoginHandler)
	api.Post("/admin/logout", AdminLogoutHandler)
	api.Get("/admin/session", AdminSessionHandler)
	api.Get("/admin/my-permissions", AdminMyPermissionsHandler)
	api.Get("/admin", AdminSummaryHandler)
	api.Get("/admin/dashboard/stats", AdminDashboardStatsHandler)
	api.Post("/admin/update-profile", AdminUpdateProfileHandler)
	api.Post("/admin/update-password", AdminUpdatePasswordHandler)

	// ── Admin Subroutes ─────────────────────────────────────
	admin := api.Group("/admin")

	admin.Get("/berita", AdminBeritaListHandler)
	admin.Post("/berita", AdminBeritaCreateHandler)
	admin.Get("/berita/:id", AdminBeritaGetHandler)
	admin.Put("/berita/:id", AdminBeritaUpdateHandler)
	admin.Delete("/berita/:id", AdminBeritaDeleteHandler)
	admin.Post("/berita/upload-image", AdminBeritaUploadImageHandler)

	admin.Get("/galeri", AdminGaleriListHandler)
	admin.Post("/galeri", AdminGaleriCreateHandler)
	admin.Put("/galeri", AdminGaleriUpdateHandler)
	admin.Delete("/galeri", AdminGaleriDeleteHandler)

	admin.Get("/homepage-slides", AdminSlidesListHandler)
	admin.Post("/homepage-slides", AdminSlidesCreateHandler)
	admin.Patch("/homepage-slides/:id", AdminSlidesUpdateHandler)
	admin.Delete("/homepage-slides/:id", AdminSlidesDeleteHandler)

	admin.Get("/laporan", AdminLaporanListHandler)
	admin.Post("/laporan/upload", AdminLaporanUploadHandler)
	admin.Put("/laporan/:id", AdminLaporanUpdateHandler)
	admin.Delete("/laporan/:id", AdminLaporanDeleteHandler)
	admin.Post("/laporan/view", AdminLaporanViewIncrementHandler)
	admin.Get("/laporan/view/:id", AdminLaporanViewProxyHandler)

	admin.Get("/seksi", AdminSeksiListHandler)
	admin.Get("/seksi/:id", AdminSeksiGetHandler)
	admin.Put("/seksi/:id", AdminSeksiUpdateHandler)
	admin.Delete("/seksi/:id", AdminSeksiDeleteHandler)
	admin.Post("/seksi/:id/pegawai", AdminSeksiAddPegawaiHandler)
	admin.Put("/seksi/:id/pegawai/:pegawaiId", AdminSeksiUpdatePegawaiHandler)
	admin.Delete("/seksi/:id/pegawai/:pegawaiId", AdminSeksiDeletePegawaiHandler)

	admin.Get("/youtube", AdminYoutubeListHandler)
	admin.Post("/youtube", AdminYoutubeCreateHandler)
	admin.Get("/youtube/info", AdminYoutubeInfoHandler)
	admin.Patch("/youtube/:id", AdminYoutubeUpdateHandler)
	admin.Delete("/youtube/:id", AdminYoutubeDeleteHandler)

	admin.Get("/pengaturan", AdminPengaturanGetHandler)
	admin.Post("/pengaturan", AdminPengaturanSaveHandler)
	admin.Post("/sync-ai", AdminSyncAIHandler)

	// ── Chat AI (Protected against token spam) ─────────────
	api.Post("/chat", middleware.ChatRateLimit(), ChatHandler)
	api.Get("/chat/tools", ChatToolsHandler)

	// ── Cron ────────────────────────────────────────────────
	api.Get("/cron/publish-berita", CronPublishBeritaHandler)
	api.Post("/cron/publish-berita", CronPublishBeritaHandler)
	api.Get("/cron/prune-audit", CronPruneAuditHandler)
	api.Post("/cron/prune-audit", CronPruneAuditHandler)

	// ── Publik Static ────────────────────────────────────────
	api.Get("/health", HealthHandler)
	api.Get("/home", HomeHandler)
	api.Get("/youtube", YoutubePublicHandler)
	api.Get("/portal", PortalHandler)
	api.Get("/seksi", SeksiPublicHandler)
	api.Get("/static-pages", StaticPagesHandler)
	api.Get("/search", SearchHandler)
	api.Get("/visitors", VisitorStatsHandler)
	api.Post("/visitors", VisitorIncrementHandler)
	api.Get("/maintenance-status", MaintenanceStatusHandler)
	api.Get("/cache-version", CacheVersionHandler)
	api.Get("/berita", BeritaListHandler)
	api.Get("/berita/months", BeritaMonthsHandler)
	api.Get("/galeri", GaleriPublicHandler)
	api.Get("/laporan", LaporanCategoriesHandler)
	api.Get("/image-proxy", ImageProxyHandler)
	api.Get("/settings", PublicSettingsHandler)
	api.Get("/pengaturan", PublicSettingsHandler)

	// ── Publik Parameterized & Wildcards ─────────────────────
	api.Get("/seksi/:slug", SeksiDetailPublicHandler)
	api.Get("/berita/:slug", BeritaDetailHandler)
	api.Post("/berita/:slug/view", BeritaViewHandler)
	api.Get("/berita/:slug/react", BeritaReactGetHandler)
	api.Post("/berita/:slug/react", BeritaReactHandler)
	api.Get("/laporan/:slug", LaporanCategoryHandler)
	api.Get("/laporan/view/:id/*", LaporanViewProxyHandler)
	api.Get("/laporan/download/:id/*", LaporanDownloadProxyHandler)
	api.Get("/storage/media/*", StorageMediaHandler)
}
