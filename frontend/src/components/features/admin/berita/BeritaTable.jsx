import React from "react";
import { StatusPill, ActionIconButton } from "./BeritaUI";
import { IconPencil, IconTrash, IconGallery } from "./BeritaIcons";
import { formatDate, getItemBaseDate, getItemPublishedState } from "@/lib/berita-utils";
import { normalizeCoverImageUrl } from "@/lib/cover-image";
import Image from "@/components/common/NextImage";

// In-memory set of loaded image URLs to guarantee instant 0ms rendering on pagination
const preloadedUrls = new Set();

function NewsCoverThumb({ src, title }) {
  const [loaded, setLoaded] = React.useState(() => (src ? preloadedUrls.has(src) : false));
  const [hasError, setHasError] = React.useState(false);

  React.useEffect(() => {
    if (!src) return;
    if (preloadedUrls.has(src)) {
      setLoaded(true);
      return;
    }
    const img = new window.Image();
    img.src = src;
    img.onload = () => {
      preloadedUrls.add(src);
      setLoaded(true);
    };
    img.onerror = () => {
      setHasError(true);
    };
  }, [src]);

  if (!src || hasError) {
    return (
      <div className="relative flex h-13 w-18 shrink-0 items-center justify-center rounded-xl border border-slate-200/80 bg-slate-100/80 text-slate-400 dark:border-slate-800 dark:bg-slate-800/80 dark:text-slate-500">
        <IconGallery className="h-5 w-5 opacity-60" />
      </div>
    );
  }

  return (
    <div className="relative h-13 w-18 shrink-0 overflow-hidden rounded-xl border border-slate-200/80 bg-slate-100 dark:border-slate-800 dark:bg-slate-800">
      {!loaded && (
        <div className="absolute inset-0 flex items-center justify-center bg-slate-100 dark:bg-slate-800 animate-pulse text-slate-400">
          <IconGallery className="h-4 w-4 opacity-40" />
        </div>
      )}
      <img
        src={src}
        alt={title || "Cover"}
        loading="lazy"
        decoding="async"
        onLoad={() => {
          preloadedUrls.add(src);
          setLoaded(true);
        }}
        onError={() => setHasError(true)}
        className={`h-full w-full object-cover transition-opacity duration-200 group-hover:scale-105 ${
          loaded ? "opacity-100" : "opacity-0"
        }`}
      />
    </div>
  );
}

function getCategoryColor(cat = "") {
  const c = String(cat).toLowerCase();
  if (c.includes("kegiatan") || c.includes("berita") || c.includes("utama")) {
    return "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800";
  }
  if (c.includes("islam")) {
    return "bg-teal-50 text-teal-700 border-teal-200 dark:bg-teal-950/40 dark:text-teal-300 dark:border-teal-800";
  }
  if (c.includes("kristen")) {
    return "bg-sky-50 text-sky-700 border-sky-200 dark:bg-sky-950/40 dark:text-sky-300 dark:border-sky-800";
  }
  if (c.includes("katolik")) {
    return "bg-indigo-50 text-indigo-700 border-indigo-200 dark:bg-indigo-950/40 dark:text-indigo-300 dark:border-indigo-800";
  }
  if (c.includes("hindu")) {
    return "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-800";
  }
  if (c.includes("pendis") || c.includes("madrasah") || c.includes("haji")) {
    return "bg-purple-50 text-purple-700 border-purple-200 dark:bg-purple-950/40 dark:text-purple-300 dark:border-purple-800";
  }
  return "bg-slate-100 text-slate-700 border-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700";
}

export function BeritaTable({
  items,
  loading,
  startIndex,
  onEdit,
  onDelete,
  deletingId,
}) {
  return (
    <div className="mt-4 overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900/40">
      <div className="overflow-x-auto">
        <table className="w-full min-w-[700px] border-collapse">
          <thead>
            <tr className="border-b border-slate-200/80 bg-slate-50/70 dark:border-slate-800 dark:bg-slate-800/40">
              <th className="w-12 px-4 py-3.5 text-center text-[10px] font-black uppercase tracking-wider text-slate-400">
                No
              </th>
              <th className="px-4 py-3.5 text-left text-[10px] font-black uppercase tracking-wider text-slate-400">
                Judul & Liputan Berita
              </th>
              <th className="w-36 px-4 py-3.5 text-left text-[10px] font-black uppercase tracking-wider text-slate-400">
                Kategori
              </th>
              <th className="w-24 px-4 py-3.5 text-center text-[10px] font-black uppercase tracking-wider text-slate-400">
                Dibaca
              </th>
              <th className="w-28 px-4 py-3.5 text-center text-[10px] font-black uppercase tracking-wider text-slate-400">
                Status
              </th>
              <th className="w-24 px-4 py-3.5 text-right text-[10px] font-black uppercase tracking-wider text-slate-400">
                Aksi
              </th>
            </tr>
          </thead>

          <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
            {loading ? (
              Array.from({ length: 5 }).map((_, idx) => (
                <tr key={idx} className="animate-pulse">
                  <td className="px-4 py-4 text-center">
                    <div className="h-4 w-5 mx-auto bg-slate-200 dark:bg-slate-800 rounded" />
                  </td>
                  <td className="px-4 py-4">
                    <div className="flex items-center gap-3.5">
                      <div className="h-14 w-20 bg-slate-200 dark:bg-slate-800 rounded-xl shrink-0" />
                      <div className="space-y-2 flex-1">
                        <div className="h-4 bg-slate-200 dark:bg-slate-800 rounded w-3/4" />
                        <div className="h-3 bg-slate-200 dark:bg-slate-800 rounded w-1/2" />
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-4">
                    <div className="h-5 w-20 bg-slate-200 dark:bg-slate-800 rounded-full" />
                  </td>
                  <td className="px-4 py-4 text-center">
                    <div className="h-4 w-8 mx-auto bg-slate-200 dark:bg-slate-800 rounded" />
                  </td>
                  <td className="px-4 py-4 text-center">
                    <div className="h-5 w-16 mx-auto bg-slate-200 dark:bg-slate-800 rounded-full" />
                  </td>
                  <td className="px-4 py-4 text-right">
                    <div className="flex justify-end gap-1.5">
                      <div className="h-8 w-8 bg-slate-200 dark:bg-slate-800 rounded-lg" />
                      <div className="h-8 w-8 bg-slate-200 dark:bg-slate-800 rounded-lg" />
                    </div>
                  </td>
                </tr>
              ))
            ) : items.length === 0 ? (
              <tr>
                <td
                  colSpan={6}
                  className="px-4 py-16 text-center text-xs font-bold text-slate-400"
                >
                  <div className="flex flex-col items-center justify-center gap-2">
                    <svg className="w-8 h-8 text-slate-300 dark:text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />
                    </svg>
                    <span>Tidak ada berita yang sesuai dengan filter atau kata kunci.</span>
                  </div>
                </td>
              </tr>
            ) : (
              items.map((item, index) => {
                const coverSrc = normalizeCoverImageUrl(item.cover_image || item.image_url);

                return (
                  <tr
                    key={item.id}
                    className="group bg-white hover:bg-slate-50/80 transition-colors align-middle dark:bg-transparent dark:hover:bg-slate-800/40"
                  >
                    <td className="px-4 py-3.5 text-center text-xs font-black text-slate-400">
                      {startIndex + index + 1}
                    </td>

                    <td className="px-4 py-3.5">
                      <div className="flex items-center gap-3.5">
                        {/* Cover Thumbnail with Instant Cache */}
                        <NewsCoverThumb src={coverSrc} title={item.title} />

                        {/* Title & Metadata */}
                        <div className="min-w-0 flex-1">
                          <p className="text-xs sm:text-sm font-bold tracking-tight text-slate-900 dark:text-slate-100 group-hover:text-emerald-700 dark:group-hover:text-emerald-400 transition-colors line-clamp-1">
                            {item.title}
                          </p>
                          <div className="mt-1 flex flex-wrap items-center gap-2">
                            <span className="text-[10px] font-semibold text-slate-400 font-mono">
                              /berita/{item.slug}
                            </span>
                            <span className="h-1 w-1 rounded-full bg-slate-300 dark:bg-slate-700" />
                            <span className="text-[10px] font-medium text-slate-400">
                              {formatDate(getItemBaseDate(item))}
                            </span>
                          </div>
                        </div>
                      </div>
                    </td>

                    <td className="px-4 py-3.5">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider border ${getCategoryColor(item.category)}`}>
                        {item.category || "Umum"}
                      </span>
                    </td>

                    <td className="px-4 py-3.5 text-center">
                      <span className="inline-flex items-center gap-1 text-xs font-bold text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 px-2.5 py-0.5 rounded-full">
                        <span className="text-emerald-500">
                          <svg viewBox="0 0 24 24" className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth="2.5">
                            <path d="M2.5 12s3.5-6 9.5-6 9.5 6 9.5 6-3.5 6-9.5 6-9.5-6Z" />
                            <circle cx="12" cy="12" r="3" />
                          </svg>
                        </span>
                        {Number(item.views || 0)}
                      </span>
                    </td>

                    <td className="px-4 py-3.5 text-center">
                      <StatusPill published={getItemPublishedState(item)} />
                    </td>

                    <td className="px-4 py-3.5 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <ActionIconButton
                          title="Edit berita"
                          onClick={() => onEdit(item)}
                          variant="neutral"
                        >
                          <IconPencil />
                        </ActionIconButton>

                        <ActionIconButton
                          title={
                            deletingId === item.id
                              ? "Menghapus berita..."
                              : "Hapus berita"
                          }
                          onClick={() => onDelete(item)}
                          disabled={deletingId === item.id}
                          variant="danger"
                        >
                          <IconTrash />
                        </ActionIconButton>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
