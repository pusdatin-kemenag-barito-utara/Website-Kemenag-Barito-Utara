package cache

import (
	"context"
	"log"
	"strings"
	"sync"
	"time"

	"github.com/redis/go-redis/v9"
)

var (
	rdb      *redis.Client
	rdbSetup bool
	rdbMu    sync.RWMutex
	rdbURL   string

	memoryStore = struct {
		sync.RWMutex
		data map[string]memoryEntry
	}{data: map[string]memoryEntry{}}
)

type memoryEntry struct {
	value     string
	expiresAt time.Time
}

// Init membuat koneksi Redis opsional. Gagal → fallback in-memory.
func Init(url string) {
	rdbSetup = true
	if url == "" {
		log.Println("[cache] Redis tidak dikonfigurasi — memakai in-memory store")
		return
	}

	opts, err := redis.ParseURL(url)
	if err != nil {
		log.Printf("[cache] REDIS_URL tidak valid (%v) — memakai in-memory store", err)
		return
	}

	rdb = redis.NewClient(opts)
	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()
	if err := rdb.Ping(ctx).Err(); err != nil {
		log.Printf("[cache] koneksi Redis gagal (%v) — memakai in-memory store", err)
		rdb = nil
		return
	}
	rdbURL = url
	log.Println("[cache] koneksi Redis berhasil")
}

// HasRedis: true jika Redis aktif (bukan in-memory).
func HasRedis() bool {
	return rdb != nil
}

func Get(ctx context.Context, key string) (string, error) {
	rdbMu.RLock()
	r := rdb
	rdbMu.RUnlock()
	if r != nil {
		return r.Get(ctx, key).Result()
	}
	return memoryGet(key)
}

func Set(ctx context.Context, key string, value string, ttl time.Duration) error {
	rdbMu.RLock()
	r := rdb
	rdbMu.RUnlock()
	if r != nil {
		return r.Set(ctx, key, value, ttl).Err()
	}
	memorySet(key, value, ttl)
	return nil
}

func Del(ctx context.Context, keys ...string) error {
	rdbMu.RLock()
	r := rdb
	rdbMu.RUnlock()
	if r != nil {
		return r.Del(ctx, keys...).Err()
	}
	memoryDel(keys...)
	return nil
}

// DelPrefix menghapus semua key yang berawalan prefix (Redis SCAN / in-memory map scan).
func DelPrefix(ctx context.Context, prefix string) error {
	rdbMu.RLock()
	r := rdb
	rdbMu.RUnlock()
	if r != nil {
		var cursor uint64
		for {
			var keys []string
			var err error
			keys, cursor, err = r.Scan(ctx, cursor, prefix+"*", 100).Result()
			if err != nil {
				return err
			}
			if len(keys) > 0 {
				_ = r.Del(ctx, keys...).Err()
			}
			if cursor == 0 {
				break
			}
		}
		return nil
	}
	memoryDelPrefix(prefix)
	return nil
}

func Incr(ctx context.Context, key string) (int64, error) {
	rdbMu.RLock()
	r := rdb
	rdbMu.RUnlock()
	if r != nil {
		return r.Incr(ctx, key).Result()
	}
	return memoryIncr(key), nil
}

func IncrBy(ctx context.Context, key string, n int64) (int64, error) {
	rdbMu.RLock()
	r := rdb
	rdbMu.RUnlock()
	if r != nil {
		return r.IncrBy(ctx, key, n).Result()
	}
	return memoryIncrBy(key, n), nil
}

func Expire(ctx context.Context, key string, ttl time.Duration) error {
	rdbMu.RLock()
	r := rdb
	rdbMu.RUnlock()
	if r != nil {
		return r.Expire(ctx, key, ttl).Err()
	}
	memoryExpire(key, ttl)
	return nil
}

func TTL(ctx context.Context, key string) (time.Duration, error) {
	rdbMu.RLock()
	r := rdb
	rdbMu.RUnlock()
	if r != nil {
		return r.TTL(ctx, key).Result()
	}
	return memoryTTL(key), nil
}

func HIncrBy(ctx context.Context, key, field string, n int64) (int64, error) {
	rdbMu.RLock()
	r := rdb
	rdbMu.RUnlock()
	if r != nil {
		return r.HIncrBy(ctx, key, field, n).Result()
	}
	return memoryHIncrBy(key, field, n), nil
}

func HGetAll(ctx context.Context, key string) (map[string]string, error) {
	rdbMu.RLock()
	r := rdb
	rdbMu.RUnlock()
	if r != nil {
		return r.HGetAll(ctx, key).Result()
	}
	return memoryHGetAll(key), nil
}

func EvalGetDel(ctx context.Context, key string) (int64, error) {
	rdbMu.RLock()
	r := rdb
	rdbMu.RUnlock()
	if r != nil {
		// GETDEL atomic (Redis 6.2+)
		return r.GetDel(ctx, key).Int64()
	}
	return memoryGetDel(key)
}

// Close menutup koneksi Redis (dipanggil saat shutdown).
func Close() {
	rdbMu.Lock()
	defer rdbMu.Unlock()
	if rdb != nil {
		_ = rdb.Close()
		rdb = nil
	}
}

// ---------------- In-memory fallback ----------------

func memoryGet(key string) (string, error) {
	memoryStore.RLock()
	defer memoryStore.RUnlock()
	e, ok := memoryStore.data[key]
	if !ok || time.Now().After(e.expiresAt) {
		return "", redis.Nil
	}
	return e.value, nil
}

func memorySet(key, value string, ttl time.Duration) {
	memoryStore.Lock()
	defer memoryStore.Unlock()
	exp := time.Now().Add(ttl)
	memoryStore.data[key] = memoryEntry{value: value, expiresAt: exp}
}

func memoryDel(keys ...string) {
	memoryStore.Lock()
	defer memoryStore.Unlock()
	for _, k := range keys {
		delete(memoryStore.data, k)
	}
}

func memoryDelPrefix(prefix string) {
	memoryStore.Lock()
	defer memoryStore.Unlock()
	for k := range memoryStore.data {
		if strings.HasPrefix(k, prefix) {
			delete(memoryStore.data, k)
		}
	}
}

func memoryIncr(key string) int64 {
	memoryStore.Lock()
	defer memoryStore.Unlock()
	e, ok := memoryStore.data[key]
	now := time.Now()
	if !ok || now.After(e.expiresAt) {
		e = memoryEntry{}
	}
	n, _ := parseI64(e.value)
	n++
	entry := memoryEntry{value: itoa(n)}
	memoryStore.data[key] = entry
	return n
}

func memoryIncrBy(key string, n int64) int64 {
	memoryStore.Lock()
	defer memoryStore.Unlock()
	e, ok := memoryStore.data[key]
	if !ok {
		e = memoryEntry{}
	}
	cur, _ := parseI64(e.value)
	cur += n
	memoryStore.data[key] = memoryEntry{value: itoa(cur)}
	return cur
}

func memoryExpire(key string, ttl time.Duration) {
	memoryStore.Lock()
	defer memoryStore.Unlock()
	e, ok := memoryStore.data[key]
	if ok {
		e.expiresAt = time.Now().Add(ttl)
		memoryStore.data[key] = e
	}
}

func memoryTTL(key string) time.Duration {
	memoryStore.RLock()
	defer memoryStore.RUnlock()
	e, ok := memoryStore.data[key]
	if !ok {
		return -2 * time.Second
	}
	if time.Now().After(e.expiresAt) {
		return -2 * time.Second
	}
	return time.Until(e.expiresAt)
}

func memoryGetDel(key string) (int64, error) {
	memoryStore.Lock()
	defer memoryStore.Unlock()
	e, ok := memoryStore.data[key]
	if !ok {
		return 0, redis.Nil
	}
	delete(memoryStore.data, key)
	n, _ := parseI64(e.value)
	return n, nil
}

func memoryHIncrBy(key, field string, n int64) int64 {
	memoryStore.Lock()
	defer memoryStore.Unlock()
	// simpan hash sebagai prefiks field:key
	hk := "h:" + key + ":" + field
	e, ok := memoryStore.data[hk]
	if !ok {
		e = memoryEntry{}
	}
	cur, _ := parseI64(e.value)
	cur += n
	memoryStore.data[hk] = memoryEntry{value: itoa(cur)}
	return cur
}

func memoryHGetAll(key string) map[string]string {
	memoryStore.RLock()
	defer memoryStore.RUnlock()
	out := map[string]string{}
	prefix := "h:" + key + ":"
	for k, e := range memoryStore.data {
		if len(k) > len(prefix) && k[:len(prefix)] == prefix {
			out[k[len(prefix):]] = e.value
		}
	}
	return out
}

func parseI64(s string) (int64, bool) {
	var n int64
	if s == "" {
		return 0, false
	}
	for _, c := range s {
		if c < '0' || c > '9' {
			return 0, false
		}
		n = n*10 + int64(c-'0')
	}
	return n, true
}

func itoa(n int64) string {
	if n == 0 {
		return "0"
	}
	neg := n < 0
	if neg {
		n = -n
	}
	var buf [20]byte
	i := len(buf)
	for n > 0 {
		i--
		buf[i] = byte('0' + n%10)
		n /= 10
	}
	if neg {
		i--
		buf[i] = '-'
	}
	return string(buf[i:])
}

var _ = rdbURL