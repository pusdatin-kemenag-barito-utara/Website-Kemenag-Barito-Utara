import { getPocketBase, getPocketBaseFileUrl } from "./client";
import { DEFAULT_PTSP_SERVICES } from "@/data/ptsp-services";

/**
 * Service Database PocketBase untuk Akses Publik & SSR
 * Dilengkapi In-Memory SWR + Singleflight Cache agar pembacaan berulang < 5ms.
 */

const CACHE_GLOBAL_KEY = "__kemenagSsrPublicCache__";
const INFLIGHT_GLOBAL_KEY = "__kemenagSsrInflight__";
const MAX_CACHE_ENTRIES = 250;

const cacheStore =
  typeof globalThis !== "undefined"
    ? (globalThis[CACHE_GLOBAL_KEY] ||= new Map())
    : new Map();

const inflightStore =
  typeof globalThis !== "undefined"
    ? (globalThis[INFLIGHT_GLOBAL_KEY] ||= new Map())
    : new Map();

function isTestEnv() {
  return typeof process !== "undefined" && Boolean(process.env?.VITEST);
}

function pruneCacheIfNeeded() {
  if (cacheStore.size <= MAX_CACHE_ENTRIES) return;
  const excess = cacheStore.size - MAX_CACHE_ENTRIES;
  let removed = 0;
  for (const key of cacheStore.keys()) {
    cacheStore.delete(key);
    removed++;
    if (removed >= excess) break;
  }
}

async function withCache(key, ttlMs, staleTtlMs, fetcher) {
  if (isTestEnv()) {
    return await fetcher();
  }

  const now = Date.now();
  const cached = cacheStore.get(key);

  if (cached && now - cached.ts < ttlMs) {
    return cached.data;
  }

  const triggerFetch = () => {
    if (inflightStore.has(key)) {
      return inflightStore.get(key);
    }
    const promise = (async () => {
      try {
        const data = await fetcher();
        if (data !== null && data !== undefined) {
          cacheStore.set(key, { data, ts: Date.now() });
          pruneCacheIfNeeded();
        }
        return data;
      } finally {
        inflightStore.delete(key);
      }
    })();
    inflightStore.set(key, promise);
    return promise;
  };

  if (cached && now - cached.ts < staleTtlMs) {
    // Stale-While-Revalidate: kembalikan cache seketika, perbarui senyap di latar belakang
    void triggerFetch().catch(() => {});
    return cached.data;
  }

  try {
    return await triggerFetch();
  } catch (err) {
    // Emergency stale fallback bila PocketBase mengalami gangguan sementara
    if (cached && now - cached.ts < staleTtlMs * 2) {
      return cached.data;
    }
    throw err;
  }
}

/**
 * Membersihkan cache publik SSR & client; bila dipanggil di browser dan notifyServer = true,
 * ikut memanggil /api/cache-bust agar cache SSR di Node.js ikut ter-invalidate seketika.
 */
export function invalidatePublicCache(prefix = "", { notifyServer = true } = {}) {
  const cleanPrefix = String(prefix || "").trim();

  if (!cleanPrefix) {
    cacheStore.clear();
  } else {
    const shouldBustComposite =
      cleanPrefix.startsWith("berita") ||
      cleanPrefix.startsWith("slides") ||
      cleanPrefix.startsWith("galeri") ||
      cleanPrefix.startsWith("youtube") ||
      cleanPrefix.startsWith("settings") ||
      cleanPrefix.startsWith("layanan");

    for (const k of cacheStore.keys()) {
      if (
        k.startsWith(cleanPrefix) ||
        (shouldBustComposite && (k.startsWith("home:") || k.startsWith("portal:")))
      ) {
        cacheStore.delete(k);
      }
    }
  }

  if (notifyServer && typeof window !== "undefined") {
    try {
      fetch("/api/cache-bust", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prefix: cleanPrefix }),
        keepalive: true,
      }).catch(() => {});
    } catch {}
  }
}

async function withRetry(fn, retries = 2, delayMs = 250) {
  let lastErr;
  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      return await fn();
    } catch (err) {
      lastErr = err;
      const isTransient =
        err?.status === 0 ||
        err?.cause?.code === "ETIMEDOUT" ||
        err?.originalError?.cause?.code === "ETIMEDOUT";
      if (!isTransient || attempt === retries) {
        throw err;
      }
      await new Promise((resolve) => setTimeout(resolve, delayMs * (attempt + 1)));
    }
  }
  throw lastErr;
}

export async function getPublicBeritaList({
  page = 1,
  perPage = 18,
  category = "",
  month = "",
  search = "",
  sort = "-published_at",
} = {}) {
  const fetchList = async () => {
    const pb = getPocketBase();
    const filters = ["is_published = true"];

    if (category && category !== "Semua") {
      filters.push(`category = "${category}"`);
    }

    if (month && /^\d{4}-\d{2}$/.test(month)) {
      const [y, m] = month.split("-").map(Number);
      const startDate = `${month}-01 00:00:00.000Z`;
      const endYear = m === 12 ? y + 1 : y;
      const endMonth = m === 12 ? 1 : m + 1;
      const endDate = `${endYear}-${String(endMonth).padStart(2, "0")}-01 00:00:00.000Z`;
      filters.push(`published_at >= "${startDate}" && published_at < "${endDate}"`);
    }

    if (search) {
      const cleanSearch = search.replace(/["\\]/g, "");
      filters.push(`(title ~ "${cleanSearch}" || content ~ "${cleanSearch}")`);
    }

    const sortOrder = sort === "oldest" ? "published_at" : "-published_at";

    const res = await withRetry(() =>
      pb.collection("berita").getList(page, perPage, {
        filter: filters.join(" && "),
        sort: sortOrder,
        requestKey: null,
      })
    );
    return {
      items: res.items,
      total: res.totalItems,
      page: res.page,
      perPage: res.perPage,
      totalPages: res.totalPages,
    };
  };

  try {
    if (search) {
      return await fetchList();
    }
    const cacheKey = `berita:list:${page}:${perPage}:${category || "all"}:${month || "all"}:${sort || "-published_at"}`;
    return await withCache(cacheKey, 45_000, 300_000, fetchList);
  } catch (err) {
    console.error("[PocketBase] Error getPublicBeritaList:", err);
    return { items: [], total: 0, page: 1, perPage, totalPages: 1 };
  }
}

export async function getPublicBeritaMonths() {
  try {
    return await withCache("berita:months", 300_000, 1_800_000, async () => {
      const pb = getPocketBase();
      const records = await pb.collection("berita").getFullList({
        filter: "is_published = true",
        fields: "published_at",
        sort: "-published_at",
        requestKey: null,
      });

      const monthMap = new Map();
      const monthFormatter = new Intl.DateTimeFormat("id-ID", {
        month: "long",
        year: "numeric",
      });

      for (const r of records) {
        if (!r.published_at) continue;
        const d = new Date(r.published_at);
        if (Number.isNaN(d.getTime())) continue;
        const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
        if (!monthMap.has(key)) {
          monthMap.set(key, {
            value: key,
            label: monthFormatter.format(new Date(d.getFullYear(), d.getMonth(), 1)),
          });
        }
      }
      return Array.from(monthMap.values());
    });
  } catch {
    return [];
  }
}

export async function getPublicBeritaBySlug(slug) {
  if (!slug) return null;
  const cleanSlug = slug.replace(/["\\]/g, "");
  try {
    return await withCache(`berita:slug:${cleanSlug}`, 45_000, 300_000, async () => {
      const pb = getPocketBase();
      return await pb
        .collection("berita")
        .getFirstListItem(`slug = "${cleanSlug}" && is_published = true`, {
          requestKey: null,
        });
    });
  } catch (err) {
    console.error(`[PocketBase] Berita tidak ditemukan slug=${slug}:`, err);
    return null;
  }
}

export async function incrementBeritaViewCount(slug) {
  if (!slug) return null;
  try {
    const res = await fetch(`/api/berita/${encodeURIComponent(slug)}/view`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
    });
    if (res.ok) {
      return await res.json();
    }
  } catch (err) {
    console.warn("[ViewCounter] Error:", err);
  }
  return null;
}

export async function getRelatedBerita(category, excludeId, limit = 4) {
  try {
    const cacheKey = `berita:related:${category || "all"}:${excludeId || "none"}:${limit}`;
    return await withCache(cacheKey, 45_000, 300_000, async () => {
      const pb = getPocketBase();
      const filters = ["is_published = true"];
      if (category) filters.push(`category = "${category}"`);
      if (excludeId) filters.push(`id != "${excludeId}"`);

      const res = await pb.collection("berita").getList(1, limit, {
        filter: filters.join(" && "),
        sort: "-published_at",
        requestKey: null,
      });
      return res.items;
    });
  } catch {
    return [];
  }
}

export async function getAdjacentBerita(publishedAt, excludeId) {
  if (!publishedAt) return { prev: null, next: null };
  try {
    const cacheKey = `berita:adjacent:${publishedAt}:${excludeId || "none"}`;
    return await withCache(cacheKey, 45_000, 300_000, async () => {
      const pb = getPocketBase();
      const [prevRes, nextRes] = await Promise.all([
        pb.collection("berita").getList(1, 1, {
          filter: `is_published = true && published_at < "${publishedAt}" && id != "${excludeId}"`,
          sort: "-published_at",
          requestKey: null,
        }),
        pb.collection("berita").getList(1, 1, {
          filter: `is_published = true && published_at > "${publishedAt}" && id != "${excludeId}"`,
          sort: "published_at",
          requestKey: null,
        }),
      ]);
      return {
        prev: prevRes.items[0] || null,
        next: nextRes.items[0] || null,
      };
    });
  } catch {
    return { prev: null, next: null };
  }
}

export async function getHomepageSlides() {
  try {
    return await withCache("slides:public", 60_000, 600_000, async () => {
      const pb = getPocketBase();
      return await withRetry(() =>
        pb.collection("homepage_slides").getFullList({
          filter: "is_published = true",
          sort: "sort_order",
          requestKey: null,
        })
      );
    });
  } catch (err) {
    console.error("[PocketBase] Error getHomepageSlides:", err);
    return [];
  }
}

export async function getPublicGaleri(page = 1, perPage = 24) {
  try {
    return await withCache(`galeri:${page}:${perPage}`, 60_000, 600_000, async () => {
      const pb = getPocketBase();
      const res = await withRetry(() =>
        pb.collection("galeri").getList(page, perPage, {
          filter: "is_published = true",
          sort: "-published_at",
          requestKey: null,
        })
      );
      return {
        items: res.items.map((it) => {
          const fullUrl = it.image_file ? getPocketBaseFileUrl(it, it.image_file) : (it.image_url || "");
          const thumbUrl = it.image_file ? getPocketBaseFileUrl(it, it.image_file, { thumb: "400x533" }) : fullUrl;
          return {
            ...it,
            image_url: fullUrl,
            thumb_url: thumbUrl,
          };
        }),
        total: res.totalItems,
        totalPages: res.totalPages,
      };
    });
  } catch (err) {
    console.error("[PocketBase] Error getPublicGaleri:", err);
    return { items: [], total: 0, totalPages: 1 };
  }
}

export async function getPublicSeksiList() {
  try {
    return await withCache("seksi:list", 120_000, 900_000, async () => {
      const pb = getPocketBase();
      const res = await withRetry(() =>
        pb.collection("seksi").getFullList({ requestKey: null })
      );

      let allPegawai = [];
      try {
        allPegawai = await pb.collection("pegawai_seksi").getFullList({
          sort: "sort_order",
          requestKey: null,
        });
      } catch (_e) {
        allPegawai = [];
      }

      const countMap = {};
      for (const p of allPegawai) {
        if (p.seksi_id) {
          countMap[p.seksi_id] = (countMap[p.seksi_id] || 0) + 1;
        }
      }

      return res.map((s) => ({
        ...s,
        pegawai_count: (countMap[s.id] || 0) + (s.original_id ? (countMap[s.original_id] || 0) : 0),
      }));
    });
  } catch (err) {
    console.error("[PocketBase] Error getPublicSeksiList:", err);
    return [];
  }
}

export async function getPublicSeksiBySlug(slug) {
  if (!slug) return null;
  const cleanSlug = slug.replace(/["\\]/g, "");
  try {
    return await withCache(`seksi:slug:${cleanSlug}`, 120_000, 900_000, async () => {
      const pb = getPocketBase();
      const seksi = await pb.collection("seksi").getFirstListItem(`slug = "${cleanSlug}"`, {
        requestKey: null,
      });
      let pegawai = [];
      if (seksi?.id) {
        const filterConditions = [`seksi_id = "${seksi.id}"`];
        if (seksi.original_id) {
          filterConditions.push(`seksi_id = "${seksi.original_id}"`);
        }
        pegawai = await pb.collection("pegawai_seksi").getFullList({
          filter: filterConditions.join(" || "),
          sort: "sort_order",
          requestKey: null,
        });
      }
      return { ...seksi, pegawai, pegawai_count: pegawai.length };
    });
  } catch (err) {
    console.error(`[PocketBase] Error getPublicSeksiBySlug ${slug}:`, err);
    return null;
  }
}

export async function getPublicYoutubeVideos(limit = 50) {
  try {
    return await withCache(`youtube:list:${limit}`, 60_000, 600_000, async () => {
      const pb = getPocketBase();
      const res = await withRetry(() =>
        pb.collection("youtube_videos").getList(1, limit, {
          filter: "is_published = true",
          sort: "sort_order",
          requestKey: null,
        })
      );
      return (res.items || []).map((v) => ({
        ...v,
        id: String(v.id),
        title: (v.title || "").trim(),
        created_at: v.created || v.created_at || null,
        updated_at: v.updated || v.updated_at || null,
      }));
    });
  } catch (err) {
    console.error("[PocketBase] Error getPublicYoutubeVideos:", err);
    return [];
  }
}

export async function getPublicLayanan() {
  try {
    return await withCache("layanan:public", 120_000, 900_000, async () => {
      const pb = getPocketBase();
      return await pb.collection("layanan_publik").getFullList({
        filter: "is_active = true",
        sort: "sort_order",
        requestKey: null,
      });
    });
  } catch {
    return [];
  }
}

export async function getPublicSettings() {
  try {
    return await withCache("settings:public", 120_000, 900_000, async () => {
      const pb = getPocketBase();
      const res = await withRetry(() =>
        pb.collection("site_settings").getFullList({ requestKey: null })
      );
      const map = {};
      for (const item of res) {
        map[item.key] = item.value;
      }
      return map;
    });
  } catch {
    return {};
  }
}

export async function getPublicPortalData() {
  try {
    return await withCache("portal:data", 45_000, 300_000, async () => {
      const pb = getPocketBase();
      const [beritaRes, slides, videos, layanan, settings] = await Promise.all([
        withRetry(() =>
          pb.collection("berita").getList(1, 10, {
            filter: "is_published = true",
            sort: "-published_at",
            requestKey: null,
          })
        ),
        withRetry(() =>
          pb.collection("homepage_slides").getFullList({
            filter: "is_published = true",
            sort: "sort_order",
            requestKey: null,
          })
        ).catch(() => []),
        withRetry(() =>
          pb.collection("youtube_videos").getList(1, 4, {
            filter: "is_published = true",
            sort: "sort_order",
            requestKey: null,
          })
        ).catch(() => ({ items: [] })),
        withRetry(() =>
          pb.collection("layanan_publik").getFullList({
            filter: "is_active = true",
            sort: "sort_order",
            requestKey: null,
          })
        ).catch(() => []),
        withRetry(() =>
          pb.collection("site_settings").getFullList({ requestKey: null })
        ).catch(() => []),
      ]);

      const settingsMap = {};
      let fiturAntiCopas = false;
      for (const s of (settings || [])) {
        settingsMap[s.key] = s.value;
        if (s.key === "fitur_anti_copas") {
          fiturAntiCopas = s.value === true || s.value === "true";
        }
      }

      return {
        berita: beritaRes.items,
        latestBerita: beritaRes.items,
        beritaCount: beritaRes.totalItems,
        slides,
        videos: videos.items || [],
        layanan,
        settings: settingsMap,
        fitur_anti_copas: fiturAntiCopas,
      };
    });
  } catch (err) {
    console.error("[PocketBase] Error getPublicPortalData:", err);
    return {
      berita: [],
      latestBerita: [],
      beritaCount: 0,
      slides: [],
      videos: [],
      layanan: [],
      settings: {},
      fitur_anti_copas: false,
    };
  }
}

export async function getPublicHomeData() {
  try {
    return await withCache("home:data", 45_000, 300_000, async () => {
      const pb = getPocketBase();
      const [latestRes, popularRes, nasionalRes, slides, galeriRes, testiRes, categoryRes] = await Promise.all([
        withRetry(() =>
          pb.collection("berita").getList(1, 10, {
            filter: "is_published = true",
            sort: "-published_at",
            requestKey: null,
          })
        ),
        withRetry(() =>
          pb.collection("berita").getList(1, 5, {
            filter: "is_published = true",
            sort: "-views",
            requestKey: null,
          })
        ).catch(() => ({ items: [] })),
        withRetry(() =>
          pb.collection("berita").getList(1, 5, {
            filter: 'is_published = true && category = "Nasional"',
            sort: "-published_at",
            requestKey: null,
          })
        ).catch(() => ({ items: [] })),
        withRetry(() =>
          pb.collection("homepage_slides").getFullList({
            filter: "is_published = true",
            sort: "sort_order",
            requestKey: null,
          })
        ).catch(() => []),
        withRetry(() =>
          pb.collection("galeri").getList(1, 12, {
            filter: "is_published = true",
            sort: "-published_at",
            requestKey: null,
          })
        ).catch(() => ({ items: [] })),
        withRetry(() =>
          pb.collection("testimonials").getFullList({
            sort: "sort_order",
            requestKey: null,
          })
        ).catch(() => []),
        withRetry(() =>
          pb.collection("berita").getList(1, 60, {
            filter: 'is_published = true && category != "Umum" && category != "Kegiatan" && category != "Nasional"',
            sort: "-published_at",
            requestKey: null,
          })
        ).catch(() => ({ items: [] })),
      ]);

      const latest = latestRes.items || [];
      const validPtsp = DEFAULT_PTSP_SERVICES;

      // Grouping berita per kategori untuk HomeNewsPerCategorySection
      const categoryMap = {};
      for (const item of (categoryRes.items || [])) {
        const cat = item.category || "Umum";
        if (!categoryMap[cat]) {
          categoryMap[cat] = [];
        }
        if (categoryMap[cat].length < 3) {
          categoryMap[cat].push(item);
        }
      }
      const grouped = Object.entries(categoryMap).map(([category, items]) => ({
        category,
        items,
        totalCount: items.length,
      }));

      return {
        hariIni: latest.slice(0, 4),
        latest: latest,
        popular: popularRes.items || [],
        nasional: nasionalRes.items || [],
        grouped: grouped,
        slides: slides,
        galeri: galeriRes.items || [],
        testimonials: testiRes,
        ptsp: validPtsp,
        totalBerita: latestRes.totalItems || 0,
        totalPtsp: validPtsp.length || 0,
        stats: {
          totalBerita: latestRes.totalItems || 0,
          totalPtsp: validPtsp.length || 0,
        },
      };
    });
  } catch (err) {
    console.error("[PocketBase] Error getPublicHomeData:", err);
    return {
      hariIni: [],
      latest: [],
      popular: [],
      nasional: [],
      grouped: [],
      slides: [],
      galeri: [],
      testimonials: [],
      ptsp: DEFAULT_PTSP_SERVICES,
      totalBerita: 0,
      totalPtsp: DEFAULT_PTSP_SERVICES.length,
      stats: {
        totalBerita: 0,
        totalPtsp: DEFAULT_PTSP_SERVICES.length,
      },
    };
  }
}

export async function getStaticPageBySlug(slug) {
  if (!slug) return null;
  const cleanSlug = slug.replace(/["\\]/g, "");
  try {
    return await withCache(`static:slug:${cleanSlug}`, 300_000, 1_800_000, async () => {
      const pb = getPocketBase();
      return await pb
        .collection("static_pages")
        .getFirstListItem(`slug = "${cleanSlug}"`, { requestKey: null });
    });
  } catch {
    return null;
  }
}

export async function getAllLaporanCategories() {
  try {
    return await withCache("laporan:categories", 120_000, 900_000, async () => {
      const pb = getPocketBase();
      const categories = await withRetry(() =>
        pb.collection("report_categories").getFullList({
          filter: "is_active = true",
          sort: "sort_order",
          requestKey: null,
        })
      );
      return categories || [];
    });
  } catch (err) {
    console.error("[PocketBase] Error getAllLaporanCategories:", err);
    return [];
  }
}

export async function getLaporanCategoryBySlug(slug) {
  if (!slug) return null;
  const cleanSlug = String(slug).trim().toLowerCase().replace(/["\\]/g, "");
  try {
    return await withCache(`laporan:slug:${cleanSlug}`, 60_000, 600_000, async () => {
      const pb = getPocketBase();
      const category = await pb
        .collection("report_categories")
        .getFirstListItem(`slug = "${cleanSlug}"`, { requestKey: null });
      let documents = [];
      if (category) {
        const filterExpr = category.original_id
          ? `(category_id = "${category.id}" || category_id = "${category.original_id}") && is_published = true`
          : `category_id = "${category.id}" && is_published = true`;

        documents = await pb
          .collection("report_documents")
          .getFullList({
            filter: filterExpr,
            sort: "-year,sort_order",
            requestKey: null,
          })
          .catch(async () => {
            return await pb
              .collection("report_documents")
              .getFullList({
                filter: `category_id = "${category.id}" || category_id = "${category.original_id || ""}"`,
                sort: "sort_order",
                requestKey: null,
              })
              .catch(() => []);
          });
      }
      return { category, documents };
    });
  } catch (err) {
    console.error(`[PocketBase] Gagal mengambil kategori laporan slug=${slug}:`, err);
    return null;
  }
}
