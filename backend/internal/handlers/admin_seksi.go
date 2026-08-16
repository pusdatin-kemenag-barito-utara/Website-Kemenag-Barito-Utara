package handlers

import (
	"context"
	"strings"
	"time"

	"kemenag-backend/internal/db"
	"kemenag-backend/internal/lib"
	"kemenag-backend/internal/middleware"
	"kemenag-backend/internal/response"
	"kemenag-backend/internal/services"

	"github.com/gofiber/fiber/v2"
)

// AdminSeksiListHandler — GET /api/admin/seksi
func AdminSeksiListHandler(c *fiber.Ctx) error {
	if _, _, err := middleware.RequireAdmin(c, middleware.AdminAuthOpts{AllowEditor: true}); err != nil {
		return err
	}
	ctx, cancel := context.WithTimeout(c.Context(), 8*time.Second)
	defer cancel()
	pool := db.Get()

	rows, err := pool.Query(ctx, `
		SELECT s.id, s.slug, s.judul, s.nama_kepala, s.nip_kepala, s.foto_kepala, s.deskripsi,
		       s.foto_kepala_y, s.created_at, s.updated_at,
		       (SELECT COUNT(*) FROM kemenag_website.pegawai_seksi p WHERE p.seksi_id = s.id) AS pegawai_count
		FROM kemenag_website.seksi s ORDER BY s.created_at ASC`)
	if err != nil {
		return response.Error(c, 500, "Gagal memuat data seksi.", "DB_ERROR")
	}
	defer rows.Close()

	list := []fiber.Map{}
	for rows.Next() {
		var id, slug, judul, namaKepala string
		var nipKepala, fotoKepala, deskripsi any
		var fotoKepalaY, pegawaiCount int
		var createdAt, updatedAt *time.Time
		if err := rows.Scan(&id, &slug, &judul, &namaKepala, &nipKepala, &fotoKepala, &deskripsi,
			&fotoKepalaY, &createdAt, &updatedAt, &pegawaiCount); err != nil {
			continue
		}
		list = append(list, fiber.Map{
			"id": id, "slug": slug, "judul": judul, "nama_kepala": namaKepala,
			"nip_kepala": nipKepala, "foto_kepala": fotoKepala, "deskripsi": deskripsi,
			"foto_kepala_y": fotoKepalaY, "created_at": fmtTime(createdAt), "updated_at": fmtTime(updatedAt),
			"_count": fiber.Map{"pegawai_seksi": pegawaiCount},
		})
	}
	return response.OK(c, fiber.Map{"items": list, "total": len(list)})
}

// AdminSeksiGetHandler — GET /api/admin/seksi/:id
func AdminSeksiGetHandler(c *fiber.Ctx) error {
	if _, _, err := middleware.RequireAdmin(c, middleware.AdminAuthOpts{AllowEditor: true}); err != nil {
		return err
	}
	id := c.Params("id")
	ctx, cancel := context.WithTimeout(c.Context(), 8*time.Second)
	defer cancel()
	pool := db.Get()

	var slug, judul, namaKepala string
	var nipKepala, fotoKepala, deskripsi any
	var fotoKepalaY int
	var createdAt, updatedAt *time.Time
	err := pool.QueryRow(ctx, `
		SELECT slug, judul, nama_kepala, nip_kepala, foto_kepala, deskripsi, foto_kepala_y, created_at, updated_at
		FROM kemenag_website.seksi WHERE id = $1`, id).
		Scan(&slug, &judul, &namaKepala, &nipKepala, &fotoKepala, &deskripsi, &fotoKepalaY, &createdAt, &updatedAt)
	if err != nil {
		return response.Error(c, 404, "Seksi tidak ditemukan.", "NOT_FOUND")
	}

	pegRows, err := pool.Query(ctx, `
		SELECT id, nama, nip, jabatan, foto, sort_order, foto_y
		FROM kemenag_website.pegawai_seksi WHERE seksi_id = $1 ORDER BY sort_order ASC, created_at ASC`, id)
	if err == nil {
		defer pegRows.Close()
	}
	pegawai := []fiber.Map{}
	if pegRows != nil {
		for pegRows.Next() {
			var pid, nama, jabatan string
			var nip, foto any
			var sortOrder, fotoY int
			if err := pegRows.Scan(&pid, &nama, &nip, &jabatan, &foto, &sortOrder, &fotoY); err == nil {
				pegawai = append(pegawai, fiber.Map{
					"id": pid, "nama": nama, "nip": nip, "jabatan": jabatan, "foto": foto,
					"sort_order": sortOrder, "foto_y": fotoY,
				})
			}
		}
	}

	return response.OK(c, fiber.Map{
		"id": id, "slug": slug, "judul": judul, "nama_kepala": namaKepala,
		"nip_kepala": nipKepala, "foto_kepala": fotoKepala, "deskripsi": deskripsi,
		"foto_kepala_y": fotoKepalaY, "created_at": fmtTime(createdAt), "updated_at": fmtTime(updatedAt),
		"pegawai_seksis": pegawai,
	})
}

// AdminSeksiUpdateHandler — PUT /api/admin/seksi/:id
func AdminSeksiUpdateHandler(c *fiber.Ctx) error {
	session, _, err := middleware.RequireAdmin(c, middleware.AdminAuthOpts{Permission: "seksi:manage"})
	if err != nil {
		return err
	}
	var body fiber.Map
	if err := c.BodyParser(&body); err != nil {
		return response.Error(c, 400, "Body tidak valid.", "INVALID_BODY")
	}
	id := c.Params("id")

	judul := lib.CleanString(body["judul"], 200)
	if judul == "" {
		return response.Error(c, 400, "Judul wajib diisi.", "VALIDATION_ERROR")
	}
	namaKepala := lib.CleanString(body["nama_kepala"], 200)
	if namaKepala == "" {
		return response.Error(c, 400, "Nama kepala wajib diisi.", "VALIDATION_ERROR")
	}
	deskripsi := lib.CleanHTML(body["deskripsi"], 100_000)
	nipKepala := lib.CleanString(body["nip_kepala"], 100)

	ctx, cancel := context.WithTimeout(c.Context(), 30*time.Second)
	defer cancel()
	pool := db.Get()

	var oldFoto, oldSlug string
	var oldFotoKepalaY int
	err = pool.QueryRow(ctx, `SELECT foto_kepala, slug, COALESCE(foto_kepala_y, 50) FROM kemenag_website.seksi WHERE id = $1`, id).Scan(&oldFoto, &oldSlug, &oldFotoKepalaY)
	if err != nil {
		return response.Error(c, 404, "Seksi tidak ditemukan.", "NOT_FOUND")
	}

	slug := lib.CleanString(body["slug"], 200)
	if slug == "" {
		slug = oldSlug
	}
	if slug == "" {
		slug = lib.Slugify(judul)
	}

	fotoKepalaY := oldFotoKepalaY
	if val, ok := body["foto_kepala_y"]; ok && val != nil {
		fotoKepalaY = lib.ToInt(val)
		if fotoKepalaY < 0 {
			fotoKepalaY = 0
		} else if fotoKepalaY > 100 {
			fotoKepalaY = 100
		}
	}

	if slug != oldSlug {
		var exists int
		_ = pool.QueryRow(ctx, `SELECT 1 FROM kemenag_website.seksi WHERE slug = $1 AND id <> $2`, slug, id).Scan(&exists)
		if exists == 1 {
			return response.Error(c, 409, "Slug sudah dipakai seksi lain.", "SLUG_CONFLICT")
		}
	}

	fotoKepala := oldFoto
	fotoRaw := body["foto_upload_base64"]
	if fotoRaw == nil || fotoRaw == "" {
		fotoRaw = body["foto_kepala_base64"]
	}
	if v := lib.CleanString(fotoRaw, 20_000_000); strings.HasPrefix(v, "data:image/") {
		_, publicURL, _, _, err := services.Storage.UploadBase64Image(ctx, v, "seksi", "kepala")
		if err != nil {
			return response.Error(c, 400, "Gagal upload foto: "+err.Error(), "UPLOAD_FAILED")
		}
		fotoKepala = publicURL
		if services.IsCMSStorageURL(oldFoto) {
			go services.Storage.RemoveFileByPublicUrl(ctx, oldFoto)
		}
	} else if v := lib.CleanString(body["foto_kepala"], 2000); v != "" {
		fotoKepala = v
	}

	_, err = pool.Exec(ctx, `
		UPDATE kemenag_website.seksi SET
			slug = $1, judul = $2, nama_kepala = $3, nip_kepala = $4, foto_kepala = $5,
			deskripsi = $6, foto_kepala_y = $7, updated_at = now()
		WHERE id = $8`, slug, judul, namaKepala, nilIfEmpty(nipKepala), fotoKepala, deskripsi, fotoKepalaY, id)
	if err != nil {
		return response.Error(c, 500, "Gagal update seksi.", "DB_ERROR")
	}

	services.Audit.Record(struct {
		Action      string
		Entity      string
		EntityID    string
		PerformedBy string
		Before      any
		After       any
		IP          any
	}{
		Action: "update", Entity: "seksi", EntityID: id, PerformedBy: session.UserEmail(),
		After: fiber.Map{"judul": judul, "slug": slug}, IP: adminIP(c),
	})
	services.CacheBust()
	services.Realtime.BroadcastRefresh("seksi")
	return response.OK(c, fiber.Map{
		"ok": true,
		"item": fiber.Map{
			"id":            id,
			"slug":          slug,
			"judul":         judul,
			"nama_kepala":   namaKepala,
			"nip_kepala":    nipKepala,
			"foto_kepala":   fotoKepala,
			"deskripsi":     deskripsi,
			"foto_kepala_y": fotoKepalaY,
		},
	})
}

// AdminSeksiDeleteHandler — DELETE /api/admin/seksi/:id
func AdminSeksiDeleteHandler(c *fiber.Ctx) error {
	session, _, err := middleware.RequireAdmin(c, middleware.AdminAuthOpts{Permission: "seksi:manage"})
	if err != nil {
		return err
	}
	id := c.Params("id")
	ctx, cancel := context.WithTimeout(c.Context(), 30*time.Second)
	defer cancel()
	pool := db.Get()

	var foto string
	err = pool.QueryRow(ctx, `SELECT COALESCE(foto_kepala, '') FROM kemenag_website.seksi WHERE id = $1`, id).Scan(&foto)
	if err != nil {
		return response.Error(c, 404, "Seksi tidak ditemukan.", "NOT_FOUND")
	}

	rows, err := pool.Query(ctx, `SELECT foto FROM kemenag_website.pegawai_seksi WHERE seksi_id = $1 AND foto IS NOT NULL`, id)
	if err == nil {
		fotos := []string{}
		for rows.Next() {
			var f string
			if rows.Scan(&f) == nil {
				fotos = append(fotos, f)
			}
		}
		rows.Close()
		for _, f := range fotos {
			if services.IsCMSStorageURL(f) {
				go services.Storage.RemoveFileByPublicUrl(ctx, f)
			}
		}
	}
	if services.IsCMSStorageURL(foto) {
		go services.Storage.RemoveFileByPublicUrl(ctx, foto)
	}

	_, _ = pool.Exec(ctx, `DELETE FROM kemenag_website.seksi WHERE id = $1`, id)

	services.Audit.Record(struct {
		Action      string
		Entity      string
		EntityID    string
		PerformedBy string
		Before      any
		After       any
		IP          any
	}{
		Action: "delete", Entity: "seksi", EntityID: id, PerformedBy: session.UserEmail(), IP: adminIP(c),
	})
	services.CacheBust()
	services.Realtime.BroadcastRefresh("seksi")
	return response.OK(c, fiber.Map{"ok": true})
}

// AdminSeksiAddPegawaiHandler — POST /api/admin/seksi/:id/pegawai
func AdminSeksiAddPegawaiHandler(c *fiber.Ctx) error {
	session, _, err := middleware.RequireAdmin(c, middleware.AdminAuthOpts{Permission: "seksi:manage"})
	if err != nil {
		return err
	}
	var body fiber.Map
	if err := c.BodyParser(&body); err != nil {
		return response.Error(c, 400, "Body tidak valid.", "INVALID_BODY")
	}
	seksiID := c.Params("id")
	nama := lib.CleanString(body["nama"], 200)
	if nama == "" {
		return response.Error(c, 400, "Nama pegawai wajib diisi.", "VALIDATION_ERROR")
	}
	jabatan := lib.CleanString(body["jabatan"], 200)
	if jabatan == "" {
		return response.Error(c, 400, "Jabatan pegawai wajib diisi.", "VALIDATION_ERROR")
	}
	nip := lib.CleanString(body["nip"], 100)
	sortOrder := lib.ToInt(body["sort_order"])
	fotoY := lib.ToInt(body["foto_y"])

	ctx, cancel := context.WithTimeout(c.Context(), 30*time.Second)
	defer cancel()
	pool := db.Get()

	var judul string
	err = pool.QueryRow(ctx, `SELECT judul FROM kemenag_website.seksi WHERE id = $1`, seksiID).Scan(&judul)
	if err != nil {
		return response.Error(c, 404, "Seksi tidak ditemukan.", "NOT_FOUND")
	}

	foto := ""
	fotoRaw := body["foto_upload_base64"]
	if fotoRaw == nil || fotoRaw == "" {
		fotoRaw = body["foto_base64"]
	}
	if fotoRaw == nil || fotoRaw == "" {
		fotoRaw = body["foto_pegawai_base64"]
	}
	if v := lib.CleanString(fotoRaw, 20_000_000); strings.HasPrefix(v, "data:image/") {
		_, publicURL, _, _, err := services.Storage.UploadBase64Image(ctx, v, "seksi", "pegawai")
		if err != nil {
			return response.Error(c, 400, "Gagal upload foto: "+err.Error(), "UPLOAD_FAILED")
		}
		foto = publicURL
	} else if v := lib.CleanString(body["foto"], 2000); v != "" {
		foto = v
	}

	var newID string
	err = pool.QueryRow(ctx, `
		INSERT INTO kemenag_website.pegawai_seksi (seksi_id, nama, nip, jabatan, foto, sort_order, foto_y)
		VALUES ($1,$2,$3,$4,$5,$6,$7) RETURNING id`,
		seksiID, nama, nilIfEmpty(nip), jabatan, nilIfEmpty(foto), sortOrder, fotoY).Scan(&newID)
	if err != nil {
		return response.Error(c, 500, "Gagal menambahkan staf.", "DB_ERROR")
	}

	services.Audit.Record(struct {
		Action      string
		Entity      string
		EntityID    string
		PerformedBy string
		Before      any
		After       any
		IP          any
	}{
		Action: "create", Entity: "pegawai_seksi", EntityID: newID, PerformedBy: session.UserEmail(),
		After: fiber.Map{"nama": nama, "jabatan": jabatan}, IP: adminIP(c),
	})
	services.CacheBust()
	services.Realtime.BroadcastRefresh("seksi")
	return response.OK(c, fiber.Map{
		"ok": true,
		"item": fiber.Map{
			"id":         newID,
			"nama":       nama,
			"nip":        nip,
			"jabatan":    jabatan,
			"foto":       foto,
			"sort_order": sortOrder,
			"foto_y":     fotoY,
		},
	})
}

// AdminSeksiUpdatePegawaiHandler — PUT /api/admin/seksi/:id/pegawai/:pegawaiId
func AdminSeksiUpdatePegawaiHandler(c *fiber.Ctx) error {
	session, _, err := middleware.RequireAdmin(c, middleware.AdminAuthOpts{Permission: "seksi:manage"})
	if err != nil {
		return err
	}
	var body fiber.Map
	if err := c.BodyParser(&body); err != nil {
		return response.Error(c, 400, "Body tidak valid.", "INVALID_BODY")
	}
	seksiID := c.Params("id")
	pegawaiID := c.Params("pegawaiId")
	nama := lib.CleanString(body["nama"], 200)
	if nama == "" {
		return response.Error(c, 400, "Nama pegawai wajib diisi.", "VALIDATION_ERROR")
	}
	jabatan := lib.CleanString(body["jabatan"], 200)
	if jabatan == "" {
		return response.Error(c, 400, "Jabatan pegawai wajib diisi.", "VALIDATION_ERROR")
	}
	nip := lib.CleanString(body["nip"], 100)
	sortOrder := lib.ToInt(body["sort_order"])
	fotoY := lib.ToInt(body["foto_y"])

	ctx, cancel := context.WithTimeout(c.Context(), 30*time.Second)
	defer cancel()
	pool := db.Get()

	var oldFoto string
	err = pool.QueryRow(ctx, `SELECT COALESCE(foto, '') FROM kemenag_website.pegawai_seksi WHERE id = $1 AND seksi_id = $2`, pegawaiID, seksiID).Scan(&oldFoto)
	if err != nil {
		return response.Error(c, 404, "Staf pegawai tidak ditemukan di seksi ini.", "NOT_FOUND")
	}

	foto := oldFoto
	fotoRaw := body["foto_upload_base64"]
	if fotoRaw == nil || fotoRaw == "" {
		fotoRaw = body["foto_base64"]
	}
	if fotoRaw == nil || fotoRaw == "" {
		fotoRaw = body["foto_pegawai_base64"]
	}
	if v := lib.CleanString(fotoRaw, 20_000_000); strings.HasPrefix(v, "data:image/") {
		_, publicURL, _, _, err := services.Storage.UploadBase64Image(ctx, v, "seksi", "pegawai")
		if err != nil {
			return response.Error(c, 400, "Gagal upload foto: "+err.Error(), "UPLOAD_FAILED")
		}
		foto = publicURL
		if services.IsCMSStorageURL(oldFoto) {
			go services.Storage.RemoveFileByPublicUrl(ctx, oldFoto)
		}
	} else if v := lib.CleanString(body["foto"], 2000); v != "" {
		foto = v
	}

	_, err = pool.Exec(ctx, `
		UPDATE kemenag_website.pegawai_seksi SET
			nama = $1, nip = $2, jabatan = $3, foto = $4, sort_order = $5, foto_y = $6
		WHERE id = $7 AND seksi_id = $8`,
		nama, nilIfEmpty(nip), jabatan, nilIfEmpty(foto), sortOrder, fotoY, pegawaiID, seksiID)
	if err != nil {
		return response.Error(c, 500, "Gagal update staf.", "DB_ERROR")
	}

	services.Audit.Record(struct {
		Action      string
		Entity      string
		EntityID    string
		PerformedBy string
		Before      any
		After       any
		IP          any
	}{
		Action: "update", Entity: "pegawai_seksi", EntityID: pegawaiID, PerformedBy: session.UserEmail(),
		After: fiber.Map{"nama": nama, "jabatan": jabatan}, IP: adminIP(c),
	})
	services.CacheBust()
	services.Realtime.BroadcastRefresh("seksi")
	return response.OK(c, fiber.Map{
		"ok": true,
		"item": fiber.Map{
			"id":         pegawaiID,
			"nama":       nama,
			"nip":        nip,
			"jabatan":    jabatan,
			"foto":       foto,
			"sort_order": sortOrder,
			"foto_y":     fotoY,
		},
	})
}

// AdminSeksiDeletePegawaiHandler — DELETE /api/admin/seksi/:id/pegawai/:pegawaiId
func AdminSeksiDeletePegawaiHandler(c *fiber.Ctx) error {
	session, _, err := middleware.RequireAdmin(c, middleware.AdminAuthOpts{Permission: "seksi:manage"})
	if err != nil {
		return err
	}
	seksiID := c.Params("id")
	pegawaiID := c.Params("pegawaiId")
	ctx, cancel := context.WithTimeout(c.Context(), 15*time.Second)
	defer cancel()
	pool := db.Get()

	var foto string
	err = pool.QueryRow(ctx, `SELECT COALESCE(foto, '') FROM kemenag_website.pegawai_seksi WHERE id = $1 AND seksi_id = $2`, pegawaiID, seksiID).Scan(&foto)
	if err != nil {
		return response.Error(c, 404, "Staf pegawai tidak ditemukan di seksi ini.", "NOT_FOUND")
	}
	if services.IsCMSStorageURL(foto) {
		go services.Storage.RemoveFileByPublicUrl(ctx, foto)
	}
	_, _ = pool.Exec(ctx, `DELETE FROM kemenag_website.pegawai_seksi WHERE id = $1 AND seksi_id = $2`, pegawaiID, seksiID)

	services.Audit.Record(struct {
		Action      string
		Entity      string
		EntityID    string
		PerformedBy string
		Before      any
		After       any
		IP          any
	}{
		Action: "delete", Entity: "pegawai_seksi", EntityID: pegawaiID, PerformedBy: session.UserEmail(), IP: adminIP(c),
	})
	services.CacheBust()
	services.Realtime.BroadcastRefresh("seksi")
	return response.OK(c, fiber.Map{"ok": true})
}

func nilIfEmpty(v string) any {
	if v == "" {
		return nil
	}
	return v
}