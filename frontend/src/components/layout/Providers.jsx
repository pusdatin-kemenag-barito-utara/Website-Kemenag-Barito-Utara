"use client";

import { ThemeProvider } from "@/context/ThemeContext";
import { LanguageProvider } from "@/context/LanguageContext";
import { SettingsProvider } from "@/context/SettingsContext";
import AntiCopasGuard from "@/components/common/AntiCopasGuard";

export default function Providers({ children, initialSettings }) {
  return (
    <ThemeProvider>
      <LanguageProvider>
        <SettingsProvider initialSettings={initialSettings}>
          <AntiCopasGuard />
          {children}
        </SettingsProvider>
      </LanguageProvider>
    </ThemeProvider>
  );
}