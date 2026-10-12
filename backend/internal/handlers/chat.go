package handlers

import (
	"bufio"
	"context"
	"fmt"
	"strings"
	"time"

	"kemenag-backend/internal/response"
	"kemenag-backend/internal/services"

	"github.com/gofiber/fiber/v3"
)

// ChatHandler — POST /api/chat (SSE streaming multi-provider + RAG)
func ChatHandler(c fiber.Ctx) error {
	var body struct {
		Messages        []services.AIMessage `json:"messages"`
		SystemInjection string               `json:"system_injection"`
	}
	if err := c.Bind().Body(&body); err != nil {
		return response.Error(c, 400, "Body tidak valid.", "INVALID_BODY")
	}
	if len(body.Messages) == 0 {
		return response.Error(c, 400, "Pesan kosong.", "EMPTY_MESSAGES")
	}

	system := services.BuildSystemPrompt(body.SystemInjection)

	c.Set("Content-Type", "text/event-stream; charset=utf-8")
	c.Set("Cache-Control", "no-cache, no-transform")
	c.Set("Connection", "keep-alive")
	c.Set("X-Accel-Buffering", "no")
	c.Set("Content-Encoding", "identity")

	return c.SendStreamWriter(func(w *bufio.Writer) {
		ctx, cancel := context.WithTimeout(context.Background(), 90*time.Second)
		defer cancel()

		writeSSE := func(s string) {
			_, _ = w.WriteString(s)
			_ = w.Flush()
		}

		writeSSE(`data: {"type":"text-start"}` + "\n\n")

		providerUsed, err := services.StreamChat(ctx, system, body.Messages, func(delta string) error {
			_, werr := w.WriteString(fmt.Sprintf(`data: {"type":"text-delta","delta":%s}`+"\n\n", jsonString(delta)))
			if werr != nil {
				return werr
			}
			return w.Flush()
		})
		if err != nil {
			fmt.Printf("[chat error] all providers failed: %v\n", err)
			msg := `Mohon maaf, layanan AI sedang sibuk. Silakan hubungi WhatsApp Call Center PTSP melalui https://wa.me/6285117491212`
			writeSSE(fmt.Sprintf(`data: {"type":"text-delta","delta":%s}`+"\n\n", jsonString(msg)))
		} else {
			writeSSE(fmt.Sprintf(`data: {"type":"finish","provider":%s}`+"\n\n", jsonString(providerUsed)))
		}
	})
}

func jsonString(s string) string {
	var b strings.Builder
	b.Grow(len(s) + 8)
	b.WriteByte('"')
	for _, r := range s {
		switch r {
		case '"':
			b.WriteString(`\"`)
		case '\\':
			b.WriteString(`\\`)
		case '\n':
			b.WriteString(`\n`)
		case '\r':
			b.WriteString(`\r`)
		case '\t':
			b.WriteString(`\t`)
		default:
			if r < 0x20 {
				b.WriteString(fmt.Sprintf(`\u%04x`, r))
			} else {
				b.WriteRune(r)
			}
		}
	}
	b.WriteByte('"')
	return b.String()
}

// ChatToolsHandler — GET /api/chat/tools (daftar layanan + lokasi untuk UI)
func ChatToolsHandler(c fiber.Ctx) error {
	defaultServices := []fiber.Map{
		{"slug": "tata-usaha", "judul": "Subbagian Tata Usaha", "nama_kepala": "Kepala Subbagian Tata Usaha"},
		{"slug": "pendidikan-madrasah", "judul": "Seksi Pendidikan Madrasah", "nama_kepala": "Kepala Seksi Pendis"},
		{"slug": "bimas-islam", "judul": "Seksi Bimbingan Masyarakat Islam", "nama_kepala": "Kepala Seksi Bimas Islam"},
		{"slug": "haji-umrah", "judul": "Seksi Penyelenggaraan Haji dan Umrah", "nama_kepala": "Kepala Seksi PHU"},
		{"slug": "pakis", "judul": "Seksi Pendidikan Agama dan Keagamaan Islam", "nama_kepala": "Kepala Seksi PAKIS"},
		{"slug": "zakat-wakaf", "judul": "Penyelenggara Zakat dan Wakaf", "nama_kepala": "Penyelenggara Zawa"},
	}

	return response.OK(c, fiber.Map{
		"location": fiber.Map{
			"name":    "Kantor Kementerian Agama Kabupaten Barito Utara",
			"address": "Jl. Ahmad Yani No.126, Muara Teweh, Kalimantan Tengah 73811",
			"lat":     -0.9564,
			"lng":     114.8945,
		},
		"services": defaultServices,
	})
}