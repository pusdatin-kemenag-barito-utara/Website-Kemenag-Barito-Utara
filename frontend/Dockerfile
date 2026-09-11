# ================================================================
# KEMENAG BARITO UTARA — FRONTEND (ASTRO 7 + REACT 19) DOCKERFILE
# ================================================================

# --- Stage 1: Build Frontend ---
FROM node:22-alpine AS builder

WORKDIR /app

# Enable build tools if needed
RUN apk add --no-cache libc6-compat

# Copy package configurations
COPY package.json package-lock.json ./
COPY frontend/package.json ./frontend/

# Install dependencies (root & workspace)
RUN npm install --prefix frontend

# Copy frontend source code and root context
COPY frontend/ ./frontend/

# Build Astro standalone bundle
RUN npm --prefix frontend run build

# --- Stage 2: Production Runner ---
FROM node:22-alpine AS runner

WORKDIR /app

ENV NODE_ENV=production
ENV HOST=0.0.0.0
ENV PORT=3000
ENV TZ=Asia/Jakarta

RUN apk add --no-cache ca-certificates tzdata curl wget

# Create non-root user
RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 astro

# Copy production build outputs
COPY --from=builder --chown=astro:nodejs /app/frontend/dist ./dist
COPY --from=builder --chown=astro:nodejs /app/frontend/node_modules ./node_modules
COPY --from=builder --chown=astro:nodejs /app/frontend/package.json ./package.json

USER astro

EXPOSE 3000

HEALTHCHECK --interval=25s --timeout=5s --start-period=30s --retries=3 \
    CMD wget -q -O - http://127.0.0.1:3000/ || exit 1

CMD ["node", "./dist/server/entry.mjs"]
