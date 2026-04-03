"use client";

import { useSession, signIn } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import { useState, Suspense } from "react";
import Providers from "../providers";

const plans = [
  {
    id: "free",
    name: "Free",
    price: "$0",
    period: "",
    description: "Secure your personal projects at no cost",
    features: [
      "5 repositories",
      "10 scans per month",
      "AI code vulnerability scanning",
      "OWASP Top 10 detection",
      "Secrets detection",
      "PQC crypto discovery",
      "Community support",
    ],
    cta: "Get Started Free",
    highlighted: false,
    enterprise: false,
  },
  {
    id: "team",
    name: "Team",
    price: "$29",
    period: "/dev/month",
    description: "For teams shipping AI-generated code daily",
    features: [
      "Unlimited repos & scans",
      "AI auto-fix with Claude",
      "Full PQC migration assistant",
      "Cryptographic Bill of Materials (CBOM)",
      "CI/CD integration (GitHub Actions)",
      "Priority support",
    ],
    cta: "Start Free Trial",
    highlighted: true,
    enterprise: false,
  },
  {
    id: "business",
    name: "Business",
    price: "$79",
    period: "/dev/month",
    description: "For organizations that need compliance and control",
    features: [
      "Everything in Team",
      "SSO / SAML",
      "Compliance reports (SOC 2, ISO 27001, PCI DSS 4.0)",
      "NIST PQC migration timeline & tracking",
      "Custom scanning rules & policies",
      "SBOM generation",
      "Dedicated support & SLA",
    ],
    cta: "Start Free Trial",
    highlighted: false,
    enterprise: false,
  },
  {
    id: "enterprise",
    name: "Enterprise",
    price: "Custom",
    period: "",
    description: "Tailored security for large-scale deployments",
    features: [
      "Everything in Business",
      "Self-hosted / on-prem deployment",
      "Unlimited developers",
      "Custom integrations",
      "Dedicated security engineer",
      "PQC migration consulting",
      "99.9% SLA",
    ],
    cta: "Contact Sales",
    highlighted: false,
    enterprise: true,
  },
];

const faqs = [
  {
    question: "What counts as an active committer?",
    answer:
      "An active committer is anyone who has pushed at least one commit to a monitored repository in the current billing cycle. Bots, service accounts, and inactive developers are not counted.",
  },
  {
    question: "What is Post-Quantum Cryptography (PQC) and why does it matter?",
    answer:
      "PQC refers to cryptographic algorithms designed to resist attacks from quantum computers. NIST finalized its first PQC standards in 2024 and organizations are expected to begin migrating by 2025-2030. CodeShield identifies vulnerable cryptographic implementations in your codebase and guides migration to quantum-safe alternatives.",
  },
  {
    question: "Can I switch plans or cancel at any time?",
    answer:
      "Yes. You can upgrade, downgrade, or cancel your plan at any time from your dashboard. Downgrades take effect at the end of your current billing period. If you cancel during a trial, you will not be charged.",
  },
  {
    question: "How does the 14-day free trial work?",
    answer:
      "When you sign up for Team or Business, you get full access to all features for 14 days with no charge. You can add a payment method at any time during the trial. If you do not add one by the end of the trial, your account reverts to the Free plan.",
  },
  {
    question: "Do you support on-premise or air-gapped deployments?",
    answer:
      "Yes. Our Enterprise plan includes self-hosted and on-premise deployment options, including fully air-gapped environments. Contact our sales team at enterprise@codeshield.ai for details.",
  },
];

function CheckIcon() {
  return (
    <svg
      className="w-4 h-4 text-green mt-0.5 shrink-0"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <polyline points="20 6 9 17 4 12" />
    </svg>
  );
}

function FAQSection() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  return (
    <div className="max-w-3xl mx-auto mt-24">
      <h2 className="text-3xl font-bold text-text-primary text-center mb-12">
        Frequently Asked Questions
      </h2>
      <div className="space-y-3">
        {faqs.map((faq, index) => (
          <div
            key={index}
            className="bg-bg-card border border-border rounded-xl overflow-hidden"
          >
            <button
              onClick={() =>
                setOpenIndex(openIndex === index ? null : index)
              }
              className="w-full px-6 py-5 flex items-center justify-between text-left"
            >
              <span className="text-sm font-semibold text-text-primary pr-4">
                {faq.question}
              </span>
              <svg
                className={`w-5 h-5 text-text-dim shrink-0 transition-transform duration-200 ${
                  openIndex === index ? "rotate-180" : ""
                }`}
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <polyline points="6 9 12 15 18 9" />
              </svg>
            </button>
            {openIndex === index && (
              <div className="px-6 pb-5">
                <p className="text-sm text-text-secondary leading-relaxed">
                  {faq.answer}
                </p>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

function PricingContent() {
  const { data: session } = useSession();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [loadingPlan, setLoadingPlan] = useState<string | null>(null);
  const cancelled = searchParams.get("checkout") === "cancelled";

  const handleSelectPlan = async (planId: string) => {
    if (planId === "enterprise") {
      window.location.href = "mailto:enterprise@codeshield.ai";
      return;
    }

    if (!session) {
      signIn("github");
      return;
    }

    if (planId === "free") {
      router.push("/dashboard");
      return;
    }

    setLoadingPlan(planId);
    try {
      const res = await fetch("/api/stripe/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ planId }),
      });
      const data = await res.json();
      if (data.url) {
        window.location.href = data.url;
      } else {
        alert(data.error || "Failed to create checkout session");
      }
    } catch {
      alert("Something went wrong. Please try again.");
    } finally {
      setLoadingPlan(null);
    }
  };

  return (
    <div className="min-h-screen bg-bg-primary">
      {/* Nav */}
      <nav className="border-b border-border bg-bg-card/80 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-8 py-4 flex items-center justify-between">
          <a href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-green/20 flex items-center justify-center border border-green/30">
              <svg
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="#00ff88"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
              </svg>
            </div>
            <span className="font-bold text-lg tracking-tight text-text-primary">
              CodeShield<span className="text-green">.ai</span>
            </span>
          </a>
          {session ? (
            <a
              href="/dashboard"
              className="text-sm text-text-secondary hover:text-text-primary transition-colors"
            >
              Dashboard
            </a>
          ) : (
            <button
              onClick={() => signIn("github")}
              className="text-sm text-text-secondary hover:text-text-primary transition-colors"
            >
              Sign In
            </button>
          )}
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 sm:px-8 py-12 sm:py-16">
        {cancelled && (
          <div className="mb-8 p-4 bg-orange/10 border border-orange/30 rounded-xl text-center text-sm text-orange">
            Checkout was cancelled. No worries — pick a plan when you&apos;re
            ready.
          </div>
        )}

        <div className="text-center mb-12 sm:mb-16">
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-text-primary mb-4">
            Security pricing that scales with you
          </h1>
          <p className="text-base sm:text-lg text-text-secondary max-w-2xl mx-auto">
            From solo developers to enterprise teams. Protect your AI-generated
            code, detect secrets, and prepare for the post-quantum era.
          </p>
        </div>

        {/* Pricing grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
          {plans.map((plan) => (
            <div
              key={plan.id}
              className={`relative bg-bg-card border rounded-2xl p-6 sm:p-8 flex flex-col ${
                plan.highlighted
                  ? "border-green/50 glow-green"
                  : plan.enterprise
                  ? "border-border-light bg-gradient-to-b from-bg-card to-bg-primary"
                  : "border-border"
              }`}
            >
              {/* Most Popular badge */}
              {plan.highlighted && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-4 py-1 bg-green text-bg-primary text-xs font-bold rounded-full uppercase tracking-wider whitespace-nowrap">
                  Most Popular
                </div>
              )}

              {/* Enterprise indicator */}
              {plan.enterprise && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-4 py-1 bg-bg-primary border border-border-light text-text-secondary text-xs font-bold rounded-full uppercase tracking-wider whitespace-nowrap">
                  White Glove
                </div>
              )}

              <div className="mb-6">
                <h3 className="text-lg font-semibold text-text-primary mb-1">
                  {plan.name}
                </h3>
                <p className="text-sm text-text-secondary">{plan.description}</p>
              </div>

              <div className="mb-6">
                <span className="text-4xl font-bold text-text-primary">
                  {plan.price}
                </span>
                {plan.period && (
                  <span className="text-text-dim">{plan.period}</span>
                )}
              </div>

              <ul className="space-y-3 mb-8 flex-1">
                {plan.features.map((feature) => (
                  <li key={feature} className="flex items-start gap-2 text-sm">
                    <CheckIcon />
                    <span className="text-text-secondary">{feature}</span>
                  </li>
                ))}
              </ul>

              {plan.enterprise ? (
                <a
                  href="mailto:enterprise@codeshield.ai"
                  className="w-full py-3 rounded-xl text-sm font-semibold transition-all bg-bg-primary border border-border-light text-text-primary hover:border-green/50 hover:text-green text-center block"
                >
                  {plan.cta}
                </a>
              ) : (
                <button
                  onClick={() => handleSelectPlan(plan.id)}
                  disabled={loadingPlan === plan.id}
                  className={`w-full py-3 rounded-xl text-sm font-semibold transition-all disabled:opacity-50 ${
                    plan.highlighted
                      ? "bg-green text-bg-primary hover:bg-green-dim glow-green"
                      : "bg-bg-primary border border-border text-text-primary hover:border-border-light"
                  }`}
                >
                  {loadingPlan === plan.id ? (
                    <span className="flex items-center justify-center gap-2">
                      <span className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                      Processing...
                    </span>
                  ) : (
                    plan.cta
                  )}
                </button>
              )}
            </div>
          ))}
        </div>

        <p className="text-center text-text-dim text-sm mt-12">
          All paid plans include a 14-day free trial. Only active committers are
          billed.
        </p>

        {/* FAQ Section */}
        <FAQSection />
      </div>
    </div>
  );
}

export default function PricingPage() {
  return (
    <Providers>
      <Suspense>
        <PricingContent />
      </Suspense>
    </Providers>
  );
}
