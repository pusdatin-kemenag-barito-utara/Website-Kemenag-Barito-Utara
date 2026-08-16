"use client";

import React, { useEffect, useState } from "react";
import { ExternalLink, Globe } from "lucide-react";
import Providers from "@/components/layout/Providers";
import Header from "@/components/layout/Header/Header";
import Footer from "@/components/layout/Footer/Footer";
import PageBanner from "@/components/common/PageBanner";

const PTSP_URL = "https://ptsp.kemenag-baritoutara.com/";

export default function PtspShell() {
  const [countdown, setCountdown] = useState(5);

  useEffect(() => {
    const timer = setInterval(() => {
      setCountdown((c) => {
        if (c <= 1) {
          clearInterval(timer);
          if (typeof window !== "undefined") {
            window.location.href = PTSP_URL;
          }
          return 0;
        }
        return c - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  return (
    <Providers>
      <Header />
      <main id="konten-utama" className="min-h-screen pt-24 sm:pt-28 md:pt-32 lg:pt-36 xl:pt-40">
        <PageBanner
          title="PTSP SI ATAK"
          description="Layanan Terpadu Satu Pintu (PTSP) berbasis digital Kantor Kementerian Agama Kabupaten Barito Utara. Anda akan dialihkan ke portal resmi PTSP."
          eyebrow="Layanan Publik"
          breadcrumb={[
            { label: "Beranda", href: "/beranda" },
            { label: "Layanan", href: "/layanan" },
            { label: "PTSP SI ATAK" },
          ]}
        />

        <section className="relative w-full px-6 py-12 sm:px-10 sm:py-16 lg:px-16 xl:px-20">
          <div className="mx-auto w-full max-w-2xl rounded-3xl border border-slate-200/80 bg-white p-8 text-center shadow-md dark:border-slate-800 dark:bg-slate-900 sm:p-10">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-3xl bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-400">
              <Globe className="h-8 w-8" />
            </div>

            <h2 className="mt-5 text-xl font-black text-slate-900 dark:text-slate-100 sm:text-2xl">
              Sedang Mengarahkan ke Portal PTSP...
            </h2>
            <p className="mt-2 text-sm leading-relaxed text-slate-600 dark:text-slate-400">
              Portal resmi PTSP SI ATAK dibuka pada tab baru secara otomatis dalam{" "}
              <span className="font-bold text-emerald-700 dark:text-emerald-400">{countdown} detik</span>.
              Jika tidak dialihkan, silakan klik tombol di bawah.
            </p>

            <div className="mt-6 flex items-center justify-center gap-3">
              <a
                href={PTSP_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-5 py-3 text-sm font-bold text-white shadow-md transition-all hover:bg-emerald-500"
              >
                <span>Buka Portal PTSP SI ATAK</span>
                <ExternalLink className="h-4 w-4" />
              </a>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </Providers>
  );
}