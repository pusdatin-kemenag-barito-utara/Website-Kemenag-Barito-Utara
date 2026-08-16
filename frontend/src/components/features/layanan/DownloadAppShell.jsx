"use client";

import React from "react";
import Providers from "@/components/layout/Providers";
import Header from "@/components/layout/Header/Header";
import Footer from "@/components/layout/Footer/Footer";
import PageBanner from "@/components/common/PageBanner";
import PwaDownloadSection from "./PwaDownloadSection";

export default function DownloadAppShell() {
  return (
    <Providers>
      <Header />
      <main id="konten-utama" className="min-h-screen pt-24 sm:pt-28 md:pt-32 lg:pt-36 xl:pt-40">
        <PageBanner
          title="Download Aplikasi Portal (PWA)"
          description="Pasang Portal Digital Kemenag Barito Utara di layar utama perangkat Android, iPhone, maupun Laptop untuk akses cepat tanpa perlu membuka browser."
          eyebrow="Layanan Digital"
          breadcrumb={[
            { label: "Beranda", href: "/beranda" },
            { label: "Layanan", href: "/layanan" },
            { label: "Download Aplikasi PWA" },
          ]}
        />

        <div className="w-full px-6 sm:px-10 lg:px-16 xl:px-20 py-12 md:py-16">
          <PwaDownloadSection />
        </div>
      </main>
      <Footer />
    </Providers>
  );
}