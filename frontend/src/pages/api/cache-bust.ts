import type { APIRoute } from "astro";
import { invalidatePublicCache } from "@/lib/pocketbase/db";

export const prerender = false;

const lastBustByPrefix = new Map<string, number>();
const BUST_COOLDOWN_MS = 400;

async function handleCacheBust(request: Request, url: URL) {
  let prefix = String(url.searchParams.get("prefix") || "").trim().slice(0, 48);

  if (request.method === "POST") {
    try {
      const contentType = request.headers.get("content-type") || "";
      if (contentType.includes("application/json")) {
        const body = await request.json().catch(() => null);
        if (body && typeof body.prefix === "string") {
          prefix = body.prefix.trim().slice(0, 48);
        }
      }
    } catch {}
  }

  const now = Date.now();
  const key = prefix || "__all__";
  const last = lastBustByPrefix.get(key) || 0;
  let cleared = false;
  let backendVersion: number | null = null;

  if (now - last >= BUST_COOLDOWN_MS) {
    invalidatePublicCache(prefix, { notifyServer: false });
    lastBustByPrefix.set(key, now);
    cleared = true;

    const backendUrl = process.env.BACKEND_INTERNAL_URL || "http://127.0.0.1:8080";
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 3000);
      try {
        const beRes = await fetch(`${backendUrl}/api/cache-bust`, {
          method: "POST",
          signal: controller.signal,
        });
        if (beRes.ok) {
          const beData = await beRes.json().catch(() => null);
          if (beData && typeof beData.version === "number") {
            backendVersion = beData.version;
          }
        }
      } finally {
        clearTimeout(timeoutId);
      }
    } catch {
      // Abaikan jika backend sedang tidak terjangkau; SSR cache sudah ter-invalidate
    }
  }

  return new Response(
    JSON.stringify({
      ok: true,
      busted: prefix || "all",
      cleared,
      version: backendVersion,
      timestamp: now,
    }),
    {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        "Cache-Control": "no-store, no-cache, must-revalidate",
      },
    },
  );
}

export const POST: APIRoute = async ({ request, url }) => {
  return handleCacheBust(request, url);
};

export const GET: APIRoute = async ({ request, url }) => {
  return handleCacheBust(request, url);
};
