"use client";

import React from "react";
import Providers from "@/components/layout/Providers";
import Header from "@/components/layout/Header/Header";
import Footer from "@/components/layout/Footer/Footer";
import MaintenancePage from "@/components/features/maintenance/MaintenancePage";
import SeksiDetailUI from "@/components/features/layanan/SeksiDetailUI";

const LAYANAN_MAP = {
  sekjen: "Sekjen",
  "seksi-bimas-islam": "Seksi Bimas Islam",
  "seksi-pendidikan-agama-islam": "Seksi Pendidikan Agama Islam",
  "seksi-pendidikan-diniyah-dan-pondok-pesantren": "Seksi Pendidikan Diniyah Dan Pondok Pesantren",
  "seksi-pendidikan-madrasah": "Seksi Pendidikan Madrasah",
  "penyelenggara-hindu": "Penyelenggara Hindu",
  "penyelenggara-zakat-wakaf": "Penyelenggara Zakat Wakaf",
  "kua-kantor-urusan-agama": "KUA (Kantor Urusan Agama)",
  "agen-perubahan": "Agen Perubahan",
  "maklumat-pelayanan": "Maklumat Pelayanan",
  pengaduan: "Pengaduan Masyarakat",
};

export default function ProfilPejabatSlugShell({ slug, initialData }) {
  const menuTitle = LAYANAN_MAP[slug] || "Profil Pejabat";

  const breadcrumb = [
    { label: "Beranda", href: "/beranda" },
    { label: "Informasi", href: "/informasi" },
    { label: "Profil Pejabat", href: "/informasi/profil-pejabat" },
    { label: menuTitle },
  ];

  return (
    <Providers>
      <Header />
      <main id="konten-utama" className="min-h-screen pt-24 sm:pt-28 md:pt-32 lg:pt-36 xl:pt-40">
        {initialData ? (
          <SeksiDetailUI data={initialData} breadcrumb={breadcrumb} menuTitle={menuTitle} />
        ) : (
          <MaintenancePage
            title={`${menuTitle} Sedang Disiapkan`}
            menuName={menuTitle}
            description={`Informasi mengenai ${menuTitle} di Kementerian Agama Kabupaten Barito Utara sedang dalam proses penataan ulang agar dapat ditampilkan dengan lebih rapi, modern, dan nyaman diakses.`}
            breadcrumb={breadcrumb}
          />
        )}
      </main>
      <Footer />
    </Providers>
  );
}