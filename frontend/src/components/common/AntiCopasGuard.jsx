"use client";

import { useEffect, useState } from "react";

/**
 * AntiCopasGuard
 * Menjalankan proteksi anti klik kanan, drag gambar, dan shortcut save/view source
 * secara mandiri ketika fitur_anti_copas diaktifkan di Admin Settings.
 * Khusus aktif pada halaman Portal Utama ('/' atau '/portal').
 */
export default function AntiCopasGuard() {
  const [active, setActive] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;

    // Periksa apakah berada di halaman Portal Utama
    const pathname = window.location.pathname.replace(/\/$/, "") || "/";
    const isPortal = pathname === "/" || pathname === "/portal";
    if (!isPortal) return;

    // Fetch pengaturan langsung dari endpoint publik
    const loadSetting = () => {
      fetch("/api/settings", { cache: "no-store" })
        .then((res) => (res.ok ? res.json() : null))
        .then((data) => {
          if (data && (data.fitur_anti_copas === true || data.fitur_anti_copas === "true")) {
            setActive(true);
          } else {
            setActive(false);
          }
        })
        .catch(() => {});
    };

    loadSetting();

    // Dengarkan event sinkronisasi instan jika admin mengubah pengaturan
    const handleUpdate = (e) => {
      if (e.detail && typeof e.detail === "object") {
        setActive(Boolean(e.detail.fitur_anti_copas));
      } else {
        loadSetting();
      }
    };

    window.addEventListener("settings-updated", handleUpdate);
    return () => window.removeEventListener("settings-updated", handleUpdate);
  }, []);

  useEffect(() => {
    if (!active || typeof window === "undefined") return;

    const pathname = window.location.pathname.replace(/\/$/, "") || "/";
    const isPortal = pathname === "/" || pathname === "/portal";
    if (!isPortal) return;

    // 1. Blokir Klik Kanan (Context Menu) di seluruh dokumen
    const handleContextMenu = (e) => {
      const tag = e.target?.tagName?.toLowerCase();
      if (tag === "input" || tag === "textarea" || e.target?.isContentEditable) {
        return;
      }
      e.preventDefault();
      e.stopPropagation();
      return false;
    };

    // 2. Blokir Copy & Cut teks di portal
    const handleCopy = (e) => {
      const tag = e.target?.tagName?.toLowerCase();
      if (tag === "input" || tag === "textarea") {
        return;
      }
      e.preventDefault();
      e.stopPropagation();
      return false;
    };

    // 3. Blokir Drag Gambar ke Desktop / Tab Baru
    const handleDragStart = (e) => {
      e.preventDefault();
      e.stopPropagation();
      return false;
    };

    // 4. Blokir Shortcut Browser (Ctrl+U, Ctrl+S, Ctrl+C)
    const handleKeyDown = (e) => {
      const isCtrlOrCmd = e.ctrlKey || e.metaKey;
      if (isCtrlOrCmd) {
        const k = e.key?.toLowerCase();
        if (
          k === "u" ||
          k === "s" ||
          (k === "c" && !["input", "textarea"].includes(e.target?.tagName?.toLowerCase()))
        ) {
          e.preventDefault();
          e.stopPropagation();
          return false;
        }
      }
    };

    document.addEventListener("contextmenu", handleContextMenu, true);
    document.addEventListener("copy", handleCopy, true);
    document.addEventListener("cut", handleCopy, true);
    document.addEventListener("dragstart", handleDragStart, true);
    document.addEventListener("keydown", handleKeyDown, true);

    return () => {
      document.removeEventListener("contextmenu", handleContextMenu, true);
      document.removeEventListener("copy", handleCopy, true);
      document.removeEventListener("cut", handleCopy, true);
      document.removeEventListener("dragstart", handleDragStart, true);
      document.removeEventListener("keydown", handleKeyDown, true);
    };
  }, [active]);

  return null;
}
