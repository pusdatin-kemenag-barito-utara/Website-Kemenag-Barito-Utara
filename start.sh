#!/bin/sh
set -e

echo "[STARTUP] Inisialisasi Kemenag Barito Utara Production Container..."

# Supervisor Go Backend (auto-restart jika proses backend crash/exit)
(
  while true; do
    echo "[SUPERVISOR] Menjalankan Go backend server di port 8080..."
    PORT=8080 /app/backend/server
    EXIT_CODE=$?
    echo "[SUPERVISOR] Go backend berhenti dengan kode $EXIT_CODE. Restarting dalam 2 detik..."
    sleep 2
  done
) &

# Tunggu sampai backend siap menerima koneksi
echo "[STARTUP] Menunggu kesiapan Go backend API..."
for i in $(seq 1 30); do
  if wget -q -O - http://127.0.0.1:8080/api/health >/dev/null 2>&1 || curl -s http://127.0.0.1:8080/api/health >/dev/null 2>&1; then
    echo "[STARTUP] Go backend API siap (port 8080)!"
    break
  fi
  sleep 0.5
done

# Jalankan Astro Frontend di foreground (port 3000)
echo "[STARTUP] Menjalankan Astro Frontend di port 3000..."
cd /app/frontend && PORT=3000 HOST=0.0.0.0 exec node ./dist/server/entry.mjs
