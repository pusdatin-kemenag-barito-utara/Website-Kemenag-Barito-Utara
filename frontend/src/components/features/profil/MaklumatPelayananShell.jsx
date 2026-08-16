"use client";

import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import Providers from "@/components/layout/Providers";
import Header from "@/components/layout/Header/Header";
import Footer from "@/components/layout/Footer/Footer";
import PageBanner from "@/components/common/PageBanner";
import {
  ArrowRight,
  FileText,
  Eye,
  Download,
  X,
  ExternalLink,
  ShieldCheck,
  Sparkles,
} from "lucide-react";
import PdfViewerModal from "@/components/common/PdfViewerModal";

const DOCUMENTS = [
  {
    id: "maklumat-kompensasi",
    title: "Maklumat Pelayanan & Kompensasi Layanan",
    subtitle: "Lembar Resmi Maklumat dan Kompensasi Layanan (BSrE BSSN)",
    fileUrl: "/assets/documents/maklumat-pelayanan-dan-kompensasi.pdf",
    fileSize: "432 KB",
    pages: "1 Halaman",
    badge: "File PDF",
  },
  {
    id: "sk-maklumat",
    title: "SK Kepala Kantor Kemenag No. 46 Tahun 2026",
    subtitle:
      "Penetapan Maklumat Pelayanan & Jaminan Pelayanan Kankemenag Kab. Barito Utara",
    fileUrl: "/assets/documents/sk-maklumat-pelayanan-2026.pdf",
    fileSize: "530 KB",
    pages: "3 Halaman",
    badge: "File PDF",
  },
];

export default function MaklumatPelayananShell() {
  const [activePdf, setActivePdf] = useState(null);

  return (
    <Providers>
      <Header />
      <main id="konten-utama" className="min-h-screen pt-24 sm:pt-28 md:pt-32 lg:pt-36 xl:pt-40">
        <PageBanner
          title="Maklumat Pelayanan"
          description="Komitmen resmi Kantor Kementerian Agama Kabupaten Barito Utara dalam memberikan pelayanan publik yang berkualitas, transparan, dan berintegritas."
          breadcrumb={[
            { label: "Beranda", href: "/beranda" },
            { label: "Profil", href: "/profil/sejarah" },
            { label: "Maklumat Pelayanan" },
          ]}
        />

        <main className="min-h-screen bg-slate-50 transition-colors dark:bg-slate-950">
          <section className="relative w-full px-6 py-10 sm:px-10 sm:py-12 lg:px-16 xl:px-20">
            <div className="w-full space-y-8 sm:space-y-10">
              <div className="group relative w-full overflow-hidden">
                <img
                  src="/assets/images/maklumat-pelayanan.webp"
                  alt="Maklumat Pelayanan Kemenag Barito Utara"
                  className="h-auto w-full object-cover transition-transform duration-700 group-hover:scale-[1.01]"
                />
              </div>

              <div className="group relative w-full overflow-hidden">
                <img
                  src="/assets/images/maklumat-pelayanan-2.webp"
                  alt="Kompensasi Layanan Kemenag Barito Utara"
                  className="h-auto w-full object-cover transition-transform duration-700 group-hover:scale-[1.01]"
                />
              </div>

              <div className="space-y-6">
                <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <div className="inline-flex items-center gap-2 rounded-full border border-emerald-300/60 bg-emerald-100/80 px-3.5 py-1 text-xs font-bold uppercase tracking-wider text-emerald-800 dark:border-emerald-800/50 dark:bg-emerald-950/40 dark:text-emerald-300">
                      <ShieldCheck className="h-3.5 w-3.5" />
                      <span>Dokumen Resmi</span>
                    </div>
                    <h2 className="mt-2 text-xl font-black text-slate-900 dark:text-slate-100 sm:text-2xl">
                      Dokumen Maklumat &amp; SK Penetapan Pelayanan
                    </h2>
                  </div>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Pilih dokumen di bawah untuk membaca atau mengunduh salinan sah.
                  </p>
                </div>

                <div className="grid gap-6 sm:grid-cols-2">
                  {DOCUMENTS.map((doc) => (
                    <div
                      key={doc.id}
                      className="group relative flex flex-col justify-between rounded-3xl border border-slate-200/80 bg-white p-5 shadow-md transition-all duration-300 hover:-translate-y-1 hover:border-emerald-500/50 hover:shadow-xl dark:border-slate-800 dark:bg-slate-900 dark:hover:border-emerald-500/50 sm:p-6"
                    >
                      <div className="space-y-4">
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-100 text-emerald-700 transition-colors group-hover:bg-emerald-600 group-hover:text-white dark:bg-emerald-950/60 dark:text-emerald-400 dark:group-hover:bg-emerald-500 dark:group-hover:text-white">
                            <FileText className="h-6 w-6" />
                          </div>
                          <span className="rounded-full bg-slate-100 px-3 py-1 text-[11px] font-bold text-slate-600 dark:bg-slate-800 dark:text-slate-300">
                            {doc.badge}
                          </span>
                        </div>

                        <div>
                          <h3 className="text-base font-black text-slate-900 group-hover:text-emerald-700 dark:text-slate-100 dark:group-hover:text-emerald-400 sm:text-lg">
                            {doc.title}
                          </h3>
                          <p className="mt-2 text-xs leading-relaxed text-slate-600 dark:text-slate-400">
                            {doc.subtitle}
                          </p>
                        </div>

                        <div className="flex flex-wrap items-center gap-4 text-[11px] font-medium text-slate-500 dark:text-slate-400">
                          <span>{doc.fileSize}</span>
                          <span>•</span>
                          <span>{doc.pages}</span>
                        </div>
                      </div>

                      <div className="mt-6 flex flex-col gap-2.5 border-t border-slate-100 pt-4 dark:border-slate-800/80 sm:flex-row sm:items-center">
                        <button
                          onClick={() => setActivePdf(doc)}
                          className="group/btn flex flex-1 items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 px-4 py-3 text-xs font-bold text-white shadow-md transition-all duration-300 hover:from-emerald-500 hover:to-teal-500 hover:shadow-[0_8px_25px_rgba(16,185,129,0.35)] hover:-translate-y-0.5 active:scale-[0.98] dark:from-emerald-500 dark:to-teal-500 dark:hover:from-emerald-400 dark:hover:to-teal-400"
                        >
                          <Eye className="h-4 w-4 transition-transform duration-300 group-hover/btn:scale-110 group-hover/btn:rotate-6" />
                          <span>Lihat Dokumen</span>
                        </button>
                        <a
                          href={doc.fileUrl}
                          download
                          className="group/dl flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-slate-50/80 px-4 py-3 text-xs font-bold text-slate-700 shadow-sm transition-all duration-300 hover:border-emerald-500/60 hover:bg-emerald-50 hover:text-emerald-700 hover:shadow-md hover:-translate-y-0.5 active:scale-[0.98] dark:border-slate-700/80 dark:bg-slate-800/60 dark:text-slate-200 dark:hover:border-emerald-400/60 dark:hover:bg-emerald-950/40 dark:hover:text-emerald-300"
                          title="Unduh File PDF"
                        >
                          <Download className="h-4 w-4 transition-transform duration-300 group-hover/dl:translate-y-0.5 text-emerald-600 dark:text-emerald-400" />
                          <span>Unduh PDF</span>
                        </a>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex flex-col gap-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900 sm:flex-row sm:items-center sm:justify-between sm:p-6">
                <div>
                  <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">
                    Butuh informasi standar pelayanan publik?
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Lihat daftar standar pelayanan PTSP dan dokumen resmi kami.
                  </p>
                </div>
                <a
                  href="/profil/standar-pelayanan"
                  className="inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-600 px-5 py-3 text-xs font-bold text-white shadow-md transition-all hover:bg-emerald-700 hover:shadow-lg dark:bg-emerald-500 dark:hover:bg-emerald-600"
                >
                  <span>Standar Pelayanan</span>
                  <ArrowRight className="h-4 w-4" />
                </a>
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
