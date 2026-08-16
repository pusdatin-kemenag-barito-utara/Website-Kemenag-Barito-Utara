package services

import (
	"context"
	"time"

	"kemenag-backend/internal/cache"
)

const cacheVersionKey = "cache:version"

// CacheBust menaikkan versi cache global (pengganti revalidatePath/revalidateTag).
// FE dapat membaca versi ini via GET /api/cache-version untuk invalidasi.
func CacheBust() {
	ctx, cancel := context.WithTimeout(context.Background(), 3*time.Second)
	defer cancel()
	_, _ = cache.Incr(ctx, cacheVersionKey)
	_ = cache.Expire(ctx, cacheVersionKey, 7*24*time.Hour)
	_ = cache.Del(ctx, "home:aggregate", "home:youtube", "home:galeri", "home:stats", "berita:list", "berita:months", "settings:public", "settings:admin")
	_ = cache.DelPrefix(ctx, "berita:")
	_ = cache.DelPrefix(ctx, "galeri:")
	_ = cache.DelPrefix(ctx, "infografis:")
	_ = cache.DelPrefix(ctx, "slides:")
}

// CacheVersion mengembalikan versi cache saat ini.
func CacheVersion() int64 {
	ctx, cancel := context.WithTimeout(context.Background(), 3*time.Second)
	defer cancel()
	n, err := cache.IncrBy(ctx, cacheVersionKey, 0)
	if err != nil {
		return 0
	}
	return n
}
