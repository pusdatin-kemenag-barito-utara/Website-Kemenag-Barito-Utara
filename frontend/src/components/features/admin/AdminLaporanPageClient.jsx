// src/components/features/admin/AdminLaporanPageClient.jsx
"use client";

import React, { useEffect, useState } from "react";
import AdminLaporanCategoryManager from "./AdminLaporanCategoryManager";

const DEFAULT_CATEGORIES = [
    { slug: "sop", title: "SOP dan Standar Pelayanan", description: "Standar Operasional Prosedur dan standar pelayanan untuk setiap layanan publik Kemenag Barito Utara." },
    { slug: "renstra", title: "Rencana Strategis (Renstra)", description: "Rencana Strategis Kementerian Agama Kabupaten Barito Utara." },
    { slug: "perjanjian-kinerja", title: "Perjanjian Kinerja", description: "Dokumen Perjanjian Kinerja tahunan pimpinan dan unit kerja." },
    { slug: "rencana-kinerja", title: "Rencana Kinerja", description: "Dokumen Rencana Kinerja Tahunan instansi." },
    { slug: "capaian-kinerja", title: "Capaian Kinerja", description: "Laporan Capaian Kinerja berkala Kemenag Barito Utara." },
    { slug: "lkj", title: "Laporan Kinerja (LKj)", description: "Laporan Kinerja Instansi Pemerintah (LKj) tahunan." },
    { slug: "rkt", title: "Rencana Kerja Tahunan (RKT)", description: "Dokumen rencana kerja operasional tahunan instansi." },
];

export default function AdminLaporanPageClient() {
    const [categories, setCategories] = useState(DEFAULT_CATEGORIES);
    const [error, setError] = useState("");

    useEffect(() => {
        const controller = new AbortController();

        async function loadData() {
            try {
                const res = await fetch("/api/admin/laporan", {
                    method: "GET",
                    cache: "no-store",
                    credentials: "include",
                    signal: controller.signal,
                });

                const json = await res.json();

                if (!res.ok) {
                    throw new Error(json?.message || "Gagal memuat data laporan admin.");
                }

                if (Array.isArray(json?.categories) && json.categories.length > 0) {
                    setCategories(json.categories);
                }
            } catch (err) {
                if (err?.name === "AbortError") return;
                setError(err?.message || "Gagal memuat data laporan admin.");
            }
        }

        loadData();

        return () => controller.abort();
    }, []);

    const initialCategory = categories[0] || DEFAULT_CATEGORIES[0];

    return (
        <section className="space-y-6 animate-in fade-in duration-300">
            {error && categories.length === 0 ? (
                <div className="rounded-3xl border border-rose-100 bg-rose-50/50 p-8 text-center dark:border-rose-900/30 dark:bg-rose-950/20">
                    <h2 className="text-base font-black tracking-tight text-slate-900 dark:text-white">Gagal Memuat Kategori</h2>
                    <p className="mt-1 text-xs font-medium text-slate-500 dark:text-slate-400">{error}</p>
                    <button
                        type="button"
                        onClick={() => window.location.reload()}
                        className="mt-4 rounded-xl bg-slate-900 px-6 py-2.5 text-xs font-black uppercase text-white"
                    >
                        Coba Lagi
                    </button>
                </div>
            ) : (
                <AdminLaporanCategoryManager
                    category={initialCategory}
                    categories={categories}
                />
            )}
        </section>
    );
}
