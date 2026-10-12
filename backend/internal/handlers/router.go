package handlers

import (
	"kemenag-backend/internal/middleware"

	"github.com/gofiber/fiber/v3"
)

// RegisterRoutes mendaftarkan seluruh endpoint aktif backend microservice.
func RegisterRoutes(app fiber.Router) {
	api := app.Group("/api")

	// ── Chat AI Multi-Model Streaming (Gemini, Groq, Mistral, OpenRouter) ──
	api.Post("/chat", middleware.ChatRateLimit(), ChatHandler)
	api.Get("/chat/tools", ChatToolsHandler)

	// ── Health & Diagnostics ─────────────────────────────────
	api.Get("/health", HealthHandler)
	api.Get("/portal", PortalHandler)
	api.Get("/maintenance-status", MaintenanceStatusHandler)
	api.Get("/cache-version", CacheVersionHandler)

	// ── Pencarian Cepat Publik (PocketBase Engine) ───────────
	api.Get("/search", SearchHandler)

	// ── Struktur & Seksi Organisasi ──────────────────────────
	api.Get("/seksi", SeksiPublicHandler)
	api.Get("/seksi/:slug", SeksiDetailPublicHandler)

	// ── Halaman Statis ───────────────────────────────────────
	api.Get("/static-pages", StaticPagesHandler)

	// ── Visitor Tracking (In-Memory / Redis) ─────────────────
	api.Get("/visitors", VisitorStatsHandler)
	api.Post("/visitors", VisitorIncrementHandler)

	// ── Berita Views & Reactions ─────────────────────────────
	api.Post("/berita/:slug/view", BeritaViewIncrementHandler)
	api.Post("/berita/:slug/reaction", BeritaReactionHandler)

	// ── YouTube Videos ───────────────────────────────────────
	api.Get("/youtube", YoutubePublicHandler)

	// ── Pengaturan Situs & Identitas ─────────────────────────
	api.Get("/settings", SettingsHandler)

	// ── Media & Image Proxy ──────────────────────────────────
	api.Get("/image-proxy", ImageProxyHandler)
	api.Get("/storage/media/*", StorageMediaHandler)
}
