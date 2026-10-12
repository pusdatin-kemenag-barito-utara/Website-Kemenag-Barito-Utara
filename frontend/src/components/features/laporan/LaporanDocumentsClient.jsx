"use client";

import React, { useState, useEffect, useMemo } from "react";
import { useDocumentActions } from "./hooks/useDocumentActions";
import DocumentItem from "./components/DocumentItem";
import PdfViewerModal from "@/components/common/PdfViewerModal";
import { getPocketBase } from "@/lib/pocketbase/client";

function FileIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      className="h-5 w-5"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
      <path d="M14 2v6h6" />
      <path d="M9 13h6" />
      <path d="M9 17h6" />
      <path d="M9 9h1" />
    </svg>
  );
}

const BIDANG_LIST = [
  "Layanan Sub Bagian Tata Usaha",
  "Layanan Pendidikan Madrasah",
  "Layanan Pendidikan Agama Islam",
  "Layanan Pendidikan Diniyah dan Pontren",
  "Layanan Bimbingan Masyarakat Islam",
  "Layanan Bimbingan Masyarakat Kristen & Katolik",
  "Layanan Penyelenggara Zakat dan Wakaf",
  "Layanan Penyelenggara Hindu",
];

export default function LaporanDocumentsClient({ documents: initialDocuments = [], categorySlug }) {
  const { isDownloading, handleDownload } = useDocumentActions();
  const [documents, setDocuments] = useState(initialDocuments);
  const [searchQuery, setSearchQuery] = useState("");
  const [viewMode, setViewMode] = useState("accordion"); // "accordion" | "grid"
  const [activePdf, setActivePdf] = useState(null);

  // Cari unit pertama yang memiliki dokumen agar otomatis terbuka
  const firstUnitWithDocs = useMemo(() => {
    return (
      BIDANG_LIST.find((bidang) =>
        documents.some((d) => (d.description || BIDANG_LIST[0]) === bidang)
      ) || BIDANG_LIST[0]
    );
  }, [documents]);

  const [expandedBidang, setExpandedBidang] = useState(firstUnitWithDocs);

  useEffect(() => {
    setDocuments(initialDocuments);
  }, [initialDocuments]);

  // Realtime subscription via PocketBase
  useEffect(() => {
    const pb = getPocketBase();
    if (!pb) return;

    let isSubscribed = true;

    const setupRealtime = async () => {
      try {
        await pb.collection("report_documents").subscribe("*", (e) => {
          if (!isSubscribed) return;
          if (e.action === "create" && e.record.is_published) {
            setDocuments((prev) => {
              const exists = prev.some((d) => d.id === e.record.id);
              if (exists) return prev;
              return [e.record, ...prev];
            });
          } else if (e.action === "update") {
            setDocuments((prev) => {
              if (!e.record.is_published) {
                return prev.filter((d) => d.id !== e.record.id);
              }
              return prev.map((d) => (d.id === e.record.id ? { ...d, ...e.record } : d));
            });
          } else if (e.action === "delete") {
            setDocuments((prev) => prev.filter((d) => d.id !== e.record.id));
          }
        });
      } catch (err) {
        console.warn("[LaporanRealtime] Error subscribing:", err);
      }
    };

    setupRealtime();

    return () => {
      isSubscribed = false;
      try {
        pb.collection("report_documents").unsubscribe("*");
      } catch {
        // ignore
      }
    };
  }, []);

  const handlePreviewDocument = (doc) => {
    if (!doc?.href) return;
    setActivePdf(doc);
  };

  useEffect(() => {
    if (activePdf) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [activePdf]);

  // Filter dokumen berdasarkan input pencarian
  const filteredDocuments = useMemo(() => {
    if (!searchQuery.trim()) return documents;
    const q = searchQuery.toLowerCase().trim();
    return documents.filter(
      (doc) =>
        (doc.title && doc.title.toLowerCase().includes(q)) ||
        (doc.description && doc.description.toLowerCase().includes(q)) ||
        (doc.file_name && doc.file_name.toLowerCase().includes(q)) ||
        (doc.year && String(doc.year).includes(q))
    );
  }, [documents, searchQuery]);

  // Kelompokkan dokumen per bidang untuk halaman SOP
  const { groupedDocs, otherDocs } = useMemo(() => {
    const grouped = {};
    BIDANG_LIST.forEach((b) => {
      grouped[b] = [];
    });
    const unassigned = [];

    filteredDocuments.forEach((doc) => {
      const desc = doc.description || BIDANG_LIST[0];
      if (grouped[desc]) {
        grouped[desc].push(doc);
      } else {
        unassigned.push(doc);
      }
    });

    return { groupedDocs: grouped, otherDocs: unassigned };
  }, [filteredDocuments]);

  if (!documents.length) {
    return (
      <div className="w-full rounded-[2.5rem] border-2 border-dashed border-slate-200 bg-white p-12 sm:p-16 text-center dark:border-slate-800 dark:bg-slate-900/50">
        <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-[2rem] bg-emerald-50 text-emerald-600 shadow-lg shadow-emerald-500/10 dark:bg-emerald-950/40 dark:text-emerald-400">
          <FileIcon />
        </div>
        <h3 className="text-xl font-black text-slate-900 dark:text-white">Arsip Dokumen Belum Tersedia</h3>
        <p className="mx-auto mt-3 max-w-md text-sm leading-relaxed text-slate-500 dark:text-slate-400">
          Dokumen resmi untuk kategori ini sedang dalam tahap digitalisasi dan verifikasi oleh tim Pusdatin Kemenag Barito Utara.
        </p>
      </div>
    );
  }

  return (
    <div className="w-full space-y-8">
      {/* ── Search & Filter Controls Bar ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 rounded-3xl border border-slate-200/80 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900/80">
        <div className="relative flex-1">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Cari judul dokumen atau nomor surat..."
            className="w-full rounded-2xl border border-slate-200 bg-slate-50/50 py-2.5 pl-10 pr-10 text-sm text-slate-900 transition-all focus:border-emerald-500 focus:bg-white focus:outline-none focus:ring-4 focus:ring-emerald-500/10 dark:border-slate-800 dark:bg-slate-900 dark:text-white dark:focus:border-emerald-500"
          />
          <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-slate-400">
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
          {searchQuery && (
            <button
              type="button"
              onClick={() => setSearchQuery("")}
              className="absolute inset-y-0 right-0 flex items-center pr-3 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
            >
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          )}
        </div>

        {categorySlug === "sop" && (
          <div className="flex items-center gap-1.5 self-end sm:self-auto rounded-2xl border border-slate-200 bg-slate-50 p-1 dark:border-slate-800 dark:bg-slate-900">
            <button
              type="button"
              onClick={() => setViewMode("accordion")}
              className={`rounded-xl px-3 py-1.5 text-xs font-bold transition-all ${
                viewMode === "accordion"
                  ? "bg-white text-emerald-700 shadow-sm dark:bg-slate-800 dark:text-emerald-400"
                  : "text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200"
              }`}
            >
              Per Unit
            </button>
            <button
              type="button"
              onClick={() => setViewMode("grid")}
              className={`rounded-xl px-3 py-1.5 text-xs font-bold transition-all ${
                viewMode === "grid"
                  ? "bg-white text-emerald-700 shadow-sm dark:bg-slate-800 dark:text-emerald-400"
                  : "text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200"
              }`}
            >
              Semua SOP ({filteredDocuments.length})
            </button>
          </div>
        )}
      </div>

      {/* ── SOP ACCORDION VIEW ── */}
      {categorySlug === "sop" && viewMode === "accordion" ? (
        <div className="w-full space-y-4">
          {BIDANG_LIST.map((bidang, index) => {
            const bidangDocs = groupedDocs[bidang] || [];
            const isExpanded = expandedBidang === bidang;

            return (
              <div
                key={bidang}
                className={`overflow-hidden rounded-3xl border transition-all duration-300 ${
                  isExpanded
                    ? "border-emerald-500/50 bg-white shadow-lg shadow-emerald-500/5 ring-1 ring-emerald-500/20 dark:border-emerald-600/40 dark:bg-slate-900"
                    : "border-slate-200/80 bg-white shadow-sm hover:border-emerald-300 dark:border-slate-800 dark:bg-slate-900/60 dark:hover:border-slate-700"
                }`}
              >
                {/* Accordion Header */}
                <button
                  type="button"
                  onClick={() => setExpandedBidang(isExpanded ? null : bidang)}
                  className="flex w-full items-center justify-between px-6 py-5 text-left transition-all hover:bg-slate-50/50 dark:hover:bg-slate-800/30"
                >
                  <div className="flex items-center gap-4 min-w-0">
                    <div
                      className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl text-xs font-black transition-colors ${
                        bidangDocs.length > 0
                          ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-400"
                          : "bg-slate-100 text-slate-400 dark:bg-slate-800 dark:text-slate-500"
                      }`}
                    >
                      {String(index + 1).padStart(2, "0")}
                    </div>
                    <div className="min-w-0">
                      <h3 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white truncate">
                        {bidang}
                      </h3>
                      <div className="mt-1 flex items-center gap-2">
                        <span className="rounded-md bg-emerald-50 px-2 py-0.5 text-[9px] font-black uppercase tracking-wider text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400">
                          UNIT
                        </span>
                        <span className="text-[10px] font-semibold text-slate-400">
                          {bidangDocs.length} Dokumen SOP
                        </span>
                      </div>
                    </div>
                  </div>
                  <div
                    className={`flex h-9 w-9 items-center justify-center rounded-full bg-slate-50 text-slate-400 transition-transform duration-300 dark:bg-slate-800/80 ${
                      isExpanded ? "rotate-180 text-emerald-600 dark:text-emerald-400" : ""
                    }`}
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-4 w-4"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                      strokeWidth="2.5"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                    </svg>
                  </div>
                </button>

                {/* Accordion Content */}
                {isExpanded && (
                  <div className="border-t border-slate-100 bg-slate-50/50 p-6 dark:border-slate-800/80 dark:bg-slate-950/30">
                    {bidangDocs.length > 0 ? (
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                        {bidangDocs.map((doc, idx) => (
                          <DocumentItem
                            key={doc.id}
                            doc={doc}
                            index={idx}
                            loading={isDownloading === doc.href}
                            onDownload={handleDownload}
                            onPreview={handlePreviewDocument}
                          />
                        ))}
                      </div>
                    ) : (
                      <div className="py-8 text-center text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
                        Belum Ada Dokumen SOP Tersedia Untuk Unit Ini
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}

          {/* Dokumen Umum / Lainnya jika ada */}
          {otherDocs.length > 0 && (
            <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
              <div className="p-6">
                <h4 className="text-sm font-bold text-slate-900 dark:text-white mb-4">
                  Dokumen SOP Layanan Terpadu & Umum
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                  {otherDocs.map((doc, idx) => (
                    <DocumentItem
                      key={doc.id}
                      doc={doc}
                      index={idx}
                      loading={isDownloading === doc.href}
                      onDownload={handleDownload}
                      onPreview={handlePreviewDocument}
                    />
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      ) : (
        /* ── GRID VIEW (NON-SOP ATAU PILIHAN SEMUA SOP) ── */
        filteredDocuments.length === 0 ? (
          <div className="rounded-3xl border border-slate-200 bg-slate-50 py-16 text-center dark:border-slate-800 dark:bg-slate-900/40">
            <p className="text-sm font-semibold text-slate-500 dark:text-slate-400">
              Tidak ada dokumen yang cocok dengan kata kunci &quot;{searchQuery}&quot;.
            </p>
            <button
              type="button"
              onClick={() => setSearchQuery("")}
              className="mt-3 text-xs font-bold text-emerald-600 hover:underline dark:text-emerald-400"
            >
              Reset Pencarian
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredDocuments.map((doc, index) => (
              <DocumentItem
                key={doc.id}
                doc={doc}
                index={index}
                loading={isDownloading === doc.href}
                onDownload={handleDownload}
                onPreview={handlePreviewDocument}
              />
            ))}
          </div>
        )
      )}

      {/* Floating PDF.js Modal */}
      <PdfViewerModal
        isOpen={!!activePdf}
        onClose={() => setActivePdf(null)}
        fileUrl={activePdf?.href}
        title={activePdf?.title}
        subtitle={activePdf?.year ? `Tahun ${activePdf.year} • Dokumen Resmi` : "Dokumen Resmi"}
      />
    </div>
  );
}
