// src/components/features/admin/AdminLaporanCategoryManager.jsx
"use client";

import React, { useMemo } from "react";
import { useLaporanAdmin } from "@/hooks/useLaporanAdmin";
import LaporanCategoryPanel from "./laporan/LaporanCategoryPanel";
import LaporanUploadPanel from "./laporan/LaporanUploadPanel";
import LaporanDocumentPanel from "./laporan/LaporanDocumentPanel";
import { DeleteConfirmModal, FloatingFeedback } from "./laporan/LaporanUi";

export default function AdminLaporanCategoryManager({
    category: initialCategory,
    categories = [],
}) {
    const mergedCategories = useMemo(() => {
        if (!initialCategory?.slug) return categories;
        const index = categories.findIndex((c) => c.slug === initialCategory.slug);
        if (index !== -1) {
            const copy = [...categories];
            copy[index] = { ...categories[index], ...initialCategory };
            return copy;
        }
        return [initialCategory, ...categories];
    }, [initialCategory, categories]);

    const firstCategory = useMemo(() => {
        if (initialCategory?.slug) return initialCategory;
        return mergedCategories?.[0] || null;
    }, [initialCategory, mergedCategories]);

    const admin = useLaporanAdmin({
        initialCategory: firstCategory,
        categories: mergedCategories,
    });

    return (
        <div className="space-y-5 animate-in fade-in duration-500">
            <FloatingFeedback
                message={admin.actionFeedback?.message || admin.uploadFeedback?.message}
                error={admin.actionFeedback?.type === "error" || admin.uploadFeedback?.type === "error" ? (admin.actionFeedback?.message || admin.uploadFeedback?.message) : ""}
                onClose={() => {}}
            />

            {/* Category Selection Area */}
            <div className="rounded-3xl border border-slate-200/80 bg-white p-5 sm:p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
                <LaporanCategoryPanel
                    categories={categories}
                    activeSlug={admin.activeSlug}
                    activeCategory={admin.activeCategory}
                    loadingSlug={admin.loadingSlug}
                    onSwitchCategory={admin.handleSwitchCategory}
                />
            </div>

            {/* Content Grid: Form (Left) & Document List (Right) */}
            <div className="grid gap-5 xl:grid-cols-12 items-start">
                {/* Left Side: Upload Form */}
                <div className="xl:col-span-5">
                    <LaporanUploadPanel
                        activeCategory={admin.activeCategory}
                        docForm={admin.docForm}
                        selectedFiles={admin.selectedFiles}
                        savingDocument={admin.savingDocument}
                        uploadFeedback={admin.uploadFeedback}
                        setDocForm={admin.setDocForm}
                        setSelectedFiles={admin.setSelectedFiles}
                        handleUpload={admin.handleUpload}
                        resetForm={admin.resetForm}
                    />
                </div>

                {/* Right Side: Document List */}
                <div className="xl:col-span-7">
                    <LaporanDocumentPanel
                        activeCategory={admin.activeCategory}
                        activeSlug={admin.activeSlug}
                        loadingSlug={admin.loadingSlug}
                        paginatedDocuments={admin.paginatedDocuments}
                        filteredDocuments={admin.filteredDocuments}
                        yearOptions={admin.yearOptions}
                        yearFilter={admin.yearFilter}
                        setYearFilter={admin.setYearFilter}
                        searchQuery={admin.searchQuery}
                        setSearchQuery={admin.setSearchQuery}
                        currentPage={admin.currentPage}
                        totalPages={admin.totalPages}
                        totalItems={admin.totalItems}
                        setCurrentPage={admin.setCurrentPage}
                        editingId={admin.editingId}
                        editForm={admin.editForm}
                        editFile={admin.editFile}
                        setEditForm={admin.setEditForm}
                        setEditFile={admin.setEditFile}
                        actionFeedback={admin.actionFeedback}
                        publishingId={admin.publishingId}
                        savingEditId={admin.savingEditId}
                        deletingId={admin.deletingId}
                        onStartEdit={admin.startEdit}
                        onTogglePublish={admin.togglePublish}
                        onDelete={admin.deleteDocument}
                        onSaveEdit={admin.saveEdit}
                        onCancelEdit={admin.cancelEdit}
                        triggerRefresh={admin.triggerRefresh}
                    />
                </div>
            </div>

            <DeleteConfirmModal
                open={admin.showDeleteModal}
                onConfirm={admin.handleConfirmDelete}
                onCancel={admin.handleCancelDelete}
                loading={Boolean(admin.deletingId)}
                title="Hapus Dokumen?"
                description="Dokumen ini akan dihapus permanen dari sistem. Anda harus mengunggah ulang jika ingin menampilkannya kembali."
            />
        </div>
    );
}
