package config

import (
	"os"
	"path/filepath"
	"strconv"
	"strings"

	"github.com/joho/godotenv"
)

// Config menyimpan seluruh konfigurasi runtime backend.
// Sumber tunggal: .env.local di root monorepo (parent dari backend/).
type Config struct {
	SiteURL        string
	SupabaseURL    string
	SupabaseAnon   string
	ServiceRoleKey string
	DatabaseURL    string
	RedisURL       string
	HasRedis       bool

	SuperAdminEmail string
	CRONSecret      string
	TurnstileSecret string

	GeminiAPIKey     string
	GroqAPIKey       string
	MistralAPIKey    string
	OpenRouterAPIKey string

	OneSignalAPIKey string
	OneSignalAppID  string

	CMSPath  string // root monorepo, dipakai utk lookup .env.local
	Port     string
	CDNBase  string
	FSMedia  string // fallback local media cache (opsional)
	InMemory bool   // force in-memory (no redis)
}

var Cfg Config

func boolEnv(key string, def bool) bool {
	v := strings.TrimSpace(os.Getenv(key))
	if v == "" {
		return def
	}
	b, err := strconv.ParseBool(v)
	if err != nil {
		return def
	}
	return b
}

// LookupRootEnv mencari .env.local mulai dari cwd naik ke parent.
func Load() error {
	dir, err := os.Getwd()
	if err != nil {
		return err
	}

	var envPath string
	for d := dir; ; d = filepath.Dir(d) {
		candidate := filepath.Join(d, ".env.local")
		if _, err := os.Stat(candidate); err == nil {
			envPath = candidate
			break
		}
		parent := filepath.Dir(d)
		if parent == d {
			break
		}
	}

	if envPath != "" {
		_ = godotenv.Load(envPath)
		Cfg.CMSPath = filepath.Dir(envPath)
	} else {
		Cfg.CMSPath = dir
	}

	Cfg.SiteURL = strings.TrimSpace(os.Getenv("NEXT_PUBLIC_SITE_URL"))
	Cfg.SupabaseURL = strings.TrimSuffix(firstNonEmpty(os.Getenv("NEXT_PUBLIC_SUPABASE_URL"), os.Getenv("SUPABASE_URL")), "/")
	Cfg.SupabaseAnon = firstNonEmpty(os.Getenv("NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY"), os.Getenv("NEXT_PUBLIC_SUPABASE_ANON_KEY"), os.Getenv("SUPABASE_ANON_KEY"))
	Cfg.ServiceRoleKey = os.Getenv("SUPABASE_SERVICE_ROLE_KEY")
	Cfg.DatabaseURL = os.Getenv("DATABASE_URL")
	Cfg.RedisURL = os.Getenv("REDIS_URL")
	Cfg.HasRedis = Cfg.RedisURL != ""
	Cfg.SuperAdminEmail = strings.ToLower(strings.TrimSpace(os.Getenv("SUPER_ADMIN_EMAIL")))
	Cfg.CRONSecret = os.Getenv("CRON_SECRET")
	Cfg.TurnstileSecret = os.Getenv("TURNSTILE_SECRET_KEY")
	Cfg.GeminiAPIKey = os.Getenv("GEMINI_API_KEY")
	Cfg.GroqAPIKey = os.Getenv("GROQ_API_KEY")
	Cfg.MistralAPIKey = os.Getenv("MISTRAL_API_KEY")
	Cfg.OpenRouterAPIKey = os.Getenv("OPENROUTER_API_KEY")
	Cfg.OneSignalAPIKey = os.Getenv("ONESIGNAL_REST_API_KEY")
	Cfg.OneSignalAppID = firstNonEmpty(os.Getenv("PUBLIC_ONESIGNAL_APP_ID"), os.Getenv("NEXT_PUBLIC_ONESIGNAL_APP_ID"), os.Getenv("ONESIGNAL_APP_ID"))
	Cfg.Port = firstNonEmpty(os.Getenv("PORT"), "8080")
	Cfg.CDNBase = strings.TrimSuffix(firstNonEmpty(os.Getenv("CDN_BASE"), Cfg.SiteURL), "/")
	return nil
}

func firstNonEmpty(values ...string) string {
	for _, v := range values {
		if strings.TrimSpace(v) != "" {
			return strings.TrimSpace(v)
		}
	}
	return ""
}