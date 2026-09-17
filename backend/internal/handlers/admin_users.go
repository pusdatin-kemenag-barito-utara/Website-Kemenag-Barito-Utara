package handlers

import (
	"context"
	"encoding/json"
	"strings"
	"time"

	"kemenag-backend/internal/db"
	"kemenag-backend/internal/middleware"
	"kemenag-backend/internal/response"
	"kemenag-backend/internal/services"

	"github.com/gofiber/fiber/v3"
)

type AdminUserDTO struct {
	UserID      string   `json:"id"`
	Email       string   `json:"email"`
	FullName    string   `json:"fullName"`
	Role        string   `json:"role"`
	Status      string   `json:"status"`
	IsActive    bool     `json:"isActive"`
	AvatarURL   string   `json:"avatarUrl"`
	Permissions []string `json:"permissions"`
	CreatedAt   string   `json:"createdAt"`
	UpdatedAt   string   `json:"updatedAt"`
}

// AdminUsersListHandler — GET /api/admin/users
func AdminUsersListHandler(c fiber.Ctx) error {
	_, pc, err := middleware.RequireAdmin(c, middleware.AdminAuthOpts{})
	if err != nil {
		return err
	}
	if !pc.IsSuperAdmin && !pc.IsAdmin {
		return response.Error(c, 403, "Hanya Super Admin & Admin yang dapat melihat daftar pengguna.", "FORBIDDEN")
	}

	ctx, cancel := context.WithTimeout(c.Context(), 5*time.Second)
	defer cancel()

	pool := db.Get()
	if pool == nil {
		return response.Error(c, 503, "Database tidak tersedia", "DB_UNAVAILABLE")
	}

	rows, err := pool.Query(ctx, `
		SELECT user_id, COALESCE(email, ''), COALESCE(full_name, ''), COALESCE(role, 'editor'),
		       COALESCE(status, 'active'), is_active, COALESCE(avatar_url, ''),
		       COALESCE(permissions, '[]'::jsonb), created_at, updated_at
		FROM kemenag_website.admin_users
		ORDER BY created_at ASC
	`)
	if err != nil {
		return response.Error(c, 500, "Gagal mengambil daftar pengguna: "+err.Error(), "QUERY_FAILED")
	}
	defer rows.Close()

	var list []AdminUserDTO
	for rows.Next() {
		var u AdminUserDTO
		var permJSON []byte
		var cr, up time.Time
		if err := rows.Scan(&u.UserID, &u.Email, &u.FullName, &u.Role, &u.Status, &u.IsActive, &u.AvatarURL, &permJSON, &cr, &up); err == nil {
			u.CreatedAt = cr.Format(time.RFC3339)
			u.UpdatedAt = up.Format(time.RFC3339)
			if len(permJSON) > 0 {
				_ = json.Unmarshal(permJSON, &u.Permissions)
			}
			if u.Permissions == nil {
				u.Permissions = []string{}
			}
			list = append(list, u)
		}
	}

	return response.OK(c, fiber.Map{
		"ok":    true,
		"users": list,
	})
}

// AdminUsersCreateHandler — POST /api/admin/users
func AdminUsersCreateHandler(c fiber.Ctx) error {
	session, pc, err := middleware.RequireAdmin(c, middleware.AdminAuthOpts{})
	if err != nil {
		return err
	}
	if !pc.IsSuperAdmin {
		return response.Error(c, 403, "Hanya Super Admin yang dapat menambahkan admin baru.", "FORBIDDEN")
	}

	var body struct {
		Email       string   `json:"email"`
		Password    string   `json:"password"`
		FullName    string   `json:"fullName"`
		Role        string   `json:"role"`
		Permissions []string `json:"permissions"`
	}
	if err := c.Bind().Body(&body); err != nil {
		return response.Error(c, 400, "Body tidak valid", "INVALID_BODY")
	}

	email := strings.ToLower(strings.TrimSpace(body.Email))
	if email == "" || !strings.Contains(email, "@") {
		return response.Error(c, 400, "Format email tidak valid.", "VALIDATION_ERROR")
	}

	role := strings.ToLower(strings.TrimSpace(body.Role))
	if role != "super_admin" && role != "admin" && role != "editor" {
		role = "editor"
	}

	ctx, cancel := context.WithTimeout(c.Context(), 15*time.Second)
	defer cancel()

	pool := db.Get()
	if pool == nil {
		return response.Error(c, 503, "Database tidak tersedia", "DB_UNAVAILABLE")
	}

	// 1. Cek apakah sudah ada di kemenag_website.admin_users
	var existingID string
	_ = pool.QueryRow(ctx, `SELECT user_id FROM kemenag_website.admin_users WHERE email = $1 LIMIT 1`, email).Scan(&existingID)
	if existingID != "" {
		return response.Error(c, 409, "Pengguna dengan email ini sudah terdaftar sebagai admin.", "ALREADY_EXISTS")
	}

	// 2. Dapatkan atau buat user di Supabase Auth
	var targetUserID string
	users, _ := services.Supabase.AdminListUsers(ctx)
	for _, u := range users {
		if strings.EqualFold(u.Email, email) {
			targetUserID = u.ID
			break
		}
	}

	if targetUserID == "" {
		if len(body.Password) < 8 {
			return response.Error(c, 400, "Password minimal 8 karakter untuk membuat akun auth baru.", "VALIDATION_ERROR")
		}
		newAuthUser, err := services.Supabase.AdminCreateUser(ctx, map[string]any{
			"email":         email,
			"password":      body.Password,
			"email_confirm": true,
			"user_metadata": map[string]any{
				"full_name": body.FullName,
			},
		})
		if err != nil {
			return response.Error(c, 500, "Gagal membuat user Supabase Auth: "+err.Error(), "AUTH_CREATE_FAILED")
		}
		targetUserID = newAuthUser.ID
	}

	permJSON, _ := json.Marshal(body.Permissions)

	// 3. Masukkan ke kemenag_website.admin_users
	_, err = pool.Exec(ctx, `
		INSERT INTO kemenag_website.admin_users (user_id, email, full_name, role, status, is_active, permissions, created_at, updated_at)
		VALUES ($1, $2, $3, $4, 'active', true, $5::jsonb, now(), now())
		ON CONFLICT (user_id) DO UPDATE SET
			email = EXCLUDED.email,
			full_name = EXCLUDED.full_name,
			role = EXCLUDED.role,
			status = 'active',
			is_active = true,
			permissions = EXCLUDED.permissions,
			updated_at = now()
	`, targetUserID, email, body.FullName, role, string(permJSON))
	if err != nil {
		return response.Error(c, 500, "Gagal menyimpan data pengguna admin: "+err.Error(), "INSERT_FAILED")
	}

	middleware.InvalidateProfileCache(targetUserID)

	services.Audit.Record(struct {
		Action      string
		Entity      string
		EntityID    string
		PerformedBy string
		Before      any
		After       any
		IP          any
	}{
		Action: "create", Entity: "admin_users", EntityID: targetUserID,
		PerformedBy: session.UserEmail(),
		After:       body,
		IP:          middleware.GetClientIP(c),
	})

	return response.OK(c, fiber.Map{
		"ok":      true,
		"message": "Pengguna admin berhasil ditambahkan.",
		"id":      targetUserID,
	})
}

// AdminUsersUpdateHandler — PUT /api/admin/users/:id
func AdminUsersUpdateHandler(c fiber.Ctx) error {
	session, pc, err := middleware.RequireAdmin(c, middleware.AdminAuthOpts{})
	if err != nil {
		return err
	}
	if !pc.IsSuperAdmin {
		return response.Error(c, 403, "Hanya Super Admin yang dapat mengubah data pengguna admin.", "FORBIDDEN")
	}

	targetID := strings.TrimSpace(c.Params("id"))
	if targetID == "" {
		return response.Error(c, 400, "ID pengguna wajib disertakan.", "INVALID_ID")
	}

	var body struct {
		FullName    *string  `json:"fullName"`
		Role        *string  `json:"role"`
		Status      *string  `json:"status"`
		IsActive    *bool    `json:"isActive"`
		Permissions []string `json:"permissions"`
	}
	if err := c.Bind().Body(&body); err != nil {
		return response.Error(c, 400, "Body tidak valid", "INVALID_BODY")
	}

	ctx, cancel := context.WithTimeout(c.Context(), 10*time.Second)
	defer cancel()

	pool := db.Get()
	if pool == nil {
		return response.Error(c, 503, "Database tidak tersedia", "DB_UNAVAILABLE")
	}

	// Update columns
	var role string
	if body.Role != nil {
		r := strings.ToLower(strings.TrimSpace(*body.Role))
		if r == "super_admin" || r == "admin" || r == "editor" {
			role = r
		}
	}

	isActive := true
	if body.IsActive != nil {
		isActive = *body.IsActive
	}
	status := "active"
	if body.Status != nil && *body.Status != "" {
		status = *body.Status
	}
	if !isActive {
		status = "inactive"
	}

	var permJSON []byte
	if body.Permissions != nil {
		permJSON, _ = json.Marshal(body.Permissions)
	}

	res, err := pool.Exec(ctx, `
		UPDATE kemenag_website.admin_users
		SET full_name = COALESCE($1, full_name),
		    role = CASE WHEN $2 != '' THEN $2 ELSE role END,
		    status = $3,
		    is_active = $4,
		    permissions = CASE WHEN $5::text != '' THEN $5::jsonb ELSE permissions END,
		    updated_at = now()
		WHERE user_id = $6
	`, body.FullName, role, status, isActive, string(permJSON), targetID)
	if err != nil {
		return response.Error(c, 500, "Gagal memperbarui pengguna: "+err.Error(), "UPDATE_FAILED")
	}
	if res.RowsAffected() == 0 {
		return response.Error(c, 404, "Pengguna tidak ditemukan", "NOT_FOUND")
	}

	middleware.InvalidateProfileCache(targetID)

	services.Audit.Record(struct {
		Action      string
		Entity      string
		EntityID    string
		PerformedBy string
		Before      any
		After       any
		IP          any
	}{
		Action: "update", Entity: "admin_users", EntityID: targetID,
		PerformedBy: session.UserEmail(),
		After:       body,
		IP:          middleware.GetClientIP(c),
	})

	return response.OK(c, fiber.Map{"ok": true, "message": "Pengguna admin berhasil diperbarui."})
}

// AdminUsersDeleteHandler — DELETE /api/admin/users/:id
func AdminUsersDeleteHandler(c fiber.Ctx) error {
	session, pc, err := middleware.RequireAdmin(c, middleware.AdminAuthOpts{})
	if err != nil {
		return err
	}
	if !pc.IsSuperAdmin {
		return response.Error(c, 403, "Hanya Super Admin yang dapat menghapus admin.", "FORBIDDEN")
	}

	targetID := strings.TrimSpace(c.Params("id"))
	if targetID == "" {
		return response.Error(c, 400, "ID pengguna wajib disertakan.", "INVALID_ID")
	}

	// Jangan izinkan hapus diri sendiri
	if session.ProfileID() == targetID || session.UserID() == targetID {
		return response.Error(c, 400, "Anda tidak dapat menghapus akun Anda sendiri.", "CANNOT_DELETE_SELF")
	}

	ctx, cancel := context.WithTimeout(c.Context(), 10*time.Second)
	defer cancel()

	pool := db.Get()
	if pool == nil {
		return response.Error(c, 503, "Database tidak tersedia", "DB_UNAVAILABLE")
	}

	_, err = pool.Exec(ctx, `DELETE FROM kemenag_website.admin_users WHERE user_id = $1`, targetID)
	if err != nil {
		return response.Error(c, 500, "Gagal menghapus admin: "+err.Error(), "DELETE_FAILED")
	}

	middleware.InvalidateProfileCache(targetID)

	services.Audit.Record(struct {
		Action      string
		Entity      string
		EntityID    string
		PerformedBy string
		Before      any
		After       any
		IP          any
	}{
		Action: "delete", Entity: "admin_users", EntityID: targetID,
		PerformedBy: session.UserEmail(),
		IP:          middleware.GetClientIP(c),
	})

	return response.OK(c, fiber.Map{"ok": true, "message": "Pengguna admin berhasil dihapus."})
}
