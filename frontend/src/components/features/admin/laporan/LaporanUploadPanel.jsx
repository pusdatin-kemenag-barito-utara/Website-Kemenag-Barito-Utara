// src/components/features/admin/laporan/LaporanUploadPanel.jsx
"use client";

import React, { useState } from "react";
import { Button, Feedback, Input } from "./LaporanUi";
import { formatBytes } from "@/lib/laporan-admin";
import SopBidangSelect from "./SopBidangSelect";

export default function LaporanUploadPanel({
    activeCategory,
    docForm,
    setDocForm,
    selectedFiles = [],
    setSelectedFiles,
    savingDocument,
    uploadFeedback,
    handleUpload,
    resetForm,
}) {
    const currentYear = new Date().getFullYear();
    const [isDragging, setIsDragging] = useState(false);

    const handleDragOver = (e) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(true);
    };

    const handleDragLeave = (e) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(false);
    };

    const handleDrop = (e) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(false);
        if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
            const files = Array.from(e.dataTransfer.files).filter(
                (file) => file.type === "application/pdf" || file.name.endsWith(".pdf")
            );
            if (files.length > 0) {
                setSelectedFiles((prev) => [...(Array.isArray(prev) ? prev : []), ...files]);
            } else {
                alert("Hanya file PDF yang diizinkan.");
            }
        }
    };

    const handleFileChange = (e) => {
        const files = Array.from(e.target.files || []).filter(
            (file) => file.type === "application/pdf" || file.name.endsWith(".pdf")
        );
        if (files.length > 0) {
            setSelectedFiles((prev) => [...(Array.isArray(prev) ? prev : []), ...files]);
        }
        e.target.value = "";
    };

    const handleRemoveFile = (indexToRemove) => {
        setSelectedFiles((prev) => prev.filter((_, idx) => idx !== indexToRemove));
    };

    return (
        <section
            className="flex flex-col h-full rounded-3xl bg-white p-5 sm:p-7 border border-slate-200/80 shadow-sm dark:border-slate-800 dark:bg-slate-900"
            aria-labelledby="laporan-upload-title"
            aria-busy={savingDocument}
        >
            {/* Header */}
            <div className="mb-5 pb-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-emerald-600 text-white shadow-md shadow-emerald-600/20">
                        <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2.5">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                        </svg>
                    </div>
                    <div>
                        <h2
                            id="laporan-upload-title"
                            className="text-base font-black tracking-tight text-slate-900 dark:text-white uppercase"
                        >
                            Unggah Dokumen Baru
                        </h2>
                        <p className="text-[10px] font-black uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
                            {activeCategory?.title || "Pilih Kategori"}
                        </p>
                    </div>
                </div>

                <span className="hidden sm:inline-flex rounded-full bg-slate-100 px-3 py-1 text-[10px] font-black uppercase tracking-wider text-slate-500 dark:bg-slate-800 dark:text-slate-400">
                    PDF Max 50MB
                </span>
            </div>

            <form className="flex flex-col flex-1 space-y-4" onSubmit={handleUpload} noValidate>
                {/* SOP Bidang Selector */}
                {activeCategory?.slug === "sop" && (
                    <SopBidangSelect
                        value={docForm.description}
                        onChange={(val) => setDocForm((prev) => ({ ...prev, description: val }))}
                    />
                )}

                {/* Judul Dokumen */}
                <div className="space-y-1.5">
                    <label className="text-[10px] font-black uppercase tracking-wider text-slate-700 dark:text-slate-300">
                        Judul Dokumen {selectedFiles.length <= 1 && <span className="text-rose-500">*</span>}
                    </label>
                    <input
                        type="text"
                        placeholder={selectedFiles.length > 1 ? "Opsional (otomatis sesuai nama file)" : "Contoh: SOP Pelayanan Nikah..."}
                        value={docForm.title}
                        onChange={(e) => setDocForm((prev) => ({ ...prev, title: e.target.value }))}
                        className="w-full h-11 rounded-xl border border-slate-200 bg-slate-50/60 px-3.5 text-xs font-bold text-slate-800 placeholder-slate-400 outline-none transition-all focus:border-emerald-600 focus:bg-white dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200"
                    />
                    <p className="text-[10px] text-slate-400">
                        Jika mengunggah banyak file sekaligus, judul dapat dikosongkan (akan otomatis menggunakan nama file asli).
                    </p>
                </div>

                {/* Tahun & Keterangan */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="space-y-1.5">
                        <label className="text-[10px] font-black uppercase tracking-wider text-slate-700 dark:text-slate-300">
                            Tahun Dokumen
                        </label>
                        <input
                            type="number"
                            min="2000"
                            max="2100"
                            placeholder={String(currentYear)}
                            value={docForm.year || ""}
                            onChange={(e) => setDocForm((prev) => ({ ...prev, year: e.target.value }))}
                            className="w-full h-11 rounded-xl border border-slate-200 bg-slate-50/60 px-3.5 text-xs font-bold text-slate-800 placeholder-slate-400 outline-none transition-all focus:border-emerald-600 focus:bg-white dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200"
                        />
                    </div>

                    {activeCategory?.slug !== "sop" && (
                        <div className="space-y-1.5">
                            <label className="text-[10px] font-black uppercase tracking-wider text-slate-700 dark:text-slate-300">
                                Keterangan Singkat
                            </label>
                            <input
                                type="text"
                                placeholder="Opsional..."
                                value={docForm.description || ""}
                                onChange={(e) => setDocForm((prev) => ({ ...prev, description: e.target.value }))}
                                className="w-full h-11 rounded-xl border border-slate-200 bg-slate-50/60 px-3.5 text-xs font-bold text-slate-800 placeholder-slate-400 outline-none transition-all focus:border-emerald-600 focus:bg-white dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200"
                            />
                        </div>
                    )}
                </div>

                {/* PDF Dropzone */}
                <div className="space-y-1.5">
                    <div className="flex items-center justify-between">
                        <label className="text-[10px] font-black uppercase tracking-wider text-slate-700 dark:text-slate-300">
                            Berkas PDF <span className="text-rose-500">*</span>
                        </label>
                        {selectedFiles.length > 0 && (
                            <button
                                type="button"
                                onClick={() => setSelectedFiles([])}
                                className="text-[10px] font-black uppercase tracking-wider text-rose-500 hover:text-rose-700 transition"
                            >
                                Hapus Semua ({selectedFiles.length})
                            </button>
                        )}
                    </div>

                    <div
                        className={`relative rounded-2xl border-2 border-dashed p-4 transition-all duration-200 ${isDragging
                            ? "border-emerald-500 bg-emerald-50/50 dark:bg-emerald-950/20"
                            : "border-slate-200 bg-slate-50/40 hover:border-emerald-400 hover:bg-slate-50/80 dark:border-slate-700 dark:bg-slate-800/30"
                            }`}
                        onDragOver={handleDragOver}
                        onDragLeave={handleDragLeave}
                        onDrop={handleDrop}
                    >
                        <input
                            id="pdf-upload-input"
                            type="file"
                            accept="application/pdf,.pdf"
                            multiple
                            onChange={handleFileChange}
                            className="absolute inset-0 h-full w-full cursor-pointer opacity-0"
                        />
                        <div className="flex flex-col items-center justify-center py-2 text-center pointer-events-none">
                            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300 mb-2">
                                <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2.5">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v12m0-12l-4 4m4-4l4 4M4 20h16" />
                                </svg>
                            </div>
                            <p className="text-xs font-black text-slate-700 dark:text-slate-200">
                                Klik atau Seret Berkas PDF ke Sini
                            </p>
                            <p className="text-[10px] text-slate-400 mt-0.5">
                                Mendukung upload satu atau banyak file PDF sekaligus (hingga 50MB per file)
                            </p>
                        </div>
                    </div>

                    {/* Selected File Chips */}
                    {selectedFiles.length > 0 && (
                        <div className="max-h-40 overflow-y-auto space-y-1.5 pt-1 pr-1 custom-scrollbar">
                            {selectedFiles.map((file, index) => (
                                <div
                                    key={`${file.name}-${index}`}
                                    className="flex items-center justify-between gap-2 rounded-xl bg-slate-100/80 px-3 py-2 text-xs dark:bg-slate-800"
                                >
                                    <div className="flex items-center gap-2 min-w-0">
                                        <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-lg bg-rose-500 text-[9px] font-black text-white">
                                            PDF
                                        </div>
                                        <span className="truncate font-bold text-slate-800 dark:text-slate-200 text-xs">
                                            {file.name}
                                        </span>
                                        <span className="shrink-0 text-[10px] text-slate-400">
                                            ({formatBytes(file.size)})
                                        </span>
                                    </div>
                                    <button
                                        type="button"
                                        onClick={() => handleRemoveFile(index)}
                                        className="flex h-6 w-6 shrink-0 items-center justify-center rounded-lg bg-rose-100 text-rose-600 hover:bg-rose-200 dark:bg-rose-950/40 dark:text-rose-400 transition"
                                        title="Hapus file ini"
                                    >
                                        ✕
                                    </button>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Direct Publish Toggle */}
                <label className="flex cursor-pointer items-center gap-3 rounded-xl bg-slate-50/70 p-3 border border-slate-100 dark:bg-slate-800/40 dark:border-slate-800">
                    <input
                        type="checkbox"
                        checked={docForm.is_published}
                        onChange={(e) => setDocForm((prev) => ({ ...prev, is_published: e.target.checked }))}
                        className="h-4 w-4 rounded text-emerald-600 focus:ring-emerald-500 accent-emerald-600 cursor-pointer"
                    />
                    <span className="text-xs font-bold text-slate-700 dark:text-slate-300">
                        Langsung Publikasikan ke Portal Website
                    </span>
                </label>

                {/* Feedback */}
                <Feedback {...uploadFeedback} />

                {/* Buttons */}
                <div className="flex items-center gap-3 pt-3 mt-auto border-t border-slate-100 dark:border-slate-800">
                    <button
                        type="submit"
                        disabled={savingDocument || selectedFiles.length === 0}
                        className="flex-1 flex h-11 items-center justify-center gap-2 rounded-xl bg-emerald-600 text-xs font-black uppercase tracking-wider text-white shadow-md shadow-emerald-600/20 hover:bg-emerald-700 active:scale-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {savingDocument ? (
                            <>
                                <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                                <span>Mengunggah...</span>
                            </>
                        ) : (
                            <>
                                <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="3">
                                    <path d="M5 13l4 4L19 7" />
                                </svg>
                                <span>Simpan Dokumen {selectedFiles.length > 0 ? `(${selectedFiles.length})` : ""}</span>
                            </>
                        )}
                    </button>
                    <button
                        type="button"
                        onClick={resetForm}
                        disabled={savingDocument}
                        className="h-11 rounded-xl bg-rose-600 px-5 text-xs font-black uppercase tracking-wider text-white shadow-md shadow-rose-600/20 hover:bg-rose-700 transition-all active:scale-95 disabled:opacity-50"
                    >
                        Batal
                    </button>
                </div>
            </form>
        </section>
    );
}