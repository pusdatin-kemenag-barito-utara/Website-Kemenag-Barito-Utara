"use client";

import React from "react";
import Providers from "@/components/layout/Providers";
import Header from "@/components/layout/Header/Header";
import Footer from "@/components/layout/Footer/Footer";
import PageBanner from "@/components/common/PageBanner";
import {
  MessageSquareWarning,
  ShieldCheck,
  CheckCircle2,
  Lock,
  Clock,
} from "lucide-react";

const PENGADUAN_PORTALS = [
  {
    id: "sigesit",
    name: "SI-GESIT",
    fullName:
      "Sistem Informasi Gagasan, Evaluasi, Saran, Informasi dan Tanggapan",
    category: "Portal Pengaduan Kemenag Barut",
    description:
      "Portal pengaduan resmi, penampungan aspirasi, penyampaian saran, dan evaluasi pelayanan publik Kantor Kementerian Agama Kabupaten Barito Utara.",
    href: "https://pengaduan.kemenag-baritoutara.com",
    badgeColor:
      "bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300",
    buttonBg: "bg-emerald-600 hover:bg-emerald-500 shadow-emerald-600/20",
    features: [
      "Pengaduan khusus pelayanan Kemenag Barito Utara",
      "Penyampaian gagasan, saran, & evaluasi publik",
      "Jaminan respon cepat dari petugas admin kantor",
      "Privasi dan identitas pemohon terlindungi",
    ],
  },
  {
    id: "sp4n-lapor",
    name: "SP4N-LAPOR!",
    fullName: "Sistem Pengelolaan Pengaduan Pelayanan Publik Nasional",
    category: "Layanan Pengaduan Nasional",
    description:
      "Laporan Aspirasi dan Pengaduan Online Rakyat nasional yang terintegrasi secara langsung dengan seluruh Kementerian, Lembaga, dan Pemerintah Daerah di Indonesia.",
    href: "https://www.lapor.go.id",
    badgeColor: "bg-red-100 text-red-800 dark:bg-red-950/60 dark:text-red-300",
    buttonBg: "bg-red-600 hover:bg-red-500 shadow-red-600/20",
    features: [
      "Terintegrasi nasional seluruh instansi pemerintah",
      "Fitur pengaduan Anonim & Rahasia",
      "Pantauan progres penyelesaian laporan transparan",
      "Diawasi oleh Kementerian PANRB, Kantor Staf Presiden & Ombudsman",
    ],
  },
  {
    id: "wbs-kemenag",
    name: "Whistleblowing System (WBS)",
    fullName: "Sistem Pelaporan Pelanggaran SIMDUMAS Kemenag RI",
    category: "Inspektorat Jenderal Kemenag RI",
    description:
      "Aplikasi pelaporan bagi Anda yang memiliki informasi dan ingin melaporkan indikasi tindak pidana korupsi, pungli, atau pelanggaran etika yang dilakukan ASN Kementerian Agama.",
    href: "https://simdumas.kemenag.go.id",
    badgeColor:
      "bg-blue-100 text-blue-800 dark:bg-blue-950/60 dark:text-blue-300",
    buttonBg: "bg-blue-600 hover:bg-blue-500 shadow-blue-600/20",
    features: [
      "Kerahasiaan identitas pelapor (Whistleblower) dijamin 100%",
      "Penanganan langsung oleh Inspektorat Jenderal Kemenag RI",
      "Fokus pelaporan tindak pidana korupsi, pungli & pelanggaran etika",
      "Perlindungan hukum bagi pelapor yang beritikad baik",
    ],
  },
];

export default function EPengaduanShell() {
  return (
    <Providers>
      <Header />
      <main id="konten-utama" className="min-h-screen pt-24 sm:pt-28 md:pt-32 lg:pt-36 xl:pt-40">
        <main className="min-h-screen bg-slate-50 transition-colors dark:bg-slate-950">
          <PageBanner
            title="E-Pengaduan"
            description="Pusat layanan pengaduan resmi, penanganan aspirasi, serta pelaporan pelanggaran di lingkungan Kantor Kementerian Agama Kabupaten Barito Utara."
            breadcrumb={[
              { label: "Beranda", href: "/beranda" },
              { label: "E-Pengaduan" },
            ]}
          />

          <section className="relative w-full px-6 py-8 sm:px-10 sm:py-12 lg:px-16 xl:px-20">
            <div className="w-full space-y-10 sm:space-y-12">
              {/* Header Banner */}
              <div className="relative overflow-hidden rounded-3xl border border-slate-200/80 bg-white p-6 shadow-md dark:border-slate-800 dark:bg-slate-900 sm:p-8">
                <div className="flex flex-wrap items-center gap-3">
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-400">
                    <MessageSquareWarning className="h-6 w-6" />
                  </div>
                  <div>
                    <p className="text-xs font-bold uppercase tracking-widest text-emerald-700 dark:text-emerald-400">
                      Layanan Pengaduan Masyarakat
                    </p>
                    <h2 className="text-2xl font-black text-slate-900 dark:text-slate-100 sm:text-3xl">
                      Kanal Pengaduan &amp; Aspirasi Publik
                    </h2>
                  </div>
                </div>

                <p className="mt-3 text-xs leading-relaxed text-slate-600 dark:text-slate-400 sm:text-sm">
                  Kami siap mendengarkan aspirasi, kritik, saran, serta pengaduan
                  Anda. Pilih salah satu portal pengaduan di bawah ini sesuai dengan
                  jenis laporan yang ingin Anda sampaikan.
                </p>

                <div className="mt-4">
                  <span className="inline-flex items-center gap-2 rounded-full border border-emerald-300/60 bg-emerald-100/80 px-3.5 py-1.5 text-xs font-bold text-emerald-800 dark:border-emerald-800/50 dark:bg-emerald-950/40 dark:text-emerald-300">
                    <ShieldCheck className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                    <span>Jaminan Keamanan &amp; Identitas Terlindungi</span>
                  </span>
                </div>
              </div>

              {/* Main Layout: Left Large Poster Image + Right 3 Portal Cards */}
              <div className="grid gap-8 lg:grid-cols-12 lg:items-stretch">
                {/* Left Column: Big Poster Image (Full Height matching right 3 cards) */}
                <div className="lg:col-span-5 xl:col-span-5 flex flex-col">
                  <div className="flex flex-1 flex-col justify-between overflow-hidden rounded-3xl border border-slate-200/80 bg-white p-5 shadow-xl transition-all duration-300 hover:shadow-2xl dark:border-slate-800 dark:bg-slate-900">
                    <div className="relative flex-1 min-h-[520px] w-full overflow-hidden rounded-2xl bg-slate-50 dark:bg-slate-950/60">
                      <img
                        src="/assets/images/pengaduan.webp"
                        alt="Alur Penanganan Pengaduan Kemenag Barito Utara"
                        className="h-full w-full object-contain p-3 transition-transform duration-500 hover:scale-[1.02]"
                      />
                    </div>
                    <div className="mt-4 border-t border-slate-100 pt-3 text-center dark:border-slate-800">
                      <p className="text-xs font-bold text-slate-800 dark:text-slate-200">
                        Infografis Tata Cara Pengaduan
                      </p>
                      <p className="text-[11px] font-medium text-slate-500 dark:text-slate-400">
                        Sistem Layanan Terintegrasi &amp; Transparan
                      </p>
                    </div>
                  </div>
                </div>

                {/* Right Column: 3 Cards */}
                <div className="space-y-6 lg:col-span-7 xl:col-span-7 flex flex-col justify-between">
                  {PENGADUAN_PORTALS.map((portal) => (
                    <div
                      key={portal.id}
                      className="group relative flex flex-col justify-between overflow-hidden rounded-3xl border border-slate-200/80 bg-white p-6 shadow-md transition-all duration-300 hover:-translate-y-1 hover:border-emerald-500/40 hover:shadow-xl dark:border-slate-800 dark:bg-slate-900 sm:p-7"
                    >
                      <div className="space-y-4">
                        {/* Top Badge & Header */}
                        <div className="flex items-center justify-between">
                          <span
                            className={`rounded-full px-3 py-1 text-[11px] font-bold ${portal.badgeColor}`}
                          >
                            {portal.category}
                          </span>
                        </div>

                        <div>
                          <h3 className="text-xl font-black text-slate-900 group-hover:text-emerald-700 dark:text-slate-100 dark:group-hover:text-emerald-400 sm:text-2xl">
                            {portal.name}
                          </h3>
                          <p className="mt-0.5 text-xs font-extrabold uppercase tracking-wide text-slate-400">
                            {portal.fullName}
                          </p>

                          <p className="mt-2.5 text-xs leading-relaxed text-slate-600 dark:text-slate-300 sm:text-sm">
                            {portal.description}
                          </p>
                        </div>

                        {/* Feature Checklist Grid */}
                        <div className="border-t border-slate-100 pt-3.5 dark:border-slate-800/80">
                          <p className="mb-2 text-[11px] font-extrabold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                            Keunggulan Layanan:
                          </p>
                          <ul className="grid gap-2 sm:grid-cols-2">
                            {portal.features.map((feat, idx) => (
                              <li
                                key={idx}
                                className="flex items-start gap-2 text-xs text-slate-600 dark:text-slate-300"
                              >
                                <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600 dark:text-emerald-400" />
                                <span className="font-medium">{feat}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      </div>

                      {/* Direct Link Button */}
                      <div className="mt-6 border-t border-slate-100 pt-4 dark:border-slate-800">
                        <a
                          href={portal.href}
                          target="_blank"
                          rel="noopener noreferrer"
                          className={`flex items-center justify-center gap-2.5 rounded-2xl ${portal.buttonBg} px-5 py-3 text-xs font-bold text-white shadow-lg transition-all duration-300 hover:shadow-xl active:scale-[0.98]`}
                        >
                          <span>Akses Portal {portal.name}</span>
                          <svg
                            className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                            strokeWidth="3"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              d="M14 5l7 7m0 0l-7 7m7-7H3"
                            />
                          </svg>
                        </a>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Section Prinsip Penanganan Pengaduan */}
              <div className="rounded-3xl bg-slate-900 p-6 text-white shadow-xl dark:bg-slate-900/90 sm:p-8">
                <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
                  <div className="flex items-start gap-4">
                    <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-500 text-white shadow-lg">
                      <Lock className="h-7 w-7" />
                    </div>
                    <div>
                      <p className="text-xs font-bold uppercase tracking-[0.25em] text-emerald-400">
                        Jaminan Kepastian &amp; Privasi
                      </p>
                      <h3 className="mt-2 text-xl font-black sm:text-2xl">
                        Komitmen Penanganan Pengaduan Kemenag Barito Utara
                      </h3>
                      <p className="mt-1.5 max-w-3xl text-xs leading-relaxed text-slate-300 dark:text-slate-400 sm:text-sm">
                        Setiap pengaduan yang masuk akan ditindaklanjuti secara
                        objektif, profesional, serta dijaga kerahasiaannya sesuai
                        ketentuan hukum yang berlaku.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 shrink-0">
                    <span className="inline-flex items-center gap-2 rounded-2xl border border-white/20 bg-white/10 px-5 py-3 text-xs font-bold text-white backdrop-blur-md">
                      <Clock className="h-4 w-4 text-emerald-400" />
                      <span>Respon Pengaduan Cepat</span>
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </section>
        </main>
      </main>
      <Footer />
    </Providers>
  );
}