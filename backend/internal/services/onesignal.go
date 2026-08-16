package services

import (
	"bytes"
	"context"
	"encoding/json"
	"io"
	"log"
	"net/http"
	"strings"
	"time"

	"kemenag-backend/internal/config"
)

var onesignalHTTPClient = &http.Client{
	Timeout: 10 * time.Second,
	Transport: &http.Transport{
		MaxIdleConns:        20,
		MaxIdleConnsPerHost: 5,
		IdleConnTimeout:     60 * time.Second,
	},
}

// SendNewsPushNotification mengirim notifikasi push web/mobile via OneSignal REST API.
func SendNewsPushNotification(title, slug, excerpt, imageURL string) {
	defer func() {
		if r := recover(); r != nil {
			log.Printf("[onesignal] panic terisolasi pada SendNewsPushNotification: %v", r)
		}
	}()

	apiKey := strings.TrimSpace(config.Cfg.OneSignalAPIKey)
	appID := strings.TrimSpace(config.Cfg.OneSignalAppID)

	if apiKey == "" || appID == "" {
		log.Println("[onesignal] push dilewati: ONESIGNAL_REST_API_KEY atau ONESIGNAL_APP_ID belum dikonfigurasi")
		return
	}

	cleanTitle := strings.TrimSpace(title)
	if cleanTitle == "" {
		cleanTitle = "Berita Terbaru Kemenag Barito Utara"
	}

	cleanExcerpt := strings.TrimSpace(excerpt)
	if cleanExcerpt == "" {
		cleanExcerpt = cleanTitle
	}

	siteURL := strings.TrimRight(config.Cfg.SiteURL, "/")
	if siteURL == "" {
		siteURL = "https://baritoutara.kemenag.go.id"
	}

	targetURL := siteURL + "/berita/" + strings.TrimPrefix(slug, "/")

	payload := map[string]any{
		"app_id":            appID,
		"included_segments": []string{"Subscribed Users"},
		"headings": map[string]string{
			"en": cleanTitle,
			"id": cleanTitle,
		},
		"contents": map[string]string{
			"en": cleanExcerpt,
			"id": cleanExcerpt,
		},
		"url": targetURL,
	}

	// Format gambar bila tersedia
	cleanImage := strings.TrimSpace(imageURL)
	if cleanImage != "" {
		var fullImageURL string
		if strings.HasPrefix(cleanImage, "http://") || strings.HasPrefix(cleanImage, "https://") {
			fullImageURL = cleanImage
		} else if strings.HasPrefix(cleanImage, "/") {
			fullImageURL = siteURL + cleanImage
		}

		if fullImageURL != "" {
			payload["big_picture"] = fullImageURL
			payload["chrome_big_picture"] = fullImageURL
			payload["firefox_big_picture"] = fullImageURL
			payload["ios_attachments"] = map[string]string{"cover": fullImageURL}
		}
	}

	bodyBytes, err := json.Marshal(payload)
	if err != nil {
		log.Printf("[onesignal] gagal serialize json payload: %v", err)
		return
	}

	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	req, err := http.NewRequestWithContext(ctx, http.MethodPost,
		"https://onesignal.com/api/v1/notifications", bytes.NewReader(bodyBytes))
	if err != nil {
		log.Printf("[onesignal] gagal membuat http request: %v", err)
		return
	}

	req.Header.Set("Content-Type", "application/json; charset=utf-8")

	// Format auth header OneSignal (Basic atau Key)
	if strings.HasPrefix(apiKey, "Basic ") || strings.HasPrefix(apiKey, "Key ") {
		req.Header.Set("Authorization", apiKey)
	} else {
		req.Header.Set("Authorization", "Basic "+apiKey)
	}

	resp, err := onesignalHTTPClient.Do(req)
	if err != nil {
		log.Printf("[onesignal] gagal mengirim http push request: %v", err)
		return
	}
	defer resp.Body.Close()

	respBody, _ := io.ReadAll(io.LimitReader(resp.Body, 4096))
	if resp.StatusCode >= 300 {
		log.Printf("[onesignal] push gagal (HTTP %d): %s", resp.StatusCode, strings.TrimSpace(string(respBody)))
	} else {
		log.Printf("[onesignal] push terkirim sukses: \"%s\" (status %d)", cleanTitle, resp.StatusCode)
	}
}
