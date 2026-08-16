package middleware

import (
	"context"
	"time"

	"github.com/gofiber/fiber/v2"
)

// AdminAuthOpts setara opsi validateAdmin di cms-utils.ts.
type AdminAuthOpts struct {
	Permission  string
	AllowEditor bool
}

// AdminContext disimpan di c.Locals untuk handler.
const (
	LocalSession = "session"
	LocalPermCtx = "permission_context"
)

// RequireAdmin guard API admin — port validateAdmin({permission, allowEditor}).
// Mengembalikan (*SessionContext, *PermissionContext, error); error non-nil
// berarti response 401/403 sudah dikirim.
func RequireAdmin(c *fiber.Ctx, opts AdminAuthOpts) (*SessionContext, *PermissionContext, error) {
	session := LoadSession(c)

	if !session.IsAuthenticated {
		_ = responseJSON(c, 401, fiber.Map{
			"message": "Unauthorized.",
			"code":    "AUTH_REQUIRED",
		})
		return nil, nil, fiber.NewError(401, "AUTH_REQUIRED")
	}

	role := session.Role
	isSuperAdmin := role == "super_admin"

	if isSuperAdmin {
		pc := &PermissionContext{
			Role:         "super_admin",
			Email:        session.UserEmail(),
			IsSuperAdmin: true,
			IsAdmin:      true,
			IsEditor:     true,
			Approved:     true,
			IsActive:     true,
			Permissions:  RolePermissions("super_admin"),
		}
		c.Locals(LocalSession, session)
		c.Locals(LocalPermCtx, pc)
		return session, pc, nil
	}

	if (session.IsEditor || session.IsAdmin) && opts.AllowEditor {
		ctx, cancel := context.WithTimeout(c.Context(), 6*time.Second)
		defer cancel()

		pc := GetPermissionContext(ctx, session)

		if !pc.Approved || !pc.IsActive {
			_ = responseJSON(c, 403, fiber.Map{
				"message": "Akun editor belum aktif atau belum disetujui.",
				"code":    "EDITOR_INACTIVE",
			})
			return nil, nil, fiber.NewError(403, "EDITOR_INACTIVE")
		}

		if opts.Permission != "" && !HasPermission(pc, opts.Permission) {
			_ = responseJSON(c, 403, fiber.Map{
				"message": "Anda tidak memiliki izin untuk tindakan ini.",
				"code":    "PERMISSION_DENIED",
				"required": opts.Permission,
			})
			return nil, nil, fiber.NewError(403, "PERMISSION_DENIED")
		}

		c.Locals(LocalSession, session)
		c.Locals(LocalPermCtx, pc)
		return session, pc, nil
	}

	_ = responseJSON(c, 403, fiber.Map{
		"message": "Forbidden.",
		"code":    "ADMIN_REQUIRED",
	})
	return nil, nil, fiber.NewError(403, "ADMIN_REQUIRED")
}

// RequireSuperAdmin: khusus super_admin (403 untuk role lain).
func RequireSuperAdmin(c *fiber.Ctx) (*SessionContext, error) {
	session := LoadSession(c)
	if !session.IsAuthenticated {
		_ = responseJSON(c, 401, fiber.Map{
			"message": "Unauthorized.",
			"code":    "AUTH_REQUIRED",
		})
		return nil, fiber.NewError(401, "AUTH_REQUIRED")
	}
	if session.Role != "super_admin" {
		_ = responseJSON(c, 403, fiber.Map{
			"message": "Forbidden.",
			"code":    "FORBIDDEN",
		})
		return nil, fiber.NewError(403, "FORBIDDEN")
	}
	c.Locals(LocalSession, session)
	return session, nil
}

// GetSession mengambil sesi yang sudah diset RequireAdmin.
func GetSession(c *fiber.Ctx) *SessionContext {
	if v, ok := c.Locals(LocalSession).(*SessionContext); ok {
		return v
	}
	return nil
}

// GetPermCtx mengambil permission context yang sudah diset RequireAdmin.
func GetPermCtx(c *fiber.Ctx) *PermissionContext {
	if v, ok := c.Locals(LocalPermCtx).(*PermissionContext); ok {
		return v
	}
	return nil
}
