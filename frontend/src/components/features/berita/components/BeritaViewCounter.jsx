"use client";

import React, { useEffect, useState } from "react";
import { useLanguage } from "@/context/LanguageContext";
import { Eye } from "lucide-react";

export default function BeritaViewCounter({ slug, initialViews = 0 }) {
  const { t, locale } = useLanguage();
  const [views, setViews] = useState(Number(initialViews || 0));
  const [isUpdating, setIsUpdating] = useState(false);

  useEffect(() => {
    if (!slug) return;

    let isMounted = true;
    const controller = new AbortController();

    async function recordAndFetchView() {
      try {
        const response = await fetch(`/api/berita/${slug}/view`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          signal: controller.signal,
        });

        if (response.ok) {
          const data = await response.json();
          const count =
            typeof data?.views === "number"
              ? data.views
              : typeof data?.data?.views === "number"
              ? data.data.views
              : null;
          if (isMounted && count !== null) {
            setViews(count);
            setIsUpdating(true);
            setTimeout(() => {
              if (isMounted) setIsUpdating(false);
            }, 800);
          }
        }
      } catch (err) {
        if (err?.name === "AbortError") return;
      }
    }

    recordAndFetchView();

    // Background interval sync (setiap 20 detik)
    const interval = setInterval(async () => {
      try {
        const res = await fetch(`/api/berita/${slug}`, { cache: "no-store" });
        if (res.ok) {
          const data = await res.json();
          const latest = data?.berita?.views ?? data?.views;
          if (isMounted && typeof latest === "number" && latest !== views) {
            setViews(latest);
          }
        }
      } catch {
        // silent fail on network glitch
      }
    }, 20000);

    return () => {
      isMounted = false;
      controller.abort();
      clearInterval(interval);
    };
  }, [slug]);

  return (
    <div className="inline-flex items-center gap-1.5 text-sm font-medium text-slate-700 dark:text-slate-200">
      <Eye
        className={`h-4 w-4 text-emerald-600 dark:text-emerald-400 transition-transform duration-300 ${
          isUpdating ? "scale-125 text-emerald-500" : ""
        }`}
      />
      <span
        className={`transition-all duration-300 ${
          isUpdating ? "text-emerald-600 font-bold scale-105" : ""
        }`}
      >
        {views.toLocaleString(locale === "en" ? "en-US" : "id-ID")}{" "}
        {t("berita.readCount") || "kali dibaca"}
      </span>
    </div>
  );
}