"use client";

import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import Providers from "@/components/layout/Providers";
import Header from "@/components/layout/Header/Header";
import Footer from "@/components/layout/Footer/Footer";
import PageBanner from "@/components/common/PageBanner";
import {
  ShieldCheck,
  CheckCircle2,
  FileText,
  Eye,
  Download,
  ExternalLink,
  X,
  Sparkles,
  HeartHandshake,
  Scale,
  Lock,
  UserCheck,
} from "lucide-react";
import PdfViewerModal from "@/components/common/PdfViewerModal";

const PRINSIP_ETIKA_PELAKSANA = [
  {
    icon: HeartHandshake,
    title: "Sikap Ramah & Santun",
    description: "Selalu bersikap ramah, senyum, salam, dan menghargai masyarakat dalam setiap interaksi layanan.",
    bgColor: "bg-emerald-50 dark:bg-emerald-950/30",
    borderColor: "border-emerald-200 dark:border-emerald-800/50",
    badgeColor: "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/60 dark:text-emerald-300",
  },
  {
    icon: ShieldCheck,
    title: "Jujur & Kejujuran",
    description: "Menjalankan tugas dengan kejujuran penuh tanpa pungli, gratifikasi, atau imbalan tak resmi.",
    bgColor: "bg-teal-50 dark:bg-teal-950/30",
    borderColor: "border-teal-200 dark:border-teal-800/50",
    badgeColor: "bg-teal-100 text-teal-800 dark:bg-teal-900/60 dark:text-teal-300",
  },
  {
    icon: UserCheck,
    title: "Disiplin & Tepat Waktu",
    description: "Hadir tepat waktu dan menyelesaikan berkas layanan sesuai jam kerja & janji layanan.",
    bgColor: "bg-blue-50 dark:bg-blue-950/30",
    borderColor: "border-blue-200 dark:border-blue-800/50",
    badgeColor: "bg-blue-100 text-blue-800 dark:bg-blue-900/60 dark:text-blue-300",
  },
  {
    icon: Scale,
    title: "Keadilan Layanan",
    description: "Memberikan perlakuan dan hak pelayanan yang setara tanpa diskriminasi atau prioritas khusus.",
    bgColor: "bg-indigo-50 dark:bg-indigo-950/30",
    borderColor: "border-indigo-200 dark:border-indigo-800/50",
    badgeColor: "bg-indigo-100 text-indigo-800 dark:bg-indigo-900/60 dark:text-indigo-300",
  },
  {
    icon: Sparkles,
    title: "Tanggung Jawab",
    description: "Bertanggung jawab penuh atas keabsahan, ketelitian, dan keamanan berkas permohonan publik.",
    bgColor: "bg-purple-50 dark:bg-purple-950/30",
    borderColor: "border-purple-200 dark:border-purple-800/50",
    badgeColor: "bg-purple-100 text-purple-800 dark:bg-purple-900/60 dark:text-purple-300",
  },
  {
    icon: Lock,
    title: "Kerahasiaan Data",
    description: "Menjaga kerahasiaan identitas dan informasi sensitif pemohon sesuai undang-undang.",
    bgColor: "bg-amber-50 dark:bg-amber-950/30",
    borderColor: "border-amber-200 dark:border-amber-800/50",
    badgeColor: "bg-amber-100 text-amber-800 dark:bg-amber-900/60 dark:text-amber-300",
  },
];

const KEWAJIBAN_PELAKSANA = [
  "Melayani dengan baik setiap permohonan layanan;",
  "Menerapkan prinsip kehati-hatian, ketelitian, dan kecermatan dalam memeriksa kelengkapan dokumen/rujukan/rekomendasi yang dipersyaratkan dalam pemberian pelayanan;",
  "Menyampaikan dengan santun apabila terdapat kekurangan dalam hal pengajuan permohonan layanan;",
  "Menyelesaikan pelayanan sesuai dengan rentang waktu yang telah ditetapkan pada Standar Layanan;",
  "Menyimpan rahasia negara dan/atau rahasia jabatan yang diembannya selama dan sesudah menjalankan tugas sesuai dengan ketentuan yang berlaku.",
];

const pdfFile = {
  title: "SK Kode Etik Pelayanan Publik",
  subtitle: "Keputusan Kepala Kantor Kankemenag Kab. Barito Utara",
  fileUrl: "/assets/documents/sk-kode-etik.pdf",
  fileSize: "File PDF Resmi",
};

export default function KodeEtikShell() {
  const [isPdfModalOpen, setIsPdfModalOpen] = useState(false);

  useEffect(() => {
    if (isPdfModalOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isPdfModalOpen]);

  return (
    <Providers>
      <Header />
      <main id="konten-utama" className="min-h-screen pt-24 sm:pt-28 md:pt-32 lg:pt-36 xl:pt-40">
        <PageBanner
          title="Kode Etik Pelayanan"
          description="Pedoman etika, prinsip pelaksanaan, dan kewajiban aparatur Kantor Kementerian Agama Kabupaten Barito Utara dalam memberikan pelayanan publik."
          breadcrumb={[
            { label: "Beranda", href: "/beranda" },
            { label: "Profil", href: "/profil/sejarah" },
            { label: "Kode Etik" },
          ]}
        />

        <main className="min-h-screen bg-slate-50 transition-colors dark:bg-slate-950">
          <section className="relative w-full px-6 py-8 sm:px-10 sm:py-12 lg:px-16 xl:px-20">
            <div className="w-full space-y-12">
              <div className="rounded-3xl border border-slate-200/80 bg-white p-6 shadow-md dark:border-slate-800 dark:bg-slate-900 sm:p-8">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                  <div className="flex items-center gap-3">
                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-400">
                      <UserCheck className="h-6 w-6" />
                    </div>
                    <div>
                      <p className="text-xs font-bold uppercase tracking-widest text-emerald-700 dark:text-emerald-400">
                        Prinsip Umum Kode Etik
                      </p>
                      <h2 className="text-2xl font-black text-slate-900 dark:text-slate-100 sm:text-3xl">
                        Etika Pelaksana Pelayanan Publik
                      </h2>
                    </div>
                  </div>
                  <span className="inline-flex items-center gap-2 rounded-full border border-emerald-300/60 bg-emerald-100/80 px-3.5 py-1.5 text-xs font-bold text-emerald-800 dark:border-emerald-800/50 dark:bg-emerald-950/40 dark:text-emerald-300">
                    <ShieldCheck className="h-4 w-4" />
                    <span>Pedoman Etika Aparatur</span>
                  </span>
                </div>

                <div className="mt-6 rounded-2xl border border-emerald-200/60 bg-emerald-50/50 p-5 dark:border-emerald-900/40 dark:bg-emerald-950/20">
                  <p className="text-sm font-bold text-emerald-900 dark:text-emerald-200 sm:text-base">
                    &ldquo;Menjadi contoh yang baik dalam bersikap, bertutur kata, dan berpakaian.&rdquo;
                  </p>
                </div>
              </div>

              <div className="space-y-6">
                <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <div className="inline-flex items-center gap-2 rounded-full border border-emerald-300/60 bg-emerald-100/80 px-3.5 py-1 text-xs font-bold uppercase tracking-wider text-emerald-800 dark:border-emerald-800/50 dark:bg-emerald-950/40 dark:text-emerald-300">
                      <ShieldCheck className="h-3.5 w-3.5" />
                      <span>Kode Etik Layanan</span>
                    </div>
                    <h2 className="mt-2 text-2xl font-black text-slate-900 dark:text-slate-100 sm:text-3xl">
                      Prinsip Etika Pelaksanaan Layanan
                    </h2>
                  </div>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Pedoman perilaku &amp; etika ASN Kementerian Agama Kabupaten Barito Utara.
                  </p>
                </div>

                <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
                  {PRINSIP_ETIKA_PELAKSANA.map((item, idx) => {
                    const IconComp = item.icon;
                    return (
                      <div
                        key={`${item.title}-${idx}`}
                        className={`group relative flex flex-col justify-between rounded-3xl border ${item.borderColor} ${item.bgColor} p-6 shadow-md transition-all duration-300 hover:-translate-y-1.5 hover:shadow-xl`}
                      >
                        <div>
                          <div className="flex items-center justify-between">
                            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-emerald-600 text-white shadow-md dark:bg-emerald-500">
                              <IconComp className="h-5 w-5" />
                            </div>
                            <span className={`rounded-full px-2.5 py-0.5 text-[10px] font-black ${item.badgeColor}`}>
                              Prinsip 0{idx + 1}
                            </span>
                          </div>

                          <h3 className="mt-4 text-base font-black text-slate-900 dark:text-slate-100">
                            {item.title}
                          </h3>

                          <p className="mt-2 text-xs leading-relaxed text-slate-600 dark:text-slate-400 sm:text-sm">
                            {item.description}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="rounded-3xl border border-slate-200/80 bg-white p-6 shadow-md dark:border-slate-800 dark:bg-slate-900 sm:p-8">
                <div className="flex items-center gap-3 border-b border-slate-100 pb-5 dark:border-slate-800">
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-100 text-blue-700 dark:bg-blue-950/60 dark:text-blue-400">
                    <CheckCircle2 className="h-6 w-6" />
                  </div>
                  <div>
                    <p className="text-xs font-bold uppercase tracking-widest text-blue-700 dark:text-blue-400">
                      Komitmen Aparatur
                    </p>
                    <h2 className="text-2xl font-black text-slate-900 dark:text-slate-100 sm:text-3xl">
                      Kewajiban Pelaksana Pelayanan
                    </h2>
                  </div>
                </div>

                <div className="mt-6 space-y-4">
                  {KEWAJIBAN_PELAKSANA.map((kewajiban, index) => (
                    <div
                      key={index}
                      className="flex items-start gap-4 rounded-2xl border border-slate-100 bg-slate-50/70 p-4 transition-all hover:border-emerald-500/40 hover:bg-emerald-50/40 dark:border-slate-800/60 dark:bg-slate-800/40 dark:hover:bg-slate-800"
                    >
                      <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-xl bg-emerald-600 text-xs font-bold text-white shadow-sm dark:bg-emerald-500">
                        {index + 1}
                      </div>
                      <p className="text-xs leading-relaxed text-slate-700 dark:text-slate-300 sm:text-sm font-medium">
                        {kewajiban}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="rounded-3xl border border-slate-200/80 bg-white p-6 shadow-md dark:border-slate-800 dark:bg-slate-900 sm:p-8">
                <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
                  <div className="flex items-start gap-4">
                    <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-600 to-teal-600 text-white shadow-lg">
                      <FileText className="h-7 w-7" />
                    </div>
                    <div>
                      <div className="inline-flex items-center gap-2 rounded-full bg-emerald-100 px-3 py-0.5 text-[11px] font-bold text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300">
                        <ShieldCheck className="h-3.5 w-3.5" />
                        <span>Dokumen SK Resmi</span>
                      </div>
                      <h3 className="mt-2 text-xl font-black text-slate-900 dark:text-slate-100 sm:text-2xl">
                        SK Kode Etik Pelayanan Publik
                      </h3>
                      <p className="mt-1 text-xs text-slate-600 dark:text-slate-400 sm:text-sm">
                        Surat Keputusan Kepala Kantor Kementerian Agama Kabupaten Barito Utara tentang Pedoman Kode Etik Pelayanan.
                      </p>
                    </div>
                  </div>

                  <div className="flex flex-col gap-3 shrink-0 sm:flex-row sm:items-center">
                    <button
                      onClick={() => setIsPdfModalOpen(true)}
                      className="group/btn flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 px-5 py-3 text-xs font-bold text-white shadow-md transition-all duration-300 hover:from-emerald-500 hover:to-teal-500 hover:shadow-[0_8px_25px_rgba(16,185,129,0.35)] hover:-translate-y-0.5 active:scale-[0.98]"
                    >
                      <Eye className="h-4 w-4 transition-transform duration-300 group-hover/btn:scale-110 group-hover/btn:rotate-6" />
                      <span>Lihat SK Kode Etik (PDF)</span>
                    </button>
                    <a
                      href={pdfFile.fileUrl}
                      download
                      className="flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-5 py-3 text-xs font-bold text-slate-700 shadow-sm transition-all hover:border-emerald-500/60 hover:bg-emerald-50 hover:text-emerald-700 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700"
                    >
                      <Download className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                      <span>Unduh SK Kode Etik</span>
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </section>

          <PdfViewerModal
            isOpen={isPdfModalOpen}
            onClose={() => setIsPdfModalOpen(false)}
            fileUrl={pdfFile.fileUrl}
            title={pdfFile.title}
            subtitle={pdfFile.subtitle}
          />
        </main>
      </main>
      <Footer />
    </Providers>
  );
}
