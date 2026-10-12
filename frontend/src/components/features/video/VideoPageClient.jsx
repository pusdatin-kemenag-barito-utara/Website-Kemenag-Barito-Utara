"use client";

import React, { useState, useEffect, useMemo, useRef } from "react";
import Image from "@/components/common/NextImage";
import { getPocketBase } from "@/lib/pocketbase/client";

export default function VideoPageClient({ videos: initialVideos = [] }) {
  const [videoList, setVideoList] = useState(initialVideos);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeModalVideo, setActiveModalVideo] = useState(null);
  const [spotlightVideo, setSpotlightVideo] = useState(initialVideos[0] || null);
  const [currentPage, setCurrentPage] = useState(1);
  const [copiedId, setCopiedId] = useState(null);
  const spotlightRef = useRef(null);

  // Sinkronkan initialVideos jika ada update props
  useEffect(() => {
    if (initialVideos && initialVideos.length > 0) {
      setVideoList(initialVideos);
      if (!spotlightVideo) {
        setSpotlightVideo(initialVideos[0]);
      }
    }
  }, [initialVideos]);

  // Realtime SSE Synchronization via PocketBase
  useEffect(() => {
    const pb = getPocketBase();
    if (!pb) return;

    let isSubscribed = true;

    const setupRealtime = async () => {
      try {
        await pb.collection("youtube_videos").subscribe("*", (e) => {
          if (!isSubscribed) return;
          if (e.action === "create" && e.record.is_published) {
            setVideoList((prev) => {
              const exists = prev.some((v) => v.id === e.record.id);
              if (exists) return prev;
              const newItem = {
                ...e.record,
                id: String(e.record.id),
                title: (e.record.title || "").trim(),
                created_at: e.record.created || e.record.created_at || null,
              };
              return [newItem, ...prev].sort((a, b) => (a.sort_order || 0) - (b.sort_order || 0));
            });
          } else if (e.action === "update") {
            setVideoList((prev) => {
              if (!e.record.is_published) {
                return prev.filter((v) => v.id !== e.record.id);
              }
              return prev.map((v) =>
                v.id === e.record.id
                  ? {
                      ...e.record,
                      id: String(e.record.id),
                      title: (e.record.title || "").trim(),
                      created_at: e.record.created || e.record.created_at || null,
                    }
                  : v
              );
            });
          } else if (e.action === "delete") {
            setVideoList((prev) => prev.filter((v) => v.id !== e.record.id));
          }
        });
      } catch (err) {
        console.warn("[VideoRealtime] Gagal inisialisasi SSE:", err);
      }
    };

    setupRealtime();

    return () => {
      isSubscribed = false;
      try {
        pb.collection("youtube_videos").unsubscribe("*");
      } catch {
        // ignore unsubscribe errors
      }
    };
  }, []);

  // Filter video berdasarkan input pencarian
  const filteredVideos = useMemo(() => {
    if (!searchQuery.trim()) return videoList;
    const q = searchQuery.toLowerCase().trim();
    return videoList.filter(
      (v) =>
        (v.title && v.title.toLowerCase().includes(q)) ||
        (v.youtube_id && v.youtube_id.toLowerCase().includes(q))
    );
  }, [videoList, searchQuery]);

  const itemsPerPage = 8;
  const totalPages = Math.ceil(filteredVideos.length / itemsPerPage);

  const paginatedVideos = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredVideos.slice(start, start + itemsPerPage);
  }, [filteredVideos, currentPage]);

  // Reset pagination saat pencarian berubah
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery]);

  // Kunci scroll saat modal aktif
  useEffect(() => {
    if (activeModalVideo) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [activeModalVideo]);

  // Handler salin link video
  const handleCopyLink = (vid) => {
    const url = `https://www.youtube.com/watch?v=${vid.youtube_id}`;
    if (navigator?.clipboard?.writeText) {
      navigator.clipboard.writeText(url).then(() => {
        setCopiedId(vid.id);
        setTimeout(() => setCopiedId(null), 2500);
      });
    }
  };

  const handleSelectSpotlight = (vid) => {
    setSpotlightVideo(vid);
    if (spotlightRef.current) {
      spotlightRef.current.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  if (!videoList || videoList.length === 0) {
    return (
      <div className="flex min-h-[450px] flex-col items-center justify-center rounded-[2.5rem] border border-dashed border-slate-200 bg-gradient-to-b from-slate-50 to-white px-6 py-16 text-center dark:border-slate-800 dark:from-slate-900/40 dark:to-slate-950">
        <div className="mb-5 flex h-20 w-20 items-center justify-center rounded-3xl bg-red-50 text-red-600 shadow-xl shadow-red-500/10 dark:bg-red-950/40 dark:text-red-400">
          <svg className="h-10 w-10" fill="currentColor" viewBox="0 0 24 24">
            <path d="M19.615 3.184c-3.604-.246-11.631-.245-15.23 0-3.897.266-4.356 2.62-4.385 8.816.029 6.185.484 8.549 4.385 8.816 3.6.245 11.626.246 15.23 0 3.897-.266 4.356-2.62 4.385-8.816-.029-6.185-.484-8.549-4.385-8.816zm-10.615 12.816v-8l8 3.993-8 4.007z" />
          </svg>
        </div>
        <h3 className="mb-2 text-xl font-black text-slate-900 dark:text-white">
          Dokumentasi Video Belum Tersedia
        </h3>
        <p className="max-w-md text-sm leading-relaxed text-slate-500 dark:text-slate-400">
          Kanal video resmi sedang dalam proses pembaruan data. Silakan kunjungi kanal resmi kami langsung di YouTube.
        </p>
        <a
          href="https://www.youtube.com/@KemenagBaritoUtara"
          target="_blank"
          rel="noopener noreferrer"
          className="mt-6 inline-flex items-center gap-2.5 rounded-2xl bg-red-600 px-6 py-3.5 text-sm font-bold text-white shadow-xl shadow-red-600/25 transition-all hover:bg-red-700 hover:shadow-2xl hover:shadow-red-600/35 active:scale-95"
        >
          <svg className="h-5 w-5 fill-current" viewBox="0 0 24 24">
            <path d="M19.615 3.184c-3.604-.246-11.631-.245-15.23 0-3.897.266-4.356 2.62-4.385 8.816.029 6.185.484 8.549 4.385 8.816 3.6.245 11.626.246 15.23 0 3.897-.266 4.356-2.62 4.385-8.816-.029-6.185-.484-8.549-4.385-8.816zm-10.615 12.816v-8l8 3.993-8 4.007z" />
          </svg>
          <span>Kunjungi Kanal @KemenagBaritoUtara</span>
        </a>
      </div>
    );
  }

  const currentSpotlight = spotlightVideo || videoList[0];

  return (
    <div className="space-y-12 sm:space-y-16">
      {/* ── 1. SPOTLIGHT CINEMATIC PLAYER ── */}
      <div ref={spotlightRef} className="scroll-mt-36">
        <div className="relative overflow-hidden rounded-[2.5rem] border border-slate-200/80 bg-white p-4 shadow-2xl shadow-slate-200/60 dark:border-slate-800 dark:bg-slate-900/90 dark:shadow-slate-950 sm:p-6 lg:p-8">
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-12 lg:gap-8 items-center">
            {/* Player Container */}
            <div className="lg:col-span-8">
              <div className="relative aspect-video w-full overflow-hidden rounded-2xl bg-black shadow-2xl ring-1 ring-black/10 sm:rounded-3xl">
                <iframe
                  src={`https://www.youtube-nocookie.com/embed/${currentSpotlight.youtube_id}?autoplay=0&rel=0`}
                  title={currentSpotlight.title || "Video Dokumentasi Kemenag Barito Utara"}
                  loading="lazy"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                  allowFullScreen
                  className="absolute inset-0 h-full w-full border-0"
                />
              </div>
            </div>

            {/* Spotlight Metadata & Quick Actions */}
            <div className="flex flex-col justify-between space-y-6 lg:col-span-4">
              <div>
                <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-red-200 bg-red-50 px-3.5 py-1 text-xs font-black uppercase tracking-widest text-red-600 dark:border-red-500/20 dark:bg-red-500/10 dark:text-red-400">
                  <span className="h-2 w-2 rounded-full bg-red-600 animate-pulse" />
                  <span>Sedang Diputar</span>
                </div>
                <h2 className="text-xl font-black leading-snug text-slate-900 dark:text-white sm:text-2xl line-clamp-3">
                  {currentSpotlight.title}
                </h2>
                <div className="mt-4 flex flex-wrap items-center gap-3 text-xs font-semibold text-slate-500 dark:text-slate-400">
                  <div className="flex items-center gap-1.5">
                    <svg className="h-4 w-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    <span>
                      {currentSpotlight.created_at
                        ? new Date(currentSpotlight.created_at).toLocaleDateString("id-ID", {
                            day: "numeric",
                            month: "long",
                            year: "numeric",
                          })
                        : "Kemenag Barito Utara"}
                    </span>
                  </div>
                  <span>•</span>
                  <span className="font-mono text-[11px] text-slate-400">
                    ID: {currentSpotlight.youtube_id}
                  </span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="space-y-3 pt-2">
                <a
                  href={`https://www.youtube.com/watch?v=${currentSpotlight.youtube_id}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex w-full items-center justify-center gap-2.5 rounded-2xl bg-red-600 px-5 py-3.5 text-sm font-bold text-white shadow-lg shadow-red-600/25 transition-all duration-300 hover:bg-red-700 hover:shadow-xl hover:shadow-red-600/35 hover:-translate-y-0.5 active:scale-95"
                >
                  <svg className="h-5 w-5 fill-current" viewBox="0 0 24 24">
                    <path d="M19.615 3.184c-3.604-.246-11.631-.245-15.23 0-3.897.266-4.356 2.62-4.385 8.816.029 6.185.484 8.549 4.385 8.816 3.6.245 11.626.246 15.23 0 3.897-.266 4.356-2.62 4.385-8.816-.029-6.185-.484-8.549-4.385-8.816zm-10.615 12.816v-8l8 3.993-8 4.007z" />
                  </svg>
                  <span>Buka di YouTube</span>
                </a>

                <div className="grid grid-cols-2 gap-2.5">
                  <button
                    type="button"
                    onClick={() => setActiveModalVideo(currentSpotlight)}
                    className="flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-3 text-xs font-bold text-slate-700 transition-colors hover:bg-slate-100 dark:border-slate-800 dark:bg-slate-800/60 dark:text-slate-300 dark:hover:bg-slate-800"
                  >
                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
                    </svg>
                    <span>Layar Penuh</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleCopyLink(currentSpotlight)}
                    className="flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-3 text-xs font-bold text-slate-700 transition-colors hover:bg-slate-100 dark:border-slate-800 dark:bg-slate-800/60 dark:text-slate-300 dark:hover:bg-slate-800"
                  >
                    {copiedId === currentSpotlight.id ? (
                      <>
                        <svg className="h-4 w-4 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                        </svg>
                        <span className="text-emerald-600 dark:text-emerald-400">Tersalin!</span>
                      </>
                    ) : (
                      <>
                        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                        </svg>
                        <span>Salin Link</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>



      {/* ── 3. SEARCH & VIDEO DIRECTORY HEADER ── */}
      <div>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-200 dark:border-slate-800">
          <div>
            <h4 className="text-xl font-black text-slate-900 dark:text-white">
              Daftar Semua Video
            </h4>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Menampilkan {filteredVideos.length} dokumentasi video resmi
            </p>
          </div>

          {/* Search Input Box */}
          <div className="relative w-full sm:w-80">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Cari judul video..."
              className="w-full rounded-2xl border border-slate-200 bg-white py-2.5 pl-10 pr-10 text-sm text-slate-900 shadow-sm transition-all focus:border-red-500 focus:outline-none focus:ring-4 focus:ring-red-500/10 dark:border-slate-800 dark:bg-slate-900 dark:text-white dark:focus:border-red-500"
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
        </div>

        {/* ── 4. VIDEO GRID ── */}
        {paginatedVideos.length === 0 ? (
          <div className="mt-8 rounded-3xl border border-slate-200 bg-slate-50 py-16 text-center dark:border-slate-800 dark:bg-slate-900/40">
            <p className="text-sm font-semibold text-slate-500 dark:text-slate-400">
              Tidak ada video yang cocok dengan kata kunci &quot;{searchQuery}&quot;.
            </p>
            <button
              type="button"
              onClick={() => setSearchQuery("")}
              className="mt-3 text-xs font-bold text-red-600 hover:underline dark:text-red-400"
            >
              Reset Pencarian
            </button>
          </div>
        ) : (
          <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {paginatedVideos.map((video) => {
              const isSelected = currentSpotlight.id === video.id;
              return (
                <div
                  key={video.id}
                  className={`group relative flex flex-col rounded-3xl overflow-hidden transition-all duration-300 bg-white border ${
                    isSelected
                      ? "border-red-500 ring-2 ring-red-500/30 shadow-xl shadow-red-500/10 dark:border-red-500"
                      : "border-slate-200/80 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.06)] hover:shadow-2xl hover:shadow-slate-200/60 hover:-translate-y-1.5 dark:border-slate-800 dark:bg-slate-900/60 dark:shadow-none dark:hover:border-slate-700"
                  }`}
                >
                  {/* Thumbnail Container */}
                  <div
                    onClick={() => handleSelectSpotlight(video)}
                    className="relative aspect-video w-full cursor-pointer overflow-hidden bg-slate-900"
                  >
                    <Image
                      src={`https://img.youtube.com/vi/${video.youtube_id}/hqdefault.jpg`}
                      alt={video.title}
                      fill
                      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
                      className="object-cover transition-transform duration-700 group-hover:scale-105"
                      unoptimized
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950/70 via-transparent to-transparent opacity-80 transition-opacity group-hover:opacity-90" />

                    {/* Play Badge Overlay */}
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/20 backdrop-blur-md shadow-xl transition-all duration-300 group-hover:scale-110 group-hover:bg-red-600">
                        <svg className="ml-0.5 h-5 w-5 text-white" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M8 5v14l11-7z" />
                        </svg>
                      </div>
                    </div>

                    {/* Selected Badge */}
                    {isSelected && (
                      <div className="absolute top-3 left-3 flex items-center gap-1.5 rounded-lg bg-red-600 px-2.5 py-1 text-[10px] font-black uppercase tracking-wider text-white shadow-md">
                        <span className="h-1.5 w-1.5 rounded-full bg-white animate-pulse" />
                        <span>Sedang Diputar</span>
                      </div>
                    )}
                  </div>

                  {/* Card Content */}
                  <div className="flex flex-1 flex-col justify-between p-5">
                    <div>
                      <h5
                        onClick={() => handleSelectSpotlight(video)}
                        className="cursor-pointer text-sm font-bold leading-relaxed text-slate-900 transition-colors duration-200 hover:text-red-600 dark:text-slate-100 dark:hover:text-red-400 line-clamp-2"
                      >
                        {video.title}
                      </h5>
                    </div>

                    <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400">
                      <div className="flex items-center gap-1.5 font-medium">
                        <span className="h-1.5 w-1.5 rounded-full bg-red-500" />
                        <span>YouTube</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => setActiveModalVideo(video)}
                          title="Tonton di Modal"
                          className="rounded-lg p-1 text-slate-400 hover:bg-slate-100 hover:text-red-600 dark:hover:bg-slate-800 dark:hover:text-red-400"
                        >
                          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
                          </svg>
                        </button>
                        <button
                          type="button"
                          onClick={() => handleCopyLink(video)}
                          title="Salin Tautan"
                          className="rounded-lg p-1 text-slate-400 hover:bg-slate-100 hover:text-red-600 dark:hover:bg-slate-800 dark:hover:text-red-400"
                        >
                          {copiedId === video.id ? (
                            <svg className="h-4 w-4 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                            </svg>
                          ) : (
                            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                              <path strokeLinecap="round" strokeLinejoin="round" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                            </svg>
                          )}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* ── 5. PAGINATION CONTROLS ── */}
        {totalPages > 1 && (
          <div className="mt-12 flex items-center justify-center gap-2">
            <button
              onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
              className="flex h-11 w-11 items-center justify-center rounded-2xl border border-slate-200 bg-white text-slate-600 transition-colors hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-400 dark:hover:bg-slate-800"
            >
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
              </svg>
            </button>

            <div className="flex items-center gap-2">
              {[...Array(totalPages)].map((_, i) => (
                <button
                  key={i}
                  onClick={() => setCurrentPage(i + 1)}
                  className={`flex h-11 w-11 items-center justify-center rounded-2xl text-sm font-black transition-all ${
                    currentPage === i + 1
                      ? "bg-red-600 text-white shadow-lg shadow-red-600/30"
                      : "border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-400 dark:hover:bg-slate-800"
                  }`}
                >
                  {i + 1}
                </button>
              ))}
            </div>

            <button
              onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
              disabled={currentPage === totalPages}
              className="flex h-11 w-11 items-center justify-center rounded-2xl border border-slate-200 bg-white text-slate-600 transition-colors hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-400 dark:hover:bg-slate-800"
            >
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>
        )}
      </div>

      {/* ── 6. FLOATING VIDEO FOCUS MODAL ── */}
      {activeModalVideo && (
        <div className="fixed inset-0 z-[120] flex items-center justify-center p-4 sm:p-6">
          <div
            className="absolute inset-0 bg-slate-950/85 backdrop-blur-md transition-opacity"
            onClick={() => setActiveModalVideo(null)}
          />
          <div className="relative w-full max-w-5xl overflow-hidden rounded-3xl border border-slate-800 bg-black shadow-2xl shadow-black animate-in fade-in zoom-in-95 duration-200">
            <button
              onClick={() => setActiveModalVideo(null)}
              className="absolute top-4 right-4 z-50 flex h-11 w-11 items-center justify-center rounded-full bg-black/60 text-white backdrop-blur-md transition-all hover:bg-red-600 hover:scale-110"
            >
              <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>

            <div className="relative aspect-video w-full bg-black">
              <iframe
                src={`https://www.youtube-nocookie.com/embed/${activeModalVideo.youtube_id}?autoplay=1&rel=0`}
                title={activeModalVideo.title || "Video Dokumentasi Kemenag Barito Utara"}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                allowFullScreen
                className="absolute inset-0 h-full w-full border-0"
              />
            </div>

            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-t border-slate-800 bg-slate-900/95 p-5 sm:p-6">
              <div className="min-w-0 flex-1">
                <h3 className="text-base sm:text-lg font-black text-white line-clamp-1">
                  {activeModalVideo.title}
                </h3>
                <p className="mt-1 text-xs text-slate-400">
                  Dipublikasikan pada kanal resmi YouTube Kemenag Barito Utara
                </p>
              </div>

              <a
                href={`https://www.youtube.com/watch?v=${activeModalVideo.youtube_id}`}
                target="_blank"
                rel="noopener noreferrer"
                className="shrink-0 inline-flex items-center gap-2 rounded-xl bg-red-600 px-5 py-2.5 text-xs font-bold text-white transition-colors hover:bg-red-700"
              >
                <span>Buka di YouTube</span>
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                </svg>
              </a>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
