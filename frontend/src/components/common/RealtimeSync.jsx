"use client";

import { useEffect } from "react";
import { useRouter } from "@/hooks/useNextNavigation";
import { getPocketBase } from "@/lib/pocketbase/client";
import { invalidatePublicCache } from "@/lib/pocketbase/db";
import { logInfo } from "@/lib/logger";

/**
 * RealtimeSync Component (PocketBase SSE Version)
 * Listens for realtime events on collections (berita, site_settings, homepage_slides).
 * Skips reload interruption inside /admin or /pusdatin and invalidates SSR cache cleanly.
 */
export default function RealtimeSync() {
  const router = useRouter();

  useEffect(() => {
    if (typeof window !== "undefined") {
      const path = window.location.pathname || "";
      if (path.startsWith("/admin") || path.startsWith("/pusdatin")) {
        return undefined;
      }
    }

    const pb = getPocketBase();
    let unsubscribeBerita = null;
    let unsubscribeSettings = null;
    let unsubscribeSlides = null;
    let refreshTimer = null;

    const scheduleRefresh = (prefix = "", immediateReload = false) => {
      invalidatePublicCache(prefix, { notifyServer: true });
      if (refreshTimer) {
        window.clearTimeout(refreshTimer);
      }
      refreshTimer = window.setTimeout(() => {
        if (immediateReload) {
          window.location.reload();
        } else {
          router.refresh();
        }
      }, 600);
    };

    try {
      pb.collection("berita")
        .subscribe("*", (e) => {
          logInfo("pb_realtime_berita_event", { action: e.action });
          scheduleRefresh("berita", false);
        })
        .then((unsub) => {
          unsubscribeBerita = unsub;
        })
        .catch(() => {});

      pb.collection("site_settings")
        .subscribe("*", (e) => {
          if (e.record?.key === "maintenance_mode") {
            scheduleRefresh("settings", true);
            return;
          }
          scheduleRefresh("settings", false);
        })
        .then((unsub) => {
          unsubscribeSettings = unsub;
        })
        .catch(() => {});

      pb.collection("homepage_slides")
        .subscribe("*", (e) => {
          logInfo("pb_realtime_slides_event", { action: e.action });
          scheduleRefresh("slides", false);
        })
        .then((unsub) => {
          unsubscribeSlides = unsub;
        })
        .catch(() => {});
    } catch {
      // Abaikan error SSE
    }

    return () => {
      if (refreshTimer) {
        window.clearTimeout(refreshTimer);
      }
      try {
        if (unsubscribeBerita) unsubscribeBerita();
        else pb.collection("berita").unsubscribe("*").catch(() => {});
        if (unsubscribeSettings) unsubscribeSettings();
        else pb.collection("site_settings").unsubscribe("*").catch(() => {});
        if (unsubscribeSlides) unsubscribeSlides();
        else pb.collection("homepage_slides").unsubscribe("*").catch(() => {});
      } catch {}
    };
  }, [router]);

  return null;
}
