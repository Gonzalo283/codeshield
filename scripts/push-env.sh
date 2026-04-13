#!/usr/bin/env bash
# Push env vars to Vercel (production + preview) idempotently.
#
# Usage:
#   1. Fill in your .env.local with all secrets
#   2. VERCEL_TOKEN=xxx bash scripts/push-env.sh
#
# Reads all SECRETS from .env.local — never hardcode them here.

set -u

if [[ -z "${VERCEL_TOKEN:-}" ]]; then
  echo "❌ VERCEL_TOKEN not set. Create at https://vercel.com/account/tokens"
  exit 1
fi

if [[ ! -f .env.local ]]; then
  echo "❌ .env.local not found — create it from .env.local.example"
  exit 1
fi

# Load .env.local into shell (strip quotes, skip comments)
set -a
while IFS='=' read -r key value; do
  [[ "$key" =~ ^[[:space:]]*# ]] && continue
  [[ -z "$key" ]] && continue
  value="${value%\"}"
  value="${value#\"}"
  declare "$key=$value"
done < .env.local
set +a

TOKEN_FLAG="--token $VERCEL_TOKEN"

push() {
  local name="$1"
  local value="$2"
  if [[ -z "$value" ]]; then
    echo "  ⊘ $name (empty, skipped)"
    return
  fi
  vercel env rm "$name" production --yes $TOKEN_FLAG >/dev/null 2>&1 || true
  vercel env rm "$name" preview --yes $TOKEN_FLAG >/dev/null 2>&1 || true
  printf '%s' "$value" | vercel env add "$name" production $TOKEN_FLAG >/dev/null 2>&1
  printf '%s' "$value" | vercel env add "$name" preview $TOKEN_FLAG >/dev/null 2>&1
  echo "  ✓ $name"
}

# ── Stripe ──
push STRIPE_SECRET_KEY "${STRIPE_SECRET_KEY:-}"
push STRIPE_PUBLISHABLE_KEY "${STRIPE_PUBLISHABLE_KEY:-}"
push STRIPE_TEAM_PRICE_ID "${STRIPE_TEAM_PRICE_ID:-}"
push STRIPE_BUSINESS_PRICE_ID "${STRIPE_BUSINESS_PRICE_ID:-}"
push STRIPE_WEBHOOK_SECRET "${STRIPE_WEBHOOK_SECRET:-}"

# ── Resend ──
push RESEND_API_KEY "${RESEND_API_KEY:-}"
push EMAIL_FROM "${EMAIL_FROM:-CodeShield <noreply@codeshield.sh>}"

# ── Other ──
push ADMIN_EMAILS "${ADMIN_EMAILS:-}"
push GITHUB_WEBHOOK_SECRET "${GITHUB_WEBHOOK_SECRET:-}"

# ── Production-only: NEXTAUTH_URL ──
vercel env rm NEXTAUTH_URL production --yes $TOKEN_FLAG >/dev/null 2>&1 || true
printf 'https://codeshield.sh' | vercel env add NEXTAUTH_URL production $TOKEN_FLAG >/dev/null 2>&1
echo "  ✓ NEXTAUTH_URL (production only)"

echo ""
echo "DONE. Run 'vercel env ls --token \$VERCEL_TOKEN' to verify."
