package middleware

import (
	"github.com/gofiber/fiber/v3"
)

// SecurityHeaders menyisipkan header keamanan standar industri untuk proteksi XSS, Clickjacking, MIME sniffing,
// serta Alt-Svc untuk mengaktifkan negosiasi protokol HTTP/3 (QUIC) pada port 443 dan HSTS enterprise.
func SecurityHeaders() fiber.Handler {
	return func(c fiber.Ctx) error {
		c.Set("X-Content-Type-Options", "nosniff")
		c.Set("X-Frame-Options", "SAMEORIGIN")
		c.Set("Referrer-Policy", "strict-origin-when-cross-origin")
		c.Set("Permissions-Policy", "camera=(), microphone=(), geolocation=()")
		c.Set("X-XSS-Protection", "1; mode=block")

		// HTTP/3 (QUIC) Alt-Svc Header: Menginstruksikan browser modern bernegosiasi menggunakan protokol HTTP/3
		c.Set("Alt-Svc", `h3=":443"; ma=86400, h3-29=":443"; ma=86400`)

		// HSTS (HTTP Strict Transport Security)
		c.Set("Strict-Transport-Security", "max-age=63072000; includeSubDomains; preload")

		return c.Next()
	}
}

// AdminLoginRateLimit melindungi endpoint otentikasi admin dari serangan brute-force (5 request / 15 menit).
func AdminLoginRateLimit() fiber.Handler {
	return RateLimit(RateLimitOpts{
		Key:      "auth:login:{ip}",
		Limit:    5,
		WindowMs: 15 * 60 * 1000, // 15 menit
	})
}

// ChatRateLimit membatasi spam AI chatbot (15 request / menit).
func ChatRateLimit() fiber.Handler {
	return RateLimit(RateLimitOpts{
		Key:      "ai:chat:{ip}",
		Limit:    15,
		WindowMs: 60 * 1000, // 1 menit
	})
}

// PublicFormRateLimit membatasi submit form kontak/laporan publik (10 request / menit).
func PublicFormRateLimit() fiber.Handler {
	return RateLimit(RateLimitOpts{
		Key:      "form:submit:{ip}",
		Limit:    10,
		WindowMs: 60 * 1000, // 1 menit
	})
}
