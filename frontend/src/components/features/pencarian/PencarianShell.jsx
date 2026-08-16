"use client";

import React from "react";
import Providers from "@/components/layout/Providers";
import Header from "@/components/layout/Header/Header";
import Footer from "@/components/layout/Footer/Footer";
import PageBanner from "@/components/common/PageBanner";
import SearchResultsClient from "@/components/features/search/SearchResultsClient";

export default function PencarianShell({ initialQuery }) {
  return (
    <Providers>
      <Header />
      <main id="konten-utama" className="min-h-screen pt-24 sm:pt-28 md:pt-32 lg:pt-36 xl:pt-40">
        <PageBanner
          title="Pencarian"
          description="Temukan berita, layanan, dokumen publik, dan informasi penting lainnya."
          breadcrumb={[
            { label: "Beranda", href: "/beranda" },
            { label: "Pencarian" },
          ]}
        />
        <SearchResultsClient initialQuery={initialQuery} />
      </main>
      <Footer />
    </Providers>
  );
}