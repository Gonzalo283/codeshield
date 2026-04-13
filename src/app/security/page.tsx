import type { Metadata } from "next";
import { Nav } from "@/components/nav";
import { Footer } from "@/components/footer";

export const metadata: Metadata = {
  title: "Security",
  description:
    "How CodeShield protects your data: encryption, authentication, vendors, and responsible-disclosure.",
  alternates: { canonical: "/security" },
};

export default function SecurityPage() {
  return (
    <div className="min-h-screen flex flex-col bg-bg-primary">
      <Nav />
      <main className="flex-1">
        <article className="max-w-3xl mx-auto px-6 md:px-8 py-16 md:py-24">
          <header className="mb-10">
            <h1 className="text-4xl md:text-5xl font-bold text-text-primary mb-3">
              Security at CodeShield
            </h1>
            <p className="text-text-secondary text-lg">
              Your code is sensitive. Here&rsquo;s how we protect it.
            </p>
          </header>

          <div className="space-y-10 text-text-secondary leading-relaxed">
            <section>
              <h2 className="text-text-primary text-xl font-semibold mb-3">Data in transit</h2>
              <ul className="list-disc pl-6 space-y-1">
                <li>TLS 1.2+ enforced everywhere. HSTS preloaded.</li>
                <li>Strict CSP, X-Frame-Options DENY, nosniff, no referrer leaks.</li>
                <li>All API endpoints require HTTPS.</li>
              </ul>
            </section>

            <section>
              <h2 className="text-text-primary text-xl font-semibold mb-3">Data at rest</h2>
              <ul className="list-disc pl-6 space-y-1">
                <li>Database encrypted at rest (managed Postgres on Vercel / AWS).</li>
                <li>API keys stored as SHA-256 hashes — never in plaintext.</li>
                <li>Secrets (OAuth tokens, webhook keys) stored encrypted.</li>
                <li>No card data ever touches our servers (Stripe-tokenized).</li>
              </ul>
            </section>

            <section>
              <h2 className="text-text-primary text-xl font-semibold mb-3">
                Authentication &amp; access control
              </h2>
              <ul className="list-disc pl-6 space-y-1">
                <li>GitHub OAuth (SSO). SAML/SSO for Business plans.</li>
                <li>JWT sessions, HttpOnly &amp; SameSite=Lax cookies.</li>
                <li>Rate limiting per IP and per API key.</li>
                <li>HMAC-SHA256 signature verification for GitHub &amp; Stripe webhooks.</li>
              </ul>
            </section>

            <section>
              <h2 className="text-text-primary text-xl font-semibold mb-3">
                How we handle your code
              </h2>
              <ul className="list-disc pl-6 space-y-1">
                <li>Code is processed to produce scan results, then discarded from working memory.</li>
                <li>We store findings (line numbers, severity) — not your full source.</li>
                <li>AI auto-fix sends only the affected snippet to Anthropic, on explicit user request.</li>
                <li>
                  We never use your code to train public AI models.
                </li>
              </ul>
            </section>

            <section>
              <h2 className="text-text-primary text-xl font-semibold mb-3">Infrastructure</h2>
              <ul className="list-disc pl-6 space-y-1">
                <li>Hosted on Vercel (SOC 2 Type II, ISO 27001).</li>
                <li>Database: managed Postgres with automated daily backups, 30-day retention.</li>
                <li>Dependencies scanned daily by Dependabot + CodeShield itself.</li>
                <li>Quarterly internal security reviews.</li>
              </ul>
            </section>

            <section>
              <h2 className="text-text-primary text-xl font-semibold mb-3">Responsible disclosure</h2>
              <p className="mb-3">
                Found a vulnerability? Please report it to{" "}
                <a href="mailto:security@codeshield.sh" className="text-green hover:underline">
                  security@codeshield.sh
                </a>
                . We&rsquo;ll confirm receipt within 24 hours and keep you
                updated as we investigate.
              </p>
              <p>
                We commit not to pursue legal action against good-faith
                researchers who respect user privacy, data integrity, and
                service availability.
              </p>
            </section>

            <section>
              <h2 className="text-text-primary text-xl font-semibold mb-3">Compliance</h2>
              <ul className="list-disc pl-6 space-y-1">
                <li>GDPR-aligned — Data Processing Addendum available on request.</li>
                <li>SOC 2 Type II — in progress (target Q4 2026).</li>
                <li>EU data residency option — available for Business plans.</li>
              </ul>
            </section>
          </div>
        </article>
      </main>
      <Footer />
    </div>
  );
}
