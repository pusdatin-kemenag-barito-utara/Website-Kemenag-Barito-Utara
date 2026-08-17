function getSupabaseStorageMedia() {
  const base =
    (typeof process !== "undefined" && (process.env?.NEXT_PUBLIC_SUPABASE_URL || process.env?.PUBLIC_SUPABASE_URL)) ||
    (typeof import.meta !== "undefined" && (import.meta.env?.NEXT_PUBLIC_SUPABASE_URL || import.meta.env?.PUBLIC_SUPABASE_URL)) ||
    "";
  return base
    ? `${base.replace(/\/$/, "")}/storage/v1/object/public/cms-media`
    : "/storage/v1/object/public/cms-media";
}

export function normalizeCoverImageUrl(value = "") {
  const raw = String(value || "").trim();
  if (!raw) return "";

  if (
    raw.startsWith("/assets/") ||
    raw.startsWith("/favicon") ||
    raw.startsWith("/manifest") ||
    raw.startsWith("/robots")
  ) {
    return raw;
  }

  // Handle any path or full URL containing /api/storage/media/ (e.g. from backend or production domain)
  const apiStorageIdx = raw.indexOf("/api/storage/media/");
  if (apiStorageIdx !== -1) {
    const clean = raw.slice(apiStorageIdx + "/api/storage/media/".length).replace(/^\/+/, "");
    return `${getSupabaseStorageMedia()}/${clean}`;
  }

  if (raw.startsWith("/storage/")) {
    const clean = raw.replace(/^\/storage\/?/, "");
    return `${getSupabaseStorageMedia()}/${clean}`;
  }

  if (raw.startsWith("/")) {
    return raw;
  }

  try {
    const url = new URL(raw);
    return url.toString();
  } catch {
    return raw;
  }
}

export function toCoverPreviewUrl(value = "") {
  const normalized = normalizeCoverImageUrl(value);
  if (!normalized) return "";
  return normalized;
}

export function isSupabasePublicUrl(url) {
  if (!url) return false;
  const path = typeof url === "string" ? url : url.pathname || "";
  return path.includes("/storage/v1/object/public/");
}

// Global In-Memory Set Cache for loaded and preloaded image URLs
export const globalImageCache = new Set();

export function isImageCached(url) {
  return url ? globalImageCache.has(url) : false;
}

export function markImageCached(url) {
  if (url) globalImageCache.add(url);
}

export function preloadImages(urls = [], delay = 100) {
  if (typeof window === "undefined" || !Array.isArray(urls)) return;
  setTimeout(() => {
    urls.forEach((u) => {
      if (!u) return;
      const src = typeof u === "string" ? normalizeCoverImageUrl(u) : normalizeCoverImageUrl(u?.image_url || u?.cover_image || u?.foto || u?.foto_kepala || u?.url);
      if (src && !globalImageCache.has(src)) {
        globalImageCache.add(src);
        const img = new window.Image();
        img.src = src;
      }
    });
  }, delay);
}
