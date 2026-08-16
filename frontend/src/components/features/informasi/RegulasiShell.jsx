"use client";

import React, { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import Providers from "@/components/layout/Providers";
import Header from "@/components/layout/Header/Header";
import Footer from "@/components/layout/Footer/Footer";
import PageBanner from "@/components/common/PageBanner";
import {
  Scale,
  Search,
  FileText,
  Eye,
  Download,
  ExternalLink,
  X,
  Sparkles,
  Filter,
  Building2,
  Bookmark,
} from "lucide-react";
import PdfViewerModal from "@/components/common/PdfViewerModal";

const CATEGORIES = [
  { id: "all", label: "Semua Regulasi" },
  { id: "SK", label: "SK Kepala Kantor" },
  { id: "PMA", label: "PMA (Permenag)" },
  { id: "UU", label: "Undang-Undang" },
  { id: "PP", label: "Peraturan Pemerintah" },
  { id: "Perpres", label: "Peraturan Presiden" },
];

const REGULATIONS = [
  {
    id: "sk-maklumat-2026",
    category: "SK",
    number: "SK No. 46 Tahun 2026",
    title: "SK Penetapan Maklumat Pelayanan & Jaminan Pelayanan",
    description:
      "Keputusan Kepala Kantor Kementerian Agama Kabupaten Barito Utara tentang penetapan Maklumat Pelayanan dan Jaminan Pelayanan Publik.",
    fileUrl: "/assets/documents/sk-maklumat-pelayanan-2026.pdf",
    fileSize: "530 KB",
    badgeColor:
      "bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300",
    isLocal: true,
  },
  {
    id: "sk-jam-layanan",
    category: "SK",
    number: "SK Jam Layanan 2026",
    title: "SK Penetapan Jam Operasional Layanan Publik",
    description:
      "Keputusan Kepala Kantor Kemenag Kab. Barito Utara tentang pengaturan jam operasional layanan kantor untuk masyarakat.",
    fileUrl: "/assets/documents/sk-jam-layanan.pdf",
    fileSize: "PDF Resmi",
    badgeColor:
      "bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300",
    isLocal: true,
  },
  {
    id: "sk-pedoman-5s",
    category: "SK",
    number: "SK Pedoman 5S",
    title: "SK Pedoman Budaya Kerja 5S Pelayanan Publik",
    description:
      "Keputusan Kepala Kantor tentang penerapan Budaya 5S (Senyum, Sapa, Salam, Sopan, Santun) sebagai etika aparatur.",
    fileUrl: "/assets/documents/sk-pedoman-5S.pdf",
    fileSize: "PDF Resmi",
    badgeColor:
      "bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300",
    isLocal: true,
  },
  {
    id: "sk-kode-etik",
    category: "SK",
    number: "SK Kode Etik",
    title: "SK Pedoman Kode Etik & Motto HAPAKAT",
    description:
      "Keputusan Kepala Kantor tentang penetapan Kode Etik Pelaksana Pelayanan dan Nilai HAPAKAT dalam melayani masyarakat.",
    fileUrl: "/assets/documents/sk-kode-etik.pdf",
    fileSize: "PDF Resmi",
    badgeColor:
      "bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300",
    isLocal: true,
  },
  {
    id: "modul-standar-pelayanan",
    category: "PMA",
    number: "Modul Standar Pelayanan",
    title: "Modul Pedoman & Tolok Ukur Standar Pelayanan Publik",
    description:
      "Buku pedoman komprehensif acuan tolok ukur penyelenggaraan dan penilaian kualitas pelayanan publik di lingkungan Kemenag.",
    fileUrl: "/assets/documents/modul-standar-pelayanan.pdf",
    fileSize: "1.2 MB",
    badgeColor:
      "bg-blue-100 text-blue-800 dark:bg-blue-950/60 dark:text-blue-300",
    isLocal: true,
  },
  {
    id: "uu-25-2009",
    category: "UU",
    number: "UU No. 25 Tahun 2009",
    title: "Undang-Undang Republik Indonesia tentang Pelayanan Publik",
    description:
      "Landasan hukum utama negara Indonesia yang mengatur tentang hak, kewajiban, serta kepastian hukum dalam penyelenggaraan pelayanan publik.",
    externalUrl: "https://jdih.kemenag.go.id/",
    fileSize: "Regulasi Nasional",
    badgeColor:
      "bg-purple-100 text-purple-800 dark:bg-purple-950/60 dark:text-purple-300",
    isLocal: false,
  },
  {
    id: "uu-8-2019",
    category: "UU",
    number: "UU No. 8 Tahun 2019",
    title: "Undang-Undang tentang Penyelenggaraan Ibadah Haji dan Umrah",
    description:
      "Regulasi tata kelola pendaftaran, pembimbingan, perlindungan, serta pembinaan penyelenggaraan ibadah haji dan umrah.",
    externalUrl: "https://jdih.kemenag.go.id/",
    fileSize: "Regulasi Nasional",
    badgeColor:
      "bg-purple-100 text-purple-800 dark:bg-purple-950/60 dark:text-purple-300",
    isLocal: false,
  },
  {
    id: "uu-33-2014",
    category: "UU",
    number: "UU No. 33 Tahun 2014",
    title: "Undang-Undang tentang Jaminan Produk Halal",
    description:
      "Landasan hukum jaminan produk halal dan kewajiban pendaftaran sertifikasi halal melalui BPJPH Kementerian Agama.",
    externalUrl: "https://jdih.kemenag.go.id/",
    fileSize: "Regulasi Nasional",
    badgeColor:
      "bg-purple-100 text-purple-800 dark:bg-purple-950/60 dark:text-purple-300",
    isLocal: false,
  },
  {
    id: "pp-96-2012",
    category: "PP",
    number: "PP No. 96 Tahun 2012",
    title: "Peraturan Pemerintah tentang Pelaksanaan UU Pelayanan Publik",
    description:
      "Ketentuan pelaksanaan sistem pengaduan, standar pelayanan, evaluasi kinerja, dan pengawasan aparatur penyelenggara pelayanan.",
    externalUrl: "https://jdih.kemenag.go.id/",
    fileSize: "Regulasi Nasional",
    badgeColor:
      "bg-teal-100 text-teal-800 dark:bg-teal-950/60 dark:text-teal-300",
    isLocal: false,
  },
  {
    id: "perpres-12-2023",
    category: "Perpres",
    number: "Perpres No. 12 Tahun 2023",
    title: "Peraturan Presiden tentang Kementerian Agama",
    description:
      "Kedudukan, tugas, fungsi, susunan organisasi, dan tata kerja Kementerian Agama Republik Indonesia.",
    externalUrl: "https://jdih.kemenag.go.id/",
    fileSize: "Regulasi Nasional",
    badgeColor:
      "bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300",
    isLocal: false,
  },
  {
    id: "pma-19-2019",
    category: "PMA",
    number: "PMA No. 19 Tahun 2019",
    title: "Peraturan Menteri Agama tentang OTK Instansi Vertikal Kemenag",
    description:
      "Struktur organisasi, rincian tugas, dan fungsi Kanwil Kemenag Provinsi serta Kantor Kemenag Kabupaten/Kota.",
    externalUrl: "https://jdih.kemenag.go.id/",
    fileSize: "Peraturan Menteri",
    badgeColor:
      "bg-blue-100 text-blue-800 dark:bg-blue-950/60 dark:text-blue-300",
    isLocal: false,
  },
  {
    id: "pma-20-2019",
    category: "PMA",
    number: "PMA No. 20 Tahun 2019",
    title: "Peraturan Menteri Agama tentang Pencatatan Pernikahan",
    description:
      "Tata cara, persyaratan administratif, prosedur pencatatan, dan penerbitan akta nikah di Kantor Urusan Agama (KUA).",
    externalUrl: "https://jdih.kemenag.go.id/",
    fileSize: "Peraturan Menteri",
    badgeColor:
      "bg-blue-100 text-blue-800 dark:bg-blue-950/60 dark:text-blue-300",
    isLocal: false,
  },
  {
    id: "pma-6-2022",
    category: "PMA",
    number: "PMA No. 6 Tahun 2022",
    title: "PMA Perubahan Atas PMA No. 19 Tahun 2019",
    description:
      "Penyesuaian tata kerja, kelembagaan, dan penataan jabatan fungsional pada instansi vertikal Kementerian Agama.",
    externalUrl: "https://jdih.kemenag.go.id/",
    fileSize: "Peraturan Menteri",
    badgeColor:
      "bg-blue-100 text-blue-800 dark:bg-blue-950/60 dark:text-blue-300",
    isLocal: false,
  },
];

export default function RegulasiShell() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [activePdf, setActivePdf] = useState(null);

  const filteredRegulations = REGULATIONS.filter((item) => {
    const matchesCategory =
      selectedCategory === "all" || item.category === selectedCategory;
    const matchesSearch =
      item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.number.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <Providers>
      <Header />
      <main
        id="konten-utama"
        className="min-h-screen pt-24 sm:pt-28 md:pt-32 lg:pt-36 xl:pt-40"
      >
        <main className="min-h-screen bg-slate-50 transition-colors dark:bg-slate-950">
          <PageBanner
            title="Regulasi Kementerian Agama"
            description="Pusat informasi peraturan perundang-undangan, Peraturan Menteri Agama (PMA), dan Surat Keputusan resmi di lingkungan Kankemenag Kab. Barito Utara."
            breadcrumb={[
              { label: "Beranda", href: "/beranda" },
              { label: "Informasi", href: "/informasi" },
              { label: "Regulasi" },
            ]}
          />

          <section className="relative w-full px-6 py-8 sm:px-10 sm:py-12 lg:px-16 xl:px-20">
            <div className="w-full space-y-8 sm:space-y-10">
              <div className="flex flex-col gap-5 rounded-3xl border border-slate-200/80 bg-white p-6 shadow-md dark:border-slate-800 dark:bg-slate-900 sm:p-7">
                <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                  <div>
                    <div className="inline-flex items-center gap-2 rounded-full border border-emerald-300/60 bg-emerald-100/80 px-3.5 py-1 text-xs font-bold uppercase tracking-wider text-emerald-800 dark:border-emerald-800/50 dark:bg-emerald-950/40 dark:text-emerald-300">
                      <Scale className="h-3.5 w-3.5" />
                      <span>JDIH &amp; Produk Hukum</span>
                    </div>
                    <h2 className="mt-2 text-2xl font-black text-slate-900 dark:text-slate-100 sm:text-3xl">
                      Daftar Peraturan &amp; Dokumen Resmi
                    </h2>
                  </div>

                  <div className="relative min-w-[280px] sm:min-w-[360px]">
                    <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Cari regulasi, nomor, atau kata kunci..."
                      className="w-full rounded-2xl border border-slate-200 bg-slate-50/80 pl-10 pr-4 py-3 text-xs font-semibold text-slate-900 placeholder:text-slate-400 focus:border-emerald-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100 dark:placeholder:text-slate-500 dark:focus:border-emerald-400"
                    />
                    {searchQuery && (
                      <button
                        onClick={() => setSearchQuery("")}
                        className="absolute right-3.5 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-slate-600"
                      >
                        Clear
                      </button>
                    )}
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-2 border-t border-slate-100 pt-4 dark:border-slate-800">
                  <span className="flex items-center gap-1.5 text-xs font-bold text-slate-500 dark:text-slate-400 mr-2">
                    <Filter className="h-3.5 w-3.5" />
                    <span>Kategori:</span>
                  </span>
                  {CATEGORIES.map((cat) => (
                    <button
                      key={cat.id}
                      onClick={() => setSelectedCategory(cat.id)}
                      className={`rounded-xl px-3.5 py-2 text-xs font-bold transition-all duration-200 ${
                        selectedCategory === cat.id
                          ? "bg-emerald-600 text-white shadow-md shadow-emerald-600/20 dark:bg-emerald-500"
                          : "bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700"
                      }`}
                    >
                      {cat.label}
                    </button>
                  ))}
                </div>
              </div>

              {filteredRegulations.length === 0 ? (
                <div className="flex flex-col items-center justify-center rounded-3xl border border-slate-200 bg-white p-12 text-center dark:border-slate-800 dark:bg-slate-900">
                  <FileText className="h-12 w-12 text-slate-300 dark:text-slate-600" />
                  <h3 className="mt-4 text-base font-bold text-slate-900 dark:text-slate-100">
                    Regulasi tidak ditemukan
                  </h3>
                  <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                    Coba gunakan kata kunci pencarian lain atau ganti filter
                    kategori.
                  </p>
                  <button
                    onClick={() => {
                      setSearchQuery("");
                      setSelectedCategory("all");
                    }}
                    className="mt-4 rounded-xl bg-slate-800 px-4 py-2 text-xs font-bold text-white hover:bg-slate-700"
                  >
                    Reset Pencarian
                  </button>
                </div>
              ) : (
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                  {filteredRegulations.map((item) => (
                    <div
                      key={item.id}
                      className="group relative flex flex-col justify-between rounded-3xl border border-slate-200/80 bg-white p-6 shadow-md transition-all duration-300 hover:-translate-y-1 hover:border-emerald-500/40 hover:shadow-xl dark:border-slate-800 dark:bg-slate-900"
                    >
                      <div className="space-y-4">
                        <div className="flex items-start justify-between gap-3">
                          <span
                            className={`rounded-full px-3 py-1 text-[11px] font-bold ${item.badgeColor}`}
                          >
                            {item.category}
                          </span>
                          <span className="text-[11px] font-medium text-slate-400">
                            {item.fileSize}
                          </span>
                        </div>

                        <div>
                          <p className="text-xs font-extrabold uppercase tracking-wider text-emerald-700 dark:text-emerald-400">
                            {item.number}
                          </p>
                          <h3 className="mt-1 text-base font-black text-slate-900 group-hover:text-emerald-700 dark:text-slate-100 dark:group-hover:text-emerald-400 sm:text-lg">
                            {item.title}
                          </h3>
                          <p className="mt-2 text-xs leading-relaxed text-slate-600 dark:text-slate-400">
                            {item.description}
                          </p>
                        </div>
                      </div>

                      <div className="mt-6 flex items-center gap-2 border-t border-slate-100 pt-4 dark:border-slate-800">
                        {item.isLocal ? (
                          <>
                            <button
                              onClick={() => setActivePdf(item)}
                              className="group/btn flex flex-1 items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 px-4 py-2.5 text-xs font-bold text-white shadow-md transition-all duration-300 hover:from-emerald-500 hover:to-teal-500 hover:shadow-[0_8px_25px_rgba(16,185,129,0.35)] hover:-translate-y-0.5 active:scale-[0.98]"
                            >
                              <Eye className="h-4 w-4 transition-transform duration-300 group-hover/btn:scale-110" />
                              <span>Lihat PDF</span>
                            </button>
                            <a
                              href={item.fileUrl}
                              download
                              className="flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 bg-slate-50 text-slate-700 transition-all hover:border-emerald-500/60 hover:bg-emerald-50 hover:text-emerald-700 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700"
                              title="Unduh PDF"
                            >
                              <Download className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                            </a>
                          </>
                        ) : (
                          <a
                            href={item.externalUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex flex-1 items-center justify-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-xs font-bold text-slate-700 shadow-sm transition-all hover:border-emerald-500/60 hover:bg-emerald-50 hover:text-emerald-700 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700"
                          >
                            <span>Akses JDIH Kemenag</span>
                            <ExternalLink className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" />
                          </a>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}

              <div className="rounded-3xl bg-slate-900 p-6 text-white shadow-xl dark:bg-slate-900/90 dark:ring-1 dark:ring-white/10 sm:p-8">
                <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
                  <div className="flex items-start gap-4">
                    <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-500 text-white shadow-lg">
                      <Bookmark className="h-7 w-7" />
                    </div>
                    <div>
                      <p className="text-xs font-bold uppercase tracking-[0.25em] text-emerald-400">
                        JDIH Kementerian Agama RI
                      </p>
                      <h3 className="mt-2 text-xl font-black sm:text-2xl">
                        Jaringan Dokumentasi &amp; Informasi Hukum Kemenag
                      </h3>
                      <p className="mt-1.5 max-w-3xl text-xs leading-relaxed text-slate-300 dark:text-slate-400 sm:text-sm">
                        Butuh dokumen peraturan perundang-undangan keagamaan
                        terlengkap? Akses basis data resmi JDIH Kementerian
                        Agama Republik Indonesia secara langsung.
                      </p>
                    </div>
                  </div>

                  <a
                    href="https://jdih.kemenag.go.id/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-600 px-6 py-3.5 text-xs font-bold text-white shadow-md transition-all hover:bg-emerald-500 hover:shadow-[0_8px_25px_rgba(16,185,129,0.35)] shrink-0"
                  >
                    <span>Kunjungi Portal JDIH</span>
                    <ExternalLink className="h-4 w-4" />
                  </a>
                </div>
              </div>
            </div>
          </section>

          {/* Floating PDF.js Modal */}
          <PdfViewerModal
            isOpen={!!activePdf}
            onClose={() => setActivePdf(null)}
            fileUrl={activePdf?.fileUrl}
            title={activePdf?.title}
            subtitle={
              activePdf?.number
                ? `${activePdf.number} • ${activePdf.fileSize || "Dokumen Resmi"}`
                : "Dokumen Resmi"
            }
          />
        </main>
      </main>
      <Footer />
    </Providers>
  );
}
