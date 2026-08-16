# Kemenag Barito Utara — Monorepo

Website resmi Kementerian Agama Kabupaten Barito Utara.

## Struktur

```
kemenag-monorepo/
├── frontend/   # Astro 7 (SSR) + React 19 islands + Tailwind CSS 4 + Vite 8 (FE, port 3000/4321)
│   ├── src/pages/       # 54 halaman Astro
│   ├── src/shims/       # Shim untuk import next/* (bukan Next.js asli!)
│   ├── src/components/  # Komponen React (islands)
│   └── tests/           # Vitest + Playwright
├── backend/    # Go Fiber 2 (API, port 3001)
│   ├── cmd/server/      # Entrypoint
│   └── internal/        # handlers, middleware, services, repository
└── .env.local  # Env tunggal untuk FE + BE (gitignored)
```

Tidak ada Next.js di proyek ini — import `next/*` di komponen React diselesaikan lewat shim FE. Semua API, DB, auth, dan storage di backend Go.

## Quick Start

```bash
npm install          # root (npm workspaces: frontend + backend)
npm run dev          # BE :3001 + FE :4321 (concurrently)
```

- FE: http://localhost:4321
- BE: http://localhost:3001/api/...

## Scripts

| Script      | Aksi                                    |
| ----------- | --------------------------------------- |
| `npm run dev`        | BE + FE dev server |
| `npm run dev:fe`     | Astro dev (4321) |
| `npm run dev:be`     | Go Fiber dev (3001) |
| `npm run build`      | Build BE + FE |
| `npm run start`      | Jalankan build keduanya |
| `npm run lint`       | ESLint FE |
| `npm test`           | Vitest FE + Go test BE |

## Env

`.env.local` di root (lihat `frontend/README.md` untuk daftar lengkap variabel).

Dikembangkan oleh **Muhammad Nazilah, S.E.**