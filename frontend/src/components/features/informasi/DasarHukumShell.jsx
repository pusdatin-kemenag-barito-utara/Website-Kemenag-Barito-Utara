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
  ShieldCheck,
  Building2,
  Bookmark,
  Landmark,
  BookOpen,
  Heart,
  Plane,
  Award,
  Coins,
} from "lucide-react";
import PdfViewerModal from "@/components/common/PdfViewerModal";

const CATEGORIES = [
  { id: "all", label: "Semua Dasar Hukum" },
  { id: "konstitusi", label: "UUD & Kebebasan Beragama" },
  { id: "kelembagaan", label: "Kelembagaan Kemenag" },
  { id: "nikah", label: "Pernikahan & KUA" },
  { id: "haji", label: "Haji & Umrah" },
  { id: "pendidikan", label: "Pendidikan Keagamaan" },
  { id: "zakat-wakaf", label: "Zakat & Wakaf" },
  { id: "halal", label: "Jaminan Halal" },
  { id: "pelayanan", label: "Pelayanan Publik" },
];

const DASAR_HUKUM_DATA = [
  {
    id: "uud-29",
    category: "konstitusi",
    categoryLabel: "UUD & Kebebasan Beragama",
    number: "Pasal 29 UUD 1945",
    title: "Pasal 29 Ayat (1) dan (2) UUD Republik Indonesia 1945",
    description: "Landasan konstitusional tertinggi: Negara berdasar atas Ketuhanan Yang Maha Esa dan menjamin kemerdekaan tiap-tiap penduduk memeluk agamanya dan beribadat menurut agamanya.",
    icon: Landmark,
    badgeColor: "bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300",
    isLocal: false,
    externalUrl: "https://jdih.kemenag.go.id/",
  },
  {
    id: "perpres-12-2023",
    category: "kelembagaan",
    categoryLabel: "Kelembagaan Kemenag",
    number: "Perpres No. 12 Tahun 2023",
    title: "Peraturan Presiden tentang Kementerian Agama RI",
    description: "Landasan hukum kedudukan, tugas pokok, fungsi, serta struktur kedinasan organisasi Kementerian Agama di tingkat pusat maupun daerah.",
    icon: Building2,
    badgeColor: "bg-blue-100 text-blue-800 dark:bg-blue-950/60 dark:text-blue-300",
    isLocal: false,
    externalUrl: "https://jdih.kemenag.go.id/",
  },
  {
    id: "pma-19-2019",
    category: "kelembagaan",
    categoryLabel: "Kelembagaan Kemenag",
    number: "PMA No. 19 Tahun 2019 jo. PMA No. 6/2022",
    title: "Organisasi dan Tata Kerja Instansi Vertikal Kementerian Agama",
    description: "Regulasi rincian susunan organisasi, fungsi unit kerja, serta operasional Kantor Wilayah dan Kantor Kementerian Agama Kabupaten/Kota.",
    icon: Building2,
    badgeColor: "bg-blue-100 text-blue-800 dark:bg-blue-950/60 dark:text-blue-300",
    isLocal: false,
    externalUrl: "https://jdih.kemenag.go.id/",
  },
  {
    id: "sk-maklumat-2026",
    category: "pelayanan",
    categoryLabel: "Pelayanan Publik",
    number: "SK No. 46 Tahun 2026",
    title: "SK Penetapan Maklumat & Jaminan Pelayanan Kankemenag Barito Utara",
    description: "Keputusan Kepala Kantor Kemenag Barito Utara tentang penetapan Maklumat Pelayanan dan jaminan kompensasi sanksi pelayanan publik.",
    icon: ShieldCheck,
    badgeColor: "bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300",
    isLocal: true,
    fileUrl: "/assets/documents/sk-maklumat-pelayanan-2026.pdf",
    fileSize: "530 KB",
  },
  {
    id: "sk-jam-layanan",
    category: "pelayanan",
    categoryLabel: "Pelayanan Publik",
    number: "SK Jam Layanan 2026",
    title: "SK Penetapan Jam Operasional Layanan Publik Kankemenag Barut",
    description: "Keputusan Kepala Kantor tentang pengaturan jam operasional layanan publik Senin-Kamis 07.30-16.00 WIB & Jumat 07.30-16.30 WIB.",
    icon: ShieldCheck,
    badgeColor: "bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300",
    isLocal: true,
    fileUrl: "/assets/documents/sk-jam-layanan.pdf",
    fileSize: "PDF Resmi",
  },
  {
    id: "sk-kode-etik",
    category: "pelayanan",
    categoryLabel: "Pelayanan Publik",
    number: "SK Kode Etik Pelayanan",
    title: "SK Pedoman Kode Etik Pelaksana Pelayanan & Motto HAPAKAT",
    description: "Keputusan Kepala Kantor tentang penetapan Kode Etik Aparatur dan Nilai Pelayanan HAPAKAT dalam melayani masyarakat.",
    icon: ShieldCheck,
    badgeColor: "bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300",
    isLocal: true,
    fileUrl: "/assets/documents/sk-kode-etik.pdf",
    fileSize: "PDF Resmi",
  },
  {
    id: "sk-pedoman-5s",
    category: "pelayanan",
    categoryLabel: "Pelayanan Publik",
    number: "SK Pedoman 5S",
    title: "SK Pedoman Budaya Kerja 5S (Senyum, Sapa, Salam, Sopan, Santun)",
    description: "Keputusan Kepala Kantor tentang penetapan etika pelayanan 5S bagi seluruh pegawai Kankemenag Kabupaten Barito Utara.",
    icon: ShieldCheck,
    badgeColor: "bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300",
    isLocal: true,
    fileUrl: "/assets/documents/sk-pedoman-5S.pdf",
    fileSize: "PDF Resmi",
  },
  {
    id: "uu-16-2019",
    category: "nikah",
    categoryLabel: "Pernikahan & KUA",
    number: "UU No. 16 Tahun 2019",
    title: "UU No. 16/2019 tentang Perubahan Atas UU No. 1/1974 tentang Perkawinan",
    description: "Landasan hukum batas usia pernikahan (19 tahun bagi pria & wanita) serta syarat keabsahan ikatan perkawinan menurut hukum agama.",
    icon: Heart,
    badgeColor: "bg-rose-100 text-rose-800 dark:bg-rose-950/60 dark:text-rose-300",
    isLocal: false,
    externalUrl: "https://jdih.kemenag.go.id/",
  },
  {
    id: "pma-20-2019",
    category: "nikah",
    categoryLabel: "Pernikahan & KUA",
    number: "PMA No. 20 Tahun 2019",
    title: "Peraturan Menteri Agama tentang Pencatatan Pernikahan di KUA",
    description: "Ketentuan teknis tata cara pendaftaran nikah, pemeriksaan berkas, akad nikah, dan penerbitan Buku Nikah resmi oleh KUA.",
    icon: Heart,
    badgeColor: "bg-rose-100 text-rose-800 dark:bg-rose-950/60 dark:text-rose-300",
    isLocal: false,
    externalUrl: "https://jdih.kemenag.go.id/",
  },
  {
    id: "uu-8-2019",
    category: "haji",
    categoryLabel: "Haji & Umrah",
    number: "UU No. 8 Tahun 2019",
    title: "UU tentang Penyelenggaraan Ibadah Haji dan Umrah (PIHU)",
    description: "Payung hukum penyelenggaraan ibadah haji reguler, khusus, dan umrah, mencakup pendaftaran, porsi, perlindungan, dan pelayanan jemaah.",
    icon: Plane,
    badgeColor: "bg-purple-100 text-purple-800 dark:bg-purple-950/60 dark:text-purple-300",
    isLocal: false,
    externalUrl: "https://jdih.kemenag.go.id/",
  },
  {
    id: "uu-20-2003",
    category: "pendidikan",
    categoryLabel: "Pendidikan Keagamaan",
    number: "UU No. 20 Tahun 2003",
    title: "UU tentang Sistem Pendidikan Nasional (Sisdiknas)",
    description: "Dasar hukum pengakuan dan penyetaraan pendidikan keagamaan (Madrasah Ibtidaiyah, Tsanawiyah, Aliyah, Pondok Pesantren, & Perguruan Tinggi Keagamaan).",
    icon: BookOpen,
    badgeColor: "bg-teal-100 text-teal-800 dark:bg-teal-950/60 dark:text-teal-300",
    isLocal: false,
    externalUrl: "https://jdih.kemenag.go.id/",
  },
  {
    id: "uu-18-2019",
    category: "pendidikan",
    categoryLabel: "Pendidikan Keagamaan",
    number: "UU No. 18 Tahun 2019",
    title: "Undang-Undang Republik Indonesia tentang Pesantren",
    description: "Landasan hukum independensi, pengakuan, penyelenggaraan fungsi pendidikan, dakwah, dan pemberdayaan masyarakat oleh Pondok Pesantren.",
    icon: BookOpen,
    badgeColor: "bg-teal-100 text-teal-800 dark:bg-teal-950/60 dark:text-teal-300",
    isLocal: false,
    externalUrl: "https://jdih.kemenag.go.id/",
  },
  {
    id: "uu-23-2011",
    category: "zakat-wakaf",
    categoryLabel: "Zakat & Wakaf",
    number: "UU No. 23 Tahun 2011",
    title: "Undang-Undang tentang Pengelolaan Zakat",
    description: "Regulasi tata kelola pengumpulan, pendistribusian, dan pendayagunaan zakat, infak, dan sedekah melalui BAZNAS dan LAZ yang terakreditasi.",
    icon: Coins,
    badgeColor: "bg-indigo-100 text-indigo-800 dark:bg-indigo-950/60 dark:text-indigo-300",
    isLocal: false,
    externalUrl: "https://jdih.kemenag.go.id/",
  },
  {
    id: "uu-41-2004",
    category: "zakat-wakaf",
    categoryLabel: "Zakat & Wakaf",
    number: "UU No. 41 Tahun 2004",
    title: "Undang-Undang Republik Indonesia tentang Wakaf",
    description: "Dasar hukum pengamanan, penertiban Akta Ikrar Wakaf (AIW), serta pendayagunaan tanah dan benda wakaf untuk kesejahteraan umat.",
    icon: Coins,
    badgeColor: "bg-indigo-100 text-indigo-800 dark:bg-indigo-950/60 dark:text-indigo-300",
    isLocal: false,
    externalUrl: "https://jdih.kemenag.go.id/",
  },
  {
    id: "uu-33-2014",
    category: "halal",
    categoryLabel: "Jaminan Halal",
    number: "UU No. 33 Tahun 2014",
    title: "UU No. 33/2014 tentang Jaminan Produk Halal (JPH)",
    description: "Landasan hukum kewajiban bersertifikat halal bagi produk yang beredar di Indonesia melalui Badan Penyelenggara Jaminan Produk Halal (BPJPH).",
    icon: Award,
    badgeColor: "bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300",
    isLocal: false,
    externalUrl: "https://jdih.kemenag.go.id/",
  },
  {
    id: "uu-25-2009",
    category: "pelayanan",
    categoryLabel: "Pelayanan Publik",
    number: "UU No. 25 Tahun 2009",
    title: "Undang-Undang Republik Indonesia tentang Pelayanan Publik",
    description: "Payung hukum nasional yang menetapkan asas, standar pelayanan, maklumat pelayanan, serta perlindungan masyarakat penerima layanan.",
    icon: ShieldCheck,
    badgeColor: "bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300",
    isLocal: false,
    externalUrl: "https://jdih.kemenag.go.id/",
  },
];

export default function DasarHukumShell() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [activePdf, setActivePdf] = useState(null);

  const filteredData = DASAR_HUKUM_DATA.filter((item) => {
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
      <main id="konten-utama" className="min-h-screen pt-24 sm:pt-28 md:pt-32 lg:pt-36 xl:pt-40">
        <main className="min-h-screen bg-slate-50 transition-colors dark:bg-slate-950">
          <PageBanner
            title="Dasar Hukum Penyelenggaraan"
            description="Landasan hukum konstitusional, undang-undang, peraturan pemerintah, dan keputusan resmi yang menopang seluruh tugas dan pelayanan Kankemenag Kab. Barito Utara."
            breadcrumb={[
              { label: "Beranda", href: "/beranda" },
              { label: "Informasi", href: "/informasi" },
              { label: "Dasar Hukum" },
            ]}
          />

          <section className="relative w-full px-6 py-8 sm:px-10 sm:py-12 lg:px-16 xl:px-20">
            <div className="w-full space-y-8 sm:space-y-10">
              <div className="flex flex-col gap-5 rounded-3xl border border-slate-200/80 bg-white p-6 shadow-md dark:border-slate-800 dark:bg-slate-900 sm:p-7">
                <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                  <div>
                    <div className="inline-flex items-center gap-2 rounded-full border border-emerald-300/60 bg-emerald-100/80 px-3.5 py-1 text-xs font-bold uppercase tracking-wider text-emerald-800 dark:border-emerald-800/50 dark:bg-emerald-950/40 dark:text-emerald-300">
                      <Scale className="h-3.5 w-3.5" />
                      <span>Landasan Hukum Resmi</span>
                    </div>
                    <h2 className="mt-2 text-2xl font-black text-slate-900 dark:text-slate-100 sm:text-3xl">
                      Dasar Hukum &amp; Payung Peraturan
                    </h2>
                  </div>

                  <div className="relative min-w-[280px] sm:min-w-[360px]">
                    <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Cari dasar hukum, pasal, atau kata kunci..."
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
                    <span>Bidang Hukum:</span>
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

              {filteredData.length === 0 ? (
                <div className="flex flex-col items-center justify-center rounded-3xl border border-slate-200 bg-white p-12 text-center dark:border-slate-800 dark:bg-slate-900">
                  <FileText className="h-12 w-12 text-slate-300 dark:text-slate-600" />
                  <h3 className="mt-4 text-base font-bold text-slate-900 dark:text-slate-100">
                    Dasar hukum tidak ditemukan
                  </h3>
                  <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                    Coba gunakan kata kunci pencarian lain atau ganti filter bidang hukum.
                  </p>
                  <button
                    onClick={() => {
                      setSearchQuery("");
                      setSelectedCategory("all");
                    }}
                    className="mt-4 rounded-xl bg-slate-800 px-4 py-2 text-xs font-bold text-white hover:bg-slate-700"
                  >
                    Reset Filter
                  </button>
                </div>
              ) : (
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                  {filteredData.map((item) => {
                    const IconComp = item.icon || FileText;
                    return (
                      <div
                        key={item.id}
                        className="group relative flex flex-col justify-between rounded-3xl border border-slate-200/80 bg-white p-6 shadow-md transition-all duration-300 hover:-translate-y-1 hover:border-emerald-500/40 hover:shadow-xl dark:border-slate-800 dark:bg-slate-900"
                      >
                        <div className="space-y-4">
                          <div className="flex items-start justify-between gap-3">
                            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-emerald-100 text-emerald-700 transition duration-300 group-hover:bg-emerald-600 group-hover:text-white dark:bg-emerald-950/60 dark:text-emerald-400 dark:group-hover:bg-emerald-500 dark:group-hover:text-white">
                              <IconComp className="h-5 w-5" />
                            </div>
                            <span className={`rounded-full px-3 py-1 text-[11px] font-bold ${item.badgeColor}`}>
                              {item.categoryLabel}
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
                                <span>Lihat SK (PDF)</span>
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
                              <span>Akses Dokumen Hukum</span>
                              <ExternalLink className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" />
                            </a>
                          )}
                        </div>
                      </div>
                    );
                  })}
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
                        Jaringan Dokumentasi &amp; Informasi Hukum
                      </p>
                      <h3 className="mt-2 text-xl font-black sm:text-2xl">
                        Pusat Informasi Produk Hukum Keagamaan
                      </h3>
                      <p className="mt-1.5 max-w-3xl text-xs leading-relaxed text-slate-300 dark:text-slate-400 sm:text-sm">
                        Kunjungi portal JDIH Kementerian Agama untuk mencari naskah lengkap perundang-undangan, PMA, KMA, dan keputusan hukum keagamaan lainnya.
                      </p>
                    </div>
                  </div>

                  <a
                    href="https://jdih.kemenag.go.id/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-600 px-6 py-3.5 text-xs font-bold text-white shadow-md transition-all hover:bg-emerald-500 hover:shadow-[0_8px_25px_rgba(16,185,129,0.35)] shrink-0"
                  >
                    <span>Portal JDIH Kemenag</span>
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
            subtitle={activePdf?.number ? `${activePdf.number} • Dokumen Resmi` : "Dokumen Resmi"}
          />
        </main>
      </main>
      <Footer />
    </Providers>
  );
}
