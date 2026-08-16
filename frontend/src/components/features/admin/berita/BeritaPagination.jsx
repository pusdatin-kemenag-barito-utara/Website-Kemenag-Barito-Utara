import React from "react";
import { buildPagination } from "@/lib/berita-utils";

export function BeritaPagination({
  totalPages,
  safeCurrentPage,
  setCurrentPage
}) {
  const paginationItems = buildPagination(totalPages, safeCurrentPage);

  return (
    <div className="mt-4 flex flex-col items-center justify-center gap-3 border-t border-slate-100 pt-4 dark:border-slate-800/60">
      <div className="flex flex-wrap items-center justify-center gap-1.5">
        <button
          type="button"
          onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
          disabled={safeCurrentPage === 1}
          className="flex h-8 items-center justify-center rounded-lg border border-slate-200 bg-white px-3 text-[11px] font-semibold text-slate-600 transition-all hover:border-emerald-500 hover:bg-emerald-50 hover:text-emerald-700 disabled:cursor-not-allowed disabled:opacity-40 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300 dark:hover:border-emerald-500 dark:hover:bg-emerald-900/30 dark:hover:text-emerald-400"
        >
          Sebelumnya
        </button>

        <div className="flex items-center gap-1">
          {paginationItems.map((item, index) =>
            item === "..." ? (
              <span key={`ellipsis-${index}`} className="px-1 text-xs font-medium text-slate-400">
                ...
              </span>
            ) : (
              <button
                key={item}
                type="button"
                onClick={() => setCurrentPage(item)}
                className={`flex h-8 w-8 items-center justify-center rounded-lg text-xs font-bold transition-all border ${safeCurrentPage === item
                  ? "bg-slate-900 border-slate-900 text-white dark:bg-white dark:border-white dark:text-slate-900 shadow-sm"
                  : "border-slate-200 bg-white text-slate-600 hover:border-slate-900 hover:text-slate-900 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300 dark:hover:border-white dark:hover:text-white"
                  }`}
              >
                {item}
              </button>
            )
          )}
        </div>

        <button
          type="button"
          onClick={() => setCurrentPage((prev) => Math.min(totalPages, prev + 1))}
          disabled={safeCurrentPage === totalPages}
          className="flex h-8 items-center justify-center rounded-lg border border-slate-200 bg-white px-3 text-[11px] font-semibold text-slate-600 transition-all hover:border-emerald-500 hover:bg-emerald-50 hover:text-emerald-700 disabled:cursor-not-allowed disabled:opacity-40 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300 dark:hover:border-emerald-500 dark:hover:bg-emerald-900/30 dark:hover:text-emerald-400"
        >
          Selanjutnya
        </button>
      </div>

      <p className="text-center text-xs font-medium text-slate-400 dark:text-slate-500">
        Menampilkan halaman <span className="font-bold text-slate-900 dark:text-white">{safeCurrentPage}</span> dari <span className="font-bold text-slate-900 dark:text-white">{totalPages}</span>
      </p>
    </div>
  );
}
