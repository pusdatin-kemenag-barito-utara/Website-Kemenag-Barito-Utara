"use client";

import React, { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";

function numberFmt(n) {
  return new Intl.NumberFormat("id-ID").format(Number(n || 0));
}

export default function AdminVisitorCards({ initialStats = { total: 0, today: 0 } }) {
  const [onlineCount, setOnlineCount] = useState(1);

  useEffect(() => {
    const supabase = createClient();
    const presenceId = crypto.randomUUID();

    const channel = supabase.channel("admin_online_visitors", {
      config: { presence: { key: presenceId } },
    });

    channel
      .on("presence", { event: "sync" }, () => {
        const count = Object.keys(channel.presenceState()).length;
        setOnlineCount(count > 0 ? count : 1);
      })
      .subscribe(async (status) => {
        if (status === "SUBSCRIBED") {
          await channel.track({ online_at: new Date().toISOString() });
        }
      });

    return () => {
      channel.untrack();
      supabase.removeChannel(channel);
    };
  }, []);

  return (
    <>
      {/* 1. Realtime Online Visitors */}
      <div className="group relative overflow-hidden rounded-2xl sm:rounded-3xl border border-emerald-200/80 bg-white p-5 sm:p-6 shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md dark:border-emerald-900/30 dark:bg-slate-900">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3.5">
            <div className="relative flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-emerald-500/10 text-emerald-600 dark:bg-emerald-500/20 dark:text-emerald-400">
              <span className="absolute top-1 right-1 flex h-3 w-3">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex h-3 w-3 rounded-full bg-emerald-500" />
              </span>
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
              </svg>
            </div>
            <div>
              <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Pengunjung Realtime</p>
              <p className="text-xs font-bold text-slate-700 dark:text-slate-200">Sedang Aktif Saat Ini</p>
            </div>
          </div>
          <span className="text-3xl font-black tracking-tight text-emerald-600 dark:text-emerald-400 group-hover:scale-105 transition-transform">{numberFmt(onlineCount)}</span>
        </div>
      </div>

      {/* 2. Kunjungan Hari Ini */}
      <div className="group relative overflow-hidden rounded-2xl sm:rounded-3xl border border-teal-200/80 bg-white p-5 sm:p-6 shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md dark:border-teal-900/30 dark:bg-slate-900">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3.5">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-teal-500/10 text-teal-600 dark:bg-teal-500/20 dark:text-teal-400">
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
            <div>
              <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Kunjungan Hari Ini</p>
              <p className="text-xs font-bold text-slate-700 dark:text-slate-200">Total Hari Ini (WIB)</p>
            </div>
          </div>
          <span className="text-3xl font-black tracking-tight text-teal-600 dark:text-teal-400 group-hover:scale-105 transition-transform">{numberFmt(initialStats.today)}</span>
        </div>
      </div>

      {/* 3. Total Kunjungan Kumulatif */}
      <div className="group relative overflow-hidden rounded-2xl sm:rounded-3xl border border-blue-200/80 bg-white p-5 sm:p-6 shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md dark:border-blue-900/30 dark:bg-slate-900">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3.5">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-blue-500/10 text-blue-600 dark:bg-blue-500/20 dark:text-blue-400">
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
              </svg>
            </div>
            <div>
              <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Total Kunjungan</p>
              <p className="text-xs font-bold text-slate-700 dark:text-slate-200">Kumulatif Website</p>
            </div>
          </div>
          <span className="text-3xl font-black tracking-tight text-blue-600 dark:text-blue-400 group-hover:scale-105 transition-transform">{numberFmt(initialStats.total)}</span>
        </div>
      </div>
    </>
  );
}
