// src/components/admin/laporan/LaporanDocumentPanel.jsx
"use client";

import React, { useState } from "react";
import { formatBytes } from "@/lib/laporan-admin";
import SopBidangSelect from "./SopBidangSelect";

export default function LaporanDocumentPanel({
    activeCategory,
    paginatedDocuments = [],
    yearOptions = [],
    yearFilter,
    setYearFilter,
    searchQuery = "",
    setSearchQuery,
    currentPage,
    totalPages,
    totalItems = 0,
    setCurrentPage,
    loadingSlug,
    activeSlug,
    editingId,
    editForm,
    editFile,
    setEditForm,
    setEditFile,
    publishingId,
    savingEditId,
    deletingId,
    onStartEdit,
    onTogglePublish,
    onDelete,
    onSaveEdit,
    onCancelEdit,
    triggerRefresh,
}) {
    const isLoading = Boolean(activeSlug && loadingSlug === activeSlug);
    const [isDraggingEdit, setIsDraggingEdit] = useState(false);

    const handleDragOverEdit = (e) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDraggingEdit(true);
    };

    const handleDragLeaveEdit = (e) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDraggingEdit(false);
    };

    const handleDropEdit = (e) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDraggingEdit(false);
        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
            const file = e.dataTransfer.files[0];
            if (file.type === "application/pdf" || file.name.endsWith(".pdf")) {
                setEditFile(file);
            } else {
                alert("Hanya file PDF yang diizinkan.");
            }
        }
    };

    return (
        <section
            aria-labelledby="laporan-dokumen-title"
            aria-busy={isLoading}
            className="flex flex-col h-full rounded-3xl bg-white p-5 sm:p-7 border border-slate-200/80 shadow-sm dark:border-slate-800 dark:bg-slate-900"
        >
            {/* Header */}
            <div className="mb-5 pb-4 border-b border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                    <h2
                        id="laporan-dokumen-title"
                        className="text-base font-black tracking-tight text-slate-900 dark:text-white uppercase"
                    >
                        Arsip Dokumen Terverifikasi
                    </h2>
                    <p className="text-[10px] font-black uppercase tracking-wider text-slate-400">
                        {totalItems} Dokumen Tersimpan di {activeCategory?.title || "Kategori Terpilih"}
                    </p>
                </div>

                <div className="flex items-center gap-2">
                    {triggerRefresh && (
                        <button
                            type="button"
                            onClick={triggerRefresh}
                            className="flex h-9 w-9 items-center justify-center rounded-xl bg-slate-100 text-slate-600 hover:bg-slate-200 hover:text-slate-900 dark:bg-slate-800 dark:text-slate-400 dark:hover:bg-slate-700 dark:hover:text-white transition"
                            title="Segarkan Data"
                        >
                            <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2.5">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                            </svg>
                        </button>
                    )}
                </div>
            </div>

            {/* Filter & Search Bar */}
            <div className="mb-4 flex flex-col sm:flex-row gap-2.5">
                <div className="relative flex-1">
                    <input
                        type="text"
                        placeholder="Cari judul dokumen atau keterangan..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery && setSearchQuery(e.target.value)}
                        className="w-full h-10 rounded-xl border border-slate-200 bg-slate-50/60 pl-9 pr-8 text-xs font-bold text-slate-800 placeholder-slate-400 outline-none transition focus:border-emerald-600 focus:bg-white dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200"
                    />
                    <div className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
                        <svg viewBox="0 0 24 24" className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth="3">
                            <circle cx="11" cy="11" r="8" />
                            <path d="M21 21l-4.35-4.35" />
                        </svg>
                    </div>
                    {searchQuery && (
                        <button
                            type="button"
                            onClick={() => setSearchQuery && setSearchQuery("")}
                            className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                        >
                            ✕
                        </button>
                    )}
                </div>

                <div className="relative sm:w-40 shrink-0">
                    <select
                        id="laporan-year-filter"
                        value={yearFilter}
                        onChange={(e) => setYearFilter(e.target.value)}
                        className="w-full h-10 appearance-none rounded-xl border border-slate-200 bg-slate-50/60 px-3 pr-8 text-xs font-bold text-slate-800 outline-none transition focus:border-emerald-600 focus:bg-white dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200"
                    >
                        <option value="">Semua Tahun</option>
                        {yearOptions.map((year) => (
                            <option key={year} value={String(year)}>
                                Tahun {year}
                            </option>
                        ))}
                    </select>
                    <div className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-slate-400">
                        <svg viewBox="0 0 24 24" className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth="2.5">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                        </svg>
                    </div>
                </div>
            </div>

            {/* Document List */}
            {isLoading ? (
                <div className="flex flex-col items-center justify-center py-16 text-center">
                    <div className="h-8 w-8 animate-spin rounded-full border-3 border-emerald-600 border-t-transparent" />
                    <p className="mt-4 text-xs font-black uppercase tracking-wider text-slate-400">Memuat Dokumen...</p>
                </div>
            ) : paginatedDocuments.length > 0 ? (
                <div className="flex-1 space-y-2.5">
                    {paginatedDocuments.map((doc, index) => {
                        const isEditing = editingId === doc.id;
                        const isPublishing = publishingId === doc.id;
                        const isSavingEdit = savingEditId === doc.id;
                        const isDeleting = deletingId === doc.id;
                        const isBusy = isPublishing || isSavingEdit || isDeleting;

                        return (
                            <article
                                key={doc.id}
                                className={`group relative overflow-hidden rounded-2xl border transition-all duration-200 ${isEditing
                                    ? "border-emerald-500 bg-emerald-50/20 shadow-md dark:border-emerald-500 dark:bg-emerald-950/20"
                                    : "border-slate-200/80 bg-slate-50/40 hover:bg-white hover:border-emerald-300 hover:shadow-md dark:border-slate-800 dark:bg-slate-800/40 dark:hover:bg-slate-800"
                                    }`}
                            >
                                {!isEditing ? (
                                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 sm:p-5">
                                        {/* Left Side: Number & Info */}
                                        <div className="flex items-start gap-3.5 min-w-0 flex-1">
                                            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-rose-50 text-rose-600 border border-rose-100 dark:bg-rose-950/40 dark:border-rose-900/40 dark:text-rose-400">
                                                <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2">
                                                    <path strokeLinecap="round" strokeLinejoin="round" d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                                                </svg>
                                            </div>

                                            <div className="min-w-0 flex-1">
                                                <div className="flex flex-wrap items-center gap-2 mb-1">
                                                    {doc.year && (
                                                        <span className="rounded-md bg-slate-200/80 px-2 py-0.5 text-[9px] font-black uppercase tracking-wider text-slate-700 dark:bg-slate-700 dark:text-slate-300">
                                                            Th. {doc.year}
                                                        </span>
                                                    )}
                                                    {doc.file_size && (
                                                        <span className="text-[10px] font-bold text-slate-400">
                                                            {formatBytes(doc.file_size)}
                                                        </span>
                                                    )}
                                                    <span className={`inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-[9px] font-black uppercase tracking-wider ${doc.is_published
                                                        ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-400"
                                                        : "bg-amber-100 text-amber-700 dark:bg-amber-950/60 dark:text-amber-400"
                                                        }`}>
                                                        {doc.is_published ? "● Publik" : "○ Draft"}
                                                    </span>
                                                </div>

                                                <h3 className="text-xs sm:text-sm font-black text-slate-900 dark:text-white leading-snug line-clamp-2">
                                                    {doc.title}
                                                </h3>

                                                {doc.description && (
                                                    <p className="mt-0.5 text-[11px] font-medium text-emerald-700 dark:text-emerald-400 line-clamp-1">
                                                        {doc.description}
                                                    </p>
                                                )}

                                                <div className="flex items-center gap-3 mt-1.5 text-[10px] text-slate-400">
                                                    <span className="flex items-center gap-1">
                                                        👁️ {doc.view_count || 0}
                                                    </span>
                                                    <span className="flex items-center gap-1">
                                                        ⬇️ {doc.download_count || 0}
                                                    </span>
                                                    {doc.created_at && (
                                                        <span>
                                                            📅 {doc.created_at}
                                                        </span>
                                                    )}
                                                </div>
                                            </div>
                                        </div>

                                        {/* Right Side: Action Buttons */}
                                        <div className="flex items-center gap-1.5 self-end sm:self-center shrink-0 pt-2 sm:pt-0 border-t border-slate-100 sm:border-0 w-full sm:w-auto justify-end">
                                            {/* Preview Link */}
                                            <a
                                                href={`/api/laporan/view/${doc.id}/${encodeURIComponent(doc.file_name || 'dokumen.pdf')}`}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                title="Lihat Berkas PDF"
                                                className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-50 text-blue-600 hover:bg-blue-600 hover:text-white transition shadow-sm"
                                            >
                                                <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2.5">
                                                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                                    <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                                </svg>
                                            </a>

                                            {/* Edit Button */}
                                            <button
                                                type="button"
                                                title="Edit Dokumen"
                                                onClick={() => onStartEdit(doc)}
                                                disabled={isBusy}
                                                className="flex h-9 w-9 items-center justify-center rounded-xl bg-slate-100 text-slate-700 hover:bg-slate-900 hover:text-white dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-white dark:hover:text-slate-900 transition shadow-sm disabled:opacity-50"
                                            >
                                                <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2.5">
                                                    <path strokeLinecap="round" strokeLinejoin="round" d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7M18.5 2.5a2.121 2.121 0 113 3L12 15l-4 1 1-4 9.5-9.5z" />
                                                </svg>
                                            </button>

                                            {/* Toggle Publish */}
                                            <button
                                                type="button"
                                                title={doc.is_published ? "Tarik dari Publik" : "Publikasikan"}
                                                onClick={() => onTogglePublish(doc)}
                                                disabled={isBusy}
                                                className={`flex h-9 w-9 items-center justify-center rounded-xl transition shadow-sm disabled:opacity-50 ${doc.is_published
                                                    ? "bg-amber-50 text-amber-600 hover:bg-amber-600 hover:text-white"
                                                    : "bg-emerald-50 text-emerald-600 hover:bg-emerald-600 hover:text-white"
                                                    }`}
                                            >
                                                {isPublishing ? (
                                                    <div className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-current border-t-transparent" />
                                                ) : doc.is_published ? (
                                                    <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2.5">
                                                        <path strokeLinecap="round" strokeLinejoin="round" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                                                    </svg>
                                                ) : (
                                                    <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2.5">
                                                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                                                    </svg>
                                                )}
                                            </button>

                                            {/* Delete Button */}
                                            <button
                                                type="button"
                                                title="Hapus Dokumen"
                                                onClick={() => onDelete(doc.id)}
                                                disabled={isBusy}
                                                className="flex h-9 w-9 items-center justify-center rounded-xl bg-rose-50 text-rose-600 hover:bg-rose-600 hover:text-white transition shadow-sm disabled:opacity-50"
                                            >
                                                {isDeleting ? (
                                                    <div className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-current border-t-transparent" />
                                                ) : (
                                                    <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2.5">
                                                        <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                                    </svg>
                                                )}
                                            </button>
                                        </div>
                                    </div>
                                ) : (
                                    /* Inline Edit Mode */
                                    <div className="p-4 sm:p-5 space-y-3.5 bg-white dark:bg-slate-900">
                                        <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
                                            <span className="text-[10px] font-black uppercase tracking-wider text-emerald-600">
                                                Edit Data Dokumen
                                            </span>
                                            <button
                                                type="button"
                                                onClick={onCancelEdit}
                                                className="text-slate-400 hover:text-slate-600 text-xs font-bold"
                                            >
                                                ✕
                                            </button>
                                        </div>

                                        {activeCategory?.slug === "sop" && (
                                            <SopBidangSelect
                                                label="SOP Bidang"
                                                value={editForm.description}
                                                onChange={(val) => setEditForm((p) => ({ ...p, description: val }))}
                                            />
                                        )}

                                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                                            <div className="sm:col-span-2 space-y-1">
                                                <label className="text-[10px] font-black uppercase tracking-wider text-slate-700 dark:text-slate-300">
                                                    Judul Dokumen
                                                </label>
                                                <input
                                                    type="text"
                                                    value={editForm.title}
                                                    onChange={(e) => setEditForm((p) => ({ ...p, title: e.target.value }))}
                                                    className="w-full h-10 rounded-xl border border-slate-200 bg-slate-50/60 px-3 text-xs font-bold text-slate-800 outline-none focus:border-emerald-600 focus:bg-white dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200"
                                                />
                                            </div>

                                            <div className="space-y-1">
                                                <label className="text-[10px] font-black uppercase tracking-wider text-slate-700 dark:text-slate-300">
                                                    Tahun
                                                </label>
                                                <input
                                                    type="number"
                                                    value={editForm.year || ""}
                                                    onChange={(e) => setEditForm((p) => ({ ...p, year: e.target.value }))}
                                                    className="w-full h-10 rounded-xl border border-slate-200 bg-slate-50/60 px-3 text-xs font-bold text-slate-800 outline-none focus:border-emerald-600 focus:bg-white dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200"
                                                />
                                            </div>
                                        </div>

                                        {/* Ganti File PDF (Opsional) */}
                                        <div className="space-y-1">
                                            <label className="text-[10px] font-black uppercase tracking-wider text-slate-700 dark:text-slate-300">
                                                Ganti Berkas PDF (Opsional)
                                            </label>
                                            <div
                                                className={`relative rounded-xl border-2 border-dashed p-3 transition text-center ${isDraggingEdit
                                                    ? "border-emerald-500 bg-emerald-50/50"
                                                    : "border-slate-200 bg-slate-50/40"
                                                    }`}
                                                onDragOver={handleDragOverEdit}
                                                onDragLeave={handleDragLeaveEdit}
                                                onDrop={handleDropEdit}
                                            >
                                                <input
                                                    id={`pdf-edit-input-${doc.id}`}
                                                    type="file"
                                                    accept="application/pdf,.pdf"
                                                    onChange={(e) => setEditFile(e.target.files?.[0] || null)}
                                                    className="absolute inset-0 h-full w-full cursor-pointer opacity-0"
                                                />
                                                <p className="text-xs font-bold text-slate-600 dark:text-slate-300">
                                                    {editFile ? `File baru: ${editFile.name}` : "Klik / Drag untuk ganti berkas PDF"}
                                                </p>
                                            </div>
                                        </div>

                                        {/* Status Publikasi */}
                                        <label className="flex cursor-pointer items-center gap-2 text-xs font-bold text-slate-700 dark:text-slate-300">
                                            <input
                                                type="checkbox"
                                                checked={Boolean(editForm.is_published)}
                                                onChange={(e) => setEditForm((p) => ({ ...p, is_published: e.target.checked }))}
                                                className="h-4 w-4 rounded text-emerald-600 focus:ring-emerald-500 accent-emerald-600"
                                            />
                                            <span>Publikasikan ke Portal Website</span>
                                        </label>

                                        {/* Action Buttons */}
                                        <div className="flex items-center gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
                                            <button
                                                type="button"
                                                onClick={() => onSaveEdit(doc.id)}
                                                disabled={isSavingEdit}
                                                className="flex-1 h-10 rounded-xl bg-emerald-600 text-xs font-black uppercase tracking-wider text-white shadow-md hover:bg-emerald-700 transition active:scale-95 disabled:opacity-50"
                                            >
                                                {isSavingEdit ? "Menyimpan..." : "Simpan Perubahan"}
                                            </button>
                                            <button
                                                type="button"
                                                onClick={onCancelEdit}
                                                disabled={isSavingEdit}
                                                className="h-10 rounded-xl bg-rose-600 px-5 text-xs font-black uppercase tracking-wider text-white shadow-md shadow-rose-600/20 hover:bg-rose-700 transition active:scale-95 disabled:opacity-50"
                                            >
                                                Batal
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </article>
                        );
                    })}

                    {/* Pagination */}
                    {totalPages > 1 && (
                        <div className="flex items-center justify-between pt-4 mt-2 border-t border-slate-100 dark:border-slate-800 text-xs font-bold text-slate-500">
                            <span>Halaman {currentPage} dari {totalPages}</span>
                            <div className="flex items-center gap-1.5">
                                <button
                                    type="button"
                                    onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                                    disabled={currentPage <= 1}
                                    className="h-8 rounded-lg border border-slate-200 px-3 hover:bg-slate-100 disabled:opacity-40 transition dark:border-slate-700 dark:hover:bg-slate-800"
                                >
                                    Sebelumnya
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                                    disabled={currentPage >= totalPages}
                                    className="h-8 rounded-lg border border-slate-200 px-3 hover:bg-slate-100 disabled:opacity-40 transition dark:border-slate-700 dark:hover:bg-slate-800"
                                >
                                    Selanjutnya
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            ) : (
                <div className="flex flex-col items-center justify-center rounded-2xl border border-slate-100 bg-slate-50/50 py-16 text-center dark:border-slate-800 dark:bg-slate-800/20">
                    <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-slate-100 text-slate-400 mb-3 dark:bg-slate-800">
                        <svg viewBox="0 0 24 24" className="h-8 w-8" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                    </div>
                    <h3 className="text-sm font-black text-slate-800 dark:text-white uppercase">
                        {searchQuery ? "Tidak ada dokumen yang cocok" : "Belum Ada Dokumen"}
                    </h3>
                    <p className="mt-1 text-xs text-slate-400 max-w-xs">
                        {searchQuery ? "Coba gunakan kata kunci pencarian yang lain." : "Silakan unggah dokumen baru melalui formulir di sebelah kiri."}
                    </p>
                </div>
            )}
        </section>
    );
}
