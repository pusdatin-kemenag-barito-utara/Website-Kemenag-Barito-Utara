"use client";

import React, { useState, useEffect, useMemo, useCallback } from "react";
import {
  FloatingFeedback,
  DeleteConfirmModal,
  ActionIconButton,
  StatusPill,
} from "../slides/SlidesUI";

// Helper to extract 11-char YouTube ID from any format (watch, youtu.be, shorts, embed, live)
function extractYoutubeId(raw = "") {
  const str = String(raw || "").trim();
  if (!str) return "";
  const regExp = /(?:youtube\.com\/(?:watch\?v=|embed\/|shorts\/|live\/)|youtu\.be\/)([A-Za-z0-9_-]{6,15})/;
  const match = str.match(regExp);
  if (match && match[1]) return match[1];
  if (str.length <= 15 && !str.includes("/") && !str.includes(".")) return str;
  return "";
}

// 16:9 Thumbnail Component with hover play overlay
function YoutubeThumb({ youtubeId, title, isFeatured, onPlay }) {
  const [thumbSrc, setThumbSrc] = useState(
    `https://img.youtube.com/vi/${youtubeId}/hqdefault.jpg`
  );

  return (
    <div
      onClick={onPlay}
      className="group/thumb relative aspect-video w-32 sm:w-40 shrink-0 cursor-pointer overflow-hidden rounded-xl border border-slate-200/80 bg-slate-900 shadow-sm transition-all duration-300 hover:shadow-md hover:border-emerald-500/50 dark:border-slate-800"
    >
      <img
        src={thumbSrc}
        alt={title || "Thumbnail"}
        loading="lazy"
        decoding="async"
        onError={() => {
          setThumbSrc(`https://i.ytimg.com/vi/${youtubeId}/default.jpg`);
        }}
        className="h-full w-full object-cover transition-transform duration-500 group-hover/thumb:scale-105"
      />

      {/* Dark overlay with Play icon on hover */}
      <div className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 backdrop-blur-[1px] transition-opacity duration-200 group-hover/thumb:opacity-100">
        <div className="flex h-9 w-9 items-center justify-center rounded-full bg-emerald-600/90 text-white shadow-lg transition-transform duration-200 group-hover/thumb:scale-110">
          <svg className="h-4 w-4 fill-current translate-x-0.5" viewBox="0 0 24 24">
            <path d="M8 5v14l11-7z" />
          </svg>
        </div>
      </div>

      {/* Featured Badge for #1 Utama */}
      {isFeatured && (
        <div className="absolute top-1.5 left-1.5 z-10 flex items-center gap-1 rounded-md bg-emerald-600/95 backdrop-blur-md px-2 py-0.5 text-[9px] font-black uppercase tracking-wider text-white shadow-md">
          <span className="h-1.5 w-1.5 rounded-full bg-white animate-pulse" />
          Utama
        </div>
      )}
    </div>
  );
}

// Lightbox Video Player Modal
function YoutubePlayerModal({ video, onClose }) {
  useEffect(() => {
    function handleKeyDown(e) {
      if (e.key === "Escape") onClose();
    }
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);

  if (!video) return null;

  return (
    <div className="fixed inset-0 z-[150] flex items-center justify-center p-4 sm:p-6 animate-in fade-in duration-200">
      <div
        className="absolute inset-0 bg-slate-950/80 backdrop-blur-md transition-opacity"
        onClick={onClose}
      />
      <div className="relative w-full max-w-4xl overflow-hidden rounded-3xl border border-slate-700 bg-slate-900 shadow-2xl">
        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-slate-800 px-6 py-4">
          <div className="min-w-0 flex-1 pr-4">
            <p className="text-sm font-bold text-white line-clamp-1">
              {video.title || "Video YouTube"}
            </p>
            <p className="text-[11px] text-slate-400 font-mono">
              youtu.be/{video.youtube_id}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-xl bg-slate-800 text-slate-400 hover:bg-slate-700 hover:text-white transition-colors"
          >
            <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path d="M18 6L6 18M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Embedded Player */}
        <div className="relative aspect-video w-full bg-black">
          <iframe
            src={`https://www.youtube-nocookie.com/embed/${video.youtube_id}?autoplay=1&rel=0`}
            title={video.title}
            className="h-full w-full"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            allowFullScreen
          />
        </div>
      </div>
    </div>
  );
}

// Add/Edit Video Form Modal with Live Preview
function YoutubeFormModal({
  open,
  editingId,
  form,
  setForm,
  saving,
  fetchingTitle,
  urlError,
  onUrlChange,
  onSubmit,
  onClose,
}) {
  const extractedId = useMemo(() => extractYoutubeId(form.youtube_id), [form.youtube_id]);

  useEffect(() => {
    if (!open) return;
    function handleKeyDown(e) {
      if (e.key === "Escape") onClose();
    }
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 animate-in fade-in duration-200">
      <div
        className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />

      <div className="relative flex max-h-[92vh] w-full max-w-xl flex-col rounded-3xl border border-slate-200 bg-white shadow-2xl dark:border-slate-800 dark:bg-slate-900 dark:shadow-slate-950/60">
        {/* Sticky Header */}
        <div className="flex items-center justify-between border-b border-slate-100 px-6 py-5 dark:border-slate-800">
          <div>
            <h2 className="text-lg sm:text-xl font-black tracking-tight text-slate-900 dark:text-white uppercase">
              {editingId ? "Edit Video YouTube" : "Tambah Video YouTube Baru"}
            </h2>
            <p className="mt-0.5 text-xs text-slate-400">
              Video akan tampil di galeri video dan beranda portal resmi.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-xl bg-slate-100 text-slate-400 hover:bg-slate-200 hover:text-slate-700 transition-colors dark:bg-slate-800 dark:hover:bg-slate-700 dark:hover:text-white"
          >
            <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path d="M18 6L6 18M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={onSubmit} className="flex-1 overflow-y-auto px-6 py-5 space-y-5">
          {/* YouTube URL input */}
          <div>
            <label className="block text-xs font-black uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-2">
              URL Video YouTube <span className="text-rose-500">*</span>
            </label>
            <div className="relative">
              <input
                type="text"
                required
                value={form.youtube_id}
                onChange={onUrlChange}
                placeholder="Contoh: https://www.youtube.com/watch?v=... atau youtu.be/..."
                className="w-full rounded-2xl border border-slate-200 bg-slate-50/50 px-4 py-3 text-xs sm:text-sm text-slate-900 outline-none transition-all focus:border-emerald-500 focus:bg-white focus:ring-4 focus:ring-emerald-500/10 dark:border-slate-700 dark:bg-slate-800/50 dark:text-white dark:focus:border-emerald-400"
              />
              {fetchingTitle && (
                <div className="absolute right-3.5 top-3.5 flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400">
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-emerald-500 border-t-transparent" />
                  <span className="text-[10px] font-bold">Mengambil Judul...</span>
                </div>
              )}
            </div>
            {urlError ? (
              <p className="mt-1.5 text-xs font-semibold text-rose-500">{urlError}</p>
            ) : (
              <p className="mt-1.5 text-[11px] text-slate-400">
                Tempel tautan video YouTube standar, shorts, ataupun tautan pendek (youtu.be).
              </p>
            )}
          </div>

          {/* Live Thumbnail Preview if valid ID extracted */}
          {extractedId && (
            <div className="overflow-hidden rounded-2xl border border-slate-200 bg-slate-50 p-3.5 dark:border-slate-800 dark:bg-slate-800/40">
              <p className="text-[10px] font-black uppercase tracking-wider text-slate-400 mb-2">
                Pratinjau Thumbnail Terdeteksi (ID: <span className="font-mono text-emerald-600 dark:text-emerald-400">{extractedId}</span>)
              </p>
              <div className="relative aspect-video w-full overflow-hidden rounded-xl bg-slate-900">
                <img
                  src={`https://img.youtube.com/vi/${extractedId}/hqdefault.jpg`}
                  alt="Preview"
                  className="h-full w-full object-cover"
                  onError={(e) => {
                    e.currentTarget.src = `https://i.ytimg.com/vi/${extractedId}/default.jpg`;
                  }}
                />
              </div>
            </div>
          )}

          {/* Video Title Input */}
          <div>
            <label className="block text-xs font-black uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-2">
              Judul Video <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              required
              value={form.title}
              onChange={(e) => setForm((prev) => ({ ...prev, title: e.target.value }))}
              placeholder="Masukkan judul video yang deskriptif..."
              className="w-full rounded-2xl border border-slate-200 bg-slate-50/50 px-4 py-3 text-xs sm:text-sm text-slate-900 outline-none transition-all focus:border-emerald-500 focus:bg-white focus:ring-4 focus:ring-emerald-500/10 dark:border-slate-700 dark:bg-slate-800/50 dark:text-white dark:focus:border-emerald-400"
            />
          </div>

          {/* Publish Toggle */}
          <div
            onClick={() => setForm((prev) => ({ ...prev, is_published: !prev.is_published }))}
            className="flex cursor-pointer items-center justify-between gap-4 rounded-2xl border border-slate-200 bg-slate-50/50 p-4 transition-all hover:bg-slate-100 dark:border-slate-800 dark:bg-slate-800/40 dark:hover:bg-slate-800"
          >
            <div>
              <p className="text-xs font-black uppercase tracking-wider text-slate-900 dark:text-white">
                Status Publikasi
              </p>
              <p className="mt-0.5 text-[11px] text-slate-400">
                {form.is_published
                  ? "🟢 Video ini aktif dan dapat ditonton di halaman beranda"
                  : "⚪ Disimpan sebagai draf (tidak tampil di publik)"}
              </p>
            </div>
            <div
              className={`relative inline-flex h-7 w-12 shrink-0 items-center rounded-full transition-colors ${
                form.is_published ? "bg-emerald-600" : "bg-slate-300 dark:bg-slate-700"
              }`}
            >
              <span
                className={`inline-block h-5 w-5 rounded-full bg-white shadow-md transition-transform ${
                  form.is_published ? "translate-x-6" : "translate-x-1"
                }`}
              />
            </div>
          </div>

          {/* Sticky Modal Footer */}
          <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="rounded-xl bg-rose-600 px-5 py-2.5 text-xs font-black uppercase tracking-wider text-white shadow-md shadow-rose-600/20 hover:bg-rose-700 active:scale-95 transition-all"
            >
              Batalkan
            </button>
            <button
              type="submit"
              disabled={saving}
              className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-6 py-2.5 text-xs font-black uppercase tracking-wider text-white shadow-lg shadow-emerald-600/20 hover:bg-emerald-700 disabled:opacity-50 active:scale-95 transition-all dark:bg-emerald-500 dark:hover:bg-emerald-600"
            >
              {saving ? (
                <>
                  <div className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-white border-t-transparent" />
                  <span>Menyimpan...</span>
                </>
              ) : (
                <span>{editingId ? "Simpan Perubahan" : "Simpan Video"}</span>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function YoutubeManager() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  // Filters & Pagination
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  // Form & Modals
  const [openForm, setOpenForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [deletingId, setDeletingId] = useState(null);
  const [saving, setSaving] = useState(false);
  const [fetchingTitle, setFetchingTitle] = useState(false);
  const [urlError, setUrlError] = useState("");
  const [activePlayVideo, setActivePlayVideo] = useState(null);
  const [togglingId, setTogglingId] = useState(null);

  const [form, setForm] = useState({
    title: "",
    youtube_id: "",
    is_published: true,
  });

  const fetchItems = useCallback(async () => {
    try {
      setLoading(true);
      setError("");
      const res = await fetch("/api/admin/youtube", { cache: "no-store" });
      if (!res.ok) throw new Error("Gagal memuat daftar video YouTube.");
      const data = await res.json();
      setItems(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(err.message || "Terjadi kesalahan saat memuat data.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchItems();
  }, [fetchItems]);

  // Real-time Filtering
  const filteredItems = useMemo(() => {
    return items.filter((item) => {
      const matchSearch =
        !searchQuery.trim() ||
        (item.title && item.title.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (item.youtube_id && item.youtube_id.toLowerCase().includes(searchQuery.toLowerCase()));

      const matchStatus =
        statusFilter === "all"
          ? true
          : statusFilter === "published"
          ? Boolean(item.is_published)
          : !item.is_published;

      return matchSearch && matchStatus;
    });
  }, [items, searchQuery, statusFilter]);

  const totalPages = Math.ceil(filteredItems.length / itemsPerPage) || 1;
  const currentItems = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredItems.slice(start, start + itemsPerPage);
  }, [filteredItems, currentPage, itemsPerPage]);

  // Quick stats
  const totalCount = items.length;
  const publishedCount = items.filter((i) => i.is_published).length;
  const headlineVideo = items.find((i) => i.is_published) || items[0] || null;

  const handleYoutubeUrlChange = async (e) => {
    const rawVal = e.target.value;
    setForm((prev) => ({ ...prev, youtube_id: rawVal }));

    if (!rawVal.trim()) {
      setUrlError("");
      return;
    }

    const id = extractYoutubeId(rawVal);
    if (id) {
      setUrlError("");
      try {
        setFetchingTitle(true);
        const res = await fetch(`/api/admin/youtube/info?url=${encodeURIComponent(rawVal)}`);
        if (res.ok) {
          const data = await res.json();
          if (data && data.title && !form.title) {
            setForm((prev) => ({ ...prev, title: data.title }));
          }
        }
      } catch (err) {
        // silent fallback for manual title
      } finally {
        setFetchingTitle(false);
      }
    } else {
      setUrlError("Format tautan URL YouTube tidak dikenali.");
    }
  };

  const handleOpenCreate = () => {
    setForm({ title: "", youtube_id: "", is_published: true });
    setEditingId(null);
    setUrlError("");
    setOpenForm(true);
  };

  const handleOpenEdit = (item) => {
    setForm({
      title: item.title,
      youtube_id: `https://www.youtube.com/watch?v=${item.youtube_id}`,
      is_published: Boolean(item.is_published),
    });
    setEditingId(item.id);
    setUrlError("");
    setOpenForm(true);
  };

  const handleCloseForm = () => {
    setOpenForm(false);
    setUrlError("");
  };

  const handleSave = async (e) => {
    e.preventDefault();
    const finalId = extractYoutubeId(form.youtube_id);
    if (!finalId) {
      setUrlError("Masukkan URL YouTube yang valid sebelum menyimpan.");
      return;
    }

    setSaving(true);
    setError("");
    setMessage("");

    try {
      const payload = {
        title: form.title.trim(),
        youtube_id: finalId,
        is_published: form.is_published,
      };

      const url = editingId ? `/api/admin/youtube/${editingId}` : "/api/admin/youtube";
      const method = editingId ? "PATCH" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || data.error || "Gagal menyimpan video.");

      setMessage(editingId ? "Video YouTube berhasil diperbarui." : "Video YouTube baru berhasil ditambahkan.");
      setOpenForm(false);
      fetchItems();
    } catch (err) {
      setError(err.message || "Gagal memproses video.");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!deletingId) return;
    try {
      const res = await fetch(`/api/admin/youtube/${deletingId}`, { method: "DELETE" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || data.error || "Gagal menghapus video.");

      setMessage("Video YouTube berhasil dihapus.");
      fetchItems();
    } catch (err) {
      setError(err.message || "Gagal menghapus video.");
    } finally {
      setDeletingId(null);
    }
  };

  const handleTogglePublish = async (item) => {
    const nextState = !item.is_published;
    setTogglingId(item.id);

    // Optimistic UI update
    setItems((prev) =>
      prev.map((it) => (it.id === item.id ? { ...it, is_published: nextState } : it))
    );

    try {
      const res = await fetch(`/api/admin/youtube/${item.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ is_published: nextState }),
      });
      if (!res.ok) throw new Error("Gagal mengubah status publikasi.");
      setMessage(nextState ? "Video sekarang tayang di beranda." : "Video dialihkan ke draf.");
    } catch (err) {
      setError(err.message || "Gagal mengubah status.");
      fetchItems(); // revert on fail
    } finally {
      setTogglingId(null);
    }
  };

  const handleMove = async (localIndex, direction) => {
    const globalIndex = (currentPage - 1) * itemsPerPage + localIndex;
    if (direction === "up" && globalIndex === 0) return;
    if (direction === "down" && globalIndex === items.length - 1) return;

    const targetGlobalIndex = direction === "up" ? globalIndex - 1 : globalIndex + 1;
    const newItems = [...items];

    const itemA = { ...newItems[globalIndex] };
    const itemB = { ...newItems[targetGlobalIndex] };

    const tempSort = itemA.sort_order;
    itemA.sort_order = itemB.sort_order;
    itemB.sort_order = tempSort;

    newItems[globalIndex] = itemB;
    newItems[targetGlobalIndex] = itemA;

    setItems(newItems);

    try {
      await Promise.all([
        fetch(`/api/admin/youtube/${itemA.id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ sort_order: itemA.sort_order }),
        }),
        fetch(`/api/admin/youtube/${itemB.id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ sort_order: itemB.sort_order }),
        }),
      ]);
    } catch (err) {
      fetchItems();
    }
  };

  return (
    <section className="space-y-6 sm:space-y-8">
      <FloatingFeedback
        message={message}
        error={error}
        onClose={() => {
          setMessage("");
          setError("");
        }}
      />

      {/* Header Section */}
      <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-slate-900 dark:text-white uppercase">
            Dokumentasi YouTube
          </h1>
          <p className="mt-1 text-xs font-medium text-slate-500 dark:text-slate-400">
            Kelola dokumentasi video kegiatan instansi. Video teratas yang berstatus tayang akan otomatis menjadi headline utama di beranda.
          </p>
        </div>

        <button
          type="button"
          onClick={handleOpenCreate}
          className="inline-flex items-center justify-center gap-2 rounded-2xl bg-emerald-600 px-5 py-3 text-xs font-black uppercase tracking-wider text-white shadow-lg shadow-emerald-600/25 transition-all hover:bg-emerald-500 hover:shadow-xl hover:shadow-emerald-500/30 active:scale-95 dark:bg-emerald-600 dark:hover:bg-emerald-500"
        >
          <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="3">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
          </svg>
          <span>Tambah Video</span>
        </button>
      </div>

      {/* Modern Stat Cards Grid */}
      <div className="grid grid-cols-1 gap-3 sm:gap-4 sm:grid-cols-3">
        {/* Card 1: Total Video */}
        <div className="group relative overflow-hidden rounded-2xl border border-slate-200/80 bg-white p-4 sm:p-5 shadow-sm transition-all hover:shadow-md dark:border-slate-800 dark:bg-slate-900/80">
          <div className="relative z-10 flex items-start justify-between gap-3">
            <div>
              <p className="text-[10px] font-black uppercase tracking-wider text-slate-400 group-hover:text-slate-600 dark:group-hover:text-slate-300">
                Total Video Terdaftar
              </p>
              <p className="mt-1 text-2xl sm:text-3xl font-black tracking-tight text-slate-900 dark:text-white">
                {totalCount}
              </p>
            </div>
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-slate-900 text-white shadow-md shadow-slate-900/10 dark:bg-white dark:text-slate-900">
              <svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor">
                <path d="M19.615 3.184c-3.604-.246-11.631-.245-15.23 0-3.897.266-4.356 2.62-4.385 8.816.029 6.185.484 8.549 4.385 8.816 3.6.245 11.626.246 15.23 0 3.897-.266 4.356-2.62 4.385-8.816-.029-6.185-.484-8.549-4.385-8.816zm-10.615 12.816v-8l8 3.993-8 4.007z" />
              </svg>
            </div>
          </div>
          <div className="mt-3 flex items-center gap-1.5 border-t border-slate-100 pt-2.5 dark:border-slate-800/50">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
            <p className="text-[9px] font-bold uppercase tracking-wider text-slate-400">
              Tersinkronisasi Database
            </p>
          </div>
        </div>

        {/* Card 2: Tayang di Beranda */}
        <div className="group relative overflow-hidden rounded-2xl border border-slate-200/80 bg-white p-4 sm:p-5 shadow-sm transition-all hover:shadow-md dark:border-slate-800 dark:bg-slate-900/80">
          <div className="relative z-10 flex items-start justify-between gap-3">
            <div>
              <p className="text-[10px] font-black uppercase tracking-wider text-slate-400 group-hover:text-slate-600 dark:group-hover:text-slate-300">
                Tayang di Beranda
              </p>
              <p className="mt-1 text-2xl sm:text-3xl font-black tracking-tight text-emerald-600 dark:text-emerald-400">
                {publishedCount}
              </p>
            </div>
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600 dark:bg-emerald-950/40 dark:text-emerald-400">
              <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
              </svg>
            </div>
          </div>
          <div className="mt-3 flex items-center gap-1.5 border-t border-slate-100 pt-2.5 dark:border-slate-800/50">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
            <p className="text-[9px] font-bold uppercase tracking-wider text-slate-400">
              Publikasi Langsung Aktif
            </p>
          </div>
        </div>

        {/* Card 3: Video Utama Saat Ini */}
        <div className="group relative overflow-hidden rounded-2xl border border-slate-200/80 bg-white p-4 sm:p-5 shadow-sm transition-all hover:shadow-md dark:border-slate-800 dark:bg-slate-900/80">
          <div className="relative z-10 flex items-start justify-between gap-3">
            <div className="min-w-0 flex-1">
              <p className="text-[10px] font-black uppercase tracking-wider text-slate-400 group-hover:text-slate-600 dark:group-hover:text-slate-300">
                Headline Utama Saat Ini
              </p>
              <p className="mt-1 text-xs sm:text-sm font-bold text-slate-900 dark:text-white line-clamp-1">
                {headlineVideo?.title || "Belum ada video aktif"}
              </p>
            </div>
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-amber-50 text-amber-600 dark:bg-amber-950/40 dark:text-amber-400">
              <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M11.48 3.499a.562.562 0 011.04 0l2.125 5.111a.563.563 0 00.475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 00-.182.557l1.285 5.385a.562.562 0 01-.84.61l-4.725-2.885a.563.563 0 00-.586 0L6.982 20.54a.562.562 0 01-.84-.61l1.285-5.386a.562.562 0 00-.182-.557l-4.204-3.602a.563.563 0 01.321-.988l5.518-.442a.563.563 0 00.475-.345L11.48 3.5z" />
              </svg>
            </div>
          </div>
          <div className="mt-3 flex items-center gap-1.5 border-t border-slate-100 pt-2.5 dark:border-slate-800/50">
            <span className="h-1.5 w-1.5 rounded-full bg-amber-500 animate-pulse" />
            <p className="text-[9px] font-bold uppercase tracking-wider text-slate-400">
              Urutan #1 di Portal
            </p>
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        {/* Search Box */}
        <div className="relative flex-1 max-w-md">
          <svg className="absolute left-3.5 top-3.5 h-4 w-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setCurrentPage(1);
            }}
            placeholder="Cari judul video atau ID YouTube..."
            className="w-full rounded-xl border border-slate-200/80 bg-white pl-10 pr-10 py-2.5 text-xs font-semibold text-slate-900 placeholder:text-slate-400 outline-none transition-all focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 dark:border-slate-800 dark:bg-slate-900/80 dark:text-white"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => setSearchQuery("")}
              className="absolute right-3 top-2.5 flex h-5 w-5 items-center justify-center rounded-full bg-slate-200 text-slate-500 hover:bg-slate-300 dark:bg-slate-700 dark:text-slate-300"
            >
              <svg className="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="3">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          )}
        </div>

        {/* Status Filter Tabs */}
        <div className="flex items-center gap-1 rounded-xl border border-slate-200/80 bg-white p-1 dark:border-slate-800 dark:bg-slate-900/80">
          {[
            { id: "all", label: "Semua" },
            { id: "published", label: "Tayang" },
            { id: "draft", label: "Draft" },
          ].map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => {
                setStatusFilter(tab.id);
                setCurrentPage(1);
              }}
              className={`rounded-lg px-3 py-1.5 text-[10px] font-black uppercase tracking-wider transition-all ${
                statusFilter === tab.id
                  ? "bg-slate-900 text-white shadow-sm dark:bg-white dark:text-slate-900"
                  : "text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Main Table Card */}
      <div className="overflow-hidden rounded-2xl sm:rounded-3xl border border-slate-200/80 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900/80">
        {loading ? (
          <div className="flex min-h-[300px] flex-col items-center justify-center gap-3 py-12">
            <div className="h-8 w-8 animate-spin rounded-full border-3 border-emerald-600 border-t-transparent" />
            <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">
              Memuat Dokumentasi Video...
            </p>
          </div>
        ) : filteredItems.length === 0 ? (
          <div className="flex min-h-[280px] flex-col items-center justify-center p-8 text-center">
            <div className="mb-3 flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100 text-slate-400 dark:bg-slate-800">
              <svg className="h-7 w-7" viewBox="0 0 24 24" fill="currentColor">
                <path d="M19.615 3.184c-3.604-.246-11.631-.245-15.23 0-3.897.266-4.356 2.62-4.385 8.816.029 6.185.484 8.549 4.385 8.816 3.6.245 11.626.246 15.23 0 3.897-.266 4.356-2.62 4.385-8.816-.029-6.185-.484-8.549-4.385-8.816zm-10.615 12.816v-8l8 3.993-8 4.007z" />
              </svg>
            </div>
            <h3 className="text-xs font-black uppercase tracking-wider text-slate-900 dark:text-white">
              Tidak Ada Video Ditemukan
            </h3>
            <p className="mt-1 text-[11px] text-slate-400 max-w-sm">
              Tidak ditemukan data video yang sesuai dengan pencarian atau filter yang aktif.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50/75 text-[10px] font-black uppercase tracking-widest text-slate-400 dark:border-slate-800 dark:bg-slate-800/40">
                  <th className="py-3.5 px-4 text-center w-16">Urutan</th>
                  <th className="py-3.5 px-4 w-44">Thumbnail</th>
                  <th className="py-3.5 px-4">Informasi Video</th>
                  <th className="py-3.5 px-4 text-center w-32">Status</th>
                  <th className="py-3.5 px-4 text-right w-28">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
                {currentItems.map((item, index) => {
                  const globalIndex = (currentPage - 1) * itemsPerPage + index;
                  const isFirstActive = globalIndex === 0 && Boolean(item.is_published);

                  return (
                    <tr
                      key={item.id}
                      className="group bg-white hover:bg-slate-50/80 transition-colors align-middle dark:bg-transparent dark:hover:bg-slate-800/40"
                    >
                      {/* Urutan reorder */}
                      <td className="px-4 py-3.5 text-center">
                        <div className="inline-flex flex-col items-center gap-1 rounded-xl bg-slate-100/60 p-1 dark:bg-slate-800/60">
                          <button
                            type="button"
                            onClick={() => handleMove(index, "up")}
                            disabled={globalIndex === 0}
                            title="Pindah ke Atas"
                            className="flex h-5 w-5 items-center justify-center rounded-md text-slate-400 hover:bg-white hover:text-emerald-600 hover:shadow-xs disabled:opacity-20 transition-all dark:hover:bg-slate-700"
                          >
                            <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="3">
                              <path strokeLinecap="round" strokeLinejoin="round" d="M5 15l7-7 7 7" />
                            </svg>
                          </button>
                          <span className="text-[11px] font-black text-slate-700 dark:text-slate-200">
                            {globalIndex + 1}
                          </span>
                          <button
                            type="button"
                            onClick={() => handleMove(index, "down")}
                            disabled={globalIndex === items.length - 1}
                            title="Pindah ke Bawah"
                            className="flex h-5 w-5 items-center justify-center rounded-md text-slate-400 hover:bg-white hover:text-emerald-600 hover:shadow-xs disabled:opacity-20 transition-all dark:hover:bg-slate-700"
                          >
                            <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="3">
                              <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                            </svg>
                          </button>
                        </div>
                      </td>

                      {/* Thumbnail Preview with Play Click */}
                      <td className="px-4 py-3.5">
                        <YoutubeThumb
                          youtubeId={item.youtube_id}
                          title={item.title}
                          isFeatured={isFirstActive}
                          onPlay={() => setActivePlayVideo(item)}
                        />
                      </td>

                      {/* Title & Video info */}
                      <td className="px-4 py-3.5">
                        <div className="min-w-0 max-w-lg">
                          <p
                            onClick={() => setActivePlayVideo(item)}
                            className="cursor-pointer text-xs sm:text-sm font-bold tracking-tight text-slate-900 hover:text-emerald-600 dark:text-slate-100 dark:hover:text-emerald-400 transition-colors line-clamp-2"
                          >
                            {item.title}
                          </p>

                          <div className="mt-1.5 flex flex-wrap items-center gap-2">
                            <a
                              href={`https://youtube.com/watch?v=${item.youtube_id}`}
                              target="_blank"
                              rel="noreferrer"
                              className="inline-flex items-center gap-1 rounded-md bg-slate-100 px-2 py-0.5 text-[10px] font-semibold text-blue-600 hover:bg-blue-50 hover:underline dark:bg-slate-800 dark:text-blue-400"
                            >
                              <svg className="h-3 w-3 text-red-600" viewBox="0 0 24 24" fill="currentColor">
                                <path d="M19.615 3.184c-3.604-.246-11.631-.245-15.23 0-3.897.266-4.356 2.62-4.385 8.816.029 6.185.484 8.549 4.385 8.816 3.6.245 11.626.246 15.23 0 3.897-.266 4.356-2.62 4.385-8.816-.029-6.185-.484-8.549-4.385-8.816zm-10.615 12.816v-8l8 3.993-8 4.007z" />
                              </svg>
                              youtu.be/{item.youtube_id}
                            </a>

                            <button
                              type="button"
                              onClick={() => {
                                navigator.clipboard.writeText(`https://youtube.com/watch?v=${item.youtube_id}`);
                                setMessage("Tautan video disalin ke clipboard.");
                              }}
                              title="Salin Tautan"
                              className="text-[10px] text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
                            >
                              📋 Salin
                            </button>
                          </div>
                        </div>
                      </td>

                      {/* Interactive Status Toggle */}
                      <td className="px-4 py-3.5 text-center">
                        <button
                          type="button"
                          onClick={() => handleTogglePublish(item)}
                          disabled={togglingId === item.id}
                          title="Klik untuk ubah status tayang"
                          className="group/pill inline-flex items-center gap-1.5 transition-transform hover:scale-105 active:scale-95 disabled:opacity-50"
                        >
                          <StatusPill published={item.is_published} />
                        </button>
                      </td>

                      {/* Action buttons */}
                      <td className="px-4 py-3.5 text-right">
                        <div className="inline-flex items-center gap-1.5">
                          <ActionIconButton
                            title="Edit Video"
                            variant="sky"
                            onClick={() => handleOpenEdit(item)}
                          >
                            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.5">
                              <path strokeLinecap="round" strokeLinejoin="round" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                            </svg>
                          </ActionIconButton>

                          <ActionIconButton
                            title="Hapus Video"
                            variant="danger"
                            onClick={() => setDeletingId(item.id)}
                          >
                            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.5">
                              <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                          </ActionIconButton>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination Bar */}
        {!loading && totalPages > 1 && (
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 border-t border-slate-100 px-6 py-4 dark:border-slate-800">
            <span className="text-[11px] font-bold text-slate-400">
              Menampilkan {(currentPage - 1) * itemsPerPage + 1} -{" "}
              {Math.min(currentPage * itemsPerPage, filteredItems.length)} dari {filteredItems.length} video
            </span>

            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="flex h-8 items-center justify-center rounded-xl border border-slate-200 bg-white px-3 text-xs font-bold text-slate-600 transition-colors hover:bg-slate-50 disabled:opacity-40 dark:border-slate-800 dark:bg-slate-800 dark:text-slate-300"
              >
                Prev
              </button>

              {Array.from({ length: totalPages }).map((_, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => setCurrentPage(i + 1)}
                  className={`flex h-8 w-8 items-center justify-center rounded-xl text-xs font-black transition-all ${
                    currentPage === i + 1
                      ? "bg-slate-900 text-white shadow-sm dark:bg-white dark:text-slate-900"
                      : "text-slate-500 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800"
                  }`}
                >
                  {i + 1}
                </button>
              ))}

              <button
                type="button"
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                className="flex h-8 items-center justify-center rounded-xl border border-slate-200 bg-white px-3 text-xs font-bold text-slate-600 transition-colors hover:bg-slate-50 disabled:opacity-40 dark:border-slate-800 dark:bg-slate-800 dark:text-slate-300"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Add / Edit Video Modal */}
      <YoutubeFormModal
        open={openForm}
        editingId={editingId}
        form={form}
        setForm={setForm}
        saving={saving}
        fetchingTitle={fetchingTitle}
        urlError={urlError}
        onUrlChange={handleYoutubeUrlChange}
        onSubmit={handleSave}
        onClose={handleCloseForm}
      />

      {/* Lightbox Video Player Modal */}
      <YoutubePlayerModal
        video={activePlayVideo}
        onClose={() => setActivePlayVideo(null)}
      />

      {/* Delete Confirmation Modal */}
      <DeleteConfirmModal
        open={Boolean(deletingId)}
        onConfirm={handleDelete}
        onCancel={() => setDeletingId(null)}
        loading={false}
        title="Hapus Video Dokumentasi?"
        description="Video ini akan dihapus dari daftar dan tidak akan tampil lagi di beranda portal."
      />
    </section>
  );
}
