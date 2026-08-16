package handlers

import (
	"context"
	"io"
	"mime"
	"net/http"
	"path/filepath"
	"strings"
	"time"

	"kemenag-backend/internal/config"
	"kemenag-backend/internal/response"
	"kemenag-backend/internal/services"

	"github.com/gofiber/fiber/v2"
)

// allowedProxyHosts allowlist image-proxy.
func allowedProxyHosts() map[string]bool {
	hosts := map[string]bool{
		"drive.google.com":     true,
		"docs.google.com":      true,
		"lh3.googleusercontent.com": true,
		"cdn.kemenag-baritoutara.com": true,
		"ptsp.kemenag-baritoutara.com": true,
		"localhost":            true,
	}
	host := ""
	if u := config.Cfg.SupabaseURL; u != "" {
		if i := strings.Index(u, "://"); i != -1 {
			host = strings.TrimSuffix(strings.TrimPrefix(u[i+3:], ""), "/")
		}
	}
	if host != "" {
		hosts[host] = true
	}
	if site := config.Cfg.SiteURL; site != "" {
		if i := strings.Index(site, "://"); i != -1 {
			h := strings.TrimPrefix(site[i+3:], "")
			if j := strings.Index(h, "/"); j != -1 {
				h = h[:j]
			}
			if h != "" {
				hosts[h] = true
			}
		}
	}
	return hosts
}

// ImageProxyHandler — GET /api/image-proxy?url= (allowlist, max 10MB)
func ImageProxyHandler(c *fiber.Ctx) error {
	target := strings.TrimSpace(c.Query("url"))
	if target == "" {
		return response.Error(c, 400, "Parameter url wajib.", "URL_REQUIRED")
	}
	if !strings.HasPrefix(target, "http://") && !strings.HasPrefix(target, "https://") {
		return response.Error(c, 400, "URL tidak valid.", "INVALID_URL")
	}

	u, err := http.NewRequestWithContext(c.Context(), http.MethodGet, target, nil)
	if err != nil || u.URL.Hostname() == "" {
		return response.Error(c, 400, "URL tidak valid.", "INVALID_URL")
	}
	host := strings.ToLower(u.URL.Hostname())
	if !allowedProxyHosts()[host] {
		return response.Error(c, 403, "Host tidak diizinkan.", "HOST_NOT_ALLOWED")
	}

	req, err := http.NewRequestWithContext(c.Context(), http.MethodGet, target, nil)
	if err != nil {
		return response.Error(c, 400, "URL tidak valid.", "INVALID_URL")
	}
	req.Header.Set("User-Agent", "KemenagBarut-CMS/1.0")

	client := &http.Client{Timeout: 30 * time.Second}
	resp, err := client.Do(req)
	if err != nil {
		return response.Error(c, 502, "Gagal mengambil gambar.", "UPSTREAM_ERROR")
	}
	defer resp.Body.Close()

	contentType := resp.Header.Get("Content-Type")
	if !strings.HasPrefix(contentType, "image/") {
		// cek dari ekstensi jika header kosong
		ext := strings.ToLower(filepath.Ext(u.URL.Path))
		if ext != "" && strings.HasPrefix(mime.TypeByExtension(ext), "image/") {
			contentType = mime.TypeByExtension(ext)
		} else {
			io.Copy(io.Discard, io.LimitReader(resp.Body, 4096))
			return response.Error(c, 415, "Konten bukan gambar.", "NOT_IMAGE")
		}
	}

	if resp.ContentLength > 10*1024*1024 {
		return response.Error(c, 413, "Ukuran gambar terlalu besar (maks 10MB).", "TOO_LARGE")
	}

	// batas stream 10MB
	limited := io.LimitReader(resp.Body, 10*1024*1024+1)

	c.Set("Content-Type", contentType)
	c.Set("Cache-Control", "public, max-age=300")
	c.Status(200)
	if _, err := io.Copy(c, limited); err != nil {
		return err
	}
	return nil
}

// StorageMediaHandler — GET /api/storage/media/* (proxy Supabase Storage public URL)
func StorageMediaHandler(c *fiber.Ctx) error {
	path := strings.Trim(c.Params("*"), "/")
	if path == "" {
		return response.Error(c, 400, "Path kosong.", "PATH_REQUIRED")
	}

	upstream := config.Cfg.SupabaseURL + "/storage/v1/object/public/cms-media/" + path
	req, err := http.NewRequestWithContext(c.Context(), http.MethodGet, upstream, nil)
	if err != nil {
		return response.Error(c, 502, "Gagal membangun URL.", "BAD_UPSTREAM")
	}
	req.Header.Set("User-Agent", "KemenagBarut-CMS/1.0")

	client := &http.Client{Timeout: 60 * time.Second}
	resp, err := client.Do(req)
	if err != nil {
		return response.Error(c, 502, "Gagal mengambil file.", "UPSTREAM_ERROR")
	}
	defer resp.Body.Close()
	if resp.StatusCode >= 400 {
		io.Copy(io.Discard, io.LimitReader(resp.Body, 4096))
		return response.Error(c, resp.StatusCode, "File tidak ditemukan di storage.", "NOT_FOUND")
	}

	contentType := resp.Header.Get("Content-Type")
	if contentType == "" || strings.HasPrefix(contentType, "text/plain") {
		ext := strings.ToLower(filepath.Ext(path))
		if t := mime.TypeByExtension(ext); t != "" {
			contentType = t
		} else {
			extMap := map[string]string{".jpg": "image/jpeg", ".jpeg": "image/jpeg", ".png": "image/png", ".webp": "image/webp", ".gif": "image/gif", ".svg": "image/svg+xml", ".pdf": "application/pdf"}
			contentType = extMap[ext]
		}
	}

	// ganti URL gambar di path ke proxy jika perlu
	c.Set("X-Content-Type-Options", "nosniff")
	c.Set("Access-Control-Allow-Origin", "*")
	c.Set("Content-Type", contentType)
	c.Set("Cache-Control", "public, max-age=86400, s-maxage=604800, stale-while-revalidate=86400")
	c.Status(200)
	if _, err := io.Copy(c, resp.Body); err != nil {
		return err
	}
	return nil
}

var _ = context.Background
var _ = services.Storage