import { invalidatePublicCache } from "@/lib/pocketbase/db";

const STORAGE_PREFIX = "kemenag_admin_cache:";
const DASHBOARD_CACHE_KEY = "kemenag_dashboard_stats_v5";
const memoryCache = new Map();

export function readAdminCache(key, maxAgeMs = 300_000) {
  if (!key) return null;
  const now = Date.now();

  const mem = memoryCache.get(key);
  if (mem && now - mem.ts <= maxAgeMs) {
    return mem.data;
  }

  if (typeof window === "undefined") return null;
  try {
    const raw = window.sessionStorage.getItem(`${STORAGE_PREFIX}${key}`);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (!parsed || typeof parsed.ts !== "number") return null;
    if (now - parsed.ts > maxAgeMs) {
      window.sessionStorage.removeItem(`${STORAGE_PREFIX}${key}`);
      return null;
    }
    memoryCache.set(key, parsed);
    return parsed.data;
  } catch {
    return null;
  }
}

export function writeAdminCache(key, data) {
  if (!key || data === undefined) return;
  const entry = { data, ts: Date.now() };
  memoryCache.set(key, entry);

  if (typeof window === "undefined") return;
  try {
    window.sessionStorage.setItem(`${STORAGE_PREFIX}${key}`, JSON.stringify(entry));
  } catch {
    // Abaikan quota error pada sessionStorage
  }
}

export function clearAdminCache(prefix = "") {
  if (!prefix) {
    memoryCache.clear();
  } else {
    for (const k of memoryCache.keys()) {
      if (k.startsWith(prefix)) {
        memoryCache.delete(k);
      }
    }
  }

  if (typeof window === "undefined") return;
  try {
    window.sessionStorage.removeItem(DASHBOARD_CACHE_KEY);
    if (!prefix) {
      for (let i = window.sessionStorage.length - 1; i >= 0; i--) {
        const k = window.sessionStorage.key(i);
        if (k && k.startsWith(STORAGE_PREFIX)) {
          window.sessionStorage.removeItem(k);
        }
      }
      return;
    }
    window.sessionStorage.removeItem(`${STORAGE_PREFIX}${prefix}`);
    for (let i = window.sessionStorage.length - 1; i >= 0; i--) {
      const k = window.sessionStorage.key(i);
      if (k && k.startsWith(`${STORAGE_PREFIX}${prefix}`)) {
        window.sessionStorage.removeItem(k);
      }
    }
  } catch {
    // Abaikan storage error
  }
}

export function bustAdminAndPublicCache(adminPrefix = "", publicPrefix = "") {
  clearAdminCache(adminPrefix);
  invalidatePublicCache(publicPrefix, { notifyServer: true });
}
