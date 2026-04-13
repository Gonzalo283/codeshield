import type { Metadata } from "next";
import { Nav } from "@/components/nav";
import { Footer } from "@/components/footer";

export const metadata: Metadata = {
  title: "Terms of Service",
  description:
    "Terms of Service for CodeShield.sh — AI-powered code security scanning platform.",
  alternates: { canonical: "/terms" },
};

const LAST_UPDATED = "April 13, 2026";

export default function TermsPage() {
  return (
    <div className="min-h-screen flex flex-col bg-bg-primary">
      <Nav />
      <main className="flex-1">
        <article className="max-w-3xl mx-auto px-6 md:px-8 py-16 md:py-24">
          <header className="mb-10">
            <h1 className="text-4xl md:text-5xl font-bold text-text-primary mb-3">
              Terms of Service
            </h1>
            <p className="text-sm text-text-dim">Last updated: {LAST_UPDATED}</p>
          </header>

          <div className="prose prose-invert max-w-none text-text-secondary leading-relaxed space-y-6 [&_h2]:text-text-primary [&_h2]:text-xl [&_h2]:font-semibold [&_h2]:mt-10 [&_h2]:mb-3 [&_h3]:text-text-primary [&_h3]:text-base [&_h3]:font-semibold [&_h3]:mt-6 [&_h3]:mb-2 [&_a]:text-green [&_a:hover]:underline [&_strong]:text-text-primary [&_ul]:list-disc [&_ul]:pl-6 [&_ul]:space-y-1 [&_li]:text-text-secondary">
            <p>
              Welcome to CodeShield (&ldquo;CodeShield,&rdquo; &ldquo;we,&rdquo;
              &ldquo;us,&rdquo; or &ldquo;our&rdquo;). These Terms of Service
              (&ldquo;Terms&rdquo;) govern your access to and use of the
              CodeShield platform at{" "}
              <a href="https://codeshield.sh">codeshield.sh</a>, including our
              website, APIs, CLI, GitHub Action, and related services
              (collectively, the &ldquo;Service&rdquo;).
            </p>
            <p>
              By creating an account, clicking &ldquo;Sign in,&rdquo; or using
              the Service, you agree to be bound by these Terms. If you do not
              agree, do not use the Service.
            </p>

            <h2>1. The Service</h2>
            <p>
              CodeShield provides automated code-security scanning, including
              OWASP vulnerability detection, secret detection, post-quantum
              cryptography (PQC) readiness checks, and AI-assisted
              remediation. Scan results are informational and do not guarantee
              that your code is free of vulnerabilities.
            </p>

            <h2>2. Accounts</h2>
            <p>
              You sign in with GitHub OAuth. You are responsible for the
              activity under your account and for keeping your API keys
              confidential. Notify us immediately at{" "}
              <a href="mailto:security@codeshield.sh">
                security@codeshield.sh
              </a>{" "}
              if you suspect unauthorized access.
            </p>

            <h2>3. Plans, Billing &amp; Refunds</h2>
            <ul>
              <li>
                <strong>Free plan.</strong> Limited to 10 scans/month and 5
                repositories.
              </li>
              <li>
                <strong>Paid plans (Team, Business).</strong> Billed monthly
                in advance via Stripe. Prices are listed on our{" "}
                <a href="/pricing">Pricing</a> page and may change with 30
                days&rsquo; notice.
              </li>
              <li>
                <strong>Cancellation.</strong> You may cancel at any time from
                your <a href="/account">Account</a> page. You retain access
                until the end of the paid period.
              </li>
              <li>
                <strong>Refunds.</strong> Monthly subscriptions are
                non-refundable. We may grant pro-rata refunds at our
                discretion.
              </li>
              <li>
                <strong>Taxes.</strong> Prices are exclusive of applicable
                taxes (e.g. EU VAT), which will be added at checkout.
              </li>
            </ul>

            <h2>4. Acceptable Use</h2>
            <p>You agree not to:</p>
            <ul>
              <li>
                Scan code, systems, or repositories you do not own or are not
                explicitly authorized to scan.
              </li>
              <li>
                Reverse-engineer, copy, or resell the Service without written
                permission.
              </li>
              <li>
                Use the Service to violate any law, infringe intellectual
                property, or generate malicious code.
              </li>
              <li>
                Exceed the rate limits or quota of your plan, or share API
                keys across organizations.
              </li>
            </ul>
            <p>
              We may suspend or terminate accounts that violate these rules.
            </p>

            <h2>5. Your Content</h2>
            <p>
              You retain ownership of the code and data you submit to the
              Service (&ldquo;Your Content&rdquo;). You grant CodeShield a
              limited, non-exclusive license to process Your Content solely to
              provide and improve the Service. We do not sell Your Content,
              and we do not train public AI models on it.
            </p>
            <p>
              Scan results and metadata derived from Your Content are stored
              to show you history, generate reports, and audit billing.
            </p>

            <h2>6. Third-Party Services</h2>
            <p>
              The Service integrates with GitHub, Stripe, and Anthropic
              (Claude). Your use of those services is subject to their
              respective terms. CodeShield is not responsible for outages,
              data handling, or changes imposed by third parties.
            </p>

            <h2>7. Service Availability</h2>
            <p>
              We work hard to keep the Service online but do not guarantee
              uninterrupted availability. Business-plan customers receive a
              99.5% monthly uptime target; Enterprise SLAs are negotiated
              separately.
            </p>

            <h2>8. Warranty Disclaimer</h2>
            <p>
              THE SERVICE IS PROVIDED &ldquo;AS IS&rdquo; AND &ldquo;AS
              AVAILABLE&rdquo; WITHOUT WARRANTIES OF ANY KIND, WHETHER
              EXPRESS, IMPLIED, OR STATUTORY, INCLUDING WITHOUT LIMITATION
              WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR
              PURPOSE, AND NON-INFRINGEMENT. WE DO NOT WARRANT THAT THE
              SERVICE WILL DETECT EVERY VULNERABILITY.
            </p>

            <h2>9. Limitation of Liability</h2>
            <p>
              TO THE MAXIMUM EXTENT PERMITTED BY LAW, CODESHIELD&rsquo;S TOTAL
              AGGREGATE LIABILITY SHALL NOT EXCEED THE AMOUNT YOU PAID TO US
              IN THE TWELVE (12) MONTHS PRECEDING THE CLAIM, OR ONE HUNDRED
              EUROS (&euro;100), WHICHEVER IS GREATER. WE ARE NOT LIABLE FOR
              INDIRECT, CONSEQUENTIAL, OR INCIDENTAL DAMAGES.
            </p>

            <h2>10. Indemnification</h2>
            <p>
              You agree to defend and indemnify CodeShield against any claims
              arising from your violation of these Terms, your misuse of the
              Service, or your infringement of third-party rights.
            </p>

            <h2>11. Termination</h2>
            <p>
              Either party may terminate the agreement at any time. Upon
              termination, we may delete your account data after 30 days.
              Sections 5, 7, 8, 9, and 10 survive termination.
            </p>

            <h2>12. Changes</h2>
            <p>
              We may update these Terms. Material changes will be announced
              via email or in-app notice at least 14 days before taking
              effect. Continued use of the Service after the effective date
              constitutes acceptance.
            </p>

            <h2>13. Governing Law</h2>
            <p>
              These Terms are governed by the laws of Spain, excluding its
              conflict-of-law rules. Any dispute shall be resolved in the
              courts of Madrid, Spain, unless required otherwise by
              mandatory consumer-protection law.
            </p>

            <h2>14. Contact</h2>
            <p>
              Questions? Write to{" "}
              <a href="mailto:legal@codeshield.sh">legal@codeshield.sh</a>.
            </p>
          </div>
        </article>
      </main>
      <Footer />
    </div>
  );
}
