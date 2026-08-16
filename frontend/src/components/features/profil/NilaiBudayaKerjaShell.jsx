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
  Eye,
  Download,
  ExternalLink,
  X,
  Sparkles,
  Award,
  Smile,
  MessageCircle,
  HandHeart,
  UserCheck,
  Heart,
} from "lucide-react";
import PdfViewerModal from "@/components/common/PdfViewerModal";

const NILAI_BUDAYA_KERJA = [
  {
    title: "Integritas",
    description: "Keselarasan antara hati, pikiran, perkataan, dan perbuatan yang baik dan benar.",
  },
  {
    title: "Profesionalitas",
    description: "Bekerja secara disiplin, kompeten, bertanggung jawab, dan berorientasi pada hasil terbaik.",
  },
  {
    title: "Inovasi",
    description: "Menyempurnakan proses kerja agar layanan semakin cepat, mudah, adaptif, dan relevan.",
  },
  {
    title: "Tanggung Jawab",
    description: "Melaksanakan amanah pekerjaan dengan sungguh-sungguh, tuntas, dan dapat dipertanggungjawabkan.",
  },
  {
    title: "Keteladanan",
    description: "Menjadi contoh dalam sikap, perilaku, etika kerja, dan pelayanan kepada masyarakat.",
  },
];

const BUDAYA_5S = [
  {
    code: "S1",
    title: "Senyum",
    icon: Smile,
    color: "from-amber-500 to-orange-500",
    bgColor: "bg-amber-50 dark:bg-amber-950/30",
    borderColor: "border-amber-200 dark:border-amber-800/50",
    badgeColor: "bg-amber-100 text-amber-800 dark:bg-amber-900/60 dark:text-amber-300",
    description: "Menyambut setiap masyarakat dan pemohon layanan dengan ketulusan, kehangatan, dan wajah cerah.",
  },
  {
    code: "S2",
    title: "Sapa",
    icon: MessageCircle,
    color: "from-emerald-500 to-teal-500",
    bgColor: "bg-emerald-50 dark:bg-emerald-950/30",
    borderColor: "border-emerald-200 dark:border-emerald-800/50",
    badgeColor: "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/60 dark:text-emerald-300",
    description: "Menyapa warga dan rekan kerja secara ramah, santun, bertata krama, dan proaktif dalam membantu.",
  },
  {
    code: "S3",
    title: "Salam",
    icon: HandHeart,
    color: "from-blue-500 to-indigo-500",
    bgColor: "bg-blue-50 dark:bg-blue-950/30",
    borderColor: "border-blue-200 dark:border-blue-800/50",
    badgeColor: "bg-blue-100 text-blue-800 dark:bg-blue-900/60 dark:text-blue-300",
    description: "Mengucapkan dan membalas salam sebagai wujud rasa penghormatan, keramahan, dan ikatan kekeluargaan.",
  },
  {
    code: "S4",
    title: "Sopan",
    icon: UserCheck,
    color: "from-purple-500 to-pink-500",
    bgColor: "bg-purple-50 dark:bg-purple-950/30",
    borderColor: "border-purple-200 dark:border-purple-800/50",
    badgeColor: "bg-purple-100 text-purple-800 dark:bg-purple-900/60 dark:text-purple-300",
    description: "Bersikap, bertutur kata halus, berbusana rapi, dan senantiasa menghargai setiap lapisan masyarakat.",
  },
  {
    code: "S5",
    title: "Santun",
    icon: Heart,
    color: "from-rose-500 to-red-500",
    bgColor: "bg-rose-50 dark:bg-rose-950/30",
    borderColor: "border-rose-200 dark:border-rose-800/50",
    badgeColor: "bg-rose-100 text-rose-800 dark:bg-rose-900/60 dark:text-rose-300",
    description: "Mengedepankan kerendahan hati, kepedulian tinggi, dan kelembutan sikap dalam memberikan pelayanan prima.",
  },
];

const pdfFile = {
  title: "SK Pedoman Pelaksanaan Budaya Kerja 5S",
  subtitle: "Keputusan Kepala Kantor Kementerian Agama Kab. Barito Utara",
  fileUrl: "/assets/documents/sk-pedoman-5S.pdf",
  fileSize: "File PDF Resmi",
};

export default function NilaiBudayaKerjaShell() {
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
          title="Nilai Budaya Kerja & 5S"
          description="Fondasi etika dan pedoman perilaku aparatur Kemenag Barito Utara dalam menghadirkan pelayanan publik yang profesional, hangat, ramah, dan berintegritas."
          breadcrumb={[
            { label: "Beranda", href: "/beranda" },
            { label: "Profil", href: "/profil/sejarah" },
            { label: "Nilai Budaya Kerja & 5S" },
          ]}
        />

        <main className="min-h-screen bg-slate-50 transition-colors dark:bg-slate-950">
          <section className="relative w-full px-6 py-8 sm:px-10 sm:py-12 lg:px-16 xl:px-20">
            <div className="w-full space-y-12">
              <div className="space-y-6">
                <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <div className="inline-flex items-center gap-2 rounded-full border border-emerald-300/60 bg-emerald-100/80 px-3.5 py-1 text-xs font-bold uppercase tracking-wider text-emerald-800 dark:border-emerald-800/50 dark:bg-emerald-950/40 dark:text-emerald-300">
                      <Award className="h-3.5 w-3.5" />
                      <span>Nilai Utama Kemenag</span>
                    </div>
                    <h2 className="mt-2 text-2xl font-black text-slate-900 dark:text-slate-100 sm:text-3xl">
                      5 Nilai Budaya Kerja Kementerian Agama
                    </h2>
                  </div>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Landasan moral dan karakter dalam bekerja.
                  </p>
                </div>

                <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-5">
                  {NILAI_BUDAYA_KERJA.map((value, index) => (
                    <div
                      key={value.title}
                      className="group relative flex flex-col justify-between rounded-3xl border border-slate-200/80 bg-white p-6 shadow-md transition-all duration-300 hover:-translate-y-1 hover:border-emerald-500/40 hover:shadow-xl dark:border-slate-800 dark:bg-slate-900"
                    >
                      <div>
                        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-100 text-lg font-black text-emerald-800 transition duration-300 group-hover:bg-emerald-600 group-hover:text-white dark:bg-emerald-950/60 dark:text-emerald-400 dark:group-hover:bg-emerald-500 dark:group-hover:text-white">
                          {index + 1}
                        </div>

                        <h3 className="mt-5 text-lg font-black text-slate-900 transition-colors group-hover:text-emerald-700 dark:text-slate-100 dark:group-hover:text-emerald-400">
                          {value.title}
                        </h3>

                        <p className="mt-3 text-xs leading-relaxed text-slate-600 dark:text-slate-400">
                          {value.description}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="space-y-6">
                <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between border-t border-slate-200/80 pt-10 dark:border-slate-800">
                  <div>
                    <div className="inline-flex items-center gap-2 rounded-full border border-teal-300/60 bg-teal-100/80 px-3.5 py-1 text-xs font-bold uppercase tracking-wider text-teal-800 dark:border-teal-800/50 dark:bg-teal-950/40 dark:text-teal-300">
                      <Sparkles className="h-3.5 w-3.5" />
                      <span>Pelayanan Prima 5S</span>
                    </div>
                    <h2 className="mt-2 text-2xl font-black text-slate-900 dark:text-slate-100 sm:text-3xl">
                      Budaya Kerja 5S Pelayanan Publik
                    </h2>
                  </div>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Senyum • Sapa • Salam • Sopan • Santun
                  </p>
                </div>

                <div className="grid gap-5 md:grid-cols-3 lg:grid-cols-5">
                  {BUDAYA_5S.map((item) => {
                    const IconComponent = item.icon;
                    return (
                      <div
                        key={item.code}
                        className={`group relative flex flex-col justify-between rounded-3xl border ${item.borderColor} ${item.bgColor} p-6 shadow-md transition-all duration-300 hover:-translate-y-1.5 hover:shadow-xl`}
                      >
                        <div>
                          <div className="flex items-center justify-between">
                            <div className={`flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br ${item.color} text-white shadow-md transition-transform duration-300 group-hover:scale-110`}>
                              <IconComponent className="h-5 w-5" />
                            </div>
                            <span className={`rounded-full px-2.5 py-0.5 text-[11px] font-black ${item.badgeColor}`}>
                              {item.code}
                            </span>
                          </div>

                          <h3 className="mt-5 text-xl font-black text-slate-900 dark:text-slate-100">
                            {item.title}
                          </h3>

                          <p className="mt-3 text-xs leading-relaxed text-slate-600 dark:text-slate-400">
                            {item.description}
                          </p>
                        </div>
                      </div>
                    );
                  })}
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
                        SK Pedoman Pelaksanaan Budaya Kerja 5S
                      </h3>
                      <p className="mt-1 text-xs text-slate-600 dark:text-slate-400 sm:text-sm">
                        Surat Keputusan Kepala Kantor Kemenag Kab. Barito Utara tentang penetapan pedoman pelaksanaan Senyum, Sapa, Salam, Sopan, dan Santun.
                      </p>
                    </div>
                  </div>

                  <div className="flex flex-col gap-3 shrink-0 sm:flex-row sm:items-center">
                    <button
                      onClick={() => setIsPdfModalOpen(true)}
                      className="group/btn flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 px-5 py-3 text-xs font-bold text-white shadow-md transition-all duration-300 hover:from-emerald-500 hover:to-teal-500 hover:shadow-[0_8px_25px_rgba(16,185,129,0.35)] hover:-translate-y-0.5 active:scale-[0.98]"
                    >
                      <Eye className="h-4 w-4 transition-transform duration-300 group-hover/btn:scale-110 group-hover/btn:rotate-6" />
                      <span>Lihat SK Pedoman 5S (PDF)</span>
                    </button>
                    <a
                      href={pdfFile.fileUrl}
                      download
                      className="flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-5 py-3 text-xs font-bold text-slate-700 shadow-sm transition-all hover:border-emerald-500/60 hover:bg-emerald-50 hover:text-emerald-700 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700"
                    >
                      <Download className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                      <span>Unduh SK 5S</span>
                    </a>
                  </div>
                </div>
              </div>

              <div className="rounded-3xl bg-slate-900 p-6 text-white shadow-xl dark:bg-slate-900/90 dark:ring-1 dark:ring-white/10 sm:p-8">
                <p className="text-xs font-bold uppercase tracking-[0.3em] text-emerald-400">
                  Komitmen Aparatur Kemenag Barito Utara
                </p>

                <h3 className="mt-3 text-2xl font-black sm:text-3xl">
                  &quot;Bekerja dengan Nilai, Melayani dengan 5S dan Hati&quot;
                </h3>

                <p className="mt-4 max-w-4xl text-xs leading-relaxed text-slate-300 dark:text-slate-400 sm:text-sm">
                  Penerapan 5 Nilai Budaya Kerja (Integritas, Profesionalitas, Inovasi, Tanggung Jawab, Keteladanan) berpadu harmonis dengan Budaya 5S (Senyum, Sapa, Salam, Sopan, Santun) guna menciptakan pengalaman pelayanan publik yang ramah, cepat, akuntabel, dan menyenangkan bagi seluruh masyarakat Kabupaten Barito Utara.
                </p>
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
