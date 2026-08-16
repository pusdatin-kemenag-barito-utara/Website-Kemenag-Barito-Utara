import React from "react";

export function DashboardHeader({ user, session }) {
  const initials = (user?.full_name || user?.email || "A")
    .split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <div className="relative overflow-hidden rounded-[3.5rem] border border-slate-100 bg-slate-900 p-10 text-white shadow-2xl dark:border-slate-800 sm:p-12">
      {/* Background decoration */}
      <div className="absolute -right-20 -top-20 h-64 w-64 rounded-full bg-emerald-500/10 blur-[100px]" />
      <div className="absolute -bottom-20 -left-20 h-64 w-64 rounded-full bg-blue-500/10 blur-[100px]" />

      <div className="relative flex flex-col gap-8 md:flex-row md:items-center">
        <div className="flex h-24 w-24 shrink-0 items-center justify-center rounded-[2.5rem] bg-emerald-500 text-3xl font-black text-white shadow-2xl shadow-emerald-500/20">
          {initials}
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-3 mb-3">
            <div className="h-2 w-2 bg-emerald-500 rounded-full animate-pulse" />
            <p className="text-[10px] font-black uppercase tracking-[0.3em] text-emerald-400/80">
              Pusat Kendali Administrasi
            </p>
          </div>
          <h1 className="text-4xl font-black tracking-tight leading-none sm:text-5xl uppercase">
            Halo, {user?.full_name || "Admin"}
          </h1>
          <p className="mt-4 max-w-2xl text-[10px] font-bold uppercase tracking-widest leading-relaxed text-slate-400">
            Level Akses: <span className="font-black text-white">{session.role?.replace(/_/g, " ")}</span>
          </p>
        </div>
      </div>
    </div>
  );
}

export function StatCard({ label, value, helper, icon, tone = "emerald" }) {
  const tones = {
    emerald: "text-emerald-500 bg-emerald-50 dark:bg-emerald-500/10",
    blue: "text-blue-500 bg-blue-50 dark:bg-blue-500/10",
    amber: "text-amber-500 bg-amber-50 dark:bg-amber-500/10",
    rose: "text-rose-500 bg-rose-50 dark:bg-rose-500/10",
    violet: "text-violet-500 bg-violet-50 dark:bg-violet-500/10",
    indigo: "text-indigo-500 bg-indigo-50 dark:bg-indigo-500/10",
    fuchsia: "text-fuchsia-500 bg-fuchsia-50 dark:bg-fuchsia-500/10",
  };

  return (
    <div className="group relative overflow-hidden rounded-2xl sm:rounded-3xl border border-slate-200/80 bg-white p-5 sm:p-6 shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md dark:border-slate-800 dark:bg-slate-900">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3.5">
          <div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl ${tones[tone] || tones.emerald}`}>
            <div className="scale-100">{icon}</div>
          </div>
          <div className="min-w-0">
            <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">{label}</p>
            <p className="text-xs font-bold text-slate-500 dark:text-slate-400 truncate max-w-[150px] sm:max-w-[180px]">{helper}</p>
          </div>
        </div>
        <span className="text-3xl font-black tracking-tight text-slate-900 dark:text-white group-hover:scale-105 transition-transform">{value}</span>
      </div>
    </div>
  );
}

export function SectionTitle({ title, subtitle }) {
  return (
    <div className="mb-8">
      <h2 className="text-xl font-black tracking-tight text-slate-900 dark:text-white uppercase">{title}</h2>
      {subtitle && <p className="mt-1 text-sm font-medium text-slate-500 dark:text-slate-400">{subtitle}</p>}
    </div>
  );
}
