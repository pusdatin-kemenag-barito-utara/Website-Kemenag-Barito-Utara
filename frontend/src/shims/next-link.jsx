// Shim next/link → <a> polos (komponen React lama dijalankan di Astro).
import React from "react";

function resolveHref(href) {
  if (typeof href === "string") return href;
  if (href && typeof href === "object") {
    const { pathname, query } = href;
    const base = pathname || "";
    if (query && typeof query === "object") {
      const qs = new URLSearchParams();
      for (const [k, v] of Object.entries(query)) {
        if (v !== undefined && v !== null && v !== "") qs.set(k, String(v));
      }
      const s = qs.toString();
      return s ? `${base}?${s}` : base;
    }
    return base;
  }
  return "#";
}

export default function Link({ href, children, className, onClick, target, rel, ...rest }) {
  return React.createElement(
    "a",
    { href: resolveHref(href), className, onClick, target, rel, ...rest },
    children
  );
}
