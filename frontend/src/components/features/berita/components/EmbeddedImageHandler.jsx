"use client";

import React, { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { Image as ImageIcon, X, Info } from "lucide-react";

export default function EmbeddedImageHandler() {
  const [activeImage, setActiveImage] = useState(null);

  useEffect(() => {
    const handleImageClick = (e) => {
      const target = e.target;
      if (!target || target.closest(".not-prose")) return;

      const imgTarget = target.closest("img");
      const figureTarget = target.closest("figure.image-insertion, figure");

      if (imgTarget || figureTarget) {
        const fig = figureTarget || (imgTarget ? imgTarget.closest("figure.image-insertion, figure") : null);
        
        let src = "";
        let caption = "";

        if (fig) {
          const img = fig.querySelector("img");
          const figcap = fig.querySelector("figcaption");
          src = img?.getAttribute("src") || img?.src || "";
          caption = figcap?.innerText || "Foto Dokumentasi Sisipan";
        } else if (imgTarget) {
          src = imgTarget.getAttribute("src") || imgTarget.src || "";
          caption = imgTarget.getAttribute("alt") || "Foto Dokumentasi Sisipan";
        }

        if (src) {
          e.preventDefault();
          e.stopPropagation();
          setActiveImage({ src, caption });
        }
      }
    };

    const proseContainer = document.querySelector(".prose");
    if (proseContainer) {
      proseContainer.addEventListener("click", handleImageClick);
    }

    return () => {
      if (proseContainer) {
        proseContainer.removeEventListener("click", handleImageClick);
      }
    };
  }, []);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape") setActiveImage(null);
    };
    if (activeImage) window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [activeImage]);

  useEffect(() => {
    if (activeImage) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [activeImage]);

  if (!activeImage) return null;

  return createPortal(
    <div
      className="fixed inset-0 z-[999999] flex items-center justify-center bg-slate-950/80 p-4 sm:p-6 backdrop-blur-md transition-all duration-300 animate-in fade-in"
      onClick={() => setActiveImage(null)}
    >
      {/* Lightbox Container */}
      <div
        className="relative flex flex-col w-full max-w-4xl overflow-hidden rounded-2xl border border-slate-200 bg-white text-slate-900 shadow-2xl dark:border-slate-800 dark:bg-slate-900 dark:text-slate-100 animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Simple & Clean Header */}
        <div className="flex items-center justify-between border-b border-slate-100 bg-slate-50/80 px-5 py-3.5 dark:border-slate-800 dark:bg-slate-900/80">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-400">
              <ImageIcon className="h-4 w-4" />
            </div>
            <div className="min-w-0">
              <h3 className="truncate text-sm font-bold text-slate-900 dark:text-white">
                Foto Sisipan Berita
              </h3>
            </div>
          </div>

          <button
            onClick={() => setActiveImage(null)}
            className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 hover:bg-slate-100 hover:text-slate-600 dark:hover:bg-slate-800 dark:hover:text-slate-200 transition-colors"
            title="Tutup (Esc)"
          >
            <X className="h-4.5 w-4.5" />
          </button>
        </div>

        {/* Image Viewer Area */}
        <div className="relative flex max-h-[72vh] items-center justify-center overflow-hidden bg-slate-950/90 p-3 sm:p-4">
          <img
            src={activeImage.src}
            alt={activeImage.caption}
            className="max-h-[68vh] w-auto max-w-full rounded-xl object-contain shadow-lg"
          />
        </div>

        {/* Clean Caption Footer */}
        {activeImage.caption && (
          <div className="border-t border-slate-100 bg-white px-5 py-3 dark:border-slate-800 dark:bg-slate-900 flex items-center gap-2.5">
            <Info className="h-4 w-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
            <p className="text-xs text-slate-600 dark:text-slate-300 font-medium leading-normal">
              {activeImage.caption}
            </p>
          </div>
        )}
      </div>
    </div>,
    document.body
  );
}
