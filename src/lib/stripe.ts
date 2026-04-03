import Stripe from "stripe";

let _stripe: Stripe | null = null;

export function getStripe(): Stripe {
  if (!_stripe) {
    if (!process.env.STRIPE_SECRET_KEY) {
      throw new Error("STRIPE_SECRET_KEY is not set");
    }
    _stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
      apiVersion: "2026-03-25.dahlia",
      typescript: true,
    });
  }
  return _stripe;
}

export const PLANS = {
  free: {
    name: "Free",
    price: 0,
    scansPerMonth: 10,
    repos: 5,
    features: [
      "5 repositories",
      "10 scans per month",
      "AI code vulnerability scanning",
      "OWASP Top 10 detection",
      "Secrets detection",
      "PQC crypto discovery",
      "Community support",
    ],
  },
  team: {
    name: "Team",
    price: 29,
    priceId: process.env.STRIPE_TEAM_PRICE_ID || "",
    scansPerMonth: -1,
    repos: -1,
    features: [
      "Unlimited repos & scans",
      "AI auto-fix with Claude",
      "Full PQC migration assistant",
      "Cryptographic Bill of Materials (CBOM)",
      "CI/CD integration (GitHub Actions)",
      "Priority support",
    ],
  },
  business: {
    name: "Business",
    price: 79,
    priceId: process.env.STRIPE_BUSINESS_PRICE_ID || "",
    scansPerMonth: -1,
    repos: -1,
    features: [
      "Everything in Team",
      "SSO / SAML",
      "Compliance reports (SOC 2, ISO 27001, PCI DSS 4.0)",
      "NIST PQC migration timeline & tracking",
      "Custom scanning rules & policies",
      "SBOM generation",
      "Dedicated support & SLA",
    ],
  },
  enterprise: {
    name: "Enterprise",
    price: -1, // custom
    priceId: "",
    scansPerMonth: -1,
    repos: -1,
    features: [
      "Everything in Business",
      "Self-hosted / on-prem deployment",
      "Unlimited developers",
      "Custom integrations",
      "Dedicated security engineer",
      "PQC migration consulting",
      "99.9% SLA",
    ],
  },
} as const;

export type PlanId = keyof typeof PLANS;
