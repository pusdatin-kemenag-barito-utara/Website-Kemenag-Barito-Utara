"use client";

import React from "react";
import Providers from "@/components/layout/Providers";
import Header from "@/components/layout/Header/Header";
import Footer from "@/components/layout/Footer/Footer";
import PremiumMaintenancePage from "@/components/features/maintenance/PremiumMaintenancePage";

const SLUG_TITLES = {
  "area-perubahan-zi": "Zona Integritas",
  "video-pembangunan-zi": "Video Pembangunan ZI",
  "berita-zona-integritas": "Berita Zona Integritas",
};

export default function ZonaSlugShell({ slug = "" }) {
  const menuTitle = SLUG_TITLES[slug] || "Zona Integritas";

  return (
    <Providers>
      <Header />
      <main id="konten-utama" className="min-h-screen pt-24 sm:pt-28 md:pt-32 lg:pt-36 xl:pt-40">
        <PremiumMaintenancePage
          title={`${menuTitle} Sedang Disiapkan`}
          featureName={menuTitle}
          description={`Informasi mengenai ${menuTitle} dalam rangka pembangunan Zona Integritas (ZI) di Kementerian Agama Kabupaten Barito Utara sedang kami rapikan agar dapat ditampilkan secara kronologis dan transparan.`}
          breadcrumb={[
            { label: "Beranda", href: "/beranda" },
            { label: "Zona Integritas", href: "/zona-integritas/area-perubahan-zi" },
            { label: menuTitle },
          ]}
        />
      </main>
      <Footer />
    </Providers>
  );
}