"use client";

import { Fragment } from "react";
import Providers from "@/components/layout/Providers";
import Header from "@/components/layout/Header/Header";
import Footer from "@/components/layout/Footer/Footer";
import ScrollReveal from "@/components/common/ScrollReveal";
import HomeHeroSection from "./HomeHeroSection";
import LayananPtspSection from "./LayananPtspSection";
import ApaKataMerekaSection from "./ApaKataMerekaSection";
import HomeNewsSection from "./HomeNewsSection";
import HomeNewsPerCategorySection from "./HomeNewsPerCategorySection";
import HomeGallerySection from "./HomeGallerySection";
import HomepageSlidesSection from "./HomepageSlidesSection";
import YoutubeSectionClient from "./YoutubeSectionClient";
import ExternalAppsSection from "./ExternalAppsSection";
import {
  normalizeBerita,
  normalizeHomepageSlide,
  normalizeGaleriItem,
} from "@/lib/berita-normalize";

function SectionDivider() {
  return (
    <div className="py-4" aria-hidden="true">
      <div className="mx-auto max-w-6xl px-6 sm:px-10 lg:px-16 xl:px-20">
        <div className="relative h-10">
          <div
            className="absolute inset-x-0 top-1/2 h-px -translate-y-1/2 rounded-full"
            style={{
              background:
                "linear-gradient(90deg, transparent 0%, rgba(16,185,129,0.35) 16%, rgba(148,163,184,0.55) 50%, rgba(16,185,129,0.35) 84%, transparent 100%)",
            }}
          />
          <div className="absolute left-1/2 top-1/2 h-3 w-36 -translate-x-1/2 -translate-y-1/2 rounded-full bg-emerald-400/30 blur-xl dark:bg-emerald-300/15" />
        </div>
      </div>
    </div>
  );
}

/**
 * @param {{ homeData?: Record<string, any>, youtubeVideos?: any[], initialSettings?: any }} props
 */
export default function HomePage({ homeData = {}, youtubeVideos = [], initialSettings = null }) {
  const d = homeData || {};

  const hariIniBerita = (d.hariIni || []).map(normalizeBerita).filter(Boolean);
  const latestBerita = (d.latest || []).map(normalizeBerita).filter(Boolean);
  const nasionalBerita = (d.nasional || []).map(normalizeBerita).filter(Boolean);
  const popularBerita = (d.popular || []).map(normalizeBerita).filter(Boolean);
  const groupedBerita = (d.grouped || []).map((g) => ({
    ...g,
    items: (g.items || []).map(normalizeBerita).filter(Boolean),
  }));
  const latestGaleri = (d.galeri || []).map(normalizeGaleriItem).filter(Boolean);
  const slidesData = (d.slides || []).map(normalizeHomepageSlide).filter(Boolean);
  const testimonialData = d.testimonials || [];
  const ptspServices = d.ptsp || [];

  return (
    <Providers initialSettings={initialSettings}>
      <Header />
      <main id="konten-utama" tabIndex={-1} className="theme-page min-h-screen">
        <HomeHeroSection totalBerita={d.totalBerita || d.stats?.totalBerita} />

        <ScrollReveal delay={0.1}>
          <div className="pt-8 lg:pt-10">
            <SectionDivider />
          </div>
        </ScrollReveal>

        {/* Layanan PTSP */}
        <ScrollReveal>
          <LayananPtspSection services={ptspServices} />
        </ScrollReveal>

        <SectionDivider />

        {/* Apa Kata Mereka */}
        <ScrollReveal>
          <ApaKataMerekaSection testimonials={testimonialData} />
        </ScrollReveal>

        <ScrollReveal delay={0.1}>
          <SectionDivider />
        </ScrollReveal>

        <ScrollReveal delay={0.2}>
          <HomeNewsSection
            hariIniBerita={hariIniBerita}
            latestBerita={latestBerita}
            nasionalBerita={nasionalBerita}
            popularBerita={popularBerita}
          />
        </ScrollReveal>

        {groupedBerita.length > 0 && (
          <ScrollReveal delay={0.2}>
            <HomeNewsPerCategorySection groupedBerita={groupedBerita} />
          </ScrollReveal>
        )}

        <ScrollReveal delay={0.1}>
          <SectionDivider />
        </ScrollReveal>

        <ScrollReveal delay={0.2}>
          <HomeGallerySection latestGaleri={latestGaleri} />
        </ScrollReveal>

        <ScrollReveal delay={0.1}>
          <SectionDivider />
        </ScrollReveal>

        <ScrollReveal delay={0.2}>
          <HomepageSlidesSection slides={slidesData} />
        </ScrollReveal>

        <ScrollReveal delay={0.1}>
          <SectionDivider />
        </ScrollReveal>

        <ScrollReveal delay={0.2}>
          {Array.isArray(youtubeVideos) && youtubeVideos.length > 0 ? (
            <YoutubeSectionClient initialVideos={youtubeVideos} />
          ) : (
            <Fragment />
          )}
        </ScrollReveal>

        <ScrollReveal delay={0.1}>
          <SectionDivider />
        </ScrollReveal>

        <ScrollReveal delay={0.2}>
          <ExternalAppsSection />
        </ScrollReveal>
      </main>
      <Footer />
    </Providers>
  );
}