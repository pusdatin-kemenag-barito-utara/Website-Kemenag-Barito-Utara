import { defineMiddleware } from "astro:middleware";

const CANONICAL_HOST = "baritoutara.kemenag.go.id";
const REDIRECT_HOSTS = new Set([
  "kemenag-baritoutara.com",
  "www.kemenag-baritoutara.com",
]);

export const onRequest = defineMiddleware(async (context, next) => {
  const forwardedHost = context.request.headers.get("x-forwarded-host");
  const reqHost = context.request.headers.get("host");
  const urlHost = context.url.host;

  // Ambil host dari header request (dukung proxy header dari Traefik/Coolify/Cloudflare)
  const rawHost = forwardedHost || reqHost || urlHost || "";

  // Bersihkan port jika ada (misal kemenag-baritoutara.com:3000)
  const host = rawHost.split(":")[0].trim().toLowerCase();

  // Jika request mengarah ke domain lama (kemenag-baritoutara.com / www.kemenag-baritoutara.com),
  // lakukan HTTP 301 Permanent Redirect ke subdomain resmi pusat (baritoutara.kemenag.go.id).
  // Subdomain aplikasi lain (*.kemenag-baritoutara.com) TIDAK terpengaruh.
  if (REDIRECT_HOSTS.has(host)) {
    const targetUrl = new URL(context.request.url);
    targetUrl.protocol = "https:";
    targetUrl.hostname = CANONICAL_HOST;
    targetUrl.port = "";

    return context.redirect(targetUrl.toString(), 301);
  }

  const pathname = context.url.pathname;

  // Guard Server-Side Astro: Bila mengakses area /admin/* tanpa cookie sesi login yang sah,
  // langsung tolak dan direct ke halaman login rahasia (/pusdatin/auth).
  if (pathname.startsWith("/admin")) {
    const authCookie = context.cookies.get("sb-website-auth-token");
    if (!authCookie || !authCookie.value) {
      const loginUrl = new URL("/pusdatin/auth", context.url);
      return context.redirect(loginUrl.toString(), 302);
    }
  }

  const response = await next();

  // Anti-Back/Forward Cache (bfcache): Cegah browser menyimpan riwayat DOM / admin di memori cache
  if (pathname.startsWith("/admin") || pathname.startsWith("/pusdatin/auth")) {
    response.headers.set(
      "Cache-Control",
      "no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0"
    );
    response.headers.set("Pragma", "no-cache");
    response.headers.set("Expires", "0");
    response.headers.set("Surrogate-Control", "no-store");
  }

  return response;
});
