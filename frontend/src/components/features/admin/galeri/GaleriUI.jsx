import React from "react";

export function FloatingFeedback({ message, error, onClose }) {
  if (!message && !error) return null;

  return (
    <div className="fixed bottom-10 left-1/2 z-[200] -translate-x-1/2 animate-in fade-in slide-in-from-bottom-5 duration-500">
      <div className={`flex items-center gap-4 rounded-2xl px-6 py-4 shadow-2xl backdrop-blur-md ${error ? "bg-rose-600/90 text-white" : "bg-emerald-600/90 text-white"
        }`}>
        <p className="text-xs font-black uppercase tracking-widest">{error || message}</p>
        <button onClick={onClose} className="rounded-full bg-white/20 p-1 hover:bg-white/30 transition-colors">
          <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="3">
            <path d="M18 6 6 18M6 6l12 12" />
          </svg>
        </button>
      </div>
    </div>
  );
}

export function GaleriPagination({ currentPage, totalPages, totalItems = 0, onPageChange }) {
  if (totalPages <= 1) {
    if (totalItems > 0) {
      return (
        <div className="mt-6 flex items-center justify-center border-t border-slate-100 pt-4 dark:border-slate-800/60">
          <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
            Menampilkan seluruh {totalItems} visual dokumentasi
          </p>
        </div>
      );
    }
    return null;
  }

  const renderPageNumbers = () => {
    let pages = [];
    for (let i = 1; i <= totalPages; i++) {
      if (
        i === 1 ||
        i === totalPages ||
        (i >= currentPage - 1 && i <= currentPage + 1)
      ) {
        pages.push(i);
      } else if (i === currentPage - 2 || i === currentPage + 2) {
        pages.push("...");
      }
    }

    pages = pages.filter((item, index) => item !== "..." || pages[index - 1] !== "...");

    return pages.map((page, index) =>
      page === "..." ? (
        <span key={`dots-${index}`} className="px-1 text-slate-400 font-bold tracking-widest text-xs">
          ...
        </span>
      ) : (
        <button
          key={page}
          type="button"
          onClick={() => onPageChange(page)}
          className={`flex h-9 w-9 items-center justify-center rounded-xl text-xs font-black transition-all ${
            currentPage === page
              ? "bg-slate-900 text-white shadow-md shadow-slate-900/20 dark:bg-white dark:text-slate-900"
              : "border border-slate-200 bg-white text-slate-600 hover:border-slate-400 hover:text-slate-900 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300 dark:hover:border-slate-500 dark:hover:text-white"
          }`}
        >
          {page}
        </button>
      )
    );
  };

  return (
    <div className="mt-6 flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-slate-100 pt-5 dark:border-slate-800/60">
      <p className="text-xs font-bold text-slate-500 dark:text-slate-400">
        Halaman <span className="font-black text-slate-900 dark:text-white">{currentPage}</span> dari{" "}
        <span className="font-black text-slate-900 dark:text-white">{totalPages}</span>
        {totalItems > 0 && (
          <span className="text-slate-400 ml-1">({totalItems} total visual)</span>
        )}
      </p>

      <div className="flex items-center gap-1.5">
        <button
          type="button"
          disabled={currentPage === 1}
          onClick={() => onPageChange(currentPage - 1)}
          className="flex h-9 items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 text-xs font-bold text-slate-600 transition-all hover:bg-slate-50 disabled:opacity-40 disabled:hover:bg-white dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700"
          aria-label="Previous Page"
        >
          <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2.5">
            <path d="M15 18l-6-6 6-6" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          <span className="hidden sm:inline">Sebelumnya</span>
        </button>

        <div className="flex items-center gap-1">
          {renderPageNumbers()}
        </div>

        <button
          type="button"
          disabled={currentPage === totalPages}
          onClick={() => onPageChange(currentPage + 1)}
          className="flex h-9 items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 text-xs font-bold text-slate-600 transition-all hover:bg-slate-50 disabled:opacity-40 disabled:hover:bg-white dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700"
          aria-label="Next Page"
        >
          <span className="hidden sm:inline">Selanjutnya</span>
          <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2.5">
            <path d="M9 18l6-6-6-6" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>
      </div>
    </div>
  );
}

export function DeleteConfirmModal({ open, onConfirm, onCancel, loading, title, description }) {
  React.useEffect(() => {
    if (!open) return;
    function handleKeyDown(e) {
      if (e.key === "Enter") {
        e.preventDefault();
        if (!loading && onConfirm) onConfirm();
      } else if (e.key === "Escape") {
        e.preventDefault();
        if (!loading && onCancel) onCancel();
      }
    }
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [open, loading, onConfirm, onCancel]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-slate-950/40 backdrop-blur-sm" onClick={onCancel} />
      <div className="relative w-full max-w-md animate-in zoom-in-95 duration-300 rounded-[2rem] border border-slate-200 bg-white p-8 shadow-2xl dark:border-slate-800 dark:bg-slate-900">
        <h3 className="text-xl font-black text-slate-900 dark:text-white uppercase tracking-tight">{title}</h3>
        <p className="mt-4 text-sm leading-relaxed text-slate-500 dark:text-slate-400">{description}</p>
        <div className="mt-8 flex gap-3">
          <button
            onClick={onCancel}
            className="flex-1 h-12 rounded-xl bg-rose-600 text-[10px] font-black uppercase tracking-widest text-white shadow-md shadow-rose-600/20 hover:bg-rose-700 transition-all active:scale-95"
          >
            Batal
          </button>
          <button
            autoFocus
            onClick={onConfirm}
            disabled={loading}
            className="flex-1 h-12 rounded-xl bg-rose-600 text-[10px] font-black uppercase tracking-widest text-white shadow-md shadow-rose-600/20 hover:bg-rose-700 active:scale-95 disabled:opacity-50"
          >
            {loading ? "Menghapus..." : "Ya, Hapus"}
          </button>
        </div>
      </div>
    </div>
  );
}
