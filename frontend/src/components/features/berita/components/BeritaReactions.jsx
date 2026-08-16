"use client";

import { useState, useEffect } from "react";
import { useLanguage } from "@/context/LanguageContext";

export default function BeritaReactions({ slug, initialReactions }) {
  const { locale } = useLanguage();
  const [reactions, setReactions] = useState(() => ({
    bermanfaat: Number(initialReactions?.bermanfaat ?? initialReactions?.reaction_bermanfaat ?? initialReactions?.reactionBermanfaat ?? 0),
    inspiratif: Number(initialReactions?.inspiratif ?? initialReactions?.reaction_inspiratif ?? initialReactions?.reactionInspiratif ?? 0),
    informatif: Number(initialReactions?.informatif ?? initialReactions?.reaction_informatif ?? initialReactions?.reactionInformatif ?? 0),
  }));

  const [selectedType, setSelectedType] = useState(() => {
    if (typeof window !== "undefined" && slug) {
      try {
        const saved = localStorage.getItem(`react_berita_${slug}`);
        if (saved && (saved === "bermanfaat" || saved === "inspiratif" || saved === "informatif")) {
          return saved;
        }
      } catch {}
    }
    return null;
  });

  const [isAnimating, setIsAnimating] = useState(null);

  // Sync initial reactions if props change
  useEffect(() => {
    if (initialReactions) {
      setReactions({
        bermanfaat: Number(initialReactions?.bermanfaat ?? initialReactions?.reaction_bermanfaat ?? initialReactions?.reactionBermanfaat ?? 0),
        inspiratif: Number(initialReactions?.inspiratif ?? initialReactions?.reaction_inspiratif ?? initialReactions?.reactionInspiratif ?? 0),
        informatif: Number(initialReactions?.informatif ?? initialReactions?.reaction_informatif ?? initialReactions?.reactionInformatif ?? 0),
      });
    }
  }, [
    initialReactions?.bermanfaat,
    initialReactions?.reaction_bermanfaat,
    initialReactions?.inspiratif,
    initialReactions?.reaction_inspiratif,
    initialReactions?.informatif,
    initialReactions?.reaction_informatif,
  ]);

  useEffect(() => {
    if (!slug) return;
    let isMounted = true;

    // Baca pilihan reaksi user dari localStorage
    try {
      const saved = localStorage.getItem(`react_berita_${slug}`);
      if (saved && (saved === "bermanfaat" || saved === "inspiratif" || saved === "informatif")) {
        setSelectedType(saved);
      } else {
        setSelectedType(null);
      }
    } catch {}

    // Ambil data reaksi terbaru dari server
    async function fetchReactions() {
      try {
        const res = await fetch(`/api/berita/${slug}/react`, { cache: "no-store" });
        if (res.ok) {
          const data = await res.json();
          const payload = data?.data || data;
          if (isMounted && payload) {
            setReactions({
              bermanfaat: Number(payload.bermanfaat ?? payload.reaction_bermanfaat ?? 0),
              inspiratif: Number(payload.inspiratif ?? payload.reaction_inspiratif ?? 0),
              informatif: Number(payload.informatif ?? payload.reaction_informatif ?? 0),
            });
          }
        }
      } catch {}
    }

    fetchReactions();

    // Background live sync setiap 15 detik
    const interval = setInterval(fetchReactions, 15000);

    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, [slug]);

  const handleReact = async (type) => {
    if (!type || !slug) return;

    let currentSelected = selectedType;
    if (!currentSelected && typeof window !== "undefined") {
      try {
        currentSelected = localStorage.getItem(`react_berita_${slug}`) || null;
      } catch {}
    }

    let action = "add";
    let previousType = null;

    if (currentSelected === type) {
      action = "remove";
    } else if (currentSelected) {
      action = "switch";
      previousType = currentSelected;
    }

    // Animasi klik
    setIsAnimating(type);
    setTimeout(() => setIsAnimating(null), 800);

    // Optimistic UI state update
    setReactions((prev) => {
      const next = { ...prev };
      if (action === "remove") {
        next[type] = Math.max(0, (next[type] || 0) - 1);
      } else if (action === "switch" && previousType) {
        next[previousType] = Math.max(0, (next[previousType] || 0) - 1);
        next[type] = (next[type] || 0) + 1;
      } else {
        next[type] = (next[type] || 0) + 1;
      }
      return next;
    });

    if (action === "remove") {
      setSelectedType(null);
      try {
        localStorage.removeItem(`react_berita_${slug}`);
      } catch {}
    } else {
      setSelectedType(type);
      try {
        localStorage.setItem(`react_berita_${slug}`, type);
      } catch {}
    }

    try {
      const res = await fetch(`/api/berita/${slug}/react`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ type, action, previousType }),
      });

      if (res.ok) {
        const data = await res.json();
        const payload = data?.data || data;
        if (payload) {
          setReactions({
            bermanfaat: Number(payload.bermanfaat ?? payload.reaction_bermanfaat ?? 0),
            inspiratif: Number(payload.inspiratif ?? payload.reaction_inspiratif ?? 0),
            informatif: Number(payload.informatif ?? payload.reaction_informatif ?? 0),
          });
        }
      }
    } catch (err) {
      console.warn("Gagal sinkron reaksi ke server:", err);
    }
  };

  const reactionOptions = [
    { type: "bermanfaat", icon: "👍", label: locale === "en" ? "Helpful" : "Bermanfaat", count: reactions.bermanfaat },
    { type: "inspiratif", icon: "👏", label: locale === "en" ? "Inspiring" : "Inspiratif", count: reactions.inspiratif },
    { type: "informatif", icon: "💡", label: locale === "en" ? "Informative" : "Informatif", count: reactions.informatif },
  ];

  return (
    <div className="mt-12 pt-8 border-t border-slate-200 dark:border-slate-800">
      <div className="text-center mb-6">
        <h3 className="text-lg font-bold text-slate-800 dark:text-slate-200">
          {locale === "en" ? "What do you think about this article?" : "Apa pendapat Anda tentang artikel ini?"}
        </h3>
        <p className="text-sm text-slate-500 mt-1">
          {locale === "en" ? "Give your reaction below" : "Berikan reaksi Anda di bawah ini"}
        </p>
      </div>

      <div className="grid grid-cols-3 gap-2 sm:gap-4 max-w-lg mx-auto">
        {reactionOptions.map((opt) => {
          const isSelected = selectedType === opt.type;
          const animating = isAnimating === opt.type;

          return (
            <button
              key={opt.type}
              type="button"
              onClick={() => handleReact(opt.type)}
              className={`
                relative group flex flex-col items-center justify-center py-3 px-1 sm:p-4 rounded-3xl transition-all duration-300
                hover:-translate-y-1 cursor-pointer w-full active:scale-95 border
                ${
                  isSelected
                    ? "bg-emerald-50 border-emerald-500 ring-2 ring-emerald-500/30 dark:bg-emerald-950/50 dark:border-emerald-400 dark:ring-emerald-400/30 shadow-md scale-[1.02]"
                    : "bg-white border-slate-200 dark:bg-slate-900 dark:border-slate-800 hover:border-emerald-300 hover:shadow-md"
                }
              `}
            >
              <div className="text-3xl mb-2 transition-transform duration-300 group-hover:scale-110">
                <span className={animating ? "inline-block animate-bounce" : "inline-block"}>
                  {opt.icon}
                </span>
              </div>
              <span
                className={`text-[10px] sm:text-[11px] font-bold uppercase tracking-wide mb-1 text-center transition-colors ${
                  isSelected
                    ? "text-emerald-700 dark:text-emerald-300 font-extrabold"
                    : "text-slate-600 dark:text-slate-400"
                }`}
              >
                {opt.label}
              </span>
              <span
                className={`text-sm font-black transition-colors ${
                  isSelected
                    ? "text-emerald-600 dark:text-emerald-400"
                    : "text-slate-500 dark:text-slate-400"
                }`}
              >
                {opt.count}
              </span>

              {/* Ping Ring Effect when clicked */}
              {animating && (
                <span className="absolute inset-0 rounded-3xl border-2 border-emerald-400 animate-ping opacity-30 pointer-events-none" />
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
