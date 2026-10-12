"use client";

import React, { useState, useMemo } from "react";
import Image from "@/components/common/NextImage";
import {
  User,
  Users,
  Search,
  Check,
  Copy,
  BookOpen,
  Building2,
  ShieldCheck,
  Sparkles,
} from "lucide-react";
import PageBanner from "@/components/common/PageBanner";

function CopyNipButton({ nip, label = "Salin NIP" }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = (e) => {
    e.stopPropagation();
    if (!nip || nip === "-") return;
    navigator.clipboard.writeText(nip.replace(/\D/g, "") || nip);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (!nip || nip === "-") return null;

  return (
    <button
      type="button"
      onClick={handleCopy}
      title="Salin NIP ke clipboard"
      aria-label="Salin NIP"
      className="inline-flex items-center gap-1 rounded-md px-1.5 py-0.5 text-[10px] font-medium text-slate-500 hover:text-emerald-700 hover:bg-emerald-50 dark:text-slate-400 dark:hover:text-emerald-300 dark:hover:bg-emerald-950/40 transition-colors"
    >
      {copied ? (
        <>
          <Check className="h-3 w-3 text-emerald-600 dark:text-emerald-400" />
          <span className="text-emerald-600 dark:text-emerald-400 font-semibold">Tersalin</span>
        </>
      ) : (
        <>
          <Copy className="h-3 w-3" />
          <span className="opacity-0 group-hover/nip:opacity-100 transition-opacity hidden sm:inline">
            {label}
          </span>
        </>
      )}
    </button>
  );
}

export default function SeksiDetailUI({ data, breadcrumb, menuTitle }) {
  const [searchQuery, setSearchQuery] = useState("");

  if (!data) return null;

  const pegawaiList = Array.isArray(data.pegawai) ? data.pegawai : [];

  const filteredPegawai = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return pegawaiList;
    return pegawaiList.filter((p) => {
      const nama = (p.nama || "").toLowerCase();
      const jabatan = (p.jabatan || "").toLowerCase();
      const nip = (p.nip || "").toLowerCase();
      return nama.includes(q) || jabatan.includes(q) || nip.includes(q);
    });
  }, [pegawaiList, searchQuery]);

  return (
    <div className="min-h-screen bg-slate-50/50 pb-20 dark:bg-[#050B14]">
      <PageBanner
        title={menuTitle || data.judul}
        description={`Profil kepegawaian dan struktur staf ${data.judul || menuTitle} Kantor Kementerian Agama Kabupaten Barito Utara.`}
        breadcrumb={breadcrumb}
        eyebrow="Informasi Kepegawaian"
      />

      {/* Main Content Area - Full Width matching PageBanner */}
      <div className="w-full px-6 sm:px-10 lg:px-16 xl:px-20 mt-8 sm:mt-12 relative z-10 space-y-8">

        {/* 1. Profil Kepala Seksi / Pejabat Struktural */}
        <div className="relative overflow-hidden rounded-3xl border border-slate-200/90 bg-white p-6 sm:p-8 shadow-sm transition-all hover:shadow-md dark:border-slate-800 dark:bg-[#0B1120]">
          {/* Subtle Ambient Background Gradient */}
          <div className="absolute top-0 right-0 -mr-20 -mt-20 h-64 w-64 rounded-full bg-emerald-500/10 blur-3xl pointer-events-none" />
          <div className="absolute top-0 inset-x-0 h-[2px] bg-gradient-to-r from-transparent via-emerald-500/50 to-transparent" />

          <div className="relative z-10 flex flex-col sm:flex-row items-center sm:items-start gap-6 sm:gap-8">
            {/* Foto Kepala */}
            <div className="relative shrink-0">
              <div className="relative h-28 w-28 sm:h-32 sm:w-32 rounded-3xl overflow-hidden bg-slate-100 dark:bg-slate-800 border-2 border-emerald-500/30 shadow-md">
                {data.foto_kepala ? (
                  <Image
                    src={data.foto_kepala}
                    alt={data.nama_kepala || "Kepala Seksi"}
                    width={128}
                    height={128}
                    className="h-full w-full object-cover"
                    style={{ objectPosition: `50% ${data.foto_kepala_y ?? 50}%` }}
                    priority
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-emerald-700 to-teal-800 text-white">
                    <User className="h-12 w-12 text-white/70" />
                  </div>
                )}
              </div>
              <div className="absolute -bottom-1 -right-1 h-6 w-6 rounded-full border-2 border-white bg-emerald-500 dark:border-slate-900 flex items-center justify-center shadow-sm" title="Status Aktif">
                <Check className="h-3.5 w-3.5 text-white stroke-[3]" />
              </div>
            </div>

            {/* Info Kepala */}
            <div className="text-center sm:text-left flex-1 space-y-2.5">
              <div className="inline-flex items-center gap-1.5 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3 py-1 text-[11px] font-extrabold uppercase tracking-widest text-emerald-700 dark:text-emerald-400">
                <Building2 className="h-3.5 w-3.5" />
                <span>
                  {data.slug === "sekjen"
                    ? "Kepala Sub Bagian Tata Usaha"
                    : data.slug === "kepala-kantor"
                    ? "Kepala Kantor"
                    : `Kepala ${data.judul || "Bidang"}`}
                </span>
              </div>

              <div>
                <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-slate-900 dark:text-white uppercase leading-tight">
                  {data.nama_kepala || "-"}
                </h2>
                <p className="mt-1 text-xs sm:text-sm font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                  {data.judul}
                </p>
              </div>

              {/* NIP Badge */}
              <div className="group/nip inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-1.5 dark:border-slate-800 dark:bg-slate-900/80">
                <ShieldCheck className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                <span className="font-mono text-xs sm:text-sm font-bold text-slate-700 dark:text-slate-200 tracking-wider">
                  {data.nip_kepala ? `NIP. ${data.nip_kepala}` : "NIP. -"}
                </span>
                <CopyNipButton nip={data.nip_kepala} />
              </div>
            </div>
          </div>
        </div>

        {/* 2. Ringkasan Tugas & Fungsi (Tupoksi) */}
        {data.deskripsi && (
          <div className="rounded-3xl border border-slate-200/90 bg-white p-6 sm:p-8 shadow-sm dark:border-slate-800 dark:bg-[#0B1120]">
            <div className="flex items-center gap-3 pb-4 border-b border-slate-100 dark:border-slate-800">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-400">
                <BookOpen className="h-5 w-5" />
              </div>
              <div>
                <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white">
                  Tugas Pokok &amp; Fungsi
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Landasan operasional dan mandat layanan {data.judul}.
                </p>
              </div>
            </div>
            <div className="mt-4">
              <p className="text-sm leading-relaxed text-slate-700 dark:text-slate-300 font-normal">
                {data.deskripsi}
              </p>
            </div>
          </div>
        )}

        {/* 3. Daftar Pegawai & Staf */}
        <div className="rounded-3xl border border-slate-200/90 bg-white shadow-sm dark:border-slate-800 dark:bg-[#0B1120]">
          {/* Header & Search */}
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 p-6 sm:p-8 border-b border-slate-100 dark:border-slate-800">
            <div className="space-y-1">
              <div className="flex items-center gap-2.5">
                <h3 className="text-lg sm:text-xl font-bold tracking-tight text-slate-900 dark:text-white">
                  Struktur Pegawai &amp; Staf
                </h3>
                <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-2.5 py-0.5 text-xs font-bold text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300">
                  <Users className="h-3 w-3" />
                  {pegawaiList.length} Pegawai
                </span>
              </div>
              <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
                Aparatur Sipil Negara (ASN) dan staf yang bertugas melayani di {data.judul}.
              </p>
            </div>

            {/* Search Input Realtime */}
            {pegawaiList.length > 0 && (
              <div className="relative w-full md:w-80">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 pointer-events-none" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Cari nama atau jabatan..."
                  className="w-full pl-10 pr-4 py-2.5 rounded-2xl border border-slate-200 bg-slate-50 text-xs sm:text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-100 dark:placeholder:text-slate-500 transition-all"
                />
                {searchQuery && (
                  <button
                    type="button"
                    onClick={() => setSearchQuery("")}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                  >
                    Reset
                  </button>
                )}
              </div>
            )}
          </div>

          {/* Grid Pegawai */}
          <div className="p-6 sm:p-8">
            {filteredPegawai.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-5">
                {filteredPegawai.map((pegawai, idx) => (
                  <div
                    key={pegawai.id || idx}
                    className="group relative flex flex-col items-center text-center p-5 rounded-2xl border border-slate-100 bg-slate-50/70 hover:bg-white hover:border-emerald-300/60 hover:shadow-lg transition-all duration-300 dark:border-slate-800/80 dark:bg-slate-900/40 dark:hover:bg-slate-900 dark:hover:border-emerald-700/50"
                  >
                    {/* Glowing Top Line on Hover */}
                    <div className="absolute top-0 inset-x-0 h-[2px] bg-gradient-to-r from-transparent via-emerald-400 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-t-2xl" />

                    {/* Foto Pegawai */}
                    <div className="relative h-20 w-20 mb-3.5 rounded-2xl overflow-hidden bg-slate-200 dark:bg-slate-800 ring-2 ring-white dark:ring-slate-950 shadow-sm flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform duration-300">
                      {pegawai.foto ? (
                        <Image
                          src={pegawai.foto}
                          alt={pegawai.nama || "Pegawai"}
                          width={80}
                          height={80}
                          className="h-full w-full object-cover"
                          style={{ objectPosition: `50% ${pegawai.foto_y ?? 50}%` }}
                          loading="lazy"
                        />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-emerald-600 to-teal-700 text-white">
                          <User className="h-10 w-10 text-white/80" />
                        </div>
                      )}
                    </div>

                    {/* Nama Pegawai */}
                    <h4 className="font-bold text-sm text-slate-900 dark:text-white leading-snug line-clamp-2 min-h-[2.5rem] flex items-center justify-center">
                      {pegawai.nama}
                    </h4>

                    {/* Jabatan Pegawai */}
                    <div className="mt-2 w-full">
                      <span className="inline-block w-full rounded-lg bg-emerald-50 dark:bg-emerald-950/40 px-2 py-1 text-[11px] font-semibold text-emerald-800 dark:text-emerald-300 leading-snug line-clamp-2">
                        {pegawai.jabatan || "Staf Pelaksana"}
                      </span>
                    </div>

                    {/* NIP Pegawai */}
                    <div className="group/nip mt-2.5 flex items-center justify-center gap-1 text-[11px] text-slate-500 dark:text-slate-400 font-mono">
                      <span>NIP. {pegawai.nip || "-"}</span>
                      <CopyNipButton nip={pegawai.nip} />
                    </div>
                  </div>
                ))}
              </div>
            ) : pegawaiList.length > 0 ? (
              <div className="py-12 text-center space-y-3">
                <Search className="h-10 w-10 text-slate-300 dark:text-slate-600 mx-auto" />
                <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                  Tidak ditemukan pegawai dengan kata kunci &quot;{searchQuery}&quot;
                </p>
                <button
                  type="button"
                  onClick={() => setSearchQuery("")}
                  className="text-xs font-bold text-emerald-600 hover:underline"
                >
                  Tampilkan seluruh pegawai
                </button>
              </div>
            ) : (
              <div className="py-12 text-center space-y-3">
                <Users className="h-12 w-12 text-slate-300 dark:text-slate-600 mx-auto" />
                <h4 className="text-sm font-bold text-slate-700 dark:text-slate-300">
                  Data Staf Sedang Dalam Proses Pembaruan
                </h4>
                <p className="text-xs text-slate-500 dark:text-slate-400 max-w-md mx-auto">
                  Informasi struktur pegawai untuk {data.judul} sedang diselaraskan dengan data kepegawaian terbaru Kemenag Barito Utara.
                </p>
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
