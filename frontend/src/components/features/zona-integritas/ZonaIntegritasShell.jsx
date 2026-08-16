"use client";

import React, { useEffect, useState } from "react";
import { ArrowRight, ShieldCheck } from "lucide-react";
import Providers from "@/components/layout/Providers";
import Header from "@/components/layout/Header/Header";
import Footer from "@/components/layout/Footer/Footer";
import PageBanner from "@/components/common/PageBanner";

const REDIRECT_URL = "/zona-integritas/area-perubahan-zi";

export default function ZonaIntegritasShell() {
  const [countdown, setCountdown] = useState(3);

  useEffect(() => {
    const target = REDIRECT_URL;
    const timer = setInterval(() => {
      setCountdown((c) => {
        if (c <= 1) {
          clearInterval(timer);
          if (typeof window !== "undefined") {
            window.location.href = target;
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
          title="Zona Integritas"
          description="Mengarahkan Anda ke halaman utama Pembangunan Zona Integritas (ZI) menuju Wilayah Bebas dari Korupsi (WBK) &amp; Wilayah Birokrasi Bersih dan Melayani (WBBM) Kankemenag Kab. Barito Utara."
          eyebrow="Zona Integritas"
          breadcrumb={[
            { label: "Beranda", href: "/beranda" },
            { label: "Zona Integritas", href: "/zona-integritas/area-perubahan-zi" },
          ]}
        />

        <section className="relative w-full px-6 py-12 sm:px-10 sm:py-16 lg:px-16 xl:px-20">
          <div className="mx-auto w-full max-w-2xl rounded-3xl border border-slate-200/80 bg-white p-8 text-center shadow-md dark:border-slate-800 dark:bg-slate-900 sm:p-10">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-3xl bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-400">
              <ShieldCheck className="h-8 w-8" />
            </div>

            <h2 className="mt-5 text-xl font-black text-slate-900 dark:text-slate-100 sm:text-2xl">
              Sedang Mengarahkan...
            </h2>
            <p className="mt-2 text-sm leading-relaxed text-slate-600 dark:text-slate-400">
              Halaman Zona Integritas dipusatkan pada 8 Area Perubahan Reformasi
              Birokrasi. Anda akan dialihkan secara otomatis dalam{" "}
              <span className="font-bold text-emerald-700 dark:text-emerald-400">{countdown} detik</span>.
            </p>

            <div className="mt-6 flex items-center justify-center gap-3">
              <a
                href={REDIRECT_URL}
                className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-5 py-3 text-sm font-bold text-white shadow-md transition-all hover:bg-emerald-500"
              >
                <span>Lanjut ke 8 Area Perubahan ZI</span>
                <ArrowRight className="h-4 w-4" />
              </a>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </Providers>
  );
}