"use client";

import React from "react";
import { useGaleriManager } from "@/hooks/useGaleriManager";
import { GaleriTable } from "./galeri/GaleriTable";
import { GaleriFormModal } from "./galeri/GaleriFormModal";
import { FloatingFeedback, GaleriPagination, DeleteConfirmModal } from "./galeri/GaleriUI";

export default function AdminGaleriManager() {
  const g = useGaleriManager();

  return (
    <section className="space-y-6">
      <FloatingFeedback
        message={g.message}
        error={g.error}
        onClose={() => {
          g.setMessage("");
          g.setError("");
        }}
      />

      {/* Header Section */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="flex h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-[10px] font-black uppercase tracking-[0.25em] text-slate-400 dark:text-slate-500">
              Media & Dokumentasi
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-slate-900 dark:text-white">
            Galeri Visual
          </h1>
          <p className="mt-1 text-xs font-medium text-slate-500 dark:text-slate-400">
            Koleksi dokumentasi visual kegiatan resmi instansi yang ditampilkan secara publik.
          </p>
        </div>

        <button
          type="button"
          onClick={g.handleOpenCreate}
          className="group inline-flex items-center justify-center gap-2.5 rounded-2xl bg-emerald-600 px-5 py-3 text-xs font-black uppercase tracking-wider text-white shadow-lg shadow-emerald-600/25 transition-all hover:bg-emerald-700 active:scale-95 shrink-0"
        >
          <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
          </svg>
          <span>Tambah Visual</span>
        </button>
      </div>

      {/* Content Card */}
      <div className="rounded-3xl border border-slate-200/80 bg-white p-5 sm:p-7 shadow-sm dark:border-slate-800 dark:bg-slate-900 space-y-5">
        {/* Filter & Control Bar */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pb-4 border-b border-slate-100 dark:border-slate-800">
          {/* Search Input & Year Selector */}
          <div className="flex flex-1 flex-col sm:flex-row items-stretch sm:items-center gap-2.5">
            <div className="relative flex-1 max-w-md">
              <input
                type="text"
                placeholder="Cari visual atau kegiatan..."
                value={g.searchQuery}
                onChange={(e) => {
                  g.setSearchQuery(e.target.value);
                  g.setCurrentPage(1);
                }}
                className="w-full h-10 rounded-xl border border-slate-200 bg-slate-50/70 pl-9 pr-8 text-xs font-bold text-slate-800 placeholder-slate-400 outline-none transition-all focus:border-emerald-600 focus:bg-white dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200"
              />
              <div className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
                <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <circle cx="11" cy="11" r="8" />
                  <path d="M21 21l-4.35-4.35" />
                </svg>
              </div>
              {g.searchQuery && (
                <button
                  type="button"
                  onClick={() => {
                    g.setSearchQuery("");
                    g.setCurrentPage(1);
                  }}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400 hover:text-slate-600"
                >
                  ✕
                </button>
              )}
            </div>

            {/* Year Selector */}
            {g.availableYears && g.availableYears.length > 0 && (
              <select
                value={g.yearFilter}
                onChange={(e) => {
                  g.setYearFilter(e.target.value);
                  g.setCurrentPage(1);
                }}
                className="h-10 rounded-xl border border-slate-200 bg-slate-50/70 px-3 text-xs font-bold text-slate-700 outline-none focus:border-emerald-600 focus:bg-white dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300"
              >
                <option value="">Semua Tahun</option>
                {g.availableYears.map((yr) => (
                  <option key={yr} value={yr}>
                    Tahun {yr}
                  </option>
                ))}
              </select>
            )}

            <button
              type="button"
              onClick={g.triggerRefresh}
              title="Muat Ulang"
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-slate-200 bg-slate-50/70 text-slate-500 hover:bg-slate-100 hover:text-slate-900 transition dark:border-slate-700 dark:bg-slate-800 dark:text-slate-400 dark:hover:bg-slate-700 dark:hover:text-white"
            >
              <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2.5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
            </button>
          </div>

          {/* Stats Badge */}
          <div className="flex items-center gap-2 shrink-0">
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300 border border-emerald-200/60 dark:border-emerald-800/40 text-[10px] font-black uppercase tracking-wider">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
              {g.totalItems} Visual Dokumentasi
            </span>
          </div>
        </div>

        {/* Gallery Grid */}
        <GaleriTable
          items={g.paginatedItems}
          loading={g.loading}
          onEdit={g.handleOpenEdit}
          onDelete={g.handleDelete}
          deletingId={g.deletingId}
        />

        {/* Pagination Bar */}
        <GaleriPagination
          currentPage={g.currentPage}
          totalPages={g.totalPages}
          totalItems={g.totalItems}
          onPageChange={g.setCurrentPage}
        />
      </div>

      <GaleriFormModal
        open={g.openForm}
        editingId={g.editingId}
        form={g.form}
        imagePreview={g.imagePreview}
        saving={g.saving}
        uploadingImage={g.uploadingImage}
        isDraggingImage={g.isDraggingImage}
        onClose={g.handleCloseForm}
        onChange={g.handleChange}
        onFileChange={g.handleImageFileChange}
        onImageDragOver={g.handleImageDragOver}
        onImageDragLeave={g.handleImageDragLeave}
        onImageDrop={g.handleImageDrop}
        onRemoveImage={g.handleRemoveImage}
        onClearAllImages={g.handleClearAllImages}
        onSave={g.handleSave}
      />

      <DeleteConfirmModal
        open={g.showDeleteConfirm}
        onConfirm={g.handleConfirmDelete}
        onCancel={g.handleCancelDelete}
        loading={Boolean(g.deletingId)}
        title="Hapus Visual Galeri?"
        description="Data ini akan dihapus permanen. Pastikan Anda memiliki cadangan jika ingin menampilkannya kembali."
      />
    </section>
  );
}
