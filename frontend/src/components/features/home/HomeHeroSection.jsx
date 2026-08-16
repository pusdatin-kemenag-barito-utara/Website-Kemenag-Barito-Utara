"use client";

import React from "react";
import Image from "@/components/common/NextImage";
import Link from "@/components/common/NextLink";
import { useLanguage } from "@/context/LanguageContext";
import { siteInfo } from "@/data/site";
import { useSiteSettings } from "@/context/SettingsContext";

function AnimatedCounter({ value }) {
  const [count, setCount] = React.useState("0");

  React.useEffect(() => {
    const numericMatch = value.match(/\d+/);
    if (!numericMatch) {
      setCount(value);
      return;
    }

    const target = parseInt(numericMatch[0], 10);
    const suffix = value.replace(numericMatch[0], "");

    let current = 0;
    const duration = 2000; // 2 detik animasi
    const intervalTime = 20;
    const step = Math.max(1, Math.floor(target / (duration / intervalTime)));

    const timer = setInterval(() => {
      current += step;
      if (current >= target) {
        setCount(target + suffix);
        clearInterval(timer);
      } else {
        setCount(current + suffix);
      }
    }, intervalTime);

    return () => clearInterval(timer);
  }, [value]);

  return <>{count}</>;
}

export default function HomeHeroSection({ totalBerita }) {
  const { t } = useLanguage();

  // Hitung jumlah artikel berita dinamis:
  // Contoh: 216 -> 200+, 231 -> 200+, 253 -> 250+, 299 -> 250+, 301 -> 300+
  const formattedBeritaCount = React.useMemo(() => {
    const total = Number(totalBerita || 0);
    if (total <= 0) return "150+";
    if (total < 50) {
      return `${Math.max(10, Math.floor(total / 10) * 10)}+`;
    }
    const rounded = Math.floor(total / 50) * 50;
    return `${rounded}+`;
  }, [totalBerita]);

  return (
    <section className="relative min-h-[580px] lg:min-h-[640px] xl:min-h-[700px] w-full overflow-hidden bg-slate-950 flex items-center pt-28 pb-16 sm:pt-32 sm:pb-20 lg:pt-36 lg:pb-16">
      <div className="absolute inset-0 z-0">
        <Image
          src="/assets/images/kantor-kemenag.jpg"
          alt="Kantor Kementerian Agama Kabupaten Barito Utara"
          fill
          sizes="100vw"
          quality={75}
          className="object-cover opacity-30 mix-blend-luminosity scale-105"
          priority
          fetchPriority="high"
        />
        <div className="absolute inset-0 bg-gradient-to-tr from-slate-950 via-slate-950/90 to-emerald-950/60" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(16,185,129,0.12),transparent_40%),radial-gradient(circle_at_bottom_left,rgba(5,150,105,0.08),transparent_30%)]" />
        <div className="absolute -left-20 top-10 h-[400px] w-[400px] rounded-full bg-emerald-500/10 blur-[100px] animate-pulse" />
        <div className="absolute -right-20 bottom-10 h-[300px] w-[300px] rounded-full bg-blue-500/5 blur-[80px] animate-pulse delay-700" />
      </div>

      <div className="relative z-10 w-full px-5 py-6 sm:px-10 sm:py-12 lg:py-8 lg:px-16 xl:px-24">
        <div className="mx-auto grid max-w-[1600px] items-center gap-8 lg:grid-cols-[1.1fr_0.9fr] lg:gap-16">
          <div className="flex flex-col">
            <div className="group flex w-fit items-center gap-3 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-4 py-1.5 backdrop-blur-md transition-all hover:border-emerald-500/50 animate-fade-in-up">
              <span className="relative flex h-1.5 w-1.5">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-emerald-500"></span>
              </span>
              <span className="text-[9px] font-black uppercase tracking-[0.4em] text-emerald-400">
                {t("home.hero.badge")}
              </span>
            </div>

            <h1 className="mt-5 max-w-3xl text-3.5xl font-black leading-[1.15] tracking-tight text-white sm:text-4xl md:text-5xl lg:text-5xl xl:text-6xl animate-fade-in-up animate-delay-100">
              {t("home.hero.title")
                .split("HAPAKAT")
                .map((part, i, arr) => (
                  <React.Fragment key={i}>
                    {part}
                    {i < arr.length - 1 && (
                      <Image
                        src="/assets/branding/hapakat.webp"
                        alt="Hapakat"
                        width={200}
                        height={60}
                        className="h-[0.9em] w-auto object-contain inline-block -mt-2 mx-1"
                        style={{ width: "auto" }}
                        unoptimized
                      />
                    )}
                  </React.Fragment>
                ))}
            </h1>

            <p className="mt-4 max-w-2xl text-sm leading-relaxed text-slate-300 sm:text-base lg:leading-loose animate-fade-in-up animate-delay-200">
              {t("home.hero.description")}
            </p>

            <div className="mt-7 sm:mt-8 flex flex-col xs:flex-row flex-wrap gap-4 sm:gap-5 animate-fade-in-up animate-delay-300">
              {/* Tombol Akses Layanan PTSP - Premium Glowing & Shimmer Animation */}
              <a
                href="https://ptsp.kemenag-baritoutara.com/"
                target="_blank"
                rel="noopener noreferrer"
                className="group relative flex items-center justify-center gap-3.5 overflow-hidden rounded-full bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-500 px-7 py-4 sm:py-4 text-[12px] font-black uppercase tracking-widest text-white shadow-[0_0_25px_-5px_rgba(16,185,129,0.5)] transition-all duration-300 hover:scale-[1.03] hover:shadow-[0_0_35px_2px_rgba(16,185,129,0.7)] hover:-translate-y-1 active:scale-[0.97]"
              >
                {/* Continuous Shimmer Light Beam */}
                <span className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/30 to-transparent transition-transform duration-1000 group-hover:translate-x-full" />

                {/* Animated Pulsing Ring Icon */}
                <span className="relative z-10 flex h-6 w-6 items-center justify-center rounded-full bg-white/20 backdrop-blur-sm transition-transform duration-300 group-hover:scale-110">
                  <span className="absolute h-full w-full animate-ping rounded-full bg-white/40 opacity-75" />
                  <SparklesIcon className="h-3.5 w-3.5 text-white" />
                </span>

                <span className="relative z-10 drop-shadow-sm">
                  {t("home.hero.ctaLayanan")}
                </span>

                <ArrowRightIcon className="relative z-10 h-4 w-4 transition-transform duration-300 group-hover:translate-x-1.5" />
              </a>

              {/* Tombol Lihat Berita - Modern Glassmorphism & Animated Border Glow */}
              <Link
                href="/berita"
                className="group relative flex items-center justify-center gap-3 overflow-hidden rounded-full border border-emerald-500/30 bg-slate-900/60 px-7 py-4 sm:py-4 text-[12px] font-black uppercase tracking-widest text-emerald-400 backdrop-blur-xl transition-all duration-300 hover:border-emerald-400/80 hover:bg-emerald-500/10 hover:text-white hover:shadow-[0_0_25px_-5px_rgba(16,185,129,0.3)] hover:-translate-y-1 active:scale-[0.97]"
              >
                {/* Subtle Hover Sweep */}
                <span className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-emerald-500/20 to-transparent transition-transform duration-700 group-hover:translate-x-full" />

                <span className="relative z-10 transition-colors">
                  {t("home.hero.ctaBerita")}
                </span>

                <NewspaperIcon className="relative z-10 h-4 w-4 text-emerald-400/80 transition-all duration-300 group-hover:rotate-12 group-hover:scale-110 group-hover:text-emerald-300" />
              </Link>
            </div>

            <div className="mt-8 lg:mt-12 grid grid-cols-3 gap-4 sm:gap-6 sm:max-w-lg animate-fade-in-up animate-delay-400">
              {[
                { number: "50+", label: t("home.stats.layanan") },
                { number: formattedBeritaCount, label: t("home.stats.berita") },
                { number: "100%", label: t("home.stats.dokumen") },
              ].map((stat, i) => (
                <div
                  key={i}
                  className="group flex flex-col gap-1 cursor-pointer transition-transform hover:-translate-y-1"
                >
                  <span className="text-xl font-black text-white lg:text-3xl">
                    <AnimatedCounter value={stat.number} />
                  </span>
                  <div className="h-0.5 w-6 rounded-full bg-emerald-500/50 transition-all group-hover:w-full group-hover:bg-emerald-500" />
                  <p className="text-[9px] font-black uppercase tracking-widest text-emerald-500/80">
                    {stat.label}
                  </p>
                </div>
              ))}
            </div>
          </div>

          <div className="relative hidden lg:block animate-fade-in animate-delay-500">
            <div className="animate-float">
              <HomeFocusCard t={t} />
            </div>
            <div className="absolute -right-6 -top-6 h-20 w-20 rounded-2xl border border-emerald-500/20 bg-emerald-500/5 backdrop-blur-sm animate-pulse" />
            <div className="absolute -bottom-8 -left-8 h-24 w-24 rounded-full border border-blue-500/20 bg-blue-500/5 backdrop-blur-sm" />
          </div>
        </div>
      </div>

      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 opacity-30 hidden lg:block">
        <div className="h-8 w-5 rounded-full border-2 border-white/20 p-1">
          <div className="mx-auto h-1.5 w-0.5 rounded-full bg-white" />
        </div>
      </div>
    </section>
  );
}

function HomeFocusCard({ t }) {
  const { siteInfo } = useSiteSettings();
  return (
    <div className="group relative overflow-hidden rounded-[32px] border border-white/10 bg-slate-900/40 p-1 shadow-2xl backdrop-blur-3xl transition-all duration-700 hover:border-emerald-500/30 hover:bg-slate-900/60 hover:-translate-y-1">
      <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/10 to-transparent opacity-0 transition-opacity duration-700 group-hover:opacity-100" />

      <div className="relative rounded-[28px] bg-slate-950/50 p-6 xl:p-8">
        <div className="flex items-center gap-5">
          <div className="relative">
            <div className="absolute -inset-1.5 rounded-2xl bg-emerald-500/20 blur-lg animate-pulse" />
            <div className="relative flex h-16 w-16 items-center justify-center rounded-2xl border border-white/10 bg-slate-900 p-3 shadow-inner">
              <Image
                src={siteInfo.logoSrc}
                alt={siteInfo.shortName}
                width={50}
                height={50}
                style={{ width: "auto", height: "auto" }}
                className="object-contain"
                unoptimized
              />
            </div>
          </div>
          <div>
            <p className="text-[9px] font-black uppercase tracking-[0.5em] text-emerald-400 opacity-80">
              {siteInfo.shortName}
            </p>
            <h2 className="mt-1 text-xl font-black tracking-tight text-white">
              {t("home.focus.subtitle")}
            </h2>
          </div>
        </div>

        <div className="mt-8 space-y-5 rounded-[24px] border border-white/5 bg-white/5 p-6 transition-colors group-hover:bg-white/[0.08]">
          <div className="flex items-center gap-3">
            <div className="h-1 w-6 rounded-full bg-emerald-500" />
            <p className="text-[9px] font-black uppercase tracking-[0.4em] text-emerald-400">
              {t("home.focus.title")}
            </p>
          </div>

          <div className="space-y-4">
            {[
              t("home.focus.point1"),
              t("home.focus.point2"),
              t("home.focus.point3"),
            ].map((item, i) => (
              <div key={i} className="flex items-start gap-3 group/item">
                <div className="mt-1 flex h-3.5 w-3.5 shrink-0 items-center justify-center rounded-full border border-emerald-500/50 text-[9px] text-emerald-500 transition-colors group-hover/item:bg-emerald-500 group-hover/item:text-white">
                  ✓
                </div>
                <p className="text-[13px] leading-relaxed text-slate-400 transition-colors group-hover/item:text-slate-200">
                  {item}
                </p>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-6 grid grid-cols-2 gap-3">
          <StatusBox
            label={t("home.focus.statusTitle")}
            value={t("home.focus.statusValue")}
            color="bg-emerald-500"
            glow="shadow-emerald-500/40"
          />
          <StatusBox
            label={t("home.focus.accessTitle")}
            value={t("home.focus.accessValue")}
            color="bg-blue-500"
            glow="shadow-blue-500/40"
          />
        </div>
      </div>
    </div>
  );
}

function StatusBox({ label, value, color, glow }) {
  return (
    <div className="rounded-2xl border border-white/5 bg-white/5 p-4 cursor-pointer transition-all hover:scale-[1.03] hover:-translate-y-0.5">
      <p className="text-[8px] font-black uppercase tracking-[0.3em] text-emerald-400/70">
        {label}
      </p>
      <div className="mt-2 flex items-center gap-2">
        <div
          className={`h-2 w-2 rounded-full ${color} ${glow} shadow-[0_0_8px_rgba(0,0,0,0.5)] animate-pulse`}
        />
        <p className="text-base font-black text-white">{value}</p>
      </div>
    </div>
  );
}

function ArrowRightIcon({ className = "" }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      className={className}
      aria-hidden="true"
    >
      <path
        d="M5 12h14M12 5l7 7-7 7"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function SparklesIcon({ className = "" }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="currentColor"
      className={className}
      aria-hidden="true"
    >
      <path d="M12 2L9.5 9.5 2 12l7.5 2.5L12 22l2.5-7.5L22 12l-7.5-2.5L12 2z" />
    </svg>
  );
}

function PlusIcon({ className = "" }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      <path d="M5 12h14M12 5v14" />
    </svg>
  );
}

function NewspaperIcon({ className = "" }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      <path d="M4 22h16a2 2 0 0 0 2-2V4a2 2 0 0 0-2-2H8a2 2 0 0 0-2 2v16a2 2 0 0 1-2 2Zm0 0a2 2 0 0 1-2-2v-9c0-1.1.9-2 2-2h2" />
      <path d="M18 14h-8" />
      <path d="M15 18h-5" />
      <path d="M10 6h8v4h-8V6Z" />
    </svg>
  );
}
