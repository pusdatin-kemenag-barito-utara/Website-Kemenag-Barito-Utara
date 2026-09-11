/**
 * Centralized Dynamic Environment Variable Resolver
 * - Browser / React islands: window.__PUBLIC_ENV__ (injected dynamically by SSR)
 * - Server / SSR: process.env (injected by Infisical CLI runtime)
 * - Build / Vite: import.meta.env
 */

export function getEnv(key, defaultValue = "") {
  // 1. Browser runtime: prioritize dynamic SSR injection via window.__PUBLIC_ENV__
  if (
    typeof window !== "undefined" &&
    window.__PUBLIC_ENV__ &&
    window.__PUBLIC_ENV__[key] !== undefined &&
    window.__PUBLIC_ENV__[key] !== ""
  ) {
    return window.__PUBLIC_ENV__[key];
  }

  // 2. Node.js runtime / SSR: read directly from process.env (Infisical runtime memory)
  if (
    typeof process !== "undefined" &&
    process.env &&
    process.env[key] !== undefined &&
    process.env[key] !== ""
  ) {
    return process.env[key];
  }

  // 3. Vite / Astro import.meta.env fallback
  if (
    typeof import.meta !== "undefined" &&
    import.meta.env &&
    import.meta.env[key] !== undefined &&
    import.meta.env[key] !== ""
  ) {
    return import.meta.env[key];
  }

  return defaultValue;
}

export function getSiteUrl() {
  return getEnv("NEXT_PUBLIC_SITE_URL", "https://baritoutara.kemenag.go.id").replace(/\/$/, "");
}

export function getPublicApiUrl() {
  return getEnv(
    "PUBLIC_API_URL",
    `http://127.0.0.1:${getEnv("BACKEND_PORT", getEnv("PORT", "8080"))}`
  ).replace(/\/$/, "");
}

export function getSupabaseUrl() {
  return getEnv("NEXT_PUBLIC_SUPABASE_URL", "").replace(/\/$/, "");
}

export function getSupabaseAnonKey() {
  return (
    getEnv("NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY") ||
    getEnv("NEXT_PUBLIC_SUPABASE_ANON_KEY")
  );
}

export function getTurnstileSiteKey() {
  return (
    getEnv("NEXT_PUBLIC_TURNSTILE_SITE_KEY") ||
    getEnv("TURNSTILE_SITE_KEY") ||
    getEnv("PUBLIC_TURNSTILE_SITE_KEY") ||
    "0x4AAAAAADR1O_LSp1lgc3km"
  );
}

export function getGaId() {
  return getEnv("PUBLIC_GA_ID") || getEnv("NEXT_PUBLIC_GA_ID");
}

export function getGtmId() {
  return getEnv("PUBLIC_GTM_ID") || getEnv("NEXT_PUBLIC_GTM_ID");
}

export function getOneSignalAppId() {
  return (
    getEnv("PUBLIC_ONESIGNAL_APP_ID") ||
    getEnv("NEXT_PUBLIC_ONESIGNAL_APP_ID") ||
    getEnv("ONESIGNAL_APP_ID")
  );
}

export function getGoogleSiteVerification() {
  return (
    getEnv("NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION") ||
    getEnv("GOOGLE_SITE_VERIFICATION", "")
  );
}
