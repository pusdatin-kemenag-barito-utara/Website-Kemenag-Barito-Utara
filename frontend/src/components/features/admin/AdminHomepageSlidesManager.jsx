"use client";

import React from "react";
import { useSlidesManager } from "@/hooks/useSlidesManager";
import { SlideTable } from "./slides/SlideTable";
import { SlideFormModal } from "./slides/SlideFormModal";
import { FloatingFeedback, SlidePagination, DeleteConfirmModal } from "./slides/SlidesUI";

export default function AdminHomepageSlidesManager() {
  const s = useSlidesManager();
  const hasActiveFilters = Boolean(
    s.searchQuery.trim() || s.categoryFilter !== "all" || s.statusFilter !== "all"
  );

  const handleResetFilters = () => {
    s.setSearchQuery("");
    s.setCategoryFilter("all");
    s.setStatusFilter("all");
    s.handlePageChange(1);
  };

  return (
    <section className="space-y-6 sm:space-y-8">
      <FloatingFeedback
        message={s.message}
        error={s.error}
        onClose={() => {
          s.setMessage && s.setMessage("");
          s.setError && s.setError("");
        }}
      />

      {/* Header Section */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-slate-900 dark:text-white">
            Infografis & Slider
          </h1>
          <p className="mt-1 text-xs sm:text-sm font-medium text-slate-500 dark:text-slate-400">
            Manajemen visual banner dan infografis keagamaan halaman depan website.
          </p>
        </div>

        <button
          type="button"
          onClick={s.handleOpenCreate}
          className="group inline-flex items-center justify-center gap-2 rounded-2xl bg-emerald-600 px-5 py-3.5 text-xs font-black uppercase tracking-wider text-white shadow-lg shadow-emerald-600/20 transition-all hover:bg-emerald-700 hover:shadow-xl hover:shadow-emerald-600/30 active:scale-95 shrink-0"
        >
          <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
          </svg>
          <span>Tambah Infografis</span>
        </button>
      </div>

      {/* Content Container */}
      <div className="rounded-3xl border border-slate-200/80 bg-slate-50/60 p-4 sm:p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900/40">
        {/* Status Bar & Filter Controls */}
        <div className="mb-6 space-y-4 border-b border-slate-200/80 pb-6 dark:border-slate-800">
          {/* Realtime Live Counts */}
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-1.5 rounded-xl bg-slate-200/80 px-3 py-1.5 text-[10px] font-black uppercase tracking-wider text-slate-700 dark:bg-slate-800 dark:text-slate-300">
                <span className="h-2 w-2 rounded-full bg-slate-500"></span>
                Total {s.totalItems} Infografis
              </span>
              <span className="inline-flex items-center gap-1.5 rounded-xl bg-emerald-50 border border-emerald-200 px-3 py-1.5 text-[10px] font-black uppercase tracking-wider text-emerald-700 dark:bg-emerald-950/40 dark:border-emerald-900/50 dark:text-emerald-300">
                <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse"></span>
                {s.totalPublished} Tayang
              </span>
              {s.totalDraft > 0 && (
                <span className="inline-flex items-center gap-1.5 rounded-xl bg-amber-50 border border-amber-200 px-3 py-1.5 text-[10px] font-black uppercase tracking-wider text-amber-700 dark:bg-amber-950/40 dark:border-amber-900/50 dark:text-amber-300">
                  <span className="h-2 w-2 rounded-full bg-amber-500"></span>
                  {s.totalDraft} Draft
                </span>
              )}
              {hasActiveFilters && (
                <span className="inline-flex items-center gap-1.5 rounded-xl bg-sky-50 border border-sky-200 px-3 py-1.5 text-[10px] font-bold text-sky-700 dark:bg-sky-950/40 dark:border-sky-900/50 dark:text-sky-300">
                  Menampilkan {s.filteredItems.length} hasil
                </span>
              )}
            </div>

            <div className="flex items-center gap-3">
              {hasActiveFilters && (
                <button
                  type="button"
                  onClick={handleResetFilters}
                  className="text-[11px] font-bold text-rose-600 hover:text-rose-700 dark:text-rose-400 transition-colors"
                >
                  Reset Filter
                </button>
              )}

              <button
                type="button"
                onClick={() => s.reload && s.reload()}
                disabled={s.loading}
                className="inline-flex items-center gap-1.5 text-[11px] font-bold text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white transition-colors disabled:opacity-50"
                title="Muat ulang data"
              >
                <svg
                  className={`h-3.5 w-3.5 ${s.loading ? "animate-spin" : ""}`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  strokeWidth="2.5"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                  />
                </svg>
                <span>Refresh</span>
              </button>
            </div>
          </div>

          {/* Quick Category Pills */}
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => {
                s.setCategoryFilter("all");
                s.handlePageChange(1);
              }}
              className={`inline-flex items-center gap-2 rounded-xl px-3.5 py-2 text-[11px] font-bold transition-all ${
                s.categoryFilter === "all"
                  ? "bg-slate-900 text-white shadow-sm dark:bg-white dark:text-slate-900"
                  : "bg-white text-slate-600 border border-slate-200 hover:border-slate-400 dark:bg-slate-900 dark:border-slate-800 dark:text-slate-300"
              }`}
            >
              <span>Semua</span>
              <span
                className={`rounded-md px-1.5 py-0.5 text-[10px] font-black ${
                  s.categoryFilter === "all"
                    ? "bg-white/20 text-white dark:bg-slate-900/15 dark:text-slate-900"
                    : "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400"
                }`}
              >
                {s.categoryCounts?.all || 0}
              </span>
            </button>

            {s.categories.map((cat) => {
              const isSelected = s.categoryFilter === cat.id;
              const count = s.categoryCounts?.[cat.id] || 0;
              return (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => {
                    s.setCategoryFilter(cat.id);
                    s.handlePageChange(1);
                  }}
                  className={`inline-flex items-center gap-2 rounded-xl px-3.5 py-2 text-[11px] font-bold transition-all ${
                    isSelected
                      ? "bg-emerald-600 text-white shadow-sm shadow-emerald-600/20"
                      : "bg-white text-slate-600 border border-slate-200 hover:border-emerald-400 dark:bg-slate-900 dark:border-slate-800 dark:text-slate-300"
                  }`}
                >
                  <span
                    className={`h-2 w-2 rounded-full ${
                      isSelected ? "bg-white" : cat.color || "bg-emerald-500"
                    }`}
                  />
                  <span>{cat.shortLabel || cat.label || cat.id}</span>
                  <span
                    className={`rounded-md px-1.5 py-0.5 text-[10px] font-black ${
                      isSelected
                        ? "bg-white/20 text-white"
                        : "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400"
                    }`}
                  >
                    {count}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Search and Filters Bar */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {/* Search Input */}
            <div className="relative lg:col-span-2">
              <input
                type="text"
                value={s.searchQuery}
                onChange={(e) => {
                  s.setSearchQuery(e.target.value);
                  s.handlePageChange(1);
                }}
                placeholder="Cari judul atau keterangan infografis..."
                className="h-11 w-full rounded-2xl border border-slate-200 bg-white pl-10 pr-10 text-xs font-semibold text-slate-900 outline-none transition-all placeholder:text-slate-400 focus:border-emerald-600 focus:ring-4 focus:ring-emerald-500/10 dark:border-slate-800 dark:bg-slate-900 dark:text-white dark:focus:border-emerald-500"
              />
              <svg
                className="absolute left-3.5 top-3.5 h-4 w-4 text-slate-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                strokeWidth="2.5"
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              {s.searchQuery && (
                <button
                  type="button"
                  onClick={() => {
                    s.setSearchQuery("");
                    s.handlePageChange(1);
                  }}
                  className="absolute right-3.5 top-3.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                  title="Hapus pencarian"
                >
                  <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              )}
            </div>

            {/* Category Dropdown */}
            <div>
              <select
                value={s.categoryFilter}
                onChange={(e) => {
                  s.setCategoryFilter(e.target.value);
                  s.handlePageChange(1);
                }}
                aria-label="Filter kategori"
                className="h-11 w-full rounded-2xl border border-slate-200 bg-white px-3.5 text-xs font-bold text-slate-700 outline-none transition-all focus:border-emerald-600 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-200"
              >
                <option value="all">Semua Kategori ({s.categoryCounts?.all || 0})</option>
                {s.categories.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.label || cat.id} ({s.categoryCounts?.[cat.id] || 0})
                  </option>
                ))}
              </select>
            </div>

            {/* Status Dropdown */}
            <div>
              <select
                value={s.statusFilter}
                onChange={(e) => {
                  s.setStatusFilter(e.target.value);
                  s.handlePageChange(1);
                }}
                aria-label="Filter status tayang"
                className="h-11 w-full rounded-2xl border border-slate-200 bg-white px-3.5 text-xs font-bold text-slate-700 outline-none transition-all focus:border-emerald-600 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-200"
              >
                <option value="all">Semua Status</option>
                <option value="published">Tayang / Aktif ({s.totalPublished})</option>
                <option value="draft">Draft / Nonaktif ({s.totalDraft})</option>
              </select>
            </div>
          </div>
        </div>

        {/* Visual Card Grid */}
        <SlideTable
          items={s.paginatedItems}
          filteredCount={s.filteredItems.length}
          loading={s.loading}
          onEdit={s.handleOpenEdit}
          onDelete={s.handleDelete}
          onTogglePublish={s.handleTogglePublish}
          onMoveOrder={s.handleQuickMoveOrder}
          onOpenPreview={s.handleOpenPreview}
          previewModal={s.previewModal}
          onClosePreview={s.handleClosePreview}
          deletingId={s.deletingId}
          togglingId={s.togglingId}
          reorderingId={s.reorderingId}
          toNumber={s.toNumber}
          onResetFilter={hasActiveFilters ? handleResetFilters : undefined}
        />

        {/* Pagination */}
        <SlidePagination
          currentPage={s.currentPage}
          totalPages={s.totalPages}
          onPageChange={s.handlePageChange}
        />
      </div>

      {/* Form Modal */}
      <SlideFormModal
        open={s.openForm}
        editingId={s.editingId}
        form={s.form}
        categories={s.categories}
        imagePreview={s.imagePreview}
        saving={s.saving}
        uploadingImage={s.uploadingImage}
        isDraggingImage={s.isDraggingImage}
        onClose={s.handleCloseForm}
        onChange={s.handleChange}
        onFileChange={s.handleImageFileChange}
        onRemoveSelectedImage={s.handleRemoveSelectedImage}
        onImageDragOver={s.handleImageDragOver}
        onImageDragLeave={s.handleImageDragLeave}
        onImageDrop={s.handleImageDrop}
        onSave={s.handleSave}
      />

      {/* Delete Confirmation Modal */}
      <DeleteConfirmModal
        open={s.showDeleteConfirm}
        onConfirm={s.handleConfirmDelete}
        onCancel={s.handleCancelDelete}
        loading={Boolean(s.deletingId)}
        title="Hapus Infografis?"
        description="Infografis ini akan dihapus permanen dari sistem. Anda harus mengunggah ulang jika ingin menampilkannya kembali."
      />
    </section>
  );
}
