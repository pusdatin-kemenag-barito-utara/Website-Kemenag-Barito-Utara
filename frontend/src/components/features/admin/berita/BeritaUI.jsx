import React, { useState } from "react";
import { IconCheckCircle, IconAlertCircle } from "./BeritaIcons";

export const statToneMap = {
  emerald: {
    bg: "border-emerald-200/80 bg-gradient-to-br from-emerald-500/5 via-white to-white dark:from-emerald-950/20 dark:via-slate-900 dark:to-slate-900 dark:border-emerald-900/40",
    iconBg: "bg-emerald-600 text-white shadow-md shadow-emerald-600/25",
    dot: "bg-emerald-500",
    text: "text-emerald-700 dark:text-emerald-400",
  },
  sky: {
    bg: "border-sky-200/80 bg-gradient-to-br from-sky-500/5 via-white to-white dark:from-sky-950/20 dark:via-slate-900 dark:to-slate-900 dark:border-sky-900/40",
    iconBg: "bg-sky-600 text-white shadow-md shadow-sky-600/25",
    dot: "bg-sky-500",
    text: "text-sky-700 dark:text-sky-400",
  },
  amber: {
    bg: "border-amber-200/80 bg-gradient-to-br from-amber-500/5 via-white to-white dark:from-amber-950/20 dark:via-slate-900 dark:to-slate-900 dark:border-amber-900/40",
    iconBg: "bg-amber-500 text-white shadow-md shadow-amber-500/25",
    dot: "bg-amber-500",
    text: "text-amber-700 dark:text-amber-400",
  },
  violet: {
    bg: "border-indigo-200/80 bg-gradient-to-br from-indigo-500/5 via-white to-white dark:from-indigo-950/20 dark:via-slate-900 dark:to-slate-900 dark:border-indigo-900/40",
    iconBg: "bg-indigo-600 text-white shadow-md shadow-indigo-600/25",
    dot: "bg-indigo-500",
    text: "text-indigo-700 dark:text-indigo-400",
  },
};

export function StatCard({ label, value, helper, icon, tone = "emerald" }) {
  const t = statToneMap[tone] || statToneMap.emerald;

  return (
    <div className={`group relative overflow-hidden rounded-2xl border p-4 sm:p-5 shadow-sm transition-all hover:shadow-md hover:-translate-y-0.5 ${t.bg}`}>
      <div className="relative z-10 flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <p className="text-[10px] font-black uppercase tracking-wider text-slate-500 dark:text-slate-400 truncate">
            {label}
          </p>
          <p className="mt-1 text-2xl sm:text-3xl font-black tracking-tight text-slate-900 dark:text-white">
            {value}
          </p>
        </div>

        <div className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl ${t.iconBg}`}>
          {React.cloneElement(icon, { className: "w-5 h-5" })}
        </div>
      </div>

      <div className="relative z-10 mt-3 flex items-center gap-1.5 border-t border-slate-100 pt-2.5 dark:border-slate-800/60">
        <div className={`h-1.5 w-1.5 shrink-0 rounded-full ${t.dot} animate-pulse`} />
        <p className="text-[9px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-400 truncate">
          {helper}
        </p>
      </div>
    </div>
  );
}

export function StatusPill({ published }) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[9px] font-black uppercase tracking-wider border ${
        published
          ? "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800"
          : "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-800"
      }`}
    >
      <span className={`h-1.5 w-1.5 rounded-full ${published ? "bg-emerald-500 animate-pulse" : "bg-amber-500"}`} />
      {published ? "Tayang" : "Draft"}
    </span>
  );
}

export function CoverThumb({
  src,
  alt = "Preview gambar",
  className = "",
  fallbackText = "Belum ada gambar",
}) {
  const [failedSrc, setFailedSrc] = useState("");

  const showFallback = !src || failedSrc === src;

  if (showFallback) {
    return (
      <div
        className={`flex items-center justify-center rounded-2xl border-2 border-dashed border-slate-200 bg-slate-50 px-4 text-center text-[10px] font-black uppercase tracking-widest text-slate-400 dark:border-slate-800 dark:bg-slate-900/50 ${className}`.trim()}
      >
        {fallbackText}
      </div>
    );
  }

  return (
    <>
      <img
        src={src}
        alt={alt}
        onError={() => setFailedSrc(src)}
        className={`rounded-2xl object-cover ring-1 ring-slate-100 dark:ring-slate-800 ${className}`.trim()}
      />
    </>
  );
}

export function ToggleSwitch({ checked, onChange, label, description }) {
  return (
    <div className="flex items-center justify-between gap-4 rounded-2xl border border-slate-200 bg-slate-50 p-4 transition-colors hover:border-slate-900 dark:border-slate-800 dark:bg-slate-800/50 dark:hover:border-white">
      <div>
        <p className="text-xs font-black uppercase tracking-widest text-slate-900 dark:text-white">{label}</p>
        <p className="mt-1 text-[10px] font-medium text-slate-400">{description}</p>
      </div>

      <button
        type="button"
        onClick={() => onChange(!checked)}
        className={`relative inline-flex h-8 w-14 shrink-0 items-center rounded-full transition-all duration-300 focus:outline-none focus:ring-4 focus:ring-slate-900/5 ${checked ? "bg-slate-900 dark:bg-white" : "bg-slate-200 dark:bg-slate-800"
          }`}
      >
        <span
          className={`h-6 w-6 rounded-full shadow-lg transition-all duration-300 ${checked
            ? "translate-x-7 bg-white dark:bg-slate-900"
            : "translate-x-1 bg-white dark:bg-slate-400"
            }`}
        />
      </button>
    </div>
  );
}

export function ToolbarButton({ title, onClick, children }) {
  return (
    <button
      type="button"
      title={title}
      aria-label={title}
      onMouseDown={(event) => event.preventDefault()}
      onClick={onClick}
      className="inline-flex h-9 w-9 items-center justify-center rounded-lg text-slate-500 transition-all hover:bg-slate-900 hover:text-white active:scale-90 dark:text-slate-400 dark:hover:bg-white dark:hover:text-black"
    >
      {React.cloneElement(children, { className: "w-4.5 h-4.5" })}
    </button>
  );
}

export function ActionIconButton({
  title,
  onClick,
  children,
  variant = "neutral",
  disabled = false,
}) {
  const variantClasses = {
    neutral:
      "border-slate-200 bg-white text-slate-600 hover:border-slate-900 hover:text-slate-900 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300 dark:hover:border-white dark:hover:text-white",
    danger:
      "border-rose-100 bg-rose-50 text-rose-600 hover:border-rose-600 hover:bg-rose-600 hover:text-white dark:border-rose-900/50 dark:bg-slate-800 dark:text-rose-400 dark:hover:bg-rose-600 dark:hover:text-white",
    sky: "border-sky-100 bg-sky-50 text-sky-600 hover:border-sky-600 hover:bg-sky-600 hover:text-white dark:border-sky-900/50 dark:bg-slate-800 dark:text-sky-400 dark:hover:bg-sky-600 dark:hover:text-white",
  };

  return (
    <button
      type="button"
      title={title}
      aria-label={title}
      onClick={onClick}
      disabled={disabled}
      className={`inline-flex h-8 w-8 items-center justify-center rounded-lg border shadow-sm transition-all active:scale-90 disabled:cursor-not-allowed disabled:opacity-50 ${variantClasses[variant] || variantClasses.neutral}`}
    >
      {React.cloneElement(children, { className: "w-3.5 h-3.5" })}
    </button>
  );
}

export function FloatingFeedback({ message, error, onClose }) {
  if (!message && !error) return null;

  const isError = Boolean(error);
  const title = isError ? "Terjadi kendala" : "Berhasil";
  const detail = isError
    ? error
    : String(message || "")
      .replace(/\s*Ukuran[^.]*\.?/gi, "")
      .replace(/\s{2,}/g, " ")
      .trim();

  return (
    <div className="pointer-events-none fixed right-3 top-24 z-[300] flex w-[min(92vw,380px)] flex-col items-end gap-3 sm:right-6">
      <div
        className={`pointer-events-auto w-full overflow-hidden rounded-2xl border shadow-2xl backdrop-blur-xl animate-in slide-in-from-right-8 duration-500 ${isError
          ? "border-rose-100 bg-white/95 text-rose-700 dark:border-rose-900/70 dark:bg-slate-900/95 dark:text-rose-300"
          : "border-emerald-100 bg-white/95 text-emerald-700 dark:border-emerald-900/70 dark:bg-slate-900/95 dark:text-emerald-300"
          }`}
        role="status"
        aria-live="polite"
      >
        <div className="flex items-start gap-3.5 px-5 py-4">
          <div
            className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${isError
              ? "bg-rose-50 text-rose-600 dark:bg-rose-950/50 dark:text-rose-400"
              : "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-400"
              }`}
          >
            {isError ? <IconAlertCircle /> : <IconCheckCircle />}
          </div>

          <div className="min-w-0 flex-1">
            <p className="text-sm font-black tracking-tight">{title}</p>
            <p className="mt-0.5 text-xs font-medium leading-relaxed opacity-70">
              {detail}
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            className={`pointer-events-auto inline-flex h-7 w-7 items-center justify-center rounded-lg transition-all hover:bg-slate-950/5 active:scale-90`}
            aria-label="Tutup notifikasi"
          >
            <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="3">
              <path d="M18 6 6 18M6 6l12 12" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}

export function ModernSelect({ label, value, options = [], onChange, name, buttonClassName }) {
  const [isOpen, setIsOpen] = React.useState(false);
  const containerRef = React.useRef(null);

  React.useEffect(() => {
    function handleClickOutside(event) {
      if (containerRef.current && !containerRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="relative" ref={containerRef}>
      {label && <label className="text-[10px] font-black uppercase tracking-wider text-slate-400 ml-1">{label}</label>}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={`mt-1 flex w-full items-center justify-between rounded-xl border bg-white px-3 text-xs sm:text-xs font-bold text-slate-900 outline-none transition-all dark:bg-slate-800/50 dark:text-white ${buttonClassName || "h-10"} ${isOpen
          ? "border-slate-900 ring-4 ring-slate-900/5 dark:border-white dark:ring-white/5"
          : "border-slate-200 dark:border-slate-800"
          }`}
      >
        <span className="truncate">{value || "Pilih..."}</span>
        <svg viewBox="0 0 24 24" className={`h-3.5 w-3.5 shrink-0 transition-transform duration-300 ${isOpen ? "rotate-180" : ""}`} fill="none" stroke="currentColor" strokeWidth="3">
          <path d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {isOpen && (
        <div className="absolute left-0 right-0 z-[200] mt-1.5 max-h-60 overflow-y-auto rounded-xl border border-slate-200 bg-white p-1.5 shadow-xl animate-in fade-in slide-in-from-top-2 duration-200 dark:border-slate-800 dark:bg-slate-900">
          {options.map((opt) => (
            <button
              key={opt}
              type="button"
              onClick={() => {
                onChange({ target: { name, value: opt } });
                setIsOpen(false);
              }}
              className={`w-full rounded-lg px-3 py-2 text-left text-[10px] font-black uppercase tracking-wider transition-all ${value === opt
                ? "bg-slate-900 text-white dark:bg-white dark:text-black"
                : "text-slate-600 hover:bg-slate-50 dark:text-slate-400 dark:hover:bg-slate-800"
                }`}
            >
              {opt}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
