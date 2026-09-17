package main

import (
	"context"
	"fmt"
	"log"
	"os"
	"os/signal"
	"strings"
	"syscall"
	"time"

	"kemenag-backend/internal/cache"
	"kemenag-backend/internal/config"
	"kemenag-backend/internal/db"
	"kemenag-backend/internal/handlers"
	"kemenag-backend/internal/middleware"
	"kemenag-backend/internal/services"

	"github.com/gofiber/fiber/v3"
	"github.com/gofiber/fiber/v3/middleware/compress"
	"github.com/gofiber/fiber/v3/middleware/cors"
	"github.com/gofiber/fiber/v3/middleware/helmet"
	"github.com/gofiber/fiber/v3/middleware/logger"
	"github.com/gofiber/fiber/v3/middleware/recover"
	"github.com/jackc/pgx/v5/pgxpool"
)

func main() {
	bootStart := time.Now()

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
		AppName:         "Kemenag Barito Utara API (Golang)",
		BodyLimit:       60 * 1024 * 1024, // 60MB (upload PDF 50MB)
		ReadBufferSize:  64 * 1024,        // 64KB (prevent 431 Request Header Fields Too Large)
		WriteBufferSize: 64 * 1024,        // 64KB
		ServerHeader:    "",
	})

	app.Use(recover.New())
	app.Use(helmet.New())
	app.Use(middleware.SecurityHeaders())
	app.Use(middleware.CanonicalDomainRedirect())
	app.Use(compress.New(compress.Config{Level: compress.LevelBestSpeed}))
	app.Use(logger.New(logger.Config{
		Format:      "${cyan}${time}${reset} | ${status} | ${latency} | ${method} ${path} | ${bytesSent} | ${ip}\n",
		TimeFormat:  "15:04:05",
		TimeZone:    "Local",
		ForceColors: true,
	}))
	app.Use(cors.New(cors.Config{
		AllowOrigins: []string{"*"},
		AllowMethods: []string{"GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"},
		AllowHeaders: []string{"Origin", "Content-Type", "Accept", "Authorization", "x-upsert", "apikey", "X-Requested-With"},
	}))

	handlers.RegisterRoutes(app)

	// Persiapkan informasi status & kecepatan untuk dashboard terminal
	ctxPing, cancelPing := context.WithTimeout(context.Background(), 2*time.Second)
	defer cancelPing()

	dbLatency, poolStat, _ := db.Ping(ctxPing)
	cacheLatency, _ := cache.Ping(ctxPing)

	bootDuration := time.Since(bootStart).Round(time.Millisecond)
	routes := app.GetRoutes(true)
	port := config.Cfg.Port

	printStartupBanner(bootDuration, port, dbLatency, poolStat, cacheLatency, len(routes))

	// Graceful shutdown context (merespon SIGTERM / SIGINT saat deploy/restart)
	ctxShutdown, stop := signal.NotifyContext(context.Background(), os.Interrupt, syscall.SIGTERM)
	defer stop()

	addr := ":" + port
	if err := app.Listen(addr, fiber.ListenConfig{
		DisableStartupMessage: true,
		GracefulContext:       ctxShutdown,
		ShutdownTimeout:       10 * time.Second,
	}); err != nil && err.Error() != "Server closed" {
		log.Printf("[server] status: %v", err)
	}
	log.Println("[server] shutdown graceful selesai, seluruh koneksi dan transaksi ditutup rapi.")
}

func printStartupBanner(bootDuration time.Duration, port string, dbLatency time.Duration, stat *pgxpool.Stat, cacheLatency time.Duration, routeCount int) {
	const (
		reset     = "\033[0m"
		boldGreen = "\033[1;32m"
		cyan      = "\033[36m"
		yellow    = "\033[33m"
		gray      = "\033[90m"
		boldWhite = "\033[1;37m"
	)

	// Format DB info
	var dbInfo string
	if stat != nil {
		dbInfo = fmt.Sprintf("%sPostgreSQL Ready%s %s(%v · pool: %d/%d conns)%s", boldGreen, reset, gray, dbLatency.Round(100*time.Microsecond), stat.TotalConns(), stat.MaxConns(), reset)
	} else {
		dbInfo = fmt.Sprintf("%sPostgreSQL Ready%s %s(%v)%s", boldGreen, reset, gray, dbLatency.Round(100*time.Microsecond), reset)
	}

	// Format Cache info
	var cacheInfo string
	if cache.HasRedis() {
		cacheInfo = fmt.Sprintf("%sRedis Ready%s %s(%v)%s", boldGreen, reset, gray, cacheLatency.Round(100*time.Microsecond), reset)
	} else {
		cacheInfo = fmt.Sprintf("%sIn-Memory Store%s %s(active · <1ms)%s", yellow, reset, gray, reset)
	}

	// Format AI Models
	var aiList []string
	if config.Cfg.GeminiAPIKey != "" {
		aiList = append(aiList, "Gemini")
	}
	if config.Cfg.GroqAPIKey != "" {
		aiList = append(aiList, "Groq")
	}
	if config.Cfg.MistralAPIKey != "" {
		aiList = append(aiList, "Mistral")
	}
	if config.Cfg.OpenRouterAPIKey != "" {
		aiList = append(aiList, "OpenRouter")
	}
	aiStatus := gray + "None configured" + reset
	if len(aiList) > 0 {
		aiStatus = fmt.Sprintf("%sMulti-Model Ready%s %s(%s)%s", boldGreen, reset, gray, strings.Join(aiList, ", "), reset)
	}

	timeStr := time.Now().Format("15:04:05")

	fmt.Println()
	fmt.Printf(" %sfiber%s  %sv3.5.0%s %sready in %v%s\n", boldGreen, reset, boldWhite, reset, boldGreen, bootDuration, reset)
	fmt.Printf(" %s┃%s %-10s %shttp://localhost:%s/%s\n", cyan, reset, "Local", boldWhite, port, reset)
	fmt.Printf(" %s┃%s %-10s %shttp://localhost:%s/api/%s\n", cyan, reset, "API", boldWhite, port, reset)
	fmt.Printf(" %s┃%s %-10s %shttp://localhost:%s/api/health%s\n", cyan, reset, "Health", boldWhite, port, reset)
	fmt.Printf(" %s┃%s %-10s %s\n", cyan, reset, "Database", dbInfo)
	fmt.Printf(" %s┃%s %-10s %s\n", cyan, reset, "Cache", cacheInfo)
	fmt.Printf(" %s┃%s %-10s %sSupabase Auth & Storage%s %s·%s %sRealtime Hub%s\n", cyan, reset, "Services", boldGreen, reset, gray, reset, boldGreen, reset)
	fmt.Printf(" %s┃%s %-10s %s\n", cyan, reset, "AI Engine", aiStatus)
	fmt.Printf(" %s┃%s %-10s %s%d endpoints active%s\n", cyan, reset, "Routes", boldWhite, routeCount, reset)
	fmt.Printf("%s%s%s %swatching for file changes...%s\n\n", gray, timeStr, reset, gray, reset)
}
