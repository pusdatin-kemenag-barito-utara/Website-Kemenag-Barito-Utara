"use client";

import React, { useEffect, useState } from "react";
import Image from "@/components/common/NextImage";
import Link from "@/components/common/NextLink";
import {
  Briefcase,
  User,
  Users,
  ChevronRight,
  Loader2,
  Trash2,
} from "lucide-react";
import { FloatingFeedback, DeleteConfirmModal } from "./slides/SlidesUI";
import { logWarn, logError } from "@/lib/logger";
import { normalizeCoverImageUrl, isImageCached, markImageCached, preloadImages } from "@/lib/cover-image";

function SeksiAvatarThumb({ src, alt, objectPositionY = 50 }) {
  const normalized = normalizeCoverImageUrl(src);
  const [loaded, setLoaded] = useState(() => isImageCached(normalized));
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    if (!normalized) return;
    if (isImageCached(normalized)) {
      setLoaded(true);
      return;
    }
    const img = new window.Image();
    img.src = normalized;
    img.onload = () => {
      markImageCached(normalized);
      setLoaded(true);
    };
    img.onerror = () => {
      setHasError(true);
    };
  }, [normalized]);

  if (!normalized || hasError) {
    return (
      <div className="flex h-8 w-8 items-center justify-center bg-slate-100 dark:bg-slate-800 text-slate-400">
        <User className="h-4 w-4" />
      </div>
    );
  }

  return (
    <img
      src={normalized}
      alt={alt || "Kepala Seksi"}
      loading="lazy"
      decoding="async"
      onLoad={() => {
        markImageCached(normalized);
        setLoaded(true);
      }}
      onError={() => setHasError(true)}
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

  useEffect(() => {
    const controller = new AbortController();
    (async () => {
      try {
        const res = await fetch("/api/admin/session", {
          signal: controller.signal,
        });
        if (res.ok) {
          const data = await res.json();
          setIsSuperAdmin(data?.permissions?.role === "super_admin");
        }
      } catch (e) {
        if (e?.name === "AbortError") return;
        logWarn("seksi_list_session_warn", { error: e?.message });
      } finally {
        if (!controller.signal.aborted) fetchSeksi();
      }
    })();
    return () => controller.abort();
  }, []);

  const fetchSeksi = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/admin/seksi");
      if (!res.ok) {
        if (res.status === 401 || res.status === 403) {
          throw new Error(
            "Sesi telah berakhir atau akses ditolak. Silakan login kembali.",
          );
        }
        throw new Error("Gagal mengambil data seksi.");
      }
      const data = await res.json();
      const list = Array.isArray(data)
        ? data
        : data?.items || data?.seksi || data?.data || [];
      setItems(list);
      preloadImages(list.map((it) => it.foto_kepala));
    } catch (err) {
      logError("seksi_list_fetch_error", { error: err?.message });
      setError(err?.message || "Terjadi kesalahan koneksi saat memuat data.");
    } finally {
      setLoading(false);
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
      const res = await fetch(`/api/admin/seksi/${id}`, {
        method: "DELETE",
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        throw new Error(data?.message || "Gagal menghapus seksi.");
      }

      setMessage(data?.message || "Seksi berhasil dihapus.");
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
      <div className="flex flex-col gap-1 md:flex-row md:items-end md:justify-between">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-slate-900 dark:text-white uppercase">
            Manajemen Kepegawaian
          </h1>
          <p className="mt-1 text-xs font-medium text-slate-500 dark:text-slate-400">
            Kelola profil Kepala Seksi, deskripsi seksi, serta struktur pegawai
            bawahan di tiap bidang.
          </p>
        </div>
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

                        {isSuperAdmin && (
                          <button
                            type="button"
                            onClick={() => handleDelete(item.id, item.judul)}
                            disabled={deletingId === item.id}
                            className="inline-flex items-center justify-center h-8 px-2.5 rounded-lg border border-rose-200 text-rose-600 hover:bg-rose-50 dark:border-rose-900/50 dark:text-rose-400 dark:hover:bg-rose-950/40 text-[10px] font-black uppercase tracking-wider transition-all active:scale-95 disabled:opacity-60"
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
    </section>
  );
}
