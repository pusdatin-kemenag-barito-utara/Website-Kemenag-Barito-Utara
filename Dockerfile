# ================================================================
# KEMENAG BARITO UTARA — ALL-IN-ONE PRODUCTION DOCKERFILE
# ================================================================

# --- Stage 1: Build Go Fiber Backend ---
FROM golang:1.24-alpine AS builder-be
WORKDIR /app
RUN apk add --no-cache git ca-certificates tzdata
COPY backend/go.mod backend/go.sum ./
RUN go mod download
COPY backend/ ./
RUN CGO_ENABLED=0 GOOS=linux GOARCH=amd64 go build -ldflags="-s -w" -o /app/server ./cmd/server

# --- Stage 2: Build Astro Frontend ---
FROM node:22-alpine AS builder-fe
WORKDIR /app
RUN apk add --no-cache libc6-compat
COPY package.json package-lock.json ./
COPY frontend/package.json ./frontend/
RUN npm install --prefix frontend
COPY frontend/ ./frontend/

ARG NEXT_PUBLIC_SITE_URL
ARG NEXT_PUBLIC_SUPABASE_URL
ARG NEXT_PUBLIC_SUPABASE_ANON_KEY
ARG NEXT_PUBLIC_GA_ID
ARG NEXT_PUBLIC_GTM_ID
ARG NEXT_PUBLIC_ONESIGNAL_APP_ID

ENV NEXT_PUBLIC_SITE_URL=${NEXT_PUBLIC_SITE_URL}
ENV NEXT_PUBLIC_SUPABASE_URL=${NEXT_PUBLIC_SUPABASE_URL}
ENV NEXT_PUBLIC_SUPABASE_ANON_KEY=${NEXT_PUBLIC_SUPABASE_ANON_KEY}
ENV NEXT_PUBLIC_GA_ID=${NEXT_PUBLIC_GA_ID}
ENV NEXT_PUBLIC_GTM_ID=${NEXT_PUBLIC_GTM_ID}
ENV NEXT_PUBLIC_ONESIGNAL_APP_ID=${NEXT_PUBLIC_ONESIGNAL_APP_ID}

RUN npm --prefix frontend run build

# --- Stage 3: Production Unified Runner ---
FROM node:22-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV HOST=0.0.0.0
ENV PORT=3000
ENV BACKEND_PORT=8080
ENV TZ=Asia/Jakarta

RUN apk add --no-cache ca-certificates tzdata bash curl wget

# Create non-root user
RUN addgroup --system --gid 1001 appgroup && \
    adduser --system --uid 1001 appuser -G appgroup

# Copy Go backend binary
COPY --from=builder-be /app/server /app/backend/server

# Copy Astro frontend build
COPY --from=builder-fe --chown=appuser:appgroup /app/frontend/dist /app/frontend/dist
COPY --from=builder-fe --chown=appuser:appgroup /app/frontend/node_modules /app/frontend/node_modules
COPY --from=builder-fe --chown=appuser:appgroup /app/frontend/package.json /app/frontend/package.json

# Copy start script
RUN echo '#!/bin/sh' > /app/start.sh && \
    echo 'PORT=8080 /app/backend/server &' >> /app/start.sh && \
    echo 'cd /app/frontend && PORT=3000 HOST=0.0.0.0 exec node ./dist/server/entry.mjs' >> /app/start.sh && \
    chmod +x /app/start.sh

USER appuser

EXPOSE 3000 8080

CMD ["/app/start.sh"]
