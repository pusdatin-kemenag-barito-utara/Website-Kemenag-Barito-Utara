import { useState, useEffect, useMemo, useCallback } from "react";
import { compressImageToBase64 } from "@/lib/image-compress";
import { toCoverPreviewUrl, preloadImages } from "@/lib/cover-image";

const emptyForm = {
  title: "",
  caption: "",
  image_url: "",
  image_upload_base64: "",
  image_upload_name: "",
  is_published: true,
  sort_order: 0,
  category: "utama",
};

async function readJsonSafely(response) {
  const raw = await response.text();
  if (!raw) return {};
  try {
    return JSON.parse(raw);
  } catch {
    return {};
  }
}

function toNumber(value, fallback = 0) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
}

const DEFAULT_CATEGORIES = [
  { id: "utama", label: "Infografis Utama (Tengah)", color: "bg-emerald-500" },
  { id: "islam", label: "Mutiara Hikmah Islam", color: "bg-teal-500" },
  { id: "kristen", label: "Renungan Iman Kristen", color: "bg-sky-500" },
  { id: "katolik", label: "Renungan Iman Katolik", color: "bg-indigo-500" },
  { id: "hindu", label: "Dharma Wacana Hindu", color: "bg-amber-500" },
];

export function useSlidesManager() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  // Dynamic Categories State
  const [categories, setCategories] = useState(DEFAULT_CATEGORIES);

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

  // Lightbox / Image Preview Modal
  const [previewModal, setPreviewModal] = useState({ open: false, item: null });

  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [totalPublished, setTotalPublished] = useState(0);
  const [totalDraft, setTotalDraft] = useState(0);
  const pageSize = 12; // Compact responsive grid size

  const handlePageChange = useCallback((page) => {
    setCurrentPage(page);
  }, []);

  const loadItems = useCallback(async (signal) => {
    try {
      setLoading(true);
      setError("");

      const params = new URLSearchParams();
      params.set("page", String(currentPage));
      params.set("limit", String(pageSize));
      if (searchQuery.trim()) params.set("q", searchQuery.trim());
      if (categoryFilter && categoryFilter !== "all") params.set("category", categoryFilter);
      if (statusFilter === "published") params.set("is_published", "true");
      if (statusFilter === "draft") params.set("is_published", "false");

      const response = await fetch(`/api/admin/homepage-slides?${params.toString()}`, {
        method: "GET",
        cache: "no-store",
        signal,
      });

      const data = await readJsonSafely(response);
      if (!response.ok) {
        throw new Error(data?.message || "Gagal memuat data infografis.");
      }

      const list = Array.isArray(data?.items) ? data.items : [];
      setItems(list);
      preloadImages(list.map((it) => it.image_url));

      // Parse dynamic categories from server
      if (Array.isArray(data?.categories) && data.categories.length > 0) {
        const colorPalette = [
          "bg-emerald-500",
          "bg-teal-500",
          "bg-sky-500",
          "bg-indigo-500",
          "bg-amber-500",
          "bg-purple-500",
          "bg-rose-500",
          "bg-cyan-500",
        ];
        const merged = data.categories.map((c, idx) => {
          const existing = DEFAULT_CATEGORIES.find((d) => d.id === c.id);
          return {
            id: c.id,
            label: c.label || c.id,
            color: existing?.color || colorPalette[idx % colorPalette.length],
          };
        });
        setCategories(merged);
      }

      const total = data?.pagination?.totalItems ?? data?.total ?? list.length;
      const published = data?.pagination?.totalPublished ?? data?.publishedCount ?? 0;
      const draft = data?.draftCount ?? (total - published >= 0 ? total - published : 0);
      const pages = data?.pagination?.totalPages ?? data?.totalPages ?? 1;

      setTotalItems(total);
      setTotalPublished(published);
      setTotalDraft(draft);
      setTotalPages(pages > 0 ? pages : 1);
    } catch (err) {
      if (err.name === "AbortError") return;
      setError(err?.message || "Gagal memuat data infografis.");
      setItems([]);
    } finally {
      setLoading(false);
    }
  }, [currentPage, pageSize, searchQuery, categoryFilter, statusFilter]);

  useEffect(() => {
    const controller = new AbortController();
    loadItems(controller.signal);
    return () => controller.abort();
  }, [loadItems]);

  useEffect(() => {
    if (!message && !error) return undefined;
    const timeout = window.setTimeout(() => {
      setMessage("");
      setError("");
    }, 3000);
    return () => window.clearTimeout(timeout);
  }, [message, error]);

  const paginatedItems = items;

  const imagePreview = useMemo(() => {
    if (form.image_upload_base64) return form.image_upload_base64;
    return toCoverPreviewUrl(form.image_url || "");
  }, [form.image_upload_base64, form.image_url]);

  const resetForm = useCallback(() => {
    setForm(emptyForm);
    setEditingId("");
  }, []);

  const handleOpenCreate = useCallback(() => {
    resetForm();
    setOpenForm(true);
  }, [resetForm]);

  const handleOpenEdit = useCallback((item) => {
    setEditingId(item.id);
    setForm({
      title: item.title || "",
      caption: item.caption || "",
      image_url: item.image_url || "",
      image_upload_base64: "",
      image_upload_name: "",
      is_published: Boolean(item.is_published),
      sort_order: toNumber(item.sort_order, 0),
      category: item.category || "utama",
    });
    setOpenForm(true);
  }, []);

  const handleCloseForm = useCallback(() => {
    setOpenForm(false);
    resetForm();
  }, [resetForm]);

  const handleChange = useCallback((event) => {
    const { name, value, type, checked } = event.target;
    setForm((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  }, []);

  // Quick Toggle Publish Status with Optimistic UI Update
  const handleTogglePublish = useCallback(async (item) => {
    if (!item?.id || togglingId) return;

    const nextStatus = !item.is_published;
    setTogglingId(item.id);

    // Optimistic update
    setItems((prev) =>
      prev.map((it) => (it.id === item.id ? { ...it, is_published: nextStatus } : it))
    );
    setTotalPublished((prev) => (nextStatus ? prev + 1 : Math.max(0, prev - 1)));
    setTotalDraft((prev) => (nextStatus ? Math.max(0, prev - 1) : prev + 1));

    try {
      const response = await fetch(`/api/admin/homepage-slides/${item.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ is_published: nextStatus }),
      });

      const data = await readJsonSafely(response);
      if (!response.ok) {
        throw new Error(data?.message || "Gagal mengubah status publikasi.");
      }

      setMessage(
        nextStatus
          ? `Infografis "${item.title}" sekarang tayang.`
          : `Infografis "${item.title}" diubah ke draft.`
      );
    } catch (err) {
      // Revert on failure
      setItems((prev) =>
        prev.map((it) => (it.id === item.id ? { ...it, is_published: !nextStatus } : it))
      );
      setTotalPublished((prev) => (!nextStatus ? prev + 1 : Math.max(0, prev - 1)));
      setTotalDraft((prev) => (!nextStatus ? Math.max(0, prev - 1) : prev + 1));
      setError(err?.message || "Gagal memperbarui status.");
    } finally {
      setTogglingId("");
    }
  }, [togglingId]);

  async function processImageFile(file) {
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      setError("File harus berupa gambar.");
      return;
    }

    try {
      setUploadingImage(true);
      setError("");

      const compressed = await compressImageToBase64(file, {
        targetSizeKB: 400,
        hardMaxSizeKB: 500,
        throwIfOverHardLimit: false,
        maxWidth: 1920,
        maxHeight: 1080,
      });

      setForm((prev) => ({
        ...prev,
        image_upload_base64: compressed.base64,
        image_upload_name: compressed.fileName,
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
    const file = e.dataTransfer.files[0];
    if (file) processImageFile(file);
  }, []);

  const validateForm = useCallback(() => {
    if (!String(form.title || "").trim()) return "Judul infografis wajib diisi.";
    if (!String(form.image_url || "").trim() && !form.image_upload_base64) {
      return "Gambar infografis wajib diupload.";
    }
    return "";
  }, [form.title, form.image_url, form.image_upload_base64]);

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

      const payload = {
        title: String(form.title || "").trim(),
        caption: String(form.caption || "").trim(),
        image_url: String(form.image_url || "").trim(),
        image_upload_base64: form.image_upload_base64 || "",
        image_upload_name: form.image_upload_name || "",
        is_published: Boolean(form.is_published),
        sort_order: toNumber(form.sort_order, 0),
        category: form.category || "utama",
      };

      const url = editingId
        ? `/api/admin/homepage-slides/${editingId}`
        : "/api/admin/homepage-slides";
      const method = editingId ? "PATCH" : "POST";

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await readJsonSafely(response);
      if (!response.ok) {
        throw new Error(data?.message || "Gagal menyimpan infografis.");
      }

      setMessage(editingId ? "Infografis berhasil diperbarui." : "Infografis baru berhasil ditambahkan.");
      handleCloseForm();
      await loadItems();
    } catch (err) {
      setError(err?.message || "Gagal menyimpan infografis.");
    } finally {
      setSaving(false);
    }
  }, [form, editingId, validateForm, handleCloseForm, loadItems]);

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

      const response = await fetch(`/api/admin/homepage-slides/${idToDelete}`, {
        method: "DELETE",
      });

      const data = await readJsonSafely(response);
      if (!response.ok) {
        throw new Error(data?.message || "Gagal menghapus infografis.");
      }

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
    paginatedItems,
    currentPage,
    totalPages,
    totalItems,
    totalPublished,
    totalDraft,
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
    isDraggingImage,
    handleImageDragOver,
    handleImageDragLeave,
    handleImageDrop,
    handleSave,
    handleDelete: handleDeleteRequest,
    handleTogglePublish,
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
