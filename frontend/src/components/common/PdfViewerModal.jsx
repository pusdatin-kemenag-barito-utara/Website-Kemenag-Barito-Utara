"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import { createPortal } from "react-dom";
import {
  X,
  Download,
  ExternalLink,
  ZoomIn,
  ZoomOut,
  RotateCw,
  Maximize2,
  Minimize2,
  FileText,
  Loader2,
  AlertCircle,
  PanelLeftClose,
  PanelLeft,
  ChevronUp,
  ChevronDown,
  Maximize,
} from "lucide-react";

const PDFJS_CDN = "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/4.10.38/pdf.min.mjs";
const PDFJS_WORKER_CDN = "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/4.10.38/pdf.worker.min.mjs";

let pdfjsLibPromise = null;

function loadPdfJs() {
  if (typeof window === "undefined") return Promise.reject(new Error("SSR not supported"));
  if (window.pdfjsLib) return Promise.resolve(window.pdfjsLib);
  if (!pdfjsLibPromise) {
    pdfjsLibPromise = import(/* @vite-ignore */ PDFJS_CDN).then((lib) => {
      lib.GlobalWorkerOptions.workerSrc = PDFJS_WORKER_CDN;
      window.pdfjsLib = lib;
      return lib;
    });
  }
  return pdfjsLibPromise;
}

// Subcomponent: Individual Page Canvas in Main Viewport
function PdfPageItem({ pageNumber, numPages, pdfDoc, scale, rotation, scrollContainerRef }) {
  const containerRef = useRef(null);
  const canvasRef = useRef(null);
  const renderTaskRef = useRef(null);
  const [isRendered, setIsRendered] = useState(false);
  const [pageDimensions, setPageDimensions] = useState(null);

  // Read actual viewport dimensions from PDF.js
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

  // High quality canvas render
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
      const outputScale = window.devicePixelRatio || 1;

      // Actual internal pixel resolution (Retina display support)
      canvas.width = Math.floor(viewport.width * outputScale);
      canvas.height = Math.floor(viewport.height * outputScale);

      // Display style dimensions matching the viewport
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

  // Lazy render using IntersectionObserver with scroll container
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
        rootMargin: "800px 0px 800px 0px",
        threshold: 0.01,
      }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [renderCanvas, scrollContainerRef]);

  // Re-render immediately when scale or rotation changes if already rendered
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
      className="pdf-page-container flex flex-col items-center my-3 sm:my-6 shrink-0"
    >
      {/* Paper Sheet */}
      <div
        className="relative bg-white shadow-[0_6px_25px_rgba(0,0,0,0.5)] border border-slate-700/60 rounded-sm overflow-hidden"
        style={{
          width: `${viewWidth}px`,
          height: isRendered ? "auto" : `${viewHeight}px`,
        }}
      >
        <canvas
          ref={canvasRef}
          className={`block ${!isRendered ? "hidden" : ""}`}
        />
        {!isRendered && (
          <div
            className="flex flex-col items-center justify-center gap-2 bg-slate-900/10 text-slate-400"
            style={{ width: `${viewWidth}px`, height: `${viewHeight}px` }}
          >
            <Loader2 className="h-5 w-5 sm:h-6 sm:w-6 animate-spin text-emerald-500" />
            <span className="text-[11px] font-mono text-slate-500">Memuat hal {pageNumber}...</span>
          </div>
        )}
      </div>

      {/* Page Number Pill */}
      <div className="mt-2.5 text-[11px] sm:text-xs font-mono font-semibold text-slate-400 bg-slate-800/90 px-2.5 sm:px-3 py-0.5 sm:py-1 rounded-full border border-slate-700/80 shadow-md">
        Hal {pageNumber} dari {numPages}
      </div>
    </div>
  );
}

// Subcomponent: Thumbnail item in left sidebar
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
      const viewport = page.getViewport({ scale: 0.2 });
      const outputScale = window.devicePixelRatio || 1;

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
          ? "bg-emerald-950/70 border-2 border-emerald-500 shadow-lg shadow-emerald-950/50"
          : "border border-slate-800/80 hover:bg-slate-800/60 hover:border-slate-700"
      }`}
    >
      <div className="relative rounded overflow-hidden shadow-sm bg-slate-900 border border-slate-700/50 flex items-center justify-center min-h-[80px] sm:min-h-[90px] w-full">
        <canvas ref={canvasRef} className="block mx-auto" />
      </div>
      <span
        className={`mt-1 text-[10px] font-mono font-bold tracking-tight px-2 py-0.5 rounded-full ${
          isActive
            ? "bg-emerald-500 text-white shadow-sm"
            : "text-slate-400 group-hover:text-slate-200"
        }`}
      >
        {pageNumber}
      </span>
    </button>
  );
}

export default function PdfViewerModal({
  isOpen,
  onClose,
  fileUrl,
  title = "Dokumen PDF",
  subtitle = "Penampil Dokumen Resmi",
}) {
  const [pdfDoc, setPdfDoc] = useState(null);
  const [numPages, setNumPages] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [scale, setScale] = useState(1.0);
  const [rotation, setRotation] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showSidebar, setShowSidebar] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);

  const mainScrollRef = useRef(null);
  const modalRef = useRef(null);
  const isUserScrollingRef = useRef(false);

  // Auto-fit document width based on container width
  const adjustScaleForWidth = useCallback(() => {
    if (!mainScrollRef.current) return;
    const containerWidth = mainScrollRef.current.clientWidth;
    const isMobile = containerWidth < 640;

    // Available width accounting for paddings
    const padding = isMobile ? 24 : 64;
    const availableWidth = Math.max(260, containerWidth - padding);

    // Standard A4 is 595 points wide
    const fitScale = availableWidth / 595;

    if (isMobile) {
      // On mobile: strictly fit to width
      setScale(parseFloat(Math.min(1.2, Math.max(0.45, fitScale)).toFixed(2)));
    } else {
      // On desktop: default to 1.0 or fit
      setScale(parseFloat(Math.min(1.5, Math.max(0.7, fitScale)).toFixed(2)));
    }
  }, []);

  // Initial setup: Desktop opens sidebar, mobile closes sidebar by default
  useEffect(() => {
    if (typeof window !== "undefined") {
      setShowSidebar(window.innerWidth >= 1024);
    }
  }, [isOpen]);

  // Reset & load PDF when modal opens or file changes
  useEffect(() => {
    if (!isOpen || !fileUrl) {
      setPdfDoc(null);
      setNumPages(0);
      setCurrentPage(1);
      setRotation(0);
      setLoading(true);
      setError(null);
      return;
    }

    let isCancelled = false;
    setLoading(true);
    setError(null);

    // Prevent background scrolling
    document.body.style.overflow = "hidden";

    loadPdfJs()
      .then((pdfjs) => {
        const loadingTask = pdfjs.getDocument({
          url: fileUrl,
          cMapUrl: "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/4.10.38/cmaps/",
          cMapPacked: true,
        });
        return loadingTask.promise;
      })
      .then((doc) => {
        if (isCancelled) return;
        setPdfDoc(doc);
        setNumPages(doc.numPages);
        setCurrentPage(1);
        setLoading(false);
      })
      .catch((err) => {
        if (isCancelled) return;
        console.error("Gagal memuat PDF.js:", err);
        setError("Gagal memuat dokumen PDF. Silakan gunakan tombol unduh atau buka di tab baru.");
        setLoading(false);
      });

    return () => {
      isCancelled = true;
      document.body.style.overflow = "";
    };
  }, [isOpen, fileUrl]);

  // Once document is loaded, auto-fit scale to screen
  useEffect(() => {
    if (pdfDoc && !loading) {
      // Delay slightly to let container layout settle
      const t = setTimeout(() => {
        adjustScaleForWidth();
      }, 50);
      return () => clearTimeout(t);
    }
  }, [pdfDoc, loading, adjustScaleForWidth, showSidebar]);

  // Track active page via scroll position of main container
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

  // Keep sidebar thumbnail in view when currentPage changes
  useEffect(() => {
    const thumbEl = document.getElementById(`pdf-thumb-${currentPage}`);
    if (thumbEl) {
      thumbEl.scrollIntoView({ behavior: "smooth", block: "nearest" });
    }
  }, [currentPage]);

  // Jump smoothly to a specific page
  const scrollToPage = useCallback((pageNum) => {
    const el = document.getElementById(`pdf-page-${pageNum}`);
    if (el && mainScrollRef.current) {
      isUserScrollingRef.current = true;
      setCurrentPage(pageNum);
      el.scrollIntoView({ behavior: "smooth", block: "start" });

      // On mobile, auto-close sidebar overlay after selecting a page
      if (typeof window !== "undefined" && window.innerWidth < 1024) {
        setShowSidebar(false);
      }

      setTimeout(() => {
        isUserScrollingRef.current = false;
      }, 600);
    }
  }, []);

  // Keyboard navigation
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
      } else if ((e.ctrlKey || e.metaKey) && (e.key === "+" || e.key === "=")) {
        e.preventDefault();
        setScale((s) => Math.min(3.0, parseFloat((s + 0.15).toFixed(2))));
      } else if ((e.ctrlKey || e.metaKey) && e.key === "-") {
        e.preventDefault();
        setScale((s) => Math.max(0.4, parseFloat((s - 0.15).toFixed(2))));
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose, currentPage, numPages, scrollToPage]);

  if (!isOpen || typeof document === "undefined") return null;

  const pagesArray = Array.from({ length: numPages }, (_, i) => i + 1);

  return createPortal(
    <div
      className="fixed inset-0 z-[999999] flex items-center justify-center bg-slate-950/90 p-0 sm:p-4 md:p-6 backdrop-blur-md transition-all duration-300"
      onClick={onClose}
    >
      <div
        ref={modalRef}
        className={`relative flex flex-col overflow-hidden bg-slate-900 text-slate-100 shadow-[0_30px_90px_rgba(0,0,0,0.85)] backdrop-blur-2xl transition-all duration-300 ${
          isFullscreen
            ? "fixed inset-0 rounded-none w-screen h-screen max-w-none max-h-none z-[9999999]"
            : "w-full sm:max-w-7xl h-full sm:h-[94vh] rounded-none sm:rounded-3xl border-0 sm:border sm:border-slate-700/60"
        }`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Header Toolbar - Ultra Clean & Responsive */}
        <div className="flex items-center justify-between border-b border-slate-800 bg-slate-900/95 px-3 py-2.5 sm:px-6 sm:py-3 gap-2 shrink-0 z-20">
          {/* Left: Thumbnail Drawer Toggle + Doc Title */}
          <div className="flex items-center gap-2 sm:gap-3 min-w-0 flex-1">
            <button
              onClick={() => setShowSidebar((s) => !s)}
              className={`p-1.5 sm:p-2 rounded-xl border transition-all duration-200 flex items-center gap-1.5 text-xs font-semibold shrink-0 ${
                showSidebar
                  ? "bg-emerald-500/20 text-emerald-300 border-emerald-500/40"
                  : "bg-slate-800 text-slate-400 border-slate-700 hover:text-white"
              }`}
              title={showSidebar ? "Sembunyikan Panel Halaman" : "Buka Panel Halaman (Thumbnail)"}
            >
              {showSidebar ? <PanelLeftClose className="h-4 w-4" /> : <PanelLeft className="h-4 w-4" />}
              <span className="hidden md:inline">Halaman</span>
            </button>

            <div className="hidden sm:flex h-8 w-8 sm:h-9 sm:w-9 shrink-0 items-center justify-center rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
              <FileText className="h-4 w-4 sm:h-5 sm:w-5" />
            </div>

            <div className="min-w-0 pr-1">
              <h3 className="truncate text-xs sm:text-sm md:text-base font-bold text-white leading-snug">
                {title}
              </h3>
              <p className="hidden sm:block truncate text-[11px] text-slate-400">
                {subtitle || "Penampil Dokumen Resmi"}
              </p>
            </div>
          </div>

          {/* Right: Quick Controls */}
          <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
            {/* Current Page Pill (Compact on Mobile) */}
            {numPages > 0 && (
              <div className="flex items-center gap-0.5 sm:gap-1 bg-slate-800/90 border border-slate-700/70 rounded-xl px-1.5 sm:px-2 py-1 text-xs">
                <button
                  onClick={() => scrollToPage(Math.max(1, currentPage - 1))}
                  disabled={currentPage <= 1}
                  className="p-0.5 sm:p-1 rounded-lg hover:bg-slate-700 disabled:opacity-30 disabled:hover:bg-transparent transition-colors"
                  title="Halaman Sebelumnya"
                >
                  <ChevronUp className="h-3.5 w-3.5" />
                </button>
                <span className="font-semibold text-slate-200 px-1 text-[11px] sm:text-xs whitespace-nowrap">
                  {currentPage}<span className="text-slate-500">/</span>{numPages}
                </span>
                <button
                  onClick={() => scrollToPage(Math.min(numPages, currentPage + 1))}
                  disabled={currentPage >= numPages}
                  className="p-0.5 sm:p-1 rounded-lg hover:bg-slate-700 disabled:opacity-30 disabled:hover:bg-transparent transition-colors"
                  title="Halaman Berikutnya"
                >
                  <ChevronDown className="h-3.5 w-3.5" />
                </button>
              </div>
            )}

            {/* Desktop Zoom & Rotate Controls */}
            <div className="hidden lg:flex items-center gap-1 bg-slate-800/90 border border-slate-700/70 rounded-xl px-1.5 py-1 text-xs">
              <button
                onClick={() => setScale((s) => Math.max(0.4, parseFloat((s - 0.15).toFixed(2))))}
                className="p-1 rounded-lg hover:bg-slate-700 text-slate-300 hover:text-white transition-colors"
                title="Perkecil (-)"
              >
                <ZoomOut className="h-3.5 w-3.5" />
              </button>
              <button
                onClick={() => setScale(1.0)}
                className="px-1 py-0.5 rounded text-[11px] font-mono text-slate-300 hover:text-white"
                title="Reset Ukuran (100%)"
              >
                {Math.round(scale * 100)}%
              </button>
              <button
                onClick={() => setScale((s) => Math.min(3.0, parseFloat((s + 0.15).toFixed(2))))}
                className="p-1 rounded-lg hover:bg-slate-700 text-slate-300 hover:text-white transition-colors"
                title="Perbesar (+)"
              >
                <ZoomIn className="h-3.5 w-3.5" />
              </button>
              <button
                onClick={adjustScaleForWidth}
                className="p-1 rounded-lg hover:bg-slate-700 text-slate-300 hover:text-white transition-colors"
                title="Sesuaikan Lebar Layar"
              >
                <Maximize className="h-3.5 w-3.5" />
              </button>
              <button
                onClick={() => setRotation((r) => (r + 90) % 360)}
                className="p-1 rounded-lg hover:bg-slate-700 text-slate-300 hover:text-white transition-colors border-l border-slate-700 ml-0.5 pl-1.5"
                title="Putar Dokumen (90°)"
              >
                <RotateCw className="h-3.5 w-3.5" />
              </button>
            </div>

            {/* Action Buttons */}
            <a
              href={fileUrl}
              download
              className="flex items-center justify-center p-1.5 sm:px-3 sm:py-1.5 rounded-xl border border-emerald-500/30 bg-emerald-500/10 text-emerald-300 transition-all hover:bg-emerald-500/20 active:scale-95"
              title="Unduh Berkas PDF"
            >
              <Download className="h-3.5 w-3.5 sm:mr-1.5" />
              <span className="hidden sm:inline text-xs font-semibold">Unduh</span>
            </a>

            <a
              href={fileUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="hidden sm:flex items-center gap-1.5 rounded-xl border border-slate-700 bg-slate-800 px-3 py-1.5 text-xs font-semibold text-slate-200 transition-all hover:bg-slate-700 active:scale-95"
              title="Buka PDF di Tab Baru"
            >
              <ExternalLink className="h-3.5 w-3.5" />
              <span>Tab Baru</span>
            </a>

            <button
              onClick={() => setIsFullscreen((f) => !f)}
              className="hidden md:flex items-center justify-center p-1.5 sm:p-2 rounded-xl bg-slate-800 text-slate-300 hover:bg-slate-700 hover:text-white transition-colors"
              title={isFullscreen ? "Keluar Layar Penuh" : "Layar Penuh"}
            >
              {isFullscreen ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
            </button>

            <button
              onClick={onClose}
              className="flex items-center justify-center p-1.5 sm:p-2 rounded-xl bg-slate-800 text-slate-400 transition-colors hover:bg-rose-500/20 hover:text-rose-400"
              title="Tutup (Esc)"
            >
              <X className="h-4 w-4 sm:h-5 sm:w-5" />
            </button>
          </div>
        </div>

        {/* Body Area: Split into Left Thumbnail Panel + Main Vertical Scrollable Viewport */}
        <div className="relative flex-1 flex overflow-hidden bg-slate-950">
          {/* Mobile Overlay Backdrop when Sidebar is Open */}
          {showSidebar && (
            <div
              className="fixed inset-0 z-20 bg-slate-950/70 backdrop-blur-sm lg:hidden"
              onClick={() => setShowSidebar(false)}
            />
          )}

          {/* Left Thumbnail Sidebar (Drawer on mobile, inline on desktop) */}
          {showSidebar && (
            <aside className="fixed lg:relative inset-y-0 left-0 z-30 lg:z-10 w-56 sm:w-60 lg:w-56 shrink-0 border-r border-slate-800 bg-slate-900/98 lg:bg-slate-900/90 flex flex-col shadow-2xl lg:shadow-none transition-all duration-300">
              <div className="px-3 py-2.5 border-b border-slate-800/80 flex items-center justify-between text-xs font-bold text-slate-300 uppercase tracking-wider">
                <span>Daftar Halaman ({numPages})</span>
                <button
                  onClick={() => setShowSidebar(false)}
                  className="p-1 rounded-lg text-slate-400 hover:text-white lg:hidden"
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

          {/* Main Continuous Vertical Scroll Viewport */}
          <main
            ref={mainScrollRef}
            className="flex-1 overflow-y-auto overflow-x-auto py-4 px-2 sm:py-8 sm:px-6 flex flex-col items-center scrollbar-thin scrollbar-thumb-slate-700 scrollbar-track-transparent"
          >
            {loading && (
              <div className="flex flex-col items-center justify-center gap-3 text-slate-400 py-24 sm:py-32">
                <Loader2 className="h-8 w-8 sm:h-10 sm:w-10 animate-spin text-emerald-400" />
                <p className="text-xs sm:text-sm font-semibold text-slate-200">Memuat dokumen PDF...</p>
                <p className="text-[11px] text-slate-500">Menyiapkan tampilan multi-halaman</p>
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
                <div className="flex gap-2">
                  <a
                    href={fileUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition-all"
                  >
                    <ExternalLink className="h-4 w-4" />
                    Buka di Tab Baru
                  </a>
                  <a
                    href={fileUrl}
                    download
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold border border-slate-700 transition-all"
                  >
                    <Download className="h-4 w-4" />
                    Unduh File
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
                  rotation={rotation}
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
