package handlers

import (
	"context"
	"crypto/rand"
	"encoding/base64"
	"encoding/hex"
	"fmt"
	"time"

	"kemenag-backend/internal/cache"
	"kemenag-backend/internal/db"
)

type interfaceRows interface {
	Close()
	Next() bool
	Err() error
	Scan(dest ...any) error
}

type interfaceRow interface {
	Scan(dest ...any) error
}

// poolQuery helper query dengan pgx pool.
func poolQuery(ctx context.Context, pool interface {
	Query(context.Context, string, ...any) (interfaceRows, error)
}, sql string, args ...any) (interfaceRows, error) {
	return pool.Query(ctx, sql, args...)
}

// datePtr helper.
func datePtr(t time.Time) *time.Time {
	return &t
}

// base64StdEncode encode bytes ke base64.
func base64StdEncode(data []byte) string {
	return base64.StdEncoding.EncodeToString(data)
}

// cacheGet ambil dari cache (Redis / in-memory).
func cacheGet(ctx context.Context, key string) (string, error) {
	return cache.Get(ctx, key)
}

// cacheDel hapus dari cache.
func cacheDel(ctx context.Context, key string) error {
	return cache.Del(ctx, key)
}

// cacheDelPrefix hapus semua key berawalan prefix.
func cacheDelPrefix(ctx context.Context, prefix string) error {
	return cache.DelPrefix(ctx, prefix)
}

// InvalidateHomeCache menghapus cache beranda dan agregat publik seketika saat data berubah.
func InvalidateHomeCache(ctx context.Context) {
	_ = cache.Del(ctx, "home:aggregate", "home:youtube", "settings:public")
	_ = cache.DelPrefix(ctx, "berita:")
	_ = cache.DelPrefix(ctx, "galeri:")
}

// cacheSet set dengan TTL.
func cacheSet(ctx context.Context, key, value string, ttl time.Duration) error {
	return cache.Set(ctx, key, value, ttl)
}

var _ = db.Get

// newUUID menghasilkan UUID v4 acak (RFC 4122) tanpa dependency eksternal.
func newUUID() string {
	b := make([]byte, 16)
	if _, err := rand.Read(b); err != nil {
		return fmt.Sprintf("%d", time.Now().UnixNano())
	}
	b[6] = (b[6] & 0x0f) | 0x40
	b[8] = (b[8] & 0x3f) | 0x80
	dst := make([]byte, 36)
	hex.Encode(dst[0:8], b[0:4])
	dst[8] = '-'
	hex.Encode(dst[9:13], b[4:6])
	dst[13] = '-'
	hex.Encode(dst[14:18], b[6:8])
	dst[18] = '-'
	hex.Encode(dst[19:23], b[8:10])
	dst[23] = '-'
	hex.Encode(dst[24:36], b[10:16])
	return string(dst)
}
