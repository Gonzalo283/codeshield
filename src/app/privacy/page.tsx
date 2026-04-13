import type { Metadata } from "next";
import { Nav } from "@/components/nav";
import { Footer } from "@/components/footer";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description:
    "How CodeShield.sh collects, uses, and protects your data. GDPR-compliant privacy policy.",
  alternates: { canonical: "/privacy" },
};

const LAST_UPDATED = "April 13, 2026";

export default function PrivacyPage() {
  return (
    <div className="min-h-screen flex flex-col bg-bg-primary">
      <Nav />
      <main className="flex-1">
        <article className="max-w-3xl mx-auto px-6 md:px-8 py-16 md:py-24">
          <header className="mb-10">
            <h1 className="text-4xl md:text-5xl font-bold text-text-primary mb-3">
              Privacy Policy
            </h1>
            <p className="text-sm text-text-dim">Last updated: {LAST_UPDATED}</p>
          </header>

          <div className="prose prose-invert max-w-none text-text-secondary leading-relaxed space-y-6 [&_h2]:text-text-primary [&_h2]:text-xl [&_h2]:font-semibold [&_h2]:mt-10 [&_h2]:mb-3 [&_h3]:text-text-primary [&_h3]:text-base [&_h3]:font-semibold [&_h3]:mt-6 [&_h3]:mb-2 [&_a]:text-green [&_a:hover]:underline [&_strong]:text-text-primary [&_ul]:list-disc [&_ul]:pl-6 [&_ul]:space-y-1 [&_li]:text-text-secondary [&_table]:w-full [&_table]:text-sm [&_table]:my-4 [&_th]:text-left [&_th]:text-text-primary [&_th]:font-semibold [&_th]:py-2 [&_th]:pr-4 [&_th]:border-b [&_th]:border-border [&_td]:py-2 [&_td]:pr-4 [&_td]:border-b [&_td]:border-border/50">
            <p>
              CodeShield.sh (&ldquo;CodeShield,&rdquo; &ldquo;we,&rdquo;) takes
              privacy seriously. This policy explains what data we collect,
              why, and what rights you have — in particular under the EU
              General Data Protection Regulation (GDPR).
            </p>
            <p>
              <strong>Data controller:</strong> CodeShield.sh —{" "}
              <a href="mailto:privacy@codeshield.sh">privacy@codeshield.sh</a>.
            </p>

            <h2>1. Data we collect</h2>
            <table>
              <thead>
                <tr>
                  <th>Category</th>
                  <th>Examples</th>
                  <th>Purpose</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>Account</td>
                  <td>Name, email, GitHub ID, avatar</td>
                  <td>Authentication, billing</td>
                </tr>
                <tr>
                  <td>Billing</td>
                  <td>Stripe customer ID, subscription status</td>
                  <td>Process payments (we never see full card numbers)</td>
                </tr>
                <tr>
                  <td>Scan content</td>
                  <td>Code you submit, repo URLs, file paths</td>
                  <td>Produce scan results</td>
                </tr>
                <tr>
                  <td>Scan metadata</td>
                  <td>Findings, severities, timestamps</td>
                  <td>History, reporting, auditing usage</td>
                </tr>
                <tr>
                  <td>Technical</td>
                  <td>IP, user-agent, log data</td>
                  <td>Security, rate-limiting, abuse prevention</td>
                </tr>
                <tr>
                  <td>Analytics (optional)</td>
                  <td>Page views, click events</td>
                  <td>Product improvement (Google Analytics, PostHog)</td>
                </tr>
              </tbody>
            </table>

            <h2>2. Legal bases (GDPR Art. 6)</h2>
            <ul>
              <li>
                <strong>Contract</strong> — to provide the Service you signed
                up for.
              </li>
              <li>
                <strong>Legitimate interests</strong> — to keep the platform
                secure, prevent abuse, and improve the product.
              </li>
              <li>
                <strong>Legal obligation</strong> — tax, accounting, and
                fraud-prevention records.
              </li>
              <li>
                <strong>Consent</strong> — optional analytics and marketing
                emails. You can withdraw consent at any time.
              </li>
            </ul>

            <h2>3. Code &amp; scan data</h2>
            <p>
              Source code you submit is processed only to produce scan
              results. We:
            </p>
            <ul>
              <li>
                <strong>Do not sell</strong> your code or scan data.
              </li>
              <li>
                <strong>Do not use your code to train public AI models.</strong>
              </li>
              <li>
                Send small code snippets to Anthropic (Claude) only when you
                explicitly request an AI auto-fix. Anthropic processes them
                under its commercial terms and does not train on API data.
              </li>
              <li>
                Store scan findings and metadata for as long as your account
                is active, so you can review history. You can request deletion
                at any time.
              </li>
            </ul>

            <h2>4. Sub-processors</h2>
            <p>
              We rely on the following vendors to deliver the Service. Each
              has been reviewed for security and GDPR compliance.
            </p>
            <table>
              <thead>
                <tr>
                  <th>Vendor</th>
                  <th>Purpose</th>
                  <th>Location</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>Vercel</td>
                  <td>Hosting</td>
                  <td>EU / US</td>
                </tr>
                <tr>
                  <td>GitHub</td>
                  <td>OAuth, repo access</td>
                  <td>US</td>
                </tr>
                <tr>
                  <td>Stripe</td>
                  <td>Payments</td>
                  <td>IE / US</td>
                </tr>
                <tr>
                  <td>Anthropic</td>
                  <td>AI auto-fix (optional)</td>
                  <td>US</td>
                </tr>
                <tr>
                  <td>Resend</td>
                  <td>Transactional email</td>
                  <td>US</td>
                </tr>
                <tr>
                  <td>PostHog / Google Analytics</td>
                  <td>Product analytics</td>
                  <td>EU / US</td>
                </tr>
              </tbody>
            </table>
            <p>
              International transfers rely on Standard Contractual Clauses
              (SCCs) where applicable.
            </p>

            <h2>5. Retention</h2>
            <ul>
              <li>Account data — as long as your account is active.</li>
              <li>Billing invoices — 7 years (legal requirement).</li>
              <li>Scan findings — while your account is active; deleted on request.</li>
              <li>Server logs — 30 days.</li>
            </ul>

            <h2>6. Your rights (GDPR)</h2>
            <p>You can at any time:</p>
            <ul>
              <li>Access a copy of the data we hold about you.</li>
              <li>Correct or update inaccurate data.</li>
              <li>
                Delete your account and data (&ldquo;right to be
                forgotten&rdquo;).
              </li>
              <li>Export your data (portability).</li>
              <li>Object to processing or withdraw consent.</li>
              <li>
                Lodge a complaint with your local data-protection authority.
              </li>
            </ul>
            <p>
              Email{" "}
              <a href="mailto:privacy@codeshield.sh">privacy@codeshield.sh</a>{" "}
              and we&rsquo;ll respond within 30 days.
            </p>

            <h2>7. Security</h2>
            <ul>
              <li>HTTPS-only, HSTS enforced, modern TLS.</li>
              <li>API keys stored as SHA-256 hashes, never in plaintext.</li>
              <li>Stripe PCI DSS-certified — we never store card data.</li>
              <li>Rate limiting, CSRF protection, and strict CSP headers.</li>
              <li>
                Incident response: we will notify affected users within 72
                hours of confirming a breach.
              </li>
            </ul>

            <h2>8. Cookies</h2>
            <p>We use a minimal set of cookies:</p>
            <ul>
              <li>
                <strong>Essential</strong> — authentication session, CSRF token, scan quota.
              </li>
              <li>
                <strong>Analytics (opt-in)</strong> — PostHog / Google
                Analytics to understand usage. You may disable these at any
                time via browser settings.
              </li>
            </ul>

            <h2>9. Children</h2>
            <p>
              The Service is not intended for children under 16. We do not
              knowingly collect data from minors.
            </p>

            <h2>10. Changes</h2>
            <p>
              We&rsquo;ll update this page when something material changes and
              notify you in-app or via email when required.
            </p>

            <h2>11. Contact</h2>
            <p>
              Email{" "}
              <a href="mailto:privacy@codeshield.sh">privacy@codeshield.sh</a>{" "}
              for any privacy-related request.
            </p>
          </div>
        </article>
      </main>
      <Footer />
    </div>
  );
}
