import { getPocketBase, getPocketBaseFileUrl } from "./client";
import { DEFAULT_PTSP_SERVICES } from "@/data/ptsp-services";

/**
 * Service Database PocketBase untuk Akses Publik & SSR
 */

export async function getPublicBeritaList({
  page = 1,
  perPage = 18,
  category = "",
  search = "",
  sort = "-published_at",
} = {}) {
  const pb = getPocketBase();
  const filters = ["is_published = true"];

  if (category && category !== "Semua") {
    filters.push(`category = "${category}"`);
  }

  if (search) {
    const cleanSearch = search.replace(/["\\]/g, "");
    filters.push(`(title ~ "${cleanSearch}" || content ~ "${cleanSearch}")`);
  }

  const sortOrder = sort === "oldest" ? "published_at" : "-published_at";

  try {
    const res = await pb.collection("berita").getList(page, perPage, {
      filter: filters.join(" && "),
      sort: sortOrder,
    });
    return {
      items: res.items,
      total: res.totalItems,
      page: res.page,
      perPage: res.perPage,
      totalPages: res.totalPages,
    };
  } catch (err) {
    console.error("[PocketBase] Error getPublicBeritaList:", err);
    return { items: [], total: 0, page: 1, perPage, totalPages: 1 };
  }
}

export async function getPublicBeritaBySlug(slug) {
  if (!slug) return null;
  const pb = getPocketBase();
  try {
    const cleanSlug = slug.replace(/["\\]/g, "");
    const record = await pb
      .collection("berita")
      .getFirstListItem(`slug = "${cleanSlug}" && is_published = true`);
    return record;
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
  const pb = getPocketBase();
  try {
    const filters = ["is_published = true"];
    if (category) filters.push(`category = "${category}"`);
    if (excludeId) filters.push(`id != "${excludeId}"`);

    const res = await pb.collection("berita").getList(1, limit, {
      filter: filters.join(" && "),
      sort: "-published_at",
    });
    return res.items;
  } catch {
    return [];
  }
}

export async function getAdjacentBerita(publishedAt, excludeId) {
  const pb = getPocketBase();
  let prev = null;
  let next = null;
  try {
    if (publishedAt) {
      const prevRes = await pb.collection("berita").getList(1, 1, {
        filter: `is_published = true && published_at < "${publishedAt}" && id != "${excludeId}"`,
        sort: "-published_at",
      });
      prev = prevRes.items[0] || null;

      const nextRes = await pb.collection("berita").getList(1, 1, {
        filter: `is_published = true && published_at > "${publishedAt}" && id != "${excludeId}"`,
        sort: "published_at",
      });
      next = nextRes.items[0] || null;
    }
  } catch {}
  return { prev, next };
}

export async function getHomepageSlides() {
  const pb = getPocketBase();
  try {
    const res = await pb.collection("homepage_slides").getFullList({
      filter: "is_published = true",
      sort: "sort_order",
    });
    return res;
  } catch (err) {
    console.error("[PocketBase] Error getHomepageSlides:", err);
    return [];
  }
}

export async function getPublicGaleri(page = 1, perPage = 24) {
  const pb = getPocketBase();
  try {
    const res = await pb.collection("galeri").getList(page, perPage, {
      filter: "is_published = true",
      sort: "-published_at",
    });
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
  } catch (err) {
    console.error("[PocketBase] Error getPublicGaleri:", err);
    return { items: [], total: 0, totalPages: 1 };
  }
}

export async function getPublicSeksiList() {
  const pb = getPocketBase();
  try {
    const res = await pb.collection("seksi").getFullList();

    let allPegawai = [];
    try {
      allPegawai = await pb.collection("pegawai_seksi").getFullList({
        sort: "sort_order",
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
  } catch (err) {
    console.error("[PocketBase] Error getPublicSeksiList:", err);
    return [];
  }
}

export async function getPublicSeksiBySlug(slug) {
  if (!slug) return null;
  const pb = getPocketBase();
  try {
    const cleanSlug = slug.replace(/["\\]/g, "");
    const seksi = await pb.collection("seksi").getFirstListItem(`slug = "${cleanSlug}"`);
    let pegawai = [];
    if (seksi?.id) {
      const filterConditions = [`seksi_id = "${seksi.id}"`];
      if (seksi.original_id) {
        filterConditions.push(`seksi_id = "${seksi.original_id}"`);
      }
      pegawai = await pb.collection("pegawai_seksi").getFullList({
        filter: filterConditions.join(" || "),
        sort: "sort_order",
      });
    }
    return { ...seksi, pegawai, pegawai_count: pegawai.length };
  } catch (err) {
    console.error(`[PocketBase] Error getPublicSeksiBySlug ${slug}:`, err);
    return null;
  }
}

export async function getPublicYoutubeVideos(limit = 50) {
  const pb = getPocketBase();
  try {
    const res = await pb.collection("youtube_videos").getList(1, limit, {
      filter: "is_published = true",
      sort: "sort_order",
      requestKey: null,
    });
    return (res.items || []).map((v) => ({
      ...v,
      id: String(v.id),
      title: (v.title || "").trim(),
      created_at: v.created || v.created_at || null,
      updated_at: v.updated || v.updated_at || null,
    }));
  } catch (err) {
    console.error("[PocketBase] Error getPublicYoutubeVideos:", err);
    return [];
  }
}

export async function getPublicLayanan() {
  const pb = getPocketBase();
  try {
    const res = await pb.collection("layanan_publik").getFullList({
      filter: "is_active = true",
      sort: "sort_order",
    });
    return res;
  } catch {
    return [];
  }
}

export async function getPublicSettings() {
  const pb = getPocketBase();
  try {
    const res = await pb.collection("site_settings").getFullList();
    const map = {};
    for (const item of res) {
      map[item.key] = item.value;
    }
    return map;
  } catch {
    return {};
  }
}

export async function getPublicPortalData() {
  const pb = getPocketBase();
  try {
    const [beritaRes, slides, videos, layanan, settings] = await Promise.all([
      pb.collection("berita").getList(1, 10, {
        filter: "is_published = true",
        sort: "-published_at",
        requestKey: null,
      }).catch(() => ({ items: [], totalItems: 0 })),
      pb.collection("homepage_slides").getFullList({
        filter: "is_published = true",
        sort: "sort_order",
        requestKey: null,
      }).catch(() => []),
      pb.collection("youtube_videos").getList(1, 4, {
        filter: "is_published = true",
        sort: "sort_order",
        requestKey: null,
      }).catch(() => ({ items: [] })),
      pb.collection("layanan_publik").getFullList({
        filter: "is_active = true",
        sort: "sort_order",
        requestKey: null,
      }).catch(() => []),
      pb.collection("site_settings").getFullList({ requestKey: null }).catch(() => []),
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
  const pb = getPocketBase();
  try {
    const [latestRes, popularRes, nasionalRes, slides, galeriRes, testiRes, categoryRes] = await Promise.all([
      pb.collection("berita").getList(1, 10, {
        filter: "is_published = true",
        sort: "-published_at",
        requestKey: null,
      }).catch(() => ({ items: [], totalItems: 0 })),
      pb.collection("berita").getList(1, 5, {
        filter: "is_published = true",
        sort: "-views",
        requestKey: null,
      }).catch(() => ({ items: [] })),
      pb.collection("berita").getList(1, 5, {
        filter: 'is_published = true && category = "Nasional"',
        sort: "-published_at",
        requestKey: null,
      }).catch(() => ({ items: [] })),
      pb.collection("homepage_slides").getFullList({
        filter: "is_published = true",
        sort: "sort_order",
        requestKey: null,
      }).catch(() => []),
      pb.collection("galeri").getList(1, 12, {
        filter: "is_published = true",
        sort: "-published_at",
        requestKey: null,
      }).catch(() => ({ items: [] })),
      pb.collection("testimonials").getFullList({
        sort: "sort_order",
        requestKey: null,
      }).catch(() => []),
      pb.collection("berita").getList(1, 60, {
        filter: 'is_published = true && category != "Umum" && category != "Kegiatan" && category != "Nasional"',
        sort: "-published_at",
        requestKey: null,
      }).catch(() => ({ items: [] })),
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
  const pb = getPocketBase();
  try {
    const cleanSlug = slug.replace(/["\\]/g, "");
    const record = await pb
      .collection("static_pages")
      .getFirstListItem(`slug = "${cleanSlug}"`);
    return record;
  } catch {
    return null;
  }
}

export async function getAllLaporanCategories() {
  const pb = getPocketBase();
  try {
    const categories = await pb
      .collection("report_categories")
      .getFullList({
        filter: "is_active = true",
        sort: "sort_order",
      });
    return categories || [];
  } catch (err) {
    console.error("[PocketBase] Error getAllLaporanCategories:", err);
    return [];
  }
}

export async function getLaporanCategoryBySlug(slug) {
  if (!slug) return null;
  const pb = getPocketBase();
  try {
    const cleanSlug = String(slug).trim().toLowerCase().replace(/["\\]/g, "");
    const category = await pb
      .collection("report_categories")
      .getFirstListItem(`slug = "${cleanSlug}"`);
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
        })
        .catch(async () => {
          // Fallback tanpa filter is_published jika ada record legacy
          return await pb
            .collection("report_documents")
            .getFullList({
              filter: `category_id = "${category.id}" || category_id = "${category.original_id || ''}"`,
              sort: "sort_order",
            })
            .catch(() => []);
        });
    }
    return { category, documents };
  } catch (err) {
    console.error(`[PocketBase] Gagal mengambil kategori laporan slug=${slug}:`, err);
    return null;
  }
}
