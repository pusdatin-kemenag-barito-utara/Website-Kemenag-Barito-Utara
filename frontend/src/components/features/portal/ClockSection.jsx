"use client";

import React, { useSyncExternalStore } from "react";
import { Clock, CalendarDays, CheckCircle2, XCircle } from "lucide-react";

let currentTimestamp = null;

function subscribeClock(callback) {
  currentTimestamp = new Date().getTime();
  const timer = setInterval(() => {
    currentTimestamp = new Date().getTime();
    callback();
  }, 1000);
  return () => clearInterval(timer);
}

function getClockSnapshot() {
  if (currentTimestamp === null && typeof window !== "undefined") {
    currentTimestamp = new Date().getTime();
  }
  return currentTimestamp;
}

function getServerSnapshot() {
  return null;
}

function useCurrentTime() {
  const timestamp = useSyncExternalStore(
    subscribeClock,
    getClockSnapshot,
    getServerSnapshot
  );
  return timestamp ? new Date(timestamp) : null;
}

function getStatusFromTime(time) {
  const day = time.getDay();
  const hour = time.getHours();
  const minute = time.getMinutes();
  const currentTime = hour * 100 + minute;

  let isOpen = false;
  if (day >= 1 && day <= 4) {
    if (currentTime >= 730 && currentTime <= 1600) isOpen = true;
  } else if (day === 5) {
    if (currentTime >= 730 && currentTime <= 1630) isOpen = true;
  }

  return isOpen;
}

function getTimezoneLabel() {
  const offset = -new Date().getTimezoneOffset();
  if (offset === 420) return "WIB";
  if (offset === 480) return "WITA";
  if (offset === 540) return "WIT";
  const hours = offset / 60;
  return `UTC${hours >= 0 ? "+" : ""}${hours}`;
}

export function DesktopClockSection() {
  const time = useCurrentTime();

  if (!time) {
    return (
      <div className="h-[58px] w-full bg-white/70 backdrop-blur-md px-6 py-3 rounded-2xl border border-slate-200/90 shadow-xs mb-2 animate-pulse" />
    );
  }

  const isOpen = getStatusFromTime(time);

  return (
    <div 
      suppressHydrationWarning 
      className="animate-fade-in flex items-center justify-between gap-6 bg-white/95 backdrop-blur-xl px-6 py-3 rounded-2xl border border-slate-300/80 shadow-[0_4px_16px_rgba(15,23,42,0.05)] mb-2 overflow-hidden relative group"
    >
      {/* Subtle glow effect on hover */}
      <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/0 via-emerald-500/10 to-emerald-500/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000"></div>

      <div className="flex items-center gap-5 relative z-10">
        <div className="flex items-center gap-2.5 text-emerald-900 font-black text-xl tracking-tight tabular-nums">
          <Clock className="w-5 h-5 text-emerald-700" strokeWidth={2.5} />
          {time.toLocaleTimeString("id-ID", {
            hour: "2-digit",
            minute: "2-digit",
            second: "2-digit",
          })}
          <span className="text-xs font-bold text-slate-500 ml-1 mt-1">{getTimezoneLabel()}</span>
        </div>
        
        <div className="h-6 w-px bg-slate-200"></div>
        
        <div className="flex items-center gap-2.5 text-slate-700 text-xs font-bold uppercase tracking-wider">
          <CalendarDays className="w-4 h-4 text-emerald-700" strokeWidth={2.2} />
          {time.toLocaleDateString("id-ID", {
            weekday: "long",
            day: "numeric",
            month: "long",
            year: "numeric",
          })}
        </div>
      </div>

      <div className="flex items-center gap-4 relative z-10 bg-slate-100/90 py-2 px-5 rounded-xl border border-slate-200 shadow-xs">
        <div
          className={`flex items-center gap-2 font-bold text-xs uppercase tracking-wider ${isOpen ? "text-emerald-700" : "text-rose-700"}`}
        >
          {isOpen ? (
            <CheckCircle2 className="w-4 h-4 text-emerald-600" strokeWidth={2.5} />
          ) : (
            <XCircle className="w-4 h-4 text-rose-600" strokeWidth={2.5} />
          )}
          {isOpen ? "Layanan Buka" : "Layanan Tutup"}
        </div>
        <div className="h-4 w-px bg-slate-300/80"></div>
        <p className="text-slate-600 text-[10px] font-bold tracking-wider uppercase">
          {time.getDay() === 5 ? "Jam Kerja: 07:30 - 16:30" : "Jam Kerja: 07:30 - 16:00"}
        </p>
      </div>
    </div>
  );
}

export function MobileClockSection() {
  const time = useCurrentTime();

  if (!time) {
    return (
      <div className="h-[96px] w-full bg-white/70 backdrop-blur-md rounded-2xl border border-slate-200/90 shadow-xs mb-2 animate-pulse" />
    );
  }

  const isOpen = getStatusFromTime(time);

  return (
    <div 
      suppressHydrationWarning 
      className="animate-fade-in flex flex-col bg-white/90 backdrop-blur-xl rounded-2xl border border-slate-200/90 shadow-xs mb-2 w-full overflow-hidden relative"
    >
      <div className="flex items-center justify-between p-4 pb-3 border-b border-slate-100">
        <div className="flex items-center gap-2 text-emerald-800 font-extrabold text-lg tabular-nums">
          <Clock className="w-4 h-4 text-emerald-700" strokeWidth={2.5} />
          {time.toLocaleTimeString("id-ID", {
            hour: "2-digit",
            minute: "2-digit",
            second: "2-digit",
          })}
          <span className="text-[10px] font-semibold text-slate-500">{getTimezoneLabel()}</span>
        </div>
        <div className={`flex items-center gap-1.5 font-bold text-[10px] uppercase tracking-wider px-2.5 py-1.5 rounded-lg border ${isOpen ? "bg-emerald-50 text-emerald-700 border-emerald-200/80" : "bg-rose-50 text-rose-700 border-rose-200/80"}`}>
          {isOpen ? (
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" strokeWidth={2.5} />
          ) : (
            <XCircle className="w-3.5 h-3.5 text-rose-600" strokeWidth={2.5} />
          )}
          {isOpen ? "Layanan Buka" : "Layanan Tutup"}
        </div>
      </div>
      <div className="flex items-center justify-between bg-slate-50/80 px-4 py-3">
        <div className="text-slate-700 text-[10px] font-bold uppercase tracking-wider flex items-center gap-1.5">
          <CalendarDays className="w-3.5 h-3.5 text-emerald-700" />
          {time.toLocaleDateString("id-ID", {
            weekday: "long",
            day: "numeric",
            month: "long",
            year: "numeric",
          })}
        </div>
        <p className="text-slate-600 text-[10px] font-bold tracking-wider uppercase">
          {time.getDay() === 5 ? "07:30 - 16:30" : "07:30 - 16:00"}
        </p>
      </div>
    </div>
  );
}
