"use client";

import React, { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { Sparkles, Download, Phone, Globe, Laptop, X, CheckCircle2, QrCode } from "lucide-react";
import { QRCodeSVG } from "qrcode.react";
import Image from "@/components/common/NextImage";

export default function PwaDownloadSection() {
  const [mounted, setMounted] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [isPwaModalOpen, setIsPwaModalOpen] = useState(false);
  const [isInstalled, setIsInstalled] = useState(() => {
    if (typeof window === "undefined") return false;
    return Boolean(
      window.matchMedia("(display-mode: standalone)").matches || window.navigator.standalone
    );
  });

  useEffect(() => {
    setMounted(true);
    const handleBeforeInstallPrompt = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
      window.deferredPwaPrompt = e;
    };

    const handleAppInstalled = () => {
      setIsInstalled(true);
      setDeferredPrompt(null);
      window.deferredPwaPrompt = null;
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
    window.addEventListener("appinstalled", handleAppInstalled);

    return () => {
      window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
      window.removeEventListener("appinstalled", handleAppInstalled);
    };
  }, []);

  useEffect(() => {
    if (isPwaModalOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isPwaModalOpen]);

  const handleInstallClick = async () => {
    const promptEvent = deferredPrompt || (typeof window !== "undefined" ? window.deferredPwaPrompt : null);
    if (promptEvent) {
      promptEvent.prompt();
      const { outcome } = await promptEvent.userChoice;
      if (outcome === "accepted") {
        setIsInstalled(true);
      }
      setDeferredPrompt(null);
      window.deferredPwaPrompt = null;
    } else {
      setIsPwaModalOpen(true);
    }
  };

  return (
    <div className="space-y-12">
      {/* Hero Card Download */}
      <div className="overflow-hidden rounded-3xl border border-emerald-200/80 bg-gradient-to-br from-emerald-900 via-teal-900 to-slate-900 p-8 sm:p-12 text-white shadow-2xl dark:border-emerald-800/50">
        <div className="flex flex-col lg:flex-row items-center justify-between gap-10">
          <div className="space-y-5 max-w-2xl text-center lg:text-left">
            <div className="inline-flex items-center gap-2 rounded-full border border-emerald-400/40 bg-emerald-500/20 px-4 py-1.5 text-xs font-bold text-emerald-300 uppercase tracking-wider">
              <Sparkles className="h-4 w-4" />
              <span>Aplikasi Web Resmi (PWA)</span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-black tracking-tight text-white leading-tight">
              Pasang Portal Digital Kemenag Barito Utara
            </h2>
            <p className="text-sm sm:text-base text-slate-200 leading-relaxed">
              Nikmati kemudahan akses berita resmi, pengumuman penting, layanan publik, dan informasi keagamaan Kabupaten Barito Utara langsung dari layar utama perangkat Anda tanpa perlu membuka browser.
            </p>
            
            <div className="pt-2 flex flex-wrap items-center justify-center lg:justify-start gap-4">
              <button
                onClick={handleInstallClick}
                className="inline-flex items-center gap-3 rounded-2xl bg-amber-500 px-8 py-4 text-base font-bold text-slate-950 shadow-lg transition-all hover:bg-amber-400 hover:shadow-amber-500/30 active:scale-95"
              >
                {isInstalled ? <CheckCircle2 className="h-5 w-5 text-emerald-950" /> : <Download className="h-5 w-5" />}
                <span>{isInstalled ? "Aplikasi Sudah Terpasang" : "Install Portal Sekarang"}</span>
              </button>
            </div>
          </div>

          {/* Dynamic Live QR Code Card */}
          <div className="flex flex-col items-center justify-center p-6 rounded-3xl border border-emerald-400/30 bg-white/10 backdrop-blur-xl shadow-2xl text-center shrink-0 w-full sm:w-auto">
            <div className="p-3 bg-white rounded-2xl shadow-lg border border-slate-100">
              <QRCodeSVG
                value={typeof window !== "undefined" ? window.location.href : "https://baritoutara.kemenag.go.id/layanan/download-app"}
                size={140}
                bgColor="#FFFFFF"
                fgColor="#000000"
                level="H"
                imageSettings={{
                  src: "/assets/icons/kemenag-192.png",
                  x: undefined,
                  y: undefined,
                  height: 28,
                  width: 28,
                  excavate: true,
                }}
              />
            </div>
            
            <div className="mt-3.5 space-y-1">
              <div className="inline-flex items-center gap-1.5 text-amber-300 font-bold text-xs uppercase tracking-wider">
                <QrCode className="h-3.5 w-3.5" />
                <span>Scan dari Kamera HP</span>
              </div>
              <p className="text-[11px] text-slate-200">Arahkan kamera HP Anda ke QR Code</p>
            </div>
          </div>
        </div>
      </div>

      {/* 3 Grid Card Panduan Perangkat */}
      <div>
        <h3 className="text-xl font-black text-slate-900 dark:text-slate-100 mb-6 text-center sm:text-left">
          Panduan Pemasangan Berdasarkan Perangkat
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Android */}
          <div className="rounded-3xl border border-slate-200/80 bg-white p-6 shadow-md transition-all dark:border-slate-800 dark:bg-slate-900">
            <div className="flex items-center gap-3 mb-4 text-emerald-700 dark:text-emerald-400 font-bold text-base">
              <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-emerald-100 dark:bg-emerald-950/60">
                <Phone className="h-5 w-5" />
              </div>
              <span>Android (Chrome)</span>
            </div>
            <ol className="text-xs text-slate-600 dark:text-slate-300 space-y-3 font-medium">
              <li className="flex items-start gap-2.5">
                <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-emerald-600 text-[11px] font-bold text-white">1</span>
                <span>Buka website via Google Chrome.</span>
              </li>
              <li className="flex items-start gap-2.5">
                <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-emerald-600 text-[11px] font-bold text-white">2</span>
                <span>Ketik tombol &quot;Install Portal Sekarang&quot; di atas atau menu Titik Tiga pojok kanan browser.</span>
              </li>
              <li className="flex items-start gap-2.5">
                <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-emerald-600 text-[11px] font-bold text-white">3</span>
                <span>Pilih &quot;Tambahkan ke Layar Utama&quot;.</span>
              </li>
            </ol>
          </div>

          {/* iPhone */}
          <div className="rounded-3xl border border-slate-200/80 bg-white p-6 shadow-md transition-all dark:border-slate-800 dark:bg-slate-900">
            <div className="flex items-center gap-3 mb-4 text-emerald-700 dark:text-emerald-400 font-bold text-base">
              <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-emerald-100 dark:bg-emerald-950/60">
                <Globe className="h-5 w-5" />
              </div>
              <span>iPhone / iPad (Safari)</span>
            </div>
            <ol className="text-xs text-slate-600 dark:text-slate-300 space-y-3 font-medium">
              <li className="flex items-start gap-2.5">
                <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-emerald-600 text-[11px] font-bold text-white">1</span>
                <span>Buka website via Browser Safari.</span>
              </li>
              <li className="flex items-start gap-2.5">
                <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-emerald-600 text-[11px] font-bold text-white">2</span>
                <span>Ketuk ikon &quot;Bagikan (Share)&quot; di bagian bawah layar.</span>
              </li>
              <li className="flex items-start gap-2.5">
                <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-emerald-600 text-[11px] font-bold text-white">3</span>
                <span>Pilih opsi &quot;Tambah ke Layar Utama&quot;.</span>
              </li>
            </ol>
          </div>

          {/* Laptop */}
          <div className="rounded-3xl border border-slate-200/80 bg-white p-6 shadow-md transition-all dark:border-slate-800 dark:bg-slate-900">
            <div className="flex items-center gap-3 mb-4 text-emerald-700 dark:text-emerald-400 font-bold text-base">
              <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-emerald-100 dark:bg-emerald-950/60">
                <Laptop className="h-5 w-5" />
              </div>
              <span>Laptop / PC</span>
            </div>
            <ol className="text-xs text-slate-600 dark:text-slate-300 space-y-3 font-medium">
              <li className="flex items-start gap-2.5">
                <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-emerald-600 text-[11px] font-bold text-white">1</span>
                <span>Gunakan Chrome atau Microsoft Edge.</span>
              </li>
              <li className="flex items-start gap-2.5">
                <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-emerald-600 text-[11px] font-bold text-white">2</span>
                <span>Klik ikon Install / Komputer Kecil di bilah URL address bar.</span>
              </li>
              <li className="flex items-start gap-2.5">
                <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-emerald-600 text-[11px] font-bold text-white">3</span>
                <span>Buka aplikasi langsung dari Desktop.</span>
              </li>
            </ol>
          </div>
        </div>
      </div>

      {/* Floating Custom PWA Instruction Modal */}
      {mounted &&
        isPwaModalOpen &&
        createPortal(
          <div
            className="fixed inset-0 z-[99999] flex items-center justify-center bg-slate-950/70 p-4 sm:p-6 backdrop-blur-md transition-all duration-300 animate-in fade-in"
            onClick={() => setIsPwaModalOpen(false)}
          >
            <div
              className="relative flex w-full max-w-lg flex-col overflow-hidden rounded-3xl border border-emerald-500/40 bg-gradient-to-b from-slate-900 via-slate-900 to-emerald-950 text-slate-100 shadow-[0_25px_80px_rgba(0,0,0,0.8)] backdrop-blur-2xl animate-in zoom-in-95 duration-200 p-6 sm:p-8"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between pb-4 border-b border-slate-800/80">
                <div className="flex items-center gap-3">
                  <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-amber-500/20 text-amber-400 border border-amber-500/30 shadow-inner">
                    <Sparkles className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="text-base font-black text-white">Panduan Install Aplikasi PWA</h3>
                    <p className="text-xs text-emerald-400/90 font-medium">Kemenag Kabupaten Barito Utara</p>
                  </div>
                </div>
                <button
                  onClick={() => setIsPwaModalOpen(false)}
                  className="flex h-9 w-9 items-center justify-center rounded-xl bg-slate-800/80 text-slate-400 transition-all hover:bg-red-500/20 hover:text-red-400"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <div className="mt-5 space-y-3.5 text-xs">
                <div className="rounded-2xl border border-slate-800/80 bg-slate-800/40 p-4 space-y-1.5">
                  <div className="flex items-center gap-2.5 text-amber-400 font-bold text-xs uppercase tracking-wider">
                    <Phone className="h-4 w-4" />
                    <span>Android (Google Chrome)</span>
                  </div>
                  <p className="text-slate-300 leading-relaxed pl-6">
                    Ketik menu <strong className="text-white">Titik Tiga</strong> di pojok kanan atas browser &rarr; pilih <strong className="text-amber-300">&quot;Tambahkan ke Layar Utama&quot;</strong> atau <strong className="text-amber-300">&quot;Install Aplikasi&quot;</strong>.
                  </p>
                </div>

                <div className="rounded-2xl border border-slate-800/80 bg-slate-800/40 p-4 space-y-1.5">
                  <div className="flex items-center gap-2.5 text-amber-400 font-bold text-xs uppercase tracking-wider">
                    <Globe className="h-4 w-4" />
                    <span>iPhone / iPad (Safari)</span>
                  </div>
                  <p className="text-slate-300 leading-relaxed pl-6">
                    Ketuk tombol <strong className="text-white">Bagikan (Share)</strong> di bagian navigasi Safari &rarr; pilih <strong className="text-amber-300">&quot;Tambah ke Layar Utama&quot;</strong>.
                  </p>
                </div>

                <div className="rounded-2xl border border-slate-800/80 bg-slate-800/40 p-4 space-y-1.5">
                  <div className="flex items-center gap-2.5 text-amber-400 font-bold text-xs uppercase tracking-wider">
                    <Laptop className="h-4 w-4" />
                    <span>Laptop / PC (Chrome / Edge)</span>
                  </div>
                  <p className="text-slate-300 leading-relaxed pl-6">
                    Klik ikon <strong className="text-white">Install / Komputer Kecil</strong> yang ada di kanan bilah alamat URL (address bar) browser Anda.
                  </p>
                </div>
              </div>

              <div className="mt-6 pt-4 border-t border-slate-800/80">
                <button
                  onClick={() => setIsPwaModalOpen(false)}
                  className="w-full rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 py-3.5 text-xs font-bold text-white shadow-lg transition-all hover:from-emerald-500 hover:to-teal-500"
                >
                  Saya Mengerti
                </button>
              </div>
            </div>
          </div>,
          document.body
        )}
    </div>
  );
}
