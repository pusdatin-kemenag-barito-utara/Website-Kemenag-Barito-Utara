import React, { useState, useEffect } from "react";
import { StatusPill, ActionIconButton, ToggleSwitch } from "./SlidesUI";
import {
  normalizeCoverImageUrl,
  isImageCached,
  markImageCached,
  getAlternativeStorageUrl,
} from "@/lib/cover-image";

function SlideImageThumb({ src, alt, onUploadClick }) {
  const normalized = normalizeCoverImageUrl(src);
  const [currentSrc, setCurrentSrc] = useState(normalized);
  const [loaded, setLoaded] = useState(() => isImageCached(normalized));
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    setCurrentSrc(normalized);
    setHasError(false);
    setLoaded(isImageCached(normalized));
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
      <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-gradient-to-br from-slate-100 to-slate-200/70 p-4 text-center dark:from-slate-800 dark:to-slate-900">
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/80 text-slate-400 shadow-sm dark:bg-slate-800 dark:text-slate-500">
          <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="2">
            <rect x="3" y="3" width="18" height="18" rx="2" />
            <circle cx="8.5" cy="8.5" r="1.5" />
            <path d="M21 15l-5-5L5 21" />
          </svg>
        </div>
        <div>
          <p className="text-[11px] font-black uppercase tracking-wider text-slate-600 dark:text-slate-300">
            Gambar Belum Tersedia
          </p>
          <p className="mt-0.5 text-[10px] font-medium text-slate-400">
            {hasError ? "File gambar gagal dimuat" : "Unggah visual untuk menayangkan"}
          </p>
        </div>
        {onUploadClick && (
          <button
            type="button"
            onClick={onUploadClick}
            className="inline-flex items-center gap-1.5 rounded-xl bg-emerald-600 px-3.5 py-2 text-[10px] font-black uppercase tracking-wider text-white shadow-sm transition-all hover:bg-emerald-700 active:scale-95"
          >
            <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
            </svg>
            <span>Unggah Gambar</span>
          </button>
        )}
      </div>
    );
  }

  return (
    <>
      {!loaded && (
        <div className="absolute inset-0 flex items-center justify-center bg-slate-200 dark:bg-slate-800 animate-pulse text-slate-400" />
      )}
      {/* Blurred Ambient Backdrop so portrait & landscape infographics fill nicely without cropping */}
      <img
        src={currentSrc}
        alt=""
        aria-hidden="true"
        loading="lazy"
        decoding="async"
        className={`absolute inset-0 h-full w-full object-cover blur-xl opacity-35 scale-110 transition-opacity duration-300 ${
          loaded ? "opacity-35" : "opacity-0"
        }`}
      />
      {/* Main Full-View Infographic */}
      <img
        src={currentSrc}
        alt={alt || "Infografis Banner"}
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
        className={`relative z-[1] h-full w-full object-contain p-2 transition-transform duration-300 group-hover:scale-[1.03] ${
          loaded ? "opacity-100" : "opacity-0"
        }`}
      />
    </>
  );
}

const CATEGORY_COLORS = {
  ipkp: "bg-emerald-600/95 text-white border-emerald-400/50",
  ipak: "bg-teal-600/95 text-white border-teal-400/50",
  utama: "bg-emerald-600/95 text-white border-emerald-400/50",
  islam: "bg-amber-600/95 text-white border-amber-400/50",
  kristen: "bg-sky-600/95 text-white border-sky-400/50",
  katolik: "bg-indigo-600/95 text-white border-indigo-400/50",
  hindu: "bg-rose-600/95 text-white border-rose-400/50",
};

const CATEGORY_LABELS = {
  ipkp: "SKM: IPKP",
  ipak: "SKM: IPAK",
  utama: "Utama",
  islam: "Mutiara Islam",
  kristen: "Renungan Kristen",
  katolik: "Renungan Katolik",
  hindu: "Dharma Hindu",
};

export function SlideTable({
  items,
  loading,
  onEdit,
  onDelete,
  onTogglePublish,
  onMoveOrder,
  onOpenPreview,
  previewModal,
  onClosePreview,
  deletingId,
  togglingId,
  reorderingId,
  toNumber,
  onResetFilter,
}) {
  // Lightbox key listener (Escape to close)
  useEffect(() => {
    if (!previewModal?.open) return;
    function handleKeyDown(e) {
      if (e.key === "Escape") {
        onClosePreview && onClosePreview();
      }
    }
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [previewModal, onClosePreview]);

  if (loading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
        {Array.from({ length: 8 }).map((_, idx) => (
          <div
            key={idx}
            className="animate-pulse flex flex-col justify-between overflow-hidden rounded-3xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900"
          >
            <div className="aspect-[4/5] w-full rounded-2xl bg-slate-200 dark:bg-slate-800" />
            <div className="mt-4 space-y-2">
              <div className="h-4 bg-slate-200 dark:bg-slate-800 rounded w-3/4" />
              <div className="h-3 bg-slate-200 dark:bg-slate-800 rounded w-1/2" />
            </div>
            <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex justify-between">
              <div className="h-6 w-16 bg-slate-200 dark:bg-slate-800 rounded" />
              <div className="h-6 w-16 bg-slate-200 dark:bg-slate-800 rounded" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="flex min-h-[320px] flex-col items-center justify-center rounded-3xl border-2 border-dashed border-slate-200 bg-white/50 p-8 text-center dark:border-slate-800/50 dark:bg-slate-900/30">
        <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-slate-100 text-slate-400 dark:bg-slate-800">
          <svg className="h-8 w-8" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h14a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
            />
          </svg>
        </div>
        <h3 className="mt-4 text-sm font-black uppercase tracking-wider text-slate-900 dark:text-white">
          Tidak Ada Data Infografis
        </h3>
        <p className="mt-1 text-xs text-slate-400 max-w-sm">
          Tidak ditemukan data yang sesuai dengan pencarian atau filter yang Anda pilih.
        </p>
        {onResetFilter && (
          <button
            type="button"
            onClick={onResetFilter}
            className="mt-6 inline-flex items-center gap-2 rounded-xl bg-slate-900 px-5 py-2.5 text-xs font-black uppercase tracking-wider text-white shadow-md transition-all hover:bg-slate-800 active:scale-95 dark:bg-white dark:text-slate-900"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.5">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
              />
            </svg>
            <span>Reset Pencarian</span>
          </button>
        )}
      </div>
    );
  }

  return (
    <>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
        {items.map((item) => {
          const catKey = (item.category || "utama").toLowerCase();
          const catBadgeClass = CATEGORY_COLORS[catKey] || "bg-slate-700/95 text-white border-slate-500/40";
          const catLabel = CATEGORY_LABELS[catKey] || item.category || "Utama";
          const orderNum = toNumber(item.sort_order, 1);
          const hasImage = Boolean(item.image_url);

          return (
            <article
              key={item.id}
              className="group relative flex flex-col justify-between overflow-hidden rounded-2xl sm:rounded-3xl border border-slate-200/80 bg-white transition-all duration-300 hover:border-emerald-500 hover:shadow-xl hover:shadow-emerald-500/5 dark:border-slate-800 dark:bg-slate-900/90 dark:hover:border-emerald-500/40"
            >
              {/* Media Thumbnail Container (Portrait 4:5 with full-view object-contain) */}
              <div className="relative aspect-[4/5] w-full overflow-hidden bg-slate-100 dark:bg-slate-950/60">
                <SlideImageThumb
                  src={item.image_url}
                  alt={item.title}
                  onUploadClick={() => onEdit && onEdit(item)}
                />

                {/* Top Badges */}
                <div className="pointer-events-none absolute top-2.5 inset-x-2.5 flex items-center justify-between gap-1.5 z-10">
                  <span
                    className={`inline-flex items-center rounded-lg border px-2.5 py-1 text-[9px] font-black uppercase tracking-wider shadow-md backdrop-blur-md ${catBadgeClass}`}
                  >
                    {catLabel}
                  </span>

                  <span className="inline-flex items-center rounded-lg bg-slate-900/80 backdrop-blur-md px-2.5 py-1 text-[9px] font-black uppercase tracking-widest text-white shadow-md">
                    Urutan #{orderNum}
                  </span>
                </div>

                {/* Hover Preview Button (only shown when image is present) */}
                {hasImage && (
                  <button
                    type="button"
                    onClick={() => onOpenPreview && onOpenPreview(item)}
                    className="absolute inset-0 z-20 flex items-center justify-center bg-slate-950/40 opacity-0 backdrop-blur-[2px] transition-opacity duration-300 group-hover:opacity-100"
                    title="Lihat ukuran penuh"
                  >
                    <div className="flex items-center gap-1.5 rounded-xl bg-white/95 px-3.5 py-2 text-[10px] font-black uppercase tracking-widest text-slate-900 shadow-xl transition-transform active:scale-90 dark:bg-slate-900 dark:text-white">
                      <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.5">
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v6m3-3H7"
                        />
                      </svg>
                      <span>Perbesar</span>
                    </div>
                  </button>
                )}
              </div>

              {/* Card Body */}
              <div className="flex flex-1 flex-col p-4 sm:p-5">
                <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
                  <div className="flex flex-wrap items-center gap-1.5">
                    <StatusPill published={item.is_published} />
                    {!hasImage && (
                      <span className="inline-flex items-center gap-1 rounded-lg bg-rose-50 border border-rose-200 px-2 py-0.5 text-[9px] font-black uppercase tracking-wider text-rose-600 dark:bg-rose-950/30 dark:border-rose-900/50 dark:text-rose-400">
                        Perlu Gambar
                      </span>
                    )}
                  </div>

                  {onMoveOrder && (
                    <div
                      className="inline-flex h-8 items-center rounded-xl border border-slate-200 bg-slate-50 p-0.5 dark:border-slate-700 dark:bg-slate-800"
                      title="Ubah urutan tampil dalam kategori ini"
                    >
                      <button
                        type="button"
                        onClick={() => onMoveOrder(item, -1)}
                        disabled={Boolean(item.isFirstInCategory) || reorderingId === item.id}
                        className="flex h-6.5 w-6 items-center justify-center rounded-lg text-slate-500 transition hover:bg-white hover:text-slate-900 disabled:cursor-not-allowed disabled:opacity-30 dark:text-slate-400 dark:hover:bg-slate-700 dark:hover:text-white"
                        title="Naikkan prioritas urutan (-1)"
                        aria-label="Naikkan urutan"
                      >
                        <svg className="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="3">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M20 12H4" />
                        </svg>
                      </button>
                      <span className="px-1.5 text-[10px] font-black text-slate-700 dark:text-slate-200 tabular-nums">
                        #{orderNum}
                      </span>
                      <button
                        type="button"
                        onClick={() => onMoveOrder(item, 1)}
                        disabled={Boolean(item.isLastInCategory) || reorderingId === item.id}
                        className="flex h-6.5 w-6 items-center justify-center rounded-lg text-slate-500 transition hover:bg-white hover:text-slate-900 disabled:cursor-not-allowed disabled:opacity-30 dark:text-slate-400 dark:hover:bg-slate-700 dark:hover:text-white"
                        title="Turunkan prioritas urutan (+1)"
                        aria-label="Turunkan urutan"
                      >
                        <svg className="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="3">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                        </svg>
                      </button>
                    </div>
                  )}
                </div>

                <h3
                  className="text-sm font-black tracking-tight text-slate-900 dark:text-white leading-snug line-clamp-2 uppercase group-hover:text-emerald-700 dark:group-hover:text-emerald-400 transition-colors"
                  title={item.title}
                >
                  {item.title}
                </h3>

                <p className="mt-1.5 text-xs font-medium leading-relaxed text-slate-500 dark:text-slate-400 line-clamp-2 flex-1">
                  {item.caption || "Tidak ada deskripsi caption."}
                </p>

                {/* Card Footer Actions */}
                <div className="mt-4 pt-3.5 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between gap-3">
                  {/* Quick Toggle Status */}
                  <div className="flex items-center gap-2 min-w-0">
                    <ToggleSwitch
                      size="sm"
                      checked={item.is_published}
                      onChange={() => onTogglePublish && onTogglePublish(item)}
                      disabled={togglingId === item.id}
                    />
                    <span className="text-[11px] font-bold text-slate-600 dark:text-slate-300 select-none truncate">
                      {togglingId === item.id ? "..." : item.is_published ? "Tayang" : "Draft"}
                    </span>
                  </div>

                  {/* Clean 2-Button Action Group */}
                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      type="button"
                      onClick={() => onEdit(item)}
                      title="Edit infografis"
                      className="inline-flex h-9 items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 text-[11px] font-bold text-slate-700 shadow-sm transition-all hover:border-slate-900 hover:text-slate-900 active:scale-95 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:border-white dark:hover:text-white"
                    >
                      <svg viewBox="0 0 24 24" className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth="2.5">
                        <path d="m4 20 4.1-.8L18 9.3 14.7 6 4.8 15.9 4 20Z" />
                        <path d="m12.9 7.8 3.3 3.3" />
                      </svg>
                      <span>Edit</span>
                    </button>

                    <ActionIconButton
                      title={deletingId === item.id ? "Menghapus..." : "Hapus infografis"}
                      onClick={() => onDelete(item.id)}
                      disabled={deletingId === item.id}
                      variant="danger"
                    >
                      {deletingId === item.id ? (
                        <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                      ) : (
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                          <path d="M4 7h16M9 7V4.8a.8.8 0 0 1 .8-.8h4.4a.8.8 0 0 1 .8.8V7M7 7v11a2 2 0 0 0 2 2h6a2 2 0 0 0 2-2V7M10 11v5M14 11v5" />
                        </svg>
                      )}
                    </ActionIconButton>
                  </div>
                </div>
              </div>
            </article>
          );
        })}
      </div>

      {/* Lightbox Modal */}
      {previewModal?.open && previewModal?.item && (
        <div className="fixed inset-0 z-[300] flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-300"
            onClick={onClosePreview}
          />

          <div className="relative z-10 flex max-h-[90vh] w-full max-w-3xl flex-col overflow-hidden rounded-3xl border border-slate-700/60 bg-slate-900 shadow-2xl animate-in zoom-in-95 duration-300">
            {/* Lightbox Header */}
            <div className="flex items-center justify-between border-b border-slate-800 bg-slate-900/90 px-6 py-4">
              <div className="min-w-0 pr-4">
                <p className="text-[10px] font-black uppercase tracking-widest text-emerald-400">
                  Pratinjau Infografis • {CATEGORY_LABELS[(previewModal.item.category || "utama").toLowerCase()] || previewModal.item.category || "Utama"} • Urutan #{toNumber(previewModal.item.sort_order, 1)}
                </p>
                <h4 className="text-base font-black tracking-tight text-white truncate">
                  {previewModal.item.title}
                </h4>
              </div>

              <button
                type="button"
                onClick={onClosePreview}
                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-slate-800 text-slate-400 transition-all hover:bg-rose-900/50 hover:text-white active:scale-95"
                title="Tutup (Esc)"
              >
                <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Lightbox Image */}
            <div className="relative flex-1 overflow-auto bg-black/50 p-4 flex items-center justify-center min-h-[360px] max-h-[65vh]">
              <img
                src={normalizeCoverImageUrl(previewModal.item.image_url)}
                alt={previewModal.item.title}
                className="max-h-[60vh] w-auto max-w-full rounded-xl object-contain shadow-2xl"
              />
            </div>

            {/* Lightbox Footer */}
            {previewModal.item.caption && (
              <div className="border-t border-slate-800 bg-slate-900/80 p-5">
                <p className="text-xs font-medium text-slate-300 leading-relaxed whitespace-pre-line">
                  {previewModal.item.caption}
                </p>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}
