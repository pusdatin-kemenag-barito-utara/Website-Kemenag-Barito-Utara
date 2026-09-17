"use client";

import React from "react";
import Image from "@/components/common/NextImage";

export default function HomeHeroSection() {
  return (
    <section className="relative min-h-screen lg:h-screen w-full overflow-hidden bg-slate-950 flex flex-col justify-between pt-36 sm:pt-40 lg:pt-44 pb-10 sm:pb-12">
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
        <div className="absolute inset-x-0 top-0 h-48 bg-gradient-to-b from-slate-950/85 via-slate-950/40 to-transparent pointer-events-none" />

        {/* Ambient Dark Gradient & Vignette for Sharp Text Contrast */}
        <div className="absolute inset-0 bg-gradient-to-b from-slate-950/70 via-slate-950/35 to-slate-950/85 pointer-events-none" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(2,6,23,0.25)_0%,rgba(2,6,23,0.75)_100%)] pointer-events-none" />

        {/* Subtle Atmospheric Glow Orbs */}
        <div className="absolute -left-20 top-20 h-[380px] w-[380px] rounded-full bg-emerald-500/10 blur-[120px] pointer-events-none" />
        <div className="absolute -right-20 bottom-20 h-[340px] w-[340px] rounded-full bg-teal-500/10 blur-[100px] pointer-events-none" />
      </div>

      {/* Center Dignified Government Content (Clean, Spacious, Human-Crafted) */}
      <div className="relative z-10 w-full px-5 sm:px-8 lg:px-16 my-auto">
        <div className="mx-auto max-w-4xl text-center flex flex-col items-center">
          {/* Dignified Official Seal / Institution Tag */}
          <div className="inline-flex items-center gap-2.5 px-4 py-1.5 rounded-full bg-slate-950/70 border border-emerald-500/40 backdrop-blur-md shadow-lg animate-fade-in-up">
            <span className="flex h-2 w-2 rounded-full bg-emerald-400 shadow-[0_0_8px_#34d399] animate-pulse" />
            <span className="text-[10px] sm:text-xs font-bold uppercase tracking-[0.25em] text-emerald-300">
              Kementerian Agama Republik Indonesia
            </span>
            <span className="text-white/30 hidden xs:inline">•</span>
            <span className="text-[10px] sm:text-xs font-semibold tracking-wider text-slate-200 hidden xs:inline">
              Kabupaten Barito Utara
            </span>
          </div>

          {/* Authentic Dignified Headline */}
          <h1 className="mt-5 max-w-4xl text-3xl sm:text-4xl md:text-5xl lg:text-[3.5rem] font-black text-white tracking-tight leading-[1.18] drop-shadow-xl animate-fade-in-up animate-delay-100">
            Layanan Informasi Keagamaan Berlandaskan Semangat{" "}
            <span className="inline-block text-emerald-400 drop-shadow-[0_0_25px_rgba(52,211,153,0.3)]">
              HAPAKAT
            </span>
          </h1>

          {/* Clear Dignified Subtitle */}
          <p className="mt-3.5 max-w-2xl text-sm sm:text-base text-slate-200 leading-relaxed font-medium drop-shadow-md animate-fade-in-up animate-delay-200">
            Portal resmi pelayanan terpadu yang Harmonis, Amanah, Profesional, Akuntabel, Kreatif, Adil, dan Transparan untuk seluruh masyarakat Kabupaten Barito Utara.
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
