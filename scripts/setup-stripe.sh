#!/usr/bin/env bash
# Automated Stripe setup for CodeShield.sh
# Creates products, prices, webhook endpoint, and prints the env vars to copy.
#
# Prereqs:
#   1. Install Stripe CLI: https://stripe.com/docs/stripe-cli
#   2. Login: stripe login
#
# Usage:
#   bash scripts/setup-stripe.sh
#   bash scripts/setup-stripe.sh --live   # for production (default is test mode)

set -euo pipefail

STRIPE_BIN="${STRIPE_BIN:-stripe}"
MODE_FLAG="--api-key=$(${STRIPE_BIN} config --list | grep -E '^test_mode_api_key' | head -1 | awk '{print $3}' | tr -d "'\"")"

LIVE=0
if [[ "${1:-}" == "--live" ]]; then
  LIVE=1
  MODE_FLAG="--live"
  echo "⚠️  LIVE MODE — you will charge real money."
  read -p "Type 'yes' to continue: " confirm
  [[ "$confirm" == "yes" ]] || exit 1
fi

WEBHOOK_URL="${WEBHOOK_URL:-https://codeshield.sh/api/stripe/webhook}"

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "  CodeShield Stripe setup — $( [[ $LIVE == 1 ]] && echo 'LIVE' || echo 'TEST' ) mode"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# ── Team product ──
echo "→ Creating product: CodeShield Team"
TEAM_PRODUCT=$(${STRIPE_BIN} products create \
  --name="CodeShield Team" \
  --description="Unlimited scans, AI auto-fix with Claude, CBOM, GitHub Actions CI/CD, priority support" \
  --metadata[planId]=team \
  -o json | jq -r '.id')

TEAM_PRICE=$(${STRIPE_BIN} prices create \
  --product="$TEAM_PRODUCT" \
  --unit-amount=2900 \
  --currency=eur \
  --recurring[interval]=month \
  --tax-behavior=exclusive \
  --metadata[planId]=team \
  --nickname="Team monthly" \
  -o json | jq -r '.id')

echo "  ✓ Product: $TEAM_PRODUCT"
echo "  ✓ Price:   $TEAM_PRICE (€29/month)"
echo ""

# ── Business product ──
echo "→ Creating product: CodeShield Business"
BUSINESS_PRODUCT=$(${STRIPE_BIN} products create \
  --name="CodeShield Business" \
  --description="Everything in Team plus SSO/SAML, SOC 2 & ISO 27001 compliance reports, PCI DSS 4.0, NIST PQC migration tracking, SBOM, custom rules, dedicated support & SLA" \
  --metadata[planId]=business \
  -o json | jq -r '.id')

BUSINESS_PRICE=$(${STRIPE_BIN} prices create \
  --product="$BUSINESS_PRODUCT" \
  --unit-amount=7900 \
  --currency=eur \
  --recurring[interval]=month \
  --tax-behavior=exclusive \
  --metadata[planId]=business \
  --nickname="Business monthly" \
  -o json | jq -r '.id')

echo "  ✓ Product: $BUSINESS_PRODUCT"
echo "  ✓ Price:   $BUSINESS_PRICE (€79/month)"
echo ""

# ── Webhook endpoint ──
echo "→ Creating webhook endpoint: $WEBHOOK_URL"
WEBHOOK_JSON=$(${STRIPE_BIN} webhook_endpoints create \
  --url="$WEBHOOK_URL" \
  --description="CodeShield production webhook" \
  --enabled-events="checkout.session.completed" \
  --enabled-events="customer.subscription.created" \
  --enabled-events="customer.subscription.updated" \
  --enabled-events="customer.subscription.deleted" \
  --enabled-events="invoice.payment_succeeded" \
  --enabled-events="invoice.payment_failed" \
  -o json)

WEBHOOK_ID=$(echo "$WEBHOOK_JSON" | jq -r '.id')
WEBHOOK_SECRET=$(echo "$WEBHOOK_JSON" | jq -r '.secret')
echo "  ✓ Webhook: $WEBHOOK_ID"
echo ""

# ── Output ──
ENV_FILE=".env.stripe.$( [[ $LIVE == 1 ]] && echo 'live' || echo 'test' )"
cat > "$ENV_FILE" <<EOF
# Stripe env vars — $( [[ $LIVE == 1 ]] && echo 'LIVE' || echo 'TEST' ) mode
# Generated on $(date +%Y-%m-%dT%H:%M:%S)
STRIPE_TEAM_PRICE_ID=$TEAM_PRICE
STRIPE_BUSINESS_PRICE_ID=$BUSINESS_PRICE
STRIPE_WEBHOOK_SECRET=$WEBHOOK_SECRET
EOF

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "  DONE — Secrets written to $ENV_FILE"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
cat "$ENV_FILE"
echo ""
echo "Next steps:"
echo "  1. Copy these values into .env.local (alongside STRIPE_SECRET_KEY)"
echo "  2. Also add them to Vercel: vercel env add STRIPE_TEAM_PRICE_ID"
echo "  3. Configure the billing portal at:"
echo "     https://dashboard.stripe.com$( [[ $LIVE == 1 ]] && echo '' || echo '/test' )/settings/billing/portal"
