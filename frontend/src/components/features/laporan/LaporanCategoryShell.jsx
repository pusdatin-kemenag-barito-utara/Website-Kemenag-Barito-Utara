"use client";

import Providers from "@/components/layout/Providers";
import Header from "@/components/layout/Header/Header";
import Footer from "@/components/layout/Footer/Footer";
import PageBanner from "@/components/common/PageBanner";
import LaporanDocumentsClient from "./LaporanDocumentsClient";

export default function LaporanCategoryShell({ slug, category, documents = [] }) {
  const displayTitle =
    slug === "sop" ? "Standar Operasional Prosedur (SOP)" : category?.title || "Laporan";
  const displayDesc =
    slug === "sop"
      ? "Standar Operasional Prosedur untuk setiap layanan publik Kemenag Barito Utara."
      : category?.description || "Daftar dokumen laporan resmi yang dapat diakses publik.";

  return (
    <Providers>
      <Header />
      <main id="konten-utama" className="min-h-screen pt-24 sm:pt-28 md:pt-32 lg:pt-36 xl:pt-40">
        <PageBanner
          title={displayTitle}
          description={displayDesc}
          breadcrumb={[
            { label: "Beranda", href: "/beranda" },
            { label: "Laporan" },
            { label: displayTitle },
          ]}
        />

        <main className="relative bg-white dark:bg-slate-950">
          <div className="pointer-events-none absolute left-0 top-0 h-[500px] w-full overflow-hidden opacity-40">
            <div className="absolute -left-20 -top-20 h-96 w-96 rounded-full bg-emerald-100/50 blur-[120px] dark:bg-emerald-900/10" />
          </div>

          <section className="relative z-10 w-full px-6 py-12 sm:px-10 lg:px-16 xl:px-20">
            <div className="mb-10 flex flex-wrap items-center justify-between gap-6">
              <div className="flex items-center gap-2 rounded-full bg-emerald-50 px-4 py-2 dark:bg-emerald-900/10">
                <div className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                <span className="text-[10px] font-bold uppercase tracking-widest text-emerald-700 dark:text-emerald-300">
                  {documents.length} Dokumen Tersedia
                </span>
              </div>
            </div>

            <div className="relative mb-14 overflow-hidden rounded-[2.5rem] bg-emerald-950 p-8 text-white shadow-xl lg:p-12">
              <div className="absolute inset-0 opacity-20">
                <div className="absolute right-0 top-0 h-full w-1/2 bg-[radial-gradient(circle_at_top_right,_rgba(16,185,129,0.3),_transparent_70%)]" />
              </div>

              <div className="relative flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
                <div>
                  <div className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-[9px] font-bold uppercase tracking-widest text-emerald-300 backdrop-blur-md">
                    Category Repository
                  </div>
                  <h2 className="mt-4 text-3xl font-bold tracking-tight text-white sm:text-4xl">
                    {displayTitle}
                  </h2>
                  <p className="mt-4 max-w-2xl text-sm leading-relaxed text-emerald-100/60">
                    {displayDesc}
                  </p>
                </div>

                {category?.intro && (
                  <div className="hidden shrink-0 rounded-3xl bg-white/5 p-6 backdrop-blur-sm border border-white/10 max-w-xs lg:block">
                    <p className="text-[10px] italic leading-relaxed text-emerald-100/40">
                      &ldquo;{String(category.intro).substring(0, 80)}...&rdquo;
                    </p>
                  </div>
                )}
              </div>
            </div>

            <div className={slug === "sop" ? "" : "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"}>
              <LaporanDocumentsClient documents={documents} categorySlug={slug} />
            </div>
          </section>
        </main>
      </main>
      <Footer />
    </Providers>
  );
}