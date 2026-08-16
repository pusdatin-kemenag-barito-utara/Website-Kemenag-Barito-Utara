"use client";

import React from "react";
import { useSlidesManager } from "@/hooks/useSlidesManager";
import { SlideTable } from "./slides/SlideTable";
import { SlideFormModal } from "./slides/SlideFormModal";
import { FloatingFeedback, SlidePagination, DeleteConfirmModal } from "./slides/SlidesUI";

export default function AdminHomepageSlidesManager() {
  const s = useSlidesManager();

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
            </div>

            <button
              type="button"
              onClick={() => s.reload && s.reload()}
              disabled={s.loading}
              className="inline-flex items-center gap-1.5 text-[11px] font-bold text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white transition-colors"
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
                className="h-11 w-full rounded-2xl border border-slate-200 bg-white px-3.5 text-xs font-bold text-slate-700 outline-none transition-all focus:border-emerald-600 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-200"
              >
                <option value="all">Semua Kategori</option>
                {s.categories.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.label || cat.id}
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
                className="h-11 w-full rounded-2xl border border-slate-200 bg-white px-3.5 text-xs font-bold text-slate-700 outline-none transition-all focus:border-emerald-600 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-200"
              >
                <option value="all">Semua Status</option>
                <option value="published">Tayang / Aktif</option>
                <option value="draft">Draft / Nonaktif</option>
              </select>
            </div>
          </div>
        </div>

        {/* Visual Card Grid */}
        <SlideTable
          items={s.paginatedItems}
          loading={s.loading}
          onEdit={s.handleOpenEdit}
          onDelete={s.handleDelete}
          onTogglePublish={s.handleTogglePublish}
          onOpenPreview={s.handleOpenPreview}
          previewModal={s.previewModal}
          onClosePreview={s.handleClosePreview}
          deletingId={s.deletingId}
          togglingId={s.togglingId}
          toNumber={s.toNumber}
          onResetFilter={() => {
            s.setSearchQuery("");
            s.setCategoryFilter("all");
            s.setStatusFilter("all");
            s.handlePageChange(1);
          }}
        />

        {/* Pagination */}
        <div className="mt-8 pt-4 border-t border-slate-100 dark:border-slate-800">
          <SlidePagination
            currentPage={s.currentPage}
            totalPages={s.totalPages}
            onPageChange={s.handlePageChange}
          />
        </div>
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
