"use client";

import Providers from "@/components/layout/Providers";
import Header from "@/components/layout/Header/Header";
import Footer from "@/components/layout/Footer/Footer";
import PageBanner from "@/components/common/PageBanner";
import {
  Sparkles,
  HeartHandshake,
  ShieldCheck,
  Award,
  Scale,
  CheckCircle2,
  Zap,
  Check,
  Star,
  Users,
  Compass,
} from "lucide-react";

const MOTTO_ACRONYMS = [
  {
    letter: "H",
    word: "Harmonis",
    description:
      "Saling menghargai, menjaga kerukunan antarumat beragama, dan membangun sinergi yang selaras dalam setiap pelayanan.",
    icon: HeartHandshake,
    badgeColor: "bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300",
    gradientColor: "from-emerald-600 to-teal-600",
    borderColor: "border-emerald-500/30",
  },
  {
    letter: "A",
    word: "Amanah",
    description:
      "Memegang teguh kepercayaan publik, dapat diandalkan, serta menjalankan setiap tugas dan kewajiban dengan penuh integritas.",
    icon: ShieldCheck,
    badgeColor: "bg-blue-100 text-blue-800 dark:bg-blue-950/60 dark:text-blue-300",
    gradientColor: "from-blue-600 to-cyan-600",
    borderColor: "border-blue-500/30",
  },
  {
    letter: "P",
    word: "Profesional",
    description:
      "Bekerja secara tuntas, kompeten, menguasai bidang tugas, serta memberikan mutu pelayanan terbaik sesuai standar pelayanan.",
    icon: Award,
    badgeColor: "bg-indigo-100 text-indigo-800 dark:bg-indigo-950/60 dark:text-indigo-300",
    gradientColor: "from-indigo-600 to-violet-600",
    borderColor: "border-indigo-500/30",
  },
  {
    letter: "A",
    word: "Akuntabel",
    description:
      "Setiap proses, tindakan, dan keputusan dapat dipertanggungjawabkan secara terbuka, tepat, dan sesuai dengan ketentuan hukum.",
    icon: Scale,
    badgeColor: "bg-purple-100 text-purple-800 dark:bg-purple-950/60 dark:text-purple-300",
    gradientColor: "from-purple-600 to-pink-600",
    borderColor: "border-purple-500/30",
  },
  {
    letter: "K",
    word: "Kreatif",
    description:
      "Terus berinovasi, memanfaatkan teknologi digital (seperti PTSP SI ATAK & E-Services), serta proaktif dalam mencari solusi layanan terbaik.",
    icon: Zap,
    badgeColor: "bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300",
    gradientColor: "from-amber-500 to-orange-600",
    borderColor: "border-amber-500/30",
  },
  {
    letter: "A",
    word: "Adil",
    description:
      "Memberikan pelayanan kepada seluruh lapisan masyarakat tanpa diskriminasi, tidak membeda-bedakan latar belakang, serta menjunjung kesetaraan.",
    icon: Users,
    badgeColor: "bg-rose-100 text-rose-800 dark:bg-rose-950/60 dark:text-rose-300",
    gradientColor: "from-rose-600 to-red-600",
    borderColor: "border-rose-500/30",
  },
  {
    letter: "T",
    word: "Transparan",
    description:
      "Memberikan informasi publik yang jelas, terbuka, mudah diakses, dan tidak menutup-nutupi prosedur serta kepastian biaya/waktu layanan.",
    icon: CheckCircle2,
    badgeColor: "bg-teal-100 text-teal-800 dark:bg-teal-950/60 dark:text-teal-300",
    gradientColor: "from-teal-600 to-emerald-600",
    borderColor: "border-teal-500/30",
  },
];

export default function MottoShell() {
  return (
    <Providers>
      <Header />
      <main id="konten-utama" className="min-h-screen pt-24 sm:pt-28 md:pt-32 lg:pt-36 xl:pt-40">
        <PageBanner
          title="Motto Layanan (HAPAKAT)"
          description="Motto pelayanan resmi Kantor Kementerian Agama Kabupaten Barito Utara yang berlandaskan semangat kebersamaan dan kualitas prima."
          breadcrumb={[
            { label: "Beranda", href: "/beranda" },
            { label: "Profil", href: "/profil/sejarah" },
            { label: "Motto Layanan" },
          ]}
        />

        <main className="min-h-screen bg-slate-50 transition-colors dark:bg-slate-950">
          <section className="relative w-full px-6 py-8 sm:px-10 sm:py-12 lg:px-16 xl:px-20">
            <div className="w-full space-y-10 sm:space-y-12">
              <div className="rounded-3xl border border-slate-200/80 bg-white p-6 shadow-md dark:border-slate-800 dark:bg-slate-900 sm:p-8">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                  <div className="flex items-center gap-3">
                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-400">
                      <Sparkles className="h-6 w-6" />
                    </div>
                    <div>
                      <p className="text-xs font-bold uppercase tracking-widest text-emerald-700 dark:text-emerald-400">
                        Semboyan &amp; Motto Utama
                      </p>
                      <h2 className="text-2xl font-black text-slate-900 dark:text-slate-100 sm:text-3xl">
                        &quot;HAPAKAT&quot;
                      </h2>
                    </div>
                  </div>

                  <span className="inline-flex items-center gap-2 rounded-full border border-emerald-300/60 bg-emerald-100/80 px-3.5 py-1.5 text-xs font-bold text-emerald-800 dark:border-emerald-800/50 dark:bg-emerald-950/40 dark:text-emerald-300">
                    <Star className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                    <span>Motto Layanan Resmi</span>
                  </span>
                </div>

                <p className="mt-4 text-sm font-extrabold text-emerald-700 dark:text-emerald-400 sm:text-base">
                  Harmonis • Amanah • Profesional • Akuntabel • Kreatif • Adil • Transparan
                </p>

                <p className="mt-3 text-xs leading-relaxed text-slate-600 dark:text-slate-400 sm:text-sm">
                  Kata <span className="font-extrabold text-slate-900 dark:text-slate-100">&quot;HAPAKAT&quot;</span> berakar dari kearifan lokal Barito Utara (Bahasa Dayak Teweh/Bakumpai) yang memiliki arti <span className="font-extrabold text-emerald-700 dark:text-emerald-400">&quot;Mufakat / Bersama-sama&quot;</span>. Nilai ini menjadi pedoman seluruh jajaran ASN Kantor Kementerian Agama Kabupaten Barito Utara dalam menghadirkan pelayanan publik yang berintegritas, ramah, dan solutif bagi seluruh masyarakat.
                </p>
              </div>

              <div className="space-y-6">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-400">
                    <Compass className="h-5 w-5" />
                  </div>
                  <div>
                    <h2 className="text-xl font-black text-slate-900 dark:text-slate-100 sm:text-2xl">
                      Makna &amp; Nilai Turunan HAPAKAT
                    </h2>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      7 Prinsip utama dalam setiap gerak dan layanan aparatur Kementerian Agama
                    </p>
                  </div>
                </div>

                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                  {MOTTO_ACRONYMS.map((item, idx) => {
                    const IconComp = item.icon;
                    return (
                      <div
                        key={idx}
                        className="group relative flex flex-col justify-between overflow-hidden rounded-3xl border border-slate-200/80 bg-white p-6 shadow-md transition-all duration-300 hover:-translate-y-1 hover:border-emerald-500/40 hover:shadow-xl dark:border-slate-800 dark:bg-slate-900"
                      >
                        <div className="space-y-4">
                          <div className="flex items-center justify-between">
                            <div className={`flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br ${item.gradientColor} text-white font-black text-xl shadow-md`}>
                              {item.letter}
                            </div>
                            <div className={`flex h-10 w-10 items-center justify-center rounded-xl ${item.badgeColor}`}>
                              <IconComp className="h-5 w-5" />
                            </div>
                          </div>

                          <div>
                            <h3 className="text-xl font-black text-slate-900 group-hover:text-emerald-700 dark:text-slate-100 dark:group-hover:text-emerald-400">
                              {item.word}
                            </h3>
                            <p className="mt-2 text-xs leading-relaxed text-slate-600 dark:text-slate-300 sm:text-sm">
                              {item.description}
                            </p>
                          </div>
                        </div>

                        <div className="mt-5 border-t border-slate-100 pt-3 dark:border-slate-800">
                          <div className="flex items-center gap-1.5 text-[11px] font-bold text-emerald-600 dark:text-emerald-400">
                            <Check className="h-3.5 w-3.5" />
                            <span>Prinsip Utama Layanan</span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="rounded-3xl bg-slate-900 p-6 text-white shadow-xl dark:bg-slate-900/90 sm:p-8">
                <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
                  <div className="flex items-start gap-4">
                    <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-500 text-white shadow-lg">
                      <Star className="h-7 w-7" />
                    </div>
                    <div>
                      <p className="text-xs font-bold uppercase tracking-[0.25em] text-emerald-400">
                        Pelayanan Sepenuh Hati
                      </p>
                      <h3 className="mt-1 text-xl font-black sm:text-2xl">
                        Bersama HAPAKAT Mewujudkan Kemenag Barito Utara Yang Unggul
                      </h3>
                      <p className="mt-1.5 max-w-3xl text-xs leading-relaxed text-slate-300 dark:text-slate-400 sm:text-sm">
                        Kami berkomitmen memberikan pelayanan terbaik tanpa pungli, transparan, serta cepat demi kepuasan dan kemaslahatan seluruh masyarakat Kabupaten Barito Utara.
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
