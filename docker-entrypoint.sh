#!/bin/sh
set -e

API_DOMAIN="${INFISICAL_API_URL:-$INFISICAL_HOST_URL}"
ENV_TARGET="$INFISICAL_ENV"
PROJECT_ID="$INFISICAL_PROJECT_ID"
CLIENT_ID="${INFISICAL_CLIENT_ID:-$INFISICAL_UNIVERSAL_AUTH_CLIENT_ID}"
CLIENT_SECRET="${INFISICAL_CLIENT_SECRET:-$INFISICAL_UNIVERSAL_AUTH_CLIENT_SECRET}"
SECRET_PATH="$INFISICAL_SECRET_PATH"

# Pastikan API_DOMAIN berakhiran /api untuk Infisical CLI jika ditentukan
if [ -n "$API_DOMAIN" ]; then
    case "$API_DOMAIN" in
        */api) ;;
        *) API_DOMAIN="${API_DOMAIN%/}/api" ;;
    esac
fi

TOKEN="$INFISICAL_TOKEN"

# Login mesin headless menggunakan Universal Auth untuk mendapatkan Identity Access Token
if [ -z "$TOKEN" ] && [ -n "$CLIENT_ID" ] && [ -n "$CLIENT_SECRET" ]; then
    echo "[ENTRYPOINT] Melakukan autentikasi mesin ke Infisical via Universal Auth..."
    AUTH_DOMAIN_ARG=""
    if [ -n "$API_DOMAIN" ]; then
        AUTH_DOMAIN_ARG="--domain=$API_DOMAIN"
    fi
    TOKEN=$(infisical login --method=universal-auth --client-id="$CLIENT_ID" --client-secret="$CLIENT_SECRET" $AUTH_DOMAIN_ARG --plain --silent 2>/dev/null || true)
fi

if [ -n "$TOKEN" ]; then
    echo "[ENTRYPOINT] Kredensial Infisical terdeteksi. Menginjeksi secrets dari Infisical Cloud..."
    CLI_ARGS=""
    if [ -n "$API_DOMAIN" ]; then
        CLI_ARGS="$CLI_ARGS --domain=$API_DOMAIN"
    fi
    if [ -n "$ENV_TARGET" ]; then
        CLI_ARGS="$CLI_ARGS --env=$ENV_TARGET"
    fi
    if [ -n "$PROJECT_ID" ]; then
        CLI_ARGS="$CLI_ARGS --projectId=$PROJECT_ID"
    fi
    if [ -n "$SECRET_PATH" ]; then
        CLI_ARGS="$CLI_ARGS --path=$SECRET_PATH"
    fi

    exec infisical run --token="$TOKEN" $CLI_ARGS --silent -- "$@"
else
    echo "[ENTRYPOINT] Menjalankan aplikasi tanpa injeksi Infisical CLI..."
    exec "$@"
fi
