"use client";

import Providers from "@/components/layout/Providers";
import Header from "@/components/layout/Header/Header";
import Footer from "@/components/layout/Footer/Footer";
import PageBanner from "@/components/common/PageBanner";
import {
  Briefcase,
  Zap,
  ShieldCheck,
  Eye,
  Award,
  CheckCircle2,
  FileText,
  HeartHandshake,
  BookOpen,
  Users,
  Building2,
  Activity,
  Sparkles,
  Layers,
} from "lucide-react";

const INDIKATOR = [
  { label: "Responsif", icon: Zap, color: "text-amber-500 bg-amber-50 dark:bg-amber-950/40" },
  { label: "Akuntabel", icon: ShieldCheck, color: "text-blue-500 bg-blue-50 dark:bg-blue-950/40" },
  { label: "Transparan", icon: Eye, color: "text-emerald-500 bg-emerald-50 dark:bg-emerald-950/40" },
  { label: "Profesional", icon: Award, color: "text-purple-500 bg-purple-50 dark:bg-purple-950/40" },
];

const TUGAS_UTAMA = [
  "Melaksanakan pelayanan dan pembinaan di bidang urusan agama Islam, Kristen, Katolik, Hindu, Buddha, dan kepercayaan sesuai ketentuan yang berlaku.",
  "Menyelenggarakan pelayanan administrasi keagamaan yang cepat, transparan, akuntabel, dan berorientasi pada kebutuhan masyarakat.",
  "Mendorong peningkatan kualitas pendidikan agama dan pendidikan keagamaan di wilayah Kabupaten Barito Utara.",
];

const ORIENTASI_KERJA = [
  "Pelayanan Publik",
  "Moderasi Beragama",
  "Pendidikan Agama",
  "Tata Kelola Bersih",
];

const FUNGSI_LIST = [
  {
    title: "Perumusan Kebijakan Teknis",
    description:
      "Menyusun arah pelaksanaan program dan layanan keagamaan sesuai kebijakan Kementerian Agama.",
    icon: FileText,
    badgeColor: "bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300",
  },
  {
    title: "Pelayanan Keagamaan",
    description:
      "Memberikan layanan publik di bidang nikah, rujuk, zakat, wakaf, bimbingan masyarakat, dan layanan keagamaan lainnya.",
    icon: HeartHandshake,
    badgeColor: "bg-teal-100 text-teal-800 dark:bg-teal-950/60 dark:text-teal-300",
  },
  {
    title: "Pembinaan Pendidikan",
    description:
      "Melakukan pembinaan madrasah, pendidikan agama, pendidikan keagamaan, serta peningkatan mutu kelembagaan pendidikan.",
    icon: BookOpen,
    badgeColor: "bg-blue-100 text-blue-800 dark:bg-blue-950/60 dark:text-blue-300",
  },
  {
    title: "Kerukunan Umat Beragama",
    description:
      "Memperkuat moderasi beragama, toleransi, dan harmoni sosial di tengah masyarakat.",
    icon: Users,
    badgeColor: "bg-indigo-100 text-indigo-800 dark:bg-indigo-950/60 dark:text-indigo-300",
  },
  {
    title: "Tata Kelola Organisasi",
    description:
      "Mengelola administrasi, kepegawaian, keuangan, data, informasi, dan aset secara profesional.",
    icon: Building2,
    badgeColor: "bg-purple-100 text-purple-800 dark:bg-purple-950/60 dark:text-purple-300",
  },
  {
    title: "Pengawasan dan Evaluasi",
    description:
      "Melaksanakan monitoring, evaluasi, dan pelaporan untuk memastikan layanan berjalan efektif dan akuntabel.",
    icon: Activity,
    badgeColor: "bg-rose-100 text-rose-800 dark:bg-rose-950/60 dark:text-rose-300",
  },
];

export default function TugasFungsiShell() {
  return (
    <Providers>
      <Header />
      <main id="konten-utama" className="min-h-screen pt-24 sm:pt-28 md:pt-32 lg:pt-36 xl:pt-40">
        <PageBanner
          title="Tugas dan Fungsi"
          description="Mandat resmi, tugas utama, serta fungsi kelembagaan Kantor Kementerian Agama Kabupaten Barito Utara dalam menyelenggarakan tata kelola keagamaan yang profesional."
          breadcrumb={[
            { label: "Beranda", href: "/beranda" },
            { label: "Profil", href: "/profil/sejarah" },
            { label: "Tugas & Fungsi" },
          ]}
        />

        <main className="min-h-screen bg-slate-50 transition-colors dark:bg-slate-950">
          <section className="relative w-full px-6 py-8 sm:px-10 sm:py-12 lg:px-16 xl:px-20">
            <div className="w-full space-y-10 sm:space-y-12">
              <div className="grid gap-5 grid-cols-2 lg:grid-cols-4">
                {INDIKATOR.map((item) => {
                  const IconComp = item.icon;
                  return (
                    <div
                      key={item.label}
                      className="flex items-center gap-4 rounded-3xl border border-slate-200/80 bg-white p-5 shadow-md transition-all hover:-translate-y-1 hover:shadow-xl dark:border-slate-800 dark:bg-slate-900"
                    >
                      <div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl ${item.color}`}>
                        <IconComp className="h-6 w-6" />
                      </div>
                      <div>
                        <h3 className="text-lg font-black text-slate-900 dark:text-slate-100">
                          {item.label}
                        </h3>
                        <p className="text-[10px] font-extrabold uppercase tracking-widest text-slate-400">
                          Prinsip Layanan
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="grid gap-8 lg:grid-cols-12 lg:items-stretch">
                <div className="lg:col-span-7 flex flex-col justify-between rounded-3xl border border-slate-200/80 bg-white p-7 shadow-md dark:border-slate-800 dark:bg-slate-900">
                  <div className="space-y-6">
                    <div className="flex items-center gap-3">
                      <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-400">
                        <Briefcase className="h-6 w-6" />
                      </div>
                      <div>
                        <p className="text-xs font-bold uppercase tracking-widest text-emerald-700 dark:text-emerald-400">
                          Tugas Utama Instansi
                        </p>
                        <h2 className="text-2xl font-black text-slate-900 dark:text-slate-100 sm:text-3xl">
                          Mandat Pelayanan Keagamaan
                        </h2>
                      </div>
                    </div>

                    <div className="space-y-4">
                      {TUGAS_UTAMA.map((item, index) => (
                        <div
                          key={index}
                          className="flex items-start gap-4 rounded-2xl border border-slate-100 bg-slate-50/70 p-4 transition-all hover:border-emerald-500/40 hover:bg-emerald-50/40 dark:border-slate-800 dark:bg-slate-800/40 dark:hover:bg-slate-800"
                        >
                          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-600 to-teal-600 text-xs font-black text-white shadow-sm">
                            0{index + 1}
                          </div>
                          <p className="text-xs leading-relaxed text-slate-700 dark:text-slate-300 sm:text-sm font-medium">
                            {item}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="lg:col-span-5 flex flex-col justify-between overflow-hidden rounded-3xl bg-slate-900 p-7 text-white shadow-xl dark:bg-slate-900/90 dark:ring-1 dark:ring-white/10">
                  <div className="space-y-5">
                    <div className="inline-flex items-center gap-2 rounded-full bg-emerald-500/20 px-3.5 py-1 text-xs font-bold uppercase tracking-wider text-emerald-400 border border-emerald-500/30">
                      <Sparkles className="h-3.5 w-3.5" />
                      <span>Orientasi Kerja</span>
                    </div>

                    <h2 className="text-2xl font-black sm:text-3xl leading-snug">
                      Melayani Umat dengan Integritas dan Profesionalitas
                    </h2>

                    <p className="text-xs leading-relaxed text-slate-300 dark:text-slate-400 sm:text-sm">
                      Setiap fungsi kelembagaan diarahkan untuk menghadirkan pelayanan yang mudah diakses, tertib administrasi, transparan, dan mampu menjawab kebutuhan masyarakat secara nyata.
                    </p>

                    <div className="grid grid-cols-2 gap-3 pt-2">
                      {ORIENTASI_KERJA.map((item, idx) => (
                        <div
                          key={idx}
                          className="flex items-center gap-2 rounded-2xl border border-white/10 bg-white/10 p-3.5 text-xs font-bold text-white backdrop-blur-md"
                        >
                          <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-400" />
                          <span>{item}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="mt-8 border-t border-white/10 pt-4 flex items-center justify-between text-xs text-emerald-300 font-bold">
                    <span>Penyelenggaraan Terpadu</span>
                    <span>Kemenag Barito Utara</span>
                  </div>
                </div>
              </div>

              <div className="space-y-6">
                <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <div className="inline-flex items-center gap-2 rounded-full border border-teal-300/60 bg-teal-100/80 px-3.5 py-1 text-xs font-bold uppercase tracking-wider text-teal-800 dark:border-teal-800/50 dark:bg-teal-950/40 dark:text-teal-300">
                      <Layers className="h-3.5 w-3.5" />
                      <span>Fungsi Kelembagaan</span>
                    </div>
                    <h2 className="mt-2 text-2xl font-black text-slate-900 dark:text-slate-100 sm:text-3xl">
                      Ruang Lingkup Pelaksanaan Fungsi
                    </h2>
                  </div>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    6 Pilar fungsi kelembagaan Kantor Kementerian Agama Barito Utara.
                  </p>
                </div>

                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                  {FUNGSI_LIST.map((item, index) => {
                    const IconComponent = item.icon;
                    return (
                      <div
                        key={index}
                        className="group relative flex flex-col justify-between rounded-3xl border border-slate-200/80 bg-white p-6 shadow-md transition-all duration-300 hover:-translate-y-1.5 hover:border-emerald-500/40 hover:shadow-xl dark:border-slate-800 dark:bg-slate-900"
                      >
                        <div className="space-y-4">
                          <div className="flex items-center justify-between">
                            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-100 text-emerald-700 transition-colors group-hover:bg-emerald-600 group-hover:text-white dark:bg-emerald-950/60 dark:text-emerald-400 dark:group-hover:bg-emerald-500">
                              <IconComponent className="h-6 w-6" />
                            </div>
                            <span className={`rounded-full px-3 py-1 text-[11px] font-bold ${item.badgeColor}`}>
                              Fungsi 0{index + 1}
                            </span>
                          </div>

                          <div>
                            <h3 className="text-lg font-black leading-snug text-slate-900 group-hover:text-emerald-700 dark:text-slate-100 dark:group-hover:text-emerald-400 sm:text-xl">
                              {item.title}
                            </h3>
                            <p className="mt-3 text-xs leading-relaxed text-slate-600 dark:text-slate-400 sm:text-sm">
                              {item.description}
                            </p>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="rounded-3xl bg-gradient-to-r from-emerald-700 via-teal-700 to-emerald-800 p-6 text-white shadow-xl sm:p-8">
                <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
                  <div>
                    <h3 className="text-xl font-black sm:text-2xl">
                      Komitmen Pelayanan Prima Kemenag Barito Utara
                    </h3>
                    <p className="mt-2 max-w-3xl text-xs leading-relaxed text-emerald-50 sm:text-sm">
                      Seluruh tugas dan fungsi dijalankan sebagai bentuk tanggung jawab dalam menghadirkan layanan keagamaan yang berkualitas, inklusif, dan terpercaya bagi masyarakat Kabupaten Barito Utara.
                    </p>
                  </div>

                  <div className="rounded-2xl bg-white/10 px-6 py-4 text-center border border-white/20 backdrop-blur-md shrink-0">
                    <p className="text-2xl font-black text-white">Kemenag Barut</p>
                    <p className="text-[10px] font-bold uppercase tracking-[0.25em] text-emerald-300">
                      Melayani Dengan HAPAKAT
                    </p>
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
