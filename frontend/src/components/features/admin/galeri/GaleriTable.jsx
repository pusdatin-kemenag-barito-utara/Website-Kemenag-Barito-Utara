import React, { useState, useEffect } from "react";
import { normalizeCoverImageUrl, isImageCached, markImageCached } from "@/lib/cover-image";

function GaleriImageThumb({ src, alt }) {
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
      <div className="absolute inset-0 flex items-center justify-center bg-slate-900 text-slate-600">
        <svg viewBox="0 0 24 24" className="h-8 w-8 opacity-50" fill="none" stroke="currentColor" strokeWidth="2">
          <rect x="3" y="3" width="18" height="18" rx="2" />
          <circle cx="8.5" cy="8.5" r="1.5" />
          <path d="M21 15l-5-5L5 21" />
        </svg>
      </div>
    );
  }

  return (
    <>
      {!loaded && (
        <div className="absolute inset-0 flex items-center justify-center bg-slate-800 animate-pulse text-slate-500">
          <div className="h-6 w-6 animate-spin rounded-full border-2 border-slate-600 border-t-transparent" />
        </div>
      )}
      <img
        src={normalized}
        alt={alt || "Dokumentasi Galeri"}
        loading="lazy"
        decoding="async"
        onLoad={() => {
          markImageCached(normalized);
          setLoaded(true);
        }}
        onError={() => setHasError(true)}
        className={`absolute inset-0 h-full w-full object-cover transition-all duration-300 group-hover:scale-105 ${
          loaded ? "opacity-100" : "opacity-0"
        }`}
      />
    </>
  );
}

export function GaleriTable({ items, loading, onEdit, onDelete, deletingId }) {
  if (loading) {
    return (
      <div className="flex min-h-[350px] flex-col items-center justify-center gap-3 py-16">
        <div className="h-8 w-8 animate-spin rounded-full border-3 border-emerald-600 border-t-transparent" />
        <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Memuat Koleksi Galeri...</p>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="flex min-h-[300px] flex-col items-center justify-center rounded-3xl border-2 border-dashed border-slate-200 bg-white/50 p-10 text-center dark:border-slate-800/50 dark:bg-slate-900/30">
        <div className="mb-3 flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100 text-slate-400 dark:bg-slate-800">
          <svg viewBox="0 0 24 24" className="h-7 w-7" fill="none" stroke="currentColor" strokeWidth="2">
            <rect x="3" y="3" width="18" height="18" rx="2" />
            <circle cx="8.5" cy="8.5" r="1.5" />
            <path d="M21 15l-5-5L5 21" />
          </svg>
        </div>
        <h3 className="text-xs font-black uppercase tracking-wider text-slate-900 dark:text-white">Tidak Ada Visual Galeri</h3>
        <p className="mt-1 text-[11px] text-slate-400 max-w-xs">Mulai unggah visual dokumentasi kegiatan instansi menggunakan tombol di atas.</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 gap-3.5 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-4 xl:grid-cols-6">
      {items.map((item, index) => (
        <article
          key={item.id}
          className="group relative aspect-[3/4] w-full overflow-hidden rounded-2xl border border-slate-200/80 bg-slate-900 shadow-sm transition-all duration-300 hover:shadow-xl hover:-translate-y-1 dark:border-slate-800"
        >
          {/* Main Visual Image with In-Memory Cache */}
          <GaleriImageThumb src={item.image_url} alt={item.title} />

          {/* Top Subtle Gradient */}
          <div className="absolute inset-x-0 top-0 h-16 bg-gradient-to-b from-black/60 to-transparent pointer-events-none" />

          {/* Bottom Gradient */}
          <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-black/85 via-black/40 to-transparent pointer-events-none" />

          {/* Top Bar: Floating Action Buttons & Index */}
          <div className="absolute inset-x-0 top-0 flex items-center justify-between p-2.5 z-10">
            <span className="rounded-md bg-black/40 backdrop-blur-md px-1.5 py-0.5 text-[9px] font-black text-white/80">
              #{index + 1}
            </span>

            {/* Sleek Glassmorphic Action Buttons */}
            <div className="flex items-center gap-1.5 opacity-90 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity duration-200">
              <button
                type="button"
                onClick={() => onEdit(item)}
                title="Edit Visual"
                className="flex h-7 w-7 items-center justify-center rounded-lg bg-black/60 backdrop-blur-md text-white shadow-md transition-all hover:bg-emerald-600 hover:scale-110 active:scale-95"
              >
                <svg viewBox="0 0 24 24" className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7" />
                  <path d="M18.5 2.5a2.121 2.121 0 113 3L12 15l-4 1 1-4 9.5-9.5z" />
                </svg>
              </button>

              <button
                type="button"
                disabled={deletingId === item.id}
                onClick={() => onDelete(item)}
                title="Hapus Visual"
                className="flex h-7 w-7 items-center justify-center rounded-lg bg-black/60 backdrop-blur-md text-rose-300 shadow-md transition-all hover:bg-rose-600 hover:text-white hover:scale-110 active:scale-95 disabled:opacity-50"
              >
                {deletingId === item.id ? (
                  <div className="h-3 w-3 animate-spin rounded-full border-2 border-white border-t-transparent" />
                ) : (
                  <svg viewBox="0 0 24 24" className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <path d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                )}
              </button>
            </div>
          </div>

          {/* Bottom Bar: Date & Title Info */}
          <div className="absolute inset-x-0 bottom-0 p-2.5 z-10">
            {item.title && (
              <p className="text-[11px] font-black text-white leading-tight line-clamp-1 mb-1 drop-shadow-sm">
                {item.title}
              </p>
            )}

            <div className="flex items-center justify-between gap-1 text-[9px] font-bold text-white/80">
              <span className="flex items-center gap-1 rounded bg-white/20 backdrop-blur-md px-1.5 py-0.5 text-white">
                📅 {new Date(item.published_at || item.created_at).toLocaleDateString("id-ID", {
                  day: "2-digit",
                  month: "short",
                  year: "numeric",
                })}
              </span>

              {item.image_size_kb ? (
                <span className="text-[8px] text-white/60">
                  {item.image_size_kb} KB
                </span>
              ) : null}
            </div>
          </div>
        </article>
      ))}
    </div>
  );
}
