// @ts-check
import { defineConfig } from "astro/config";
import react from "@astrojs/react";
import node from "@astrojs/node";
import sitemap from "@astrojs/sitemap";
import tailwindcss from "@tailwindcss/vite";
import { fileURLToPath } from "node:url";

// Fase migrasi : shim modul Next.js agar komponen React lama (islands) bisa
// dikompilasi tanpa refactor major. Semua data diambil dari backend Golang.
const nextShims = {
  "next/link": fileURLToPath(new URL("./src/shims/next-link.jsx", import.meta.url)),
  "next/image": fileURLToPath(new URL("./src/shims/next-image.jsx", import.meta.url)),
  "next/navigation": fileURLToPath(new URL("./src/shims/next-navigation.js", import.meta.url)),
  "next/script": fileURLToPath(new URL("./src/shims/next-script.jsx", import.meta.url)),
  "next/font/google": fileURLToPath(new URL("./src/shims/next-font.js", import.meta.url)),
  "@next/third-parties/google": fileURLToPath(new URL("./src/shims/third-parties.jsx", import.meta.url)),
  "@ai-sdk/react": fileURLToPath(new URL("./src/shims/ai-sdk-react.js", import.meta.url)),
};

import { createLogger } from "vite";

// Filter out benign browser socket cancellations (ECONNRESET/EPIPE) in dev proxy
const customLogger = createLogger();
const originalError = customLogger.error.bind(customLogger);
/**
 * @param {string} msg
 * @param {import('vite').LogErrorOptions} [options]
 */
customLogger.error = (msg, options) => {
  if (
    typeof msg === "string" &&
    (msg.includes("ECONNRESET") ||
      msg.includes("EPIPE") ||
      msg.includes("http proxy error"))
  ) {
    return;
  }
  originalError(msg, options);
};

// Environment variables dikelola secara terpusat oleh Infisical Cloud (process.env)
const siteUrl = process.env.NEXT_PUBLIC_SITE_URL;

export default defineConfig({
  output: "static",
  adapter: node({ mode: "standalone" }),
  site: siteUrl,
  integrations: [
    react(),
    sitemap({
      filter: (p) => !p.includes("/admin") && !p.includes("/login") && !p.includes("/pusdatin"),
    }),
  ],
  vite: {
    customLogger,
    envPrefix: ["PUBLIC_", "NEXT_PUBLIC_"],
    plugins: [tailwindcss()],
    resolve: {
      alias: {
        ...nextShims,
        "@": fileURLToPath(new URL("./src", import.meta.url)),
      },
    },
    optimizeDeps: { include: ["react", "react-dom"] },
    define: {
      "process.env.NODE_ENV": JSON.stringify(
        process.env.NODE_ENV || "development",
      ),
      "process.env.NEXT_PUBLIC_SITE_URL": JSON.stringify(
        process.env.NEXT_PUBLIC_SITE_URL || "",
      ),
      "process.env.PUBLIC_API_URL": JSON.stringify(
        process.env.PUBLIC_API_URL || "",
      ),
      "process.env.NEXT_PUBLIC_SUPABASE_URL": JSON.stringify(
        process.env.NEXT_PUBLIC_SUPABASE_URL || "",
      ),
      "process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY": JSON.stringify(
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "",
      ),
      "process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY": JSON.stringify(
        process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || "",
      ),
      "process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY": JSON.stringify(
        process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY || "",
      ),
      "process.env.NEXT_PUBLIC_GA_ID": JSON.stringify(
        process.env.NEXT_PUBLIC_GA_ID || "",
      ),
      "process.env.NEXT_PUBLIC_GTM_ID": JSON.stringify(
        process.env.NEXT_PUBLIC_GTM_ID || "",
      ),
      "process.env.NEXT_PUBLIC_ONESIGNAL_APP_ID": JSON.stringify(
        process.env.NEXT_PUBLIC_ONESIGNAL_APP_ID || "",
      ),
      "process.env.NEXT_PUBLIC_PUSDATIN_URL": JSON.stringify(
        process.env.NEXT_PUBLIC_PUSDATIN_URL || "",
      ),
      "process.env.NEXT_PUBLIC_SUPABASE_CMS_BUCKET": JSON.stringify(
        process.env.NEXT_PUBLIC_SUPABASE_CMS_BUCKET || "cms-media",
      ),
    },
    server: {
      proxy: {
        "/api": {
          target: process.env.PUBLIC_API_URL || `http://127.0.0.1:${process.env.PORT || "8080"}`,
          changeOrigin: true,
          configure: (proxy) => {
            proxy.on("error", (err) => {
              const code = err && typeof err === "object" && "code" in err ? err.code : undefined;
              if (code === "ECONNRESET" || code === "EPIPE") return;
              console.error("[vite proxy error]", err);
            });
          },
        },
        "/storage": {
          target: process.env.PUBLIC_API_URL || `http://127.0.0.1:${process.env.PORT || "8080"}`,
          changeOrigin: true,
          rewrite: (path) => path.replace(/^\/storage/, "/api/storage/media"),
          configure: (proxy) => {
            proxy.on("error", (err) => {
              const code = err && typeof err === "object" && "code" in err ? err.code : undefined;
              if (code === "ECONNRESET" || code === "EPIPE") return;
              console.error("[vite proxy error]", err);
            });
          },
        },
      },
    },
  },
});