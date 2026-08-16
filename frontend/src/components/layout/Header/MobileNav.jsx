import React, { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import Image from "@/components/common/NextImage";
import { motion, AnimatePresence } from "framer-motion";
import { MobileNavHeader } from "./mobile/MobileNavHeader";
import { MobileNavSearch } from "./mobile/MobileNavSearch";
import { MobileNavLinks } from "./mobile/MobileNavLinks";
import { MobileNavUtilities } from "./mobile/MobileNavUtilities";

export function MobileNav({
  isMobileMenuOpen,
  closeMobileMenu,
  searchQuery,
  setSearchQuery,
  handleSearchSubmit,
  handleSearchKeyDown,
  handleSearchBlur,
  t,
  suggestions,
  showSuggestions,
  handleSuggestionSelect,
  activeSuggestionIndex,
  locale,
  setLocale,
  theme,
  setLightTheme,
  setDarkTheme,
  navigationItems,
  pathname,
  openMobileDropdown,
  toggleMobileDropdown,
  adminState,
}) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setMounted(true), 0);
    return () => clearTimeout(timer);
  }, []);

  if (!mounted) return null;

  return createPortal(
    <AnimatePresence>
      {isMobileMenuOpen && (
        <div className="fixed inset-0 z-[9999] lg:hidden">
          {/* Backdrop: Fade */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25, ease: "easeInOut" }}
            className="absolute inset-0 bg-slate-950/50 backdrop-blur-sm transform-gpu will-change-[opacity]"
            onClick={closeMobileMenu}
          />

          {/* Drawer: Slide dari kanan dengan GPU accelerated cubic bezier */}
          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ duration: 0.28, ease: [0.32, 0.72, 0, 1] }}
            className="absolute top-0 right-0 bottom-0 w-[300px] max-w-[85vw] flex flex-col bg-white dark:bg-slate-950 shadow-2xl transform-gpu will-change-transform"
            style={{ isolation: "isolate" }}
          >
            <MobileNavHeader onClose={closeMobileMenu} />

            <div className="flex-1 overflow-y-auto no-scrollbar py-2">
              <MobileNavSearch
                query={searchQuery}
                setQuery={setSearchQuery}
                onSubmit={handleSearchSubmit}
                onKeyDown={handleSearchKeyDown}
                onBlur={handleSearchBlur}
                t={t}
                suggestions={suggestions}
                showSuggestions={showSuggestions}
                onSelectSuggestion={handleSuggestionSelect}
                activeIndex={activeSuggestionIndex}
              />

              <MobileNavLinks
                navigationItems={navigationItems}
                pathname={pathname}
                onNavigate={closeMobileMenu}
                openMobileDropdown={openMobileDropdown}
                toggleMobileDropdown={toggleMobileDropdown}
              />
            </div>

            <div className="border-t border-slate-200/60 dark:border-slate-800/60 bg-slate-50/50 dark:bg-slate-900/40">
              <MobileNavUtilities
                locale={locale}
                setLocale={setLocale}
                theme={theme}
                setLightTheme={setLightTheme}
                setDarkTheme={setDarkTheme}
                adminState={adminState}
              />

              <div className="px-6 py-3.5 flex flex-col items-center justify-center border-t border-slate-200/60 dark:border-slate-800/60">
                <Image
                  src="/assets/branding/hapakat.webp"
                  alt="Hapakat"
                  width={80}
                  height={24}
                  className="h-4.5 w-auto object-contain opacity-90 mb-1"
                  style={{ width: "auto" }}
                />
                <p className="text-[8.5px] font-bold text-emerald-700 dark:text-emerald-400 text-center leading-tight">
                  <span className="text-amber-500">H</span>armonis,{" "}
                  <span className="text-amber-500">A</span>manah,{" "}
                  <span className="text-amber-500">P</span>rofesional,{" "}
                  <span className="text-amber-500">A</span>kuntabel,{" "}
                  <span className="text-amber-500">K</span>reatif,{" "}
                  <span className="text-amber-500">A</span>dil dan{" "}
                  <span className="text-amber-500">T</span>ransparan
                </p>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>,
    document.body,
  );
}
