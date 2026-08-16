import React from "react";
import { IconPlus } from "./BeritaIcons";
import { ModernSelect } from "./BeritaUI";

export function BeritaFilters({
  query,
  setQuery,
  statusFilter,
  setStatusFilter,
  yearFilter,
  setYearFilter,
  monthFilter,
  setMonthFilter,
  yearOptions,
  monthOptions,
  categoryFilter,
  setCategoryFilter,
  categoryOptions,
  onAddClick,
  filteredCount,
  totalCount,
}) {
  const statusOptions = [
    { key: "all", label: "Semua" },
    { key: "published", label: "Tayang" },
    { key: "draft", label: "Draft" },
  ];

  return (
    <div className="mb-4 sm:mb-6 flex flex-col gap-3.5 sm:gap-5">
      {/* Top Section: Title & Add Button */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-slate-900 dark:text-white">
            Berita & Artikel
          </h1>
          <p className="mt-1 text-xs font-medium text-slate-500 dark:text-slate-400">
            Kelola penerbitan artikel, pengumuman, dan liputan kegiatan instansi.
          </p>
        </div>

        <button
          type="button"
          onClick={onAddClick}
          className="inline-flex items-center justify-center gap-2 h-11 px-5 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-black uppercase tracking-wider shadow-lg shadow-emerald-600/20 transition-all active:scale-95 shrink-0"
        >
          <IconPlus className="h-4 w-4" />
          <span>Tambah Berita</span>
        </button>
      </div>

      {/* Filter Card */}
      <div className="rounded-2xl border border-slate-200 bg-slate-50/70 p-3.5 sm:p-5 dark:border-slate-800 dark:bg-slate-900/50">
        <div className="grid gap-3 sm:gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
          {/* Search */}
          <div className="flex flex-col gap-1">
            <label className="text-[10px] font-black uppercase tracking-wider text-slate-400 ml-1">
              Cari Berita
            </label>
            <div className="relative group">
              <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none text-slate-400 group-focus-within:text-slate-900 dark:group-focus-within:text-white transition-colors">
                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
              <input
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Judul, kategori, ringkasan..."
                className="h-10 w-full rounded-xl border border-slate-200 bg-white pl-9 pr-8 text-xs font-bold text-slate-900 outline-none transition-all focus:border-emerald-600 focus:ring-2 focus:ring-emerald-500/10 dark:border-slate-800 dark:bg-slate-800/50 dark:text-white dark:focus:border-emerald-500"
              />
              {query && (
                <button
                  type="button"
                  onClick={() => setQuery("")}
                  className="absolute inset-y-0 right-2.5 flex items-center text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                >
                  <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              )}
            </div>
          </div>

          {/* Status Pills */}
          <div className="flex flex-col gap-1">
            <label className="text-[10px] font-black uppercase tracking-wider text-slate-400 ml-1">
              Status Tayang
            </label>
            <div className="flex h-10 items-center gap-1 rounded-xl bg-white p-1 border border-slate-200 dark:border-slate-800 dark:bg-slate-800/50">
              {statusOptions.map((opt) => (
                <button
                  key={opt.key}
                  onClick={() => setStatusFilter(opt.key)}
                  className={`flex-1 rounded-lg py-1 text-[10px] font-black uppercase tracking-wider transition-all ${statusFilter === opt.key
                    ? "bg-slate-900 text-white shadow-sm dark:bg-slate-700 dark:text-white"
                    : "text-slate-400 hover:bg-slate-50 hover:text-slate-600 dark:text-slate-500 dark:hover:text-slate-300"
                    }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          <ModernSelect
            label="Kategori"
            name="category"
            value={categoryOptions?.find(o => o.key === categoryFilter)?.label || "Semua Kategori"}
            options={[{ key: "all", label: "Semua Kategori" }, ...(categoryOptions || [])].map(o => o.label)}
            onChange={(e) => {
              const selected = [{ key: "all", label: "Semua Kategori" }, ...(categoryOptions || [])].find(o => o.label === e.target.value);
              setCategoryFilter(selected?.key || "all");
            }}
          />

          <ModernSelect
            label="Tahun"
            name="year"
            value={yearOptions?.find(o => o.key === yearFilter)?.label || "Semua Tahun"}
            options={[{ key: "all", label: "Semua Tahun" }, ...(yearOptions || [])].map(o => o.label)}
            onChange={(e) => {
              const selected = [{ key: "all", label: "Semua Tahun" }, ...(yearOptions || [])].find(o => o.label === e.target.value);
              setYearFilter(selected?.key || "all");
            }}
          />

          <ModernSelect
            label="Bulan"
            name="month"
            value={monthOptions?.find(o => o.key === monthFilter)?.label || "Semua Bulan"}
            options={[{ key: "all", label: "Semua Bulan" }, ...(monthOptions || [])].map(o => o.label)}
            onChange={(e) => {
              const selected = [{ key: "all", label: "Semua Bulan" }, ...(monthOptions || [])].find(o => o.label === e.target.value);
              setMonthFilter(selected?.key || "all");
            }}
          />
        </div>

        <div className="mt-3.5 flex flex-col sm:flex-row items-center justify-between border-t border-slate-100 pt-3 gap-2 sm:gap-0 dark:border-slate-800/50">
          <div className="flex items-center gap-2">
            <div className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse"></div>
            <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
              Ditemukan {filteredCount} dari {totalCount} total berita
            </p>
          </div>

          {(query || statusFilter !== "all" || categoryFilter !== "all" || yearFilter !== "all" || monthFilter !== "all") && (
            <button
              onClick={() => {
                setQuery("");
                setStatusFilter("all");
                setCategoryFilter("all");
                setYearFilter("all");
                setMonthFilter("all");
              }}
              className="text-[10px] font-black uppercase tracking-wider text-rose-500 hover:text-rose-600 transition-colors bg-rose-50 hover:bg-rose-100 px-2.5 py-1 rounded-md dark:bg-rose-950/40 dark:text-rose-400"
            >
              Reset Filter
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
