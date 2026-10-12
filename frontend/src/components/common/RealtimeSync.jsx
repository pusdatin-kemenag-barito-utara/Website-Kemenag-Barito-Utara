"use client";

import { useEffect } from "react";
import { useRouter } from "@/hooks/useNextNavigation";
import { getPocketBase } from "@/lib/pocketbase/client";
import { logInfo } from "@/lib/logger";

/**
 * RealtimeSync Component (PocketBase SSE Version)
 * Listens for realtime events on collections (berita, site_settings).
 * When changes occur, it triggers router.refresh() or hard reload.
 */
export default function RealtimeSync() {
  const router = useRouter();

  useEffect(() => {
    const pb = getPocketBase();
    let unsubscribeBerita = null;
    let unsubscribeSettings = null;

    try {
      pb.collection("berita")
        .subscribe("*", (e) => {
          logInfo("pb_realtime_berita_event", { action: e.action });
          router.refresh();
        })
        .then((unsub) => {
          unsubscribeBerita = unsub;
        })
        .catch(() => {});

      pb.collection("site_settings")
        .subscribe("*", (e) => {
          if (e.record?.key === "maintenance_mode") {
            window.location.reload();
            return;
          }
          router.refresh();
        })
        .then((unsub) => {
          unsubscribeSettings = unsub;
        })
        .catch(() => {});
    } catch {
      // Abaikan error SSE
    }

    return () => {
      try {
        if (unsubscribeBerita) unsubscribeBerita();
        else pb.collection("berita").unsubscribe("*").catch(() => {});
        if (unsubscribeSettings) unsubscribeSettings();
        else pb.collection("site_settings").unsubscribe("*").catch(() => {});
      } catch {}
    };
  }, [router]);

  return null;
}
