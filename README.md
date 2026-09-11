# Kemenag Barito Utara — Monorepo

Website resmi Kementerian Agama Kabupaten Barito Utara.

## Struktur

```
kemenag-monorepo/
├── frontend/   # Astro 7 (SSR) + React 19 islands + Tailwind CSS 4 + Vite 8 (FE, port 3000)
│   ├── src/pages/       # 54 halaman Astro
│   ├── src/shims/       # Shim untuk import next/* (bukan Next.js asli!)
│   ├── src/components/  # Komponen React (islands)
│   └── tests/           # Vitest + Playwright
├── backend/    # Go Fiber 3 (API, port 8080)
│   ├── cmd/server/      # Entrypoint
│   └── internal/        # handlers, middleware, services, repository
└── .infisical.json # Terhubung ke Infisical Cloud (/website-kemenag)
```

Tidak ada Next.js di proyek ini — import `next/*` di komponen React diselesaikan lewat shim FE. Semua API, DB, auth, dan storage di backend Go.

## Quick Start

```bash
npm run install:all  # Menginstal seluruh dependensi root, frontend, dan backend
npm run dev          # BE :8080 + FE :3000 dengan 36 secrets terinjeksi dari Infisical Cloud
```

- FE: http://localhost:3000
- BE: http://localhost:8080/api/...

## Scripts

| Script          | Aksi                                                        |
| --------------- | ----------------------------------------------------------- |
| `npm run dev`        | BE (8080) + FE (3000) dev server via Infisical Cloud (dev)  |
| `npm run dev:prod`   | BE + FE dev server lokal dengan data Infisical Cloud (prod) |
| `npm run dev:fe`     | Astro dev (3000) via Infisical Cloud                        |
| `npm run dev:be`     | Go Fiber dev (8080) via Infisical Cloud                     |
| `npm run build`      | Build BE + FE                                               |
| `npm run start`      | Jalankan build keduanya                                     |
| `npm run lint`       | ESLint FE                                                   |
| `npm test`           | Vitest FE + Go test BE via Infisical                        |

## Environment Variables

Lingkungan environment variables dikelola secara terpusat dan aman di **Infisical Cloud** (folder `/website-kemenag`). Tidak ada lagi berkas fisik `.env` di disk lokal.

Dikembangkan oleh **Muhammad Nazilah, S.E.**