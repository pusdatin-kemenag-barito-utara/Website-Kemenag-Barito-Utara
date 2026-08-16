"use client";

import React, { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import {
  Newspaper,
  Search,
  Calendar,
  User,
  Eye,
  ArrowRight,
  Filter,
  X,
} from "lucide-react";
import Providers from "@/components/layout/Providers";
import Header from "@/components/layout/Header/Header";
import Footer from "@/components/layout/Footer/Footer";
import PageBanner from "@/components/common/PageBanner";

const CATEGORIES = [
  { id: "all", label: "Semua Berita" },
  { id: "Manajemen Perubahan", label: "Manajemen Perubahan" },
  { id: "Pelayanan Publik", label: "Pelayanan Publik" },
  { id: "Anti-Gratifikasi", label: "Anti-Gratifikasi" },
  { id: "Reformasi Birokrasi", label: "Reformasi Birokrasi" },
];

const ZI_NEWS_DATA = [
  {
    id: "berita-zi-1",
    title: "Kepala Kankemenag Barut Pimpin Deklarasi Pencanangan ZI Menuju WBK/WBBM",
    category: "Manajemen Perubahan",
    date: "28 Juli 2026",
    author: "Humas Kemenag Barut",
    views: 342,
    badgeColor: "bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300",
    excerpt: "Kepala Kantor Kementerian Agama Kabupaten Barito Utara bersama seluruh jajaran pejabat dan ASN mendeklarasikan penandatanganan komitmen bersama Pembangunan Zona Integritas (ZI) menuju Wilayah Bebas dari Korupsi (WBK).",
    content: `Muara Teweh (Humas) — Kepala Kantor Kementerian Agama Kabupaten Barito Utara memimpin langsung kegiatan Penandatanganan Komitmen Bersama dan Deklarasi Pencanangan Pembangunan Zona Integritas (ZI) menuju Wilayah Bebas dari Korupsi (WBK) serta Wilayah Birokrasi Bersih dan Melayani (WBBM).

Acara yang berlangsung khidmat di aula utama Kantor Kementerian Agama Kabupaten Barito Utara ini dihadiri oleh seluruh Kepala Seksi, Penyelenggara, Kepala KUA Kecamatan, Kepala Madrasah Negeri, serta seluruh ASN dan Pegawai PPPK di lingkungan Kankemenag Barito Utara.

Dalam pengarahannya, Kepala Kankemenag menegaskan bahwa Pembangunan Zona Integritas bukan sekadar slogan atau formalitas administratif di atas kertas, melainkan komitmen nyata seluruh elemen aparatur untuk mentransformasi pola pikir (mindset) dan budaya kerja (culture set) dalam melayani masyarakat.

"Pencanangan ZI ini adalah janji dan komitmen moral kita bersama kepada publik. Kita harus memastikan seluruh alur pelayanan keagamaan berjalan dengan bersih, akuntabel, bebas pungli, dan mengedepankan keramahan 5S (Senyum, Sapa, Salam, Sopan, Santun)," ujar beliau.

Deklarasi ini diakhiri dengan penandatanganan Piagam Komitmen Bersama oleh seluruh pimpinan unit kerja dan foto bersama sebagai penanda dimulainya aksi nyata 8 Area Perubahan Reformasi Birokrasi Kemenag Barito Utara.`,
  },
  {
    id: "berita-zi-2",
    title: "Peluncuran Layanan PTSP SI ATAK Berbasis Digital untuk Kemudahan Masyarakat",
    category: "Pelayanan Publik",
    date: "20 Juli 2026",
    author: "Tim Inovasi PTSP",
    views: 489,
    badgeColor: "bg-blue-100 text-blue-800 dark:bg-blue-950/60 dark:text-blue-300",
    excerpt: "Inovasi Pelayanan Terpadu Satu Pintu (PTSP SI ATAK) resmi diluncurkan secara terintegrasi guna mempermudah permohonan rekomendasi, pendaftaran nikah, dan pengajuan izin operasional keagamaan.",
    content: `Muara Teweh (Humas) — Dalam rangka meningkatkan kualitas dan efisiensi pelayanan publik, Kantor Kementerian Agama Kabupaten Barito Utara resmi mengintegrasikan sistem Pelayanan Terpadu Satu Pintu (PTSP SI ATAK) secara digital.

Aplikasi PTSP SI ATAK dirancang khusus untuk memangkas birokrasi, mempercepat durasi penyelesaian dokumen permohonan, serta memberikan kepastian waktu dan biaya bagi masyarakat penerima layanan.

Melalui portal ini, masyarakat dapat mengajukan permohonan izin operasional pondok pesantren, rekomendasi paspor haji/umrah, konsultasi zakat wakaf, hingga pencatatan layanan KUA secara online tanpa perlu bolak-balik ke kantor.

"Sistem ini dilengkapi fitur tracking status dokumen secara real-time. Pemohon dapat memantau posisi dokumen mereka dari smartphone. Ini bukti transparansi layanan yang kami bangun," jelas Koordinator PTSP.`,
  },
  {
    id: "berita-zi-3",
    title: "Sosialisasi Budaya Kerja 5S & Motto HAPAKAT bagi Seluruh Aparatur Kemenag Barut",
    category: "Reformasi Birokrasi",
    date: "15 Juli 2026",
    author: "Pokja Manajemen Perubahan",
    views: 275,
    badgeColor: "bg-purple-100 text-purple-800 dark:bg-purple-950/60 dark:text-purple-300",
    excerpt: "Penerapan etika pelayanan 5S (Senyum, Sapa, Salam, Sopan, Santun) serta nilai HAPAKAT (Harmonis, Amanah, Profesional, Akuntabel, Kreatif, Adil, Transparan) diwajibkan bagi seluruh petugas frontline.",
    content: `Muara Teweh (Humas) — Tim Pokja Manajemen Perubahan ZI Kankemenag Barito Utara menyelenggarakan Workshop Internal Sosialisasi Budaya Kerja 5S dan Internalisasi Motto Melayani dengan HAPAKAT.

Kegiatan ini bertujuan untuk menanamkan standar etika baku dalam menyambut dan melayani setiap pemohon informasi maupun layanan keagamaan di PTSP Kemenag Barito Utara.

Motto HAPAKAT yang merupakan akronim dari Harmonis, Amanah, Profesional, Akuntabel, Kreatif, Adil, dan Transparan dipasang di setiap ruang pelayanan dan menjadi pedoman tindak tanduk harian aparatur.

Seluruh pegawai berkomitmen untuk konsisten menerapkan senyum ramah dan kesantunan dalam menyapa masyarakat, guna menciptakan suasana pelayanan yang hangat, cepat, dan terpercaya.`,
  },
  {
    id: "berita-zi-4",
    title: "Penguatan Public Campaign Anti-Gratifikasi dan Pungli di Lingkungan Kemenag Barut",
    category: "Anti-Gratifikasi",
    date: "08 Juli 2026",
    author: "Tim Pokja Pengawasan",
    views: 310,
    badgeColor: "bg-rose-100 text-rose-800 dark:bg-rose-950/60 dark:text-rose-300",
    excerpt: "Spanduk dan media informasi penolakan segala bentuk gratifikasi dipasang di lokasi strategis sebagai komitmen menjaga kebersihan tata kelola dari praktik KKN.",
    content: `Muara Teweh (Humas) — Menguatkan komitmen integritas, Kankemenag Kabupaten Barito Utara mengencangkan gerakan Public Campaign Tolak Gratifikasi dan Pungutan Liar (Pungli).

Spanduk himbauan, standing banner, dan poster sosialisasi anti-gratifikasi dipasang pada area ruang tunggu PTSP, pintu masuk kantor, serta dipublikasikan melalui akun media sosial dan kanal website resmi Kemenag Barito Utara.

Masyarakat pengguna layanan diimbau secara tegas untuk tidak memberikan imbalan, uang ucapan terima kasih, atau hadiah dalam bentuk apapun kepada petugas pelayanan publik Kemenag Barito Utara.

Selain itu, Kemenag Barut juga membuka saluran pengaduan masyarakat melalui Whistleblowing System (WBS) dan SP4N-LAPOR! guna menampung laporan atau saran perbaikan layanan secara rahasia dan terlindungi.`,
  },
];

export default function BeritaZonaIntegritasShell() {
  const [mounted, setMounted] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [activeNews, setActiveNews] = useState(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (activeNews) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [activeNews]);

  const filteredNews = ZI_NEWS_DATA.filter((item) => {
    const matchesCategory =
      selectedCategory === "all" || item.category === selectedCategory;
    const matchesSearch =
      item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.excerpt.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.author.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <Providers>
      <Header />
      <main id="konten-utama" className="min-h-screen pt-24 sm:pt-28 md:pt-32 lg:pt-36 xl:pt-40">
        <main className="min-h-screen bg-slate-50 transition-colors dark:bg-slate-950">
          <PageBanner
            title="Berita & Informasi Zona Integritas"
            description="Kabar terkini mengenai kegiatan, sosialisasi, dan aksi nyata Pembangunan Zona Integritas (ZI) WBK/WBBM di lingkungan Kankemenag Kab. Barito Utara."
            breadcrumb={[
              { label: "Beranda", href: "/beranda" },
              { label: "Zona Integritas", href: "/zona-integritas/area-perubahan-zi" },
              { label: "Berita Zona Integritas" },
            ]}
          />

          <section className="relative w-full px-6 py-8 sm:px-10 sm:py-12 lg:px-16 xl:px-20">
            <div className="w-full space-y-8 sm:space-y-10">
              {/* Header Search & Filter Bar */}
              <div className="flex flex-col gap-5 rounded-3xl border border-slate-200/80 bg-white p-6 shadow-md dark:border-slate-800 dark:bg-slate-900 sm:p-7">
                <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                  <div>
                    <div className="inline-flex items-center gap-2 rounded-full border border-emerald-300/60 bg-emerald-100/80 px-3.5 py-1 text-xs font-bold uppercase tracking-wider text-emerald-800 dark:border-emerald-800/50 dark:bg-emerald-950/40 dark:text-emerald-300">
                      <Newspaper className="h-3.5 w-3.5" />
                      <span>Kabar Integritas</span>
                    </div>
                    <h2 className="mt-2 text-2xl font-black text-slate-900 dark:text-slate-100 sm:text-3xl">
                      Daftar Berita Pembangunan ZI
                    </h2>
                  </div>

                  {/* Search Bar */}
                  <div className="relative min-w-[280px] sm:min-w-[360px]">
                    <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Cari berita ZI, topik, atau kata kunci..."
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

                {/* Category Filter Tabs */}
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

              {/* News Cards Grid */}
              {filteredNews.length === 0 ? (
                <div className="flex flex-col items-center justify-center rounded-3xl border border-slate-200 bg-white p-12 text-center dark:border-slate-800 dark:bg-slate-900">
                  <Newspaper className="h-12 w-12 text-slate-300 dark:text-slate-600" />
                  <h3 className="mt-4 text-base font-bold text-slate-900 dark:text-slate-100">
                    Berita tidak ditemukan
                  </h3>
                  <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                    Coba gunakan kata kunci pencarian lain atau pilih kategori lain.
                  </p>
                </div>
              ) : (
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-2">
                  {filteredNews.map((news) => (
                    <article
                      key={news.id}
                      className="group relative flex flex-col justify-between overflow-hidden rounded-3xl border border-slate-200/80 bg-white shadow-md transition-all duration-300 hover:-translate-y-1 hover:border-emerald-500/40 hover:shadow-xl dark:border-slate-800 dark:bg-slate-900"
                    >
                      <div className="p-6 sm:p-7 space-y-4">
                        <div className="flex items-center justify-between gap-3">
                          <span className={`rounded-full px-3 py-1 text-[11px] font-bold ${news.badgeColor}`}>
                            {news.category}
                          </span>
                          <div className="flex items-center gap-3 text-xs text-slate-400">
                            <span className="flex items-center gap-1">
                              <Calendar className="h-3.5 w-3.5" />
                              {news.date}
                            </span>
                            <span className="flex items-center gap-1">
                              <Eye className="h-3.5 w-3.5" />
                              {news.views}
                            </span>
                          </div>
                        </div>

                        <div>
                          <h3 className="text-lg font-black leading-snug text-slate-900 group-hover:text-emerald-700 dark:text-slate-100 dark:group-hover:text-emerald-400 sm:text-xl">
                            {news.title}
                          </h3>
                          <p className="mt-3 text-xs leading-relaxed text-slate-600 dark:text-slate-400 sm:text-sm">
                            {news.excerpt}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center justify-between border-t border-slate-100 bg-slate-50/50 px-6 py-4 dark:border-slate-800 dark:bg-slate-900/50">
                        <div className="flex items-center gap-2 text-xs font-semibold text-slate-500 dark:text-slate-400">
                          <User className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" />
                          <span>{news.author}</span>
                        </div>

                        <button
                          onClick={() => setActiveNews(news)}
                          className="group/btn inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-4 py-2 text-xs font-bold text-white shadow-md transition-all hover:bg-emerald-500 hover:shadow-[0_4px_15px_rgba(16,185,129,0.3)]"
                        >
                          <span>Baca Selengkapnya</span>
                          <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover/btn:translate-x-1" />
                        </button>
                      </div>
                    </article>
                  ))}
                </div>
              )}
            </div>
          </section>

          {/* Modal Detail Berita */}
          {mounted &&
            activeNews &&
            createPortal(
              <div
                className="fixed inset-0 z-[99999] flex items-center justify-center bg-slate-950/50 p-4 sm:p-6 backdrop-blur-sm transition-all duration-300"
                onClick={() => setActiveNews(null)}
              >
                <div
                  className="relative flex h-[85vh] w-full max-w-4xl flex-col overflow-hidden rounded-3xl border border-slate-700/60 bg-slate-900 text-slate-100 shadow-2xl animate-in zoom-in-95 duration-200"
                  onClick={(e) => e.stopPropagation()}
                >
                  {/* Header Modal */}
                  <div className="flex items-center justify-between border-b border-slate-800 bg-slate-900/95 px-6 py-4">
                    <div className="flex items-center gap-2">
                      <span className={`rounded-full px-3 py-0.5 text-xs font-bold ${activeNews.badgeColor}`}>
                        {activeNews.category}
                      </span>
                      <span className="text-xs text-slate-400">• {activeNews.date}</span>
                    </div>

                    <button
                      onClick={() => setActiveNews(null)}
                      className="flex h-9 w-9 items-center justify-center rounded-xl bg-slate-800 text-slate-400 transition-colors hover:bg-red-500/20 hover:text-red-400"
                    >
                      <X className="h-5 w-5" />
                    </button>
                  </div>

                  {/* Body Content Scrollable */}
                  <div className="flex-1 overflow-y-auto p-6 sm:p-8 space-y-6">
                    <div>
                      <h2 className="text-2xl font-black text-white sm:text-3xl">
                        {activeNews.title}
                      </h2>
                      <div className="mt-3 flex items-center gap-4 text-xs text-slate-400">
                        <span className="flex items-center gap-1.5">
                          <User className="h-4 w-4 text-emerald-400" />
                          {activeNews.author}
                        </span>
                        <span className="flex items-center gap-1.5">
                          <Eye className="h-4 w-4 text-emerald-400" />
                          {activeNews.views} Dilihat
                        </span>
                      </div>
                    </div>

                    <div className="whitespace-pre-line text-sm leading-relaxed text-slate-300 space-y-4">
                      {activeNews.content}
                    </div>
                  </div>

                  {/* Footer Modal */}
                  <div className="border-t border-slate-800 bg-slate-950 px-6 py-4 flex items-center justify-between text-xs text-slate-400">
                    <span>Humas Kankemenag Kabupaten Barito Utara</span>
                    <button
                      onClick={() => setActiveNews(null)}
                      className="rounded-xl bg-slate-800 px-4 py-2 font-bold text-white hover:bg-slate-700"
                    >
                      Tutup Berita
                    </button>
                  </div>
                </div>
              </div>,
              document.body
            )}
        </main>
      </main>
      <Footer />
    </Providers>
  );
}