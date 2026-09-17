"use client";

import React from "react";
import Image from "@/components/common/NextImage";
import { useHeader } from "@/hooks/useHeader";
import { HeaderSearchForm } from "./HeaderSearchForm";
import { DesktopNav, HeaderControls } from "./DesktopNav";
import { MobileNav } from "./MobileNav";
import { HeaderLogo, MobileMenuToggle } from "./HeaderUI";

export default function Header({ isHomePage = false, initialPathname = "" }) {
  const h = useHeader({ isHomePage, initialPathname });

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-100 w-full transition-[border-color,box-shadow] duration-500 ease-in-out border-b ${
        h.isTransparent
          ? "border-slate-200/0 dark:border-white/0 shadow-none"
          : "border-slate-200/50 dark:border-white/5 shadow-xs"
      }`}
    >
      {/* Background Layer 1: Dark gradient saat berada di hero section */}
      <div
        className={`absolute inset-0 -z-10 bg-gradient-to-b from-slate-950/85 via-slate-950/40 to-transparent transition-opacity duration-500 ease-in-out ${
          h.isTransparent ? "opacity-100" : "opacity-0 pointer-events-none"
        }`}
      />

      {/* Background Layer 2: Glassmorphism surface saat di-scroll */}
      <div
        className={`absolute inset-0 -z-10 bg-white/70 backdrop-blur-xl dark:bg-slate-950/70 transition-opacity duration-500 ease-in-out ${
          h.isTransparent ? "opacity-0 pointer-events-none" : "opacity-100"
        }`}
      />

      <div className="relative mx-auto w-full max-w-[1600px] px-6 sm:px-10 lg:px-16 xl:px-20">
        {/* Top Header Bar */}
        <div className="flex items-center justify-between py-2.5 lg:py-4">
          <HeaderLogo isTransparent={h.isTransparent} />

          <div className="flex items-center gap-4">
            <div
              className={`hidden lg:flex items-center gap-2 mr-2 border-r pr-6 transition-colors duration-500 ease-in-out ${
                h.isTransparent
                  ? "border-slate-200/0 dark:border-slate-800/0"
                  : "border-slate-200 dark:border-slate-800"
              }`}
            >
              <Image
                src="/assets/branding/hapakat.webp"
                alt="Hapakat"
                width={60}
                height={20}
                className="h-4 w-auto object-contain opacity-90"
                style={{ width: "auto" }}
              />
              <p
                className={`text-[10px] font-bold leading-tight transition-colors duration-300 ${
                  h.isTransparent
                    ? "text-emerald-300 drop-shadow-sm"
                    : "text-emerald-700 dark:text-emerald-400"
                }`}
              >
                <span className="text-amber-500">H</span>armonis,{" "}
                <span className="text-amber-500">A</span>manah,{" "}
                <span className="text-amber-500">P</span>rofesional,{" "}
                <span className="text-amber-500">A</span>kuntabel,{" "}
                <span className="text-amber-500">K</span>reatif,{" "}
                <span className="text-amber-500">A</span>dil dan{" "}
                <span className="text-amber-500">T</span>ransparan
              </p>
            </div>
            <HeaderControls
              locale={h.locale}
              setLocale={h.setLocale}
              theme={h.theme}
              setLightTheme={h.setLightTheme}
              setDarkTheme={h.setDarkTheme}
              adminState={h.adminState}
              isTransparent={h.isTransparent}
            />
            <MobileMenuToggle
              isOpen={h.isMobileMenuOpen}
              onToggle={h.toggleMobileMenu}
              isTransparent={h.isTransparent}
            />
          </div>
        </div>

        {/* Desktop Navigation Row */}
        <DesktopNav
          navigationItems={h.navigationItems}
          pathname={h.pathname}
          openDesktopDropdown={h.openDesktopDropdown}
          toggleDesktopDropdown={h.toggleDesktopDropdown}
          setOpenDesktopDropdown={h.setOpenDesktopDropdown}
          desktopDropdownRef={h.desktopDropdownRef}
          searchQuery={h.searchQuery}
          setSearchQuery={h.setSearchQuery}
          handleSearchSubmit={h.handleSearchSubmit}
          handleSearchKeyDown={h.handleSearchKeyDown}
          handleSearchBlur={h.handleSearchBlur}
          t={h.t}
          suggestions={h.suggestions}
          showSuggestions={h.showSuggestions}
          handleSuggestionSelect={h.handleSuggestionSelect}
          activeSuggestionIndex={h.activeSuggestionIndex}
          isTransparent={h.isTransparent}
        />
      </div>

      <MobileNav
        isMobileMenuOpen={h.isMobileMenuOpen} closeMobileMenu={h.closeMobileMenu}
        searchQuery={h.searchQuery} setSearchQuery={h.setSearchQuery}
        handleSearchSubmit={h.handleSearchSubmit} handleSearchKeyDown={h.handleSearchKeyDown}
        handleSearchBlur={h.handleSearchBlur} t={h.t}
        suggestions={h.suggestions} showSuggestions={h.showSuggestions}
        handleSuggestionSelect={h.handleSuggestionSelect} activeSuggestionIndex={h.activeSuggestionIndex}
        locale={h.locale} setLocale={h.setLocale} theme={h.theme}
        setLightTheme={h.setLightTheme} setDarkTheme={h.setDarkTheme}
        navigationItems={h.navigationItems} pathname={h.pathname}
        openMobileDropdown={h.openMobileDropdown} toggleMobileDropdown={h.toggleMobileDropdown}
        adminState={h.adminState}
      />
    </header>
  );
}
