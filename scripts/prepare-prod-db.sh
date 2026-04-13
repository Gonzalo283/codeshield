#!/usr/bin/env bash
# Switch prisma schema from sqlite (dev) → postgresql (prod)
# and run migration. Idempotent.
#
# Usage:
#   DATABASE_URL="postgres://..." bash scripts/prepare-prod-db.sh

set -euo pipefail

if [[ -z "${DATABASE_URL:-}" ]]; then
  echo "❌ DATABASE_URL is not set. Export it first:"
  echo "   export DATABASE_URL='postgres://user:pass@host:5432/db'"
  exit 1
fi

SCHEMA="prisma/schema.prisma"

# Switch provider to postgresql (works whether currently sqlite or postgres)
sed -i.bak -E 's/provider = "sqlite"/provider = "postgresql"/' "$SCHEMA"

# Remove the old sqlite-specific init migration if present — we'll create a fresh one
if [[ -d prisma/migrations ]]; then
  echo "→ Removing old dev migrations (safe — they are sqlite-only)"
  rm -rf prisma/migrations
fi

echo "→ Creating fresh Postgres migration"
npx prisma migrate deploy || {
  # No migrations yet; create init
  echo "→ No existing migrations; running 'migrate dev' to bootstrap"
  npx prisma migrate dev --name init --skip-seed
}

echo "→ Generating Prisma client"
npx prisma generate

echo "✅ Postgres DB ready. Schema & migrations committed to repo."
echo ""
echo "⚠️  IMPORTANT: commit the schema change + new migrations:"
echo "   git add prisma/ && git commit -m 'chore: switch to postgres'"
