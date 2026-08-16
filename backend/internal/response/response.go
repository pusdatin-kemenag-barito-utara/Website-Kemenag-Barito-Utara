package response

import (
	"encoding/json"
	"strconv"

	"github.com/gofiber/fiber/v2"
)

// JSON mengirim response JSON dengan header no-store (pola apiResponse Next.js).
func JSON(c *fiber.Ctx, status int, data any) error {
	c.Set("Cache-Control", "no-store, no-cache, must-revalidate, proxy-revalidate")
	c.Set("Pragma", "no-cache")
	c.Set("Expires", "0")
	return c.Status(status).JSON(data)
}

// OK mengirim response 200 {ok: data} — pola Next.js.
func OK(c *fiber.Ctx, data any) error {
	return JSON(c, 200, data)
}

// Error mengirim response error standar {message, code}.
func Error(c *fiber.Ctx, status int, message, code string) error {
	return JSON(c, status, fiber.Map{
		"message": message,
		"code":    code,
	})
}

// ValidationErr mengirim error validasi {message, code, errors}.
func ValidationErr(c *fiber.Ctx, status int, message, code string, errors []fiber.Map) error {
	return JSON(c, status, fiber.Map{
		"message": message,
		"code":    code,
		"errors":  errors,
	})
}

// CDNCacheControl men-set header cache publik (ISR-like).
func CDNCacheControl(c *fiber.Ctx, maxAge int, staleWhileRevalidate int) {
	c.Set("Cache-Control", "no-cache, no-store, must-revalidate, proxy-revalidate")
	c.Set("CDN-Cache-Control", "public, max-age=0, s-maxage="+strconv.Itoa(maxAge)+", stale-while-revalidate="+strconv.Itoa(staleWhileRevalidate))
}

// Marshal helper untuk testing/tools.
func Marshal(v any) ([]byte, error) {
	return json.Marshal(v)
}
