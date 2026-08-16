// - SSR (server Astro): fetch ke absolute PUBLIC_API_URL dari environment variable.
// - Browser (islands): fetch relatif '/api/...' (di-proxy ke BE saat dev).

const SSR = typeof window === "undefined";
const API_URL =
  import.meta.env.PUBLIC_API_URL ||
  (typeof process !== "undefined" && process.env.PUBLIC_API_URL) ||
  `http://127.0.0.1:${(typeof process !== "undefined" && process.env.PORT) || "8080"}`;

export function apiUrl(path) {
  const p = path.startsWith("/api") ? path : `/api${path}`;
  if (SSR) return `${API_URL}${p}`;
  return p;
}

export async function apiFetch(path, opts = {}) {
  const headers = { Accept: "application/json", ...(opts.headers || {}) };
  const isForm = opts.body instanceof FormData;
  if (opts.body && !isForm && typeof opts.body !== "string") {
    headers["Content-Type"] = "application/json";
    opts = { ...opts, body: JSON.stringify(opts.body) };
  }
  return fetch(apiUrl(path), {
    cache: "no-store",
    ...opts,
    headers,
  });
}

export async function apiGet(path, opts = {}) {
  const res = await apiFetch(path, { method: "GET", ...opts });
  return res.json();
}

export async function apiPost(path, body, opts = {}) {
  const res = await apiFetch(path, { method: "POST", body, ...opts });
  return res.json();
}

export async function apiPut(path, body, opts = {}) {
  const res = await apiFetch(path, { method: "PUT", body, ...opts });
  return res.json();
}

export async function apiPatch(path, body, opts = {}) {
  const res = await apiFetch(path, { method: "PATCH", body, ...opts });
  return res.json();
}

export async function apiDelete(path, opts = {}) {
  const res = await apiFetch(path, { method: "DELETE", ...opts });
  return res.json();
}

export { SSR };
