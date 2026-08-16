"use client";

import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import Providers from "@/components/layout/Providers";
import Header from "@/components/layout/Header/Header";
import Footer from "@/components/layout/Footer/Footer";
import PageBanner from "@/components/common/PageBanner";
import {
  ShieldCheck,
  FileText,
  ArrowRight,
  ExternalLink,
  Eye,
  Download,
  X,
  Sparkles,
  BookOpen,
} from "lucide-react";
import PdfViewerModal from "@/components/common/PdfViewerModal";

const modulDoc = {
  title: "Modul Standar Pelayanan Publik",
  subtitle: "Buku Pedoman & Tolok Ukur Standar Pelayanan Kankemenag Kab. Barito Utara",
  fileUrl: "/assets/documents/modul-standar-pelayanan.pdf",
  fileSize: "1.2 MB",
  pages: "Dokumen Lengkap",
};

export default function StandarPelayananShell() {
  const [activePdf, setActivePdf] = useState(null);

  return (
    <Providers>
      <Header />
      <main id="konten-utama" className="min-h-screen pt-24 sm:pt-28 md:pt-32 lg:pt-36 xl:pt-40">
        <PageBanner
          title="Standar Pelayanan"
          description="Acuan resmi tolok ukur pelayanan publik di lingkungan Kantor Kementerian Agama Kabupaten Barito Utara."
          breadcrumb={[
            { label: "Beranda", href: "/beranda" },
            { label: "Profil", href: "/profil/sejarah" },
            { label: "Standar Pelayanan" },
          ]}
        />

        <main className="min-h-screen bg-slate-50 transition-colors dark:bg-slate-950">
          <section className="relative w-full px-6 py-8 sm:px-10 sm:py-12 lg:px-16 xl:px-20">
            <div className="w-full space-y-8 sm:space-y-10">
              <div className="group relative w-full overflow-hidden rounded-3xl border border-slate-200/80 bg-white p-2 shadow-md transition-all duration-300 hover:shadow-xl dark:border-slate-800 dark:bg-slate-900">
                <img
                  src="/assets/images/standar-layanan.webp"
                  alt="Standar Pelayanan Kemenag Barito Utara"
                  className="h-auto w-full rounded-2xl object-cover transition-transform duration-700 group-hover:scale-[1.005]"
                />
              </div>

              <div className="rounded-3xl border border-slate-200/80 bg-white p-6 shadow-md dark:border-slate-800 dark:bg-slate-900 sm:p-8">
                <div className="flex items-center gap-3">
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-400">
                    <ShieldCheck className="h-6 w-6" />
                  </div>
                  <div>
                    <p className="text-xs font-bold uppercase tracking-widest text-emerald-700 dark:text-emerald-400">
                      Pelayanan Publik Prima
                    </p>
                    <h2 className="text-2xl font-black text-slate-900 dark:text-slate-100 sm:text-3xl">
                      Standar Pelayanan Publik
                    </h2>
                  </div>
                </div>

                <p className="mt-4 text-xs leading-relaxed text-slate-600 dark:text-slate-400 sm:text-sm">
                  Standar Pelayanan merupakan tolok ukur yang dipergunakan sebagai pedoman penyelenggaraan pelayanan dan acuan penilaian kualitas pelayanan sebagai kewajiban dan janji penyelenggara kepada masyarakat dalam rangka pelayanan yang berkualitas, cepat, mudah, terjangkau, dan terukur.
                </p>

                <div className="mt-8 grid gap-6 md:grid-cols-3">
                  <div className="group relative flex flex-col justify-between rounded-2xl border border-emerald-200/80 bg-emerald-50/40 p-5 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-emerald-500/50 hover:shadow-lg dark:border-emerald-900/60 dark:bg-emerald-950/20">
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-600 text-white dark:bg-emerald-500">
                          <BookOpen className="h-5 w-5" />
                        </div>
                        <span className="rounded-full bg-emerald-100 px-2.5 py-0.5 text-[10px] font-bold text-emerald-800 dark:bg-emerald-900/60 dark:text-emerald-300">
                          File PDF
                        </span>
                      </div>
                      <div>
                        <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">
                          Modul Standar Pelayanan
                        </h3>
                        <p className="mt-1 text-xs leading-relaxed text-slate-600 dark:text-slate-400">
                          Dokumen resmi pedoman &amp; rincian tolok ukur standar pelayanan publik.
                        </p>
                      </div>
                    </div>

                    <div className="mt-5 flex flex-col gap-2 pt-3 border-t border-emerald-200/60 dark:border-emerald-900/40 sm:flex-row sm:items-center">
                      <button
                        onClick={() => setActivePdf(modulDoc)}
                        className="group/btn flex flex-1 items-center justify-center gap-1.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 px-3 py-2.5 text-xs font-bold text-white shadow-md transition-all duration-300 hover:from-emerald-500 hover:to-teal-500 hover:shadow-[0_8px_25px_rgba(16,185,129,0.35)] hover:-translate-y-0.5 active:scale-[0.98]"
                      >
                        <Eye className="h-3.5 w-3.5 transition-transform duration-300 group-hover/btn:scale-110" />
                        <span>Lihat Modul</span>
                      </button>
                      <a
                        href={modulDoc.fileUrl}
                        download
                        className="flex items-center justify-center gap-1.5 rounded-xl border border-emerald-300 bg-white px-3 py-2.5 text-xs font-bold text-emerald-700 shadow-sm transition-all hover:bg-emerald-50 dark:border-emerald-800 dark:bg-slate-800 dark:text-emerald-300 dark:hover:bg-slate-700"
                        title="Unduh Modul PDF"
                      >
                        <Download className="h-3.5 w-3.5" />
                        <span>Unduh</span>
                      </a>
                    </div>
                  </div>

                  <div className="group relative flex flex-col justify-between rounded-2xl border border-slate-200/80 bg-slate-50/50 p-5 transition-all duration-300 hover:-translate-y-1 hover:border-emerald-500/50 hover:shadow-md dark:border-slate-800 dark:bg-slate-800/40">
                    <div className="space-y-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-400">
                        <FileText className="h-5 w-5" />
                      </div>
                      <div>
                        <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">
                          Layanan PTSP SI ATAK
                        </h3>
                        <p className="mt-1 text-xs leading-relaxed text-slate-600 dark:text-slate-400">
                          Akses seluruh prosedur, persyaratan, biaya, dan estimasi waktu pelayanan melalui PTSP terpadu.
                        </p>
                      </div>
                    </div>
                    <div className="mt-5 pt-3 border-t border-slate-200/60 dark:border-slate-700/60">
                      <a
                        href="https://ptsp.kemenag-baritoutara.com/"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 text-xs font-bold text-emerald-600 hover:text-emerald-700 dark:text-emerald-400"
                      >
                        <span>Buka Portal PTSP</span>
                        <ExternalLink className="h-3.5 w-3.5" />
                      </a>
                    </div>
                  </div>

                  <div className="group relative flex flex-col justify-between rounded-2xl border border-slate-200/80 bg-slate-50/50 p-5 transition-all duration-300 hover:-translate-y-1 hover:border-blue-500/50 hover:shadow-md dark:border-slate-800 dark:bg-slate-800/40">
                    <div className="space-y-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-100 text-blue-700 dark:bg-blue-950/60 dark:text-blue-400">
                        <ShieldCheck className="h-5 w-5" />
                      </div>
                      <div>
                        <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">
                          Maklumat Pelayanan
                        </h3>
                        <p className="mt-1 text-xs leading-relaxed text-slate-600 dark:text-slate-400">
                          Komitmen kompensasi dan jaminan sanksi apabila pelayanan tidak sesuai standar.
                        </p>
                      </div>
                    </div>
                    <div className="mt-5 pt-3 border-t border-slate-200/60 dark:border-slate-700/60">
                      <a
                        href="/profil/maklumat-pelayanan"
                        className="inline-flex items-center gap-2 text-xs font-bold text-blue-600 hover:text-blue-700 dark:text-blue-400"
                      >
                        <span>Lihat Maklumat</span>
                        <ArrowRight className="h-3.5 w-3.5" />
                      </a>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>

          <PdfViewerModal
            isOpen={!!activePdf}
            onClose={() => setActivePdf(null)}
            fileUrl={activePdf?.fileUrl}
            title={activePdf?.title}
            subtitle={activePdf?.subtitle}
          />
        </main>
      </main>
      <Footer />
    </Providers>
  );
}
