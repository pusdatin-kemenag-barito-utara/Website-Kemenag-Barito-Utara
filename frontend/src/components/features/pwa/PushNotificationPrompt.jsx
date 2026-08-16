"use client";

import React, { useState, useEffect, useRef } from "react";
import Image from "@/components/common/NextImage";

export default function PushNotificationPrompt() {
  const [show, setShow] = useState(false);
  const timerRef = useRef(null);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const checkPermission = async () => {
      window.OneSignalDeferred = window.OneSignalDeferred || [];
      window.OneSignalDeferred.push(async function (OneSignal) {
        try {
          if (!OneSignal.Notifications || !OneSignal.Notifications.isPushSupported()) {
            return;
          }

          const permission = window.Notification ? window.Notification.permission : "default";
          let hasDismissedRecently = false;

          try {
            const dismissedAt = localStorage.getItem("onesignal-soft-prompt-dismissed");
            const now = Date.now();
            const SIX_HOURS = 6 * 60 * 60 * 1000;
            if (dismissedAt) {
              const parsed = parseInt(dismissedAt, 10);
              if (!isNaN(parsed) && now - parsed < SIX_HOURS) {
                hasDismissedRecently = true;
              }
            }
          } catch (_) {}

          if (permission === "default" && !hasDismissedRecently) {
            // Beri jeda 4 detik agar user fokus pada konten utama terlebih dahulu
            timerRef.current = setTimeout(() => {
              setShow(true);
            }, 4000);
          }
        } catch (_) {}
      });
    };

    checkPermission();

    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
    };
  }, []);

  const handleDismiss = () => {
    setShow(false);
    try {
      localStorage.setItem("onesignal-soft-prompt-dismissed", Date.now().toString());
    } catch (_) {}
  };

  const handleSubscribe = () => {
    setShow(false);
    try {
      localStorage.setItem("onesignal-soft-prompt-dismissed", Date.now().toString());
    } catch (_) {}

    window.OneSignalDeferred = window.OneSignalDeferred || [];
    window.OneSignalDeferred.push(async function (OneSignal) {
      try {
        await OneSignal.Notifications.requestPermission();
      } catch (_) {}
    });
  };

  if (!show) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="push-prompt-title"
      className="fixed inset-0 z-[9999] flex items-start justify-center pt-20 sm:pt-28 px-4 bg-slate-900/40 backdrop-blur-sm transition-all"
    >
      <div className="relative w-full max-w-md bg-white dark:bg-slate-900 rounded-3xl shadow-2xl shadow-emerald-900/20 ring-1 ring-slate-100 dark:ring-slate-800 p-6 animate-in slide-in-from-top-6 fade-in duration-300 overflow-hidden">
        {/* Dekorasi Glow Emerald */}
        <div className="absolute top-0 right-0 -mr-8 -mt-8 w-32 h-32 rounded-full bg-emerald-500/10 blur-2xl pointer-events-none" />

        <div className="flex items-start gap-4 sm:gap-5 relative z-10">
          <div className="flex-shrink-0 w-14 h-14 sm:w-16 sm:h-16 bg-gradient-to-br from-emerald-50 to-emerald-100 dark:from-emerald-950/60 dark:to-emerald-900/40 rounded-2xl flex items-center justify-center border border-emerald-200/60 dark:border-emerald-700/50 shadow-inner">
            <Image
              src="/assets/icons/kemenag-192.png"
              alt="Logo Kemenag"
              width={40}
              height={40}
              className="object-contain drop-shadow-sm"
            />
          </div>
          <div className="flex-1 pt-0.5">
            <h3
              id="push-prompt-title"
              className="text-base sm:text-lg font-bold text-slate-900 dark:text-white leading-snug"
            >
              Pembaruan Informasi
            </h3>
            <p className="mt-1.5 text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
              Dapatkan pemberitahuan langsung untuk pengumuman penting, jadwal layanan, dan berita resmi dari Kemenag Barito Utara.
            </p>

            <div className="mt-5 flex items-center gap-2.5 justify-end">
              <button
                type="button"
                onClick={handleDismiss}
                className="px-3.5 py-2 text-xs sm:text-sm font-medium text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-white rounded-xl transition-colors focus:outline-none focus:ring-2 focus:ring-slate-300"
              >
                Lain Kali
              </button>
              <button
                type="button"
                onClick={handleSubscribe}
                className="px-4 sm:px-5 py-2 sm:py-2.5 bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white text-xs sm:text-sm font-semibold rounded-xl shadow-md hover:shadow-lg hover:shadow-emerald-600/25 transition-all focus:outline-none focus:ring-2 focus:ring-emerald-500 flex items-center gap-2"
              >
                <svg
                  className="w-4 h-4"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth="2.2"
                  aria-hidden="true"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
                  />
                </svg>
                <span>Aktifkan Notifikasi</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
