// src/components/admin/laporan/LaporanCategoryPanel.jsx
"use client";

import React, { useState, useRef, useEffect } from "react";

export default function LaporanCategoryPanel({
    categories = [],
    activeSlug,
    activeCategory,
    loadingSlug,
    onSwitchCategory,
}) {
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef(null);

    useEffect(() => {
        function handleClickOutside(event) {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        }

        function handleKeyDown(event) {
            if (event.key === "Escape") {
                setIsOpen(false);
            }
        }

        if (isOpen) {
            document.addEventListener("mousedown", handleClickOutside);
            document.addEventListener("keydown", handleKeyDown);
        }

        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
            document.removeEventListener("keydown", handleKeyDown);
        };
    }, [isOpen]);

    if (categories.length === 0) {
        return null;
    }

    const activeDocCount =
        activeCategory?.document_count !== undefined
            ? activeCategory.document_count
            : activeCategory?.documents?.length || 0;

    return (
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 animate-in fade-in slide-in-from-top-2 duration-300">
            {/* Header Info Section */}
            <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2 mb-1">
                    <span className="flex h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                    <span className="text-[10px] font-black uppercase tracking-[0.25em] text-slate-400 dark:text-slate-500">
                        Database Dokumen & Laporan
                    </span>
                </div>
                <h1 className="text-xl sm:text-2xl font-black tracking-tight text-slate-900 dark:text-white leading-tight">
                    {activeCategory?.title || "Kategori Dokumen"}
                </h1>
                <p className="mt-0.5 text-xs font-medium text-slate-500 dark:text-slate-400 max-w-xl line-clamp-1">
                    {activeCategory?.description || "Kelola dan publikasikan berkas pelaporan resmi Kemenag Barito Utara."}
                </p>
            </div>

            {/* Custom Category Dropdown Selector */}
            <div className="relative shrink-0 sm:w-80" ref={dropdownRef}>
                <label className="text-[10px] font-black uppercase tracking-wider text-slate-700 dark:text-slate-300 block mb-1">
                    Pilih Kategori Laporan ({categories.length})
                </label>

                {/* Dropdown Trigger Button */}
                <button
                    type="button"
                    aria-label="Pilih Kategori Laporan"
                    onClick={() => setIsOpen((prev) => !prev)}
                    className={`group flex w-full h-11 items-center justify-between rounded-xl border bg-slate-50/70 px-3.5 text-xs font-bold transition-all text-left outline-none ${
                        isOpen
                            ? "border-emerald-600 bg-white ring-2 ring-emerald-500/20 shadow-md dark:border-emerald-500 dark:bg-slate-900"
                            : "border-slate-200 text-slate-800 hover:border-emerald-500 hover:bg-white dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:border-slate-600"
                    }`}
                >
                    <div className="flex items-center gap-2.5 min-w-0">
                        <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-lg bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-400">
                            <svg viewBox="0 0 24 24" className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth="2.5">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
                            </svg>
                        </div>
                        <span className="truncate text-slate-900 dark:text-white font-black text-xs">
                            {activeCategory?.title || "Pilih Kategori..."}
                        </span>
                    </div>

                    <div className="flex items-center gap-2 shrink-0 ml-2">
                        <span className="rounded-full bg-slate-200/80 px-2 py-0.5 text-[9px] font-black text-slate-700 dark:bg-slate-700 dark:text-slate-300">
                            {activeDocCount}
                        </span>
                        <div className={`text-slate-400 transition-transform duration-200 ${isOpen ? "rotate-180 text-emerald-600 dark:text-emerald-400" : ""}`}>
                            <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2.5">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                            </svg>
                        </div>
                    </div>
                </button>

                {/* Floating Dropdown Menu */}
                {isOpen && (
                    <div className="absolute right-0 left-0 sm:left-auto sm:w-96 top-[calc(100%+6px)] z-50 overflow-hidden rounded-2xl border border-slate-200 bg-white p-1.5 shadow-2xl shadow-slate-900/15 animate-in fade-in zoom-in-95 duration-150 dark:border-slate-700 dark:bg-slate-900 dark:shadow-black/50">
                        <div className="px-3 py-2 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
                            <span className="text-[10px] font-black uppercase tracking-wider text-slate-400">
                                Daftar Kategori Laporan
                            </span>
                            <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400">
                                {categories.length} Kategori
                            </span>
                        </div>

                        <div className="max-h-72 overflow-y-auto py-1 custom-scrollbar space-y-0.5">
                            {categories.map((cat) => {
                                const isActive = activeSlug === cat.slug;
                                const count = cat.document_count !== undefined ? cat.document_count : (cat.documents?.length || 0);

                                return (
                                    <button
                                        key={cat.id || cat.slug}
                                        type="button"
                                        onClick={() => {
                                            onSwitchCategory(cat.slug);
                                            setIsOpen(false);
                                        }}
                                        className={`group flex w-full items-center justify-between rounded-xl px-3 py-2.5 text-left text-xs transition-all ${
                                            isActive
                                                ? "bg-slate-900 text-white font-black dark:bg-white dark:text-slate-900 shadow-sm"
                                                : "text-slate-700 hover:bg-slate-100/80 hover:text-slate-900 font-bold dark:text-slate-300 dark:hover:bg-slate-800 dark:hover:text-white"
                                        }`}
                                    >
                                        <div className="flex items-center gap-2.5 min-w-0">
                                            <svg
                                                viewBox="0 0 24 24"
                                                className={`h-4 w-4 shrink-0 transition-colors ${
                                                    isActive
                                                        ? "text-emerald-400 dark:text-emerald-600"
                                                        : "text-slate-400 group-hover:text-slate-600 dark:group-hover:text-slate-300"
                                                }`}
                                                fill="none"
                                                stroke="currentColor"
                                                strokeWidth="2"
                                            >
                                                <path
                                                    strokeLinecap="round"
                                                    strokeLinejoin="round"
                                                    d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z"
                                                />
                                            </svg>
                                            <span className="truncate">{cat.title}</span>
                                        </div>

                                        <div className="flex items-center gap-2 shrink-0 ml-2">
                                            <span
                                                className={`rounded-full px-2 py-0.5 text-[9px] font-black ${
                                                    isActive
                                                        ? "bg-white/20 text-white dark:bg-slate-900/20 dark:text-slate-900"
                                                        : "bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400 group-hover:bg-white dark:group-hover:bg-slate-700"
                                                }`}
                                            >
                                                {count} dok
                                            </span>
                                            {isActive && (
                                                <svg viewBox="0 0 24 24" className="h-4 w-4 shrink-0 text-emerald-400 dark:text-emerald-600" fill="none" stroke="currentColor" strokeWidth="3">
                                                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                                                </svg>
                                            )}
                                        </div>
                                    </button>
                                );
                            })}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
