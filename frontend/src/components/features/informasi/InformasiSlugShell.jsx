"use client";

import React from "react";
import Providers from "@/components/layout/Providers";
import Header from "@/components/layout/Header/Header";
import Footer from "@/components/layout/Footer/Footer";
import MaintenancePage from "@/components/features/maintenance/MaintenancePage";
import PageBanner from "@/components/common/PageBanner";

const INFORMASI_MAP = {
  regulasi: "Regulasi",
  "profil-pejabat": "Profil Pejabat",
  "struktur-organisasi": "Struktur Organisasi",
  "dasar-hukum": "Dasar Hukum",
};

export default function InformasiSlugShell({ slug, pageData }) {
  const menuTitle = INFORMASI_MAP[slug] || "Informasi Publik";

  if (pageData) {
    return (
      <Providers>
        <Header />
        <main id="konten-utama" className="min-h-screen pt-24 sm:pt-28 md:pt-32 lg:pt-36 xl:pt-40">
          <main className="min-h-screen bg-slate-50 pb-20 dark:bg-[#050B14]">
            <PageBanner
              title={pageData.title || menuTitle}
              description={pageData.description || ""}
              breadcrumb={[
                { label: "Beranda", href: "/beranda" },
                { label: "Informasi" },
                { label: pageData.title || menuTitle },
              ]}
              eyebrow="Informasi Publik"
            />
            <div className="w-full px-6 sm:px-10 lg:px-16 xl:px-20 mt-10">
              <div
                className="text-slate-700 dark:text-slate-300 leading-relaxed [&_h1]:text-3xl [&_h1]:font-bold [&_h2]:text-2xl [&_h2]:font-bold [&_h3]:text-xl [&_h3]:font-semibold [&_h1]:mt-8 [&_h2]:mt-6 [&_h3]:mt-4 [&_p]:my-4 [&_ul]:list-disc [&_ul]:pl-6 [&_ol]:list-decimal [&_ol]:pl-6 [&_a]:text-emerald-700 [&_a]:underline [&_a]:hover:text-emerald-800 [&_blockquote]:border-l-4 [&_blockquote]:border-emerald-500 [&_blockquote]:pl-4 [&_blockquote]:italic [&_blockquote]:text-slate-500"
                dangerouslySetInnerHTML={{ __html: pageData.content }}
              />
            </div>
          </main>
        </main>
        <Footer />
      </Providers>
    );
  }

  return (
    <Providers>
      <Header />
      <main id="konten-utama" className="min-h-screen pt-24 sm:pt-28 md:pt-32 lg:pt-36 xl:pt-40">
        <MaintenancePage
          title={`${menuTitle} Sedang Diperbarui`}
          menuName={menuTitle}
          description={`Konten dan dokumen resmi untuk ${menuTitle} sedang dalam proses verifikasi dan penataan ulang untuk memastikan akurasi informasi bagi masyarakat.`}
          breadcrumb={[
            { label: "Beranda", href: "/beranda" },
            { label: "Informasi" },
            { label: menuTitle },
          ]}
        />
      </main>
      <Footer />
    </Providers>
  );
}