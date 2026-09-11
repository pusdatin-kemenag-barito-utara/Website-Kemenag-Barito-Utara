# ================================================================
# KEMENAG BARITO UTARA — ALL-IN-ONE PRODUCTION DOCKERFILE
# ================================================================

# --- Stage 1: Build Go Fiber Backend ---
FROM golang:alpine AS builder-be
WORKDIR /app
RUN apk add --no-cache git ca-certificates tzdata
ENV GOTOOLCHAIN=auto
COPY backend/go.mod backend/go.sum ./
RUN go mod download
COPY backend/ ./
RUN CGO_ENABLED=0 GOOS=linux GOARCH=amd64 go build -ldflags="-s -w" -o /app/server ./cmd/server

# --- Stage 2: Build Astro Frontend ---
FROM node:22-alpine AS builder-fe
WORKDIR /app/frontend
RUN apk add --no-cache libc6-compat
COPY frontend/package*.json ./
RUN npm ci || npm install
COPY frontend/ ./

ENV NEXT_PUBLIC_SUPABASE_URL="https://placeholder.supabase.co"
ENV NEXT_PUBLIC_SUPABASE_ANON_KEY="placeholder-anon-key"
ENV NODE_ENV=production

RUN npm run build

# --- Stage 3: Production Unified Runner ---
FROM node:22-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV HOST=0.0.0.0
ENV PORT=3000
ENV BACKEND_PORT=8080
ENV BACKEND_INTERNAL_URL=http://127.0.0.1:8080
ENV TZ=Asia/Jakarta
# Budgeting memori produksi agar hemat dan aman dari OOM killer
ENV NODE_OPTIONS="--max-old-space-size=384"
ENV GOMEMLIMIT=384MiB
ENV GOGC=80

RUN apk add --no-cache ca-certificates tzdata bash curl wget && \
    curl -1sLf 'https://dl.cloudsmith.io/public/infisical/infisical-cli/setup.alpine.sh' | bash && \
    apk add --no-cache infisical

# Create non-root user
RUN addgroup --system --gid 1001 appgroup && \
    adduser --system --uid 1001 appuser -G appgroup

# Copy Go backend binary
COPY --from=builder-be --chown=appuser:appgroup /app/server /app/backend/server

# Copy Astro frontend build & dependencies
COPY --from=builder-fe --chown=appuser:appgroup /app/frontend/dist /app/frontend/dist
COPY --from=builder-fe --chown=appuser:appgroup /app/frontend/node_modules /app/frontend/node_modules
COPY --from=builder-fe --chown=appuser:appgroup /app/frontend/package.json /app/frontend/package.json

# Copy start script & entrypoint
COPY docker-entrypoint.sh /usr/local/bin/docker-entrypoint.sh
RUN chmod +x /usr/local/bin/docker-entrypoint.sh

COPY start.sh /app/start.sh
RUN chmod +x /app/start.sh && chown appuser:appgroup /app/start.sh

USER appuser

EXPOSE 3000 8080

# Native Docker Healthcheck (memvalidasi Frontend + Reverse Proxy + Go Backend)
HEALTHCHECK --interval=25s --timeout=5s --start-period=60s --retries=3 \
    CMD wget -q -O - http://127.0.0.1:3000/api/health >/dev/null 2>&1 || exit 1

ENTRYPOINT ["docker-entrypoint.sh"]
CMD ["/app/start.sh"]
