"use client";

import React, { useState, useEffect } from "react";
import Image from "@/components/common/NextImage";
import { useLanguage } from "@/context/LanguageContext";
import { useHomepageSlides } from "./hooks/useHomepageSlides";
import SectionHeader from "./components/SectionHeader";
import CategorySlider from "./components/CategorySlider";
import {
    ChevronLeftIcon,
    ChevronRightIcon,
    SkmIcon,
    IslamIcon,
    KristenIcon,
    KatolikIcon,
    HinduIcon
} from "./components/HomepageSlidesIcons";

function resolveImage(value = "") {
    const raw = String(value || "").trim();
    return raw || "/assets/branding/kemenag.svg";
}

export default function HomepageSlidesSection({ slides = [] }) {
    const { t } = useLanguage();
    const {
        normalizedSlides,
        katolikSlides,
        kristenSlides,
        islamSlides,
        hinduSlides,
        ipkpSlides,
        ipakSlides,
        activeTab,
        setActiveTab,
    } = useHomepageSlides(slides);

    const [selectedSlide, setSelectedSlide] = useState(null);

    useEffect(() => {
        if (selectedSlide) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = '';
        }
        return () => {
            document.body.style.overflow = '';
        };
    }, [selectedSlide]);

    if (normalizedSlides.length === 0) return null;

    const tabs = [
        { id: "katolik", label: "Katolik", Icon: KatolikIcon },
        { id: "kristen", label: "Kristen", Icon: KristenIcon },
        { id: "skm", label: "Hasil SKM", Icon: SkmIcon },
        { id: "islam", label: "Islam", Icon: IslamIcon },
        { id: "hindu", label: "Hindu", Icon: HinduIcon },
    ];

    return (
        <section className="w-full px-4 py-10 sm:px-10 lg:px-12 xl:px-16 overflow-hidden">
            <div className="mx-auto max-w-[1600px]">

                {/* 1. GLOBAL MOBILE HEADER */}
                <div className="mb-6 lg:hidden">
                    <SectionHeader
                        label="SURVEY KEPUASAN MASYARAKAT (SKM)"
                        title="Laporan Hasil SKM"
                        color="text-emerald-700 dark:text-emerald-300"
                        center
                    />
                </div>

                {/* 2. FLOATING TAB NAVIGATION (Mobile Only) - Modern Pill Dock with Sliding Indicator */}
                <div className="mb-2 lg:hidden relative z-20">
                    <div className="relative mx-auto flex w-fit items-center gap-1 rounded-full border border-slate-200/60 bg-white/50 p-1.5 shadow-xl shadow-slate-200/30 backdrop-blur-xl dark:border-white/5 dark:bg-slate-900/60 dark:shadow-none">
                        {tabs.map(({ id, label, Icon }) => {
                            const isActive = activeTab === id;
                            return (
                                <button
                                    key={id}
                                    onClick={() => setActiveTab(id)}
                                    className={`relative flex min-w-[60px] flex-col items-center justify-center gap-1 rounded-full py-2.5 transition-all duration-300 z-10 ${isActive
                                        ? "text-white scale-105"
                                        : "text-slate-600 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200"
                                        }`}
                                >
                                    {isActive && (
                                        <div className="absolute inset-0 -z-10 rounded-full bg-emerald-600 shadow-[0_8px_20px_-6px_rgba(16,185,129,0.5)]" />
                                    )}

                                    <div className={`transition-transform duration-300 ${isActive ? "scale-105" : "scale-90"}`}>
                                        <Icon />
                                    </div>
                                    <span className={`text-[8px] font-black uppercase tracking-widest ${isActive ? "opacity-100" : "opacity-80"}`}>
                                        {label}
                                    </span>
                                </button>
                            );
                        })}
                    </div>
                </div>

                {/* 2. CONTENT AREA - Animated Transitions */}
                <div className="relative flex flex-col gap-10 lg:grid lg:grid-cols-6 lg:gap-6">
                    {/* Content Slot for Mobile (Overlay items in same spot) */}
                    <style>{`
                        @media (max-width: 1023px) {
                            .mobile-tab-content {
                                transition: all 0.6s cubic-bezier(0.4, 0, 0.2, 1);
                                position: relative;
                            }
                            .mobile-tab-content.inactive {
                                opacity: 0;
                                transform: translateY(20px);
                                pointer-events: none;
                                position: absolute;
                                width: 100%;
                            }
                            .mobile-tab-content.active {
                                opacity: 1;
                                transform: translateY(0);
                                z-index: 10;
                            }
                        }
                    `}</style>

                    {/* 1. KATOLIK (Ujung Kiri) */}
                    <div className={`mobile-tab-content group relative flex flex-col lg:col-span-1 transition-all duration-700 lg:mt-24 lg:scale-[0.95] lg:opacity-100 hover:scale-100 ${activeTab === "katolik" ? "active" : "inactive lg:flex"}`}>
                        <div className="absolute -inset-4 -z-10 rounded-[3rem] bg-gradient-to-b from-purple-100/40 to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100 dark:from-purple-950/20" />
                        <div className="relative flex flex-col">
                            <SectionHeader
                                label={t("home.katolikSection.subtitle")}
                                title={t("home.katolikSection.title")}
                                color="text-purple-800 dark:text-purple-200"
                            />
                            <div
                                className="lg:rounded-2xl lg:shadow-[0_20px_50px_-20px_rgba(168,85,247,0.15)] lg:transition-all lg:duration-300 lg:hover:-translate-y-1.5 lg:group-hover:shadow-[0_20px_50px_-10px_rgba(168,85,247,0.3)]"
                            >
                                <CategorySlider slides={katolikSlides} fallbackTitle="Doa & Renungan" onSlideClick={setSelectedSlide} />
                            </div>
                        </div>
                    </div>

                    {/* 2. KRISTEN (Kiri Tengah) */}
                    <div className={`mobile-tab-content group relative flex flex-col lg:col-span-1 transition-all duration-700 lg:mt-12 lg:scale-100 lg:opacity-100 hover:scale-105 ${activeTab === "kristen" ? "active" : "inactive lg:flex"}`}>
                        <div className="absolute -inset-4 -z-10 rounded-[3rem] bg-gradient-to-b from-blue-100/40 to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100 dark:from-blue-950/20" />
                        <div className="relative flex flex-col">
                            <SectionHeader
                                label={t("home.christianSection.subtitle")}
                                title={t("home.christianSection.title")}
                                color="text-blue-800 dark:text-blue-200"
                            />
                            <div
                                className="lg:rounded-2xl lg:shadow-[0_20px_50px_-20px_rgba(59,130,246,0.15)] lg:transition-all lg:duration-300 lg:hover:-translate-y-1.5 lg:group-hover:shadow-[0_20px_50px_-10px_rgba(59,130,246,0.3)]"
                            >
                                <CategorySlider slides={kristenSlides} fallbackTitle="Renungan Iman" onSlideClick={setSelectedSlide} />
                            </div>
                        </div>
                    </div>

                    {/* 3. TENGAH: SKM (2 Kolom: IPKP di Kiri & IPAK di Kanan) */}
                    <div className={`mobile-tab-content group relative w-full md:col-span-2 lg:col-span-2 transition-all duration-700 lg:scale-[1.02] lg:z-20 ${activeTab === "skm" ? "active flex flex-col" : "inactive lg:flex"}`}>
                        <div className="absolute -inset-6 -z-10 rounded-[3.5rem] bg-gradient-to-b from-emerald-100/70 via-teal-50/40 to-transparent dark:from-emerald-950/30 dark:via-teal-950/20" />
                        <div className="relative flex flex-col">
                            {/* Desktop Header */}
                            <div className="hidden lg:block">
                                <SectionHeader
                                    label="SURVEY KEPUASAN MASYARAKAT (SKM)"
                                    title="Laporan Hasil SKM"
                                    color="text-emerald-700 dark:text-emerald-300"
                                    center
                                />
                            </div>

                            {/* MOBILE VIEW (Stacked IPKP & IPAK) */}
                            <div className="lg:hidden flex flex-col gap-6">
                                {/* Slot IPKP (Mobile) */}
                                <div className="flex flex-col">
                                    <div className="mb-1.5 flex items-center justify-center gap-2">
                                        <span className="h-2 w-2 rounded-full bg-emerald-500 shadow-sm" />
                                        <span className="text-xs font-black uppercase tracking-wider text-emerald-800 dark:text-emerald-300">
                                            IPKP — Kualitas Pelayanan
                                        </span>
                                    </div>
                                    <CategorySlider
                                        slides={ipkpSlides}
                                        fallbackTitle="Indeks Persepsi Kualitas Pelayanan (IPKP)"
                                        onSlideClick={setSelectedSlide}
                                    />
                                </div>

                                {/* Slot IPAK (Mobile) */}
                                <div className="flex flex-col pt-2 border-t border-slate-200/60 dark:border-slate-800/60">
                                    <div className="mb-1.5 flex items-center justify-center gap-2">
                                        <span className="h-2 w-2 rounded-full bg-teal-500 shadow-sm" />
                                        <span className="text-xs font-black uppercase tracking-wider text-teal-800 dark:text-teal-300">
                                            IPAK — Anti Korupsi
                                        </span>
                                    </div>
                                    <CategorySlider
                                        slides={ipakSlides}
                                        fallbackTitle="Indeks Persepsi Anti Korupsi (IPAK)"
                                        onSlideClick={setSelectedSlide}
                                    />
                                </div>
                            </div>

                            {/* DESKTOP VIEW (2 Kolom Berdampingan: IPKP di Kiri, IPAK di Kanan) */}
                            <div className="hidden lg:grid lg:grid-cols-2 lg:gap-4 xl:gap-5">
                                {/* Sub-Kolom Kiri: IPKP */}
                                <div className="flex flex-col">
                                    <div className="mb-2.5 flex items-center justify-center gap-1.5 rounded-xl bg-emerald-50/90 py-1.5 px-3 border border-emerald-200/70 text-center shadow-xs dark:bg-emerald-950/50 dark:border-emerald-800/50">
                                        <span className="h-2 w-2 rounded-full bg-emerald-500 shrink-0" />
                                        <span className="text-[10.5px] font-black uppercase tracking-wider text-emerald-800 dark:text-emerald-300 truncate">
                                            IPKP • Kualitas Pelayanan
                                        </span>
                                    </div>
                                    <div className="lg:rounded-2xl lg:shadow-[0_20px_50px_-20px_rgba(16,185,129,0.2)] lg:transition-all lg:duration-300 lg:hover:-translate-y-1.5 lg:hover:shadow-[0_20px_50px_-10px_rgba(16,185,129,0.35)]">
                                        <CategorySlider
                                            slides={ipkpSlides}
                                            fallbackTitle="Indeks Persepsi Kualitas Pelayanan (IPKP)"
                                            onSlideClick={setSelectedSlide}
                                        />
                                    </div>
                                </div>

                                {/* Sub-Kolom Kanan: IPAK */}
                                <div className="flex flex-col">
                                    <div className="mb-2.5 flex items-center justify-center gap-1.5 rounded-xl bg-teal-50/90 py-1.5 px-3 border border-teal-200/70 text-center shadow-xs dark:bg-teal-950/50 dark:border-teal-800/50">
                                        <span className="h-2 w-2 rounded-full bg-teal-500 shrink-0" />
                                        <span className="text-[10.5px] font-black uppercase tracking-wider text-teal-800 dark:text-teal-300 truncate">
                                            IPAK • Anti Korupsi
                                        </span>
                                    </div>
                                    <div className="lg:rounded-2xl lg:shadow-[0_20px_50px_-20px_rgba(20,184,166,0.2)] lg:transition-all lg:duration-300 lg:hover:-translate-y-1.5 lg:hover:shadow-[0_20px_50px_-10px_rgba(20,184,166,0.35)]">
                                        <CategorySlider
                                            slides={ipakSlides}
                                            fallbackTitle="Indeks Persepsi Anti Korupsi (IPAK)"
                                            onSlideClick={setSelectedSlide}
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* 4. ISLAM (Kanan Tengah) */}
                    <div className={`mobile-tab-content group relative flex flex-col lg:col-span-1 transition-all duration-700 lg:mt-12 lg:scale-100 lg:opacity-100 hover:scale-105 ${activeTab === "islam" ? "active" : "inactive lg:flex"}`}>
                        <div className="absolute -inset-4 -z-10 rounded-[3rem] bg-gradient-to-b from-amber-100/40 to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100 dark:from-amber-950/20" />
                        <div className="relative flex flex-col">
                            <SectionHeader
                                label={t("home.islamicSection.subtitle")}
                                title={t("home.islamicSection.title")}
                                color="text-amber-800 dark:text-amber-200"
                                align="right"
                            />
                            <div
                                className="lg:rounded-2xl lg:shadow-[0_20px_50px_-20px_rgba(245,158,11,0.15)] lg:transition-all lg:duration-300 lg:hover:-translate-y-1.5 lg:group-hover:shadow-[0_20px_50px_-10px_rgba(245,158,11,0.3)]"
                            >
                                <CategorySlider slides={islamSlides} fallbackTitle="Mutiara Hikmah" onSlideClick={setSelectedSlide} />
                            </div>
                        </div>
                    </div>

                    {/* 5. HINDU (Ujung Kanan) */}
                    <div className={`mobile-tab-content group relative flex flex-col lg:col-span-1 transition-all duration-700 lg:mt-24 lg:scale-[0.95] lg:opacity-100 hover:scale-100 ${activeTab === "hindu" ? "active" : "inactive lg:flex"}`}>
                        <div className="absolute -inset-4 -z-10 rounded-[3rem] bg-gradient-to-b from-rose-100/40 to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100 dark:from-rose-950/20" />
                        <div className="relative flex flex-col">
                            <SectionHeader
                                label={t("home.hinduSection.subtitle")}
                                title={t("home.hinduSection.title")}
                                color="text-rose-800 dark:text-rose-200"
                                align="right"
                            />
                            <div
                                className="lg:rounded-2xl lg:shadow-[0_20px_50px_-20px_rgba(244,63,94,0.15)] lg:transition-all lg:duration-300 lg:hover:-translate-y-1.5 lg:group-hover:shadow-[0_20px_50px_-10px_rgba(244,63,94,0.3)]"
                            >
                                <CategorySlider slides={hinduSlides} fallbackTitle="Dharma Wacana" onSlideClick={setSelectedSlide} />
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* LIGHTBOX MODAL */}
            {selectedSlide && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6">
                    <div 
                        className="absolute inset-0 bg-black/80 backdrop-blur-sm transition-opacity"
                        onClick={() => setSelectedSlide(null)}
                    />
                    <div className="relative w-full max-w-4xl flex flex-col overflow-hidden rounded-2xl bg-white dark:bg-slate-900 shadow-2xl animate-[fadeIn_300ms_ease-out]">
                        <button 
                            onClick={() => setSelectedSlide(null)}
                            className="absolute right-4 top-4 z-10 rounded-full bg-black/50 p-2 text-white hover:bg-black/70 transition-colors backdrop-blur-md"
                        >
                            <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                        <div className="relative w-full aspect-[4/5] sm:aspect-video bg-slate-100 dark:bg-slate-950">
                            <Image
                                src={resolveImage(selectedSlide.image_url)}
                                alt={selectedSlide.title || "Slide image"}
                                fill
                                sizes="(max-width: 896px) 100vw, 896px"
                                className="object-contain"
                            />
                        </div>
                        <div className="p-6 sm:p-8 bg-white dark:bg-slate-900">
                            <h3 className="text-xl sm:text-2xl font-black leading-tight text-slate-900 dark:text-white">
                                {selectedSlide.title}
                            </h3>
                            {selectedSlide.caption && (
                                <p className="mt-3 text-sm sm:text-base leading-relaxed text-slate-600 dark:text-slate-300">
                                    {selectedSlide.caption}
                                </p>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </section>
    );
}
