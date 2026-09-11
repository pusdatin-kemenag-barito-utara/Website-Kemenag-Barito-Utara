"use client";

import { useEffect, useRef } from "react";
import { usePathname } from "@/hooks/useNextNavigation";
import { createClient } from "@/lib/supabase/client";
import {
  trackPageView,
  trackMenuClick,
  trackButtonClick,
  trackDocumentPreview,
  trackDocumentDownload,
  trackOutboundClick,
  trackScrollDepth,
  trackThemeChange,
  trackPwaInteraction,
} from "@/lib/analytics";

export default function PageViewTracker() {
  const pathname = usePathname();
  const lastTracked = useRef("");
  const timerRef = useRef(null);
  const trackedDepths = useRef(new Set());

  // ── 1. Track Every Page View (Soft Navigation / SPA & Direct Hits) ──
  useEffect(() => {
    if (pathname === lastTracked.current) return;

    clearTimeout(timerRef.current);
    // Reset scroll depth tracking untuk halaman baru
    trackedDepths.current = new Set();

    timerRef.current = setTimeout(async () => {
      lastTracked.current = pathname;

      // Backend Visitor Counter
      try {
        await fetch("/api/visitors", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ path: pathname }),
        });
      } catch {
        /* silent */
      }

      // Enterprise GA4 & GTM Page View Event
      trackPageView({
        path: pathname,
        title: document.title,
        referrer: document.referrer,
      });
    }, 400);

    return () => clearTimeout(timerRef.current);
  }, [pathname]);

  // ── 2. Supabase Presence — "Sedang Online" Realtime ──
  useEffect(() => {
    const supabase = createClient();
    const presenceId = crypto.randomUUID();

    const existing = supabase.getChannels().find((c) => c.topic === "realtime:online_visitors");
    if (existing) {
      supabase.removeChannel(existing);
    }

    const channel = supabase.channel("online_visitors", {
      config: { presence: { key: presenceId } },
    });

    channel
      .on("presence", { event: "sync" }, () => {
        const count = Object.keys(channel.presenceState()).length;
        window.dispatchEvent(
          new CustomEvent("online-visitors-change", {
            detail: { count: count > 0 ? count : 1 },
          })
        );
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

  // ── 3. Global Click Delegation (Seluruh Menu, Button, CTA, Dokumen & Outbound) ──
  useEffect(() => {
    if (typeof window === "undefined") return;

    const handleGlobalClick = (event) => {
      const target = event.target;
      if (!target || !(target instanceof Element)) return;

      // A. Deteksi Tautan / Link (<a>)
      const anchor = target.closest("a");
      if (anchor && anchor.href) {
        const href = anchor.href;
        const text = (anchor.innerText || anchor.getAttribute("aria-label") || anchor.title || "").trim();

        // 1. Tautan Eksternal (Outbound)
        if (anchor.origin && anchor.origin !== window.location.origin) {
          let category = "external";
          if (/whatsapp|wa\.me/i.test(href)) category = "whatsapp";
          else if (/youtube|instagram|facebook|twitter|tiktok/i.test(href)) category = "social";
          else if (/kemenag\.go\.id|\.go\.id/i.test(href)) category = "government";

          trackOutboundClick({
            url: href,
            domain: anchor.hostname,
            label: text || href,
            category,
          });
          return;
        }

        // 2. Berkas PDF / Dokumen Unduh
        if (/\.pdf($|\?)/i.test(href) || anchor.hasAttribute("download")) {
          trackDocumentDownload({
            title: text || href.split("/").pop() || "Dokumen PDF",
            url: href,
          });
          return;
        }

        // 3. Menu Navigasi (Header, Mobile Drawer, Footer, Breadcrumb)
        const inHeader = anchor.closest("header, nav, [data-menu='header']");
        const inMobileMenu = anchor.closest("#mobile-menu, [data-mobile-menu]");
        const inFooter = anchor.closest("footer, .theme-footer");
        const inBreadcrumb = anchor.closest("nav[aria-label='Breadcrumb']");

        if (inHeader || inMobileMenu || inFooter || inBreadcrumb) {
          let menuType = "header_nav";
          if (inMobileMenu) menuType = "mobile_nav";
          else if (inFooter) menuType = "footer_nav";
          else if (inBreadcrumb) menuType = "breadcrumb";

          trackMenuClick({
            menuName: text || anchor.pathname,
            menuType,
            menuUrl: anchor.pathname,
            section: inFooter ? "footer" : inBreadcrumb ? "breadcrumb" : "header",
          });
          return;
        }
      }

      // B. Deteksi Tombol Interaktif (<button>, [role="button"], input[type="submit"])
      const btn = target.closest("button, [role='button'], input[type='submit']");
      if (btn) {
        const btnText = (btn.innerText || btn.getAttribute("aria-label") || btn.title || btn.id || "").trim();
        if (!btnText && !btn.id) return; // Abaikan klik elemen tanpa identitas

        // Cari konteks section terdekat
        const sectionEl = btn.closest("[data-section], header, footer, dialog, aside, main, section");
        const sectionName =
          sectionEl?.getAttribute("data-section") ||
          sectionEl?.tagName.toLowerCase() ||
          "content";

        // Khusus tombol pratinjau PDF / dokumen
        if (/pratinjau|lihat pdf|preview/i.test(btnText)) {
          const docCard = btn.closest("article, .doc-item, [data-doc-title]");
          const docTitle =
            docCard?.getAttribute("data-doc-title") ||
            docCard?.querySelector("h3, h4")?.innerText?.trim() ||
            btnText;

          trackDocumentPreview({
            title: docTitle,
            url: window.location.pathname,
            category: "sop_or_laporan",
          });
          return;
        }

        // Tombol interaktif umum / CTA
        trackButtonClick({
          buttonText: btnText.slice(0, 50),
          buttonId: btn.id || "",
          buttonType: btn.getAttribute("type") || "button",
          section: sectionName,
        });
      }
    };

    document.addEventListener("click", handleGlobalClick, { capture: true, passive: true });
    return () => {
      document.removeEventListener("click", handleGlobalClick, { capture: true });
    };
  }, []);

  // ── 4. Scroll Depth Tracking (25%, 50%, 75%, 90%) ──
  useEffect(() => {
    if (typeof window === "undefined") return;

    let ticking = false;

    const handleScroll = () => {
      if (ticking) return;
      ticking = true;

      requestAnimationFrame(() => {
        const docHeight = Math.max(
          document.body.scrollHeight,
          document.documentElement.scrollHeight
        );
        const winHeight = window.innerHeight;
        const scrollTop = window.scrollY || document.documentElement.scrollTop;

        if (docHeight <= winHeight) {
          ticking = false;
          return;
        }

        const scrollPercentage = Math.round(((scrollTop + winHeight) / docHeight) * 100);

        [25, 50, 75, 90].forEach((threshold) => {
          if (scrollPercentage >= threshold && !trackedDepths.current.has(threshold)) {
            trackedDepths.current.add(threshold);
            trackScrollDepth(threshold, window.location.pathname);
          }
        });

        ticking = false;
      });
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // ── 5. PWA Standalone Telemetri ──
  useEffect(() => {
    if (typeof window === "undefined") return;
    const isStandalone =
      window.navigator.standalone === true ||
      window.matchMedia("(display-mode: standalone)").matches;

    trackPwaInteraction({
      action: "session_start",
      displayMode: isStandalone ? "standalone" : "browser",
    });
  }, []);

  // ── 6. Theme Switch Observer ──
  useEffect(() => {
    if (typeof window === "undefined" || !window.MutationObserver) return;

    let lastTheme = document.documentElement.classList.contains("dark") ? "dark" : "light";

    const observer = new MutationObserver(() => {
      const isDark = document.documentElement.classList.contains("dark");
      const currentTheme = isDark ? "dark" : "light";
      if (currentTheme !== lastTheme) {
        lastTheme = currentTheme;
        trackThemeChange(currentTheme);
      }
    });

    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["class", "data-theme"],
    });

    return () => observer.disconnect();
  }, []);

  return null;
}
