package services

import (
	"context"
	"fmt"
	"io"
	"net/http"
	"net/url"
	"strings"
	"time"

	"kemenag-backend/internal/config"
)

// StorageClient mengelola Supabase Storage (bucket cms-media & laporan-documents).
type StorageClient struct {
	BaseURL string // {supabaseUrl}/storage/v1
	Service string
	HTTP    *http.Client
}

var Storage *StorageClient

func InitStorage() {
	Storage = &StorageClient{
		BaseURL: config.Cfg.SupabaseURL + "/storage/v1",
		Service: config.Cfg.ServiceRoleKey,
		HTTP:    &http.Client{Timeout: 30 * time.Second},
	}
}

const (
	CMSPath         = "cms-media"
	LaporanBucket   = "laporan-documents"
	AllowedMime     = "image/jpeg,image/png,image/webp"
	MediaPublicPath = "/api/storage/media/"
)

// UploadBase64Image upload gambar base64 → path {folder}/{yyyy}/{mm}/{stem}-{ts}-{uuid}.{ext}.
func (s *StorageClient) UploadBase64Image(ctx context.Context, dataURL, folder, fileNameStem string) (path, publicURL, mimeType string, size int64, err error) {
	idx := strings.Index(dataURL, ";base64,")
	if idx < 0 {
		return "", "", "", 0, fmt.Errorf("format base64 gambar tidak valid")
	}
	mime := strings.TrimPrefix(dataURL[:idx], "data:")
	if mime != "image/jpeg" && mime != "image/png" && mime != "image/webp" {
		return "", "", "", 0, fmt.Errorf("tipe file gambar tidak didukung")
	}
	raw := dataURL[idx+len(";base64,"):]
	decoded, err := decodeBase64(raw)
	if err != nil {
		return "", "", "", 0, fmt.Errorf("decode base64 gagal")
	}

	ext := map[string]string{"image/jpeg": "jpg", "image/png": "png", "image/webp": "webp"}[mime]
	storagePath := BuildStoragePath(folder, fileNameStem, ext)

	err = s.UploadObject(ctx, CMSPath, storagePath, decoded, mime, true)
	if err != nil {
		return "", "", "", 0, err
	}

	public := s.PublicURL(CMSPath, storagePath)
	return storagePath, public, mime, int64(len(decoded)), nil
}

// UploadObject upload bytes ke bucket (service role, x-upsert).
func (s *StorageClient) UploadObject(ctx context.Context, bucket, path string, data []byte, contentType string, upsert bool) error {
	req, err := http.NewRequestWithContext(ctx, http.MethodPost,
		s.BaseURL+"/object/"+bucket+"/"+url.PathEscape(path), strings.NewReader(string(data)))
	if err != nil {
		return err
	}
	req.Header.Set("Authorization", "Bearer "+s.Service)
	req.Header.Set("apikey", s.Service)
	req.Header.Set("Content-Type", contentType)
	if upsert {
		req.Header.Set("x-upsert", "true")
	}
	resp, err := s.HTTP.Do(req)
	if err != nil {
		return err
	}
	defer resp.Body.Close()
	if resp.StatusCode >= 400 {
		b, _ := io.ReadAll(io.LimitReader(resp.Body, 8<<10))
		return fmt.Errorf("upload storage %s: %d %s", path, resp.StatusCode, truncateStr(string(b), 150))
	}
	return nil
}

// RemoveObject hapus object.
func (s *StorageClient) RemoveObject(ctx context.Context, bucket, path string) error {
	req, err := http.NewRequestWithContext(ctx, http.MethodDelete,
		s.BaseURL+"/object/"+bucket, strings.NewReader(fmt.Sprintf(`{"prefixes":["%s"]}`, path)))
	if err != nil {
		return err
	}
	req.Header.Set("Authorization", "Bearer "+s.Service)
	req.Header.Set("apikey", s.Service)
	req.Header.Set("Content-Type", "application/json")
	resp, err := s.HTTP.Do(req)
	if err != nil {
		return err
	}
	defer resp.Body.Close()
	return nil
}

// PublicURL: URL publik object (digunakan sebagai fallback, utama via /api/storage/media/).
func (s *StorageClient) PublicURL(bucket, path string) string {
	return config.Cfg.CDNBase + MediaPublicPath + path
}

// ResolvePublicFileUrl: konversi public URL → upstream file URL untuk proxy fetch.
func (s *StorageClient) ResolvePublicFileUrl(ctx context.Context, publicURL string) (string, error) {
	path := ExtractStoragePath(publicURL)
	if path == "" {
		return "", fmt.Errorf("path tidak ditemukan")
	}
	return s.BaseURL + "/object/public/" + CMSPath + "/" + path, nil
}

// RemoveFileByPublicUrl: hapus file dari bucket cms-media berdasarkan public URL.
func (s *StorageClient) RemoveFileByPublicUrl(ctx context.Context, publicURL string) bool {
	path := ExtractStoragePath(publicURL)
	if path == "" {
		return false
	}
	err := s.RemoveObject(ctx, CMSPath, path)
	return err == nil
}

// ExtractStoragePath: ambil path dari URL "/api/storage/media/..." atau
// "{base}/storage/v1/object/public/{bucket}/...".
func ExtractStoragePath(publicURL string) string {
	if publicURL == "" {
		return ""
	}
	marker := MediaPublicPath // /api/storage/media/
	if idx := strings.Index(publicURL, marker); idx != -1 {
		return strings.TrimPrefix(publicURL[idx+len(marker):], "/")
	}
	sbMarker := "/storage/v1/object/public/"
	if idx := strings.Index(publicURL, sbMarker); idx != -1 {
		rest := publicURL[idx+len(sbMarker):]
		parts := strings.Split(rest, "/")
		if len(parts) > 1 {
			return strings.Join(parts[1:], "/")
		}
	}
	return ""
}

// IsCMSStorageURL: apakah URL mengarah ke storage CMS internal.
func IsCMSStorageURL(publicURL string) bool {
	return ExtractStoragePath(publicURL) != ""
}

// BuildStoragePath pola path {folder}/{yyyy}/{mm}/{stem}-{ts}-{uuid}.{ext}.
func BuildStoragePath(folder, fileNameStem, ext string) string {
	now := time.Now()
	f := SanitizeSegment(folder)
	if f == "" {
		f = "media"
	}
	stem := SanitizeSegment(fileNameStem)
	if stem == "" {
		stem = "image"
	}
	ts := now.Format("20060102-150405")
	uid := newUUID()
	return fmt.Sprintf("%s/%04d/%02d/%s-%s-%s.%s", f, now.Year(), int(now.Month()), stem, ts, uid, ext)
}

// SanitizeSegment pola dari storage-media.ts.
func SanitizeSegment(value string) string {
	v := strings.ToLower(strings.TrimSpace(value))
	var b strings.Builder
	lastDash := false
	for _, r := range v {
		ok := r >= 'a' && r <= 'z' || r >= '0' && r <= '9' || r == '-' || r == '_'
		if ok {
			b.WriteRune(r)
			lastDash = false
		} else if !lastDash {
			b.WriteRune('-')
			lastDash = true
		}
	}
	out := strings.Trim(b.String(), "-")
	return out
}
