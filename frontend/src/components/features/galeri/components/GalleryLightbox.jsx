"use client";

import React, { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import { X, ChevronLeft, ChevronRight, Download, Image as ImageIcon } from "lucide-react";

export function GalleryLightbox({
  item,
  index,
  total,
  onClose,
  onPrev,
  onNext,
}) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!item) return;
    const handleKeyDown = (e) => {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowLeft" && onPrev) onPrev();
      if (e.key === "ArrowRight" && onNext) onNext();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [item, onClose, onPrev, onNext]);

  if (!item || !mounted) return null;

  const handleDownload = async (e) => {
    e.stopPropagation();
    try {
      const response = await fetch(item.imageUrl);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      const fileName = `Galeri_Kemenag_Barut_${Date.now()}.jpg`;
      link.download = fileName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch {
      window.open(item.imageUrl, "_blank");
    }
  };

  return createPortal(
    <div
      className="fixed inset-0 z-[999999] flex flex-col items-center justify-between bg-slate-950/95 p-3 sm:p-6 backdrop-blur-2xl transition-all duration-300 animate-in fade-in"
      onClick={onClose}
    >
      {/* Top Bar Header */}
      <div
        className="z-20 flex w-full max-w-7xl items-center justify-between gap-4 py-2"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center gap-3 min-w-0">
          <div className="flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3.5 py-1.5 text-xs font-bold text-white shadow-inner backdrop-blur-md">
            <ImageIcon className="h-3.5 w-3.5 text-emerald-400" />
            <span>
              {index + 1} / {total}
            </span>
          </div>
          {item.title && (
            <p className="hidden sm:block truncate text-xs font-medium text-slate-300 max-w-md">
              {item.title}
            </p>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleDownload}
            aria-label="Unduh Foto HD"
            title="Unduh Foto HD"
            className="flex h-10 w-10 items-center justify-center rounded-full border border-white/20 bg-white/10 text-white backdrop-blur-md transition-all hover:bg-emerald-600 hover:border-emerald-500 shadow-lg active:scale-95 cursor-pointer"
          >
            <Download className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={onClose}
            aria-label="Tutup Preview"
            title="Tutup (Esc)"
            className="flex h-10 w-10 items-center justify-center rounded-full border border-white/20 bg-white/10 text-white backdrop-blur-md transition-all hover:bg-red-500 hover:border-red-400 shadow-lg active:scale-95 cursor-pointer"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
      </div>

      {/* Main Image Stage */}
      <div
        className="relative flex h-[78vh] sm:h-[82vh] w-full max-w-7xl items-center justify-center overflow-hidden my-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Prev Arrow Button (Desktop) */}
        {total > 1 && (
          <button
            type="button"
            onClick={onPrev}
            aria-label="Foto Sebelumnya"
            className="absolute left-2 sm:left-4 z-20 hidden sm:flex h-12 w-12 items-center justify-center rounded-full border border-white/20 bg-slate-900/80 text-white backdrop-blur-md transition-all hover:bg-emerald-600 hover:scale-110 hover:border-emerald-500 shadow-2xl active:scale-95 cursor-pointer"
          >
            <ChevronLeft className="h-6 w-6" />
          </button>
        )}

        {/* Central Display Image */}
        <AnimatePresence mode="wait">
          <motion.div
            key={item.imageUrl}
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.96 }}
            transition={{ duration: 0.22, ease: "easeOut" }}
            className="flex h-full w-full items-center justify-center p-2"
          >
            <img
              src={item.imageUrl}
              alt={item.title || "Preview Galeri"}
              className="max-h-[76vh] sm:max-h-[80vh] max-w-full rounded-2xl object-contain shadow-[0_20px_60px_rgba(0,0,0,0.8)] select-none border border-white/10 ring-1 ring-white/5"
            />
          </motion.div>
        </AnimatePresence>

        {/* Next Arrow Button (Desktop) */}
        {total > 1 && (
          <button
            type="button"
            onClick={onNext}
            aria-label="Foto Berikutnya"
            className="absolute right-2 sm:right-4 z-20 hidden sm:flex h-12 w-12 items-center justify-center rounded-full border border-white/20 bg-slate-900/80 text-white backdrop-blur-md transition-all hover:bg-emerald-600 hover:scale-110 hover:border-emerald-500 shadow-2xl active:scale-95 cursor-pointer"
          >
            <ChevronRight className="h-6 w-6" />
          </button>
        )}
      </div>

      {/* Mobile Navigation Bar (Bottom) */}
      {total > 1 && (
        <div
          className="z-20 flex sm:hidden items-center justify-center gap-6 pb-2"
          onClick={(e) => e.stopPropagation()}
        >
          <button
            type="button"
            onClick={onPrev}
            className="flex h-11 w-11 items-center justify-center rounded-full border border-white/20 bg-white/10 text-white backdrop-blur-md transition-all active:scale-95"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
          <span className="text-xs font-bold text-slate-300">
            {index + 1} / {total}
          </span>
          <button
            type="button"
            onClick={onNext}
            className="flex h-11 w-11 items-center justify-center rounded-full border border-white/20 bg-white/10 text-white backdrop-blur-md transition-all active:scale-95"
          >
            <ChevronRight className="h-5 w-5" />
          </button>
        </div>
      )}
    </div>,
    document.body
  );
}
