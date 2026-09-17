"use client";

import React, { useState, useEffect } from "react";
import Link from "@/components/common/NextLink";
import Image from "@/components/common/NextImage";
import { DesktopClockSection, MobileClockSection } from "./ClockSection";
import HeroBackground from "./HeroBackground";
import { useSiteSettings } from "@/context/SettingsContext";
import {
  Globe,
  FolderOpen,
  Lightbulb,
  Info,
  MessageSquareWarning,
  ShieldCheck,
  ClipboardList,
  Headset,
  ChevronRight,
  X,
  LogIn,
  UserPlus,
  FileSearch,
  Navigation,
  BookOpen,
  CalendarDays,
  Users,
  Archive,
  MailOpen,
  FileCheck,
  Database,
  Calculator,
  Newspaper,
  Image as ImageIcon,
  FileText,
  ClipboardCheck,
  LineChart,
  Map,
  PlaySquare,
  Megaphone,
  Siren,
} from "lucide-react";

const PTSP_MENUS = [
  {
    title: "Masuk PTSP Si ATAK",
    desc: "Portal login pemohon & petugas layanan administrasi",
    href: "https://ptsp.kemenag-baritoutara.com/",
    icon: <LogIn className="w-5 h-5 text-blue-600" strokeWidth={2} />,
    iconBg: "bg-blue-50 text-blue-600 border-blue-200/80",
    badge: "Utama",
  },
  {
    title: "Buat Akun Pemohon",
    desc: "Registrasi akun baru untuk pengajuan permohonan berkas",
    href: "https://ptsp.kemenag-baritoutara.com/login/pemohon",
    icon: <UserPlus className="w-5 h-5 text-emerald-600" strokeWidth={2} />,
    iconBg: "bg-emerald-50 text-emerald-600 border-emerald-200/80",
  },
  {
    title: "Katalog Layanan",
    desc: "Daftar persyaratan, SOP, dan standar operasional layanan",
    href: "https://ptsp.kemenag-baritoutara.com/layanan",
    icon: <FileSearch className="w-5 h-5 text-amber-600" strokeWidth={2} />,
    iconBg: "bg-amber-50 text-amber-600 border-amber-200/80",
  },
  {
    title: "Lacak Layanan",
    desc: "Pantau status & progres berkas permohonan real-time",
    href: "https://ptsp.kemenag-baritoutara.com/track",
    icon: <Navigation className="w-5 h-5 text-purple-600" strokeWidth={2} />,
    iconBg: "bg-purple-50 text-purple-600 border-purple-200/80",
    badge: "Realtime",
  },
  {
    title: "Buku Tamu Digital",
    desc: "Pencatatan kunjungan tatap muka terintegrasi",
    href: "https://ptsp.kemenag-baritoutara.com/buku-tamu",
    icon: <BookOpen className="w-5 h-5 text-rose-600" strokeWidth={2} />,
    iconBg: "bg-rose-50 text-rose-600 border-rose-200/80",
  },
  {
    title: "Janji Temu",
    desc: "Reservasi jadwal konsultasi bersama petugas PTSP",
    href: "https://ptsp.kemenag-baritoutara.com/janji-temu",
    icon: <CalendarDays className="w-5 h-5 text-teal-600" strokeWidth={2} />,
    iconBg: "bg-teal-50 text-teal-600 border-teal-200/80",
  },
];

const INOVASI_MENUS = [
  {
    title: "Pusat Layanan Inklusif",
    desc: "Aksesibilitas layanan ramah penyandang disabilitas",
    href: "https://inklusi.kemenag-baritoutara.com/",
    icon: <Users className="w-5 h-5 text-blue-600" strokeWidth={2} />,
    iconBg: "bg-blue-50 text-blue-600 border-blue-200/80",
  },
  {
    title: "Layanan PTSP Si ATAK",
    desc: "Pelayanan terpadu satu pintu serbaguna",
    href: "https://ptsp.kemenag-baritoutara.com/",
    icon: <FolderOpen className="w-5 h-5 text-emerald-600" strokeWidth={2} />,
    iconBg: "bg-emerald-50 text-emerald-600 border-emerald-200/80",
  },
  {
    title: "SI BETANG",
    desc: "Sistem digitalisasi pengelolaan arsip dinas",
    href: "https://arsip.kemenag-baritoutara.com/login",
    icon: <Archive className="w-5 h-5 text-amber-600" strokeWidth={2} />,
    iconBg: "bg-amber-50 text-amber-600 border-amber-200/80",
  },
  {
    title: "SI MANDAU",
    desc: "Manajemen tata kelola persuratan dinas",
    href: "https://surat.kemenag-baritoutara.com/login",
    icon: <MailOpen className="w-5 h-5 text-teal-600" strokeWidth={2} />,
    iconBg: "bg-teal-50 text-teal-600 border-teal-200/80",
  },
  {
    title: "E-SOP Digital",
    desc: "Dokumentasi standar operasional prosedur instansi",
    href: "https://sop.kemenag-baritoutara.com/",
    icon: <FileCheck className="w-5 h-5 text-cyan-600" strokeWidth={2} />,
    iconBg: "bg-cyan-50 text-cyan-600 border-cyan-200/80",
  },
  {
    title: "PUSDATIN",
    desc: "Pusat data informasi & statistik keagamaan",
    href: "https://pusdatin.kemenag-baritoutara.com/",
    icon: <Database className="w-5 h-5 text-purple-600" strokeWidth={2} />,
    iconBg: "bg-purple-50 text-purple-600 border-purple-200/80",
  },
  {
    title: "Kalkulator Zakat & Waris",
    desc: "Simulasi perhitungan zakat dan pembagian waris",
    href: "/layanan/kalkulator",
    icon: <Calculator className="w-5 h-5 text-rose-600" strokeWidth={2} />,
    iconBg: "bg-rose-50 text-rose-600 border-rose-200/80",
  },
];

const INFORMASI_MENUS = [
  {
    title: "Berita & Artikel",
    desc: "Kabar dan liputan kegiatan terkini instansi",
    href: "https://baritoutara.kemenag.go.id/berita",
    icon: <Newspaper className="w-5 h-5 text-amber-600" strokeWidth={2} />,
    iconBg: "bg-amber-50 text-amber-600 border-amber-200/80",
  },
  {
    title: "Galeri Foto",
    desc: "Dokumentasi visual rangkaian acara dan agenda",
    href: "https://baritoutara.kemenag.go.id/galeri",
    icon: <ImageIcon className="w-5 h-5 text-fuchsia-600" strokeWidth={2} />,
    iconBg: "bg-fuchsia-50 text-fuchsia-600 border-fuchsia-200/80",
  },
  {
    title: "Dokumen & Laporan",
    desc: "Transparansi laporan kinerja dan akuntabilitas dinas",
    href: "https://baritoutara.kemenag.go.id/laporan",
    icon: <FileText className="w-5 h-5 text-cyan-600" strokeWidth={2} />,
    iconBg: "bg-cyan-50 text-cyan-600 border-cyan-200/80",
  },
  {
    title: "Video YouTube",
    desc: "Tayangan multimedia dan edukasi keagamaan",
    href: "https://baritoutara.kemenag.go.id/video",
    icon: <PlaySquare className="w-5 h-5 text-rose-600" strokeWidth={2} />,
    iconBg: "bg-rose-50 text-rose-600 border-rose-200/80",
  },
];

const SURVEY_MENUS = [
  {
    title: "SKM KEMENPAN RB",
    desc: "Survei Kepuasan Masyarakat resmi nasional Kemenpan RB",
    href: "https://skm.go.id/share/instansi/a461fae7-6b20-40f2-b82d-238c5adf4c01/2",
    icon: <ClipboardCheck className="w-5 h-5 text-emerald-600" strokeWidth={2} />,
    iconBg: "bg-emerald-50 text-emerald-600 border-emerald-200/80",
    badge: "Nasional",
  },
  {
    title: "SI ARUS",
    desc: "Aplikasi survei internal kepuasan layanan daerah",
    href: "https://survei.kemenag-baritoutara.com",
    icon: <LineChart className="w-5 h-5 text-blue-600" strokeWidth={2} />,
    iconBg: "bg-blue-50 text-blue-600 border-blue-200/80",
  },
  {
    title: "SIPPN MENPAN",
    desc: "Sistem Informasi Pelayanan Publik Nasional",
    href: "https://sippn.menpan.go.id/",
    icon: <Globe className="w-5 h-5 text-cyan-600" strokeWidth={2} />,
    iconBg: "bg-cyan-50 text-cyan-600 border-cyan-200/80",
  },
];

const ZONA_MENUS = [
  {
    title: "Area Perubahan - ZI",
    desc: "6 pilar manajemen perubahan & penguatan akuntabilitas",
    href: "https://baritoutara.kemenag.go.id/zona-integritas/area-perubahan-zi",
    icon: <Map className="w-5 h-5 text-blue-600" strokeWidth={2} />,
    iconBg: "bg-blue-50 text-blue-600 border-blue-200/80",
  },
  {
    title: "Berita Zona Integritas",
    desc: "Kabar progres pembangunan ZI menuju WBK & WBBM",
    href: "https://baritoutara.kemenag.go.id/zona-integritas/berita-zona-integritas",
    icon: <Newspaper className="w-5 h-5 text-amber-600" strokeWidth={2} />,
    iconBg: "bg-amber-50 text-amber-600 border-amber-200/80",
  },
  {
    title: "Video Pembangunan - ZI",
    desc: "Dokumentasi visual komitmen integritas aparatur",
    href: "https://baritoutara.kemenag.go.id/zona-integritas/video-pembangunan-zi",
    icon: <PlaySquare className="w-5 h-5 text-rose-600" strokeWidth={2} />,
    iconBg: "bg-rose-50 text-rose-600 border-rose-200/80",
  },
];

const PENGADUAN_MENUS = [
  {
    title: "SI-GESIT",
    desc: "Gagasan, Evaluasi, Saran, Informasi dan Tanggapan langsung",
    href: "https://pengaduan.kemenag-baritoutara.com",
    icon: <MessageSquareWarning className="w-5 h-5 text-blue-600" strokeWidth={2} />,
    iconBg: "bg-blue-50 text-blue-600 border-blue-200/80",
  },
  {
    title: "SP4N-LAPOR!",
    desc: "Sistem Pengelolaan Pengaduan Pelayanan Publik Nasional",
    href: "https://www.lapor.go.id/",
    icon: <Megaphone className="w-5 h-5 text-rose-600" strokeWidth={2} />,
    iconBg: "bg-rose-50 text-rose-600 border-rose-200/80",
    badge: "Nasional",
  },
  {
    title: "Whistle Blower System",
    desc: "Sistem Pengaduan Pelanggaran Rahasia & Aman (WBS Kemenag)",
    href: "https://simdumas.kemenag.go.id/",
    icon: <Siren className="w-5 h-5 text-emerald-600" strokeWidth={2} />,
    iconBg: "bg-emerald-50 text-emerald-600 border-emerald-200/80",
  },
];

const PORTAL_LINKS = [
  {
    id: "website_utama",
    title: "Website Utama",
    description: "Informasi publik, berita, dan layanan keagamaan terlengkap.",
    href: "/beranda",
    icon: <Globe className="w-7 h-7" strokeWidth={1.5} />,
    primary: true,
  },
  {
    id: "ptsp",
    title: "Layanan PTSP Si ATAK",
    description:
      "Pusat Layanan Terpadu Satu Pintu untuk segala urusan administrasi.",
    href: "#",
    icon: <FolderOpen className="w-7 h-7" strokeWidth={1.5} />,
    iconBg: "bg-blue-50/90 text-blue-700 border-blue-200/80 group-hover:bg-blue-100 group-hover:border-blue-300",
  },
  {
    id: "inovasi",
    title: "Inovasi Kemenag",
    description:
      "Kumpulan aplikasi dan inovasi layanan digital Kemenag Barito Utara.",
    href: "#",
    icon: <Lightbulb className="w-7 h-7" strokeWidth={1.5} />,
    iconBg: "bg-amber-50/90 text-amber-700 border-amber-200/80 group-hover:bg-amber-100 group-hover:border-amber-300",
  },
  {
    id: "informasi",
    title: "Informasi Publik",
    description: "Kumpulan berita, galeri kegiatan, dan laporan instansi.",
    href: "#",
    icon: <Info className="w-7 h-7" strokeWidth={1.5} />,
    iconBg: "bg-fuchsia-50/90 text-fuchsia-700 border-fuchsia-200/80 group-hover:bg-fuchsia-100 group-hover:border-fuchsia-300",
  },
  {
    id: "pengaduan",
    title: "Layanan Pengaduan",
    description: "Saluran penyampaian pengaduan dan pelaporan masyarakat.",
    href: "#",
    icon: <MessageSquareWarning className="w-7 h-7" strokeWidth={1.5} />,
    iconBg: "bg-rose-50/90 text-rose-700 border-rose-200/80 group-hover:bg-rose-100 group-hover:border-rose-300",
  },
  {
    id: "survey",
    title: "Layanan Survey",
    description:
      "Bantu kami meningkatkan kualitas layanan dengan mengisi survey.",
    href: "#",
    icon: <ClipboardList className="w-7 h-7" strokeWidth={1.5} />,
    iconBg: "bg-purple-50/90 text-purple-700 border-purple-200/80 group-hover:bg-purple-100 group-hover:border-purple-300",
  },
  {
    id: "zona",
    title: "Zona Integritas",
    description:
      "Komitmen kami dalam mewujudkan birokrasi yang bersih dan melayani.",
    href: "#",
    icon: <ShieldCheck className="w-7 h-7" strokeWidth={1.5} />,
    iconBg: "bg-emerald-50/90 text-emerald-700 border-emerald-200/80 group-hover:bg-emerald-100 group-hover:border-emerald-300",
  },
  {
    id: "kontak",
    title: "Kontak Kami",
    description: "Hubungi kami untuk informasi lebih lanjut dan bantuan.",
    href: "/kontak",
    icon: <Headset className="w-7 h-7" strokeWidth={1.5} />,
    iconBg: "bg-teal-50/90 text-teal-700 border-teal-200/80 group-hover:bg-teal-100 group-hover:border-teal-300",
  },
];

export default function PortalPage({ initialData }) {
  const [isStandalone, setIsStandalone] = useState(false);
  const [portalData, setPortalData] = useState(initialData || null);
  const [portalError, setPortalError] = useState(false);
  const [portalLoading, setPortalLoading] = useState(!initialData);
  const [isPtspModalOpen, setIsPtspModalOpen] = useState(false);
  const [isInovasiModalOpen, setIsInovasiModalOpen] = useState(false);
  const [isInformasiModalOpen, setIsInformasiModalOpen] = useState(false);
  const [isSurveyModalOpen, setIsSurveyModalOpen] = useState(false);
  const [isZonaModalOpen, setIsZonaModalOpen] = useState(false);
  const [isPengaduanModalOpen, setIsPengaduanModalOpen] = useState(false);
  const { siteInfo } = useSiteSettings();

  useEffect(() => {
    if (initialData) return;
    fetch("/api/portal")
      .then((res) => res.json())
      .then((data) => {
        if (data?.beritaCount !== undefined) setPortalData(data);
        else setPortalError(true);
      })
      .catch(() => {
        setPortalError(true);
      })
      .finally(() => setPortalLoading(false));
  }, [initialData]);

  useEffect(() => {
    const detectPwa = () => {
      if (typeof window !== "undefined") {
        const isPwa =
          window.matchMedia("(display-mode: standalone)").matches ||
          window.navigator.standalone ||
          document.referrer.includes("android-app://");
        setIsStandalone(isPwa);
      }
    };

    const frame = requestAnimationFrame(() => {
      detectPwa();
    });

    return () => {
      cancelAnimationFrame(frame);
    };
  }, []);

  const isAntiCopas = Boolean(
    siteInfo?.fitur_anti_copas ??
      initialData?.fitur_anti_copas ??
      initialData?.settings?.fitur_anti_copas
  );

  useEffect(() => {
    if (!isAntiCopas) return;

    const handleContextMenu = (e) => {
      const tag = e.target?.tagName?.toLowerCase();
      if (tag === "input" || tag === "textarea" || e.target?.isContentEditable) return;
      e.preventDefault();
      e.stopPropagation();
      return false;
    };

    const handleCopy = (e) => {
      const tag = e.target?.tagName?.toLowerCase();
      if (tag === "input" || tag === "textarea") return;
      e.preventDefault();
      e.stopPropagation();
      return false;
    };

    const handleDragStart = (e) => {
      e.preventDefault();
      e.stopPropagation();
      return false;
    };

    const handleKeyDown = (e) => {
      const isCtrlOrCmd = e.ctrlKey || e.metaKey;
      if (isCtrlOrCmd) {
        const k = e.key?.toLowerCase();
        if (
          k === "u" ||
          k === "s" ||
          (k === "c" && !["input", "textarea"].includes(e.target?.tagName?.toLowerCase()))
        ) {
          e.preventDefault();
          e.stopPropagation();
          return false;
        }
      }
    };

    window.addEventListener("contextmenu", handleContextMenu, { capture: true, passive: false });
    document.addEventListener("contextmenu", handleContextMenu, { capture: true, passive: false });
    window.addEventListener("copy", handleCopy, { capture: true, passive: false });
    document.addEventListener("copy", handleCopy, { capture: true, passive: false });
    window.addEventListener("cut", handleCopy, { capture: true, passive: false });
    document.addEventListener("cut", handleCopy, { capture: true, passive: false });
    window.addEventListener("dragstart", handleDragStart, { capture: true, passive: false });
    document.addEventListener("dragstart", handleDragStart, { capture: true, passive: false });
    window.addEventListener("keydown", handleKeyDown, { capture: true, passive: false });
    document.addEventListener("keydown", handleKeyDown, { capture: true, passive: false });

    return () => {
      window.removeEventListener("contextmenu", handleContextMenu, { capture: true });
      document.removeEventListener("contextmenu", handleContextMenu, { capture: true });
      window.removeEventListener("copy", handleCopy, { capture: true });
      document.removeEventListener("copy", handleCopy, { capture: true });
      window.removeEventListener("cut", handleCopy, { capture: true });
      document.removeEventListener("cut", handleCopy, { capture: true });
      window.removeEventListener("dragstart", handleDragStart, { capture: true });
      document.removeEventListener("dragstart", handleDragStart, { capture: true });
      window.removeEventListener("keydown", handleKeyDown, { capture: true });
      document.removeEventListener("keydown", handleKeyDown, { capture: true });
    };
  }, [isAntiCopas]);

  return (
    <div
      className={`relative min-h-screen flex flex-col bg-[#e7eeea] text-slate-800 selection:bg-emerald-700 selection:text-white overflow-x-hidden ${
        isAntiCopas ? "select-none" : ""
      }`}
      onContextMenu={(e) => {
        if (isAntiCopas) {
          e.preventDefault();
          e.stopPropagation();
        }
      }}
      onCopy={(e) => {
        if (isAntiCopas) {
          e.preventDefault();
          e.stopPropagation();
        }
      }}
      onDragStart={(e) => {
        if (isAntiCopas) {
          e.preventDefault();
          e.stopPropagation();
        }
      }}
    >
      <HeroBackground />
      {/* SHARED CENTERED WRAPPER */}
      <div className="flex-1 flex flex-col justify-start md:justify-center w-full relative z-10 pt-6 pb-4 md:py-8">
        {/* DESKTOP VERSION */}
        <div className="animate-fade-in hidden md:flex w-full px-6 lg:px-10 xl:px-16 flex-col">
          <div className="flex flex-col items-center justify-center">
            {/* Logo, Title & Right Image Section - Desktop */}
            <div
              className="animate-fade-in flex flex-row items-center justify-center w-full max-w-5xl gap-4 md:gap-8 mb-2 mx-auto"
              style={{ animationDelay: "0.1s" }}
            >
              {/* Left Logo */}
              <div className="w-20 h-20 md:w-24 md:h-24 relative transition-transform hover:scale-110 duration-500 shrink-0">
                <Image
                  src={siteInfo.logoSrc}
                  alt="Logo Kemenag"
                  width={96}
                  height={96}
                  className="w-full h-full object-contain drop-shadow-md"
                  priority
                />
              </div>

              {/* Title Section */}
              <div className="flex flex-col items-center text-center flex-1">
                <h1 className="flex flex-col items-center font-black uppercase tracking-tight leading-none px-2 text-center mb-4">
                  <span className="text-2xl lg:text-3xl text-[#064e3b] drop-shadow-xs">
                    {siteInfo.logoTitleLine1}
                  </span>
                  <span className="text-2xl lg:text-3xl text-[#064e3b] mt-1 drop-shadow-xs">
                    {siteInfo.logoTitleLine2}
                  </span>
                </h1>

                {/* Hapakat Logo & Text */}
                <div className="flex flex-col items-center mt-2">
                  <Image
                    src="/assets/branding/hapakat.webp"
                    alt="Hapakat"
                    width={180}
                    height={40}
                    className="object-contain drop-shadow-xs mb-3 h-8 lg:h-10 w-auto"
                    style={{ width: "auto" }}
                  />
                  <div className="text-[11px] lg:text-xs font-bold text-slate-700 tracking-wide text-center leading-relaxed">
                    <p>
                      <span className="text-emerald-700 font-extrabold text-[13px] lg:text-sm">
                        H
                      </span>
                      armonis,{" "}
                      <span className="text-emerald-700 font-extrabold text-[13px] lg:text-sm">
                        A
                      </span>
                      manah,{" "}
                      <span className="text-emerald-700 font-extrabold text-[13px] lg:text-sm">
                        P
                      </span>
                      rofesional,{" "}
                      <span className="text-emerald-700 font-extrabold text-[13px] lg:text-sm">
                        A
                      </span>
                      kuntabel,{" "}
                      <span className="text-emerald-700 font-extrabold text-[13px] lg:text-sm">
                        K
                      </span>
                      reatif,{" "}
                      <span className="text-emerald-700 font-extrabold text-[13px] lg:text-sm">
                        A
                      </span>
                      dil dan{" "}
                      <span className="text-emerald-700 font-extrabold text-[13px] lg:text-sm">
                        T
                      </span>
                      ransparan
                    </p>
                  </div>
                </div>
              </div>

              {/* Right Logo */}
              <div className="w-28 h-28 md:w-36 md:h-36 relative transition-transform hover:scale-110 duration-500 shrink-0">
                <Image
                  src="/assets/branding/atak-portal.webp"
                  alt="Portal Atak"
                  width={144}
                  height={144}
                  className="w-full h-full object-contain drop-shadow-md"
                  priority
                />
              </div>
            </div>

            {/* Status & Time Indicator - Desktop */}
            <DesktopClockSection />

            {/* Berita Ticker - Desktop */}
            {portalError ? (
              <div
                className="animate-fade-in w-full mt-1 overflow-hidden flex justify-center"
                style={{ animationDelay: "0.15s" }}
              >
                <span className="text-[10px] text-rose-600 font-medium bg-rose-50 px-3 py-1 rounded-full border border-rose-200">
                  Gagal memuat berita terbaru
                </span>
              </div>
            ) : (
              portalData?.latestBerita?.length > 0 && (
                <div
                  className="animate-fade-in w-full mt-1 overflow-hidden"
                  style={{ animationDelay: "0.15s" }}
                >
                    <div className="relative flex items-center gap-2.5 bg-white/95 backdrop-blur-md px-4 py-1.5 rounded-full border border-slate-300/80 shadow-xs">
                    <span className="shrink-0 text-[9px] font-black uppercase tracking-widest text-white bg-emerald-700 px-2.5 py-0.5 rounded-full leading-none flex items-center justify-center shadow-xs">
                      Terbaru
                    </span>
                    <div className="overflow-hidden relative flex-1 flex items-center self-stretch select-none group">
                      <div className="flex shrink-0 items-center gap-0 animate-marquee whitespace-nowrap">
                        {[...portalData.latestBerita, ...portalData.latestBerita].map((item, i) => (
                          <React.Fragment key={`d1-${item.slug}-${i}`}>
                            <Link
                              href={`/berita/${item.slug}`}
                              className="text-slate-700 text-[11px] font-semibold hover:text-emerald-800 transition-colors shrink-0 leading-none flex items-center h-full"
                            >
                              {item.title}
                            </Link>
                            <span className="mx-3 text-slate-300 flex items-center h-full leading-none">
                              |
                            </span>
                          </React.Fragment>
                        ))}
                      </div>
                      <div className="flex shrink-0 items-center gap-0 animate-marquee whitespace-nowrap" aria-hidden="true">
                        {[...portalData.latestBerita, ...portalData.latestBerita].map((item, i) => (
                          <React.Fragment key={`d2-${item.slug}-${i}`}>
                            <Link
                              href={`/berita/${item.slug}`}
                              tabIndex={-1}
                              className="text-slate-700 text-[11px] font-semibold hover:text-emerald-800 transition-colors shrink-0 leading-none flex items-center h-full"
                            >
                              {item.title}
                            </Link>
                            <span className="mx-3 text-slate-300 flex items-center h-full leading-none">
                              |
                            </span>
                          </React.Fragment>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              )
            )}

            {/* Portal Grid Section */}
            <div className="flex items-center justify-center w-full mt-2 py-2">
              <div className="grid grid-cols-4 gap-x-5 gap-y-3 w-full">
                {PORTAL_LINKS.map((link, idx) => (
                  <div
                    key={link.title}
                    className="animate-fade-in-up h-full"
                    style={{ animationDelay: `${0.2 + idx * 0.08}s` }}
                  >
                    <Link
                      href={link.href}
                      onClick={(e) => {
                        if (link.id === "ptsp") {
                          e.preventDefault();
                          setIsPtspModalOpen(true);
                        } else if (link.id === "inovasi") {
                          e.preventDefault();
                          setIsInovasiModalOpen(true);
                        } else if (link.id === "informasi") {
                          e.preventDefault();
                          setIsInformasiModalOpen(true);
                        } else if (link.id === "survey") {
                          e.preventDefault();
                          setIsSurveyModalOpen(true);
                        } else if (link.id === "zona") {
                          e.preventDefault();
                          setIsZonaModalOpen(true);
                        } else if (link.id === "pengaduan") {
                          e.preventDefault();
                          setIsPengaduanModalOpen(true);
                        }
                      }}
                      target={link.id === "website_utama" || link.href.startsWith("http") ? "_blank" : undefined}
                      rel={link.id === "website_utama" || link.href.startsWith("http") ? "noopener noreferrer" : undefined}
                      className={`group relative p-5 lg:p-6 rounded-[2rem] transition-all duration-500 flex flex-col items-start text-left h-full hover:-translate-y-1.5 overflow-hidden ${
                        link.primary
                          ? "bg-gradient-to-br from-emerald-700 via-emerald-800 to-teal-900 text-white border border-emerald-600/50 shadow-[0_8px_24px_rgba(6,78,59,0.18)] hover:shadow-[0_12px_28px_rgba(6,78,59,0.28)]"
                          : "bg-white/95 backdrop-blur-xl border border-slate-300/80 hover:border-emerald-500/60 shadow-[0_4px_20px_-4px_rgba(15,23,42,0.06)] hover:shadow-[0_12px_28px_-4px_rgba(15,23,42,0.1)] hover:bg-white"
                      }`}
                    >
                      {/* Subtly glowing background element */}
                      <div
                        className={`absolute top-0 right-0 w-32 h-32 blur-3xl -z-10 rounded-full transition-opacity duration-500 ${
                          link.primary ? "bg-emerald-400/20 group-hover:bg-emerald-400/30" : "bg-emerald-500/5 group-hover:bg-emerald-500/10"
                        }`}
                      />

                      <div
                        className={`w-14 h-14 rounded-2xl flex items-center justify-center mb-5 transition-all duration-500 group-hover:scale-110 group-hover:rotate-3 shrink-0 shadow-xs border ${
                          link.primary
                            ? "bg-white/20 text-white border-white/30"
                            : link.iconBg || "bg-slate-100/90 text-slate-700 border-slate-200/90"
                        }`}
                      >
                        {link.icon}
                      </div>
                      <div className="flex flex-col items-start relative z-10">
                        <h2
                          className={`text-[17px] lg:text-[19px] font-black mb-2 transition-colors line-clamp-1 tracking-wide ${
                            link.primary ? "text-white group-hover:text-emerald-100" : "text-slate-800 group-hover:text-emerald-800"
                          }`}
                        >
                          {link.title}
                        </h2>
                        <p
                          className={`text-sm leading-relaxed line-clamp-2 font-medium ${
                            link.primary ? "text-emerald-50" : "text-slate-600"
                          }`}
                        >
                          {link.description}
                        </p>
                      </div>

                      {/* Arrow Icon */}
                      <div className="flex mt-auto pt-6 w-full justify-end relative z-10">
                        <div
                          className={`w-9 h-9 rounded-full flex items-center justify-center transition-all duration-500 ${
                            link.primary
                              ? "bg-white text-emerald-800 shadow-md group-hover:bg-emerald-100 group-hover:translate-x-1"
                              : "bg-slate-100 text-slate-500 border border-slate-200/90 group-hover:bg-emerald-700 group-hover:text-white group-hover:border-emerald-700 group-hover:shadow-md group-hover:shadow-emerald-700/25 group-hover:translate-x-1"
                          }`}
                        >
                          <ChevronRight className="w-4 h-4" strokeWidth={2.5} />
                        </div>
                      </div>
                    </Link>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>{" "}
        {/* MOBILE VERSION */}
        <div className="animate-fade-in flex md:hidden w-full px-5 flex-col pb-2">
          <div className="flex flex-col items-center justify-center">
            {/* Logo, Title & Right Image Section - Mobile */}
            <div
              className="animate-fade-in flex flex-row items-center justify-between w-full mb-3 gap-2"
              style={{ animationDelay: "0.1s" }}
            >
              {/* Left Logo */}
              <div className="w-20 sm:w-24 flex justify-center items-start shrink-0">
                <div className="w-10 h-10 relative shrink-0 self-start mt-1 transition-transform hover:scale-105 duration-500">
                  <Image
                    src={siteInfo.logoSrc}
                    alt="Logo Kemenag"
                    width={40}
                    height={40}
                    className="w-full h-full object-contain drop-shadow-md"
                    priority
                  />
                </div>
              </div>

              {/* Title Section */}
              <div className="flex flex-col items-center text-center flex-1 min-w-0">
                <h1 className="flex flex-col items-center font-black uppercase tracking-tight leading-none px-1 mb-2">
                  <span className="text-[15px] sm:text-lg text-[#064e3b] text-center leading-tight">
                    {siteInfo.logoTitleLine1}
                  </span>
                  <span className="text-[12px] sm:text-[15px] text-[#064e3b] text-center leading-tight mt-0.5">
                    {siteInfo.logoTitleLine2}
                  </span>
                </h1>

                {/* Hapakat Logo & Text */}
                <div className="flex flex-col items-center mt-1">
                  <Image
                    src="/assets/branding/hapakat.webp"
                    alt="Hapakat"
                    width={120}
                    height={28}
                    className="object-contain drop-shadow-xs mb-2 h-7 lg:h-9 w-auto"
                    style={{ width: "auto" }}
                  />
                  <div className="w-full overflow-hidden text-center">
                    <p
                      className="whitespace-nowrap font-bold text-slate-700 tracking-wide text-center"
                      style={{ fontSize: "clamp(4px, 1.45vw, 9px)" }}
                    >
                      <span
                        className="text-emerald-700 font-extrabold"
                        style={{ fontSize: "clamp(5px, 1.7vw, 11px)" }}
                      >
                        H
                      </span>
                      armonis,{" "}
                      <span
                        className="text-emerald-700 font-extrabold"
                        style={{ fontSize: "clamp(5px, 1.7vw, 11px)" }}
                      >
                        A
                      </span>
                      manah,{" "}
                      <span
                        className="text-emerald-700 font-extrabold"
                        style={{ fontSize: "clamp(5px, 1.7vw, 11px)" }}
                      >
                        P
                      </span>
                      rofesional,{" "}
                      <span
                        className="text-emerald-700 font-extrabold"
                        style={{ fontSize: "clamp(5px, 1.7vw, 11px)" }}
                      >
                        A
                      </span>
                      kuntabel,{" "}
                      <span
                        className="text-emerald-700 font-extrabold"
                        style={{ fontSize: "clamp(5px, 1.7vw, 11px)" }}
                      >
                        K
                      </span>
                      reatif,{" "}
                      <span
                        className="text-emerald-700 font-extrabold"
                        style={{ fontSize: "clamp(5px, 1.7vw, 11px)" }}
                      >
                        A
                      </span>
                      dil dan{" "}
                      <span
                        className="text-emerald-700 font-extrabold"
                        style={{ fontSize: "clamp(5px, 1.7vw, 11px)" }}
                      >
                        T
                      </span>
                      ransparan
                    </p>
                  </div>
                </div>
              </div>

              {/* Right Logo */}
              <div className="w-20 sm:w-24 flex justify-end items-start shrink-0">
                <div className="w-20 h-20 sm:w-24 sm:h-24 relative shrink-0 self-start mt-1 transition-transform hover:scale-105 duration-500">
                  <Image
                    src="/assets/branding/atak-portal.webp"
                    alt="Portal Atak"
                    width={96}
                    height={96}
                    className="w-full h-full object-contain drop-shadow-md"
                    priority
                  />
                </div>
              </div>
            </div>

            {/* Enhanced Status & Time - Mobile */}
            <MobileClockSection />

            {/* Berita Ticker - Mobile */}
            {portalError ? (
              <div
                className="animate-fade-in w-full mt-1 overflow-hidden flex justify-center"
                style={{ animationDelay: "0.15s" }}
              >
                <span className="text-[9px] text-rose-600 font-medium bg-rose-50 px-3 py-1 rounded-full border border-rose-200">
                  Gagal memuat berita terbaru
                </span>
              </div>
            ) : (
              portalData?.latestBerita?.length > 0 && (
                <div
                  className="animate-fade-in w-full mt-1 overflow-hidden"
                  style={{ animationDelay: "0.15s" }}
                >
                  <div className="relative flex items-center gap-2 bg-white/95 backdrop-blur-md px-3.5 py-1.5 rounded-full border border-slate-300/80 shadow-xs">
                    <span className="shrink-0 text-[8px] font-black uppercase tracking-widest text-white bg-emerald-700 px-2 py-0.5 rounded-full leading-none flex items-center justify-center shadow-xs">
                      Baru
                    </span>
                    <div className="overflow-hidden relative flex-1 flex items-center self-stretch select-none group">
                      <div className="flex shrink-0 items-center gap-0 animate-marquee whitespace-nowrap">
                        {[...portalData.latestBerita, ...portalData.latestBerita].map((item, i) => (
                          <React.Fragment key={`m1-${item.slug}-${i}`}>
                            <Link
                              href={`/berita/${item.slug}`}
                              className="text-slate-700 text-[10px] font-semibold hover:text-emerald-800 transition-colors shrink-0 leading-none flex items-center h-full"
                            >
                              {item.title}
                            </Link>
                            <span className="mx-2.5 text-slate-300 flex items-center h-full leading-none">
                              |
                            </span>
                          </React.Fragment>
                        ))}
                      </div>
                      <div className="flex shrink-0 items-center gap-0 animate-marquee whitespace-nowrap" aria-hidden="true">
                        {[...portalData.latestBerita, ...portalData.latestBerita].map((item, i) => (
                          <React.Fragment key={`m2-${item.slug}-${i}`}>
                            <Link
                              href={`/berita/${item.slug}`}
                              tabIndex={-1}
                              className="text-slate-700 text-[10px] font-semibold hover:text-emerald-800 transition-colors shrink-0 leading-none flex items-center h-full"
                            >
                              {item.title}
                            </Link>
                            <span className="mx-2.5 text-slate-300 flex items-center h-full leading-none">
                              |
                            </span>
                          </React.Fragment>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              )
            )}

            {/* Portal Grid Section */}
            <div className="flex items-center justify-center w-full mt-2 py-1">
              <div className="grid grid-cols-2 gap-3 w-full">
                {PORTAL_LINKS.map((link, idx) => (
                  <div
                    key={link.title}
                    className="animate-fade-in-up w-full"
                    style={{ animationDelay: `${0.2 + idx * 0.08}s` }}
                  >
                    <Link
                      href={link.href}
                      onClick={(e) => {
                        if (link.id === "ptsp") {
                          e.preventDefault();
                          setIsPtspModalOpen(true);
                        } else if (link.id === "inovasi") {
                          e.preventDefault();
                          setIsInovasiModalOpen(true);
                        } else if (link.id === "informasi") {
                          e.preventDefault();
                          setIsInformasiModalOpen(true);
                        } else if (link.id === "survey") {
                          e.preventDefault();
                          setIsSurveyModalOpen(true);
                        } else if (link.id === "zona") {
                          e.preventDefault();
                          setIsZonaModalOpen(true);
                        } else if (link.id === "pengaduan") {
                          e.preventDefault();
                          setIsPengaduanModalOpen(true);
                        }
                      }}
                      target={link.id === "website_utama" || link.href.startsWith("http") ? "_blank" : undefined}
                      rel={link.id === "website_utama" || link.href.startsWith("http") ? "noopener noreferrer" : undefined}
                      className={`group relative p-4 sm:p-5 rounded-3xl transition-all duration-300 flex flex-col items-center text-center w-full h-full hover:scale-[1.02] active:scale-[0.98] overflow-hidden ${
                        link.primary
                          ? "bg-gradient-to-br from-emerald-700 via-emerald-800 to-teal-900 text-white border border-emerald-600/50 shadow-md"
                          : "bg-white/95 backdrop-blur-xl border border-slate-300/80 shadow-[0_2px_10px_rgba(15,23,42,0.05)] hover:border-emerald-500/60"
                      }`}
                    >
                      <div
                        className={`w-12 h-12 rounded-[1rem] flex items-center justify-center mb-3 shrink-0 shadow-xs border ${
                          link.primary
                            ? "bg-white/20 text-white border-white/30"
                            : link.iconBg || "bg-slate-100 text-slate-700 border-slate-200/90"
                        }`}
                      >
                        {link.icon}
                      </div>
                      <h2
                        className={`text-xs sm:text-[13px] font-extrabold line-clamp-2 leading-tight ${
                          link.primary ? "text-white" : "text-slate-800"
                        }`}
                      >
                        {link.title}
                      </h2>
                    </Link>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
        {/* PTSP Modal */}
        {isPtspModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-3.5 sm:p-6 bg-slate-900/45 backdrop-blur-xs animate-fade-in">
            {/* Backdrop Click Area */}
            <div
              className="absolute inset-0"
              onClick={() => setIsPtspModalOpen(false)}
            ></div>

            {/* Modal Card - Responsive Bento Grid */}
            <div className="relative w-full max-w-xl md:max-w-2xl bg-white/95 border border-slate-200/90 rounded-[1.75rem] sm:rounded-[2rem] shadow-2xl shadow-slate-900/20 overflow-hidden animate-fade-in-up backdrop-blur-2xl flex flex-col my-auto max-h-[90dvh] sm:max-h-[85vh]">
              {/* Header */}
              <div className="flex items-center justify-between px-4.5 py-3.5 sm:px-6 sm:py-4 bg-gradient-to-r from-blue-50/90 via-slate-50 to-white border-b border-slate-100 shrink-0">
                <div className="flex items-center gap-3 min-w-0 flex-1 pr-2">
                  <div className="w-9 h-9 sm:w-11 sm:h-11 rounded-xl sm:rounded-2xl bg-blue-50 border border-blue-200/80 text-blue-600 flex items-center justify-center shadow-xs shrink-0 [&>svg]:w-4.5 [&>svg]:h-4.5 sm:[&>svg]:w-5 sm:[&>svg]:h-5">
                    <FolderOpen strokeWidth={2} />
                  </div>
                  <div className="min-w-0 flex-1">
                    <h3 className="text-slate-900 font-extrabold text-sm sm:text-base tracking-tight leading-snug truncate">
                      Layanan PTSP Si ATAK
                    </h3>
                    <p className="hidden sm:block text-[11px] text-slate-500 font-medium truncate mt-0.5">
                      Pusat Layanan Terpadu Satu Pintu Kemenag Barito Utara
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setIsPtspModalOpen(false)}
                  className="text-slate-400 hover:text-slate-700 hover:bg-slate-100 p-1.5 sm:p-2 rounded-xl transition-all duration-200 shrink-0"
                  aria-label="Tutup modal"
                >
                  <X className="w-4 h-4 sm:w-5 sm:h-5" />
                </button>
              </div>

              {/* Bento Grid Body */}
              <div className="p-3.5 sm:p-6 overflow-y-auto overscroll-contain">
                <div className="grid grid-cols-2 gap-2.5 sm:gap-3.5">
                  {PTSP_MENUS.map((menu, idx) => (
                    <Link
                      key={idx}
                      href={menu.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={() => setIsPtspModalOpen(false)}
                      className={`group relative p-3 sm:p-4 rounded-xl sm:rounded-2xl bg-white hover:bg-gradient-to-br hover:from-white hover:to-blue-50/40 border border-slate-200/90 hover:border-blue-400/80 shadow-[0_2px_8px_rgba(15,23,42,0.03)] hover:shadow-[0_8px_20px_-4px_rgba(37,99,235,0.12)] transition-all duration-200 flex flex-col justify-between active:scale-[0.98] min-h-[76px] sm:min-h-[114px] ${
                        idx === PTSP_MENUS.length - 1 && PTSP_MENUS.length % 2 !== 0 ? "col-span-2 sm:col-span-1" : ""
                      }`}
                    >
                      <div className="flex items-center justify-between mb-2 sm:mb-3">
                        <div className={`w-8 h-8 sm:w-10 sm:h-10 rounded-lg sm:rounded-xl flex items-center justify-center shrink-0 shadow-2xs border ${menu.iconBg} group-hover:scale-105 transition-transform duration-200 [&>svg]:w-4 [&>svg]:h-4 sm:[&>svg]:w-5 sm:[&>svg]:h-5`}>
                          {menu.icon}
                        </div>
                        <div className="flex items-center gap-1.5">
                          {menu.badge && (
                            <span className="hidden sm:inline-block text-[9px] font-bold text-blue-700 bg-blue-50 border border-blue-200/60 px-2 py-0.5 rounded-md">
                              {menu.badge}
                            </span>
                          )}
                          <div className="w-6 h-6 sm:w-7 sm:h-7 rounded-lg bg-slate-100/90 group-hover:bg-blue-600 group-hover:text-white text-slate-400 flex items-center justify-center transition-all duration-200">
                            <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" strokeWidth={2.5} />
                          </div>
                        </div>
                      </div>
                      <div>
                        <h4 className="text-slate-800 font-bold text-xs sm:text-sm leading-snug group-hover:text-blue-700 transition-colors line-clamp-2">
                          {menu.title}
                        </h4>
                        <p className="hidden sm:block text-slate-500 text-[11px] leading-relaxed line-clamp-2 mt-1">
                          {menu.desc}
                        </p>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Inovasi Modal */}
        {isInovasiModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-3.5 sm:p-6 bg-slate-900/45 backdrop-blur-xs animate-fade-in">
            {/* Backdrop Click Area */}
            <div
              className="absolute inset-0"
              onClick={() => setIsInovasiModalOpen(false)}
            ></div>

            {/* Modal Card - Responsive Bento Grid */}
            <div className="relative w-full max-w-xl md:max-w-2xl bg-white/95 border border-slate-200/90 rounded-[1.75rem] sm:rounded-[2rem] shadow-2xl shadow-slate-900/20 overflow-hidden animate-fade-in-up backdrop-blur-2xl flex flex-col my-auto max-h-[90dvh] sm:max-h-[85vh]">
              {/* Header */}
              <div className="flex items-center justify-between px-4.5 py-3.5 sm:px-6 sm:py-4 bg-gradient-to-r from-amber-50/90 via-slate-50 to-white border-b border-slate-100 shrink-0">
                <div className="flex items-center gap-3 min-w-0 flex-1 pr-2">
                  <div className="w-9 h-9 sm:w-11 sm:h-11 rounded-xl sm:rounded-2xl bg-amber-50 border border-amber-200/80 text-amber-600 flex items-center justify-center shadow-xs shrink-0 [&>svg]:w-4.5 [&>svg]:h-4.5 sm:[&>svg]:w-5 sm:[&>svg]:h-5">
                    <Lightbulb strokeWidth={2} />
                  </div>
                  <div className="min-w-0 flex-1">
                    <h3 className="text-slate-900 font-extrabold text-sm sm:text-base tracking-tight leading-snug truncate">
                      Inovasi Kemenag
                    </h3>
                    <p className="hidden sm:block text-[11px] text-slate-500 font-medium truncate mt-0.5">
                      Aplikasi & Layanan Digital Terpadu Barito Utara
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setIsInovasiModalOpen(false)}
                  className="text-slate-400 hover:text-slate-700 hover:bg-slate-100 p-1.5 sm:p-2 rounded-xl transition-all duration-200 shrink-0"
                  aria-label="Tutup modal"
                >
                  <X className="w-4 h-4 sm:w-5 sm:h-5" />
                </button>
              </div>

              {/* Bento Grid Body */}
              <div className="p-3.5 sm:p-6 overflow-y-auto overscroll-contain">
                <div className="grid grid-cols-2 gap-2.5 sm:gap-3.5">
                  {INOVASI_MENUS.map((menu, idx) => (
                    <Link
                      key={idx}
                      href={menu.href}
                      target={menu.href.startsWith("http") ? "_blank" : undefined}
                      rel={menu.href.startsWith("http") ? "noopener noreferrer" : undefined}
                      onClick={() => setIsInovasiModalOpen(false)}
                      className={`group relative p-3 sm:p-4 rounded-xl sm:rounded-2xl bg-white hover:bg-gradient-to-br hover:from-white hover:to-amber-50/40 border border-slate-200/90 hover:border-amber-400/80 shadow-[0_2px_8px_rgba(15,23,42,0.03)] hover:shadow-[0_8px_20px_-4px_rgba(245,158,11,0.12)] transition-all duration-200 flex flex-col justify-between active:scale-[0.98] min-h-[76px] sm:min-h-[114px] ${
                        idx === INOVASI_MENUS.length - 1 && INOVASI_MENUS.length % 2 !== 0 ? "col-span-2 sm:col-span-1" : ""
                      }`}
                    >
                      <div className="flex items-center justify-between mb-2 sm:mb-3">
                        <div className={`w-8 h-8 sm:w-10 sm:h-10 rounded-lg sm:rounded-xl flex items-center justify-center shrink-0 shadow-2xs border ${menu.iconBg} group-hover:scale-105 transition-transform duration-200 [&>svg]:w-4 [&>svg]:h-4 sm:[&>svg]:w-5 sm:[&>svg]:h-5`}>
                          {menu.icon}
                        </div>
                        <div className="flex items-center gap-1.5">
                          {menu.badge && (
                            <span className="hidden sm:inline-block text-[9px] font-bold text-amber-700 bg-amber-50 border border-amber-200/60 px-2 py-0.5 rounded-md">
                              {menu.badge}
                            </span>
                          )}
                          <div className="w-6 h-6 sm:w-7 sm:h-7 rounded-lg bg-slate-100/90 group-hover:bg-amber-600 group-hover:text-white text-slate-400 flex items-center justify-center transition-all duration-200">
                            <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" strokeWidth={2.5} />
                          </div>
                        </div>
                      </div>
                      <div>
                        <h4 className="text-slate-800 font-bold text-xs sm:text-sm leading-snug group-hover:text-amber-700 transition-colors line-clamp-2">
                          {menu.title}
                        </h4>
                        <p className="hidden sm:block text-slate-500 text-[11px] leading-relaxed line-clamp-2 mt-1">
                          {menu.desc}
                        </p>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Informasi Publik Modal */}
        {isInformasiModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-3.5 sm:p-6 bg-slate-900/45 backdrop-blur-xs animate-fade-in">
            {/* Backdrop Click Area */}
            <div
              className="absolute inset-0"
              onClick={() => setIsInformasiModalOpen(false)}
            ></div>

            {/* Modal Card - Responsive Bento Grid */}
            <div className="relative w-full max-w-xl md:max-w-2xl bg-white/95 border border-slate-200/90 rounded-[1.75rem] sm:rounded-[2rem] shadow-2xl shadow-slate-900/20 overflow-hidden animate-fade-in-up backdrop-blur-2xl flex flex-col my-auto max-h-[90dvh] sm:max-h-[85vh]">
              {/* Header */}
              <div className="flex items-center justify-between px-4.5 py-3.5 sm:px-6 sm:py-4 bg-gradient-to-r from-fuchsia-50/90 via-slate-50 to-white border-b border-slate-100 shrink-0">
                <div className="flex items-center gap-3 min-w-0 flex-1 pr-2">
                  <div className="w-9 h-9 sm:w-11 sm:h-11 rounded-xl sm:rounded-2xl bg-fuchsia-50 border border-fuchsia-200/80 text-fuchsia-600 flex items-center justify-center shadow-xs shrink-0 [&>svg]:w-4.5 [&>svg]:h-4.5 sm:[&>svg]:w-5 sm:[&>svg]:h-5">
                    <Info strokeWidth={2} />
                  </div>
                  <div className="min-w-0 flex-1">
                    <h3 className="text-slate-900 font-extrabold text-sm sm:text-base tracking-tight leading-snug truncate">
                      Informasi Publik
                    </h3>
                    <p className="hidden sm:block text-[11px] text-slate-500 font-medium truncate mt-0.5">
                      Portal Berita, Galeri Kegiatan & Laporan Resmi
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setIsInformasiModalOpen(false)}
                  className="text-slate-400 hover:text-slate-700 hover:bg-slate-100 p-1.5 sm:p-2 rounded-xl transition-all duration-200 shrink-0"
                  aria-label="Tutup modal"
                >
                  <X className="w-4 h-4 sm:w-5 sm:h-5" />
                </button>
              </div>

              {/* Bento Grid Body */}
              <div className="p-3.5 sm:p-6 overflow-y-auto overscroll-contain">
                <div className="grid grid-cols-2 gap-2.5 sm:gap-3.5">
                  {INFORMASI_MENUS.map((menu, idx) => (
                    <Link
                      key={idx}
                      href={menu.href}
                      target={menu.href.startsWith("http") ? "_blank" : undefined}
                      rel={menu.href.startsWith("http") ? "noopener noreferrer" : undefined}
                      onClick={() => setIsInformasiModalOpen(false)}
                      className={`group relative p-3 sm:p-4 rounded-xl sm:rounded-2xl bg-white hover:bg-gradient-to-br hover:from-white hover:to-fuchsia-50/40 border border-slate-200/90 hover:border-fuchsia-400/80 shadow-[0_2px_8px_rgba(15,23,42,0.03)] hover:shadow-[0_8px_20px_-4px_rgba(192,38,211,0.12)] transition-all duration-200 flex flex-col justify-between active:scale-[0.98] min-h-[76px] sm:min-h-[114px] ${
                        idx === INFORMASI_MENUS.length - 1 && INFORMASI_MENUS.length % 2 !== 0 ? "col-span-2 sm:col-span-1" : ""
                      }`}
                    >
                      <div className="flex items-center justify-between mb-2 sm:mb-3">
                        <div className={`w-8 h-8 sm:w-10 sm:h-10 rounded-lg sm:rounded-xl flex items-center justify-center shrink-0 shadow-2xs border ${menu.iconBg} group-hover:scale-105 transition-transform duration-200 [&>svg]:w-4 [&>svg]:h-4 sm:[&>svg]:w-5 sm:[&>svg]:h-5`}>
                          {menu.icon}
                        </div>
                        <div className="flex items-center gap-1.5">
                          {menu.badge && (
                            <span className="hidden sm:inline-block text-[9px] font-bold text-fuchsia-700 bg-fuchsia-50 border border-fuchsia-200/60 px-2 py-0.5 rounded-md">
                              {menu.badge}
                            </span>
                          )}
                          <div className="w-6 h-6 sm:w-7 sm:h-7 rounded-lg bg-slate-100/90 group-hover:bg-fuchsia-600 group-hover:text-white text-slate-400 flex items-center justify-center transition-all duration-200">
                            <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" strokeWidth={2.5} />
                          </div>
                        </div>
                      </div>
                      <div>
                        <h4 className="text-slate-800 font-bold text-xs sm:text-sm leading-snug group-hover:text-fuchsia-700 transition-colors line-clamp-2">
                          {menu.title}
                        </h4>
                        <p className="hidden sm:block text-slate-500 text-[11px] leading-relaxed line-clamp-2 mt-1">
                          {menu.desc}
                        </p>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Layanan Survey Modal */}
        {isSurveyModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-3.5 sm:p-6 bg-slate-900/45 backdrop-blur-xs animate-fade-in">
            {/* Backdrop Click Area */}
            <div
              className="absolute inset-0"
              onClick={() => setIsSurveyModalOpen(false)}
            ></div>

            {/* Modal Card - Responsive Bento Grid */}
            <div className="relative w-full max-w-xl md:max-w-2xl bg-white/95 border border-slate-200/90 rounded-[1.75rem] sm:rounded-[2rem] shadow-2xl shadow-slate-900/20 overflow-hidden animate-fade-in-up backdrop-blur-2xl flex flex-col my-auto max-h-[90dvh] sm:max-h-[85vh]">
              {/* Header */}
              <div className="flex items-center justify-between px-4.5 py-3.5 sm:px-6 sm:py-4 bg-gradient-to-r from-purple-50/90 via-slate-50 to-white border-b border-slate-100 shrink-0">
                <div className="flex items-center gap-3 min-w-0 flex-1 pr-2">
                  <div className="w-9 h-9 sm:w-11 sm:h-11 rounded-xl sm:rounded-2xl bg-purple-50 border border-purple-200/80 text-purple-600 flex items-center justify-center shadow-xs shrink-0 [&>svg]:w-4.5 [&>svg]:h-4.5 sm:[&>svg]:w-5 sm:[&>svg]:h-5">
                    <ClipboardList strokeWidth={2} />
                  </div>
                  <div className="min-w-0 flex-1">
                    <h3 className="text-slate-900 font-extrabold text-sm sm:text-base tracking-tight leading-snug truncate">
                      Layanan Survey
                    </h3>
                    <p className="hidden sm:block text-[11px] text-slate-500 font-medium truncate mt-0.5">
                      Survei Kepuasan & Indeks Pelayanan Masyarakat
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setIsSurveyModalOpen(false)}
                  className="text-slate-400 hover:text-slate-700 hover:bg-slate-100 p-1.5 sm:p-2 rounded-xl transition-all duration-200 shrink-0"
                  aria-label="Tutup modal"
                >
                  <X className="w-4 h-4 sm:w-5 sm:h-5" />
                </button>
              </div>

              {/* Bento Grid Body */}
              <div className="p-3.5 sm:p-6 overflow-y-auto overscroll-contain">
                <div className="grid grid-cols-2 gap-2.5 sm:gap-3.5">
                  {SURVEY_MENUS.map((menu, idx) => (
                    <Link
                      key={idx}
                      href={menu.href}
                      target={menu.href === "#" ? undefined : "_blank"}
                      rel={menu.href === "#" ? undefined : "noopener noreferrer"}
                      onClick={(e) => {
                        if (menu.href === "#") e.preventDefault();
                        setIsSurveyModalOpen(false);
                      }}
                      className={`group relative p-3 sm:p-4 rounded-xl sm:rounded-2xl bg-white hover:bg-gradient-to-br hover:from-white hover:to-purple-50/40 border border-slate-200/90 hover:border-purple-400/80 shadow-[0_2px_8px_rgba(15,23,42,0.03)] hover:shadow-[0_8px_20px_-4px_rgba(147,51,234,0.12)] transition-all duration-200 flex flex-col justify-between active:scale-[0.98] min-h-[76px] sm:min-h-[114px] ${
                        idx === SURVEY_MENUS.length - 1 && SURVEY_MENUS.length % 2 !== 0 ? "col-span-2 sm:col-span-1" : ""
                      }`}
                    >
                      <div className="flex items-center justify-between mb-2 sm:mb-3">
                        <div className={`w-8 h-8 sm:w-10 sm:h-10 rounded-lg sm:rounded-xl flex items-center justify-center shrink-0 shadow-2xs border ${menu.iconBg} group-hover:scale-105 transition-transform duration-200 [&>svg]:w-4 [&>svg]:h-4 sm:[&>svg]:w-5 sm:[&>svg]:h-5`}>
                          {menu.icon}
                        </div>
                        <div className="flex items-center gap-1.5">
                          {menu.badge && (
                            <span className="hidden sm:inline-block text-[9px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200/60 px-2 py-0.5 rounded-md">
                              {menu.badge}
                            </span>
                          )}
                          <div className="w-6 h-6 sm:w-7 sm:h-7 rounded-lg bg-slate-100/90 group-hover:bg-purple-600 group-hover:text-white text-slate-400 flex items-center justify-center transition-all duration-200">
                            <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" strokeWidth={2.5} />
                          </div>
                        </div>
                      </div>
                      <div>
                        <h4 className="text-slate-800 font-bold text-xs sm:text-sm leading-snug group-hover:text-purple-700 transition-colors line-clamp-2">
                          {menu.title}
                        </h4>
                        <p className="hidden sm:block text-slate-500 text-[11px] leading-relaxed line-clamp-2 mt-1">
                          {menu.desc}
                        </p>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Zona Integritas Modal */}
        {isZonaModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-3.5 sm:p-6 bg-slate-900/45 backdrop-blur-xs animate-fade-in">
            {/* Backdrop Click Area */}
            <div
              className="absolute inset-0"
              onClick={() => setIsZonaModalOpen(false)}
            ></div>

            {/* Modal Card - Responsive Bento Grid */}
            <div className="relative w-full max-w-xl md:max-w-2xl bg-white/95 border border-slate-200/90 rounded-[1.75rem] sm:rounded-[2rem] shadow-2xl shadow-slate-900/20 overflow-hidden animate-fade-in-up backdrop-blur-2xl flex flex-col my-auto max-h-[90dvh] sm:max-h-[85vh]">
              {/* Header */}
              <div className="flex items-center justify-between px-4.5 py-3.5 sm:px-6 sm:py-4 bg-gradient-to-r from-emerald-50/90 via-slate-50 to-white border-b border-slate-100 shrink-0">
                <div className="flex items-center gap-3 min-w-0 flex-1 pr-2">
                  <div className="w-9 h-9 sm:w-11 sm:h-11 rounded-xl sm:rounded-2xl bg-emerald-50 border border-emerald-200/80 text-emerald-600 flex items-center justify-center shadow-xs shrink-0 [&>svg]:w-4.5 [&>svg]:h-4.5 sm:[&>svg]:w-5 sm:[&>svg]:h-5">
                    <ShieldCheck strokeWidth={2} />
                  </div>
                  <div className="min-w-0 flex-1">
                    <h3 className="text-slate-900 font-extrabold text-sm sm:text-base tracking-tight leading-snug truncate">
                      Zona Integritas
                    </h3>
                    <p className="hidden sm:block text-[11px] text-slate-500 font-medium truncate mt-0.5">
                      Komitmen Birokrasi Bersih, Akuntabel, dan Melayani
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setIsZonaModalOpen(false)}
                  className="text-slate-400 hover:text-slate-700 hover:bg-slate-100 p-1.5 sm:p-2 rounded-xl transition-all duration-200 shrink-0"
                  aria-label="Tutup modal"
                >
                  <X className="w-4 h-4 sm:w-5 sm:h-5" />
                </button>
              </div>

              {/* Bento Grid Body */}
              <div className="p-3.5 sm:p-6 overflow-y-auto overscroll-contain">
                <div className="grid grid-cols-2 gap-2.5 sm:gap-3.5">
                  {ZONA_MENUS.map((menu, idx) => (
                    <Link
                      key={idx}
                      href={menu.href}
                      target={menu.href === "#" ? undefined : "_blank"}
                      rel={menu.href === "#" ? undefined : "noopener noreferrer"}
                      onClick={(e) => {
                        if (menu.href === "#") e.preventDefault();
                        setIsZonaModalOpen(false);
                      }}
                      className={`group relative p-3 sm:p-4 rounded-xl sm:rounded-2xl bg-white hover:bg-gradient-to-br hover:from-white hover:to-emerald-50/40 border border-slate-200/90 hover:border-emerald-400/80 shadow-[0_2px_8px_rgba(15,23,42,0.03)] hover:shadow-[0_8px_20px_-4px_rgba(16,185,129,0.12)] transition-all duration-200 flex flex-col justify-between active:scale-[0.98] min-h-[76px] sm:min-h-[114px] ${
                        idx === ZONA_MENUS.length - 1 && ZONA_MENUS.length % 2 !== 0 ? "col-span-2 sm:col-span-1" : ""
                      }`}
                    >
                      <div className="flex items-center justify-between mb-2 sm:mb-3">
                        <div className={`w-8 h-8 sm:w-10 sm:h-10 rounded-lg sm:rounded-xl flex items-center justify-center shrink-0 shadow-2xs border ${menu.iconBg} group-hover:scale-105 transition-transform duration-200 [&>svg]:w-4 [&>svg]:h-4 sm:[&>svg]:w-5 sm:[&>svg]:h-5`}>
                          {menu.icon}
                        </div>
                        <div className="flex items-center gap-1.5">
                          {menu.badge && (
                            <span className="hidden sm:inline-block text-[9px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200/60 px-2 py-0.5 rounded-md">
                              {menu.badge}
                            </span>
                          )}
                          <div className="w-6 h-6 sm:w-7 sm:h-7 rounded-lg bg-slate-100/90 group-hover:bg-emerald-600 group-hover:text-white text-slate-400 flex items-center justify-center transition-all duration-200">
                            <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" strokeWidth={2.5} />
                          </div>
                        </div>
                      </div>
                      <div>
                        <h4 className="text-slate-800 font-bold text-xs sm:text-sm leading-snug group-hover:text-emerald-700 transition-colors line-clamp-2">
                          {menu.title}
                        </h4>
                        <p className="hidden sm:block text-slate-500 text-[11px] leading-relaxed line-clamp-2 mt-1">
                          {menu.desc}
                        </p>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Layanan Pengaduan Modal */}
        {isPengaduanModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-3.5 sm:p-6 bg-slate-900/45 backdrop-blur-xs animate-fade-in">
            {/* Backdrop Click Area */}
            <div
              className="absolute inset-0"
              onClick={() => setIsPengaduanModalOpen(false)}
            ></div>

            {/* Modal Card - Responsive Bento Grid */}
            <div className="relative w-full max-w-xl md:max-w-2xl bg-white/95 border border-slate-200/90 rounded-[1.75rem] sm:rounded-[2rem] shadow-2xl shadow-slate-900/20 overflow-hidden animate-fade-in-up backdrop-blur-2xl flex flex-col my-auto max-h-[90dvh] sm:max-h-[85vh]">
              {/* Header */}
              <div className="flex items-center justify-between px-4.5 py-3.5 sm:px-6 sm:py-4 bg-gradient-to-r from-rose-50/90 via-slate-50 to-white border-b border-slate-100 shrink-0">
                <div className="flex items-center gap-3 min-w-0 flex-1 pr-2">
                  <div className="w-9 h-9 sm:w-11 sm:h-11 rounded-xl sm:rounded-2xl bg-rose-50 border border-rose-200/80 text-rose-600 flex items-center justify-center shadow-xs shrink-0 [&>svg]:w-4.5 [&>svg]:h-4.5 sm:[&>svg]:w-5 sm:[&>svg]:h-5">
                    <Headset strokeWidth={2} />
                  </div>
                  <div className="min-w-0 flex-1">
                    <h3 className="text-slate-900 font-extrabold text-sm sm:text-base tracking-tight leading-snug truncate">
                      Layanan Pengaduan
                    </h3>
                    <p className="hidden sm:block text-[11px] text-slate-500 font-medium truncate mt-0.5">
                      Saluran Resmi Pengaduan, Aspirasi & Pelaporan Masyarakat
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setIsPengaduanModalOpen(false)}
                  className="text-slate-400 hover:text-slate-700 hover:bg-slate-100 p-1.5 sm:p-2 rounded-xl transition-all duration-200 shrink-0"
                  aria-label="Tutup modal"
                >
                  <X className="w-4 h-4 sm:w-5 sm:h-5" />
                </button>
              </div>

              {/* Bento Grid Body */}
              <div className="p-3.5 sm:p-6 overflow-y-auto overscroll-contain">
                <div className="grid grid-cols-2 gap-2.5 sm:gap-3.5">
                  {PENGADUAN_MENUS.map((menu, idx) => (
                    <Link
                      key={idx}
                      href={menu.href}
                      target={menu.href === "#" ? undefined : "_blank"}
                      rel={menu.href === "#" ? undefined : "noopener noreferrer"}
                      onClick={(e) => {
                        if (menu.href === "#") e.preventDefault();
                        setIsPengaduanModalOpen(false);
                      }}
                      className={`group relative p-3 sm:p-4 rounded-xl sm:rounded-2xl bg-white hover:bg-gradient-to-br hover:from-white hover:to-rose-50/40 border border-slate-200/90 hover:border-rose-400/80 shadow-[0_2px_8px_rgba(15,23,42,0.03)] hover:shadow-[0_8px_20px_-4px_rgba(225,29,72,0.12)] transition-all duration-200 flex flex-col justify-between active:scale-[0.98] min-h-[76px] sm:min-h-[114px] ${
                        idx === PENGADUAN_MENUS.length - 1 && PENGADUAN_MENUS.length % 2 !== 0 ? "col-span-2 sm:col-span-1" : ""
                      }`}
                    >
                      <div className="flex items-center justify-between mb-2 sm:mb-3">
                        <div className={`w-8 h-8 sm:w-10 sm:h-10 rounded-lg sm:rounded-xl flex items-center justify-center shrink-0 shadow-2xs border ${menu.iconBg} group-hover:scale-105 transition-transform duration-200 [&>svg]:w-4 [&>svg]:h-4 sm:[&>svg]:w-5 sm:[&>svg]:h-5`}>
                          {menu.icon}
                        </div>
                        <div className="flex items-center gap-1.5">
                          {menu.badge && (
                            <span className="hidden sm:inline-block text-[9px] font-bold text-rose-700 bg-rose-50 border border-rose-200/60 px-2 py-0.5 rounded-md">
                              {menu.badge}
                            </span>
                          )}
                          <div className="w-6 h-6 sm:w-7 sm:h-7 rounded-lg bg-slate-100/90 group-hover:bg-rose-600 group-hover:text-white text-slate-400 flex items-center justify-center transition-all duration-200">
                            <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" strokeWidth={2.5} />
                          </div>
                        </div>
                      </div>
                      <div>
                        <h4 className="text-slate-800 font-bold text-xs sm:text-sm leading-snug group-hover:text-rose-700 transition-colors line-clamp-2">
                          {menu.title}
                        </h4>
                        <p className="hidden sm:block text-slate-500 text-[11px] leading-relaxed line-clamp-2 mt-1">
                          {menu.desc}
                        </p>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Shared Footer info */}
      <div
        className="animate-fade-in text-center pb-1 sm:pb-2 pt-0.5 w-full"
        style={{ animationDelay: "0.3s" }}
      >
        <p className="text-slate-500 text-[8px] md:text-[10px] font-bold tracking-widest uppercase">
          &copy; {new Date().getFullYear()} {siteInfo.name}
        </p>
      </div>
    </div>
  );
}
