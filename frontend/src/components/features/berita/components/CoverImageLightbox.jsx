"use client";

import React, { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { X, Download, Maximize2 } from "lucide-react";
import CoverImageWithFallback from "./CoverImageWithFallback";

export default function CoverImageLightbox({ src, alt, ...props }) {
  const [isOpen, setIsOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Prevent scrolling when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  // Close on Escape key
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape") setIsOpen(false);
    };
    if (isOpen) window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen]);

  const handleDownload = async (e) => {
    e.stopPropagation();
    try {
      const response = await fetch(src);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `Foto_Berita_${Date.now()}.jpg`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch {
      window.open(src, "_blank");
    }
  };

  return (
    <>
      <button
        type="button"
        className="group relative block w-full aspect-[16/9] cursor-pointer overflow-hidden bg-slate-100 dark:bg-slate-900 text-left p-0 m-0 border-0 outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 w-full"
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          setIsOpen(true);
        }}
        title="Klik untuk memperbesar foto berita"
      >
        <CoverImageWithFallback src={src} alt={alt} {...props} />

        {/* Hover overlay icon */}
        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-all duration-300 flex items-center justify-center pointer-events-none">
          <div className="opacity-0 group-hover:opacity-100 transform group-hover:scale-105 transition-all duration-300 bg-white/95 dark:bg-slate-900/95 px-3.5 py-2 rounded-full backdrop-blur-md text-emerald-700 dark:text-emerald-400 font-bold text-xs flex items-center gap-1.5 shadow-xl border border-white/20">
            <Maximize2 className="h-4 w-4" />
            <span>Perbesar Foto</span>
          </div>
        </div>
      </button>

      {/* Fullscreen Portal Modal */}
      {isOpen &&
        mounted &&
        createPortal(
          <div
            className="fixed inset-0 z-[999999] flex flex-col items-center justify-between bg-slate-950/95 p-3 sm:p-6 backdrop-blur-2xl transition-all duration-300 animate-in fade-in"
            onClick={() => setIsOpen(false)}
          >
            {/* Header */}
            <div
              className="z-20 flex w-full max-w-7xl items-center justify-between gap-4 py-2"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center gap-2 min-w-0">
                <span className="rounded-full border border-white/20 bg-white/10 px-3 py-1 text-xs font-bold text-white shadow-inner backdrop-blur-md">
                  Foto Berita
                </span>
                {alt && (
                  <p className="hidden sm:block truncate text-xs font-medium text-slate-300 max-w-lg">
                    {alt}
                  </p>
                )}
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleDownload}
                  title="Unduh Foto HD"
                  className="flex h-10 w-10 items-center justify-center rounded-full border border-white/20 bg-white/10 text-white backdrop-blur-md transition-all hover:bg-emerald-600 hover:border-emerald-500 shadow-lg active:scale-95 cursor-pointer"
                >
                  <Download className="h-4 w-4" />
                </button>
                <button
                  type="button"
                  onClick={() => setIsOpen(false)}
                  title="Tutup (Esc)"
                  className="flex h-10 w-10 items-center justify-center rounded-full border border-white/20 bg-white/10 text-white backdrop-blur-md transition-all hover:bg-red-500 hover:border-red-400 shadow-lg active:scale-95 cursor-pointer"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
            </div>

            {/* Centered Image */}
            <div
              className="relative flex h-[78vh] sm:h-[82vh] w-full max-w-7xl items-center justify-center overflow-hidden my-auto p-2"
              onClick={(e) => e.stopPropagation()}
            >
              <img
                src={src || "/assets/branding/kemenag.svg"}
                alt={alt}
                className="max-h-[76vh] sm:max-h-[80vh] max-w-full rounded-2xl object-contain shadow-[0_20px_60px_rgba(0,0,0,0.8)] select-none border border-white/10 ring-1 ring-white/5 animate-in zoom-in-95 duration-200"
              />
            </div>
          </div>,
          document.body
        )}
    </>
  );
}
