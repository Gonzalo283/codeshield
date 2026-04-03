"use client";

import { signIn, useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import Providers from "./providers";
import { TerminalDemo } from "@/components/terminal-demo";

function HomePage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (session) router.push("/dashboard");
  }, [session, router]);

  if (status === "loading" || session) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-bg-primary">
        <div className="progress-bar w-48" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-bg-primary">
      {/* Skip link */}
      <a href="#main" className="skip-link">Skip to content</a>

      {/* ── Nav ── */}
      <nav className="sticky top-0 z-50 backdrop-blur-lg bg-bg-primary/80 border-b border-border">
        <div className="max-w-7xl mx-auto px-6 md:px-8 h-14 flex items-center justify-between">
          <div className="flex items-center gap-8">
            <a href="/" className="flex items-center gap-2.5">
              <img src="/logo.svg" alt="CodeShield" width={26} height={26} />
              <span className="font-bold text-[15px] text-text-primary font-mono tracking-tight">CodeShield</span>
            </a>
            <div className="hidden md:flex items-center gap-1 text-sm">
              <a href="#features" className="px-3 py-1.5 text-text-dim hover:text-text-secondary transition-colors rounded-lg">Features</a>
              <a href="/pricing" className="px-3 py-1.5 text-text-dim hover:text-text-secondary transition-colors rounded-lg">Pricing</a>
              <a href="/blog" className="px-3 py-1.5 text-text-dim hover:text-text-secondary transition-colors rounded-lg">Blog</a>
              <a href="/docs" className="px-3 py-1.5 text-text-dim hover:text-text-secondary transition-colors rounded-lg">Docs</a>
            </div>
          </div>
          <button onClick={() => signIn("github")} className="btn-primary text-sm px-4 py-2" aria-label="Get started free">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/></svg>
            Get Started Free
          </button>
        </div>
      </nav>

      <main id="main">
        {/* ── Hero: split layout ── */}
        <section className="max-w-7xl mx-auto px-6 md:px-8 pt-16 md:pt-24 pb-12 md:pb-20">
          <div className="grid lg:grid-cols-[1.1fr_0.9fr] gap-12 lg:gap-16 items-center">
            {/* Left */}
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-border bg-bg-surface text-xs text-text-dim mb-6">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#00E87B" strokeWidth="2.5" strokeLinecap="round"><polyline points="20 6 9 17 4 12"/></svg>
                Trusted by developers at startups &amp; enterprises
              </div>

              <h1 className="text-4xl sm:text-5xl lg:text-[56px] font-bold leading-[1.1] tracking-tight text-text-primary mb-6">
                Secure every line{" "}
                <br className="hidden sm:block" />
                <span className="text-green">your AI writes.</span>
              </h1>

              <p className="text-base sm:text-lg text-text-secondary leading-relaxed max-w-lg mb-8">
                The only security scanner built for AI-generated code. Detects OWASP
                vulnerabilities, leaked secrets, and quantum-unsafe cryptography — then
                fixes them automatically.
              </p>

              <div className="flex flex-col sm:flex-row gap-3">
                <button onClick={() => signIn("github")} className="btn-primary text-base px-7 py-3.5">
                  Scan Your First Repo
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14"/><polyline points="12 5 19 12 12 19"/></svg>
                </button>
                <a href="#demo" className="btn-secondary text-base px-7 py-3.5">See how it works</a>
              </div>
            </div>

            {/* Right: terminal */}
            <div className="hidden lg:block">
              <TerminalDemo />
            </div>
          </div>

          {/* Works with bar */}
          <div className="mt-16 md:mt-20 flex items-center justify-center gap-6 md:gap-10 flex-wrap text-text-dim">
            <span className="text-xs uppercase tracking-wider">Works with</span>
            {["GitHub", "VS Code", "Cursor", "Copilot", "Claude Code"].map((name) => (
              <span key={name} className="font-mono text-sm text-text-dim/70">{name}</span>
            ))}
          </div>
        </section>

        {/* ── Stats bar ── */}
        <section className="max-w-5xl mx-auto px-6 md:px-8 py-10">
          <div className="bg-bg-surface border border-border rounded-2xl p-6 md:p-8 grid sm:grid-cols-3 gap-6 md:gap-0 md:divide-x divide-border">
            {[
              { stat: "45%", label: "of AI-generated code has security vulnerabilities", source: "Omdia 2026" },
              { stat: "51%", label: "of all GitHub code is now AI-generated", source: "GitHub 2026" },
              { stat: "5%", label: "of enterprises have deployed quantum-safe encryption", source: "Entrust/Ponemon 2026" },
            ].map((item) => (
              <div key={item.stat} className="text-center md:px-8">
                <div className="text-3xl font-bold font-mono text-text-primary">{item.stat}</div>
                <p className="text-sm text-text-secondary mt-1">{item.label}</p>
                <p className="text-[11px] text-text-dim mt-1">{item.source}</p>
              </div>
            ))}
          </div>
        </section>

        {/* ── Problem section ── */}
        <section className="max-w-7xl mx-auto px-6 md:px-8 py-20 md:py-28">
          <h2 className="text-3xl md:text-4xl font-bold text-text-primary text-center mb-4">
            AI coding tools changed everything.
            <br className="hidden sm:block" />
            <span className="text-text-dim"> Except security.</span>
          </h2>
          <p className="text-text-secondary text-center mb-14 max-w-xl mx-auto">
            Code ships faster than ever. The vulnerabilities ship with it.
          </p>

          <div className="grid md:grid-cols-3 gap-6">
            {[
              {
                icon: <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#F43F5E" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/></svg>,
                title: "More code, more risk",
                body: "AI tools generate code 10x faster. Security reviews haven\u2019t kept up. 81% of organizations lack visibility into AI-generated code in their SDLC.",
              },
              {
                icon: <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#F59E0B" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="3" width="20" height="14" rx="2"/><line x1="8" y1="21" x2="16" y2="21"/><line x1="12" y1="17" x2="12" y2="21"/></svg>,
                title: "Crypto with an expiration date",
                body: "RSA, ECDSA, ECDH \u2014 the algorithms your AI assistant uses by default \u2014 will be broken by quantum computers. NIST mandates migration by 2030.",
              },
              {
                icon: <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#3B82F6" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/></svg>,
                title: "Breaches cost millions",
                body: "The average data breach involving unauthorized AI tools costs $4.88M. Most are caused by vulnerabilities that automated scanning would catch.",
              },
            ].map((item) => (
              <div key={item.title} className="card p-6">
                <div className="w-11 h-11 rounded-xl bg-bg-elevated flex items-center justify-center mb-4">{item.icon}</div>
                <h3 className="text-lg font-semibold text-text-primary mb-2">{item.title}</h3>
                <p className="text-sm text-text-secondary leading-relaxed">{item.body}</p>
              </div>
            ))}
          </div>
        </section>

        {/* ── Product demo ── */}
        <section id="demo" className="max-w-7xl mx-auto px-6 md:px-8 py-20 md:py-28">
          <h2 className="text-3xl md:text-4xl font-bold text-text-primary text-center mb-3">See it in action</h2>
          <p className="text-text-secondary text-center mb-14">From connect to secure in under 2 minutes.</p>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { step: "1", title: "Connect", desc: "One-click GitHub OAuth. Read-only access to your repos.", color: "green" },
              { step: "2", title: "Scan", desc: "50+ vulnerability patterns across all your files.", color: "orange" },
              { step: "3", title: "Review", desc: "Prioritized results by severity with full context.", color: "blue" },
              { step: "4", title: "Fix", desc: "AI generates secure replacements. Copy or create PR.", color: "green" },
            ].map((item) => (
              <div key={item.step} className="card p-6 text-center">
                <div className={`w-10 h-10 rounded-xl bg-${item.color}/10 border border-${item.color}/20 flex items-center justify-center mx-auto mb-4`}>
                  <span className={`text-lg font-bold font-mono text-${item.color}`}>{item.step}</span>
                </div>
                <h3 className="font-semibold text-text-primary mb-1">{item.title}</h3>
                <p className="text-sm text-text-secondary">{item.desc}</p>
              </div>
            ))}
          </div>

          {/* Terminal on mobile (hidden on desktop where it's in hero) */}
          <div className="lg:hidden mt-10">
            <TerminalDemo />
          </div>
        </section>

        {/* ── Features grid ── */}
        <section id="features" className="max-w-7xl mx-auto px-6 md:px-8 py-20 md:py-28">
          <h2 className="text-3xl md:text-4xl font-bold text-text-primary text-center mb-3">Everything you need to ship secure code</h2>
          <p className="text-text-secondary text-center mb-14 max-w-lg mx-auto">Scan, detect, and fix — all in one platform.</p>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {[
              {
                icon: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>,
                title: "AI Code Vulnerability Detection",
                desc: "Scans for patterns unique to AI-generated code. SQL injection, XSS, eval(), insecure crypto — the mistakes LLMs make most.",
                badge: null,
              },
              {
                icon: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="3" width="20" height="14" rx="2"/><line x1="8" y1="21" x2="16" y2="21"/><line x1="12" y1="17" x2="12" y2="21"/></svg>,
                title: "Post-Quantum Crypto Scanner",
                desc: "Finds RSA, ECDSA, ECDH, DH, SHA-1, and 30+ quantum-vulnerable patterns. Generates a Cryptographic Bill of Materials.",
                badge: { text: "UNIQUE", color: "green" },
              },
              {
                icon: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>,
                title: "One-Click Auto-Fix",
                desc: "Claude generates secure code replacements with clear explanations. Review the diff, copy, and merge.",
                badge: { text: "PRO", color: "orange" },
              },
              {
                icon: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>,
                title: "Secret Detection",
                desc: "Catches Stripe keys, GitHub tokens, Google API keys, private keys, and hardcoded passwords before they leak.",
                badge: null,
              },
              {
                icon: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="16 18 22 12 16 6"/><polyline points="8 6 2 12 8 18"/></svg>,
                title: "CI/CD Integration",
                desc: "GitHub Action that scans every PR and comments results. Block merges on critical vulnerabilities.",
                badge: null,
              },
              {
                icon: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg>,
                title: "Compliance Reports",
                desc: "NIST PQC timeline tracking, SOC 2 documentation, PCI DSS 4.0 crypto inventory. Enterprise-ready.",
                badge: { text: "BUSINESS", color: "blue" },
              },
            ].map((item) => (
              <div key={item.title} className="card p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-10 h-10 rounded-xl bg-bg-elevated flex items-center justify-center text-text-secondary">{item.icon}</div>
                  {item.badge && (
                    <span className={`text-[10px] font-mono font-semibold px-2 py-0.5 rounded border bg-${item.badge.color}/10 text-${item.badge.color} border-${item.badge.color}/20`}>
                      {item.badge.text}
                    </span>
                  )}
                </div>
                <h3 className="font-semibold text-text-primary mb-2">{item.title}</h3>
                <p className="text-sm text-text-secondary leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* ── Comparison table ── */}
        <section className="max-w-5xl mx-auto px-6 md:px-8 py-20 md:py-28">
          <h2 className="text-3xl md:text-4xl font-bold text-text-primary text-center mb-3">CodeShield vs. the alternatives</h2>
          <p className="text-text-secondary text-center mb-12">Honest comparison. We win where it matters for AI code.</p>

          <div className="overflow-x-auto">
            <table className="w-full text-sm border-collapse">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left py-4 pr-4 text-text-dim font-medium">Feature</th>
                  <th className="py-4 px-4 text-center text-green font-semibold">CodeShield</th>
                  <th className="py-4 px-4 text-center text-text-secondary font-medium">Snyk</th>
                  <th className="py-4 px-4 text-center text-text-secondary font-medium">GitHub GHAS</th>
                  <th className="py-4 px-4 text-center text-text-secondary font-medium">SonarCloud</th>
                </tr>
              </thead>
              <tbody className="text-text-secondary">
                {[
                  { feature: "AI Code Focus", cs: "full", snyk: "partial", gh: "partial", sonar: "no" },
                  { feature: "PQC Migration", cs: "full", snyk: "no", gh: "no", sonar: "no" },
                  { feature: "Auto-Fix with AI", cs: "full", snyk: "full", gh: "full", sonar: "no" },
                  { feature: "Secret Scanning", cs: "full", snyk: "full", gh: "full", sonar: "partial" },
                  { feature: "CBOM Generation", cs: "full", snyk: "no", gh: "no", sonar: "no" },
                  { feature: "Free Tier", cs: "full", snyk: "full", gh: "partial", sonar: "full" },
                  { feature: "Starting Price", cs: "$29/dev", snyk: "$25/dev", gh: "$19/dev", sonar: "\u20AC30/mo" },
                ].map((row) => (
                  <tr key={row.feature} className="border-b border-border/50">
                    <td className="py-3.5 pr-4 text-text-primary font-medium">{row.feature}</td>
                    {[row.cs, row.snyk, row.gh, row.sonar].map((val, i) => (
                      <td key={i} className="py-3.5 px-4 text-center">
                        {val === "full" ? (
                          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={i === 0 ? "#00E87B" : "#94A3B8"} strokeWidth="2.5" strokeLinecap="round" className="mx-auto"><polyline points="20 6 9 17 4 12"/></svg>
                        ) : val === "partial" ? (
                          <span className="text-orange font-mono">~</span>
                        ) : val === "no" ? (
                          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#64748B" strokeWidth="2" strokeLinecap="round" className="mx-auto"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                        ) : (
                          <span className="text-text-dim font-mono text-xs">{val}</span>
                        )}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {/* ── Pricing preview ── */}
        <section className="max-w-5xl mx-auto px-6 md:px-8 py-20 md:py-28">
          <h2 className="text-3xl md:text-4xl font-bold text-text-primary text-center mb-3">Start free. Scale when ready.</h2>
          <p className="text-text-secondary text-center mb-12">Only active committers are billed.</p>

          <div className="grid md:grid-cols-3 gap-5 max-w-4xl mx-auto">
            <div className="card p-7">
              <h3 className="font-semibold text-text-primary mb-1">Free</h3>
              <div className="text-3xl font-bold text-text-primary mb-5">$0</div>
              <ul className="space-y-2.5 text-sm text-text-secondary">
                {["5 repos, 10 scans/month", "Full vulnerability scanning", "PQC crypto discovery", "Secrets detection"].map((f) => (
                  <li key={f} className="flex items-center gap-2">
                    <svg className="w-4 h-4 text-green shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="20 6 9 17 4 12"/></svg>
                    {f}
                  </li>
                ))}
              </ul>
            </div>

            <div className="card p-7 border-green/40 relative glow-green">
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-0.5 bg-green text-bg-primary text-[10px] font-bold rounded-full uppercase tracking-wider">Most Popular</div>
              <h3 className="font-semibold text-text-primary mb-1">Team</h3>
              <div className="text-3xl font-bold text-text-primary mb-5">$29<span className="text-base font-normal text-text-dim">/dev/mo</span></div>
              <ul className="space-y-2.5 text-sm text-text-secondary">
                {["Unlimited scans", "AI auto-fix with Claude", "PQC migration + CBOM", "CI/CD integration"].map((f) => (
                  <li key={f} className="flex items-center gap-2">
                    <svg className="w-4 h-4 text-green shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="20 6 9 17 4 12"/></svg>
                    {f}
                  </li>
                ))}
              </ul>
            </div>

            <div className="card p-7">
              <h3 className="font-semibold text-text-primary mb-1">Business</h3>
              <div className="text-3xl font-bold text-text-primary mb-5">$79<span className="text-base font-normal text-text-dim">/dev/mo</span></div>
              <ul className="space-y-2.5 text-sm text-text-secondary">
                {["SSO / SAML", "Compliance reports", "SBOM + custom rules", "Dedicated support"].map((f) => (
                  <li key={f} className="flex items-center gap-2">
                    <svg className="w-4 h-4 text-green shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="20 6 9 17 4 12"/></svg>
                    {f}
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <div className="text-center mt-8">
            <a href="/pricing" className="text-green text-sm font-medium hover:underline">Compare all plans &amp; Enterprise pricing &rarr;</a>
          </div>
        </section>

        {/* ── CTA ── */}
        <section className="max-w-3xl mx-auto px-6 md:px-8 py-20 md:py-28">
          <div className="card p-10 md:p-14 text-center relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-green/5 via-transparent to-blue/5 pointer-events-none" />
            <div className="relative">
              <h2 className="text-2xl md:text-3xl font-bold text-text-primary mb-4">
                Start securing your AI code in 30 seconds
              </h2>
              <p className="text-text-secondary mb-8 max-w-md mx-auto">
                No credit card required. Free tier includes 5 repos and 10 scans/month.
              </p>
              <button onClick={() => signIn("github")} className="btn-primary text-base px-8 py-4">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/></svg>
                Connect GitHub — Free
              </button>
            </div>
          </div>
        </section>
      </main>

      {/* ── Footer ── */}
      <footer className="border-t border-border py-12 px-6 md:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-10">
            <div>
              <h4 className="text-xs font-semibold text-text-dim uppercase tracking-wider mb-4">Product</h4>
              <ul className="space-y-2.5 text-sm">
                <li><a href="#features" className="text-text-secondary hover:text-text-primary transition-colors">Features</a></li>
                <li><a href="/pricing" className="text-text-secondary hover:text-text-primary transition-colors">Pricing</a></li>
                <li><a href="/blog" className="text-text-secondary hover:text-text-primary transition-colors">Blog</a></li>
                <li><a href="/changelog" className="text-text-secondary hover:text-text-primary transition-colors">Changelog</a></li>
                <li><a href="/docs" className="text-text-secondary hover:text-text-primary transition-colors">Docs</a></li>
              </ul>
            </div>
            <div>
              <h4 className="text-xs font-semibold text-text-dim uppercase tracking-wider mb-4">Resources</h4>
              <ul className="space-y-2.5 text-sm">
                <li><a href="/docs" className="text-text-secondary hover:text-text-primary transition-colors">Documentation</a></li>
                <li><a href="/docs#github-action" className="text-text-secondary hover:text-text-primary transition-colors">GitHub Action</a></li>
                <li><a href="/docs#api" className="text-text-secondary hover:text-text-primary transition-colors">API Reference</a></li>
              </ul>
            </div>
            <div>
              <h4 className="text-xs font-semibold text-text-dim uppercase tracking-wider mb-4">Company</h4>
              <ul className="space-y-2.5 text-sm">
                <li><a href="mailto:hello@codeshield.ai" className="text-text-secondary hover:text-text-primary transition-colors">Contact</a></li>
                <li><a href="mailto:enterprise@codeshield.ai" className="text-text-secondary hover:text-text-primary transition-colors">Enterprise</a></li>
              </ul>
            </div>
            <div>
              <h4 className="text-xs font-semibold text-text-dim uppercase tracking-wider mb-4">Legal</h4>
              <ul className="space-y-2.5 text-sm">
                <li><span className="text-text-dim">Privacy Policy</span></li>
                <li><span className="text-text-dim">Terms of Service</span></li>
              </ul>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-8 border-t border-border">
            <div className="flex items-center gap-2.5">
              <img src="/logo.svg" alt="" width={20} height={20} />
              <span className="text-sm text-text-dim">&copy; 2026 CodeShield.ai</span>
            </div>
            <div className="flex items-center gap-4">
              <a href="https://github.com/codeshield-ai" className="text-text-dim hover:text-text-secondary transition-colors" aria-label="GitHub">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/></svg>
              </a>
              <a href="https://twitter.com/codeshieldai" className="text-text-dim hover:text-text-secondary transition-colors" aria-label="Twitter">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default function Page() {
  return (
    <Providers>
      <HomePage />
    </Providers>
  );
}
