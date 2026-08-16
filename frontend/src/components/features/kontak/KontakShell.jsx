"use client";

import React, { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import Providers from "@/components/layout/Providers";
import Header from "@/components/layout/Header/Header";
import Footer from "@/components/layout/Footer/Footer";
import PageBanner from "@/components/common/PageBanner";
import { useSiteSettings } from "@/context/SettingsContext";
import {
  Eye,
  Download,
  ExternalLink,
  X,
  Sparkles,
  MapPin,
  Phone,
  Mail,
  MessageSquare,
  Building2,
  Clock,
  Navigation,
  HelpCircle,
  ChevronDown,
  Laptop,
  Globe,
} from "lucide-react";
import PdfViewerModal from "@/components/common/PdfViewerModal";

const FAQ_INOVASI = [
  {
    q: "Apa itu Layanan PTSP SI ATAK?",
    a: "PTSP SI ATAK adalah Pelayanan Terpadu Satu Pintu digital resmi Kankemenag Barito Utara untuk mengajukan izin, rekomendasi, dan dokumen keagamaan secara online cepat, transparan, dan tanpa pungli.",
    linkUrl: "https://ptsp.kemenag-baritoutara.com",
    linkLabel: "Buka Portal PTSP SI ATAK",
  },
  {
    q: "Bagaimana cara menyampaikan saran dan pengaduan melalui SI-GESIT?",
    a: "SI-GESIT adalah portal pengaduan & aspirasi publik khusus Kemenag Barut untuk menampung kritik, saran, serta evaluasi pelayanan dengan jaminan identitas pemohon terlindungi.",
    linkUrl: "https://pengaduan.kemenag-baritoutara.com",
    linkLabel: "Buka Portal SI-GESIT",
  },
  {
    q: "Apa fungsi dari aplikasi SiBetang (Sistem Arsip Digital)?",
    a: "SiBetang adalah inovasi pengelolaan arsip digital terintegrasi untuk menjamin keamanan, kerapian dokumen dinas, serta mempercepat pencarian data kearsipan di lingkungan kantor.",
    linkUrl: "https://arsip.kemenag-baritoutara.com",
    linkLabel: "Buka Aplikasi SiBetang",
  },
  {
    q: "Bagaimana cara pengurusan tata kelola persuratan melalui SiMandau?",
    a: "SiMandau merupakan sistem manajemen persuratan internal digital yang memudahkan disposisi, pencatatan surat masuk/keluar, dan pelacakan surat dinas secara real-time.",
    linkUrl: "https://surat.kemenag-baritoutara.com",
    linkLabel: "Buka Portal SiMandau",
  },
  {
    q: "Apa yang dimaksud dengan E-SOP Digital Kemenag Barut?",
    a: "E-SOP Digital menyediakan transparansi alur kerja, standar waktu, dan persyaratan legalitas untuk seluruh jenis pelayanan di lingkungan Kankemenag Kabupaten Barito Utara.",
    linkUrl: "https://sop.kemenag-baritoutara.com",
    linkLabel: "Buka Portal E-SOP Digital",
  },
  {
    q: "Bagaimana cara mengakses Pusat Layanan Inklusi?",
    a: "Pusat Layanan Inklusi dirancang khusus untuk memastikan masyarakat penyandang disabilitas mendapatkan aksesibilitas informasi, fasilitas ramah disabilitas, dan pendampingan layanan prima.",
    linkUrl: "https://inklusi.kemenag-baritoutara.com",
    linkLabel: "Buka Layanan Inklusi",
  },
  {
    q: "Di mana saya bisa mengisi Survei Kepuasan Masyarakat (SKM) & SI-ARUS?",
    a: "Masyarakat dapat memberikan masukan dan nilai kepuasan pelayanan melalui portal survei resmi SI-ARUS atau integrasi SKM Kemenpan RB untuk meningkatkan kualitas layanan birokrasi.",
    linkUrl: "https://survei.kemenag-baritoutara.com",
    linkLabel: "Buka Portal Survei SI-ARUS",
  },
  {
    q: "Apa peran Portal Pusdatin Kemenag Barito Utara?",
    a: "Pusdatin bertindak sebagai Pusat Data dan Informasi terpadu yang mengintegrasikan basis data keagamaan, kepegawaian, dan statistik resmi di wilayah Kabupaten Barito Utara.",
    linkUrl: "https://pusdatin.kemenag-baritoutara.com",
    linkLabel: "Buka Portal Pusdatin Data",
  },
  {
    q: "Bagaimana cara memanfaatkan Fitur Kalkulator Zakat & Waris?",
    a: "Fitur Kalkulator Zakat & Waris adalah fasilitas interaktif gratis untuk membantu masyarakat menghitung kewajiban zakat harta/profesi serta simulasi pembagian waris secara akurat.",
    linkUrl: "/layanan/kalkulator",
    linkLabel: "Gunakan Kalkulator Zakat & Waris",
  },
  {
    q: "Apakah seluruh pelayanan di Portal Inovasi Digital dipungut biaya?",
    a: "Tidak. Seluruh pelayanan publik dan inovasi sistem informasi digital di Kantor Kementerian Agama Kabupaten Barito Utara bersifat GRATIS (Rp 0,-) sebagai komitmen Zona Integritas (ZI) Menuju WBK/WBBM.",
    linkUrl: "/zona-integritas/standar-pelayanan",
    linkLabel: "Lihat Maklumat & Standar Layanan",
  },
];

const FAQ_WEBSITE = [
  {
    q: "Bagaimana cara mendengarkan bacaan artikel berita secara otomatis (TTS)?",
    a: "Setiap detail artikel berita dilengkapi dengan tombol pemutar suara Text-to-Speech (TTS) di bagian atas artikel. Anda dapat menekan tombol Play untuk mendengarkan isi berita dalam Bahasa Indonesia.",
    linkUrl: "/berita",
    linkLabel: "Jelajahi Berita Kemenag",
  },
  {
    q: "Bagaimana cara mengunduh atau mencetak dokumen berita resmi ke format PDF?",
    a: "Pada halaman detail berita, klik tombol 'Cetak PDF' di bagian Aksi Cepat Berita. Artikel akan otomatis terformat rapi lengkap dengan Kop Resmi Kemenag Barito Utara.",
    linkUrl: "/berita",
    linkLabel: "Lihat Opsi Cetak PDF Berita",
  },
  {
    q: "Di mana saya bisa melihat dokumen laporan seperti Renstra, RKT, dan Capaian Kinerja?",
    a: "Seluruh dokumen akuntabilitas dan laporan publik dapat diakses melalui menu Media Center -> Dokumen Laporan. Dokumen disediakan dalam format PDF interaktif.",
    linkUrl: "/laporan",
    linkLabel: "Buka Dokumen Laporan",
  },
  {
    q: "Bagaimana cara berpindah tampilan Bahasa (Indonesia / Inggris) pada website?",
    a: "Pengguna dapat mengganti bahasa tampilan melalui tombol pemilih bahasa (ID / EN) yang berada di bagian kanan atas bar navigasi header website.",
    linkUrl: "/",
    linkLabel: "Kembali ke Beranda",
  },
  {
    q: "Apakah website ini mendukung Tampilan Mode Gelap (Dark Mode)?",
    a: "Ya. Anda dapat memilih tema tampilan terang atau gelap melalui tombol ikon Matahari/Bulan di pojok kanan atas header sesuai kenyamanan visual Anda.",
    linkUrl: "/",
    linkLabel: "Coba Mode Gelap",
  },
  {
    q: "Bagaimana cara melakukan pencarian informasi atau berita tertentu secara cepat?",
    a: "Gunakan tombol ikon Kaca Pembesar (Search) pada navbar header. Ketik kata kunci berita, pengumuman, atau artikel yang ingin Anda cari secara praktis.",
    linkUrl: "/berita",
    linkLabel: "Gunakan Pencarian Berita",
  },
  {
    q: "Di mana saya bisa membaca profil struktur organisasi & jajaran pejabat Kemenag Barut?",
    a: "Profil lengkap, Visi Misi, Struktur Organisasi, serta Daftar Seksi dan Kepegawaian dapat dilihat pada sub-menu Profil di bagian navigasi utama.",
    linkUrl: "/profil/struktur-organisasi",
    linkLabel: "Lihat Struktur Organisasi",
  },
  {
    q: "Apakah website Kemenag Barito Utara dapat diakses secara optimal via Smartphone?",
    a: "Website ini telah dirancang penuh responsif (Mobile Friendly & PWA Ready) sehingga nyaman diakses di smartphone, tablet, maupun komputer desktop.",
    linkUrl: "/",
    linkLabel: "Buka Beranda",
  },
  {
    q: "Bagaimana cara memverifikasi keabsahan pengumuman dan berita resmi?",
    a: "Seluruh informasi dan berita yang diterbitkan pada domain baritoutara.kemenag.go.id dijamin resmi dari Humas Kankemenag Kabupaten Barito Utara.",
    linkUrl: "/berita",
    linkLabel: "Lihat Berita Terverifikasi",
  },
  {
    q: "Bagaimana jika menemukan kendala teknis atau eror saat mengakses website?",
    a: "Anda dapat menyampaikan laporan kendala teknis melalui email resmi baritoutara@kemenag.go.id atau melalui Layanan Chatbot AI Antigravity di pojok kanan bawah.",
    linkUrl: "/kontak",
    linkLabel: "Hubungi Tim Teknis",
  },
];

const WEEKDAYS = {
  Mon: "Senin",
  Tue: "Selasa",
  Wed: "Rabu",
  Thu: "Kamis",
  Fri: "Jum'at",
  Sat: "Sabtu",
  Sun: "Minggu",
};

const DEFAULT_OFFICE_HOURS = [
  "Senin - Kamis, 07.30 - 16.00 WIB",
  "Jum'at, 07.30 - 16.30 WIB",
];

function getOfficeScheduleByDay(weekday, siteInfo) {
  const dayKeyMap = {
    Mon: "senin",
    Tue: "selasa",
    Wed: "rabu",
    Thu: "kamis",
    Fri: "jumat",
  };

  const key = dayKeyMap[weekday];
  if (!key) return null; // Sabtu & Minggu libur

  // Check if custom hours exist in siteInfo
  let timeStr = "";
  if (siteInfo && typeof siteInfo === "object") {
    timeStr = siteInfo[`jam_layanan_${key}`] || "";
    if (!timeStr && Array.isArray(siteInfo.officeHours)) {
      if (weekday === "Fri") {
        timeStr = siteInfo.officeHours.find((h) => h.toLowerCase().includes("jum")) || "07.30 - 16.30";
      } else {
        timeStr = siteInfo.officeHours.find((h) => !h.toLowerCase().includes("jum")) || "07.30 - 16.00";
      }
    }
  }

  if (!timeStr) {
    timeStr = weekday === "Fri" ? "07.30 - 16.30" : "07.30 - 16.00";
  }

  const match = timeStr.match(/(\d{1,2})[:.](\d{2})\s*-\s*(\d{1,2})[:.](\d{2})/);
  if (!match) {
    return {
      openMinutes: 7 * 60 + 30,
      closeMinutes: weekday === "Fri" ? 16 * 60 + 30 : 16 * 60,
      nextOpenText: "07.30",
      closeText: weekday === "Fri" ? "16.30" : "16.00",
    };
  }

  const openH = parseInt(match[1], 10);
  const openM = parseInt(match[2], 10);
  const closeH = parseInt(match[3], 10);
  const closeM = parseInt(match[4], 10);

  return {
    openMinutes: openH * 60 + openM,
    closeMinutes: closeH * 60 + closeM,
    nextOpenText: `${String(openH).padStart(2, "0")}.${String(openM).padStart(2, "0")}`,
    closeText: `${String(closeH).padStart(2, "0")}.${String(closeM).padStart(2, "0")}`,
  };
}

function getNextOpeningDetail(weekday, siteInfo) {
  const dayOrder = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  const currentIndex = dayOrder.indexOf(weekday);

  for (let i = 1; i <= 7; i += 1) {
    const nextDay = dayOrder[(currentIndex + i) % 7];
    const nextSchedule = getOfficeScheduleByDay(nextDay, siteInfo);

    if (nextSchedule) {
      return `Layanan akan dibuka kembali ${WEEKDAYS[nextDay]} pukul ${nextSchedule.nextOpenText} WIB.`;
    }
  }

  return "Jadwal layanan sedang diperbarui.";
}

function getOfficeStatus(siteInfo) {
  const now = new Date();

  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: "Asia/Jakarta",
    weekday: "short",
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
  }).formatToParts(now);

  const weekday = parts.find((item) => item.type === "weekday")?.value || "Mon";
  const hour = Number(parts.find((item) => item.type === "hour")?.value || 0);
  const minute = Number(
    parts.find((item) => item.type === "minute")?.value || 0,
  );

  const currentMinutes = hour * 60 + minute;
  const schedule = getOfficeScheduleByDay(weekday, siteInfo);

  const isOpen =
    !!schedule &&
    currentMinutes >= schedule.openMinutes &&
    currentMinutes < schedule.closeMinutes;

  let detail = "";

  if (isOpen && schedule) {
    detail = `Layanan tatap muka sedang berjalan hingga pukul ${schedule.closeText} WIB.`;
  } else if (schedule && currentMinutes < schedule.openMinutes) {
    detail = `Layanan akan dibuka hari ini pukul ${schedule.nextOpenText} WIB.`;
  } else {
    detail = getNextOpeningDetail(weekday, siteInfo);
  }

  const timeString = `${String(hour).padStart(2, "0")}.${String(minute).padStart(2, "0")} WIB`;

  return {
    label: isOpen ? "Sedang Buka" : "Sedang Tutup",
    detail,
    nowText: `${WEEKDAYS[weekday]}, ${timeString}`,
    isOpen,
  };
}

export default function KontakShell({ initialSettings }) {
  return (
    <Providers initialSettings={initialSettings}>
      <KontakContent />
    </Providers>
  );
}

function KontakContent() {
  const { siteInfo, siteLinks } = useSiteSettings();
  const [officeStatus, setOfficeStatus] = useState(() => getOfficeStatus(siteInfo));
  const [isPdfModalOpen, setIsPdfModalOpen] = useState(false);
  const [activeFaqTab, setActiveFaqTab] = useState("website");
  const [openFaqIndex, setOpenFaqIndex] = useState(0);

  useEffect(() => {
    const updateStatus = () => setOfficeStatus(getOfficeStatus(siteInfo));

    updateStatus();
    const intervalId = setInterval(updateStatus, 60000);

    return () => clearInterval(intervalId);
  }, [siteInfo]);

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

  const pdfFile = {
    title: "SK Penetapan Jam Layanan Kantor",
    subtitle: "Keputusan Kepala Kantor Kemenag Kab. Barito Utara",
    fileUrl: "/assets/documents/sk-jam-layanan.pdf",
    fileSize: "PDF Resmi",
  };

  const officeHours =
    siteInfo.officeHours && siteInfo.officeHours.length > 0
      ? siteInfo.officeHours
      : DEFAULT_OFFICE_HOURS;

  const currentFaqList = activeFaqTab === "inovasi" ? FAQ_INOVASI : FAQ_WEBSITE;

  return (
    <div className="min-h-screen bg-slate-50 transition-colors dark:bg-slate-950">
      <Header />
      <main id="konten-utama" className="min-h-screen pt-24 sm:pt-28 md:pt-32 lg:pt-36 xl:pt-40">
        <PageBanner
          title="Kontak"
          description="Pilih kanal komunikasi yang paling sesuai, temukan lokasi kantor, dan hubungi instansi melalui jalur resmi yang tersedia."
          breadcrumb={[
            { label: "Beranda", href: "/beranda" },
            { label: "Kontak" },
          ]}
          eyebrow="Layanan Publik"
        />

        <main className="bg-slate-50 transition-colors dark:bg-slate-950">
          <div className="w-full px-6 pt-6 pb-6 sm:px-10 sm:pt-8 sm:pb-8 lg:px-16 xl:px-20">
            <div className="w-full">
              {/* 3 Cards Grid: Status Layanan, Kontak Utama, Peta Lokasi */}
              <div className="grid gap-6 grid-cols-1 lg:grid-cols-3 items-stretch">
                {/* Card 1: Status Layanan */}
                <div className="group relative flex flex-col justify-between rounded-3xl border border-slate-200/80 bg-white p-6 shadow-md transition-all duration-300 hover:border-emerald-500/40 hover:shadow-xl dark:border-slate-800 dark:bg-slate-900 sm:p-7">
                  <div>
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <div className="inline-flex items-center gap-2 rounded-full border border-emerald-300/60 bg-emerald-100/80 px-3 py-1 text-[11px] font-bold uppercase tracking-wider text-emerald-800 dark:border-emerald-800/50 dark:bg-emerald-950/40 dark:text-emerald-300">
                          <Clock className="h-3.5 w-3.5" />
                          <span>Status Layanan</span>
                        </div>
                        <h2 className="mt-3 text-2xl font-black text-slate-900 dark:text-slate-100">
                          {officeStatus.label}
                        </h2>
                      </div>

                      <span
                        className={`inline-flex items-center gap-2 rounded-full px-3.5 py-1.5 text-xs font-bold shadow-sm ${
                          officeStatus.isOpen
                            ? "border border-emerald-300/60 bg-emerald-100/90 text-emerald-800 dark:border-emerald-800/60 dark:bg-emerald-950/80 dark:text-emerald-300"
                            : "border border-amber-300/60 bg-amber-100/90 text-amber-800 dark:border-amber-800/60 dark:bg-amber-950/80 dark:text-amber-300"
                        }`}
                      >
                        <span className={`h-2.5 w-2.5 rounded-full ${officeStatus.isOpen ? "bg-emerald-500 animate-pulse" : "bg-amber-500"}`} />
                        <span>{officeStatus.isOpen ? "Online" : "Offline"}</span>
                      </span>
                    </div>

                    <p className="mt-3 text-xs leading-relaxed text-slate-600 dark:text-slate-400">
                      {officeStatus.detail}
                    </p>

                    <div className="mt-5 space-y-3 rounded-2xl border border-slate-100 bg-slate-50/80 p-4 transition-colors dark:border-slate-800/80 dark:bg-slate-800/50">
                      <div>
                        <p className="text-xs font-bold text-slate-900 dark:text-slate-100 uppercase tracking-wider">
                          Waktu kantor saat ini
                        </p>
                        <p className="mt-1 text-xs font-semibold text-emerald-700 dark:text-emerald-400">
                          {officeStatus.nowText}
                        </p>
                      </div>

                      <div className="border-t border-slate-200/60 pt-3 dark:border-slate-700/60">
                        <p className="text-xs font-bold text-slate-900 dark:text-slate-100 uppercase tracking-wider mb-1.5">
                          Jam layanan
                        </p>
                        <div className="space-y-1">
                          {officeHours.map((item, index) => (
                            <p
                              key={`${item}-${index}`}
                              className="text-xs font-semibold leading-relaxed text-slate-700 dark:text-slate-300"
                            >
                              {item}
                            </p>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Button Lampiran SK Jam Layanan */}
                  <div className="mt-6 border-t border-slate-100 pt-4 dark:border-slate-800">
                    <button
                      onClick={() => setIsPdfModalOpen(true)}
                      className="group/btn flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 px-4 py-3 text-xs font-bold text-white shadow-md transition-all duration-300 hover:from-emerald-500 hover:to-teal-500 hover:shadow-[0_8px_25px_rgba(16,185,129,0.35)] hover:-translate-y-0.5 active:scale-[0.98] dark:from-emerald-500 dark:to-teal-500 dark:hover:from-emerald-400 dark:hover:to-teal-400"
                    >
                      <Eye className="h-4 w-4 transition-transform duration-300 group-hover/btn:scale-110 group-hover/btn:rotate-6" />
                      <span>Lihat SK Jam Layanan (PDF)</span>
                    </button>
                  </div>
                </div>

                {/* Card 2: Kontak Utama */}
                <div className="group relative flex flex-col justify-between rounded-3xl border border-slate-200/80 bg-white p-6 shadow-md transition-all duration-300 hover:border-emerald-500/40 hover:shadow-xl dark:border-slate-800 dark:bg-slate-900 sm:p-7">
                  <div>
                    <div className="inline-flex items-center gap-2 rounded-full border border-blue-300/60 bg-blue-100/80 px-3 py-1 text-[11px] font-bold uppercase tracking-wider text-blue-800 dark:border-blue-800/50 dark:bg-blue-950/40 dark:text-blue-300">
                      <Building2 className="h-3.5 w-3.5" />
                      <span>Kontak Utama</span>
                    </div>

                    <h2 className="mt-3 text-xl font-black text-slate-900 dark:text-slate-100">
                      Informasi Kontak Resmi
                    </h2>

                    <div className="mt-5 space-y-3 text-xs">
                      <div className="flex items-start gap-2.5 rounded-2xl border border-slate-100 bg-slate-50/50 p-3 dark:border-slate-800/60 dark:bg-slate-800/40">
                        <Building2 className="h-4 w-4 shrink-0 text-emerald-600 dark:text-emerald-400 mt-0.5" />
                        <div>
                          <p className="font-bold text-slate-900 dark:text-slate-100">
                            Nama Instansi
                          </p>
                          <p className="mt-0.5 font-medium text-slate-600 dark:text-slate-400">
                            {siteInfo.name}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-start gap-2.5 rounded-2xl border border-slate-100 bg-slate-50/50 p-3 dark:border-slate-800/60 dark:bg-slate-800/40">
                        <MapPin className="h-4 w-4 shrink-0 text-emerald-600 dark:text-emerald-400 mt-0.5" />
                        <div>
                          <p className="font-bold text-slate-900 dark:text-slate-100">
                            Alamat
                          </p>
                          <p className="mt-0.5 leading-relaxed font-medium text-slate-600 dark:text-slate-400">
                            {siteInfo.address}
                          </p>
                        </div>
                      </div>

                      <div className="grid gap-2.5">
                        <a
                          href={siteLinks.whatsappHref}
                          target="_blank"
                          rel="noreferrer"
                          className="flex items-center gap-2.5 rounded-2xl border border-slate-100 bg-slate-50/50 p-3 transition-all hover:border-emerald-500/40 hover:bg-emerald-50/50 dark:border-slate-800/60 dark:bg-slate-800/40 dark:hover:border-emerald-400/40 dark:hover:bg-emerald-950/30"
                        >
                          <MessageSquare className="h-4 w-4 shrink-0 text-emerald-600 dark:text-emerald-400" />
                          <div className="min-w-0">
                            <p className="font-bold text-slate-900 dark:text-slate-100 text-[11px]">
                              WhatsApp
                            </p>
                            <p className="truncate font-semibold text-emerald-700 dark:text-emerald-400 text-xs">
                              {siteInfo.whatsapp}
                            </p>
                          </div>
                        </a>

                        <a
                          href={siteLinks.phoneHref}
                          className="flex items-center gap-2.5 rounded-2xl border border-slate-100 bg-slate-50/50 p-3 transition-all hover:border-emerald-500/40 hover:bg-emerald-50/50 dark:border-slate-800/60 dark:bg-slate-800/40 dark:hover:border-emerald-400/40 dark:hover:bg-emerald-950/30"
                        >
                          <Phone className="h-4 w-4 shrink-0 text-emerald-600 dark:text-emerald-400" />
                          <div className="min-w-0">
                            <p className="font-bold text-slate-900 dark:text-slate-100 text-[11px]">
                              Telepon
                            </p>
                            <p className="truncate font-semibold text-emerald-700 dark:text-emerald-400 text-xs">
                              {siteInfo.phone}
                            </p>
                          </div>
                        </a>
                      </div>

                      <a
                        href={siteLinks.emailHref}
                        className="flex items-center gap-2.5 rounded-2xl border border-slate-100 bg-slate-50/50 p-3 transition-all hover:border-emerald-500/40 hover:bg-emerald-50/50 dark:border-slate-800/60 dark:bg-slate-800/40 dark:hover:border-emerald-400/40 dark:hover:bg-emerald-950/30"
                      >
                        <Mail className="h-4 w-4 shrink-0 text-emerald-600 dark:text-emerald-400" />
                        <div className="min-w-0">
                          <p className="font-bold text-slate-900 dark:text-slate-100 text-[11px]">
                            Email
                          </p>
                          <p className="truncate font-semibold text-emerald-700 dark:text-emerald-400 text-xs">
                            {siteInfo.email}
                          </p>
                        </div>
                      </a>
                    </div>
                  </div>
                </div>

                {/* Card 3: Peta Lokasi Kantor */}
                <div className="group relative flex flex-col justify-between overflow-hidden rounded-3xl border border-slate-200/80 bg-white shadow-md transition-all duration-300 hover:border-emerald-500/40 hover:shadow-xl dark:border-slate-800 dark:bg-slate-900">
                  <div className="flex flex-col gap-2 border-b border-slate-100 p-5 dark:border-slate-800">
                    <div className="flex items-center justify-between">
                      <div className="inline-flex items-center gap-2 rounded-full border border-emerald-300/60 bg-emerald-100/80 px-3 py-1 text-[11px] font-bold uppercase tracking-wider text-emerald-800 dark:border-emerald-800/50 dark:bg-emerald-950/40 dark:text-emerald-300">
                        <MapPin className="h-3.5 w-3.5" />
                        <span>Lokasi Kantor</span>
                      </div>
                      <a
                        href={siteLinks.mapDirectionUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-600 px-3 py-1.5 text-[11px] font-bold text-white shadow-sm transition-all hover:bg-emerald-700 dark:bg-emerald-500 dark:hover:bg-emerald-600"
                      >
                        <Navigation className="h-3.5 w-3.5" />
                        <span>Arah</span>
                      </a>
                    </div>
                    <h2 className="mt-1 text-xl font-black text-slate-900 dark:text-slate-100">
                      Temukan kami di peta
                    </h2>
                  </div>

                  {/* Map iFrame */}
                  <div className="relative flex-1 min-h-[280px] w-full bg-slate-100 dark:bg-slate-950">
                    <iframe
                      src={siteLinks.mapEmbedUrl}
                      title="Temukan kami di peta"
                      className="h-full w-full border-0 min-h-[280px]"
                      loading="lazy"
                      allowFullScreen
                      referrerPolicy="no-referrer-when-downgrade"
                    />
                  </div>
                </div>
              </div>

              {/* Section FAQ (Pertanyaan Sering Diajukan) */}
              <div className="mt-12 rounded-3xl border border-slate-200/80 bg-white p-6 shadow-md dark:border-slate-800 dark:bg-slate-900 sm:p-8">
                <div className="flex flex-col gap-4 border-b border-slate-100 pb-5 dark:border-slate-800 sm:flex-row sm:items-center sm:justify-between">
                  <div className="flex items-center gap-3">
                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-400">
                      <HelpCircle className="h-6 w-6" />
                    </div>
                    <div>
                      <p className="text-xs font-bold uppercase tracking-widest text-emerald-700 dark:text-emerald-400">
                        Pusat Bantuan &amp; Informasi
                      </p>
                      <h2 className="text-2xl font-black text-slate-900 dark:text-slate-100 sm:text-3xl">
                        Pertanyaan Yang Sering Diajukan (FAQ)
                      </h2>
                    </div>
                  </div>

                  {/* Tab Switcher Kategori FAQ */}
                  <div className="inline-flex rounded-2xl border border-slate-200 bg-slate-100/80 p-1.5 dark:border-slate-800 dark:bg-slate-800/80">
                    <button
                      onClick={() => {
                        setActiveFaqTab("website");
                        setOpenFaqIndex(0);
                      }}
                      className={`flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-bold transition-all ${
                        activeFaqTab === "website"
                          ? "bg-emerald-600 text-white shadow-sm dark:bg-emerald-500"
                          : "text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white"
                      }`}
                    >
                      <Globe className="h-4 w-4" />
                      <span>Bantuan Website (10)</span>
                    </button>

                    <button
                      onClick={() => {
                        setActiveFaqTab("inovasi");
                        setOpenFaqIndex(0);
                      }}
                      className={`flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-bold transition-all ${
                        activeFaqTab === "inovasi"
                          ? "bg-emerald-600 text-white shadow-sm dark:bg-emerald-500"
                          : "text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white"
                      }`}
                    >
                      <Laptop className="h-4 w-4" />
                      <span>Portal &amp; Inovasi Digital (10)</span>
                    </button>
                  </div>
                </div>

                {/* Dynamic 2-Column FAQ Layout (5 Left, 5 Right) */}
                <div className="mt-6 grid gap-4 lg:grid-cols-2 items-start">
                  {[0, 1].map((col) => (
                    <div key={col} className="space-y-3">
                      {currentFaqList.slice(col * 5, col * 5 + 5).map((faq, idx) => {
                        const actualIdx = col * 5 + idx;
                        const isOpen = openFaqIndex === actualIdx;
                        return (
                          <div
                            key={actualIdx}
                            className="overflow-hidden rounded-2xl border border-slate-200/80 transition-all dark:border-slate-800"
                          >
                            <button
                              onClick={() => setOpenFaqIndex(isOpen ? null : actualIdx)}
                              className="flex w-full items-center justify-between gap-3 bg-slate-50/60 px-5 py-4 text-left transition hover:bg-emerald-50/50 dark:bg-slate-800/40 dark:hover:bg-slate-800/80"
                            >
                              <span className="text-sm font-bold text-slate-900 dark:text-slate-100">
                                {faq.q}
                              </span>
                              <ChevronDown
                                className={`h-5 w-5 shrink-0 text-slate-500 transition-transform duration-300 dark:text-slate-400 ${
                                  isOpen ? "rotate-180 text-emerald-600 dark:text-emerald-400" : ""
                                }`}
                              />
                            </button>

                            {isOpen && (
                              <div className="space-y-3 border-t border-slate-100 bg-white px-5 py-4 dark:border-slate-800 dark:bg-slate-900">
                                <p className="text-xs leading-relaxed text-slate-600 dark:text-slate-300 sm:text-sm">
                                  {faq.a}
                                </p>
                                {faq.linkUrl && (
                                  <div>
                                    <a
                                      href={faq.linkUrl}
                                      target={faq.linkUrl.startsWith("http") ? "_blank" : "_self"}
                                      rel="noopener noreferrer"
                                      className="inline-flex items-center gap-2 rounded-xl border border-emerald-600/30 bg-emerald-50 px-3.5 py-2 text-xs font-bold text-emerald-700 shadow-xs transition-all hover:border-emerald-600 hover:bg-emerald-600 hover:text-white dark:border-emerald-500/40 dark:bg-emerald-950/60 dark:text-emerald-300 dark:hover:bg-emerald-600 dark:hover:text-white"
                                    >
                                      <span>{faq.linkLabel || "Akses Tautan Sistem"}</span>
                                      <ExternalLink className="h-3.5 w-3.5 shrink-0" />
                                    </a>
                                  </div>
                                )}
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </main>
      </main>

      {/* Floating PDF.js Modal */}
      <PdfViewerModal
        isOpen={isPdfModalOpen}
        onClose={() => setIsPdfModalOpen(false)}
        fileUrl={pdfFile.fileUrl}
        title={pdfFile.title}
        subtitle={pdfFile.subtitle}
      />

      <Footer />
    </div>
  );
}