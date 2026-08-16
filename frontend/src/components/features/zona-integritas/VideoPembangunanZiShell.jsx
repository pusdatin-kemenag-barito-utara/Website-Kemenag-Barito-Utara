"use client";

import React, { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import {
  Video,
  Play,
  Search,
  Calendar,
  Clock,
  Eye,
  Filter,
  X,
  Film,
} from "lucide-react";
import Providers from "@/components/layout/Providers";
import Header from "@/components/layout/Header/Header";
import Footer from "@/components/layout/Footer/Footer";
import PageBanner from "@/components/common/PageBanner";

const CATEGORIES = [
  { id: "all", label: "Semua Video" },
  { id: "Profil ZI", label: "Profil ZI" },
  { id: "Sosialisasi 5S", label: "Sosialisasi 5S" },
  { id: "Anti-Gratifikasi", label: "Anti-Gratifikasi" },
  { id: "Digitalisasi PTSP", label: "Digitalisasi PTSP" },
];

const ZI_VIDEOS_DATA = [
  {
    id: "vid-zi-1",
    title: "Video Profil Pembangunan Zona Integritas Kemenag Barito Utara",
    category: "Profil ZI",
    date: "25 Juli 2026",
    duration: "05:42",
    views: 840,
    badgeColor: "bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300",
    description: "Gambaran umum komitmen dan langkah konkrit Kankemenag Kab. Barito Utara dalam mewujudkan Zone Integritas menuju WBK/WBBM.",
    youtubeId: "dQw4w9WgXcQ",
    embedUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ",
  },
  {
    id: "vid-zi-2",
    title: "Sosialisasi Budaya Kerja 5S & Motto Melayani dengan HAPAKAT",
    category: "Sosialisasi 5S",
    date: "18 Juli 2026",
    duration: "03:15",
    views: 620,
    badgeColor: "bg-blue-100 text-blue-800 dark:bg-blue-950/60 dark:text-blue-300",
    description: "Panduan etika pelayanan ramah (Senyum, Sapa, Salam, Sopan, Santun) serta nilai HAPAKAT bagi petugas frontline.",
    youtubeId: "dQw4w9WgXcQ",
    embedUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ",
  },
  {
    id: "vid-zi-3",
    title: "Public Campaign Penolakan Pungli & Tolak Gratifikasi Kemenag Barut",
    category: "Anti-Gratifikasi",
    date: "10 Juli 2026",
    duration: "02:50",
    views: 510,
    badgeColor: "bg-rose-100 text-rose-800 dark:bg-rose-950/60 dark:text-rose-300",
    description: "Imbauan resmi kepastian transparansi biaya layanan dan penolakan tegas terhadap segala bentuk imbalan ilegal.",
    youtubeId: "dQw4w9WgXcQ",
    embedUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ",
  },
  {
    id: "vid-zi-4",
    title: "Panduan Penggunaan Layanan Terpadu PTSP SI ATAK Berbasis Digital",
    category: "Digitalisasi PTSP",
    date: "05 Juli 2026",
    duration: "04:10",
    views: 730,
    badgeColor: "bg-purple-100 text-purple-800 dark:bg-purple-950/60 dark:text-purple-300",
    description: "Tutorial alur permohonan rekomendasi keagamaan dan pencatatan nikah secara online melalui portal PTSP SI ATAK.",
    youtubeId: "dQw4w9WgXcQ",
    embedUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ",
  },
];

export default function VideoPembangunanZiShell() {
  const [mounted, setMounted] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [activeVideo, setActiveVideo] = useState(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (activeVideo) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [activeVideo]);

  const filteredVideos = ZI_VIDEOS_DATA.filter((item) => {
    const matchesCategory =
      selectedCategory === "all" || item.category === selectedCategory;
    const matchesSearch =
      item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <Providers>
      <Header />
      <main id="konten-utama" className="min-h-screen pt-24 sm:pt-28 md:pt-32 lg:pt-36 xl:pt-40">
        <main className="min-h-screen bg-slate-50 transition-colors dark:bg-slate-950">
          <PageBanner
            title="Video Pembangunan Zona Integritas"
            description="Dokumentasi audio visual sosialisasi, kampanye publik, serta inovasi pelayanan Pembangunan Zona Integritas (ZI) Kankemenag Kab. Barito Utara."
            breadcrumb={[
              { label: "Beranda", href: "/beranda" },
              { label: "Zona Integritas", href: "/zona-integritas/area-perubahan-zi" },
              { label: "Video Pembangunan ZI" },
            ]}
          />

          <section className="relative w-full px-6 py-8 sm:px-10 sm:py-12 lg:px-16 xl:px-20">
            <div className="w-full space-y-8 sm:space-y-10">
              {/* Header Search & Filter Bar */}
              <div className="flex flex-col gap-5 rounded-3xl border border-slate-200/80 bg-white p-6 shadow-md dark:border-slate-800 dark:bg-slate-900 sm:p-7">
                <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                  <div>
                    <div className="inline-flex items-center gap-2 rounded-full border border-emerald-300/60 bg-emerald-100/80 px-3.5 py-1 text-xs font-bold uppercase tracking-wider text-emerald-800 dark:border-emerald-800/50 dark:bg-emerald-950/40 dark:text-emerald-300">
                      <Film className="h-3.5 w-3.5" />
                      <span>Media Galeri ZI</span>
                    </div>
                    <h2 className="mt-2 text-2xl font-black text-slate-900 dark:text-slate-100 sm:text-3xl">
                      Galeri Video Dokumentasi &amp; Sosialisasi
                    </h2>
                  </div>

                  {/* Search Bar */}
                  <div className="relative min-w-[280px] sm:min-w-[360px]">
                    <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Cari judul video atau sosialisasi..."
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

              {/* Videos Grid */}
              {filteredVideos.length === 0 ? (
                <div className="flex flex-col items-center justify-center rounded-3xl border border-slate-200 bg-white p-12 text-center dark:border-slate-800 dark:bg-slate-900">
                  <Video className="h-12 w-12 text-slate-300 dark:text-slate-600" />
                  <h3 className="mt-4 text-base font-bold text-slate-900 dark:text-slate-100">
                    Video tidak ditemukan
                  </h3>
                  <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                    Coba gunakan kata kunci pencarian lain atau ganti kategori.
                  </p>
                </div>
              ) : (
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-2">
                  {filteredVideos.map((vid) => (
                    <div
                      key={vid.id}
                      className="group relative flex flex-col justify-between overflow-hidden rounded-3xl border border-slate-200/80 bg-white shadow-md transition-all duration-300 hover:-translate-y-1 hover:border-emerald-500/40 hover:shadow-xl dark:border-slate-800 dark:bg-slate-900"
                    >
                      {/* Thumbnail Container */}
                      <div className="relative aspect-video w-full overflow-hidden bg-slate-900">
                        <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/20 to-transparent opacity-60 group-hover:opacity-40 transition-opacity" />

                        <div className="absolute inset-0 flex items-center justify-center">
                          <button
                            onClick={() => setActiveVideo(vid)}
                            className="flex h-16 w-16 items-center justify-center rounded-full bg-emerald-600/90 text-white shadow-xl backdrop-blur-sm transition-all duration-300 group-hover:scale-110 group-hover:bg-emerald-500 hover:shadow-[0_0_30px_rgba(16,185,129,0.5)]"
                          >
                            <Play className="h-7 w-7 translate-x-0.5 fill-current" />
                          </button>
                        </div>

                        <div className="absolute top-4 left-4">
                          <span className={`rounded-full px-3 py-1 text-[11px] font-bold shadow-md ${vid.badgeColor}`}>
                            {vid.category}
                          </span>
                        </div>

                        <div className="absolute bottom-4 right-4 flex items-center gap-1.5 rounded-full bg-slate-950/80 px-3 py-1 text-[11px] font-bold text-white backdrop-blur-md">
                          <Clock className="h-3.5 w-3.5 text-emerald-400" />
                          <span>{vid.duration}</span>
                        </div>
                      </div>

                      {/* Body Content */}
                      <div className="p-6 space-y-3">
                        <div className="flex items-center gap-4 text-xs text-slate-400">
                          <span className="flex items-center gap-1">
                            <Calendar className="h-3.5 w-3.5" />
                            {vid.date}
                          </span>
                          <span className="flex items-center gap-1">
                            <Eye className="h-3.5 w-3.5" />
                            {vid.views} Dilihat
                          </span>
                        </div>

                        <h3 className="text-lg font-black leading-snug text-slate-900 group-hover:text-emerald-700 dark:text-slate-100 dark:group-hover:text-emerald-400 sm:text-xl">
                          {vid.title}
                        </h3>

                        <p className="text-xs leading-relaxed text-slate-600 dark:text-slate-400 sm:text-sm">
                          {vid.description}
                        </p>
                      </div>

                      <div className="border-t border-slate-100 bg-slate-50/50 p-4 dark:border-slate-800 dark:bg-slate-900/50">
                        <button
                          onClick={() => setActiveVideo(vid)}
                          className="flex w-full items-center justify-center gap-2 rounded-xl bg-emerald-600 px-4 py-2.5 text-xs font-bold text-white shadow-md transition-all hover:bg-emerald-500 hover:shadow-[0_4px_15px_rgba(16,185,129,0.3)]"
                        >
                          <Play className="h-3.5 w-3.5 fill-current" />
                          <span>Putar Video Sosialisasi</span>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </section>

          {/* Floating Video Modal Portal */}
          {mounted &&
            activeVideo &&
            createPortal(
              <div
                className="fixed inset-0 z-[99999] flex items-center justify-center bg-slate-950/60 p-4 sm:p-6 backdrop-blur-md transition-all duration-300"
                onClick={() => setActiveVideo(null)}
              >
                <div
                  className="relative flex h-[85vh] w-full max-w-5xl flex-col overflow-hidden rounded-3xl border border-slate-700/60 bg-slate-900 text-slate-100 shadow-2xl animate-in zoom-in-95 duration-200"
                  onClick={(e) => e.stopPropagation()}
                >
                  {/* Header Modal */}
                  <div className="flex items-center justify-between border-b border-slate-800 bg-slate-900/95 px-6 py-4">
                    <div className="flex items-center gap-2 min-w-0">
                      <span className={`rounded-full px-3 py-0.5 text-xs font-bold ${activeVideo.badgeColor}`}>
                        {activeVideo.category}
                      </span>
                      <h3 className="truncate text-xs font-bold text-white sm:text-base">
                        {activeVideo.title}
                      </h3>
                    </div>

                    <button
                      onClick={() => setActiveVideo(null)}
                      className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-slate-800 text-slate-400 transition-colors hover:bg-red-500/20 hover:text-red-400"
                    >
                      <X className="h-5 w-5" />
                    </button>
                  </div>

                  {/* Video Player Frame Container */}
                  <div className="relative flex-1 bg-black">
                    <iframe
                      src={activeVideo.embedUrl}
                      title={activeVideo.title}
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                      className="h-full w-full border-0"
                    />
                  </div>

                  {/* Footer Info */}
                  <div className="border-t border-slate-800 bg-slate-950 p-5 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between text-xs text-slate-400">
                    <p className="font-medium text-slate-300">{activeVideo.description}</p>
                    <span className="shrink-0 font-bold text-emerald-400">{activeVideo.duration} • {activeVideo.date}</span>
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