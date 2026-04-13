#!/usr/bin/env bash
# Automated Vercel setup for CodeShield.sh
# Links project, sets env vars, provisions Postgres.
#
# Prereqs:
#   1. npm install -g vercel
#   2. vercel login
#   3. Export the secrets you want to set:
#        export NEXTAUTH_SECRET="..."
#        export GITHUB_CLIENT_ID="..."
#        export GITHUB_CLIENT_SECRET="..."
#        export ANTHROPIC_API_KEY="..."
#        export STRIPE_SECRET_KEY="..."
#        export STRIPE_PUBLISHABLE_KEY="..."
#        export STRIPE_TEAM_PRICE_ID="..."
#        export STRIPE_BUSINESS_PRICE_ID="..."
#        export STRIPE_WEBHOOK_SECRET="..."
#        export RESEND_API_KEY="..."       # optional
#        export ADMIN_EMAILS="..."         # optional
#
# Usage:
#   bash scripts/setup-vercel.sh

set -euo pipefail

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "  CodeShield Vercel setup"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# ── Link project ──
if [[ ! -f .vercel/project.json ]]; then
  echo "→ Linking Vercel project (choose existing or create new)"
  vercel link --yes || vercel link
else
  echo "✓ Project already linked"
fi
echo ""

# ── Helper: set an env var in all environments ──
set_env() {
  local name="$1"
  local value="$2"
  local envs="${3:-production preview development}"

  if [[ -z "$value" ]]; then
    echo "  ⊘ $name — skipped (empty)"
    return
  fi

  # Remove existing (ignore error if not present)
  for env in $envs; do
    printf '%s' "$value" | vercel env rm "$name" "$env" --yes 2>/dev/null || true
    printf '%s' "$value" | vercel env add "$name" "$env" 2>&1 | grep -v "already exists" || true
  done
  echo "  ✓ $name set"
}

echo "→ Setting environment variables"

# NEXTAUTH_URL differs per environment
if [[ -n "${NEXTAUTH_URL_PROD:-https://codeshield.sh}" ]]; then
  printf '%s' "${NEXTAUTH_URL_PROD:-https://codeshield.sh}" | vercel env add NEXTAUTH_URL production --force 2>/dev/null || \
    printf '%s' "${NEXTAUTH_URL_PROD:-https://codeshield.sh}" | vercel env add NEXTAUTH_URL production
fi

# Common secrets (production + preview + development)
set_env NEXTAUTH_SECRET "${NEXTAUTH_SECRET:-}"
set_env GITHUB_CLIENT_ID "${GITHUB_CLIENT_ID:-}"
set_env GITHUB_CLIENT_SECRET "${GITHUB_CLIENT_SECRET:-}"
set_env ANTHROPIC_API_KEY "${ANTHROPIC_API_KEY:-}"
set_env STRIPE_SECRET_KEY "${STRIPE_SECRET_KEY:-}"
set_env STRIPE_PUBLISHABLE_KEY "${STRIPE_PUBLISHABLE_KEY:-}"
set_env STRIPE_TEAM_PRICE_ID "${STRIPE_TEAM_PRICE_ID:-}"
set_env STRIPE_BUSINESS_PRICE_ID "${STRIPE_BUSINESS_PRICE_ID:-}"
set_env STRIPE_WEBHOOK_SECRET "${STRIPE_WEBHOOK_SECRET:-}"
set_env RESEND_API_KEY "${RESEND_API_KEY:-}"
set_env EMAIL_FROM "${EMAIL_FROM:-CodeShield <noreply@codeshield.sh>}"
set_env ADMIN_EMAILS "${ADMIN_EMAILS:-}"

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "  ENV VARS SET — now provision Postgres"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "Option A (UI): https://vercel.com/dashboard → Storage → Create Database"
echo "               → Neon Postgres → Hobby tier → Connect to project"
echo ""
echo "Option B (CLI, Neon Vercel integration):"
echo "   vercel integration add neon"
echo ""
echo "After the DB is provisioned, Vercel auto-injects DATABASE_URL."
echo "Then run:"
echo "   vercel env pull .env.production"
echo "   DATABASE_URL=\$(grep DATABASE_URL .env.production | cut -d= -f2-) \\"
echo "     bash scripts/prepare-prod-db.sh"
echo "   vercel --prod"
