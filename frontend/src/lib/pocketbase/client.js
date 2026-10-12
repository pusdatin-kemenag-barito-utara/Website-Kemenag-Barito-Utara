import PocketBase from "pocketbase";
import { getPocketBaseUrl } from "@/lib/env";

let pbSingleton = null;

/**
 * Mendapatkan instance PocketBase klien (Browser: Singleton, SSR: fresh instance)
 */
export function getPocketBase() {
  const url = getPocketBaseUrl();

  // Browser environment
  if (typeof window !== "undefined") {
    if (!pbSingleton) {
      pbSingleton = new PocketBase(url);
      pbSingleton.autoCancellation(false);

      // Sinkronkan cookie setiap ada perubahan authStore
      pbSingleton.authStore.onChange(() => {
        try {
          if (typeof document !== "undefined") {
            const cookie = pbSingleton.authStore.exportToCookie({
              httpOnly: false,
              sameSite: "Lax",
              secure: window.location.protocol === "https:",
            });
            document.cookie = cookie;
          }
        } catch {
          // ignore cookie write errors
        }
      });

      // Load initial auth jika ada di cookie
      if (typeof document !== "undefined" && document.cookie) {
        pbSingleton.authStore.loadFromCookie(document.cookie);
      }
    }
    return pbSingleton;
  }

  // Server-side (SSR)
  const pb = new PocketBase(url);
  pb.autoCancellation(false);
  return pb;
}

/**
 * Membuat instance PocketBase khusus untuk SSR Astro dengan cookie tertentu
 */
export function createPocketBaseForSSR(cookieHeader = "") {
  const pb = new PocketBase(getPocketBaseUrl());
  pb.autoCancellation(false);
  if (cookieHeader) {
    pb.authStore.loadFromCookie(cookieHeader);
  }
  return pb;
}

/**
 * Helper untuk mendapatkan URL publik file media dari PocketBase record
 */
export function getPocketBaseFileUrl(record, filename, queryParams = {}) {
  if (!record || !filename) return "";
  const pb = getPocketBase();
  return pb.files.getURL(record, filename, queryParams);
}

export default getPocketBase;
