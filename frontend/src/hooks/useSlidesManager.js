import { useState, useEffect, useMemo, useCallback, useRef } from "react";
import { compressImageToBase64, dataURLtoFile } from "@/lib/image-compress";
import { toCoverPreviewUrl, preloadImages } from "@/lib/cover-image";
import { getPocketBase, getPocketBaseFileUrl } from "@/lib/pocketbase/client";
import { readAdminCache, writeAdminCache, bustAdminAndPublicCache } from "@/lib/admin-cache";

const SLIDES_CACHE_KEY = "admin_slides_v1";

const emptyForm = {
  title: "",
  caption: "",
  image_url: "",
  image_upload_base64: "",
  image_upload_name: "",
  is_published: true,
  sort_order: 1,
  category: "utama",
};

function toNumber(value, fallback = 1) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
}

function slugifyFileBase(value) {
  return String(value || "")
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80)
    .replace(/-+$/g, "");
}

export function buildCleanInfografisFileName(title, rawFileName = "") {
  const fromTitle = slugifyFileBase(title);
  if (fromTitle) {
    return `${fromTitle}.webp`;
  }

  let base = String(rawFileName || "").replace(/\.[^/.]+$/, "");
  base = base
    .replace(/[0-9a-f]{8}[-_][0-9a-f]{4}[-_][0-9a-f]{4}[-_][0-9a-f]{4}[-_][0-9a-f]{12}/gi, "")
    .replace(/[_-]?\d{10,}/g, "")
    .replace(/[_-][a-z0-9]{10}$/i, "")
    .replace(/[_-]+(webp|jpg|jpeg|png|gif)(?=[_-]|$)/gi, "");

  const fromRaw = slugifyFileBase(base);
  return `${fromRaw || "infografis"}.webp`;
}

function normalizeCategoryId(value) {
  return String(value || "utama").toLowerCase().trim() || "utama";
}

function formatCategoryLabel(catId) {
  return String(catId || "")
    .split(/[-_\s]+/)
    .filter(Boolean)
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");
}

function getNextSortOrder(itemsList, categoryId) {
  const targetCat = normalizeCategoryId(categoryId);
  const matching = (Array.isArray(itemsList) ? itemsList : []).filter(
    (it) => normalizeCategoryId(it.category) === targetCat
  );
  if (matching.length === 0) return 1;
  const maxOrder = matching.reduce(
    (max, it) => Math.max(max, toNumber(it.sort_order, 0)),
    0
  );
  return Math.max(1, maxOrder + 1);
}

const DEFAULT_CATEGORIES = [
  { id: "utama", label: "Infografis Utama (Slider Tengah)", shortLabel: "Utama", slotDesc: "Slider Utama (Tengah)", color: "bg-emerald-500" },
  { id: "islam", label: "Mutiara Hikmah Islam (Kanan Tengah)", shortLabel: "Mutiara Islam", slotDesc: "Kanan Tengah", color: "bg-teal-500" },
  { id: "kristen", label: "Renungan Iman Kristen (Kiri Tengah)", shortLabel: "Renungan Kristen", slotDesc: "Kiri Tengah", color: "bg-sky-500" },
  { id: "katolik", label: "Doa & Renungan Katolik (Ujung Kiri)", shortLabel: "Renungan Katolik", slotDesc: "Ujung Kiri", color: "bg-indigo-500" },
  { id: "hindu", label: "Dharma Wacana Hindu (Ujung Kanan)", shortLabel: "Dharma Hindu", slotDesc: "Ujung Kanan", color: "bg-amber-500" },
];

const CATEGORY_ORDER = {
  utama: 0,
  islam: 1,
  kristen: 2,
  katolik: 3,
  hindu: 4,
};

function getCategoryRank(cat) {
  const normalized = normalizeCategoryId(cat);
  return Object.prototype.hasOwnProperty.call(CATEGORY_ORDER, normalized)
    ? CATEGORY_ORDER[normalized]
    : 99;
}

function compareSlidesByCategoryAndOrder(a, b) {
  const aCat = normalizeCategoryId(a.category);
  const bCat = normalizeCategoryId(b.category);
  const catDiff = getCategoryRank(aCat) - getCategoryRank(bCat);
  if (catDiff !== 0) return catDiff;
  if (aCat !== bCat) return aCat.localeCompare(bCat);
  const orderDiff = toNumber(a.sort_order, 1) - toNumber(b.sort_order, 1);
  if (orderDiff !== 0) return orderDiff;
  return String(a.title || "").localeCompare(String(b.title || ""));
}

export function useSlidesManager() {
  const initialCacheRef = useRef(undefined);
  if (initialCacheRef.current === undefined) {
    initialCacheRef.current = readAdminCache(SLIDES_CACHE_KEY);
  }
  const initialCached = initialCacheRef.current;

  const [items, setItems] = useState(
    () => (Array.isArray(initialCached?.items) ? initialCached.items : [])
  );
  const [loading, setLoading] = useState(
    () => !(Array.isArray(initialCached?.items) && initialCached.items.length > 0)
  );

  const [categories, setCategories] = useState(
    () =>
      Array.isArray(initialCached?.categories) && initialCached.categories.length > 0
        ? initialCached.categories
        : DEFAULT_CATEGORIES
  );

  // Search and Filter State
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");

  const [openForm, setOpenForm] = useState(false);
  const [editingId, setEditingId] = useState("");
  const [form, setForm] = useState(emptyForm);

  const [saving, setSaving] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [isDraggingImage, setIsDraggingImage] = useState(false);
  const [deletingId, setDeletingId] = useState("");
  const [togglingId, setTogglingId] = useState("");
  const [reorderingId, setReorderingId] = useState("");

  // Lightbox / Image Preview Modal
  const [previewModal, setPreviewModal] = useState({ open: false, item: null });

  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 12;

  const isMountedRef = useRef(true);
  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  const handlePageChange = useCallback((page) => {
    setCurrentPage(Math.max(1, page));
  }, []);

  const hasItemsRef = useRef(items.length > 0);
  useEffect(() => {
    hasItemsRef.current = items.length > 0;
  }, [items.length]);

  const loadItems = useCallback(async () => {
    try {
      if (!hasItemsRef.current) {
        setLoading(true);
      }
      setError("");

      const pb = getPocketBase();
      const records = await pb.collection("homepage_slides").getFullList({
        sort: "sort_order",
        requestKey: null,
      });

      if (!isMountedRef.current) return;

      const list = records.map((r) => {
        const rawImage = r.image_file ? getPocketBaseFileUrl(r, r.image_file) : (r.image_url || "");
        const thumbUrl = r.image_file
          ? getPocketBaseFileUrl(r, r.image_file, { thumb: "400x500" })
          : rawImage;
        return {
          ...r,
          has_image: Boolean(r.image_file || r.image_url),
          image_url: rawImage,
          thumb_url: thumbUrl,
          category: normalizeCategoryId(r.category),
          sort_order: Math.max(1, toNumber(r.sort_order, 1)),
          is_published: Boolean(r.is_published),
        };
      });

      // Merge any custom categories saved in PocketBase
      const defaultIds = new Set(DEFAULT_CATEGORIES.map((c) => c.id));
      const customCatsMap = new Map();
      for (const it of list) {
        if (it.category && !defaultIds.has(it.category) && !customCatsMap.has(it.category)) {
          const label = formatCategoryLabel(it.category);
          customCatsMap.set(it.category, {
            id: it.category,
            label,
            shortLabel: label,
            color: "bg-slate-500",
            isCustom: true,
          });
        }
      }

      const nextCategories = [...DEFAULT_CATEGORIES, ...customCatsMap.values()];
      setCategories(nextCategories);
      setItems(list);
      writeAdminCache(SLIDES_CACHE_KEY, { items: list, categories: nextCategories });
      preloadImages(list.map((it) => it.thumb_url || it.image_url).filter(Boolean));
    } catch (err) {
      if (!isMountedRef.current || err?.name === "AbortError" || err?.isAbort) return;
      if (!hasItemsRef.current) {
        setError(err?.message || "Gagal memuat data infografis.");
        setItems([]);
      }
    } finally {
      if (isMountedRef.current) {
        setLoading(false);
      }
    }
  }, []);

  useEffect(() => {
    loadItems();
  }, [loadItems]);

  useEffect(() => {
    if (!message && !error) return undefined;
    const timeout = window.setTimeout(() => {
      setMessage("");
      setError("");
    }, 3500);
    return () => window.clearTimeout(timeout);
  }, [message, error]);

  // Global stats across all items
  const totalItems = items.length;
  const totalPublished = useMemo(() => items.filter((x) => x.is_published).length, [items]);
  const totalDraft = totalItems - totalPublished;

  const categoryCounts = useMemo(() => {
    const counts = { all: items.length };
    for (const it of items) {
      const cat = normalizeCategoryId(it.category);
      counts[cat] = (counts[cat] || 0) + 1;
    }
    return counts;
  }, [items]);

  const categorySortedMap = useMemo(() => {
    const map = new Map();
    for (const it of items) {
      const cat = normalizeCategoryId(it.category);
      if (!map.has(cat)) map.set(cat, []);
      map.get(cat).push(it);
    }
    for (const list of map.values()) {
      list.sort(compareSlidesByCategoryAndOrder);
    }
    return map;
  }, [items]);

  // Client-side search, category, status filter + deterministic category-first ordering
  const filteredItems = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return items
      .filter((item) => {
        if (categoryFilter !== "all" && normalizeCategoryId(item.category) !== categoryFilter) {
          return false;
        }
        if (statusFilter === "published" && !item.is_published) {
          return false;
        }
        if (statusFilter === "draft" && item.is_published) {
          return false;
        }
        if (q) {
          const haystack = `${item.title || ""} ${item.caption || ""} ${item.category || ""}`.toLowerCase();
          if (!haystack.includes(q)) return false;
        }
        return true;
      })
      .sort(compareSlidesByCategoryAndOrder)
      .map((item) => {
        const cat = normalizeCategoryId(item.category);
        const catList = categorySortedMap.get(cat) || [];
        const pos = catList.findIndex((x) => x.id === item.id);
        return {
          ...item,
          isFirstInCategory: pos <= 0,
          isLastInCategory: pos === -1 || pos >= catList.length - 1,
        };
      });
  }, [items, categorySortedMap, searchQuery, categoryFilter, statusFilter]);

  const totalPages = Math.max(1, Math.ceil(filteredItems.length / pageSize));
  const safeCurrentPage = Math.min(currentPage, totalPages);

  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(totalPages);
    }
  }, [currentPage, totalPages]);

  const paginatedItems = useMemo(() => {
    const start = (safeCurrentPage - 1) * pageSize;
    return filteredItems.slice(start, start + pageSize);
  }, [filteredItems, safeCurrentPage, pageSize]);

  const imagePreview = useMemo(() => {
    if (form.image_upload_base64) return form.image_upload_base64;
    return toCoverPreviewUrl(form.image_url || "");
  }, [form.image_upload_base64, form.image_url]);

  const resetForm = useCallback(() => {
    setForm(emptyForm);
    setEditingId("");
  }, []);

  const handleOpenCreate = useCallback(() => {
    const initialCategory = categoryFilter !== "all" ? categoryFilter : "utama";
    const nextOrder = getNextSortOrder(items, initialCategory);
    setEditingId("");
    setForm({
      ...emptyForm,
      category: initialCategory,
      sort_order: nextOrder,
    });
    setOpenForm(true);
  }, [items, categoryFilter]);

  const handleOpenEdit = useCallback((item) => {
    setEditingId(item.id);
    setForm({
      title: item.title || "",
      caption: item.caption || "",
      image_url: item.image_url || "",
      image_upload_base64: "",
      image_upload_name: "",
      is_published: Boolean(item.is_published),
      sort_order: Math.max(1, toNumber(item.sort_order, 1)),
      category: normalizeCategoryId(item.category),
    });
    setOpenForm(true);
  }, []);

  const handleCloseForm = useCallback(() => {
    setOpenForm(false);
    resetForm();
  }, [resetForm]);

  const handleChange = useCallback(
    (event) => {
      const { name, value, type, checked } = event.target;
      setForm((prev) => {
        const nextVal = type === "checkbox" ? checked : value;
        const nextState = {
          ...prev,
          [name]: nextVal,
        };
        if (name === "category" && !editingId) {
          nextState.sort_order = getNextSortOrder(items, value);
        }
        return nextState;
      });
    },
    [editingId, items]
  );

  // Quick Toggle Publish Status with guard against imageless records & Optimistic UI Update
  const handleTogglePublish = useCallback(
    async (item) => {
      if (!item?.id || togglingId) return;

      const nextStatus = !item.is_published;
      if (nextStatus && !item.image_url && !item.image_file) {
        setError(
          "Infografis belum memiliki gambar. Silakan edit dan unggah gambar terlebih dahulu sebelum menayangkan."
        );
        return;
      }

      setTogglingId(item.id);
      setItems((prev) =>
        prev.map((it) => (it.id === item.id ? { ...it, is_published: nextStatus } : it))
      );

      try {
        const pb = getPocketBase();
        await pb.collection("homepage_slides").update(item.id, { is_published: nextStatus });
        bustAdminAndPublicCache(SLIDES_CACHE_KEY, "slides");

        setMessage(
          nextStatus
            ? `Infografis "${item.title}" sekarang tayang.`
            : `Infografis "${item.title}" diubah ke draft.`
        );
      } catch (err) {
        setItems((prev) =>
          prev.map((it) => (it.id === item.id ? { ...it, is_published: !nextStatus } : it))
        );
        setError(err?.message || "Gagal memperbarui status.");
      } finally {
        setTogglingId("");
      }
    },
    [togglingId]
  );

  const handleChangeOrder = useCallback(
    async (item, newOrder) => {
      if (!item?.id || reorderingId) return;
      const targetOrder = Math.max(1, toNumber(newOrder, 1));
      const prevOrder = toNumber(item.sort_order, 1);
      if (targetOrder === prevOrder) return;

      setReorderingId(item.id);
      setItems((prev) =>
        prev.map((it) => (it.id === item.id ? { ...it, sort_order: targetOrder } : it))
      );

      try {
        const pb = getPocketBase();
        await pb.collection("homepage_slides").update(item.id, { sort_order: targetOrder });
        bustAdminAndPublicCache(SLIDES_CACHE_KEY, "slides");
        setMessage(`Urutan "${item.title}" diubah menjadi #${targetOrder}.`);
      } catch (err) {
        setItems((prev) =>
          prev.map((it) => (it.id === item.id ? { ...it, sort_order: prevOrder } : it))
        );
        setError(err?.message || "Gagal memperbarui urutan infografis.");
      } finally {
        setReorderingId("");
      }
    },
    [reorderingId]
  );

  const handleQuickMoveOrder = useCallback(
    async (item, delta) => {
      if (!item?.id || reorderingId) return;
      const cat = normalizeCategoryId(item.category);
      const catItems = [...(categorySortedMap.get(cat) || [])];
      const idx = catItems.findIndex((it) => it.id === item.id);
      const targetIdx = idx + delta;
      if (idx === -1 || targetIdx < 0 || targetIdx >= catItems.length) return;

      const reordered = [...catItems];
      [reordered[idx], reordered[targetIdx]] = [reordered[targetIdx], reordered[idx]];

      const orderUpdates = new Map();
      reordered.forEach((it, i) => {
        const nextOrder = i + 1;
        if (toNumber(it.sort_order, 1) !== nextOrder) {
          orderUpdates.set(it.id, nextOrder);
        }
      });

      if (orderUpdates.size === 0) return;

      const prevSnapshot = items;
      setReorderingId(item.id);
      setItems((prev) =>
        prev.map((it) =>
          orderUpdates.has(it.id) ? { ...it, sort_order: orderUpdates.get(it.id) } : it
        )
      );

      try {
        const pb = getPocketBase();
        await Promise.all(
          Array.from(orderUpdates.entries()).map(([id, nextOrder]) =>
            pb.collection("homepage_slides").update(id, { sort_order: nextOrder })
          )
        );
        bustAdminAndPublicCache(SLIDES_CACHE_KEY, "slides");
        const finalOrder = orderUpdates.get(item.id) ?? targetIdx + 1;
        setMessage(`Urutan "${item.title}" dipindahkan ke #${finalOrder}.`);
      } catch (err) {
        setItems(prevSnapshot);
        setError(err?.message || "Gagal memperbarui urutan infografis.");
      } finally {
        setReorderingId("");
      }
    },
    [reorderingId, categorySortedMap, items]
  );

  async function processImageFile(file) {
    if (!file) return;
    if (!file.type || !file.type.startsWith("image/")) {
      setError("File harus berupa gambar (JPG, PNG, WebP).");
      return;
    }

    try {
      setUploadingImage(true);
      setError("");

      const compressed = await compressImageToBase64(file, {
        targetSizeKB: 420,
        hardMaxSizeKB: 500,
        throwIfOverHardLimit: false,
        maxWidth: 1600,
        maxHeight: 2000,
      });

      setForm((prev) => ({
        ...prev,
        image_upload_base64: compressed.base64,
        image_upload_name: buildCleanInfografisFileName(prev.title, compressed.fileName),
      }));

      setMessage("Gambar berhasil diproses dan siap disimpan.");
    } catch (err) {
      setError(err?.message || "Gagal memproses gambar.");
    } finally {
      setUploadingImage(false);
    }
  }

  const handleImageFileChange = useCallback(async (event) => {
    const file = event.target.files?.[0];
    if (file) await processImageFile(file);
    event.target.value = "";
  }, []);

  const handleImageDragOver = useCallback((e) => {
    e.preventDefault();
    setIsDraggingImage(true);
  }, []);

  const handleImageDragLeave = useCallback(() => {
    setIsDraggingImage(false);
  }, []);

  const handleImageDrop = useCallback((e) => {
    e.preventDefault();
    setIsDraggingImage(false);
    const file = e.dataTransfer.files?.[0];
    if (file) processImageFile(file);
  }, []);

  const handleRemoveSelectedImage = useCallback(() => {
    setForm((prev) => ({
      ...prev,
      image_upload_base64: "",
      image_upload_name: "",
    }));
  }, []);

  const validateForm = useCallback(() => {
    if (!String(form.title || "").trim()) return "Judul infografis wajib diisi.";
    if (!String(form.category || "").trim()) return "Kategori infografis wajib diisi.";
    if (!String(form.image_url || "").trim() && !form.image_upload_base64) {
      return "Gambar infografis wajib diupload.";
    }
    return "";
  }, [form.title, form.category, form.image_url, form.image_upload_base64]);

  const handleSave = useCallback(async () => {
    const validation = validateForm();
    if (validation) {
      setError(validation);
      return;
    }

    try {
      setSaving(true);
      setError("");
      setMessage("");

      const normalizedCategory = normalizeCategoryId(form.category);
      const sortOrder = Math.max(1, toNumber(form.sort_order, 1));
      const isPublished = Boolean(form.is_published);

      const formData = new FormData();
      formData.append("title", String(form.title || "").trim());
      formData.append("caption", String(form.caption || "").trim());
      formData.append("category", normalizedCategory);
      formData.append("sort_order", String(sortOrder));
      formData.append("is_published", String(isPublished));

      const hasNewUpload = Boolean(
        form.image_upload_base64 && form.image_upload_base64.startsWith("data:")
      );
      if (hasNewUpload) {
        const cleanFileName = buildCleanInfografisFileName(
          form.title,
          form.image_upload_name
        );
        const file = dataURLtoFile(form.image_upload_base64, cleanFileName);
        formData.append("image_file", file);
      } else if (String(form.image_url || "").trim()) {
        formData.append("image_url", String(form.image_url || "").trim());
      }

      const pb = getPocketBase();
      let record;
      if (editingId) {
        record = await pb.collection("homepage_slides").update(editingId, formData);
      } else {
        record = await pb.collection("homepage_slides").create(formData);
      }

      // Sinkronkan field image_url dengan URL file PocketBase publik
      if (record?.image_file) {
        const publicFileUrl = pb.files.getURL(record, record.image_file);
        if (publicFileUrl && record.image_url !== publicFileUrl) {
          await pb.collection("homepage_slides").update(record.id, { image_url: publicFileUrl });
        }
      }

      // Normalisasi urutan seluruh item dalam kategori agar tidak ada nomor Urutan # kembar
      if (record?.id) {
        const others = items
          .filter(
            (it) =>
              it.id !== record.id &&
              normalizeCategoryId(it.category) === normalizedCategory
          )
          .sort(compareSlidesByCategoryAndOrder);

        const insertIdx = Math.min(others.length, Math.max(0, sortOrder - 1));
        const ordered = [...others];
        ordered.splice(insertIdx, 0, { ...record, sort_order: sortOrder });

        const orderPatches = [];
        ordered.forEach((it, idx) => {
          const nextOrder = idx + 1;
          const currentOrder = it.id === record.id ? sortOrder : toNumber(it.sort_order, 1);
          if (currentOrder !== nextOrder) {
            orderPatches.push(
              pb.collection("homepage_slides").update(it.id, { sort_order: nextOrder })
            );
          }
        });
        if (orderPatches.length > 0) {
          await Promise.all(orderPatches);
        }
      }

      bustAdminAndPublicCache(SLIDES_CACHE_KEY, "slides");
      setMessage(
        editingId ? "Infografis berhasil diperbarui." : "Infografis baru berhasil ditambahkan."
      );
      handleCloseForm();
      await loadItems();
    } catch (err) {
      setError(err?.message || "Gagal menyimpan infografis.");
    } finally {
      setSaving(false);
    }
  }, [form, editingId, items, validateForm, handleCloseForm, loadItems]);

  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [idToDelete, setIdToDelete] = useState(null);

  const handleDeleteRequest = useCallback((id) => {
    setIdToDelete(id);
    setShowDeleteConfirm(true);
  }, []);

  const handleCancelDelete = useCallback(() => {
    setIdToDelete(null);
    setShowDeleteConfirm(false);
  }, []);

  const handleConfirmDelete = useCallback(async () => {
    if (!idToDelete) return;

    try {
      setDeletingId(idToDelete);
      setError("");
      setMessage("");

      const pb = getPocketBase();
      await pb.collection("homepage_slides").delete(idToDelete);
      bustAdminAndPublicCache(SLIDES_CACHE_KEY, "slides");

      setMessage("Infografis berhasil dihapus.");
      setShowDeleteConfirm(false);
      setIdToDelete(null);
      await loadItems();
    } catch (err) {
      setError(err?.message || "Gagal menghapus infografis.");
    } finally {
      setDeletingId("");
    }
  }, [idToDelete, loadItems]);

  // Lightbox handlers
  const handleOpenPreview = useCallback((item) => {
    setPreviewModal({ open: true, item });
  }, []);

  const handleClosePreview = useCallback(() => {
    setPreviewModal({ open: false, item: null });
  }, []);

  return {
    items,
    filteredItems,
    paginatedItems,
    currentPage: safeCurrentPage,
    totalPages,
    totalItems,
    totalPublished,
    totalDraft,
    categoryCounts,
    handlePageChange,
    loading,
    searchQuery,
    setSearchQuery,
    categoryFilter,
    setCategoryFilter,
    statusFilter,
    setStatusFilter,
    categories,
    openForm,
    editingId,
    form,
    saving,
    uploadingImage,
    deletingId,
    togglingId,
    reorderingId,
    message,
    setMessage,
    error,
    setError,
    imagePreview,
    handleOpenCreate,
    handleOpenEdit,
    handleCloseForm,
    handleChange,
    handleImageFileChange,
    handleRemoveSelectedImage,
    isDraggingImage,
    handleImageDragOver,
    handleImageDragLeave,
    handleImageDrop,
    handleSave,
    handleDelete: handleDeleteRequest,
    handleTogglePublish,
    handleChangeOrder,
    handleQuickMoveOrder,
    showDeleteConfirm,
    handleConfirmDelete,
    handleCancelDelete,
    previewModal,
    handleOpenPreview,
    handleClosePreview,
    reload: loadItems,
    toNumber,
  };
}
