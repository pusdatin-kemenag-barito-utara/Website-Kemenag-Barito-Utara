"use client";

import React from "react";

export default function NotFoundView() {
  return (
    <div
      id="not-found-page"
      data-page="404"
      className="fixed inset-0 z-[99999] flex h-dvh w-screen items-center justify-center overflow-hidden bg-slate-950 px-4 py-6 text-center selection:bg-emerald-500 selection:text-white"
    >
      <div className="pointer-events-none absolute -top-40 left-1/2 h-96 w-96 -translate-x-1/2 rounded-full bg-emerald-600/20 blur-[100px]" />
      <div className="pointer-events-none absolute -bottom-40 left-1/2 h-96 w-96 -translate-x-1/2 rounded-full bg-teal-600/15 blur-[100px]" />

      <div className="relative z-10 flex max-w-md flex-col items-center justify-center px-2">
        <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl border border-emerald-500/20 bg-emerald-950/50 p-3 shadow-xl backdrop-blur-xl ring-1 ring-white/10 sm:h-20 sm:w-20">
          <img
            src="/assets/icons/kemenag-192.png"
            alt="Logo Kemenag Barito Utara"
            width="64"
            height="64"
            className="h-full w-full object-contain drop-shadow-md"
          />
        </div>

        <h1 className="bg-gradient-to-r from-emerald-400 via-emerald-200 to-teal-400 bg-clip-text text-6xl font-black leading-none tracking-tight text-transparent sm:text-7xl md:text-8xl">
          404
        </h1>

        <h2 className="mt-3 text-lg font-black text-white sm:text-2xl">
          Halaman Tidak Ditemukan
        </h2>

        <p className="mt-2 text-xs leading-relaxed text-slate-300 sm:text-sm">
          Maaf, halaman yang Anda tuju tidak tersedia, telah dipindahkan, atau alamat URL yang Anda masukkan kurang tepat.
        </p>

        <div className="mt-6 flex w-full flex-col items-center justify-center gap-2.5 sm:flex-row sm:gap-3">
          <a
            href="/beranda"
            className="group relative flex w-full items-center justify-center gap-2 overflow-hidden rounded-xl bg-emerald-600 px-5 py-3 text-xs font-bold text-white shadow-md shadow-emerald-600/30 transition-all hover:bg-emerald-500 hover:shadow-lg active:scale-95 sm:w-auto sm:rounded-2xl sm:px-6 sm:py-3.5 sm:text-sm"
          >
            <svg className="h-4 w-4 transition-transform duration-300 group-hover:-translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Kembali ke Beranda
          </a>

          <a
            href="/berita"
            className="flex w-full items-center justify-center gap-2 rounded-xl border border-slate-800 bg-slate-900/80 px-5 py-3 text-xs font-bold text-slate-200 backdrop-blur-md transition-all hover:border-slate-700 hover:bg-slate-800 hover:text-white active:scale-95 sm:w-auto sm:rounded-2xl sm:px-6 sm:py-3.5 sm:text-sm"
          >
            Baca Berita Terbaru
          </a>
        </div>

        <p className="mt-8 text-[11px] font-medium tracking-wide text-slate-500 sm:text-xs">
          Kementerian Agama Kabupaten Barito Utara
        </p>
      </div>
    </div>
  );
}
