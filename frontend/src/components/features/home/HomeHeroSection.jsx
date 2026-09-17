"use client";

import React, { useState, useEffect } from "react";
import Image from "@/components/common/NextImage";

const HERO_SLOGANS = [
  {
    line1: "Kemenag Barito Utara",
    line2: "Hadir Melayani Sepenuh Hati",
  },
  {
    line1: "Layanan Informasi Keagamaan",
    line2: "Berlandaskan Semangat HAPAKAT",
  },
  {
    line1: "Transformasi Digital Terpadu",
    line2: "Pelayanan PTSP Si ATAK",
  },
  {
    line1: "Mewujudkan Pelayanan Umat",
    line2: "Ramah, Cepat & Akuntabel",
  },
];

function useTypewriter(slogans = HERO_SLOGANS, typingSpeed = 85, deletingSpeed = 40, pauseTime = 3200) {
  const [sloganIndex, setSloganIndex] = useState(0);
  const currentSlogan = slogans[sloganIndex % slogans.length];
  const totalLength = currentSlogan.line1.length + currentSlogan.line2.length;

  // Inisialisasi awal langsung terisi penuh agar SSR merender teks lengkap tanpa jeda/kedip
  const [progress, setProgress] = useState(totalLength);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    if (!isMounted) return;

    let timer;

    if (isDeleting) {
      if (progress > 0) {
        timer = setTimeout(() => {
          setProgress((prev) => prev - 1);
        }, deletingSpeed);
      } else {
        setIsDeleting(false);
        setSloganIndex((prev) => (prev + 1) % slogans.length);
      }
    } else {
      if (progress < totalLength) {
        timer = setTimeout(() => {
          setProgress((prev) => prev + 1);
        }, typingSpeed);
      } else {
        timer = setTimeout(() => {
          setIsDeleting(true);
        }, pauseTime);
      }
    }

    return () => clearTimeout(timer);
  }, [progress, isDeleting, sloganIndex, slogans, totalLength, typingSpeed, deletingSpeed, pauseTime, isMounted]);

  const line1Length = currentSlogan.line1.length;
  let text1 = "";
  let text2 = "";
  let activeLine = 1;

  if (progress <= line1Length) {
    text1 = currentSlogan.line1.slice(0, progress);
    text2 = "";
    activeLine = 1;
  } else {
    text1 = currentSlogan.line1;
    text2 = currentSlogan.line2.slice(0, progress - line1Length);
    activeLine = 2;
  }

  return { text1, text2, activeLine };
}

export default function HomeHeroSection({ totalBerita = null, totalPtsp = null }) {
  const { text1, text2, activeLine } = useTypewriter();

  return (
    <section className="relative min-h-screen lg:h-screen w-full overflow-hidden bg-slate-950 flex flex-col justify-between pt-28 sm:pt-36 lg:pt-44 pb-6 sm:pb-10">
      {/* Hero Background Image (Static, Clean Fullscreen) */}
      <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
        <div className="absolute inset-0">
          <Image
            src="/assets/images/portal-3d-bg.jpg"
            alt="Gedung Kantor Kementerian Agama Barito Utara"
            fill
            sizes="100vw"
            quality={95}
            className="object-cover object-center"
            priority
            fetchPriority="high"
          />
        </div>

        {/* Top Scrim (Ensures 2-Row Transparent Navbar Elements Read Clearly) */}
        <div className="absolute inset-x-0 top-0 h-40 sm:h-48 bg-gradient-to-b from-slate-950/85 via-slate-950/40 to-transparent pointer-events-none" />

        {/* Ambient Dark Gradient & Vignette for Sharp Text Contrast */}
        <div className="absolute inset-0 bg-gradient-to-b from-slate-950/70 via-slate-950/35 to-slate-950/85 pointer-events-none" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(2,6,23,0.25)_0%,rgba(2,6,23,0.75)_100%)] pointer-events-none" />

        {/* Subtle Atmospheric Glow Orbs */}
        <div className="absolute -left-20 top-20 h-[380px] w-[380px] rounded-full bg-emerald-500/10 blur-[120px] pointer-events-none" />
        <div className="absolute -right-20 bottom-20 h-[340px] w-[340px] rounded-full bg-teal-500/10 blur-[100px] pointer-events-none" />
      </div>

      {/* Center Dignified Government Content (Clean, Spacious, Human-Crafted) */}
      <div className="relative z-10 w-full px-4 sm:px-8 lg:px-16 my-auto">
        <div className="mx-auto max-w-6xl text-center flex flex-col items-center">
          {/* Institution Identity (Rapi di mobile dan desktop) */}
          <div className="flex items-center justify-center gap-2 text-[10.5px] xs:text-xs sm:text-sm md:text-base font-bold uppercase tracking-[0.14em] sm:tracking-[0.2em] text-emerald-300 drop-shadow-md animate-fade-in-up text-center">
            <span className="flex h-2 w-2 sm:h-2.5 sm:w-2.5 rounded-full bg-emerald-400 shadow-[0_0_10px_#34d399] animate-pulse flex-shrink-0" />
            <span className="leading-snug">
              Kementerian Agama Republik Indonesia <span className="text-slate-100 block xs:inline">Kabupaten Barito Utara</span>
            </span>
          </div>

          {/* Authentic Modern Headline 2 Baris Centered dengan Typewriter Effect */}
          <h1 className="mt-3.5 sm:mt-6 w-full text-center">
            <div className="flex flex-col items-center justify-center text-center w-full min-h-[2.8em] sm:min-h-[2.6em] text-[clamp(1.2rem,4.4vw,3.65rem)] font-black text-white tracking-tight leading-[1.25] sm:leading-[1.22] drop-shadow-2xl">
              {/* Baris 1 - Centered */}
              <div className="w-full flex items-center justify-center text-center">
                <span className="inline-block text-center bg-gradient-to-r from-emerald-300 via-teal-200 to-emerald-400 bg-clip-text text-transparent drop-shadow-[0_0_40px_rgba(52,211,153,0.4)] whitespace-nowrap sm:whitespace-normal">
                  {text1}
                  {activeLine === 1 && (
                    <span
                      className="inline-block w-[2.5px] sm:w-[4px] lg:w-[5px] h-[0.75em] bg-emerald-400 ml-1.5 sm:ml-2 align-middle rounded-full animate-pulse shadow-[0_0_12px_#34d399]"
                      aria-hidden="true"
                    />
                  )}
                  {!text1 && (
                    <span className="invisible select-none opacity-0" aria-hidden="true">
                      &nbsp;
                    </span>
                  )}
                </span>
              </div>

              {/* Baris 2 - Centered */}
              <div className="w-full flex items-center justify-center text-center">
                <span className="inline-block text-center bg-gradient-to-r from-emerald-300 via-teal-200 to-emerald-400 bg-clip-text text-transparent drop-shadow-[0_0_40px_rgba(52,211,153,0.4)] whitespace-nowrap sm:whitespace-normal">
                  {text2}
                  {activeLine === 2 && (
                    <span
                      className="inline-block w-[2.5px] sm:w-[4px] lg:w-[5px] h-[0.75em] bg-emerald-400 ml-1.5 sm:ml-2 align-middle rounded-full animate-pulse shadow-[0_0_12px_#34d399]"
                      aria-hidden="true"
                    />
                  )}
                  {!text2 && (
                    <span className="invisible select-none opacity-0" aria-hidden="true">
                      &nbsp;
                    </span>
                  )}
                </span>
              </div>
            </div>
          </h1>

          {/* Clear Dignified Subtitle */}
          <p className="mt-3.5 sm:mt-5 max-w-3xl text-xs sm:text-base md:text-lg text-slate-200/90 leading-relaxed font-normal drop-shadow-md animate-fade-in-up animate-delay-200 px-1 sm:px-0">
            Website resmi pelayanan dan informasi keagamaan yang Harmonis, Amanah, Profesional, Akuntabel, Kreatif, Adil, dan Transparan bagi seluruh masyarakat Kabupaten Barito Utara.
          </p>
        </div>
      </div>

      {/* Subtle Scroll Down Prompt */}
      <div className="relative z-10 mx-auto mt-6 hidden lg:flex flex-col items-center gap-1.5 opacity-50 hover:opacity-90 transition-opacity">
        <span className="text-[10px] font-bold uppercase tracking-widest text-slate-300 drop-shadow-md">
          Gulir ke bawah
        </span>
        <div className="h-5 w-3 rounded-full border-2 border-white/40 p-0.5">
          <div className="mx-auto h-1.5 w-0.5 rounded-full bg-emerald-400 animate-bounce" />
        </div>
      </div>
    </section>
  );
}
