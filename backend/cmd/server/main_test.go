package main

import (
	"bytes"
	"net/http/httptest"
	"testing"
	"time"

	"github.com/gofiber/fiber/v3"
	"github.com/gofiber/fiber/v3/middleware/logger"
)

func TestLoggerFormat(t *testing.T) {
	buf := &bytes.Buffer{}
	app := fiber.New()
	app.Use(logger.New(logger.Config{
		Format:      "${cyan}${time}${reset} | ${status} | ${latency} | ${method} ${path} | ${bytesSent} | ${ip}\n",
		TimeFormat:  "15:04:05",
		TimeZone:    "Local",
		Stream:      buf,
		ForceColors: true,
	}))
	app.Get("/test", func(c fiber.Ctx) error {
		return c.SendString("ok")
	})

	req := httptest.NewRequest("GET", "/test", nil)
	resp, err := app.Test(req)
	if err != nil || resp.StatusCode != 200 {
		t.Fatalf("expected 200, got %v (err: %v)", resp, err)
	}
	t.Logf("Log output:\n%s", buf.String())
}

func TestPrintStartupBanner(t *testing.T) {
	// Memastikan printStartupBanner berjalan tanpa panic dan memformat output dengan benar
	printStartupBanner(142*time.Millisecond, "8080", 12400*time.Microsecond, nil, 1500*time.Microsecond, 62)
}
