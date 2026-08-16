"use client";

import Providers from "@/components/layout/Providers";
import Header from "@/components/layout/Header/Header";
import Footer from "@/components/layout/Footer/Footer";
import PageBanner from "@/components/common/PageBanner";
import {
  Target,
  HeartHandshake,
  Users,
  BookOpenCheck,
  Building2,
  Zap,
  CheckCircle2,
  Sparkles,
  Award,
  ShieldCheck,
} from "lucide-react";

const OFFICIAL_GOALS = [
  {
    number: "01",
    title: "Peningkatan Kualitas & Kemudahan Layanan Umat",
    description:
      "Menghadirkan pelayanan keagamaan yang cepat, mudah, transparan, akuntabel, dan responsif terhadap kebutuhan masyarakat Kabupaten Barito Utara melalui sistem Layanan Terpadu Satu Pintu (PTSP SI ATAK).",
    indicators: [
      "Digitalisasi alur pendaftaran nikah, haji, & perizinan lembaga",
      "Standar waktu pelayanan yang jelas & pasti",
      "Indeks Kepuasan Masyarakat (IKM) berkategori Sangat Baik",
    ],
    icon: HeartHandshake,
    badgeColor: "bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300",
    gradient: "from-emerald-600 to-teal-600",
  },
  {
    number: "02",
    title: "Penguatan Moderasi Beragama & Harmoni Sosial",
    description:
      "Membangun kehidupan beragama yang damai, toleran, moderat, dan saling menghormati antarumat beragama di seluruh pelosok Kabupaten Barito Utara.",
    indicators: [
      "Penguatan FKUB (Forum Kerukunan Umat Beragama)",
      "Pencegahan potensi konflik keagamaan secara dini",
      "Pengokohan nilai toleransi di lingkungan pendidikan & publik",
    ],
    icon: Users,
    badgeColor: "bg-teal-100 text-teal-800 dark:bg-teal-950/60 dark:text-teal-300",
    gradient: "from-teal-600 to-cyan-600",
  },
  {
    number: "03",
    title: "Peningkatan Mutu & Daya Saing Pendidikan Keagamaan",
    description:
      "Mendorong kualitas pendidikan madrasah, pesantren, dan pendidikan agama yang unggul, inklusif, berkarakter mulia, serta berdaya saing di tingkat lokal maupun nasional.",
    indicators: [
      "Peningkatan akreditasi madrasah & pondok pesantren",
      "Peningkatan kompetensi pedagogik & profesional guru",
      "Pemerataan sarana digital pembelajaran madrasah",
    ],
    icon: BookOpenCheck,
    badgeColor: "bg-blue-100 text-blue-800 dark:bg-blue-950/60 dark:text-blue-300",
    gradient: "from-blue-600 to-indigo-600",
  },
  {
    number: "04",
    title: "Tata Kelola Birokrasi Bersih & Bebas KKN (Good Governance)",
    description:
      "Mewujudkan birokrasi kelembagaan yang bersih, akuntabel, profesional, transparan, dan bebas dari praktik KKN melalui Pembangunan Zona Integritas (ZI) menuju WBK/WBBM.",
    indicators: [
      "Penegakan Sistem Pengendalian Intern Pemerintah (SPIP)",
      "Penerapan Manajemen Risiko & Sistem Pengaduan SIGESIT",
      "Opini laporan keuangan & kinerja berpredikat Tertib",
    ],
    icon: Building2,
    badgeColor: "bg-purple-100 text-purple-800 dark:bg-purple-950/60 dark:text-purple-300",
    gradient: "from-purple-600 to-pink-600",
  },
  {
    number: "05",
    title: "Akselerasi Transformasi Digital & Keterbukaan Informasi",
    description:
      "Memanfaatkan teknologi informasi secara optimal (SI BETANG, SI MANDAU, E-SOP) untuk mempercepat integrasi layanan publik dan menjamin hak keterbukaan informasi masyarakat.",
    indicators: [
      "Ketersediaan informasi publik transparan melalui portal PPID",
      "Layanan surat & arsip digital cepat tanpa hambatan",
      "Kemudahan akses informasi keagamaan berbasis mobile & web",
    ],
    icon: Zap,
    badgeColor: "bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300",
    gradient: "from-amber-600 to-orange-600",
  },
];

export default function TujuanShell() {
  return (
    <Providers>
      <Header />
      <main id="konten-utama" className="min-h-screen pt-24 sm:pt-28 md:pt-32 lg:pt-36 xl:pt-40">
        <PageBanner
          title="Tujuan Kelembagaan"
          description="Tujuan strategis Kantor Kementerian Agama Kabupaten Barito Utara dalam meningkatkan mutu pelayanan, memperkuat kerukunan, serta mewujudkan tata kelola bersih dan akuntabel."
          breadcrumb={[
            { label: "Beranda", href: "/beranda" },
            { label: "Profil", href: "/profil/sejarah" },
            { label: "Tujuan" },
          ]}
        />

        <main className="min-h-screen bg-slate-50 transition-colors dark:bg-slate-950">
          <section className="relative w-full px-6 py-8 sm:px-10 sm:py-12 lg:px-16 xl:px-20">
            <div className="w-full space-y-10 sm:space-y-12">
              <div className="rounded-3xl border border-slate-200/80 bg-white p-6 shadow-md dark:border-slate-800 dark:bg-slate-900 sm:p-8">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                  <div className="flex items-center gap-3">
                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-400">
                      <Target className="h-6 w-6" />
                    </div>
                    <div>
                      <p className="text-xs font-bold uppercase tracking-widest text-emerald-700 dark:text-emerald-400">
                        Arah Kebijakan Kankemenag Barut
                      </p>
                      <h2 className="text-2xl font-black text-slate-900 dark:text-slate-100 sm:text-3xl">
                        5 Pilar Tujuan Kelembagaan
                      </h2>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-300/60 bg-emerald-100/80 px-3.5 py-1.5 text-xs font-bold text-emerald-800 dark:border-emerald-800/50 dark:bg-emerald-950/40 dark:text-emerald-300">
                      <ShieldCheck className="h-4 w-4" />
                      <span>Zona Integritas WBK/WBBM</span>
                    </span>
                  </div>
                </div>

                <p className="mt-4 text-xs leading-relaxed text-slate-600 dark:text-slate-400 sm:text-sm">
                  Seluruh tujuan kelembagaan ini dirumuskan untuk memberikan arah yang jelas dalam pelaksanaan tugas pelayanan keagamaan, pembinaan pendidikan, serta pencapaian kinerja yang akuntabel bagi masyarakat Kabupaten Barito Utara.
                </p>
              </div>

              <div className="space-y-6">
                {OFFICIAL_GOALS.map((goal, index) => {
                  const IconComp = goal.icon;
                  return (
                    <div
                      key={goal.number}
                      className="group relative flex flex-col justify-between overflow-hidden rounded-3xl border border-slate-200/80 bg-white p-7 shadow-md transition-all duration-300 hover:-translate-y-1 hover:border-emerald-500/40 hover:shadow-2xl dark:border-slate-800 dark:bg-slate-900 lg:p-8"
                    >
                      <div className="grid gap-6 lg:grid-cols-12 lg:items-start">
                        <div className="lg:col-span-4 flex items-start gap-4">
                          <div
                            className={`flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br ${goal.gradient} text-lg font-black text-white shadow-md`}
                          >
                            {goal.number}
                          </div>

                          <div className="space-y-1">
                            <span className={`inline-block rounded-full px-3 py-0.5 text-[11px] font-bold ${goal.badgeColor}`}>
                              Pilar {goal.number}
                            </span>
                            <h3 className="text-xl font-black text-slate-900 group-hover:text-emerald-700 dark:text-slate-100 dark:group-hover:text-emerald-400 leading-snug">
                              {goal.title}
                            </h3>
                          </div>
                        </div>

                        <div className="lg:col-span-8 space-y-4">
                          <p className="text-xs leading-relaxed text-slate-700 dark:text-slate-300 sm:text-sm font-medium">
                            {goal.description}
                          </p>

                          <div className="rounded-2xl border border-slate-100 bg-slate-50/80 p-4 dark:border-slate-800/80 dark:bg-slate-800/50">
                            <p className="text-[11px] font-extrabold uppercase tracking-wider text-emerald-700 dark:text-emerald-400 mb-2">
                              Indikator Pencapaian Utama:
                            </p>
                            <div className="grid gap-2 sm:grid-cols-2">
                              {goal.indicators.map((ind, idx) => (
                                <div
                                  key={idx}
                                  className="flex items-center gap-2 text-xs text-slate-600 dark:text-slate-400"
                                >
                                  <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-600 dark:text-emerald-400" />
                                  <span>{ind}</span>
                                </div>
                              ))}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="rounded-3xl bg-slate-900 p-6 text-white shadow-xl dark:bg-slate-900/90 sm:p-8">
                <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
                  <div className="flex items-start gap-4">
                    <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-500 text-white shadow-lg">
                      <Award className="h-7 w-7" />
                    </div>
                    <div>
                      <p className="text-xs font-bold uppercase tracking-[0.25em] text-emerald-400">
                        Akuntabilitas &amp; Kepercayaan Publik
                      </p>
                      <h3 className="mt-2 text-xl font-black sm:text-2xl">
                        Tujuan yang Terukur, Pelayanan yang Berdampak
                      </h3>
                      <p className="mt-1.5 max-w-3xl text-xs leading-relaxed text-slate-300 dark:text-slate-400 sm:text-sm">
                        Setiap tujuan kelembagaan dirancang untuk memperkuat pelayanan keagamaan yang unggul, memantapkan tata kelola yang bersih, serta menghadirkan dampak positif yang nyata bagi masyarakat Kabupaten Barito Utara.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 shrink-0">
                    <span className="inline-flex items-center gap-2 rounded-2xl border border-white/20 bg-white/10 px-5 py-3 text-xs font-bold text-white backdrop-blur-md">
                      <Sparkles className="h-4 w-4 text-emerald-400" />
                      <span>Kemenag Barut HAPAKAT</span>
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
