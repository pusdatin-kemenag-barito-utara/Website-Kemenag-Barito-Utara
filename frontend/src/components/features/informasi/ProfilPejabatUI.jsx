"use client";

import React, { useState } from "react";
import Link from "@/components/common/NextLink";
import PageBanner from "@/components/common/PageBanner";
import Avatar from "@/components/ui/Avatar";
import {
  Users,
  ShieldCheck,
  BadgeCheck,
  Building2,
  ChevronDown,
  ArrowRight,
  ExternalLink,
  Info,
  Sparkles,
} from "lucide-react";

function BadgeIcon() {
  return (
    <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="1.5">
      <path strokeLinecap="round" strokeLinejoin="round" d="M15 9h3.75M15 12h3.75M15 15h3.75M4.5 19.5h15a2.25 2.25 0 002.25-2.25V6.75A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25v10.5A2.25 2.25 0 004.5 19.5zm6-10.125a1.875 1.875 0 11-3.75 0 1.875 1.875 0 013.75 0zm1.294 6.336a6.721 6.721 0 01-3.17.789 6.721 6.721 0 01-3.168-.789 3.376 3.376 0 016.338 0z" />
    </svg>
  );
}

// ─── KEPALA KANTOR CARD (Featured Hero Card) ──────────────────────────────────
function KepalaKantorCard({ pejabat }) {
  return (
    <div className="group relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-900 via-emerald-950 to-slate-900 border border-slate-800/80 text-white shadow-2xl transition-all duration-500 hover:border-emerald-500/40 animate-fade-in-up">
      {/* Subtle Ambient Glow Effect */}
      <div className="absolute top-0 right-0 -mr-24 -mt-24 h-80 w-80 rounded-full bg-emerald-500/15 blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-0 -ml-24 -mb-24 h-72 w-72 rounded-full bg-teal-500/15 blur-3xl pointer-events-none" />
      
      {/* Glowing Top Line Accent */}
      <div className="absolute top-0 inset-x-0 h-[3px] bg-gradient-to-r from-transparent via-emerald-400 to-transparent opacity-70 group-hover:opacity-100 transition-opacity duration-500" />

      <div className="relative z-10 flex flex-col lg:flex-row items-center gap-8 lg:gap-12 p-8 lg:p-12">
        {/* Photo Container */}
        <div className="relative shrink-0">
          <div className="absolute inset-0 rounded-3xl bg-emerald-400/20 blur-2xl opacity-40 group-hover:opacity-80 transition-opacity duration-700 pointer-events-none" />
          <Avatar
            src={pejabat.foto_kepala}
            alt={pejabat.nama_kepala}
            className="relative h-60 w-60 lg:h-72 lg:w-72 overflow-hidden rounded-3xl border-2 border-emerald-500/30 shadow-2xl object-cover transition-transform duration-700 group-hover:scale-[1.02]"
            sizes="(max-width: 1024px) 15rem, 18rem"
            priority={true}
            foto_kepala_y={pejabat.foto_kepala_y ?? 50}
          />
        </div>

        {/* Info Content */}
        <div className="flex-1 text-center lg:text-left space-y-4">
          <div className="inline-flex items-center gap-2 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-4 py-1.5 text-xs font-extrabold uppercase tracking-widest text-emerald-300 shadow-sm">
            <Building2 className="h-4 w-4 text-emerald-400" />
            <span>Kepala Kantor</span>
          </div>
          
          <div>
            <h2 className="text-3xl lg:text-4xl font-black tracking-tight text-white leading-tight">
              {pejabat.nama_kepala}
            </h2>
            <p className="mt-2 text-xs lg:text-sm font-bold uppercase tracking-widest text-emerald-300/80">
              Kementerian Agama Kabupaten Barito Utara
            </p>
          </div>

          {/* NIP Badge */}
          <div className="flex flex-wrap items-center justify-center lg:justify-start gap-4 pt-1">
            <div className="inline-flex items-center gap-2.5 rounded-xl border border-emerald-800/80 bg-emerald-950/60 px-4 py-2 shadow-inner">
              <BadgeIcon />
              <span className="font-mono text-xs sm:text-sm font-bold text-emerald-100 tracking-wider">
                {pejabat.nip_kepala ? `NIP. ${pejabat.nip_kepala}` : "NIP. -"}
              </span>
            </div>
          </div>

          {/* Description */}
          {pejabat.deskripsi && (
            <div className="border-t border-emerald-800/40 pt-4">
              <p className="max-w-2xl text-xs sm:text-sm leading-relaxed text-slate-300 font-normal">
                {pejabat.deskripsi}
              </p>
            </div>
          )}

          {/* CTA Link */}
          <div className="pt-2 flex justify-center lg:justify-start">
            <Link
              href="/informasi/struktur-organisasi"
              className="inline-flex items-center gap-2.5 rounded-2xl bg-emerald-600 hover:bg-emerald-500 px-6 py-3.5 text-xs font-bold uppercase tracking-wider text-white shadow-lg shadow-emerald-900/40 transition-all duration-300 hover:scale-[1.02] active:scale-95"
            >
              <Users className="h-4 w-4" />
              <span>Lihat Struktur Organisasi</span>
              <ArrowRight className="h-4 w-4 animate-arrow-bounce ml-1" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── REGULAR PEJABAT CARD ─────────────────────────────────────────────────────
function PejabatCard({ pejabat }) {
  const [expanded, setExpanded] = useState(false);
  const isLong = pejabat.deskripsi && pejabat.deskripsi.length > 120;

  return (
    <div className="group relative flex flex-col justify-between overflow-hidden rounded-3xl border border-slate-200/80 bg-white p-6 shadow-md transition-all duration-300 hover:-translate-y-1.5 hover:border-emerald-500/40 hover:shadow-2xl dark:border-slate-800 dark:bg-slate-900 animate-fade-in-up h-full">
      {/* Glowing Top Line Accent */}
      <div className="absolute top-0 inset-x-0 h-[3px] bg-gradient-to-r from-transparent via-emerald-400 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

      <div className="flex flex-col items-center text-center space-y-4">
        {/* Photo Container */}
        <div className="relative shrink-0 mt-1">
          <div className="absolute inset-0 rounded-2xl bg-emerald-400/20 blur-md opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
          <Avatar
            src={pejabat.foto_kepala}
            alt={pejabat.nama_kepala}
            className="relative h-36 w-36 overflow-hidden rounded-2xl border-2 border-slate-200 shadow-sm transition-transform duration-500 group-hover:scale-105 dark:border-slate-700 object-cover"
            sizes="9rem"
            foto_kepala_y={pejabat.foto_kepala_y ?? 50}
          />
        </div>

        {/* Name & Position */}
        <div className="w-full space-y-1.5">
          <h3 className="text-base font-black text-slate-900 dark:text-white leading-snug group-hover:text-emerald-700 dark:group-hover:text-emerald-400 transition-colors">
            {pejabat.nama_kepala}
          </h3>
          <p className="text-[11px] font-extrabold uppercase tracking-wider text-emerald-700 dark:text-emerald-400">
            {pejabat.judul === "Sub Bagian Tata Usaha"
              ? "Kepala Sub Bagian Tata Usaha"
              : `Kepala ${pejabat.judul}`}
          </p>

          <div className="inline-flex items-center justify-center gap-1.5 rounded-lg bg-slate-100 px-3 py-1 text-[11px] dark:bg-slate-800 dark:text-slate-300">
            <BadgeIcon />
            <span className="font-mono font-bold text-slate-600 dark:text-slate-300 tracking-wide">
              {pejabat.nip_kepala ? `NIP. ${pejabat.nip_kepala}` : "NIP. -"}
            </span>
          </div>
        </div>

        {/* Description */}
        {pejabat.deskripsi && (
          <div className="w-full text-left border-t border-slate-100 dark:border-slate-800 pt-4">
            <p
              className={`text-xs text-slate-600 dark:text-slate-400 leading-relaxed ${
                !expanded && isLong ? "line-clamp-3" : ""
              }`}
            >
              {pejabat.deskripsi}
            </p>
            {isLong && (
              <div className="mt-2 text-center">
                <button
                  onClick={() => setExpanded(!expanded)}
                  className="inline-flex items-center justify-center gap-1 text-[10px] font-bold uppercase tracking-wider text-emerald-700 dark:text-emerald-400 hover:underline"
                >
                  <span>{expanded ? "Tutup" : "Selengkapnya"}</span>
                  <ChevronDown
                    className={`h-3.5 w-3.5 transition-transform duration-300 ${
                      expanded ? "rotate-180" : ""
                    }`}
                  />
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Footer Link (Staf Pegawai) */}
      {pejabat._count?.pegawai_seksi != null && (
        <div className="w-full pt-4 mt-4 border-t border-slate-100 dark:border-slate-800">
          <Link
            href={pejabat.slug ? `/informasi/profil-pejabat/${pejabat.slug}` : "#"}
            className="group/btn flex items-center justify-center gap-2 rounded-2xl bg-emerald-50 hover:bg-emerald-600 py-3 text-xs font-bold uppercase tracking-wider text-emerald-800 hover:text-white shadow-sm transition-all duration-300 dark:bg-emerald-950/40 dark:text-emerald-300 dark:hover:bg-emerald-600 dark:hover:text-white"
          >
            <Users className="h-4 w-4" />
            <span>{pejabat._count.pegawai_seksi} Staf Pegawai</span>
            <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover/btn:translate-x-1" />
          </Link>
        </div>
      )}
    </div>
  );
}

// ─── MAIN COMPONENT ──────────────────────────────────────────────────────────
export default function ProfilPejabatUI({
  breadcrumb,
  kepalaKantor,
  pejabatList,
}) {
  return (
    <main className="min-h-screen bg-slate-50 transition-colors dark:bg-slate-950">
      <PageBanner
        title="Profil Pejabat"
        description="Kenali para pemimpin dan pejabat struktural yang mengabdi di Kantor Kementerian Agama Kabupaten Barito Utara."
        breadcrumb={breadcrumb}
        eyebrow="Informasi Kepegawaian"
      />

      <section className="relative w-full px-6 py-8 sm:px-10 sm:py-12 lg:px-16 xl:px-20">
        <div className="w-full space-y-10 sm:space-y-12">
          {/* ── Kepala Kantor Featured Hero ── */}
          {kepalaKantor && (
            <section className="space-y-4">
              <div className="flex items-center gap-3">
                <span className="inline-flex items-center gap-2 rounded-full border border-emerald-300/60 bg-emerald-100/80 px-3.5 py-1 text-xs font-bold uppercase tracking-wider text-emerald-800 dark:border-emerald-800/50 dark:bg-emerald-950/40 dark:text-emerald-300">
                  <Sparkles className="h-3.5 w-3.5" />
                  <span>Pimpinan Tertinggi Kankemenag</span>
                </span>
              </div>
              <KepalaKantorCard pejabat={kepalaKantor} />
            </section>
          )}

          {/* ── Pejabat Struktural Grid ── */}
          {pejabatList && pejabatList.length > 0 && (
            <section className="space-y-6">
              <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <div className="inline-flex items-center gap-2 rounded-full border border-teal-300/60 bg-teal-100/80 px-3.5 py-1 text-xs font-bold uppercase tracking-wider text-teal-800 dark:border-teal-800/50 dark:bg-teal-950/40 dark:text-teal-300">
                    <Building2 className="h-3.5 w-3.5" />
                    <span>Pejabat Struktural</span>
                  </div>
                  <h2 className="mt-2 text-2xl font-black text-slate-900 dark:text-slate-100 sm:text-3xl">
                    Para Kepala Sub Bagian &amp; Kepala Seksi
                  </h2>
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Para pejabat memimpin seksi dan penyelenggara di Kemenag Barito Utara.
                </p>
              </div>

              <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {pejabatList.map((p) => (
                  <PejabatCard key={p.id} pejabat={p} />
                ))}
              </div>
            </section>
          )}

          {/* ── Bottom Info Strip ── */}
          <div className="rounded-3xl border border-slate-200/80 bg-white p-6 shadow-md dark:border-slate-800 dark:bg-slate-900 sm:p-8">
            <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
              <div className="flex items-start gap-4">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-400">
                  <Info className="h-6 w-6" />
                </div>
                <div>
                  <h3 className="text-lg font-black text-slate-900 dark:text-slate-100">
                    Informasi Layanan Kepegawaian
                  </h3>
                  <p className="mt-1 text-xs leading-relaxed text-slate-600 dark:text-slate-400 sm:text-sm">
                    Data profil pejabat dan struktur pegawai diperbarui secara berkala. Untuk informasi lebih lanjut mengenai kepegawaian, silakan menghubungi Sub Bagian Tata Usaha Kemenag Barito Utara.
                  </p>
                </div>
              </div>

              <Link
                href="/kontak"
                className="shrink-0 flex items-center justify-center gap-2 rounded-2xl bg-slate-900 hover:bg-emerald-600 px-6 py-3 text-xs font-bold text-white shadow-md transition-all duration-300 dark:bg-emerald-600 dark:hover:bg-emerald-500"
              >
                <span>Hubungi Kami</span>
                <ExternalLink className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
