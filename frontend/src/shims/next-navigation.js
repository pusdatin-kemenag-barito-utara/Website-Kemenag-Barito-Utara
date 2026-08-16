// Shim next/navigation untuk komponen React lama yang dijalankan di Astro.
// - Server-side (SSR Astro): redirect/notFound melempar penanda agar halaman
//   Astro menanganinya di frontmatter. Jangan panggil dari server.
// - Client-side (islands): implementasi berbasis window.history.

import React, { useEffect, useState } from "react";

const SSR = typeof window === "undefined";

function isClientError(e) {
  return e && (e.digest === "NEXT_REDIRECT" || e.digest === "NEXT_NOT_FOUND");
}

const ssrRouter = {
  push: () => {},
  replace: () => {},
  back: () => {},
  forward: () => {},
  refresh: () => {},
  prefetch: () => {},
};

const clientRouter = {
  push: (href) => {
    if (typeof window !== "undefined") {
      window.location.href = href;
    }
  },
  replace: (href) => {
    if (typeof window !== "undefined") {
      window.location.replace(href);
    }
  },
  back: () => {
    if (typeof window !== "undefined") window.history.back();
  },
  forward: () => {
    if (typeof window !== "undefined") window.history.forward();
  },
  refresh: () => {
    if (typeof window !== "undefined") window.location.reload();
  },
  prefetch: () => {},
};

export function useRouter() {
  return SSR ? ssrRouter : clientRouter;
}

export function usePathname() {
  const [path, setPath] = React.useState(SSR ? "" : window.location.pathname);
  React.useEffect(() => {
    const on = () => setPath(window.location.pathname);
    window.addEventListener("popstate", on);
    return () => window.removeEventListener("popstate", on);
  }, []);
  return path;
}

export function useSearchParams() {
  const [params, setParams] = React.useState(
    () => new URLSearchParams(SSR ? "" : window.location.search)
  );
  React.useEffect(() => {
    const on = () => setParams(new URLSearchParams(window.location.search));
    window.addEventListener("popstate", on);
    return () => window.removeEventListener("popstate", on);
  }, []);
  return params;
}

export function useParams() {
  const path = usePathname();
  const params = {};
  const match = path.match(/\/([^/]+)$/);
  if (match) params.slug = match[1];
  return params;
}

export function useSelectedLayoutSegment() {
  return null;
}

export function useSelectedLayoutSegments() {
  return [];
}

export function redirect(url, type) {
  if (SSR) {
    const err = new Error("REDIRECT");
    err.digest = "NEXT_REDIRECT";
    err.url = url;
    throw err;
  }
  window.location.href = url;
}

export function permanentRedirect(url, type) {
  return redirect(url, type);
}

export function notFound() {
  if (SSR) {
    const err = new Error("NOT_FOUND");
    err.digest = "NEXT_NOT_FOUND";
    throw err;
  }
  window.location.href = "/404";
}

export function useRouter0() {
  return useRouter();
}

export function isRedirectError(e) {
  return isClientError(e);
}

export function isNotFoundError(e) {
  return isClientError(e);
}

export function getRedirectErrorUrl(e) {
  return e && e.url ? e.url : "/";
}

export function getNotFoundError(e) {
  return e;
}

export function getRedirectTypeFromError(e) {
  return "replace";
}

// API paralel untuk komponen yang import named secara eksplisit.
export const redirectErrorKey = "NEXT_REDIRECT";
export const notFoundErrorKey = "NEXT_NOT_FOUND";
