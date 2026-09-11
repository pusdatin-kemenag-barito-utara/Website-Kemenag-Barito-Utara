"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import { createPortal } from "react-dom";
import {
  X,
  ExternalLink,
  Maximize2,
  Minimize2,
  FileText,
  Loader2,
  AlertCircle,
  PanelLeftClose,
  PanelLeft,
  RefreshCw,
} from "lucide-react";
import { trackDocumentPreview } from "@/lib/analytics";

const CDN_PDFJS = "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/4.10.38/pdf.min.mjs";
const CDN_PDFJS_WORKER = "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/4.10.38/pdf.worker.min.mjs";

let pdfjsLibPromise = null;

function loadPdfJs() {
  if (typeof window === "undefined") return Promise.reject(new Error("SSR not supported"));
  if (window.pdfjsLib) return Promise.resolve(window.pdfjsLib);

  if (!pdfjsLibPromise) {
    pdfjsLibPromise = new Promise((resolve, reject) => {
      // Menggunakan new Function agar Vite tidak menganalisis URL folder /public saat build/dev transform
      try {
        const dynamicImport = new Function("specifier", "return import(specifier);");
        dynamicImport("/vendor/pdfjs/pdf.min.mjs")
          .then((lib) => {
            lib.GlobalWorkerOptions.workerSrc = "/vendor/pdfjs/pdf.worker.min.mjs";
            window.pdfjsLib = lib;
            resolve(lib);
          })
          .catch((err) => {
            console.warn("Gagal memuat local PDF.js, beralih ke CDN fallback:", err);
            dynamicImport(CDN_PDFJS)
              .then((lib) => {
                lib.GlobalWorkerOptions.workerSrc = CDN_PDFJS_WORKER;
                window.pdfjsLib = lib;
                resolve(lib);
              })
              .catch(reject);
          });
      } catch (err) {
        reject(err);
      }
    });
  }
  return pdfjsLibPromise;
}

// Subkomponen: Lembar Halaman PDF Canvas
function PdfPageItem({ pageNumber, numPages, pdfDoc, scale, rotation, scrollContainerRef }) {
  const containerRef = useRef(null);
  const canvasRef = useRef(null);
  const renderTaskRef = useRef(null);
  const [isRendered, setIsRendered] = useState(false);
  const [pageDimensions, setPageDimensions] = useState(null);

  // Ambil dimensi asli halaman dari PDF.js
  useEffect(() => {
    let cancelled = false;
    pdfDoc.getPage(pageNumber).then((page) => {
      if (cancelled) return;
      const vp = page.getViewport({ scale: 1.0, rotation: 0 });
      setPageDimensions({ width: vp.width, height: vp.height });
    });
    return () => {
      cancelled = true;
    };
  }, [pdfDoc, pageNumber]);

  // Render canvas dengan resolusi tajam (Retina / High DPI display)
  const renderCanvas = useCallback(async () => {
    if (!pdfDoc || !canvasRef.current) return;

    try {
      if (renderTaskRef.current) {
        renderTaskRef.current.cancel();
      }

      const page = await pdfDoc.getPage(pageNumber);
      const canvas = canvasRef.current;
      if (!canvas) return;

      const context = canvas.getContext("2d");
      const viewport = page.getViewport({ scale, rotation });
      const outputScale = Math.min(window.devicePixelRatio || 1, 2);

      // Resolusi internal canvas pixel
      canvas.width = Math.floor(viewport.width * outputScale);
      canvas.height = Math.floor(viewport.height * outputScale);

      // Dimensi CSS styling agar pas di layar
      canvas.style.width = `${Math.floor(viewport.width)}px`;
      canvas.style.height = `${Math.floor(viewport.height)}px`;

      context.clearRect(0, 0, canvas.width, canvas.height);

      const transform = outputScale !== 1 ? [outputScale, 0, 0, outputScale, 0, 0] : null;

      const renderContext = {
        canvasContext: context,
        transform,
        viewport,
      };

      const task = page.render(renderContext);
      renderTaskRef.current = task;
      await task.promise;
      setIsRendered(true);
    } catch (err) {
      if (err?.name !== "RenderingCancelledException") {
        console.warn(`Render error page ${pageNumber}:`, err);
      }
    }
  }, [pdfDoc, pageNumber, scale, rotation]);

  // Lazy render dengan IntersectionObserver agar dokumen ratusan halaman tetap sangat ringan & hemat memori HP
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            renderCanvas();
          }
        });
      },
      {
        root: scrollContainerRef?.current || null,
        rootMargin: "900px 0px 900px 0px",
        threshold: 0.01,
      }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [renderCanvas, scrollContainerRef]);

  // Re-render jika skala berubah (misal saat rotasi layar atau resize layar HP/Desktop)
  useEffect(() => {
    if (isRendered) {
      renderCanvas();
    }
  }, [scale, rotation, renderCanvas, isRendered]);

  const isRotated = rotation % 180 !== 0;
  const rawWidth = pageDimensions?.width || 595;
  const rawHeight = pageDimensions?.height || 842;
  const viewWidth = Math.floor((isRotated ? rawHeight : rawWidth) * scale);
  const viewHeight = Math.floor((isRotated ? rawWidth : rawHeight) * scale);

  return (
    <div
      ref={containerRef}
      id={`pdf-page-${pageNumber}`}
      data-page-number={pageNumber}
      className="pdf-page-container flex flex-col items-center my-2.5 sm:my-5 shrink-0 max-w-full"
    >
      {/* Lembar Halaman Putih */}
      <div
        className="relative bg-white shadow-[0_8px_30px_rgba(0,0,0,0.45)] border border-slate-700/60 rounded sm:rounded-md overflow-hidden max-w-full"
        style={{
          width: `${viewWidth}px`,
          minHeight: isRendered ? "auto" : `${viewHeight}px`,
        }}
      >
        <canvas
          ref={canvasRef}
          className={`block max-w-full h-auto ${!isRendered ? "hidden" : ""}`}
        />
        {!isRendered && (
          <div
            className="flex flex-col items-center justify-center gap-2 bg-slate-900/10 text-slate-400"
            style={{ width: `${viewWidth}px`, height: `${viewHeight}px` }}
          >
            <Loader2 className="h-6 w-6 animate-spin text-emerald-500" />
            <span className="text-[11px] font-mono text-slate-500 font-medium">Memuat Halaman {pageNumber}...</span>
          </div>
        )}
      </div>

      {/* Pill Nomor Halaman di Bawah Lembar */}
      <div className="mt-2 text-[10px] sm:text-xs font-mono font-semibold text-slate-400 bg-slate-800/95 px-2.5 sm:px-3 py-0.5 rounded-full border border-slate-700/80 shadow-md">
        Halaman {pageNumber} dari {numPages}
      </div>
    </div>
  );
}

// Subkomponen: Thumbnail Halaman di Sidebar Navigasi
function PdfThumbnailItem({ pageNumber, pdfDoc, isActive, onClick }) {
  const canvasRef = useRef(null);
  const [rendered, setRendered] = useState(false);
  const containerRef = useRef(null);

  const renderThumbnail = useCallback(async () => {
    if (!pdfDoc || !canvasRef.current || rendered) return;
    try {
      const page = await pdfDoc.getPage(pageNumber);
      const canvas = canvasRef.current;
      if (!canvas) return;

      const context = canvas.getContext("2d");
      const viewport = page.getViewport({ scale: 0.22 });
      const outputScale = Math.min(window.devicePixelRatio || 1, 2);

      canvas.width = Math.floor(viewport.width * outputScale);
      canvas.height = Math.floor(viewport.height * outputScale);
      canvas.style.width = `${Math.floor(viewport.width)}px`;
      canvas.style.height = `${Math.floor(viewport.height)}px`;

      context.clearRect(0, 0, canvas.width, canvas.height);

      const transform = outputScale !== 1 ? [outputScale, 0, 0, outputScale, 0, 0] : null;

      await page.render({
        canvasContext: context,
        transform,
        viewport,
      }).promise;
      setRendered(true);
    } catch (err) {
      if (err?.name !== "RenderingCancelledException") {
        console.warn(`Thumbnail error page ${pageNumber}:`, err);
      }
    }
  }, [pdfDoc, pageNumber, rendered]);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            renderThumbnail();
          }
        });
      },
      { rootMargin: "300px 0px 300px 0px" }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [renderThumbnail]);

  return (
    <button
      ref={containerRef}
      id={`pdf-thumb-${pageNumber}`}
      onClick={() => onClick(pageNumber)}
      className={`group flex flex-col items-center w-full p-1.5 sm:p-2 rounded-xl transition-all duration-200 text-left ${
        isActive
          ? "bg-emerald-950/80 border-2 border-emerald-500 shadow-lg shadow-emerald-950/50"
          : "border border-slate-800/80 hover:bg-slate-800/60 hover:border-slate-700"
      }`}
    >
      <div className="relative rounded overflow-hidden shadow-sm bg-slate-900 border border-slate-700/50 flex items-center justify-center min-h-[75px] sm:min-h-[85px] w-full">
        <canvas ref={canvasRef} className="block mx-auto" />
      </div>
      <span
        className={`mt-1 text-[10px] font-mono font-bold tracking-tight px-2 py-0.5 rounded-full ${
          isActive
            ? "bg-emerald-500 text-white shadow-sm"
            : "text-slate-400 group-hover:text-slate-200"
        }`}
      >
        Hal {pageNumber}
      </span>
    </button>
  );
}

export default function PdfViewerModal({
  isOpen,
  onClose,
  fileUrl,
  title = "Dokumen PDF",
  subtitle = "Kementerian Agama Barito Utara",
}) {
  const [pdfDoc, setPdfDoc] = useState(null);
  const [numPages, setNumPages] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [scale, setScale] = useState(1.0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showSidebar, setShowSidebar] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);

  const mainScrollRef = useRef(null);
  const modalRef = useRef(null);
  const isUserScrollingRef = useRef(false);

  // Auto-fit dokumen secara otomatis sesuai lebar layar mobile & desktop
  const adjustScaleForWidth = useCallback(() => {
    if (!mainScrollRef.current) return;
    const containerWidth = mainScrollRef.current.clientWidth;
    const isMobile = containerWidth < 640;

    // Margin padding samping
    const sidePadding = isMobile ? 24 : 64;
    const availableWidth = Math.max(260, containerWidth - sidePadding);

    // Dokumen A4 standar memiliki lebar 595 point
    const fitScale = availableWidth / 595;

    if (isMobile) {
      // Pada HP/Mobile: sesuaikan persis dengan lebar layar agar mudah dibaca tanpa terpotong
      setScale(parseFloat(Math.min(1.25, Math.max(0.42, fitScale)).toFixed(2)));
    } else {
      // Pada Desktop: skala proporsional yang nyaman dibaca
      setScale(parseFloat(Math.min(1.35, Math.max(0.65, fitScale)).toFixed(2)));
    }
  }, []);

  // Muat berkas PDF via PDF.js Canvas saat modal dibuka
  useEffect(() => {
    if (!isOpen || !fileUrl) {
      setPdfDoc(null);
      setNumPages(0);
      setCurrentPage(1);
      setLoading(false);
      setError(null);
      return;
    }

    let cancelled = false;
    setLoading(true);
    setError(null);
    setPdfDoc(null);
    setNumPages(0);
    setCurrentPage(1);

    // Kunci scroll background
    document.body.style.overflow = "hidden";

    // Pada desktop default buka sidebar jika halaman > 1, pada mobile default tutup sidebar
    if (typeof window !== "undefined") {
      setShowSidebar(window.innerWidth >= 1024);
    }

    loadPdfJs()
      .then((pdfjs) => {
        if (cancelled) return null;
        return pdfjs.getDocument({
          url: fileUrl,
          cMapUrl: "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/4.10.38/cmaps/",
          cMapPacked: true,
        }).promise;
      })
      .then((doc) => {
        if (cancelled || !doc) return;
        setPdfDoc(doc);
        setNumPages(doc.numPages);
        setCurrentPage(1);
        setLoading(false);
        trackDocumentPreview({ title, url: fileUrl, category: subtitle });
      })
      .catch((err) => {
        if (cancelled) return;
        console.error("Gagal memuat dokumen PDF via PDF.js:", err);
        setError("Gagal merender dokumen PDF. Silakan coba muat ulang atau buka di tab baru.");
        setLoading(false);
      });

    return () => {
      cancelled = true;
      document.body.style.overflow = "";
    };
  }, [isOpen, fileUrl]);

  // Sesuaikan skala saat dokumen berhasil dimuat atau sidebar dibuka/tutup
  useEffect(() => {
    if (pdfDoc && !loading) {
      const t = setTimeout(() => {
        adjustScaleForWidth();
      }, 60);
      return () => clearTimeout(t);
    }
  }, [pdfDoc, loading, adjustScaleForWidth, showSidebar]);

  // Listener resize dan rotasi layar (portrait <-> landscape di mobile)
  useEffect(() => {
    if (!isOpen) return;
    const handleResize = () => {
      adjustScaleForWidth();
    };
    window.addEventListener("resize", handleResize);
    window.addEventListener("orientationchange", handleResize);
    return () => {
      window.removeEventListener("resize", handleResize);
      window.removeEventListener("orientationchange", handleResize);
    };
  }, [isOpen, adjustScaleForWidth]);

  // Deteksi halaman aktif saat pengguna melakukan scroll
  useEffect(() => {
    const scrollContainer = mainScrollRef.current;
    if (!scrollContainer || !pdfDoc) return;

    let ticking = false;

    const handleScroll = () => {
      if (ticking || isUserScrollingRef.current) return;

      ticking = true;
      requestAnimationFrame(() => {
        const pages = scrollContainer.querySelectorAll(".pdf-page-container");
        const containerTop = scrollContainer.getBoundingClientRect().top;

        let closestPage = 1;
        let minDistance = Infinity;

        pages.forEach((pageEl) => {
          const rect = pageEl.getBoundingClientRect();
          const dist = Math.abs(rect.top - (containerTop + 60));
          if (dist < minDistance) {
            minDistance = dist;
            const pNum = parseInt(pageEl.getAttribute("data-page-number"), 10);
            if (pNum) closestPage = pNum;
          }
        });

        setCurrentPage((prev) => (prev !== closestPage ? closestPage : prev));
        ticking = false;
      });
    };

    scrollContainer.addEventListener("scroll", handleScroll, { passive: true });
    return () => scrollContainer.removeEventListener("scroll", handleScroll);
  }, [pdfDoc]);

  // Auto-scroll thumbnail sidebar ke halaman aktif
  useEffect(() => {
    const thumbEl = document.getElementById(`pdf-thumb-${currentPage}`);
    if (thumbEl) {
      thumbEl.scrollIntoView({ behavior: "smooth", block: "nearest" });
    }
  }, [currentPage]);

  // Loncat ke halaman tertentu
  const scrollToPage = useCallback((pageNum) => {
    const el = document.getElementById(`pdf-page-${pageNum}`);
    if (el && mainScrollRef.current) {
      isUserScrollingRef.current = true;
      setCurrentPage(pageNum);
      el.scrollIntoView({ behavior: "smooth", block: "start" });

      // Pada perangkat mobile, tutup panel sidebar setelah memilih halaman
      if (typeof window !== "undefined" && window.innerWidth < 1024) {
        setShowSidebar(false);
      }

      setTimeout(() => {
        isUserScrollingRef.current = false;
      }, 500);
    }
  }, []);

  // Navigasi Keyboard (Esc untuk tutup, panah untuk pindah halaman)
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e) => {
      if (e.key === "Escape") {
        onClose();
      } else if (e.key === "ArrowDown" || e.key === "PageDown") {
        if (currentPage < numPages) {
          scrollToPage(currentPage + 1);
        }
      } else if (e.key === "ArrowUp" || e.key === "PageUp") {
        if (currentPage > 1) {
          scrollToPage(currentPage - 1);
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose, currentPage, numPages, scrollToPage]);

  if (!isOpen || typeof document === "undefined") return null;

  const pagesArray = Array.from({ length: numPages }, (_, i) => i + 1);

  return createPortal(
    <div
      className="fixed inset-0 z-[999999] flex items-center justify-center bg-slate-950/90 p-0 sm:p-3 md:p-6 backdrop-blur-md transition-all duration-300"
      onClick={onClose}
    >
      <div
        ref={modalRef}
        className={`relative flex flex-col overflow-hidden bg-slate-900 text-slate-100 shadow-[0_30px_90px_rgba(0,0,0,0.85)] backdrop-blur-2xl transition-all duration-300 ${
          isFullscreen
            ? "fixed inset-0 rounded-none w-screen h-screen max-w-none max-h-none z-[9999999]"
            : "w-full sm:max-w-7xl h-full sm:h-[94vh] rounded-none sm:rounded-3xl border-0 sm:border sm:border-slate-800/80"
        }`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Header Toolbar / Page Banner — Rapi, Elegan & Bebas Elemen yang Dihapus */}
        <div className="flex items-center justify-between border-b border-slate-800/80 bg-slate-900/98 px-3.5 py-2.5 sm:px-6 sm:py-3.5 gap-2 shrink-0 z-20">
          {/* Sisi Kiri: Icon Dokumen + Nama Dokumen + Metadata */}
          <div className="flex items-center gap-2.5 sm:gap-3.5 min-w-0 flex-1">
            <div className="flex h-9 w-9 sm:h-10 sm:w-10 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-700 text-white shadow-md shadow-emerald-950/50 border border-emerald-400/30">
              <FileText className="h-4 w-4 sm:h-5 sm:w-5" />
            </div>

            <div className="min-w-0 pr-1 flex-1">
              <div className="flex items-center gap-2">
                <h3
                  className="truncate text-xs sm:text-sm md:text-base font-bold text-white tracking-tight leading-snug"
                  title={title}
                >
                  {title}
                </h3>
                <span className="hidden sm:inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 text-[9px] font-bold tracking-wider uppercase">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  Resmi
                </span>
              </div>
              <p className="truncate text-[10px] sm:text-[11px] text-slate-400 mt-0.5">
                {subtitle || "Kementerian Agama Kabupaten Barito Utara"}
              </p>
            </div>
          </div>

          {/* Sisi Kanan: Indikator Halaman + Tombol Aksi Bersih */}
          <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
            {/* Tombol Buka/Tutup Sidebar Daftar Halaman (Muncul jika ada lebih dari 1 halaman) */}
            {numPages > 1 && (
              <button
                onClick={() => setShowSidebar((prev) => !prev)}
                className={`flex items-center gap-1.5 px-2 sm:px-2.5 py-1.5 rounded-xl border transition-all text-xs font-semibold ${
                  showSidebar
                    ? "bg-emerald-950/70 border-emerald-500/50 text-emerald-300"
                    : "bg-slate-800/90 border-slate-700/80 text-slate-300 hover:bg-slate-700 hover:text-white"
                }`}
                title={showSidebar ? "Tutup Daftar Halaman" : "Buka Daftar Halaman"}
              >
                {showSidebar ? (
                  <PanelLeftClose className="h-3.5 w-3.5" />
                ) : (
                  <PanelLeft className="h-3.5 w-3.5" />
                )}
                <span className="hidden md:inline text-[11px]">Halaman</span>
              </button>
            )}

            {/* Indikator Halaman Aktif (Hal X dari Y) */}
            {numPages > 0 && (
              <div className="flex items-center gap-1 bg-slate-800/90 border border-slate-700/80 rounded-xl px-2.5 py-1.5 text-[11px] font-mono font-semibold text-slate-300 shadow-inner">
                <span className="text-emerald-400 font-bold">{currentPage}</span>
                <span className="text-slate-500">/</span>
                <span>{numPages}</span>
              </div>
            )}

            {/* Tombol Buka Tab Baru */}
            <a
              href={fileUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 rounded-xl border border-slate-700/80 bg-slate-800/90 px-2.5 sm:px-3 py-1.5 sm:py-2 text-xs font-semibold text-slate-200 transition-all hover:bg-slate-700 active:scale-95"
              title="Buka PDF di Tab Baru"
            >
              <ExternalLink className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Tab Baru</span>
            </a>

            {/* Tombol Layar Penuh (Fullscreen) */}
            <button
              onClick={() => setIsFullscreen((f) => !f)}
              className="hidden sm:flex items-center justify-center p-2 rounded-xl bg-slate-800/90 border border-slate-700/80 text-slate-300 hover:bg-slate-700 hover:text-white transition-colors"
              title={isFullscreen ? "Keluar Layar Penuh" : "Layar Penuh"}
            >
              {isFullscreen ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
            </button>

            {/* Tombol Tutup Modal */}
            <button
              onClick={onClose}
              className="flex items-center justify-center p-2 rounded-xl bg-slate-800/90 border border-slate-700/80 text-slate-400 transition-colors hover:bg-rose-500/20 hover:text-rose-400 hover:border-rose-500/30"
              title="Tutup Pratinjau (Esc)"
            >
              <X className="h-4 w-4 sm:h-5 sm:w-5" />
            </button>
          </div>
        </div>

        {/* Body Area: Penampil PDF Canvas Multi-Halaman Responsif */}
        <div className="relative flex-1 flex overflow-hidden bg-slate-950">
          {/* Sidebar Daftar Thumbnail Halaman */}
          {showSidebar && numPages > 1 && (
            <aside className="fixed lg:relative inset-y-0 left-0 z-30 lg:z-10 w-56 sm:w-60 lg:w-56 shrink-0 border-r border-slate-800 bg-slate-900/98 lg:bg-slate-900/95 flex flex-col shadow-2xl lg:shadow-none transition-all duration-300">
              <div className="px-3 py-2.5 border-b border-slate-800/80 flex items-center justify-between text-xs font-bold text-slate-300 uppercase tracking-wider">
                <span>Daftar Halaman ({numPages})</span>
                <button
                  onClick={() => setShowSidebar(false)}
                  className="p-1 rounded-lg text-slate-400 hover:text-white lg:hidden"
                  title="Tutup"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
              <div className="flex-1 overflow-y-auto p-2 sm:p-3 space-y-2.5 scrollbar-thin scrollbar-thumb-slate-700 scrollbar-track-transparent">
                {pdfDoc &&
                  pagesArray.map((pageNum) => (
                    <PdfThumbnailItem
                      key={pageNum}
                      pageNumber={pageNum}
                      pdfDoc={pdfDoc}
                      isActive={currentPage === pageNum}
                      onClick={scrollToPage}
                    />
                  ))}
              </div>
            </aside>
          )}

          {/* Area Render Canvas Utama (Scroll Vertikal Berkelanjutan) */}
          <main
            ref={mainScrollRef}
            className="flex-1 overflow-y-auto overflow-x-auto py-3 px-2 sm:py-6 sm:px-4 flex flex-col items-center scrollbar-thin scrollbar-thumb-slate-700 scrollbar-track-transparent"
          >
            {loading && (
              <div className="flex flex-col items-center justify-center gap-3 text-slate-400 py-24 sm:py-32">
                <Loader2 className="h-8 w-8 sm:h-10 sm:w-10 animate-spin text-emerald-400" />
                <p className="text-xs sm:text-sm font-semibold text-slate-200">Memuat penampil PDF Canvas...</p>
                <p className="text-[11px] text-slate-500">Mempersiapkan seluruh halaman dokumen resmi</p>
              </div>
            )}

            {error && (
              <div className="flex flex-col items-center justify-center gap-4 text-center max-w-md p-6 rounded-2xl bg-slate-900 border border-slate-800 shadow-xl my-auto mx-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-amber-500/20 text-amber-400 border border-amber-500/30">
                  <AlertCircle className="h-6 w-6" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-slate-200">Gagal Membuka PDF</h4>
                  <p className="mt-1 text-xs text-slate-400 leading-relaxed">{error}</p>
                </div>
                <div className="flex flex-wrap items-center justify-center gap-2">
                  <button
                    onClick={() => {
                      setLoading(true);
                      setError(null);
                      loadPdfJs()
                        .then((pdfjs) =>
                          pdfjs.getDocument({
                            url: fileUrl,
                            cMapUrl: "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/4.10.38/cmaps/",
                            cMapPacked: true,
                          }).promise
                        )
                        .then((doc) => {
                          setPdfDoc(doc);
                          setNumPages(doc.numPages);
                          setCurrentPage(1);
                          setLoading(false);
                        })
                        .catch((err) => {
                          console.error(err);
                          setError("Gagal memuat ulang berkas.");
                          setLoading(false);
                        });
                    }}
                    className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition-all shadow-md active:scale-95"
                  >
                    <RefreshCw className="h-3.5 w-3.5" />
                    Muat Ulang
                  </button>
                  <a
                    href={fileUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700 transition-all"
                  >
                    <ExternalLink className="h-3.5 w-3.5" />
                    Buka di Tab Baru
                  </a>
                </div>
              </div>
            )}

            {pdfDoc &&
              !loading &&
              !error &&
              pagesArray.map((pageNum) => (
                <PdfPageItem
                  key={pageNum}
                  pageNumber={pageNum}
                  numPages={numPages}
                  pdfDoc={pdfDoc}
                  scale={scale}
                  rotation={0}
                  scrollContainerRef={mainScrollRef}
                />
              ))}
          </main>
        </div>
      </div>
    </div>,
    document.body
  );
}
