package services

import (
	"bytes"
	"context"
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"strings"
	"time"

	"kemenag-backend/internal/config"
)

// SupabaseClient klien REST ke Supabase Auth & Storage.
type SupabaseClient struct {
	BaseURL    string
	AnonKey    string
	ServiceKey string
	HTTP       *http.Client
}

var Supabase *SupabaseClient

func InitSupabase() {
	Supabase = &SupabaseClient{
		BaseURL:    config.Cfg.SupabaseURL,
		AnonKey:    config.Cfg.SupabaseAnon,
		ServiceKey: config.Cfg.ServiceRoleKey,
		HTTP: &http.Client{
			Timeout: 15 * time.Second,
		},
	}
}

type SupabaseUser struct {
	ID           string         `json:"id"`
	Email        string         `json:"email"`
	AppMetadata  map[string]any `json:"app_metadata"`
	UserMetadata map[string]any `json:"user_metadata"`
}

type Session struct {
	AccessToken  string        `json:"access_token"`
	RefreshToken string        `json:"refresh_token"`
	ExpiresIn    int           `json:"expires_in"`
	ExpiresAt    int64         `json:"expires_at"`
	TokenType    string        `json:"token_type"`
	User         SupabaseUser  `json:"user"`
}

func parseSupabaseUser(data []byte) (*SupabaseUser, error) {
	if len(data) == 0 {
		return nil, fmt.Errorf("response user kosong")
	}
	var direct SupabaseUser
	if err := json.Unmarshal(data, &direct); err == nil && direct.ID != "" {
		return &direct, nil
	}
	var wrapped struct {
		User *SupabaseUser `json:"user"`
	}
	if err := json.Unmarshal(data, &wrapped); err == nil && wrapped.User != nil && wrapped.User.ID != "" {
		return wrapped.User, nil
	}
	return nil, fmt.Errorf("user tidak ditemukan dalam response: %s", truncateStr(string(data), 100))
}

// GetUser memverifikasi access token via /auth/v1/user.
func (s *SupabaseClient) GetUser(ctx context.Context, accessToken string) (*SupabaseUser, error) {
	if accessToken == "" {
		return nil, fmt.Errorf("access token kosong")
	}
	var raw json.RawMessage
	err := s.doJSON(ctx, http.MethodGet, "/auth/v1/user", nil, &raw, map[string]string{
		"Authorization": "Bearer " + accessToken,
		"apikey":        s.AnonKey,
	})
	if err != nil {
		return nil, err
	}
	return parseSupabaseUser(raw)
}

// SignIn login email/password (grant_type=password).
func (s *SupabaseClient) SignIn(ctx context.Context, email, password string) (*Session, error) {
	body, _ := json.Marshal(map[string]any{
		"email":    email,
		"password": password,
	})
	var out Session
	err := s.doJSON(ctx, http.MethodPost, "/auth/v1/token?grant_type=password", body, &out, map[string]string{
		"apikey": s.AnonKey,
		"Content-Type": "application/json",
	})
	if err != nil {
		return nil, err
	}
	if out.AccessToken == "" {
		return nil, fmt.Errorf("login gagal")
	}
	return &out, nil
}

// SignOut logout.
func (s *SupabaseClient) SignOut(ctx context.Context, accessToken string) error {
	return s.doJSON(ctx, http.MethodPost, "/auth/v1/logout", nil, nil, map[string]string{
		"Authorization": "Bearer " + accessToken,
		"apikey":        s.AnonKey,
	})
}

// AdminGetUser ambil user by id dengan service role.
func (s *SupabaseClient) AdminGetUser(ctx context.Context, id string) (*SupabaseUser, error) {
	var raw json.RawMessage
	err := s.doJSON(ctx, http.MethodGet, "/auth/v1/admin/users/"+id, nil, &raw, s.adminHeaders())
	if err != nil {
		return nil, err
	}
	return parseSupabaseUser(raw)
}

// AdminUpdateUser update user (email, user_metadata) dengan service role.
func (s *SupabaseClient) AdminUpdateUser(ctx context.Context, id string, attrs map[string]any) (*SupabaseUser, error) {
	body, _ := json.Marshal(attrs)
	var raw json.RawMessage
	err := s.doJSON(ctx, http.MethodPut, "/auth/v1/admin/users/"+id, body, &raw, s.adminHeaders())
	if err != nil {
		return nil, err
	}
	return parseSupabaseUser(raw)
}

// AdminListUsers daftar user (per_page 1000).
func (s *SupabaseClient) AdminListUsers(ctx context.Context) ([]SupabaseUser, error) {
	var out struct {
		Users []SupabaseUser `json:"users"`
	}
	err := s.doJSON(ctx, http.MethodGet, "/auth/v1/admin/users?per_page=1000&page=1", nil, &out, s.adminHeaders())
	if err != nil {
		return nil, err
	}
	return out.Users, nil
}

func (s *SupabaseClient) adminHeaders() map[string]string {
	return map[string]string{
		"Authorization": "Bearer " + s.ServiceKey,
		"apikey":        s.ServiceKey,
		"Content-Type":  "application/json",
	}
}

// doJSON helper REST dengan parsing error standar Supabase.
func (s *SupabaseClient) doJSON(ctx context.Context, method, path string, body []byte, out any, headers map[string]string) error {
	url := s.BaseURL + path
	var reader io.Reader
	if body != nil {
		reader = bytes.NewReader(body)
	}
	req, err := http.NewRequestWithContext(ctx, method, url, reader)
	if err != nil {
		return err
	}
	for k, v := range headers {
		req.Header.Set(k, v)
	}
	resp, err := s.HTTP.Do(req)
	if err != nil {
		return fmt.Errorf("supabase request: %w", err)
	}
	defer resp.Body.Close()

	data, err := io.ReadAll(io.LimitReader(resp.Body, 5<<20))
	if err != nil {
		return err
	}

	if resp.StatusCode >= 400 {
		var errBody struct {
			Message string `json:"message"`
			Code    string `json:"code"`
			Error   string `json:"error"`
			ErrorDesc string `json:"error_description"`
		}
		_ = json.Unmarshal(data, &errBody)
		msg := errBody.Message
		if msg == "" {
			msg = errBody.Error
		}
		if msg == "" {
			msg = errBody.ErrorDesc
		}
		if msg == "" {
			msg = strings.TrimSpace(string(data))
		}
		return fmt.Errorf("supabase %s: %s", path, truncateStr(msg, 200))
	}

	if out != nil && len(data) > 0 {
		return json.Unmarshal(data, out)
	}
	return nil
}

func truncateStr(s string, n int) string {
	if len(s) <= n {
		return s
	}
	return s[:n]
}

// VerifyTurnstile memvalidasi token Cloudflare Turnstile server-side.
func VerifyTurnstile(ctx context.Context, token string) bool {
	secret := config.Cfg.TurnstileSecret
	if secret == "" {
		return true // tidak dikonfigurasi → longgar
	}
	body, _ := json.Marshal(map[string]string{
		"secret":   secret,
		"response": token,
	})
	req, err := http.NewRequestWithContext(ctx, http.MethodPost,
		"https://challenges.cloudflare.com/turnstile/v0/siteverify",
		bytes.NewReader(body))
	if err != nil {
		return false
	}
	req.Header.Set("Content-Type", "application/json")
	client := &http.Client{Timeout: 5 * time.Second}
	resp, err := client.Do(req)
	if err != nil {
		return false
	}
	defer resp.Body.Close()
	var out struct {
		Success bool `json:"success"`
	}
	_ = json.NewDecoder(io.LimitReader(resp.Body, 64<<10)).Decode(&out)
	return out.Success
}
