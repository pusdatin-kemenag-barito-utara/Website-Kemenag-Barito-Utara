"use client";

import Providers from "@/components/layout/Providers";
import Header from "@/components/layout/Header/Header";
import Footer from "@/components/layout/Footer/Footer";
import PageBanner from "@/components/common/PageBanner";
import {
  History,
  Landmark,
  Building2,
  Calendar,
  Sparkles,
  ShieldCheck,
  Award,
  CheckCircle2,
  HeartHandshake,
  MapPin,
} from "lucide-react";

const SEJARAH_TIMELINE = [
  {
    year: "3 Januari 1946",
    period: "Pondasi Nasional",
    title: "Berdirinya Kementerian Agama Republik Indonesia",
    description:
      "Kementerian Agama RI resmi berdiri pada 3 Januari 1946 berdasarkan Penetapan Pemerintah No. 2/SD Tahun 1946 yang diumumkan oleh Presiden Soekarno. Peristiwa ini diperingati setiap tahun sebagai Hari Amal Bhakti (HAB) Kemenag RI.",
    icon: Landmark,
    badgeColor:
      "bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300",
  },
  {
    year: "Tahun 1959 - 1960",
    period: "Pembentukan Daerah & Kantor Perwakilan",
    title: "Perintisan Kantor Pengawasan Agama Kabupaten Barito Utara",
    description:
      "Seiring dibentuknya Kabupaten Barito Utara berdasarkan UU No. 27 Tahun 1959 dengan ibu kota di Muara Teweh, Perwakilan Departemen Agama (Kantor Pengawasan Agama Dati II Barito Utara) mulai beroperasi untuk mengayomi urusan keagamaan masyarakat di sepanjang aliran Sungai Barito.",
    icon: Building2,
    badgeColor:
      "bg-teal-100 text-teal-800 dark:bg-teal-950/60 dark:text-teal-300",
  },
  {
    year: "Tahun 1974",
    period: "Penguatan Kelembagaan KUA",
    title: "Penerapan UU Perkawinan & Pemantapan Kantor Urusan Agama (KUA)",
    description:
      "Disahkannya UU No. 1 Tahun 1974 tentang Perkawinan memperkuat peran instansi dalam melayani pencatatan nikah, rujuk, pembinaan keluarga sakinah, serta tata kelola Kantor Urusan Agama (KUA) kecamatan di Barito Utara.",
    icon: ShieldCheck,
    badgeColor:
      "bg-blue-100 text-blue-800 dark:bg-blue-950/60 dark:text-blue-300",
  },
  {
    year: "Tahun 2002",
    period: "Pemekaran Wilayah",
    title: "Penataan Wilayah Kerja Pemekaran Barito Utara & Murung Raya",
    description:
      "Pasca pemekaran Kabupaten Murung Raya dari Kabupaten Barito Utara berdasarkan UU No. 5 Tahun 2002, Kantor Departemen Agama Barito Utara menata kembali wilayah kerja keagamaan, memperkuat jaringan KUA di 9 kecamatan, serta membina madrasah dan pondok pesantren.",
    icon: MapPin,
    badgeColor:
      "bg-indigo-100 text-indigo-800 dark:bg-indigo-950/60 dark:text-indigo-300",
  },
  {
    year: "Tahun 2009 - 2010",
    period: "Nomenklatur Baru",
    title: "Transformasi Menjadi Kantor Kementerian Agama Kab. Barito Utara",
    description:
      "Berdasarkan Peraturan Presiden No. 47 Tahun 2009 dan PMA No. 1 Tahun 2010, nomenklatur Kantor Departemen Agama resmi bertransformasi menjadi Kantor Kementerian Agama Kabupaten Barito Utara (Kankemenag Barito Utara).",
    icon: Award,
    badgeColor:
      "bg-purple-100 text-purple-800 dark:bg-purple-950/60 dark:text-purple-300",
  },
  {
    year: "Tahun 2024 - Sekarang",
    period: "Era Transformasi Digital & ZI",
    title: "Inovasi PTSP SI ATAK & Pembangunan Zona Integritas WBK/WBBM",
    description:
      "Kankemenag Barito Utara memasuki era modern dengan integrasi layanan publik terpadu satu pintu (PTSP SI ATAK), penerbitan motto pelayanan HAPAKAT (Harmonis, Amanah, Profesional, Akuntabel, Kreatif, Adil, Transparan), penerapan etika 5S, dan komitmen penuh Pembangunan Zona Integritas menuju WBK/WBBM.",
    icon: Sparkles,
    badgeColor:
      "bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300",
  },
];

export default function SejarahShell() {
  return (
    <Providers>
      <Header />
      <main id="konten-utama" className="min-h-screen pt-24 sm:pt-28 md:pt-32 lg:pt-36 xl:pt-40">
        <PageBanner
          title="Sejarah Instansi"
          description="Jejak langkah dan sejarah pengabdian Kantor Kementerian Agama Kabupaten Barito Utara dalam membimbing kehidupan beragama, pendidikan keagamaan, dan pelayanan masyarakat."
          breadcrumb={[
            { label: "Beranda", href: "/beranda" },
            { label: "Profil", href: "/profil/sejarah" },
            { label: "Sejarah" },
          ]}
        />

        <main className="min-h-screen bg-slate-50 transition-colors dark:bg-slate-950">
          <section className="relative w-full px-6 py-8 sm:px-10 sm:py-12 lg:px-16 xl:px-20">
            <div className="w-full space-y-10 sm:space-y-12">
              <div className="rounded-3xl border border-slate-200/80 bg-white p-6 shadow-md dark:border-slate-800 dark:bg-slate-900 sm:p-8">
                <div className="grid gap-8 lg:grid-cols-12 lg:items-center">
                  <div className="lg:col-span-7 space-y-4">
                    <div className="inline-flex items-center gap-2 rounded-full border border-emerald-300/60 bg-emerald-100/80 px-3.5 py-1 text-xs font-bold uppercase tracking-wider text-emerald-800 dark:border-emerald-800/50 dark:bg-emerald-950/40 dark:text-emerald-300">
                      <History className="h-3.5 w-3.5" />
                      <span>Jejak Pengabdian Kemenag Barut</span>
                    </div>
                    <h2 className="text-2xl font-black text-slate-900 dark:text-slate-100 sm:text-3xl lg:text-4xl">
                      Tumbuh Bersama Masyarakat Kabupaten Barito Utara
                    </h2>
                    <p className="text-xs leading-relaxed text-slate-600 dark:text-slate-300 sm:text-sm">
                      Kantor Kementerian Agama Kabupaten Barito Utara merupakan
                      instansi vertikal Kementerian Agama Republik Indonesia yang
                      berkedudukan di kota Muara Teweh, Kabupaten Barito Utara,
                      Provinsi Kalimantan Tengah.
                    </p>
                    <p className="text-xs leading-relaxed text-slate-600 dark:text-slate-300 sm:text-sm">
                      Sejak awal pembentukannya seiring dengan berdirinya Kabupaten
                      Barito Utara pada tahun 1959, Kankemenag Barito Utara terus
                      berkomitmen menjalankan fungsi pemerintahan di bidang agama:
                      membina kerukunan umat beragama, meningkatkan kualitas
                      pendidikan keagamaan (Madrasah &amp; Pesantren), mengelola
                      pelayanan nikah rujuk di KUA, penyelenggaraan haji umrah,
                      serta akuntabilitas zakat wakaf.
                    </p>
                  </div>

                  <div className="lg:col-span-5 relative overflow-hidden rounded-3xl border border-slate-200 bg-slate-100 shadow-md dark:border-slate-800 dark:bg-slate-800 aspect-[4/3]">
                    <img
                      src="/assets/images/kantor-kemenag.jpg"
                      alt="Kantor Kementerian Agama Kabupaten Barito Utara"
                      className="h-full w-full object-cover transition-transform duration-500 hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-slate-950/20 to-transparent flex flex-col justify-end p-5 text-white">
                      <p className="text-xs font-bold text-emerald-400">
                        Gedung Utama Kankemenag
                      </p>
                      <p className="text-sm font-black">
                        Jl. Ahmad Yani No. 126, Muara Teweh
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="space-y-6">
                <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <div className="inline-flex items-center gap-2 rounded-full border border-teal-300/60 bg-teal-100/80 px-3.5 py-1 text-xs font-bold uppercase tracking-wider text-teal-800 dark:border-teal-800/50 dark:bg-teal-950/40 dark:text-teal-300">
                      <Calendar className="h-3.5 w-3.5" />
                      <span>Kronologi Sejarah</span>
                    </div>
                    <h2 className="mt-2 text-2xl font-black text-slate-900 dark:text-slate-100 sm:text-3xl">
                      Tahapan Perkembangan dari Masa ke Masa
                    </h2>
                  </div>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Langkah perjalanan historis institusi dalam mengabdi bagi
                    negeri.
                  </p>
                </div>

                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                  {SEJARAH_TIMELINE.map((item, index) => {
                    const IconComponent = item.icon || History;
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
                            <span
                              className={`rounded-full px-3 py-1 text-[11px] font-bold ${item.badgeColor}`}
                            >
                              {item.year}
                            </span>
                          </div>

                          <div>
                            <p className="text-[11px] font-bold uppercase tracking-wider text-emerald-700 dark:text-emerald-400">
                              {item.period}
                            </p>
                            <h3 className="mt-1 text-lg font-black leading-snug text-slate-900 dark:text-slate-100 sm:text-xl">
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

              <div className="rounded-3xl bg-slate-900 p-6 text-white shadow-xl dark:bg-slate-900/90 sm:p-8">
                <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
                  <div className="flex items-start gap-4">
                    <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-500 text-white shadow-lg">
                      <HeartHandshake className="h-7 w-7" />
                    </div>
                    <div>
                      <p className="text-xs font-bold uppercase tracking-[0.25em] text-emerald-400">
                        Semangat Masa Kini &amp; Masa Depan
                      </p>
                      <h3 className="mt-2 text-xl font-black sm:text-2xl">
                        Melayani Umat Dengan Semangat HAPAKAT
                      </h3>
                      <p className="mt-1.5 max-w-3xl text-xs leading-relaxed text-slate-300 dark:text-slate-400 sm:text-sm">
                        Harmonis, Amanah, Profesional, Akuntabel, Kreatif, Adil, dan
                        Transparan. Bertekad memberikan pelayanan publik yang
                        semakin dekat, modern, dan membawa manfaat nyata bagi
                        seluruh masyarakat Kabupaten Barito Utara.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 shrink-0">
                    <span className="inline-flex items-center gap-2 rounded-2xl border border-white/20 bg-white/10 px-5 py-3 text-xs font-bold text-white backdrop-blur-md">
                      <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                      <span>Kemenag Berdampak</span>
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
