"use client";

import React, { useEffect, useState, useRef } from "react";
import Image from "@/components/common/NextImage";
import Link from "@/components/common/NextLink";
import {
  Briefcase,
  User,
  Users,
  ChevronRight,
  Loader2,
  Trash2,
  Plus,
  Pencil,
  X,
  Upload,
  Save,
} from "lucide-react";
import { FloatingFeedback, DeleteConfirmModal } from "./slides/SlidesUI";
import { logWarn, logError } from "@/lib/logger";
import { normalizeCoverImageUrl, isImageCached, markImageCached, preloadImages, getAlternativeStorageUrl } from "@/lib/cover-image";
import { compressImageToBase64 } from "@/lib/image-compress";
import { getPocketBase } from "@/lib/pocketbase/client";

function SeksiAvatarThumb({ src, alt, objectPositionY = 50 }) {
  const normalized = normalizeCoverImageUrl(src);
  const [currentSrc, setCurrentSrc] = useState(normalized);
  const [loaded, setLoaded] = useState(() => isImageCached(normalized));
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    setCurrentSrc(normalized);
    setHasError(false);
  }, [normalized]);

  useEffect(() => {
    if (!currentSrc) return;
    if (isImageCached(currentSrc)) {
      setLoaded(true);
      return;
    }
    const img = new window.Image();
    img.src = currentSrc;
    img.onload = () => {
      markImageCached(currentSrc);
      setLoaded(true);
    };
    img.onerror = () => {
      const altSrc = getAlternativeStorageUrl(currentSrc);
      if (altSrc && altSrc !== currentSrc) {
        setCurrentSrc(altSrc);
      } else {
        setHasError(true);
      }
    };
  }, [currentSrc]);

  if (!currentSrc || hasError) {
    return (
      <div className="flex h-8 w-8 items-center justify-center bg-slate-100 dark:bg-slate-800 text-slate-400">
        <User className="h-4 w-4" />
      </div>
    );
  }

  return (
    <img
      src={currentSrc}
      alt={alt || "Kepala Seksi"}
      loading="lazy"
      decoding="async"
      onLoad={() => {
        markImageCached(currentSrc);
        setLoaded(true);
      }}
      onError={() => {
        const altSrc = getAlternativeStorageUrl(currentSrc);
        if (altSrc && altSrc !== currentSrc) {
          setCurrentSrc(altSrc);
        } else {
          setHasError(true);
        }
      }}
      style={{
        objectPosition: `50% ${objectPositionY ?? 50}%`,
      }}
      className={`h-full w-full object-cover transition-opacity duration-200 ${
        loaded ? "opacity-100" : "opacity-0"
      }`}
    />
  );
}

export default function AdminSeksiListManager() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [isSuperAdmin, setIsSuperAdmin] = useState(false);
  const [deletingId, setDeletingId] = useState(null);
  const [confirmModal, setConfirmModal] = useState({
    open: false,
    id: null,
    judul: "",
  });

  // Modal Tambah / Edit Seksi
  const [openSeksiModal, setOpenSeksiModal] = useState(false);
  const [editingSeksi, setEditingSeksi] = useState(null);
  const [savingSeksi, setSavingSeksi] = useState(false);
  const [seksiForm, setSeksiForm] = useState({
    judul: "",
    slug: "",
    nama_kepala: "",
    nip_kepala: "",
    deskripsi: "",
    foto_kepala: "",
    foto_kepala_y: 50,
  });
  const [fotoKepalaBase64, setFotoKepalaBase64] = useState("");
  const [fotoKepalaPreview, setFotoKepalaPreview] = useState("");
  const [isDraggingKasi, setIsDraggingKasi] = useState(false);
  const fileInputKasiRef = useRef(null);

  const slugify = (text) => {
    return (text || "")
      .toString()
      .toLowerCase()
      .trim()
      .replace(/\s+/g, "-")
      .replace(/[^\w\-]+/g, "")
      .replace(/\-\-+/g, "-");
  };

  useEffect(() => {
    try {
      const pb = getPocketBase();
      setIsSuperAdmin(pb?.authStore?.record?.role === "super_admin");
    } catch {}
    fetchSeksi();
  }, []);

  const fetchSeksi = async () => {
    setLoading(true);
    setError("");
    try {
      const pb = getPocketBase();
      const [records, pegawais] = await Promise.all([
        pb.collection("seksi").getFullList({ requestKey: null }),
        pb.collection("pegawai_seksi").getFullList({ fields: "id,seksi_id", requestKey: null }).catch(() => []),
      ]);

      // Petakan jumlah pegawai riil berdasarkan seksi_id / original_id
      const countMap = {};
      for (const p of (pegawais || [])) {
        if (p.seksi_id) {
          countMap[p.seksi_id] = (countMap[p.seksi_id] || 0) + 1;
        }
      }

      // Urutan hierarki utama untuk bidang bawaan (seksi baru tetap dinamis muncul berikutnya)
      const defaultOrder = {
        "kepala-kantor": 1,
        "sekjen": 2,
        "subbag-tu": 2,
        "seksi-bimas-islam": 3,
        "bimas-islam": 3,
        "seksi-pendidikan-madrasah": 4,
        "penmad": 4,
        "seksi-pendidikan-diniyah-dan-pondok-pesantren": 5,
        "pendis": 5,
        "seksi-pendidikan-agama-islam": 6,
        "papkis": 6,
        "penyelenggara-zakat-wakaf": 7,
        "zakat-wakaf": 7,
        "penyelenggara-hindu": 8,
        "phu": 9,
        "bimas-kristen": 10,
      };

      const enriched = (records || []).map((s) => {
        const count = (countMap[s.id] || 0) + (s.original_id ? (countMap[s.original_id] || 0) : 0);
        const fotoUrl = s.foto_kepala || (s.foto_kepala_file ? `https://dbb.kemenag-baritoutara.com/api/files/seksi/${s.id}/${s.foto_kepala_file}` : "");
        return {
          ...s,
          foto_kepala: fotoUrl,
          totalPegawai: count,
          _count: { pegawai_seksi: count },
        };
      });

      const sorted = enriched.sort((a, b) => {
        const orderA = defaultOrder[a.slug] ?? 99;
        const orderB = defaultOrder[b.slug] ?? 99;
        if (orderA !== orderB) return orderA - orderB;
        return (a.judul || "").localeCompare(b.judul || "");
      });

      setItems(sorted);
      preloadImages(sorted.map((it) => it.foto_kepala).filter(Boolean));
    } catch (err) {
      if (err?.name === "AbortError" || err?.isAbort) return;
      logError("seksi_list_fetch_error", { error: err?.message });
      setError(err?.message || "Terjadi kesalahan koneksi saat memuat data.");
    } finally {
      setLoading(false);
    }
  };

  const handleOpenAddSeksi = () => {
    setEditingSeksi(null);
    setSeksiForm({
      judul: "",
      slug: "",
      nama_kepala: "",
      nip_kepala: "",
      deskripsi: "",
      foto_kepala: "",
      foto_kepala_y: 50,
    });
    setFotoKepalaBase64("");
    setFotoKepalaPreview("");
    setOpenSeksiModal(true);
  };

  const handleOpenEditSeksi = (item) => {
    setEditingSeksi(item);
    setSeksiForm({
      judul: item.judul || "",
      slug: item.slug || "",
      nama_kepala: item.nama_kepala || "",
      nip_kepala: item.nip_kepala || "",
      deskripsi: item.deskripsi || "",
      foto_kepala: item.foto_kepala || "",
      foto_kepala_y: typeof item.foto_kepala_y === "number" ? item.foto_kepala_y : 50,
    });
    setFotoKepalaBase64("");
    setFotoKepalaPreview(item.foto_kepala || "");
    setOpenSeksiModal(true);
  };

  const handleKasiDragOver = (e) => {
    e.preventDefault();
    setIsDraggingKasi(true);
  };

  const handleKasiDragLeave = () => {
    setIsDraggingKasi(false);
  };

  const handleKasiDrop = (e) => {
    e.preventDefault();
    setIsDraggingKasi(false);
    const file = e.dataTransfer.files[0];
    if (file) processKasiFile(file);
  };

  const processKasiFile = async (file) => {
    if (!file.type.startsWith("image/")) {
      setError("File harus berupa gambar.");
      return;
    }
    if (file.size > 15 * 1024 * 1024) {
      setError("Ukuran foto maksimal 15MB sebelum kompresi.");
      return;
    }

    try {
      setError("");
      setMessage("");
      const compressed = await compressImageToBase64(file, {
        targetSizeKB: 400,
        hardMaxSizeKB: 500,
        throwIfOverHardLimit: false,
        maxWidth: 1280,
        maxHeight: 1280,
      });

      setFotoKepalaBase64(compressed.base64);
      setFotoKepalaPreview(compressed.base64);
    } catch (err) {
      logError("seksi_kasi_compress_error", { error: err?.message });
      setError(err?.message || "Gagal memproses dan mengompresi gambar.");
    }
  };

  const handleKasiPhotoChange = (e) => {
    const file = e.target.files[0];
    if (file) processKasiFile(file);
  };

  const handleSaveSeksi = async (e) => {
    e.preventDefault();
    if (!seksiForm.judul.trim()) {
      setError("Nama seksi / bidang wajib diisi.");
      return;
    }
    const slugToUse = seksiForm.slug.trim() || slugify(seksiForm.judul);
    if (!slugToUse) {
      setError("Slug seksi / bidang wajib diisi.");
      return;
    }

    setSavingSeksi(true);
    setError("");
    setMessage("");

    try {
      const pb = getPocketBase();
      const payload = {
        judul: seksiForm.judul.trim(),
        slug: slugToUse,
        nama_kepala: seksiForm.nama_kepala.trim(),
        nip_kepala: seksiForm.nip_kepala.trim(),
        deskripsi: seksiForm.deskripsi.trim(),
        foto_kepala: fotoKepalaBase64 || seksiForm.foto_kepala || "",
        foto_kepala_y: Number(seksiForm.foto_kepala_y ?? 50),
      };

      if (editingSeksi) {
        await pb.collection("seksi").update(editingSeksi.id, payload);
        setMessage(`Bidang "${payload.judul}" berhasil diperbarui.`);
      } else {
        await pb.collection("seksi").create(payload);
        setMessage(`Bidang baru "${payload.judul}" berhasil ditambahkan.`);
      }

      setOpenSeksiModal(false);
      await fetchSeksi();
    } catch (err) {
      logError("seksi_save_error", { error: err?.message });
      setError(err?.message || "Terjadi kesalahan saat menyimpan seksi.");
    } finally {
      setSavingSeksi(false);
    }
  };

  const handleDelete = (id, judul) => {
    if (!id) return;
    setConfirmModal({ open: true, id, judul: judul || "-" });
  };

  const handleConfirmDelete = async () => {
    const { id } = confirmModal;
    setConfirmModal({ open: false, id: null, judul: "" });

    setDeletingId(id);
    setError("");
    setMessage("");

    try {
      const pb = getPocketBase();
      await pb.collection("seksi").delete(id);

      setMessage("Seksi berhasil dihapus.");
      await fetchSeksi();
    } catch (err) {
      logError("seksi_list_delete_error", { error: err?.message });
      setError(err?.message || "Gagal menghapus seksi.");
    } finally {
      setDeletingId(null);
    }
  };

  const handleCancelDelete = () => {
    setConfirmModal({ open: false, id: null, judul: "" });
  };

  const totalPegawai = items.reduce(
    (acc, curr) => acc + (curr._count?.pegawai_seksi || 0),
    0,
  );

  return (
    <section className="space-y-4 sm:space-y-6">
      <FloatingFeedback
        message={message}
        error={error}
        onClose={() => {
          setMessage("");
          setError("");
        }}
      />

      <DeleteConfirmModal
        open={confirmModal.open}
        loading={deletingId === confirmModal.id}
        title="Hapus Seksi / Bidang?"
        description={`Anda akan menghapus seksi "${confirmModal.judul}" beserta seluruh data pegawai di dalamnya. Tindakan ini tidak dapat dibatalkan.`}
        onConfirm={handleConfirmDelete}
        onCancel={handleCancelDelete}
      />

      {/* Header Section */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-slate-900 dark:text-white uppercase">
            Manajemen Kepegawaian
          </h1>
          <p className="mt-1 text-xs font-medium text-slate-500 dark:text-slate-400">
            Kelola profil Kepala Seksi, deskripsi seksi, serta struktur pegawai
            bawahan di tiap bidang.
          </p>
        </div>
        <button
          type="button"
          onClick={handleOpenAddSeksi}
          className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 active:scale-95 px-4 py-2.5 text-xs font-black uppercase tracking-wider text-white shadow-md shadow-emerald-600/20 transition-all self-start sm:self-auto cursor-pointer"
        >
          <Plus className="h-4 w-4" />
          <span>Tambah Seksi / Bidang</span>
        </button>
      </div>

      {/* Stats Summary cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
        <div className="group relative overflow-hidden rounded-2xl border border-slate-200 bg-white p-4 sm:p-5 shadow-sm transition-all hover:shadow-md dark:border-slate-800 dark:bg-slate-900/80">
          <div className="relative z-10 flex items-start justify-between gap-3">
            <div className="min-w-0 flex-1">
              <p className="text-[10px] font-black uppercase tracking-wider text-slate-400 group-hover:text-slate-600 transition-colors dark:group-hover:text-slate-300 truncate">
                Total Seksi / Bidang
              </p>
              <p className="mt-1 text-3xl sm:text-4xl font-black tracking-tight text-slate-900 dark:text-white">
                {items.length}
              </p>
            </div>
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-slate-900 text-white shadow-md shadow-slate-900/20 dark:bg-white dark:text-black dark:shadow-none">
              <Briefcase className="w-5 h-5" />
            </div>
          </div>
          <div className="relative z-10 mt-3 flex items-center gap-2 border-t border-slate-100 pt-2.5 dark:border-slate-800/50">
            <div className="h-1.5 w-1.5 shrink-0 rounded-full bg-emerald-500 animate-pulse"></div>
            <p className="text-[9px] font-bold uppercase tracking-wider text-slate-400 truncate">
              Sinkron dengan Halaman Publik
            </p>
          </div>
        </div>

        <div className="group relative overflow-hidden rounded-2xl border border-slate-200 bg-white p-4 sm:p-5 shadow-sm transition-all hover:shadow-md dark:border-slate-800 dark:bg-slate-900/80">
          <div className="relative z-10 flex items-start justify-between gap-3">
            <div className="min-w-0 flex-1">
              <p className="text-[10px] font-black uppercase tracking-wider text-slate-400 group-hover:text-slate-600 transition-colors dark:group-hover:text-slate-300 truncate">
                Total Seluruh Pegawai
              </p>
              <p className="mt-1 text-3xl sm:text-4xl font-black tracking-tight text-slate-900 dark:text-white">
                {totalPegawai}
              </p>
            </div>
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-slate-900 text-white shadow-md shadow-slate-900/20 dark:bg-white dark:text-black dark:shadow-none">
              <Users className="w-5 h-5" />
            </div>
          </div>
          <div className="relative z-10 mt-3 flex items-center gap-2 border-t border-slate-100 pt-2.5 dark:border-slate-800/50">
            <div className="h-1.5 w-1.5 shrink-0 rounded-full bg-emerald-500 animate-pulse"></div>
            <p className="text-[9px] font-bold uppercase tracking-wider text-slate-400 truncate">
              Dapat diedit dinamis oleh admin
            </p>
          </div>
        </div>
      </div>

      {/* Content Card */}
      <div className="rounded-2xl border border-slate-200 bg-white p-4 sm:p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900/80">
        <div className="mb-4 flex items-center justify-between border-b border-slate-100 pb-3.5 dark:border-slate-800/50">
          <div className="flex items-center gap-2">
            <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse"></div>
            <p className="text-[10px] sm:text-xs font-black uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Daftar Struktur Organisasi per Bidang
            </p>
          </div>
          <span className="text-[10px] font-bold text-slate-400">
            {items.length} Bidang
          </span>
        </div>

        <div className="w-full overflow-x-auto">
          <table className="w-full border-collapse block md:table">
            <thead className="hidden md:table-header-group">
              <tr>
                <th className="px-4 py-3 text-left text-[10px] font-black uppercase tracking-wider text-slate-400 border-b border-slate-100 dark:border-slate-800">
                  Nama Bidang / Seksi
                </th>
                <th className="px-4 py-3 text-left text-[10px] font-black uppercase tracking-wider text-slate-400 border-b border-slate-100 dark:border-slate-800">
                  Kepala Seksi / Pejabat
                </th>
                <th className="px-4 py-3 text-left text-[10px] font-black uppercase tracking-wider text-slate-400 border-b border-slate-100 dark:border-slate-800">
                  Total Pegawai
                </th>
                <th className="px-4 py-3 text-right text-[10px] font-black uppercase tracking-wider text-slate-400 border-b border-slate-100 dark:border-slate-800">
                  Aksi
                </th>
              </tr>
            </thead>
            <tbody className="block md:table-row-group divide-y divide-slate-100 dark:divide-slate-800/60">
              {loading ? (
                <tr className="block md:table-row">
                  <td
                    colSpan={4}
                    className="block md:table-cell px-4 py-12 text-center text-slate-400"
                  >
                    <div className="flex flex-col items-center justify-center gap-2.5">
                      <Loader2 className="h-6 w-6 animate-spin text-emerald-500" />
                      <span className="text-[10px] font-black uppercase tracking-wider">
                        Memuat data seksi...
                      </span>
                    </div>
                  </td>
                </tr>
              ) : items.length === 0 ? (
                <tr className="block md:table-row">
                  <td
                    colSpan={4}
                    className="block md:table-cell px-4 py-12 text-center text-[10px] font-black uppercase tracking-wider text-slate-400"
                  >
                    Belum ada seksi yang ditambahkan atau dimigrasi ke database.
                  </td>
                </tr>
              ) : (
                items.map((item) => (
                  <tr
                    key={item.id}
                    className="group flex flex-col gap-2.5 md:gap-0 p-3.5 md:p-0 hover:bg-slate-50/70 transition-colors align-middle dark:hover:bg-slate-800/30 md:table-row"
                  >
                    <td className="block md:table-cell md:px-4 md:py-3.5">
                      <div className="flex items-center gap-3">
                        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300">
                          <Briefcase className="h-4 w-4" />
                        </div>
                        <div>
                          <p className="text-xs sm:text-sm font-black tracking-tight text-slate-900 dark:text-slate-100 uppercase">
                            {item.judul}
                          </p>
                          <p className="text-[10px] font-semibold text-slate-400 font-mono">
                            {item.slug}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="block md:table-cell md:px-4 md:py-3.5">
                      <div className="flex items-center gap-2.5">
                        <div className="relative flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-slate-100 dark:bg-slate-800 overflow-hidden ring-1 ring-slate-200 dark:ring-slate-700 shadow-sm">
                          <SeksiAvatarThumb
                            src={item.foto_kepala}
                            alt={item.nama_kepala}
                            objectPositionY={item.foto_kepala_y}
                          />
                        </div>
                        <div>
                          <p className="text-xs font-bold text-slate-900 dark:text-slate-100">
                            {item.nama_kepala || "-"}
                          </p>
                          <p className="text-[10px] font-medium text-slate-400 font-mono">
                            NIP. {item.nip_kepala || "-"}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="block md:table-cell md:px-4 md:py-3.5">
                      <span className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-100 dark:border-emerald-900/50 px-2.5 py-1 text-[10px] font-black uppercase tracking-wider text-emerald-700 dark:text-emerald-400">
                        <Users className="h-3 w-3" />
                        {item._count?.pegawai_seksi || 0} Pegawai
                      </span>
                    </td>
                    <td className="block md:table-cell mt-1 md:mt-0 pt-2.5 md:pt-0 border-t border-slate-100 dark:border-slate-800/50 md:border-none md:px-4 md:py-3.5 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Link
                          href={`/admin/seksi/${item.id}`}
                          className="inline-flex items-center gap-1.5 h-8 px-3.5 rounded-lg bg-slate-900 text-white hover:bg-emerald-600 dark:bg-white dark:text-slate-900 dark:hover:bg-emerald-500 dark:hover:text-white text-[10px] font-black uppercase tracking-wider shadow-sm transition-all active:scale-95"
                        >
                          <span>Kelola Seksi</span>
                          <ChevronRight className="h-3 w-3" />
                        </Link>

                        <button
                          type="button"
                          onClick={() => handleOpenEditSeksi(item)}
                          className="inline-flex items-center justify-center h-8 px-2.5 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-100 dark:border-slate-800 dark:text-slate-300 dark:hover:bg-slate-800 text-[10px] font-black uppercase tracking-wider transition-all active:scale-95 cursor-pointer"
                          title="Edit Profil Seksi"
                        >
                          <Pencil className="h-3.5 w-3.5" />
                        </button>

                        {isSuperAdmin && (
                          <button
                            type="button"
                            onClick={() => handleDelete(item.id, item.judul)}
                            disabled={deletingId === item.id}
                            className="inline-flex items-center justify-center h-8 px-2.5 rounded-lg border border-rose-200 text-rose-600 hover:bg-rose-50 dark:border-rose-900/50 dark:text-rose-400 dark:hover:bg-rose-950/40 text-[10px] font-black uppercase tracking-wider transition-all active:scale-95 disabled:opacity-60 cursor-pointer"
                            title="Hapus Seksi"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* MODAL TAMBAH / EDIT SEKSI (BIDANG) BARU */}
      {openSeksiModal && (
        <div className="fixed inset-0 z-[250] flex items-center justify-center p-3 sm:p-4">
          <div
            className="absolute inset-0 bg-slate-950/60 backdrop-blur-sm animate-in fade-in duration-300"
            onClick={() => setOpenSeksiModal(false)}
          />

          <div className="relative w-full max-w-lg max-h-[92vh] flex flex-col animate-in zoom-in slide-in-from-bottom-6 duration-300 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl dark:border-slate-800 dark:bg-slate-900">
            <div className="flex shrink-0 items-center justify-between border-b border-slate-100 dark:border-slate-800 px-5 py-3.5">
              <div className="flex items-center gap-2.5">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-600 dark:bg-emerald-500/20 dark:text-emerald-400">
                  <Briefcase className="h-4 w-4" />
                </div>
                <h3 className="text-xs sm:text-sm font-black uppercase tracking-wider text-slate-900 dark:text-white">
                  {editingSeksi ? "Edit Seksi / Bidang" : "Tambah Seksi / Bidang Baru"}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setOpenSeksiModal(false)}
                className="inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-lg transition hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="overflow-y-auto overflow-x-hidden flex-1 p-4 sm:p-6">
              <form onSubmit={handleSaveSeksi} className="space-y-4">
                {/* Judul Seksi */}
                <div className="space-y-1">
                  <label className="text-[10px] font-black uppercase tracking-wider text-slate-400 ml-1">
                    Nama Seksi / Bidang *
                  </label>
                  <input
                    type="text"
                    required
                    value={seksiForm.judul}
                    onChange={(e) => {
                      const newJudul = e.target.value;
                      setSeksiForm((prev) => ({
                        ...prev,
                        judul: newJudul,
                        ...(!editingSeksi ? { slug: slugify(newJudul) } : {}),
                      }));
                    }}
                    placeholder="Contoh: Seksi Bimbingan Masyarakat Islam"
                    className="h-10 w-full rounded-xl border border-slate-200 bg-white px-3 text-xs font-bold text-slate-900 transition focus:border-slate-900 focus:outline-none dark:border-slate-800 dark:bg-slate-800/50 dark:text-white dark:focus:border-white"
                  />
                </div>

                {/* Slug */}
                <div className="space-y-1">
                  <label className="text-[10px] font-black uppercase tracking-wider text-slate-400 ml-1">
                    Slug URL *
                  </label>
                  <input
                    type="text"
                    required
                    value={seksiForm.slug}
                    onChange={(e) => setSeksiForm({ ...seksiForm, slug: slugify(e.target.value) })}
                    placeholder="contoh: seksi-bimas-islam"
                    className="h-10 w-full rounded-xl border border-slate-200 bg-white px-3 text-xs font-mono font-semibold text-slate-900 transition focus:border-slate-900 focus:outline-none dark:border-slate-800 dark:bg-slate-800/50 dark:text-white dark:focus:border-white"
                  />
                </div>

                {/* Nama Kepala Seksi */}
                <div className="space-y-1">
                  <label className="text-[10px] font-black uppercase tracking-wider text-slate-400 ml-1">
                    Nama Kepala Seksi / Pejabat
                  </label>
                  <input
                    type="text"
                    value={seksiForm.nama_kepala}
                    onChange={(e) => setSeksiForm({ ...seksiForm, nama_kepala: e.target.value })}
                    placeholder="Contoh: H. Arbaja, S.Ag., M.A.P."
                    className="h-10 w-full rounded-xl border border-slate-200 bg-white px-3 text-xs font-bold text-slate-900 transition focus:border-slate-900 focus:outline-none dark:border-slate-800 dark:bg-slate-800/50 dark:text-white dark:focus:border-white"
                  />
                </div>

                {/* NIP Kepala Seksi */}
                <div className="space-y-1">
                  <label className="text-[10px] font-black uppercase tracking-wider text-slate-400 ml-1">
                    NIP Kepala Seksi (18 digit)
                  </label>
                  <input
                    type="text"
                    value={seksiForm.nip_kepala}
                    onChange={(e) => setSeksiForm({ ...seksiForm, nip_kepala: e.target.value })}
                    placeholder="Contoh: 197311212001121001"
                    className="h-10 w-full rounded-xl border border-slate-200 bg-white px-3 text-xs font-semibold text-slate-900 transition focus:border-slate-900 focus:outline-none dark:border-slate-800 dark:bg-slate-800/50 dark:text-white dark:focus:border-white"
                  />
                </div>

                {/* Deskripsi Tupoksi */}
                <div className="space-y-1">
                  <label className="text-[10px] font-black uppercase tracking-wider text-slate-400 ml-1">
                    Tugas Pokok &amp; Fungsi (Tupoksi)
                  </label>
                  <textarea
                    rows={3}
                    value={seksiForm.deskripsi}
                    onChange={(e) => setSeksiForm({ ...seksiForm, deskripsi: e.target.value })}
                    placeholder="Tuliskan gambaran umum tugas dan fungsi bidang kerja..."
                    className="w-full rounded-xl border border-slate-200 bg-white p-3 text-xs font-medium text-slate-900 transition focus:border-slate-900 focus:outline-none dark:border-slate-800 dark:bg-slate-800/50 dark:text-white dark:focus:border-white resize-none"
                  />
                </div>

                {/* Foto Kepala Seksi Drag & Drop Upload */}
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black uppercase tracking-wider text-slate-400 ml-1">
                    Foto Kepala Seksi / Pejabat
                  </label>
                  <div
                    onDragOver={handleKasiDragOver}
                    onDragLeave={handleKasiDragLeave}
                    onDrop={handleKasiDrop}
                    className={`flex flex-col items-center justify-center p-3.5 rounded-2xl border-2 border-dashed transition-all duration-300 ${
                      isDraggingKasi
                        ? "border-emerald-500 bg-emerald-500/10 scale-[1.01]"
                        : "border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30"
                    }`}
                  >
                    {fotoKepalaPreview ? (
                      <div className="flex items-center justify-center gap-4 mb-2.5">
                        {/* Portrait Preview */}
                        <div className="flex flex-col items-center gap-1">
                          <div className="relative h-20 w-16 shrink-0 rounded-xl bg-slate-100 dark:bg-slate-800 overflow-hidden ring-2 ring-emerald-500/30 shadow-sm">
                            <img
                              src={fotoKepalaPreview}
                              alt="Portrait Preview"
                              className="h-full w-full object-cover transition-[object-position] duration-150"
                              style={{ objectPosition: `50% ${seksiForm.foto_kepala_y ?? 50}%` }}
                            />
                          </div>
                          <span className="text-[8px] font-bold uppercase tracking-wider text-slate-400">Portrait</span>
                        </div>

                        {/* Circle Preview */}
                        <div className="flex flex-col items-center gap-1">
                          <div className="relative h-16 w-16 shrink-0 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden ring-2 ring-emerald-500/30 shadow-sm">
                            <img
                              src={fotoKepalaPreview}
                              alt="Circle Preview"
                              className="h-full w-full object-cover transition-[object-position] duration-150"
                              style={{ objectPosition: `50% ${seksiForm.foto_kepala_y ?? 50}%` }}
                            />
                          </div>
                          <span className="text-[8px] font-bold uppercase tracking-wider text-slate-400">Lingkaran</span>
                        </div>
                      </div>
                    ) : (
                      <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden ring-2 ring-emerald-500/20 shadow-inner mb-2">
                        <User className="h-7 w-7 text-slate-400" />
                      </div>
                    )}

                    <div className="text-center space-y-1">
                      <p className="text-[11px] font-semibold text-slate-600 dark:text-slate-400">
                        Tarik &amp; lepas foto di sini, atau
                      </p>
                      <button
                        type="button"
                        onClick={() => fileInputKasiRef.current?.click()}
                        className="inline-flex items-center gap-1.5 rounded-lg border border-slate-300 bg-white px-3 py-1 text-[9px] font-black uppercase tracking-wider text-slate-700 shadow-sm hover:border-slate-900 transition dark:bg-slate-900 dark:border-slate-800 dark:text-slate-300 dark:hover:border-white cursor-pointer"
                      >
                        <Upload className="h-3 w-3" />
                        Pilih File
                      </button>
                      <p className="text-[8px] font-bold text-slate-400 uppercase tracking-wider">
                        Maks 15MB (Kompresi Otomatis &lt; 500KB)
                      </p>
                      <input
                        type="file"
                        ref={fileInputKasiRef}
                        onChange={handleKasiPhotoChange}
                        accept="image/*"
                        className="hidden"
                      />
                    </div>
                  </div>

                  {/* Slider Posisi Vertikal Wajah Presisi */}
                  {fotoKepalaPreview && (
                    <div className="mt-2 p-3 bg-slate-50 dark:bg-slate-800/40 rounded-xl border border-slate-100 dark:border-slate-800/60 space-y-2">
                      <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-wider text-slate-400">
                        <span>Posisi Vertikal Wajah</span>
                        <span className="text-emerald-700 dark:text-emerald-400 font-bold font-mono">
                          {seksiForm.foto_kepala_y ?? 50}%
                        </span>
                      </div>

                      <input
                        type="range"
                        min="0"
                        max="100"
                        value={seksiForm.foto_kepala_y ?? 50}
                        onChange={(e) =>
                          setSeksiForm({ ...seksiForm, foto_kepala_y: parseInt(e.target.value, 10) || 0 })
                        }
                        className="w-full h-1.5 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-emerald-500"
                      />

                      {/* Presets */}
                      <div className="flex items-center justify-between gap-1 pt-0.5">
                        {[
                          { label: "Atas (0%)", val: 0 },
                          { label: "25%", val: 25 },
                          { label: "Tengah (50%)", val: 50 },
                          { label: "75%", val: 75 },
                          { label: "Bawah (100%)", val: 100 },
                        ].map((preset) => (
                          <button
                            key={preset.val}
                            type="button"
                            onClick={() => setSeksiForm({ ...seksiForm, foto_kepala_y: preset.val })}
                            className={`px-1.5 py-0.5 rounded text-[8px] font-bold uppercase transition cursor-pointer ${
                              (seksiForm.foto_kepala_y ?? 50) === preset.val
                                ? "bg-emerald-600 text-white shadow-sm"
                                : "bg-white text-slate-500 border border-slate-200 hover:border-slate-400 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700"
                            }`}
                          >
                            {preset.label}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* Tombol Simpan */}
                <div className="pt-2 flex items-center justify-end gap-2 border-t border-slate-100 dark:border-slate-800">
                  <button
                    type="button"
                    onClick={() => setOpenSeksiModal(false)}
                    className="px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 text-xs font-black uppercase tracking-wider hover:bg-slate-50 dark:hover:bg-slate-800 transition active:scale-95 cursor-pointer"
                  >
                    Batal
                  </button>
                  <button
                    type="submit"
                    disabled={savingSeksi}
                    className="inline-flex items-center gap-2 px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-black uppercase tracking-wider shadow-sm transition active:scale-95 disabled:opacity-50 cursor-pointer"
                  >
                    {savingSeksi ? (
                      <>
                        <Loader2 className="h-3.5 w-3.5 animate-spin" />
                        <span>Menyimpan...</span>
                      </>
                    ) : (
                      <>
                        <Save className="h-3.5 w-3.5" />
                        <span>{editingSeksi ? "Simpan Perubahan" : "Simpan Seksi"}</span>
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
