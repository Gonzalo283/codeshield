import type { Metadata } from "next";
import Link from "next/link";
import { Nav } from "@/components/nav";
import { Footer } from "@/components/footer";

export const metadata: Metadata = {
  title: "About",
  description:
    "Why we're building CodeShield — the security scanner designed for the code AI writes.",
  alternates: { canonical: "/about" },
};

export default function AboutPage() {
  return (
    <div className="min-h-screen flex flex-col bg-bg-primary">
      <Nav variant="marketing" />
      <main className="flex-1">
        <article className="max-w-3xl mx-auto px-6 md:px-8 py-16 md:py-24">
          <header className="mb-12">
            <div className="text-xs font-mono uppercase tracking-[0.2em] text-text-dim mb-3">
              About
            </div>
            <h1 className="text-4xl md:text-5xl font-bold text-text-primary mb-5 leading-tight">
              Every line your AI writes is a new attack surface.
            </h1>
            <p className="text-lg text-text-secondary leading-relaxed">
              CodeShield exists because the gap between how fast AI writes code and
              how fast we can review it keeps growing &mdash; and that gap is where
              vulnerabilities live.
            </p>
          </header>

          <div className="space-y-12">
            <section>
              <h2 className="text-xl font-semibold text-text-primary mb-3">The problem</h2>
              <p className="text-text-secondary leading-relaxed">
                Almost half of all new code is now written by AI assistants like
                Copilot, Cursor, and Claude. These tools are extraordinary at
                producing something that compiles &mdash; and surprisingly bad at
                producing something secure. Independent audits keep finding the
                same result: around 45% of AI-generated code contains an
                exploitable vulnerability. Most of that code ships anyway.
              </p>
              <p className="text-text-secondary leading-relaxed mt-4">
                Traditional static analysis was built for hand-written code and
                a threat model from a decade ago. It misses the specific mistakes
                LLMs make: eval() on user input, hardcoded secrets in comments,
                weak default crypto, prompt injection in server-side code.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-text-primary mb-3">What we do differently</h2>
              <ul className="space-y-3 text-text-secondary leading-relaxed">
                <li className="flex gap-3">
                  <span className="text-green font-mono text-sm mt-0.5">&rarr;</span>
                  <span>
                    <strong className="text-text-primary">Patterns tuned for AI output.</strong>{" "}
                    The 50+ rules we ship are based on real failures we&rsquo;ve
                    collected from Copilot, Claude, and Cursor transcripts &mdash;
                    not a generic SAST rulebook from 2015.
                  </span>
                </li>
                <li className="flex gap-3">
                  <span className="text-green font-mono text-sm mt-0.5">&rarr;</span>
                  <span>
                    <strong className="text-text-primary">Post-quantum crypto scanner.</strong>{" "}
                    NIST has already set 2030 as the deprecation deadline for
                    RSA and ECDSA. Our scanner finds every quantum-vulnerable
                    algorithm in your codebase and generates a migration
                    timeline.
                  </span>
                </li>
                <li className="flex gap-3">
                  <span className="text-green font-mono text-sm mt-0.5">&rarr;</span>
                  <span>
                    <strong className="text-text-primary">Fixes, not just findings.</strong>{" "}
                    When we flag a vulnerability, Claude writes the patch. You
                    review the diff, not a 40-page report.
                  </span>
                </li>
                <li className="flex gap-3">
                  <span className="text-green font-mono text-sm mt-0.5">&rarr;</span>
                  <span>
                    <strong className="text-text-primary">Built for the CI, not the war room.</strong>{" "}
                    One GitHub Action. Every PR gets scanned. Criticals block
                    the merge. That&rsquo;s it.
                  </span>
                </li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-text-primary mb-3">What we won&rsquo;t do</h2>
              <ul className="space-y-3 text-text-secondary leading-relaxed">
                <li className="flex gap-3">
                  <span className="text-text-dim font-mono text-sm mt-0.5">&times;</span>
                  <span>We won&rsquo;t train AI models on your code.</span>
                </li>
                <li className="flex gap-3">
                  <span className="text-text-dim font-mono text-sm mt-0.5">&times;</span>
                  <span>We won&rsquo;t sell your scan results or metadata.</span>
                </li>
                <li className="flex gap-3">
                  <span className="text-text-dim font-mono text-sm mt-0.5">&times;</span>
                  <span>
                    We won&rsquo;t ship noisy scanners just to pad the
                    finding count &mdash; false positives are worse than false
                    negatives because they kill trust.
                  </span>
                </li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-text-primary mb-3">Who we are</h2>
              <p className="text-text-secondary leading-relaxed">
                Independent, founder-built. No VCs to please, no growth targets
                forcing bad trade-offs. If CodeShield disappoints you, reply
                to our welcome email &mdash; we read them all and we&rsquo;ll
                try to make it right.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-text-primary mb-3">Get in touch</h2>
              <div className="grid sm:grid-cols-2 gap-4">
                <a
                  href="mailto:hello@codeshield.sh"
                  className="card p-5 hover:border-green/40 transition-colors"
                >
                  <div className="text-sm font-semibold text-text-primary mb-1">General &amp; product</div>
                  <div className="text-sm text-green font-mono">hello@codeshield.sh</div>
                </a>
                <a
                  href="mailto:security@codeshield.sh"
                  className="card p-5 hover:border-green/40 transition-colors"
                >
                  <div className="text-sm font-semibold text-text-primary mb-1">Responsible disclosure</div>
                  <div className="text-sm text-green font-mono">security@codeshield.sh</div>
                </a>
                <a
                  href="mailto:enterprise@codeshield.sh"
                  className="card p-5 hover:border-green/40 transition-colors"
                >
                  <div className="text-sm font-semibold text-text-primary mb-1">Enterprise &amp; SSO</div>
                  <div className="text-sm text-green font-mono">enterprise@codeshield.sh</div>
                </a>
                <a
                  href="mailto:press@codeshield.sh"
                  className="card p-5 hover:border-green/40 transition-colors"
                >
                  <div className="text-sm font-semibold text-text-primary mb-1">Press &amp; partnerships</div>
                  <div className="text-sm text-green font-mono">press@codeshield.sh</div>
                </a>
              </div>
            </section>

            <section className="pt-8">
              <Link
                href="/scan-free"
                className="btn-primary inline-flex items-center text-base px-7 py-3"
              >
                Try it &mdash; scan a public repo
              </Link>
            </section>
          </div>
        </article>
      </main>
      <Footer />
    </div>
  );
}
