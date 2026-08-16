# AGENTS.md — Kemenag Barito Utara (Frontend)

## Stack

- **Astro 7** (SSR via `@astrojs/node` v11), React 19 islands (`@astrojs/react` v6), Tailwind CSS 4, Vite 8 (Rolldown/Oxc engine), Rust Compiler
- **Go Fiber 2** backend (API) — lihat `../backend/` (bukan Next.js API routes)
- **Supabase** for Auth & Storage only
- **Supabase Storage** for file/media storage
- **Vitest** (unit), **Playwright** (E2E)
- **Google Gemini / Groq / Mistral / OpenRouter** — multi-model AI chatbot fallback (dipanggil lewat backend Go)
- Monorepo root: `E:\CODING\project-kantor\kemenag-monorepo` — `npm run dev` menjalankan BE (Fiber, port 3001) + FE (Astro, port 4321) via `concurrently`

## Penting: Tidak Ada Next.js

- Proyek ini **bukan** Next.js. `src/pages/` (App Router) sudah dihapus.
- Komponen React tetap memakai `next/link`, `next/image`, `next/navigation`, dst — **semua di-shim** ke `src/shims/` (alias di `astro.config.mjs`). Jangan pernah re-install `next` atau `eslint-config-next`.
- Shim tersedia: `next-image.jsx`, `next-link.jsx`, `next-navigation.js`, `next-headers.js`, `next-script.jsx`, `next-font.js`, `third-parties.jsx`, `ai-sdk-react.js`.

## Commands (Windows PowerShell — use `;` not `&&`)

| Action     | Command                                       |
| ---------- | --------------------------------------------- |
| Dev (root) | `npm run dev` (BE 3001 + FE 4321)             |
| Dev FE     | `npm run dev:fe` → `ns`                       |
| Dev BE     | `npm run dev:be` → `ns`                       |
| Build      | `npm run build` (BE + FE)                     |
| Lint       | `npm run lint` (frontend saja)                |
| Unit tests | `npm test` (Vitest; `tests/**/*.test.{js,jsx}`) |
| E2E tests  | `npm run test:e2e` (Playwright; `tests/e2e/`, port 4321) |

Tidak ada script `typecheck`, `test:watch`, `test:coverage`, atau `db:push` di workspace FE (sudah dibersihkan dari era Next.js).

## Architecture

- **Alias**: `@/*` → `./src/*` (jsconfig.json + vitest.config.mjs + astro.config.mjs)
- **Layout**: `src/layouts/BaseLayout.astro` — 5 island widget (`client:load`): RealtimeSync, PageViewTracker, PwaRegister, ChatWidget, AccessibilityWidget
- **Pages**: `src/pages/` — Halaman Astro (admin/*, login rahasia `pusdatin/auth.astro`, `404.astro`, home `index`/`beranda`, dll)
- **Server API**: semua endpoint API dilayani **backend Go** (`../backend/internal/`), prefix `/api/`; FE memanggil via proxy vite (`/api` → `http://localhost:3001`) saat dev, atau reverse-proxy di production
- **Env**: `.env.local` di ROOT monorepo dibaca oleh Astro (sekolah parser `astro/src/env.d.ts`); jangan buat `.env` lain di `frontend/`
- **SEO structured data**: `src/lib/structured-data.ts` — `organizationSchema()`, `websiteSchema()`, `newsArticleSchema()`, `breadcrumbSchema()`, `contactPageSchema()`, `navigationSchema()`

## UI / Layout

- Setiap halaman publik WAJIB memakai `<PageBanner />` dari `src/components/common/PageBanner.jsx` di atas (kecuali `/beranda` dan `/error`)
- **DO NOT** pakai `max-w-*` wrapper — pakai `w-full px-6 sm:px-10 lg:px-16 xl:px-20`
- Chatbot AI widget: `src/components/features/chat/ChatWidget.js`
- CSS: Tailwind v4 (`@import "tailwindcss"` di `globals.css`; plugin `@tailwindcss/vite` di `astro.config.mjs`)
- **Shared Admin UI components** di `src/components/features/admin/slides/SlidesUI.jsx`:
  - `<FloatingFeedback />` — floating toast (success/error)
  - `<DeleteConfirmModal />` — premium delete confirmation modal — **ALWAYS pakai ini, jangan `window.confirm()`**
  - `<StatCard />`, `<StatusPill />`, `<ActionIconButton />`, `<ToggleSwitch />`, `<SlidePagination />`

## Database & Backend

- Semua query DB dilakukan di **backend Go** (Fiber) — e.g. `../backend/internal/db/`, `repositories`. FE tidak lagi punya klien Drizzle (`src/lib/drizzle.ts`, `redis.ts`, `rate-limit.ts` dihapus).
- Rate limiting, audit log, view counter, dan validasi API diimplementasikan di backend Go.

## Testing & Build Rules

- Vitest: happy-dom, `@testing-library/jest-dom/vitest`, `next/navigation` di-mock lewat shim (lihat `vitest.setup.js`)
- Test files aktif di `tests/`: `date-utils`, `berita-utils`, `cover-image`, `laporan-admin-utils`, `laporan-admin-reducer`, `admin-laporan-manager`, `nav-utils`, `permissions`, `structured-data`, `next-config-security` (pure-logic)
- 1 E2E spec di `tests/e2e/` (base URL `http://127.0.0.1:4321`)
- **STRICT BUILD RULE**: **DO NOT EVER** run `npm run build` atau perintah verifikasi build otomatis. **ONLY** run build saat diminta eksplisit oleh user.
- **DO NOT** jalankan unit tests otomatis untuk edit rutin (UI/navigasi/konten) kecuali diminta user atau perubahan backend logic kritis.

## SEO & PWA

- JSON-LD: `src/components/features/seo/JsonLd.jsx` (dipasang di `BaseLayout`)
- Active schemas: `organizationSchema` (GovernmentOrganization + GovernmentOffice) + `websiteSchema` + `navigationSchema`
- Sitemap: `src/pages/sitemap.xml.ts` (dinamis — halaman statis + berita dari API, revalidate 300s)
- Robots: `src/pages/robots.txt.ts` (disallow: /admin, /api/, /auth/, /login, /debug-error)
- PWA: `/public/sw.js` (cache-first static, network-first navigation), `/public/manifest.webmanifest`
- CSP + security headers diatur di backend/HTTP layer (bandingkan `../backend/internal/middleware/`); FE Astro tidak set headers

## Environment

- `.env.local` (root monorepo, gitignored)
- Required: `DATABASE_URL`, `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY` (dipakai backend Go)
- AI keys (backend): `GEMINI_API_KEY`, `GROQ_API_KEY`, `MISTRAL_API_KEY`, `OPENROUTER_API_KEY`
- Turnstile: `NEXT_PUBLIC_TURNSTILE_SITE_KEY`, `TURNSTILE_SECRET_KEY`
- Supabase CMS bucket: `NEXT_PUBLIC_SUPABASE_CMS_BUCKET` (default `cms-media`)
- Optional: `NEXT_PUBLIC_SITE_URL` (default `https://baritoutara.kemenag.go.id`)
- Session admin: cookie `sb-website-auth-token` (ditetapkan backend Go saat login, dibaca ulang untuk otorisasi halaman admin)

## Notes

- ESLint: flat config (`eslint.config.mjs`) — `@eslint/js` recommended untuk `**/*.{js,mjs,cjs,jsx}`; file `.ts`/`.tsx` di-ignore (di-transpile Astro); `no-unused-vars` nonaktif (React 19 tanpa import `React`)
- Komentar `eslint-disable-next-line @next/next/no-img-element` dan `react-hooks/exhaustive-deps` SUDAH dihapus — jangan ditambah lagi (plugin Next/react-hooks tidak terpasang dan akan jadi error)
- Google Search Console: verified, indexing requested
- Dev by Muhammad Nazilah, S.E.