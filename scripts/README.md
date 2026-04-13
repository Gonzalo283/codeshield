# CodeShield Production Setup

Automated scripts to configure Stripe, Vercel, Postgres, and Resend for
CodeShield.sh. Three scripts, run in order.

---

## Prerequisites (5 minutes, one-time)

### 1. Install CLIs
```bash
# Vercel
npm install -g vercel

# Stripe (Windows, via winget)
winget install --id Stripe.StripeCLI --accept-package-agreements

# Stripe (macOS)
brew install stripe/stripe-cli/stripe

# jq (needed for parsing JSON output)
winget install jqlang.jq    # Windows
brew install jq              # macOS
```

### 2. Authenticate
Each of these opens a browser with a **single click-to-approve** flow — no
typing required.

```bash
stripe login    # approve in browser, returns to terminal
vercel login    # enter email, click magic link
```

### 3. Get your Resend API key
1. Sign up free at https://resend.com
2. Verify your email
3. Go to https://resend.com/api-keys → "Create API Key"
   - Name: codeshield-production
   - Permission: Sending access
   - Domain: All domains (for now)
4. Copy the key (starts with `re_`)

---

## Step 1 — Stripe products + webhook

```bash
bash scripts/setup-stripe.sh
```

Creates:
- Product "CodeShield Team" + recurring price €29/month
- Product "CodeShield Business" + recurring price €79/month
- Webhook endpoint pointing to `https://codeshield.sh/api/stripe/webhook`
  with the 6 events our code handles.

Outputs secrets to `.env.stripe.test` (or `.env.stripe.live` if you pass
`--live`). **Copy them into `.env.local`** alongside your `STRIPE_SECRET_KEY`
and `STRIPE_PUBLISHABLE_KEY` (which you copy manually from
https://dashboard.stripe.com/test/apikeys — one-time).

Then enable the **Billing Portal** manually once at
https://dashboard.stripe.com/test/settings/billing/portal
(activate "Cancel subscriptions", "Update payment method", add both
products to "Switch plans"). **This is the only manual Stripe step.**

---

## Step 2 — Vercel project + env vars

Export all your secrets first (paste them in terminal):

```bash
export NEXTAUTH_SECRET="$(openssl rand -base64 32)"   # or reuse existing
export GITHUB_CLIENT_ID="Ov23li..."
export GITHUB_CLIENT_SECRET="..."
export ANTHROPIC_API_KEY="sk-ant-..."
export STRIPE_SECRET_KEY="sk_test_..."
export STRIPE_PUBLISHABLE_KEY="pk_test_..."
export STRIPE_TEAM_PRICE_ID="price_..."       # from step 1
export STRIPE_BUSINESS_PRICE_ID="price_..."   # from step 1
export STRIPE_WEBHOOK_SECRET="whsec_..."       # from step 1
export RESEND_API_KEY="re_..."
export ADMIN_EMAILS="you@example.com"
```

Then:

```bash
bash scripts/setup-vercel.sh
```

This:
- Links the repo to a Vercel project (creates if needed)
- Sets ALL env vars above across production/preview/development

---

## Step 3 — Provision Postgres

Vercel Postgres UI-only (takes 30 seconds):

1. https://vercel.com/dashboard → tab **Storage** → "Create Database"
2. Pick **Neon Postgres** (or Prisma Postgres) → Hobby tier → Frankfurt (or closest)
3. "Connect project" → select codeshield
4. Vercel auto-injects `DATABASE_URL` in all envs ✅

Then swap Prisma provider to Postgres and migrate:

```bash
# Pull the injected DATABASE_URL into a local file
vercel env pull .env.production

# Run migrations against prod DB
export DATABASE_URL="$(grep ^DATABASE_URL= .env.production | cut -d= -f2- | tr -d '\"')"
bash scripts/prepare-prod-db.sh

# Commit the schema change + new migrations
git add prisma/
git commit -m "chore: switch to postgres"
git push
```

Vercel will auto-deploy on push.

---

## Step 4 — Domain + DNS

Only manual step — you need access to your domain registrar:

1. Vercel dashboard → codeshield project → **Settings → Domains**
2. Add `codeshield.sh` → Vercel shows the DNS records to add
3. Also add `www.codeshield.sh` as redirect
4. Go to your registrar (Namecheap/Cloudflare/etc.) and paste the records
5. Wait 2-15 minutes for propagation

---

## Step 5 — Resend domain verification (for emails from your domain)

```bash
# With RESEND_API_KEY already exported:
curl -X POST https://api.resend.com/domains \
  -H "Authorization: Bearer $RESEND_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"name": "codeshield.sh", "region": "eu-west-1"}'
```

This returns 3 DNS records (SPF, DKIM, DMARC) that you must add to your
domain DNS — same registrar as step 4. Then:

```bash
# List your domains to find the ID
curl https://api.resend.com/domains \
  -H "Authorization: Bearer $RESEND_API_KEY" | jq

# Trigger verification
curl -X POST https://api.resend.com/domains/{domain-id}/verify \
  -H "Authorization: Bearer $RESEND_API_KEY"
```

Verification typically completes in 5-15 minutes after DNS is live.

---

## Step 6 — Stripe production (when ready to charge real money)

Repeat Step 1 with `--live`:

```bash
bash scripts/setup-stripe.sh --live
```

This creates LIVE products/prices/webhook. Update the 3 env vars in Vercel
(`STRIPE_TEAM_PRICE_ID`, `STRIPE_BUSINESS_PRICE_ID`, `STRIPE_WEBHOOK_SECRET`)
plus swap `STRIPE_SECRET_KEY` and `STRIPE_PUBLISHABLE_KEY` to their `sk_live_`/`pk_live_` values.

---

## Troubleshooting

**`jq: command not found`** — install with winget/brew (see prerequisites).

**`stripe: missing API key`** — run `stripe login` first.

**`vercel: Project not found`** — run `vercel link` manually to pick a project.

**Prisma migration fails: "relation already exists"** — the dev SQLite
migrations are not compatible with Postgres. The `prepare-prod-db.sh`
script already deletes them; if you bypassed it, run:
```bash
rm -rf prisma/migrations
npx prisma migrate dev --name init
```
