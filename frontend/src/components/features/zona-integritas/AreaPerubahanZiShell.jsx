"use client";

import React, { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import {
  ShieldCheck,
  CheckCircle2,
  FileText,
  Eye,
  Download,
  ExternalLink,
  X,
  Sparkles,
  Users,
  Building2,
  FileCheck,
  Workflow,
  UserCheck,
  BarChart3,
  Target,
  Award,
  Layers,
} from "lucide-react";
import Providers from "@/components/layout/Providers";
import Header from "@/components/layout/Header/Header";
import Footer from "@/components/layout/Footer/Footer";
import PageBanner from "@/components/common/PageBanner";
import PdfViewerModal from "@/components/common/PdfViewerModal";

const EIGHT_AREAS = [
  {
    number: "01",
    title: "Manajemen Perubahan",
    subtitle: "Change Management",
    description: "Mewujudkan perubahan pola pikir (mindset) dan budaya kerja (culture set) seluruh aparatur Kemenag menuju Zona Integritas WBK/WBBM.",
    targets: [
      "Tim Kerja Pembangunan ZI yang solid",
      "Dokumen Rencana Kerja Pembangunan ZI",
      "Monitoring & evaluasi pembangunan ZI berkala",
      "Perubahan pola pikir dan budaya kerja 5S",
    ],
    icon: Users,
    color: "from-emerald-600 to-teal-600",
    bgColor: "bg-emerald-50 dark:bg-emerald-950/30",
    borderColor: "border-emerald-200 dark:border-emerald-800/50",
    badgeColor: "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/60 dark:text-emerald-300",
  },
  {
    number: "02",
    title: "Penataan Peraturan Perundang-undangan",
    subtitle: "Regulatory Reform",
    description: "Meningkatkan efektivitas pengelolaan dan harmonisasi aturan internal guna meminimalkan tumpang tindih regulasi keagamaan.",
    targets: [
      "Identifikasi dan pemetaan regulasi internal",
      "Harmonisasi aturan sesuai regulasi pusat Kemenag",
      "Transparansi penyebarluasan naskah hukum/JDIH",
      "Evaluasi efektivitas pelaksanaan regulasi",
    ],
    icon: FileCheck,
    color: "from-teal-600 to-cyan-600",
    bgColor: "bg-teal-50 dark:bg-teal-950/30",
    borderColor: "border-teal-200 dark:border-teal-800/50",
    badgeColor: "bg-teal-100 text-teal-800 dark:bg-teal-900/60 dark:text-teal-300",
  },
  {
    number: "03",
    title: "Penataan dan Penguatan Organisasi",
    subtitle: "Organizational Structuring",
    description: "Mewujudkan organisasi yang tepat fungsi dan tepat ukuran (right-sizing) untuk meningkatkan efisiensi dan efektivitas kinerja.",
    targets: [
      "Penyelarasan struktur organisasi instansi vertikal",
      "Evaluasi analisis jabatan dan beban kerja (ABK)",
      "Pencegahan duplikasi fungsi antar seksi/unit",
      "Peningkatan efisiensi rantai koordinasi kerja",
    ],
    icon: Building2,
    color: "from-blue-600 to-indigo-600",
    bgColor: "bg-blue-50 dark:bg-blue-950/30",
    borderColor: "border-blue-200 dark:border-blue-800/50",
    badgeColor: "bg-blue-100 text-blue-800 dark:bg-blue-900/60 dark:text-blue-300",
  },
  {
    number: "04",
    title: "Penataan Tatalaksana",
    subtitle: "Business Process & E-Government",
    description: "Meningkatkan efisiensi sistem, Standar Operasional Prosedur (SOP), serta akselerasi digitalisasi pelayanan publik (PTSP SI ATAK).",
    targets: [
      "Penyusunan & penetapan SOP Layanan Publik",
      "Penerapan digitalisasi E-Government & SI ATAK",
      "Keterbukaan Informasi Publik (PPID)",
      "Evaluasi & pembaharuan berkala alur kerja",
    ],
    icon: Workflow,
    color: "from-indigo-600 to-purple-600",
    bgColor: "bg-indigo-50 dark:bg-indigo-950/30",
    borderColor: "border-indigo-200 dark:border-indigo-800/50",
    badgeColor: "bg-indigo-100 text-indigo-800 dark:bg-indigo-900/60 dark:text-indigo-300",
  },
  {
    number: "05",
    title: "Penataan Sistem Manajemen SDM Aparatur",
    subtitle: "HR Management System",
    description: "Meningkatkan profesionalisme, akuntabilitas rekrutmen/promosi, kedisiplinan, serta kompetensi seluruh ASN Kementerian Agama.",
    targets: [
      "Perencanaan kebutuhan pegawai berbasis Anjab ABK",
      "Pengembangan kompetensi berbasis kinerja",
      "Penetapan kinerja individu & Sistem Informasi ASN",
      "Penegakan disiplin & Kode Etik ASN Kemenag",
    ],
    icon: UserCheck,
    color: "from-purple-600 to-pink-600",
    bgColor: "bg-purple-50 dark:bg-purple-950/30",
    borderColor: "border-purple-200 dark:border-purple-800/50",
    badgeColor: "bg-purple-100 text-purple-800 dark:bg-purple-900/60 dark:text-purple-300",
  },
  {
    number: "06",
    title: "Penguatan Akuntabilitas Kinerja",
    subtitle: "Performance Accountability",
    description: "Meningkatkan kapasitas dan akuntabilitas kinerja instansi melalui perencanaan kinerja (Renstra, PK) dan pelaporan SAKIP/LAKIP.",
    targets: [
      "Keterlibatan pimpinan dalam perencanaan kinerja",
      "Pengelolaan data kinerja yang terukur dan valid",
      "Pelaporan LAKIP berkala dan akuntabel",
      "Peningkatan capaian indikator kinerja utama (IKU)",
    ],
    icon: BarChart3,
    color: "from-amber-600 to-orange-600",
    bgColor: "bg-amber-50 dark:bg-amber-950/30",
    borderColor: "border-amber-200 dark:border-amber-800/50",
    badgeColor: "bg-amber-100 text-amber-800 dark:bg-amber-900/60 dark:text-amber-300",
  },
  {
    number: "07",
    title: "Penguatan Pengawasan",
    subtitle: "Supervision & Anti-Corruption",
    description: "Mewujudkan penyelenggaraan pemerintah yang bersih dari KKN melalui Whistleblowing System (WBS), Pengendalian Gratifikasi, & SPIP.",
    targets: [
      "Public campaign Anti-Gratifikasi & Pungli",
      "Penanganan benturan kepentingan (Conflict of Interest)",
      "Penerapan Whistleblowing System (WBS)",
      "Penguatan Sistem Pengendalian Intern Pemerintah (SPIP)",
    ],
    icon: Eye,
    color: "from-rose-600 to-red-600",
    bgColor: "bg-rose-50 dark:bg-rose-950/30",
    borderColor: "border-rose-200 dark:border-rose-800/50",
    badgeColor: "bg-rose-100 text-rose-800 dark:bg-rose-900/60 dark:text-rose-300",
  },
  {
    number: "08",
    title: "Peningkatan Kualitas Pelayanan Publik",
    subtitle: "Public Service Quality",
    description: "Memberikan pelayanan keagamaan yang lebih cepat, murah, aman, transparan, serta mengutamakan kepuasan masyarakat penerima layanan.",
    targets: [
      "Penetapan Maklumat & Standar Pelayanan Publik",
      "Penerapan Budaya Kerja 5S & Motto HAPAKAT",
      "Survei Kepuasan Masyarakat (SKM) berkala",
      "Pengelolaan pengaduan terpadu (SP4N-LAPOR!)",
    ],
    icon: Award,
    color: "from-emerald-600 to-cyan-600",
    bgColor: "bg-emerald-50 dark:bg-emerald-950/30",
    borderColor: "border-emerald-200 dark:border-emerald-800/50",
    badgeColor: "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/60 dark:text-emerald-300",
  },
];

const TARGET_RESULTS = [
  {
    title: "Birokrasi yang Bersih dan Akuntabel",
    desc: "Bebas dari praktik Korupsi, Kolusi, dan Nepotisme (KKN) dengan tingkat akuntabilitas kinerja tinggi.",
  },
  {
    title: "Birokrasi yang Efektif dan Efisien",
    desc: "Proses bisnis cepat, berbasis E-Government, hemat anggaran, serta berorientasi pada pencapaian hasil.",
  },
  {
    title: "Pelayanan Publik yang Berkualitas",
    desc: "Layanan keagamaan yang mudah, transparan, cepat, berkeadilan, dan memuaskan seluruh lapisan masyarakat.",
  },
];

export default function AreaPerubahanZiShell() {
  const [activePdf, setActivePdf] = useState(null);

  const pdfDocuments = [
    {
      title: "SK Penetapan Maklumat Pelayanan 2026",
      number: "SK No. 46 Tahun 2026",
      fileUrl: "/assets/documents/sk-maklumat-pelayanan-2026.pdf",
    },
    {
      title: "SK Kode Etik Pelayanan & Motto HAPAKAT",
      number: "SK Pedoman Kode Etik",
      fileUrl: "/assets/documents/sk-kode-etik.pdf",
    },
    {
      title: "SK Pedoman Budaya Kerja 5S",
      number: "SK Pedoman 5S",
      fileUrl: "/assets/documents/sk-pedoman-5S.pdf",
    },
    {
      title: "Modul Standar Pelayanan Publik Kemenag",
      number: "Buku Pedoman Pelayanan",
      fileUrl: "/assets/documents/modul-standar-pelayanan.pdf",
    },
  ];

  return (
    <Providers>
      <Header />
      <main id="konten-utama" className="min-h-screen pt-24 sm:pt-28 md:pt-32 lg:pt-36 xl:pt-40">
        <main className="min-h-screen bg-slate-50 transition-colors dark:bg-slate-950">
          <PageBanner
            title="8 Area Perubahan Reformasi Birokrasi"
            description="Kerangka kerja utama Pembangunan Zona Integritas (ZI) menuju Wilayah Bebas dari Korupsi (WBK) & Wilayah Birokrasi Bersih dan Melayani (WBBM) Kankemenag Kab. Barito Utara."
            breadcrumb={[
              { label: "Beranda", href: "/beranda" },
              { label: "Zona Integritas", href: "/zona-integritas/area-perubahan-zi" },
              { label: "8 Area Perubahan ZI" },
            ]}
          />

          <section className="relative w-full px-6 py-8 sm:px-10 sm:py-12 lg:px-16 xl:px-20">
            <div className="w-full space-y-12">
              {/* Header Banner */}
              <div className="rounded-3xl border border-slate-200/80 bg-white p-6 shadow-md dark:border-slate-800 dark:bg-slate-900 sm:p-8">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                  <div className="flex items-center gap-3">
                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-400">
                      <ShieldCheck className="h-6 w-6" />
                    </div>
                    <div>
                      <p className="text-xs font-bold uppercase tracking-widest text-emerald-700 dark:text-emerald-400">
                        Pembangunan ZI WBK/WBBM
                      </p>
                      <h2 className="text-2xl font-black text-slate-900 dark:text-slate-100 sm:text-3xl">
                        8 Pilar Utama Reformasi Birokrasi
                      </h2>
                    </div>
                  </div>

                  <span className="inline-flex items-center gap-2 rounded-full border border-emerald-300/60 bg-emerald-100/80 px-3.5 py-1.5 text-xs font-bold text-emerald-800 dark:border-emerald-800/50 dark:bg-emerald-950/40 dark:text-emerald-300">
                    <Award className="h-4 w-4" />
                    <span>Menuju WBK / WBBM</span>
                  </span>
                </div>

                <p className="mt-4 text-xs leading-relaxed text-slate-600 dark:text-slate-400 sm:text-sm">
                  Reformasi Birokrasi Kementerian Agama dilaksanakan melalui 8 Area Perubahan sebagai pengungkit utama dalam mentransformasi tata kelola pemerintahan yang bersih, transparan, akuntabel, dan memberikan pelayanan publik yang berkualitas tinggi bagi seluruh masyarakat Kabupaten Barito Utara.
                </p>
              </div>

              {/* Target Hasil Utama Section */}
              <div className="rounded-3xl bg-slate-900 p-6 text-white shadow-xl dark:bg-slate-900/90 sm:p-8">
                <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-emerald-400">
                  <Target className="h-4 w-4" />
                  <span>Target Sasaran Reformasi Birokrasi</span>
                </div>
                <h3 className="mt-2 text-xl font-black sm:text-2xl">
                  3 Sasaran Hasil Utama Pembangunan Zona Integritas
                </h3>

                <div className="mt-6 grid gap-5 md:grid-cols-3">
                  {TARGET_RESULTS.map((res, idx) => (
                    <div
                      key={idx}
                      className="rounded-2xl border border-white/10 bg-white/5 p-5 backdrop-blur-sm transition-all hover:bg-white/10"
                    >
                      <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-emerald-500/20 text-xs font-bold text-emerald-400">
                        0{idx + 1}
                      </div>
                      <h4 className="mt-3 text-base font-bold text-white">{res.title}</h4>
                      <p className="mt-2 text-xs text-slate-300">{res.desc}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* 8 Area Perubahan Grid */}
              <div className="space-y-6">
                <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <div className="inline-flex items-center gap-2 rounded-full border border-teal-300/60 bg-teal-100/80 px-3.5 py-1 text-xs font-bold uppercase tracking-wider text-teal-800 dark:border-teal-800/50 dark:bg-teal-950/40 dark:text-teal-300">
                      <Layers className="h-3.5 w-3.5" />
                      <span>Komponen Pengungkit</span>
                    </div>
                    <h2 className="mt-2 text-2xl font-black text-slate-900 dark:text-slate-100 sm:text-3xl">
                      Rincian 8 Area Perubahan ZI
                    </h2>
                  </div>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Pilar transformasi pelayanan keagamaan Kankemenag Kab. Barito Utara.
                  </p>
                </div>

                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
                  {EIGHT_AREAS.map((area) => {
                    const IconComponent = area.icon;
                    return (
                      <div
                        key={area.number}
                        className={`group relative flex flex-col justify-between rounded-3xl border ${area.borderColor} ${area.bgColor} p-6 shadow-md transition-all duration-300 hover:-translate-y-1.5 hover:shadow-xl`}
                      >
                        <div>
                          <div className="flex items-center justify-between">
                            <div className={`flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br ${area.color} text-white shadow-md`}>
                              <IconComponent className="h-6 w-6" />
                            </div>
                            <span className={`rounded-full px-2.5 py-1 text-xs font-black ${area.badgeColor}`}>
                              Area {area.number}
                            </span>
                          </div>

                          <h3 className="mt-4 text-lg font-black text-slate-900 dark:text-slate-100">
                            {area.title}
                          </h3>
                          <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                            {area.subtitle}
                          </p>

                          <p className="mt-3 text-xs leading-relaxed text-slate-600 dark:text-slate-300">
                            {area.description}
                          </p>

                          <div className="mt-4 border-t border-slate-200/60 pt-4 dark:border-slate-800">
                            <p className="text-[11px] font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-2">
                              Target Capaian:
                            </p>
                            <ul className="space-y-1.5">
                              {area.targets.map((target, tIdx) => (
                                <li key={tIdx} className="flex items-start gap-2 text-xs text-slate-600 dark:text-slate-400">
                                  <CheckCircle2 className="h-3.5 w-3.5 shrink-0 text-emerald-600 dark:text-emerald-400 mt-0.5" />
                                  <span>{target}</span>
                                </li>
                              ))}
                            </ul>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Section Dokumen SK ZI Terkait */}
              <div className="rounded-3xl border border-slate-200/80 bg-white p-6 shadow-md dark:border-slate-800 dark:bg-slate-900 sm:p-8">
                <div className="flex items-center gap-3 border-b border-slate-100 pb-5 dark:border-slate-800">
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-400">
                    <FileText className="h-6 w-6" />
                  </div>
                  <div>
                    <p className="text-xs font-bold uppercase tracking-widest text-emerald-700 dark:text-emerald-400">
                      Dokumen Pendukung ZI
                    </p>
                    <h2 className="text-2xl font-black text-slate-900 dark:text-slate-100 sm:text-3xl">
                      Surat Keputusan &amp; Pedoman Pendukung
                    </h2>
                  </div>
                </div>

                <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                  {pdfDocuments.map((doc, index) => (
                    <div
                      key={index}
                      className="flex flex-col justify-between rounded-2xl border border-slate-100 bg-slate-50/70 p-4 transition-all hover:border-emerald-500/40 hover:bg-emerald-50/40 dark:border-slate-800 dark:bg-slate-800/40 dark:hover:bg-slate-800"
                    >
                      <div>
                        <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-700 dark:text-emerald-400">
                          {doc.number}
                        </span>
                        <h4 className="mt-1 text-sm font-bold text-slate-900 dark:text-slate-100">
                          {doc.title}
                        </h4>
                      </div>

                      <div className="mt-4 flex items-center gap-2">
                        <button
                          onClick={() => setActivePdf(doc)}
                          className="group/btn flex flex-1 items-center justify-center gap-1.5 rounded-xl bg-emerald-600 px-3 py-2 text-xs font-bold text-white shadow-sm transition-all hover:bg-emerald-500"
                        >
                          <Eye className="h-3.5 w-3.5 transition-transform group-hover/btn:scale-110" />
                          <span>Lihat PDF</span>
                        </button>
                        <a
                          href={doc.fileUrl}
                          download
                          className="flex h-8 w-8 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-700 transition-colors hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-700 dark:text-slate-200"
                          title="Unduh PDF"
                        >
                          <Download className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" />
                        </a>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </section>

          {/* Floating PDF.js Modal */}
          <PdfViewerModal
            isOpen={!!activePdf}
            onClose={() => setActivePdf(null)}
            fileUrl={activePdf?.fileUrl}
            title={activePdf?.title}
            subtitle={activePdf?.number ? `${activePdf.number} • Dokumen Resmi ZI` : "Dokumen Resmi ZI"}
          />
        </main>
      </main>
      <Footer />
    </Providers>
  );
}