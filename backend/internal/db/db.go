package db

import (
	"bytes"
	"context"
	"encoding/json"
	"fmt"
	"io"
	"log"
	"net/http"
	"os"
	"strings"
	"sync"
	"time"

	"kemenag-backend/internal/config"
)

var (
	baseURL    string
	client     *http.Client
	mu         sync.RWMutex
	tokenMu    sync.RWMutex
	superToken string
	tokenExp   time.Time
)

// Init menginisialisasi koneksi dan memverifikasi kesehatan PocketBase.
func Init(pocketbaseURL string) error {
	if pocketbaseURL == "" {
		return fmt.Errorf("POCKETBASE_URL tidak diatur")
	}

	mu.Lock()
	baseURL = strings.TrimRight(pocketbaseURL, "/")
	client = &http.Client{Timeout: 10 * time.Second}
	mu.Unlock()

	const maxAttempts = 3
	var lastErr error
	var pingDuration time.Duration

	for attempt := 1; attempt <= maxAttempts; attempt++ {
		ctx, cancel := context.WithTimeout(context.Background(), 4*time.Second)
		lat, err := Ping(ctx)
		cancel()
		if err == nil {
			pingDuration = lat
			lastErr = nil
			break
		}
		lastErr = err
		log.Printf("[pocketbase] percobaan koneksi ke-%d/%d gagal: %v (mencoba ulang dalam 1s...)", attempt, maxAttempts, err)
		if attempt < maxAttempts {
			time.Sleep(1 * time.Second)
		}
	}

	if lastErr != nil {
		return fmt.Errorf("ping pocketbase gagal setelah %d percobaan: %w", maxAttempts, lastErr)
	}

	log.Printf("[pocketbase] koneksi PocketBase berhasil terhubung ke %s (ping: %v)", baseURL, pingDuration.Round(100*time.Microsecond))
	return nil
}

// Ping mengecek endpoint /api/health dari PocketBase.
func Ping(ctx context.Context) (time.Duration, error) {
	mu.RLock()
	url := baseURL
	c := client
	mu.RUnlock()

	if url == "" || c == nil {
		return 0, fmt.Errorf("pocketbase belum diinisialisasi")
	}

	req, err := http.NewRequestWithContext(ctx, http.MethodGet, url+"/api/health", nil)
	if err != nil {
		return 0, err
	}

	start := time.Now()
	resp, err := c.Do(req)
	if err != nil {
		return 0, err
	}
	defer resp.Body.Close()
	lat := time.Since(start)

	if resp.StatusCode >= 400 {
		b, _ := io.ReadAll(io.LimitReader(resp.Body, 512))
		return lat, fmt.Errorf("health status %d: %s", resp.StatusCode, string(b))
	}

	return lat, nil
}

// GetURL mengembalikan base URL PocketBase
func GetURL() string {
	mu.RLock()
	defer mu.RUnlock()
	return baseURL
}

// Close no-op untuk kompatibilitas graceful shutdown
func Close() {
	// PocketBase client menggunakan HTTP connection pool bawaan net/http
}

// GetSuperuserToken mengembalikan token admin/superuser PocketBase yang di-cache di memori.
func GetSuperuserToken(ctx context.Context) (string, error) {
	tokenMu.RLock()
	if superToken != "" && time.Now().Before(tokenExp) {
		tok := superToken
		tokenMu.RUnlock()
		return tok, nil
	}
	tokenMu.RUnlock()

	tokenMu.Lock()
	defer tokenMu.Unlock()

	if superToken != "" && time.Now().Before(tokenExp) {
		return superToken, nil
	}

	mu.RLock()
	url := baseURL
	c := client
	mu.RUnlock()

	if url == "" || c == nil {
		return "", fmt.Errorf("pocketbase belum diinisialisasi")
	}

	email := strings.TrimSpace(config.Cfg.PocketBaseSuperuserEmail)
	if email == "" {
		email = strings.TrimSpace(os.Getenv("POCKETBASE_SUPERUSER_EMAIL"))
	}
	if email == "" {
		email = strings.TrimSpace(os.Getenv("SUPER_ADMIN_EMAIL"))
	}
	if email == "" {
		return "", fmt.Errorf("POCKETBASE_SUPERUSER_EMAIL atau SUPER_ADMIN_EMAIL belum dikonfigurasi di Infisical/environment")
	}

	pass := strings.TrimSpace(config.Cfg.PocketBaseSuperuserPassword)
	if pass == "" {
		pass = strings.TrimSpace(os.Getenv("POCKETBASE_SUPERUSER_PASSWORD"))
	}
	if pass == "" {
		return "", fmt.Errorf("POCKETBASE_SUPERUSER_PASSWORD belum dikonfigurasi di Infisical/environment")
	}

	bodyData, _ := json.Marshal(map[string]string{
		"identity": email,
		"password": pass,
	})

	req, err := http.NewRequestWithContext(ctx, http.MethodPost, url+"/api/collections/_superusers/auth-with-password", bytes.NewReader(bodyData))
	if err != nil {
		return "", err
	}
	req.Header.Set("Content-Type", "application/json")

	resp, err := c.Do(req)
	if err != nil {
		return "", err
	}
	defer resp.Body.Close()

	if resp.StatusCode >= 400 {
		b, _ := io.ReadAll(io.LimitReader(resp.Body, 512))
		return "", fmt.Errorf("superuser auth gagal (%d): %s", resp.StatusCode, string(b))
	}

	var res struct {
		Token string `json:"token"`
	}
	if err := json.NewDecoder(resp.Body).Decode(&res); err != nil {
		return "", err
	}
	if res.Token == "" {
		return "", fmt.Errorf("token superuser kosong")
	}

	superToken = res.Token
	tokenExp = time.Now().Add(24 * time.Hour)
	return superToken, nil
}

// PatchRecord melakukan update parsial ke record PocketBase menggunakan superuser token.
func PatchRecord(ctx context.Context, collection, id string, data any) ([]byte, error) {
	token, err := GetSuperuserToken(ctx)
	if err != nil {
		return nil, fmt.Errorf("gagal mendapatkan superuser token: %w", err)
	}

	mu.RLock()
	url := baseURL
	c := client
	mu.RUnlock()

	bodyData, err := json.Marshal(data)
	if err != nil {
		return nil, err
	}

	req, err := http.NewRequestWithContext(ctx, http.MethodPatch, fmt.Sprintf("%s/api/collections/%s/records/%s", url, collection, id), bytes.NewReader(bodyData))
	if err != nil {
		return nil, err
	}
	req.Header.Set("Authorization", token)
	req.Header.Set("Content-Type", "application/json")

	resp, err := c.Do(req)
	if err != nil {
		return nil, err
	}
	defer resp.Body.Close()

	bodyBytes, err := io.ReadAll(resp.Body)
	if err != nil {
		return nil, err
	}

	if resp.StatusCode >= 400 {
		return nil, fmt.Errorf("patch gagal (%d): %s", resp.StatusCode, string(bodyBytes))
	}

	return bodyBytes, nil
}

// GetRecordBySlug mencari record berdasarkan field slug.
func GetRecordBySlug(ctx context.Context, collection, slug string) (map[string]any, error) {
	mu.RLock()
	url := baseURL
	c := client
	mu.RUnlock()

	escapedSlug := strings.ReplaceAll(slug, "'", "\\'")
	filterUrl := fmt.Sprintf("%s/api/collections/%s/records?filter=(slug='%s')&perPage=1", url, collection, escapedSlug)

	req, err := http.NewRequestWithContext(ctx, http.MethodGet, filterUrl, nil)
	if err != nil {
		return nil, err
	}

	resp, err := c.Do(req)
	if err != nil {
		return nil, err
	}
	defer resp.Body.Close()

	if resp.StatusCode >= 400 {
		b, _ := io.ReadAll(io.LimitReader(resp.Body, 512))
		return nil, fmt.Errorf("query slug gagal (%d): %s", resp.StatusCode, string(b))
	}

	var result struct {
		Items []map[string]any `json:"items"`
	}
	if err := json.NewDecoder(resp.Body).Decode(&result); err != nil {
		return nil, err
	}

	if len(result.Items) == 0 {
		return nil, fmt.Errorf("record dengan slug '%s' tidak ditemukan", slug)
	}

	return result.Items[0], nil
}