package main

import (
	"log"

	"kemenag-backend/internal/cache"
	"kemenag-backend/internal/config"
	"kemenag-backend/internal/db"
	"kemenag-backend/internal/handlers"
	"kemenag-backend/internal/middleware"
	"kemenag-backend/internal/services"

	"github.com/gofiber/fiber/v2"
	"github.com/gofiber/fiber/v2/middleware/compress"
	"github.com/gofiber/fiber/v2/middleware/cors"
	"github.com/gofiber/fiber/v2/middleware/helmet"
	"github.com/gofiber/fiber/v2/middleware/logger"
	"github.com/gofiber/fiber/v2/middleware/recover"
)

func main() {
	if err := config.Load(); err != nil {
		log.Fatalf("[config] gagal load: %v", err)
	}

	// Database (wajib)
	pool, err := db.Init(config.Cfg.DatabaseURL)
	if err != nil {
		log.Fatalf("[db] %v", err)
	}
	defer pool.Close()

	// Redis opsional (fallback in-memory)
	cache.Init(config.Cfg.RedisURL)
	defer cache.Close()

	// Layanan eksternal
	services.InitSupabase()
	services.InitStorage()
	services.Realtime.Start()

	app := fiber.New(fiber.Config{
		AppName:               "Kemenag Barito Utara API (Golang)",
		BodyLimit:             60 * 1024 * 1024, // 60MB (upload PDF 50MB)
		ReadBufferSize:        64 * 1024,        // 64KB (prevent 431 Request Header Fields Too Large)
		WriteBufferSize:       64 * 1024,        // 64KB
		ServerHeader:          "",
		DisableStartupMessage: false,
	})

	app.Use(recover.New())
	app.Use(helmet.New())
	app.Use(middleware.SecurityHeaders())
	app.Use(compress.New(compress.Config{Level: compress.LevelBestSpeed}))
	app.Use(logger.New(logger.Config{
		Format: "${time} | ${status} | ${latency} | ${method} ${path} | ${ip}\n",
	}))
	app.Use(cors.New(cors.Config{
		AllowOrigins: "*",
		AllowMethods: "GET,POST,PUT,PATCH,DELETE,OPTIONS",
		AllowHeaders: "Origin, Content-Type, Accept, Authorization, x-upsert, apikey, X-Requested-With",
	}))

	handlers.RegisterRoutes(app)

	addr := ":" + config.Cfg.Port
	log.Printf("[server] Kemenag Barito Utara API berjalan di %s (semua route aktif)", addr)
	if err := app.Listen(addr); err != nil {
		log.Fatalf("[server] %v", err)
	}
}
