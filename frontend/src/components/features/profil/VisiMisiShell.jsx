"use client";

import Providers from "@/components/layout/Providers";
import Header from "@/components/layout/Header/Header";
import Footer from "@/components/layout/Footer/Footer";
import PageBanner from "@/components/common/PageBanner";
import {
  Target,
  Sparkles,
  Compass,
  HeartHandshake,
  BookOpenCheck,
  ShieldCheck,
  CheckCircle2,
  Award,
} from "lucide-react";

const OFFICIAL_VISION =
  "Terwujudnya masyarakat yang rukun, maslahat, dan cerdas Bersama Indonesia Maju Menuju Indonesia Emas 2045";

const OFFICIAL_MISSIONS = [
  {
    number: "01",
    title: "Kualitas Kehidupan Beragama & Kemaslahatan",
    description:
      "Meningkatkan kualitas kehidupan beragama yang rukun dan berorientasi pada kemaslahatan;",
    details:
      "Memperkuat kerukunan antarumat beragama, mengukuhkan toleransi & moderasi beragama, serta mengoptimalkan peran lembaga keagamaan untuk kemaslahatan bersama.",
    icon: HeartHandshake,
    badgeColor: "bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300",
    color: "from-emerald-600 to-teal-600",
  },
  {
    number: "02",
    title: "Akses & Kualitas Pendidikan Keagamaan",
    description:
      "Meningkatkan akses dan kualitas pendidikan umum dengan kekhasan agama, pesantren, pendidikan agama;",
    details:
      "Memperluas jangkauan pendidikan madrasah, memperkuat daya saing lulusan pesantren & pendidikan keagamaan, serta melengkapi sarana prasarana pembelajaran unggul.",
    icon: BookOpenCheck,
    badgeColor: "bg-blue-100 text-blue-800 dark:bg-blue-950/60 dark:text-blue-300",
    color: "from-blue-600 to-indigo-600",
  },
  {
    number: "03",
    title: "Tata Kelola Pemerintahan (Good Governance)",
    description:
      "Meningkatkan tata kelola pemerintahan yang baik (Good Governance).",
    details:
      "Mewujudkan birokrasi yang bersih, akuntabel, bebas KKN, serta berbasis E-Government (PTSP SI ATAK) guna memberikan pelayanan publik secepat & setransparan mungkin.",
    icon: ShieldCheck,
    badgeColor: "bg-purple-100 text-purple-800 dark:bg-purple-950/60 dark:text-purple-300",
    color: "from-purple-600 to-pink-600",
  },
];

export default function VisiMisiShell() {
  return (
    <Providers>
      <Header />
      <main id="konten-utama" className="min-h-screen pt-24 sm:pt-28 md:pt-32 lg:pt-36 xl:pt-40">
        <PageBanner
          title="Visi & Misi"
          description="Arah strategis dan komitmen Kantor Kementerian Agama Kabupaten Barito Utara dalam mewujudkan pelayanan keagamaan yang rukun, maslahat, dan cerdas."
          breadcrumb={[
            { label: "Beranda", href: "/beranda" },
            { label: "Profil", href: "/profil/sejarah" },
            { label: "Visi & Misi" },
          ]}
        />

        <main className="min-h-screen bg-slate-50 transition-colors dark:bg-slate-950">
          <section className="relative w-full px-6 py-8 sm:px-10 sm:py-12 lg:px-16 xl:px-20">
            <div className="w-full space-y-10 sm:space-y-12">
              <div className="relative overflow-hidden rounded-3xl border border-emerald-500/20 bg-gradient-to-br from-slate-900 via-emerald-950 to-slate-900 p-8 text-white shadow-2xl lg:p-12">
                <div className="pointer-events-none absolute right-0 top-0 h-full w-1/2 opacity-25">
                  <div className="h-full w-full bg-[radial-gradient(circle_at_top_right,_rgba(16,185,129,0.4),_transparent_70%)]" />
                </div>

                <div className="relative space-y-6">
                  <div className="flex flex-wrap items-center justify-between gap-4 border-b border-white/10 pb-6">
                    <div className="flex items-center gap-3">
                      <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                        <Target className="h-6 w-6" />
                      </div>
                      <div>
                        <p className="text-xs font-bold uppercase tracking-[0.25em] text-emerald-400">
                          Visi Resmi Kankemenag Barut
                        </p>
                        <h2 className="text-xl font-black text-white sm:text-2xl">
                          Kantor Kementerian Agama Kabupaten Barito Utara
                        </h2>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="rounded-full bg-emerald-500/20 px-3 py-1 text-xs font-extrabold text-emerald-300 border border-emerald-500/30">
                        Indonesia Emas 2045
                      </span>
                    </div>
                  </div>

                  <blockquote className="py-2">
                    <p className="text-2xl font-black leading-snug tracking-tight text-emerald-100 sm:text-3xl lg:text-4xl">
                      &ldquo;{OFFICIAL_VISION}&rdquo;
                    </p>
                  </blockquote>

                  <div className="flex flex-wrap items-center gap-2.5 pt-2">
                    <span className="inline-flex items-center gap-1.5 rounded-xl bg-white/10 px-3.5 py-1.5 text-xs font-semibold text-emerald-200 backdrop-blur-md">
                      <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" />
                      Masyarakat Rukun &amp; Toleran
                    </span>
                    <span className="inline-flex items-center gap-1.5 rounded-xl bg-white/10 px-3.5 py-1.5 text-xs font-semibold text-emerald-200 backdrop-blur-md">
                      <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" />
                      Berorientasi Kemaslahatan
                    </span>
                    <span className="inline-flex items-center gap-1.5 rounded-xl bg-white/10 px-3.5 py-1.5 text-xs font-semibold text-emerald-200 backdrop-blur-md">
                      <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" />
                      SDM Cerdas &amp; Berdaya Saing
                    </span>
                  </div>
                </div>
              </div>

              <div className="space-y-6">
                <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <div className="inline-flex items-center gap-2 rounded-full border border-emerald-300/60 bg-emerald-100/80 px-3.5 py-1 text-xs font-bold uppercase tracking-wider text-emerald-800 dark:border-emerald-800/50 dark:bg-emerald-950/40 dark:text-emerald-300">
                      <Compass className="h-3.5 w-3.5" />
                      <span>Langkah Strategis Pelayanan</span>
                    </div>
                    <h2 className="mt-2 text-2xl font-black text-slate-900 dark:text-slate-100 sm:text-3xl">
                      3 Misi Utama Pembangunan
                    </h2>
                  </div>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Amanah pelaksanaan tugas pokok &amp; fungsi Kankemenag Barito Utara.
                  </p>
                </div>

                <div className="grid gap-6 md:grid-cols-3">
                  {OFFICIAL_MISSIONS.map((misi) => {
                    const IconComponent = misi.icon;
                    return (
                      <div
                        key={misi.number}
                        className="group relative flex flex-col justify-between rounded-3xl border border-slate-200/80 bg-white p-7 shadow-md transition-all duration-300 hover:-translate-y-1.5 hover:border-emerald-500/40 hover:shadow-2xl dark:border-slate-800 dark:bg-slate-900"
                      >
                        <div className="space-y-5">
                          <div className="flex items-center justify-between">
                            <div className={`flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br ${misi.color} text-white shadow-md`}>
                              <IconComponent className="h-6 w-6" />
                            </div>
                            <span className={`rounded-full px-3 py-1 text-xs font-black ${misi.badgeColor}`}>
                              Misi {misi.number}
                            </span>
                          </div>

                          <div>
                            <h3 className="text-lg font-black text-slate-900 group-hover:text-emerald-700 dark:text-slate-100 dark:group-hover:text-emerald-400 sm:text-xl">
                              {misi.title}
                            </h3>

                            <p className="mt-3 text-sm font-bold leading-relaxed text-slate-800 dark:text-slate-200">
                              {misi.description}
                            </p>

                            <p className="mt-3 text-xs leading-relaxed text-slate-600 dark:text-slate-400">
                              {misi.details}
                            </p>
                          </div>
                        </div>

                        <div className="mt-6 border-t border-slate-100 pt-4 dark:border-slate-800">
                          <span className="text-[11px] font-extrabold uppercase tracking-wider text-emerald-700 dark:text-emerald-400">
                            Prioritas Kankemenag Barut
                          </span>
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
                      <Award className="h-7 w-7" />
                    </div>
                    <div>
                      <div className="inline-flex items-center gap-2 rounded-full bg-emerald-100 px-3 py-0.5 text-[11px] font-bold text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300">
                        <Sparkles className="h-3.5 w-3.5" />
                        <span>Komitmen Pelayanan Publik</span>
                      </div>
                      <h3 className="mt-2 text-xl font-black text-slate-900 dark:text-slate-100 sm:text-2xl">
                        Melayani Umat dengan Semangat HAPAKAT
                      </h3>
                      <p className="mt-1.5 max-w-3xl text-xs leading-relaxed text-slate-600 dark:text-slate-400 sm:text-sm">
                        Penerapan Visi dan Misi diselaraskan dengan motto pelayanan HAPAKAT (Harmonis, Amanah, Profesional, Akuntabel, Kreatif, Adil, Transparan) guna menghadirkan pelayanan keagamaan yang terpercaya.
                      </p>
                    </div>
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
