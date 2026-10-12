import { useState, useEffect, useMemo, useCallback } from "react";
import { compressImageToBase64 } from "@/lib/image-compress";
import { preloadImages } from "@/lib/cover-image";
import { getPocketBase, getPocketBaseFileUrl } from "@/lib/pocketbase/client";

const ITEMS_PER_PAGE = 12;
const GALERI_CACHE_PREFIX = "kemenag_galeri_cache_v2_";
const GALERI_YEARS_KEY = "kemenag_galeri_years_v2";
const CACHE_TTL_MS = 5 * 60 * 1000; // 5 menit

// Global module-level In-Memory Cache (tetap aktif selama sesi tab browser)
const galeriMemoryCache = new Map();

function getCacheKey(page, search, year) {
  return `${page}_${search ? search.trim().toLowerCase() : ""}_${year || ""}`;
}

function getCachedGaleri(page, search, year) {
  const key = getCacheKey(page, search, year);
  const now = Date.now();

  // 1. Cek In-Memory Cache
  if (galeriMemoryCache.has(key)) {
    const entry = galeriMemoryCache.get(key);
    if (now - entry.timestamp < CACHE_TTL_MS) {
      return entry.data;
    }
  }

  // 2. Cek SessionStorage
  if (typeof window !== "undefined") {
    try {
      const raw = sessionStorage.getItem(GALERI_CACHE_PREFIX + key);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (now - parsed.timestamp < CACHE_TTL_MS) {
          galeriMemoryCache.set(key, parsed);
          return parsed.data;
        }
      }
    } catch {
      // Abaikan bila sessionStorage error
    }
  }

  return null;
}

function setCachedGaleri(page, search, year, data) {
  const key = getCacheKey(page, search, year);
  const entry = { data, timestamp: Date.now() };
  galeriMemoryCache.set(key, entry);

  if (typeof window !== "undefined") {
    try {
      sessionStorage.setItem(GALERI_CACHE_PREFIX + key, JSON.stringify(entry));
    } catch {
      // Abaikan jika quota penuh
    }
  }
}

function clearGaleriCache() {
  galeriMemoryCache.clear();
  if (typeof window !== "undefined") {
    try {
      const toRemove = [];
      for (let i = 0; i < sessionStorage.length; i++) {
        const k = sessionStorage.key(i);
        if (k && (k.startsWith(GALERI_CACHE_PREFIX) || k === GALERI_YEARS_KEY)) {
          toRemove.push(k);
        }
      }
      toRemove.forEach((k) => sessionStorage.removeItem(k));
    } catch {
      // Abaikan
    }
  }
}

function dataURLtoFile(dataurl, filename) {
  const arr = dataurl.split(",");
  const mime = arr[0].match(/:(.*?);/)?.[1] || "image/webp";
  const bstr = atob(arr[1]);
  let n = bstr.length;
  const u8arr = new Uint8Array(n);
  while (n--) {
    u8arr[n] = bstr.charCodeAt(n);
  }
  return new File([u8arr], filename, { type: mime });
}

const emptyForm = {
  published_at: null,
  gallery_upload_base64: "", // for edit
  gallery_uploads: [],       // for bulk upload
  image_url: "",
};

export function useGaleriManager() {
  const [currentPage, setCurrentPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [yearFilter, setYearFilter] = useState("");
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchQuery);
    }, 250);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Ambil cache awal secara instan (0 milidetik, tanpa tunggu fetch)
  const initialCache = useMemo(() => {
    return getCachedGaleri(1, "", "");
  }, []);

  const [items, setItems] = useState(() => initialCache?.items || []);
  const [loading, setLoading] = useState(() => !initialCache);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const [totalPages, setTotalPages] = useState(() => initialCache?.totalPages || 1);
  const [totalItems, setTotalItems] = useState(() => initialCache?.totalItems || 0);
  const [availableYears, setAvailableYears] = useState(() => initialCache?.availableYears || []);

  const [openForm, setOpenForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [isDraggingImage, setIsDraggingImage] = useState(false);
  const [deletingId, setDeletingId] = useState(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);

  // Muat daftar tahun dokumentasi galeri
  const loadYears = useCallback(async () => {
    try {
      if (typeof window !== "undefined") {
        const cachedYears = sessionStorage.getItem(GALERI_YEARS_KEY);
        if (cachedYears) {
          const parsed = JSON.parse(cachedYears);
          if (Array.isArray(parsed) && parsed.length > 0) {
            setAvailableYears(parsed);
            return parsed;
          }
        }
      }
      const pb = getPocketBase();
      const allList = await pb.collection("galeri").getFullList({
        fields: "published_at",
        sort: "-published_at",
        requestKey: null,
      });
      const years = [
        ...new Set(
          allList
            .map((r) => (r.published_at ? new Date(r.published_at).getFullYear() : null))
            .filter(Boolean)
        ),
      ].sort((a, b) => b - a);

      if (years.length > 0) {
        setAvailableYears(years);
        if (typeof window !== "undefined") {
          try {
            sessionStorage.setItem(GALERI_YEARS_KEY, JSON.stringify(years));
          } catch {}
        }
      }
      return years;
    } catch {
      return [];
    }
  }, []);

  const loadItems = useCallback(
    async (signal, page = 1, search = "", year = "", isSilent = false) => {
      const cached = getCachedGaleri(page, search, year);
      if (cached && !isSilent) {
        setItems(cached.items);
        setTotalPages(cached.totalPages);
        setTotalItems(cached.totalItems);
        if (cached.availableYears?.length > 0) {
          setAvailableYears(cached.availableYears);
        }
        setLoading(false);
      } else if (!isSilent) {
        setLoading(true);
      }

      try {
        const pb = getPocketBase();

        // Susun filter dinamis PocketBase
        const filterParts = [];
        if (search && search.trim()) {
          const safeSearch = search.trim().replace(/['"]/g, "");
          filterParts.push(`title ~ "${safeSearch}"`);
        }
        if (year && year.trim()) {
          const safeYear = year.trim();
          filterParts.push(`published_at >= "${safeYear}-01-01 00:00:00" && published_at <= "${safeYear}-12-31 23:59:59"`);
        }

        const options = {
          sort: "-published_at",
          requestKey: null,
        };
        if (filterParts.length > 0) {
          options.filter = filterParts.join(" && ");
        }

        const res = await pb.collection("galeri").getList(page, ITEMS_PER_PAGE, options);

        // Optimasi: siapkan URL original dan URL thumbnail 400x533 (ringan, tajam, auto-cached)
        const list = res.items.map((it) => {
          const fullUrl = it.image_file ? getPocketBaseFileUrl(it, it.image_file) : (it.image_url || "");
          const thumbUrl = it.image_file ? getPocketBaseFileUrl(it, it.image_file, { thumb: "400x533" }) : fullUrl;
          return {
            ...it,
            image_url: fullUrl,
            thumb_url: thumbUrl,
          };
        });

        const pages = Math.max(1, res.totalPages);
        const total = res.totalItems || 0;

        setItems(list);
        setTotalPages(pages);
        setTotalItems(total);

        // Simpan ke cache (In-Memory + SessionStorage)
        setCachedGaleri(page, search, year, {
          items: list,
          totalPages: pages,
          totalItems: total,
          availableYears,
        });

        // Preload thumbnail gambar agar tersimpan di cache disk browser
        preloadImages(list.map((it) => it.thumb_url || it.image_url));
      } catch (err) {
        if (err.name === "AbortError" || err.isAbort) return;
        if (!cached) {
          setError(err.message || "Gagal memuat galeri.");
        }
      } finally {
        setLoading(false);
      }
    },
    [availableYears]
  );

  useEffect(() => {
    loadYears();
  }, [loadYears]);

  useEffect(() => {
    const controller = new AbortController();
    const cached = getCachedGaleri(currentPage, debouncedSearch, yearFilter);
    // Jika data sudah ada di cache, lakukan background silent revalidation
    loadItems(controller.signal, currentPage, debouncedSearch, yearFilter, Boolean(cached));
    return () => controller.abort();
  }, [currentPage, debouncedSearch, yearFilter, refreshKey, loadItems]);

  const paginatedItems = items; // Sudah di-paginate di level database

  const imagePreview = useMemo(() => {
    if (editingId && form.gallery_upload_base64) return [form.gallery_upload_base64];
    if (editingId && form.image_url) return [form.image_url];
    if (!editingId && form.gallery_uploads.length > 0) return form.gallery_uploads;
    return [];
  }, [form.gallery_upload_base64, form.image_url, form.gallery_uploads, editingId]);

  function handleOpenCreate() {
    setEditingId(null);
    setForm({ ...emptyForm, published_at: new Date() });
    setOpenForm(true);
  }

  function handleOpenEdit(item) {
    setEditingId(item.id);
    setForm({
      published_at: item.published_at ? new Date(item.published_at) : new Date(),
      image_url: item.image_url || "",
      gallery_upload_base64: "",
      gallery_uploads: [],
    });
    setOpenForm(true);
  }

  function handleCloseForm() {
    setOpenForm(false);
    setForm(emptyForm);
    setEditingId(null);
  }

  function handleChange(e) {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  }

  async function processImageFiles(files) {
    if (!files || files.length === 0) return;

    // Filter file gambar dan batasi maksimal 20 foto per batch
    const validFiles = Array.from(files)
      .filter((file) => file && file.type && file.type.startsWith("image/"))
      .slice(0, 20);

    if (validFiles.length === 0) {
      setError("File harus berupa gambar (JPG, PNG, JPEG, WebP).");
      return;
    }

    try {
      setUploadingImage(true);
      setError("");

      const processedImages = await Promise.all(
        validFiles.map(async (file) => {
          const compressed = await compressImageToBase64(file, {
            targetSizeKB: 420,
            hardMaxSizeKB: 500,
            throwIfOverHardLimit: false,
            maxWidth: 1600,
            maxHeight: 2133,
            initialQuality: 0.85,
          });
          return compressed?.base64 || null;
        })
      );

      const filteredImages = processedImages.filter(Boolean);
      if (filteredImages.length === 0) {
        setError("Gagal memproses gambar yang dipilih.");
        return;
      }

      setForm((prev) => {
        if (editingId) {
          // Edit mode only supports 1 image
          return { ...prev, gallery_upload_base64: filteredImages[0] };
        } else {
          // Bulk upload mode (maks 20 total)
          return {
            ...prev,
            gallery_uploads: [...prev.gallery_uploads, ...filteredImages].slice(0, 20),
          };
        }
      });
    } catch (err) {
      setError(err?.message || "Terjadi kesalahan saat memproses gambar.");
    } finally {
      setUploadingImage(false);
    }
  }

  async function handleImageFileChange(e) {
    const files = Array.from(e.target.files || []);
    await processImageFiles(files);
  }

  const handleImageDragOver = (e) => {
    e.preventDefault();
    setIsDraggingImage(true);
  };

  const handleImageDragLeave = () => {
    setIsDraggingImage(false);
  };

  const handleImageDrop = (e) => {
    e.preventDefault();
    setIsDraggingImage(false);
    const files = Array.from(e.dataTransfer.files || []);
    processImageFiles(files);
  };

  async function handleSave() {
    try {
      setSaving(true);
      setError("");
      const pb = getPocketBase();

      if (editingId) {
        if (form.gallery_upload_base64 && form.gallery_upload_base64.startsWith("data:")) {
          const file = dataURLtoFile(form.gallery_upload_base64, `galeri_edit_${Date.now()}.webp`);
          const formData = new FormData();
          formData.append("image_file", file);
          formData.append(
            "published_at",
            form.published_at ? new Date(form.published_at).toISOString() : new Date().toISOString()
          );
          await pb.collection("galeri").update(editingId, formData);
        } else {
          await pb.collection("galeri").update(editingId, {
            published_at: form.published_at ? new Date(form.published_at).toISOString() : new Date().toISOString(),
          });
        }
      } else if (Array.isArray(form.gallery_uploads) && form.gallery_uploads.length > 0) {
        for (let i = 0; i < form.gallery_uploads.length; i++) {
          const up = form.gallery_uploads[i];
          const base64Str = typeof up === "string" ? up : (up?.base64 || up?.image_url || "");
          if (base64Str && base64Str.startsWith("data:")) {
            const file = dataURLtoFile(base64Str, `galeri_${Date.now()}_${i + 1}.webp`);
            const formData = new FormData();
            formData.append("image_file", file);
            formData.append("is_published", "true");
            formData.append("source_type", "manual");
            formData.append(
              "published_at",
              form.published_at ? new Date(form.published_at).toISOString() : new Date().toISOString()
            );
            await pb.collection("galeri").create(formData);
          }
        }
      }

      // Bersihkan cache agar data baru termuat
      clearGaleriCache();

      setMessage("Visual galeri berhasil disimpan.");
      handleCloseForm();

      if (currentPage === 1) {
        await loadItems(null, 1, searchQuery, yearFilter);
      } else {
        setCurrentPage(1);
      }
    } catch (err) {
      setError(err?.message || "Gagal menyimpan galeri.");
    } finally {
      setSaving(false);
    }
  }

  function handleDelete(item) {
    setDeleteTarget(item);
    setShowDeleteConfirm(true);
  }

  async function handleConfirmDelete() {
    if (!deleteTarget) return;
    try {
      setDeletingId(deleteTarget.id);
      const pb = getPocketBase();
      await pb.collection("galeri").delete(deleteTarget.id);

      // Bersihkan cache agar data baru termuat
      clearGaleriCache();

      setMessage("Item galeri berhasil dihapus.");
      setShowDeleteConfirm(false);
      setDeleteTarget(null);
      await loadItems(null, currentPage, searchQuery, yearFilter);
    } catch (err) {
      setError(err?.message || "Gagal menghapus galeri.");
    } finally {
      setDeletingId(null);
    }
  }

  function handleRemoveImage(index) {
    setForm((prev) => ({
      ...prev,
      gallery_uploads: prev.gallery_uploads.filter((_, i) => i !== index),
    }));
  }

  function handleClearAllImages() {
    setForm((prev) => ({
      ...prev,
      gallery_uploads: [],
      gallery_upload_base64: "",
    }));
  }

  return {
    items,
    loading,
    message,
    setMessage,
    error,
    setError,
    currentPage,
    setCurrentPage,
    openForm,
    handleOpenCreate,
    handleOpenEdit,
    handleCloseForm,
    editingId,
    form,
    handleChange,
    handleImageFileChange,
    isDraggingImage,
    handleImageDragOver,
    handleImageDragLeave,
    handleImageDrop,
    handleSave,
    saving,
    uploadingImage,
    imagePreview,
    handleDelete,
    showDeleteConfirm,
    handleConfirmDelete,
    handleCancelDelete: () => setShowDeleteConfirm(false),
    handleRemoveImage,
    handleClearAllImages,
    deletingId,
    totalPages,
    totalItems,
    paginatedItems,
    searchQuery,
    setSearchQuery,
    yearFilter,
    setYearFilter,
    availableYears,
    triggerRefresh: () => {
      clearGaleriCache();
      setRefreshKey((k) => k + 1);
    },
  };
}
