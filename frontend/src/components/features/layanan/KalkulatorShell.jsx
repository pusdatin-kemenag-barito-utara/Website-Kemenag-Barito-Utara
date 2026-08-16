"use client";

import React from "react";
import Providers from "@/components/layout/Providers";
import Header from "@/components/layout/Header/Header";
import Footer from "@/components/layout/Footer/Footer";
import PageBanner from "@/components/common/PageBanner";
import ZakatWarisCalculator from "./ZakatWarisCalculator";

export default function KalkulatorShell() {
  return (
    <Providers>
      <Header />
      <main id="konten-utama" className="min-h-screen pt-24 sm:pt-28 md:pt-32 lg:pt-36 xl:pt-40">
        <PageBanner
          title="Kalkulator Zakat & Waris"
          description="Simulasi perhitungan Zakat Profesi, Zakat Maal, dan simulasi pembagian hak Waris Islam (Faraid) dasar secara mandiri."
          eyebrow="Layanan Masyarakat"
          breadcrumb={[
            { label: "Beranda", href: "/beranda" },
            { label: "Layanan", href: "/layanan" },
            { label: "Kalkulator Zakat & Waris" },
          ]}
        />

        <div className="w-full px-6 sm:px-10 lg:px-16 xl:px-20 py-12 md:py-20">
          <ZakatWarisCalculator />
        </div>
      </main>
      <Footer />
    </Providers>
  );
}