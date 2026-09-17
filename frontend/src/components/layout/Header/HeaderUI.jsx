import React from "react";
import Link from "@/components/common/NextLink";
import Image from "@/components/common/NextImage";
import { CloseIcon, HamburgerIcon } from "./HeaderIcons";
import { useSiteSettings } from "@/context/SettingsContext";

export function HeaderLogo({ isTransparent = false }) {
  const { siteInfo } = useSiteSettings();
  
  return (
    <Link href="/" className="flex min-w-0 items-center gap-3">
      <span className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl p-2 transition-all duration-300 ${
        isTransparent
          ? "bg-white/10 ring-1 ring-white/20 backdrop-blur-md"
          : "bg-emerald-50 ring-1 ring-emerald-100 dark:bg-emerald-500/10 dark:ring-emerald-500/20"
      }`}>
        <Image src={siteInfo.logoSrc} alt={siteInfo.shortName} width={40} height={40} style={{ width: "auto", height: "auto" }} className="h-auto w-10 object-contain" unoptimized />
      </span>
      <div className="min-w-0">
        <p className={`truncate text-sm font-black uppercase tracking-wide transition-colors duration-300 ${
          isTransparent ? "text-white drop-shadow-md" : "text-emerald-800 dark:text-emerald-300"
        }`}>{siteInfo.logoTitleLine1}</p>
        <p className={`mt-0.5 line-clamp-1 text-xs font-medium transition-colors duration-300 ${
          isTransparent ? "text-slate-200" : "text-slate-500 dark:text-slate-400"
        }`}>{siteInfo.logoTitleLine2}</p>
      </div>
    </Link>
  );
}

export function MobileMenuToggle({ isOpen, onToggle, isTransparent = false }) {
  return (
    <button
      type="button"
      onClick={onToggle}
      className={`relative z-[101] flex h-11 items-center gap-2 rounded-2xl border px-4 text-sm font-black transition-all active:scale-95 lg:hidden ${
        isTransparent
          ? "border-white/20 bg-slate-900/60 text-white backdrop-blur-md hover:bg-slate-900/80"
          : "border-slate-200 bg-white text-slate-700 shadow-sm dark:border-slate-800 dark:bg-slate-900 dark:text-slate-100"
      }`}
      aria-expanded={isOpen}
      aria-label={isOpen ? "Tutup menu" : "Buka menu"}
    >
      <span>Menu</span>
      {isOpen ? (
        <CloseIcon className={`h-5 w-5 ${isTransparent ? "text-emerald-400" : "text-emerald-700 dark:text-emerald-400"}`} />
      ) : (
        <HamburgerIcon className={`h-5 w-5 ${isTransparent ? "text-emerald-400" : "text-emerald-700 dark:text-emerald-400"}`} />
      )}
    </button>
  );
}
