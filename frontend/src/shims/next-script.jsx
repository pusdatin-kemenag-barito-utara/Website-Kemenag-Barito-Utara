// Shim next/script — skrip eksternal dimuat manual di layout Astro.
import React from "react";

export default function Script({ id, src, children, strategy, onLoad, ...rest }) {
  if (typeof window === "undefined") {
    // Saat SSR: embed inline children (jika ada) sebagai <script> polos.
    if (children) {
      const raw = typeof children === "function" ? null : children;
      if (raw != null) {
        return React.createElement("script", {
          id,
          ...(src ? { src } : {}),
          dangerouslySetInnerHTML: {
            __html: typeof raw === "string" ? raw : React.Children.toArray(raw).join(""),
          },
        });
      }
    }
    return src ? React.createElement("script", { id, src, async: strategy !== "afterInteractive" }) : null;
  }
  return null;
}
