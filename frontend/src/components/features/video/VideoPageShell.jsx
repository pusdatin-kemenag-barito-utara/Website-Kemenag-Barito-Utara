"use client";

import Providers from "@/components/layout/Providers";
import Header from "@/components/layout/Header/Header";
import Footer from "@/components/layout/Footer/Footer";
import PageBanner from "@/components/common/PageBanner";
import VideoPageClient from "./VideoPageClient";

export default function VideoPageShell({ videos = [] }) {
  return (
    <Providers>
      <Header />
      <main id="konten-utama" className="min-h-screen pt-24 sm:pt-28 md:pt-32 lg:pt-36 xl:pt-40">
        <PageBanner
          breadcrumb={[
            { label: "Beranda", href: "/beranda" },
            { label: "Video", href: "/video" },
          ]}
          title="Dokumentasi Video Youtube"
          eyebrow="MEDIA CENTER"
          description="Saksikan berbagai liputan, kegiatan, dan inovasi Kementerian Agama Barito Utara secara eksklusif langsung dari kanal YouTube resmi."
        />

        <main className="min-h-screen bg-slate-50 dark:bg-slate-950">
          <section className="relative overflow-hidden bg-white py-16 dark:bg-slate-900 sm:py-24">
            <div
              className="absolute inset-x-0 -top-40 -z-10 transform-gpu overflow-hidden blur-3xl sm:-top-80"
              aria-hidden="true"
            >
              <div className="relative left-[calc(50%-11rem)] aspect-[1155/678] w-[36.125rem] -translate-x-1/2 rotate-[30deg] bg-gradient-to-tr from-emerald-100 to-sky-100 opacity-30 sm:left-[calc(50%-30rem)] sm:w-[72.1875rem] dark:from-emerald-900/40 dark:to-sky-900/40"></div>
            </div>

            <div className="mx-auto w-full px-6 sm:px-10 lg:px-16 xl:px-20">
              <VideoPageClient videos={videos} />
            </div>
          </section>
        </main>
      </main>
      <Footer />
    </Providers>
  );
}