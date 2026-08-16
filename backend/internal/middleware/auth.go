package middleware

import (
	"context"
	"encoding/base64"
	"encoding/json"
	"fmt"
	"log"
	"net/url"
	"strings"
	"sync"
	"time"

	"kemenag-backend/internal/config"
	"kemenag-backend/internal/db"
	"kemenag-backend/internal/services"

	"github.com/gofiber/fiber/v2"
)

const CookieName = "sb-website-auth-token"

// SessionContext setara SessionContext di auth.ts.
type SessionContext struct {
	User            *services.SupabaseUser
	Profile         map[string]any
	Role            string
	IsAuthenticated bool
	IsAdmin         bool
	IsEditor        bool
	HasAdminAccess  bool
}

// PermissionContext setara PermissionContext di user-permissions.ts.
type PermissionContext struct {
	Role         string
	Email        string
	IsSuperAdmin bool
	IsAdmin      bool
	IsEditor     bool
	IsActive     bool
	Approved     bool
	Permissions  []string
}

var (
	profileCacheMu sync.Mutex
	profileCache   = map[string]cachedProfile{}
)

type cachedProfile struct {
	profile map[string]any
	role    string
	expires time.Time
}

// GetAccessTokenFromCookie membaca & decode cookie sesi Supabase (base64 JSON / raw token).
func GetAccessTokenFromCookie(c *fiber.Ctx) string {
	authHeader := c.Get("Authorization")
	if strings.HasPrefix(authHeader, "Bearer ") {
		return strings.TrimSpace(strings.TrimPrefix(authHeader, "Bearer "))
	}

	cookie := c.Cookies(CookieName)
	if cookie == "" {
		cookie = c.Cookies("sb-access-token")
	}
	if cookie == "" {
		cookie = c.Cookies("supabase-auth-token")
	}
	if cookie == "" {
		return ""
	}
	token, err := decodeTokenCookie(cookie)
	if err != nil {
		return ""
	}
	return token
}

func decodeTokenCookie(cookie string) (string, error) {
	cookie = strings.TrimSpace(cookie)
	if unescaped, err := url.QueryUnescape(cookie); err == nil {
		cookie = unescaped
	}
	cookie = strings.Trim(cookie, "\"")
	cookie = strings.TrimPrefix(cookie, "base64-")

	// 1. Jika langsung berupa token JWT (format ey...xxx.yyy)
	if strings.HasPrefix(cookie, "ey") && strings.Count(cookie, ".") >= 2 {
		return cookie, nil
	}

	// 2. Jika berupa JSON plain string
	var plainSession struct {
		AccessToken string `json:"access_token"`
	}
	if err := json.Unmarshal([]byte(cookie), &plainSession); err == nil && plainSession.AccessToken != "" {
		return plainSession.AccessToken, nil
	}

	// 3. Coba decode base64
	var data []byte
	var err error
	for _, enc := range []*base64.Encoding{
		base64.StdEncoding, base64.RawStdEncoding,
		base64.URLEncoding, base64.RawURLEncoding,
	} {
		data, err = enc.DecodeString(cookie)
		if err == nil {
			break
		}
	}
	if err != nil {
		return "", err
	}

	var session struct {
		AccessToken string `json:"access_token"`
	}
	if err := json.Unmarshal(data, &session); err == nil && session.AccessToken != "" {
		return session.AccessToken, nil
	}

	// Fallback jika hasil decode adalah raw string JWT
	decodedStr := strings.TrimSpace(string(data))
	if strings.HasPrefix(decodedStr, "ey") && strings.Count(decodedStr, ".") >= 2 {
		return decodedStr, nil
	}

	return "", fmt.Errorf("access token tidak ditemukan dalam cookie")
}

var (
	userCacheMu sync.Mutex
	userCache   = map[string]cachedUser{}
)

type cachedUser struct {
	user    *services.SupabaseUser
	expires time.Time
}

// LoadSession memuat sesi dari cookie (user + profile + role).
func LoadSession(c *fiber.Ctx) *SessionContext {
	ctx, cancel := context.WithTimeout(c.Context(), 8*time.Second)
	defer cancel()

	accessToken := GetAccessTokenFromCookie(c)
	if accessToken == "" {
		return &SessionContext{}
	}

	userCacheMu.Lock()
	if cached, ok := userCache[accessToken]; ok && time.Now().Before(cached.expires) {
		userCacheMu.Unlock()
		return BuildSessionFromUser(ctx, cached.user)
	}
	userCacheMu.Unlock()

	user, err := services.Supabase.GetUser(ctx, accessToken)
	if err != nil {
		log.Printf("[auth error] Supabase.GetUser gagal di path %s: %v", c.Path(), err)
		return &SessionContext{}
	}

	userCacheMu.Lock()
	userCache[accessToken] = cachedUser{user: user, expires: time.Now().Add(60 * time.Second)}
	userCacheMu.Unlock()

	return BuildSessionFromUser(ctx, user)
}

// BuildSessionFromUser membuat SessionContext dari user (profil + role dari DB).
func BuildSessionFromUser(ctx context.Context, user *services.SupabaseUser) *SessionContext {
	profile, role := getProfileAndRole(ctx, user.ID)

	currentEmail := strings.ToLower(strings.TrimSpace(firstNonEmptyStr(user.Email, mapStr(profile, "email"))))

	if config.Cfg.SuperAdminEmail != "" && currentEmail == config.Cfg.SuperAdminEmail {
		role = "super_admin"
	}

	if role == "" {
		if r, ok := user.AppMetadata["role"].(string); ok && r != "" {
			role = strings.ToLower(strings.TrimSpace(r))
		} else if r, ok := user.UserMetadata["role"].(string); ok && r != "" {
			role = strings.ToLower(strings.TrimSpace(r))
		}
	}

	role = normalizeRole(role)
	isAdmin := role == "admin" || role == "super_admin"
	isEditor := role == "editor" || isAdmin

	return &SessionContext{
		User:            user,
		Profile:         profile,
		Role:            role,
		IsAuthenticated: true,
		IsAdmin:         isAdmin,
		IsEditor:        isEditor,
		HasAdminAccess:  isAdmin || isEditor,
	}
}

// getProfileAndRole: profil dari kemenag_pusdatin.profiles, fallback kemenag_website.admin_users.
func getProfileAndRole(ctx context.Context, userID string) (map[string]any, string) {
	profileCacheMu.Lock()
	if cached, ok := profileCache[userID]; ok && time.Now().Before(cached.expires) {
		profileCacheMu.Unlock()
		return cached.profile, cached.role
	}
	profileCacheMu.Unlock()

	pool := db.Get()
	profile := map[string]any{}
	role := ""

	if pool != nil {
		var id, email, dbRole, status, name, avatar string
		err := pool.QueryRow(ctx,
			`SELECT id, email, role, status, name, avatar_url
			 FROM kemenag_pusdatin.profiles WHERE id = $1 LIMIT 1`, userID).
			Scan(&id, &email, &dbRole, &status, &name, &avatar)
		if err == nil {
			profile["id"] = id
			profile["email"] = email
			profile["role"] = dbRole
			profile["status"] = status
			profile["name"] = name
			profile["avatar_url"] = avatar
			role = dbRole
		} else {
			var adminRole string
			var fullName string
			err2 := pool.QueryRow(ctx,
				`SELECT role, full_name FROM kemenag_website.admin_users WHERE user_id = $1 LIMIT 1`, userID).
				Scan(&adminRole, &fullName)
			if err2 == nil {
				profile["id"] = userID
				profile["role"] = adminRole
				profile["name"] = fullName
				role = adminRole
			}
		}
	}

	profileCacheMu.Lock()
	profileCache[userID] = cachedProfile{profile: profile, role: role, expires: time.Now().Add(30 * time.Second)}
	profileCacheMu.Unlock()
	return profile, role
}

// GetPermissionContext setara getUserPermissionContext (user-permissions.ts).
func GetPermissionContext(ctx context.Context, session *SessionContext) *PermissionContext {
	pc := &PermissionContext{
		Role:         normalizeRole(session.Role),
		Email:        firstNonEmptyStr(session.UserEmail(), mapStr(session.Profile, "email")),
		IsSuperAdmin: session.Role == "super_admin",
		IsAdmin:      session.IsAdmin,
		IsEditor:     session.IsEditor,
	}

	if session.User == nil || session.User.ID == "" {
		return pc
	}

	pool := db.Get()
	if pool != nil {
		var status, dbRole string
		err := pool.QueryRow(ctx,
			`SELECT status, role FROM kemenag_pusdatin.profiles WHERE id = $1 LIMIT 1`,
			session.User.ID).Scan(&status, &dbRole)
		if err == nil {
			pc.IsActive = status == "active"
			if dbRole == "super_admin" {
				pc.Role = "super_admin"
				pc.IsSuperAdmin = true
				pc.IsAdmin = true
				pc.IsEditor = true
				pc.Approved = true
			} else {
				var appRole string
				var featuresJSON []byte
				err2 := pool.QueryRow(ctx,
					`SELECT role, features FROM kemenag_pusdatin.app_permissions
					 WHERE user_id = $1 AND app_id = 'website-kemenag' LIMIT 1`,
					session.User.ID).Scan(&appRole, &featuresJSON)
				if err2 == nil {
					pc.Role = normalizeRole(appRole)
					pc.Approved = true
					if len(featuresJSON) > 0 {
						var features []map[string]any
						if err := json.Unmarshal(featuresJSON, &features); err == nil {
							for _, f := range features {
								if id, ok := f["id"].(string); ok && id != "" {
									pc.Permissions = append(pc.Permissions, id)
								}
							}
						} else {
							var flat []string
							if err := json.Unmarshal(featuresJSON, &flat); err == nil {
								pc.Permissions = append(pc.Permissions, flat...)
							}
						}
					}
				}
			}
		}
	}

	base := RolePermissions(pc.Role)
	merged := make([]string, 0, len(base)+len(pc.Permissions))
	seen := map[string]bool{}
	for _, p := range append(base, pc.Permissions...) {
		if p != "" && !seen[p] {
			seen[p] = true
			merged = append(merged, p)
		}
	}
	pc.Permissions = merged

	switch pc.Role {
	case "admin":
		pc.IsAdmin = true
		pc.IsEditor = true
	case "super_admin":
		pc.IsSuperAdmin = true
		pc.IsAdmin = true
		pc.IsEditor = true
	case "editor":
		pc.IsEditor = true
	}
	return pc
}

// HasPermission cek permission dalam context (hasUserPermission).
func HasPermission(pc *PermissionContext, permission string) bool {
	if pc == nil || permission == "" {
		return false
	}
	if pc.IsSuperAdmin {
		return true
	}
	for _, p := range pc.Permissions {
		if p == permission {
			return true
		}
	}
	return false
}

// RolePermissions setara getRolePermissions (permissions.ts).
func RolePermissions(role string) []string {
	switch normalizeRole(role) {
	case "super_admin":
		return allPermissions()
	case "admin":
		return []string{
			"dashboard:view", "berita:view", "berita:create", "berita:update",
			"berita:delete", "berita:publish", "galeri:view", "galeri:manage",
			"kontak:manage", "laporan:view", "laporan:manage", "homepage_slides:view",
			"homepage_slides:manage", "seksi:manage",
		}
	case "editor":
		return []string{
			"dashboard:view", "berita:view", "berita:create", "berita:update",
			"galeri:view", "laporan:view",
		}
	default:
		return nil
	}
}

func allPermissions() []string {
	return []string{
		"dashboard:view", "berita:view", "berita:create", "berita:update",
		"berita:delete", "berita:publish", "galeri:view", "galeri:manage",
		"kontak:manage", "laporan:view", "laporan:manage", "homepage_slides:view",
		"homepage_slides:manage", "audit:view", "user:view", "user:invite",
		"user:update_role", "user:delete", "seksi:manage", "settings:manage",
	}
}

func normalizeRole(r string) string {
	return strings.ToLower(strings.TrimSpace(r))
}

func mapStr(m map[string]any, key string) string {
	if v, ok := m[key].(string); ok {
		return v
	}
	return ""
}

func firstNonEmptyStr(vals ...string) string {
	for _, v := range vals {
		if strings.TrimSpace(v) != "" {
			return strings.TrimSpace(v)
		}
	}
	return ""
}

// UserEmail helper.
func (s *SessionContext) UserEmail() string {
	if s == nil || s.User == nil {
		return ""
	}
	return s.User.Email
}

// UserID helper.
func (s *SessionContext) UserID() string {
	if s == nil || s.User == nil {
		return ""
	}
	return s.User.ID
}

// ProfileID helper.
func (s *SessionContext) ProfileID() string {
	if s == nil {
		return ""
	}
	return mapStr(s.Profile, "id")
}
