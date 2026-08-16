# ================================================================
# KEMENAG BARITO UTARA — BACKEND (GO FIBER) DOCKERFILE
# ================================================================

# --- Stage 1: Build binary ---
FROM golang:1.24-alpine AS builder

WORKDIR /app

# Install build dependencies
RUN apk add --no-cache git ca-certificates tzdata

# Cache go modules
COPY backend/go.mod backend/go.sum ./
RUN go mod download

# Copy source code
COPY backend/ ./

# Build optimized static binary
RUN CGO_ENABLED=0 GOOS=linux GOARCH=amd64 go build \
    -ldflags="-s -w" \
    -o /app/server ./cmd/server

# --- Stage 2: Minimal runtime image ---
FROM alpine:3.21 AS runner

WORKDIR /app

# Install ca-certificates & timezone
RUN apk add --no-cache ca-certificates tzdata
ENV TZ=Asia/Jakarta

# Create non-root user
RUN addgroup -S appgroup && adduser -S appuser -G appgroup

# Copy compiled binary from builder
COPY --from=builder /app/server /app/server

USER appuser

EXPOSE 8080
ENV PORT=8080

CMD ["/app/server"]
