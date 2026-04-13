"use client";

import { signIn, useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import Link from "next/link";
import Providers from "./providers";
import { Nav } from "@/components/nav";
import { Footer } from "@/components/footer";
import { ScrollReveal } from "@/components/scroll-reveal";
import { TerminalDemo } from "@/components/terminal-demo";

const Check = () => (
  <svg className="w-4 h-4 text-green shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
    <polyline points="20 6 9 17 4 12" />
  </svg>
);

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
    <div className="min-h-screen bg-bg-primary flex flex-col">
      <a href="#main" className="skip-link">Skip to content</a>

      <Nav variant="marketing" onSignIn={() => signIn("github")} />

      <main id="main" className="flex-1">
        {/* ── Hero ── */}
        <section className="relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-b from-green/[0.03] via-transparent to-transparent pointer-events-none" />
          <div className="max-w-7xl mx-auto px-5 md:px-8 pt-20 md:pt-28 lg:pt-32 pb-16 md:pb-24 relative">
            <div className="grid lg:grid-cols-[1.2fr_0.8fr] gap-12 lg:gap-20 items-center">
              {/* Left */}
              <div>
                <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-green/20 bg-green/5 text-xs text-green mb-8">
                  <span className="relative flex h-1.5 w-1.5">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green opacity-75" />
                    <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-green" />
                  </span>
                  Built for AI-generated code &middot; Now in public beta
                </div>

                <h1 className="text-5xl md:text-6xl lg:text-[64px] font-bold leading-[1.08] tracking-tight text-text-primary mb-7">
                  Secure every line{" "}
                  <br className="hidden sm:block" />
                  <span className="text-green">your AI writes.</span>
                </h1>

                <p className="text-base md:text-lg text-text-secondary leading-relaxed max-w-[520px] mb-10">
                  A security scanner built for the code Copilot, Cursor and Claude
                  generate. Finds OWASP vulnerabilities, leaked secrets, and
                  quantum-unsafe cryptography &mdash; then fixes them for you.
                </p>

                <div className="flex flex-col sm:flex-row gap-3">
                  <Link
                    href="/scan-free"
                    className="btn-primary text-base px-8 py-3.5 hover:translate-y-[-2px] hover:shadow-lg hover:shadow-green/20 transition-all duration-200"
                  >
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" /></svg>
                    Scan a repo in 30s
                  </Link>
                  <button
                    onClick={() => signIn("github")}
                    className="btn-secondary text-base px-8 py-3.5 hover:translate-y-[-2px] transition-all duration-200"
                  >
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" /></svg>
                    Connect GitHub
                  </button>
                </div>

                <p className="text-xs text-text-dim mt-4">
                  No signup for the first scan &middot; Free forever plan &middot; Your code stays private
                </p>
              </div>

              {/* Right: terminal */}
              <div className="hidden lg:block">
                <TerminalDemo />
              </div>
            </div>

            {/* Mobile terminal */}
            <div className="lg:hidden mt-12">
              <TerminalDemo />
            </div>

            {/* Works with bar */}
            <div className="mt-20 md:mt-24 flex items-center justify-center gap-6 md:gap-10 flex-wrap text-text-dim">
              <span className="text-[11px] uppercase tracking-[0.15em] font-medium">Works with</span>
              <div className="h-4 w-px bg-border" />
              {["GitHub", "VS Code", "Cursor", "Copilot", "Claude Code"].map((name) => (
                <span key={name} className="font-mono text-sm text-text-dim/70">{name}</span>
              ))}
            </div>
          </div>
        </section>

        {/* ── Stats bar ── */}
        <ScrollReveal delay={0}>
          <section className="max-w-5xl mx-auto px-5 md:px-8 py-12">
            <div className="bg-bg-surface/50 border border-border rounded-2xl p-6 md:p-8 grid sm:grid-cols-3 gap-6 md:gap-0 md:divide-x divide-border">
              {[
                { stat: "45%", label: "of AI-generated code contains exploitable vulnerabilities", source: "Veracode State of Software Security 2025" },
                { stat: "46%", label: "of developers' code is now written by AI assistants", source: "GitHub Octoverse 2024" },
                { stat: "2030", label: "NIST deadline to deprecate RSA, ECDSA and classical crypto", source: "NIST IR 8547, 2025" },
              ].map((item) => (
                <div key={item.stat} className="text-center md:px-8">
                  <div className="text-3xl md:text-4xl font-bold font-mono text-text-primary">{item.stat}</div>
                  <p className="text-sm text-text-secondary mt-1.5">{item.label}</p>
                  <p className="text-[11px] text-text-dim mt-1">{item.source}</p>
                </div>
              ))}
            </div>
          </section>
        </ScrollReveal>

        {/* ── Problem section ── */}
        <ScrollReveal delay={80}>
          <section className="py-24 md:py-32">
            <div className="max-w-7xl mx-auto px-5 md:px-8">
              <h2 className="text-3xl md:text-4xl font-bold text-text-primary text-center mb-4">
                AI coding tools changed everything.
                <br className="hidden sm:block" />
                <span className="text-text-dim"> Except security.</span>
              </h2>
              <p className="text-text-secondary text-center mb-16 max-w-xl mx-auto">
                Code ships faster than ever. The vulnerabilities ship with it.
              </p>

              <div className="grid md:grid-cols-3 gap-6">
                <div className="card p-6 border-t-2 border-t-red bg-gradient-to-b from-red/[0.03] to-transparent">
                  <div className="w-11 h-11 rounded-xl bg-red/10 flex items-center justify-center mb-5">
                    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#F43F5E" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" /></svg>
                  </div>
                  <h3 className="text-lg font-semibold text-text-primary mb-2">More code, more risk</h3>
                  <p className="text-sm text-text-secondary leading-relaxed">
                    AI assistants write code orders of magnitude faster than humans can review. Security processes built for the old pace silently fall behind &mdash; and the gap is where exploits live.
                  </p>
                </div>

                <div className="card p-6 border-t-2 border-t-orange bg-gradient-to-b from-orange/[0.03] to-transparent">
                  <div className="w-11 h-11 rounded-xl bg-orange/10 flex items-center justify-center mb-5">
                    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#F59E0B" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="3" width="20" height="14" rx="2" /><line x1="8" y1="21" x2="16" y2="21" /><line x1="12" y1="17" x2="12" y2="21" /></svg>
                  </div>
                  <h3 className="text-lg font-semibold text-text-primary mb-2">Crypto with an expiration date</h3>
                  <p className="text-sm text-text-secondary leading-relaxed">
                    RSA, ECDSA, ECDH — the algorithms your AI assistant uses by default — will be broken by quantum computers. NIST mandates migration by 2030.
                  </p>
                </div>

                <div className="card p-6 border-t-2 border-t-blue bg-gradient-to-b from-blue/[0.03] to-transparent">
                  <div className="w-11 h-11 rounded-xl bg-blue/10 flex items-center justify-center mb-5">
                    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#3B82F6" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><path d="M12 6v6l4 2" /></svg>
                  </div>
                  <h3 className="text-lg font-semibold text-text-primary mb-2">Breaches cost millions</h3>
                  <p className="text-sm text-text-secondary leading-relaxed">
                    IBM&rsquo;s 2024 report puts the average data breach at $4.88M. Most are rooted in vulnerability classes that automated scanning catches &mdash; before the code ships.
                  </p>
                </div>
              </div>
            </div>
          </section>
        </ScrollReveal>

        {/* ── Product demo ── */}
        <ScrollReveal delay={120}>
          <section id="demo" className="bg-bg-surface/30 py-24 md:py-32">
            <div className="max-w-7xl mx-auto px-5 md:px-8">
              <h2 className="text-3xl md:text-4xl font-bold text-text-primary text-center mb-3">See it in action</h2>
              <p className="text-text-secondary text-center mb-16">From connect to secure in under 2 minutes.</p>

              <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-0 items-start">
                {[
                  { step: "1", title: "Connect", desc: "One-click GitHub OAuth. Read-only access to your repos.", bg: "bg-green/10", border: "border-green/20", text: "text-green" },
                  { step: "2", title: "Scan", desc: "50+ vulnerability patterns across all your files.", bg: "bg-orange/10", border: "border-orange/20", text: "text-orange" },
                  { step: "3", title: "Review", desc: "Prioritized results by severity with full context.", bg: "bg-blue/10", border: "border-blue/20", text: "text-blue" },
                  { step: "4", title: "Fix", desc: "AI generates secure replacements. Copy or create PR.", bg: "bg-green/10", border: "border-green/20", text: "text-green" },
                ].map((item, i) => (
                  <div key={item.step} className="relative flex flex-col items-center text-center px-6 py-8">
                    {/* Connecting line */}
                    {i < 3 && (
                      <div className="hidden lg:block absolute top-[52px] left-[calc(50%+28px)] w-[calc(100%-56px)] h-px bg-border" />
                    )}
                    <div className={`w-14 h-14 rounded-2xl ${item.bg} border ${item.border} flex items-center justify-center mb-5 relative z-10`}>
                      <span className={`text-xl font-bold font-mono ${item.text}`}>{item.step}</span>
                    </div>
                    <h3 className="font-semibold text-text-primary mb-1.5">{item.title}</h3>
                    <p className="text-sm text-text-secondary max-w-[200px]">{item.desc}</p>
                  </div>
                ))}
              </div>
            </div>
          </section>
        </ScrollReveal>

        {/* ── Features grid ── */}
        <ScrollReveal delay={100}>
          <section id="features" className="py-24 md:py-32">
            <div className="max-w-7xl mx-auto px-5 md:px-8">
              <div className="max-w-2xl mb-16">
                <h2 className="text-3xl md:text-4xl font-bold text-text-primary mb-3">Everything you need to ship secure code</h2>
                <p className="text-text-secondary">Scan, detect, and fix — all in one platform.</p>
              </div>

              {/* Row 1 */}
              <div className="grid md:grid-cols-3 gap-5 mb-5">
                <div className="card p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-10 h-10 rounded-xl bg-bg-elevated flex items-center justify-center text-text-secondary">
                      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" /></svg>
                    </div>
                  </div>
                  <h3 className="font-semibold text-text-primary mb-2">AI Code Vulnerability Detection</h3>
                  <p className="text-sm text-text-secondary leading-relaxed">Scans for patterns unique to AI-generated code. SQL injection, XSS, eval(), insecure crypto — the mistakes LLMs make most.</p>
                </div>

                {/* PQC card — spans 2 cols, highlighted */}
                <div className="card p-6 md:col-span-2 border-green/30 glow-green relative overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-br from-green/[0.04] via-transparent to-transparent pointer-events-none" />
                  <div className="relative">
                    <div className="flex items-center justify-between mb-4">
                      <div className="w-10 h-10 rounded-xl bg-green/10 border border-green/20 flex items-center justify-center text-green">
                        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="3" width="20" height="14" rx="2" /><line x1="8" y1="21" x2="16" y2="21" /><line x1="12" y1="17" x2="12" y2="21" /></svg>
                      </div>
                      <span className="text-[10px] font-mono font-semibold px-2.5 py-1 rounded border bg-green/10 text-green border-green/20 uppercase tracking-wider">Key Differentiator</span>
                    </div>
                    <h3 className="text-lg font-semibold text-text-primary mb-2">Post-Quantum Crypto Scanner</h3>
                    <p className="text-sm text-text-secondary leading-relaxed max-w-lg">
                      Flags RSA, ECDSA, ECDH, DH, SHA-1 and 30+ quantum-vulnerable patterns, and generates a Cryptographic Bill of Materials. Rare among scanners &mdash; most focus on conventional SAST.
                    </p>
                  </div>
                </div>
              </div>

              {/* Row 2 */}
              <div className="grid md:grid-cols-3 gap-5">
                <div className="card p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-10 h-10 rounded-xl bg-bg-elevated flex items-center justify-center text-text-secondary">
                      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" /></svg>
                    </div>
                    <span className="text-[10px] font-mono font-semibold px-2 py-0.5 rounded border bg-orange/10 text-orange border-orange/20">PRO</span>
                  </div>
                  <h3 className="font-semibold text-text-primary mb-2">One-Click Auto-Fix</h3>
                  <p className="text-sm text-text-secondary leading-relaxed">Claude generates secure code replacements with clear explanations. Review the diff, copy, and merge.</p>
                </div>

                <div className="card p-6">
                  <div className="w-10 h-10 rounded-xl bg-bg-elevated flex items-center justify-center text-text-secondary mb-4">
                    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2" /><path d="M7 11V7a5 5 0 0 1 10 0v4" /></svg>
                  </div>
                  <h3 className="font-semibold text-text-primary mb-2">Secret Detection</h3>
                  <p className="text-sm text-text-secondary leading-relaxed">Catches Stripe keys, GitHub tokens, Google API keys, private keys, and hardcoded passwords before they leak.</p>
                </div>

                <div className="card p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-10 h-10 rounded-xl bg-bg-elevated flex items-center justify-center text-text-secondary">
                      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="16 18 22 12 16 6" /><polyline points="8 6 2 12 8 18" /></svg>
                    </div>
                  </div>
                  <h3 className="font-semibold text-text-primary mb-2">CI/CD Integration</h3>
                  <p className="text-sm text-text-secondary leading-relaxed">GitHub Action that scans every PR and comments results. Block merges on critical vulnerabilities.</p>
                </div>
              </div>
            </div>
          </section>
        </ScrollReveal>

        {/* ── Comparison table ── */}
        <ScrollReveal delay={100}>
          <section className="bg-bg-surface/30 py-24 md:py-32">
            <div className="max-w-5xl mx-auto px-5 md:px-8">
              <h2 className="text-3xl md:text-4xl font-bold text-text-primary text-center mb-3">CodeShield vs. the alternatives</h2>
              <p className="text-text-secondary text-center mb-14">Honest comparison. We win where it matters for AI code.</p>

              <div className="overflow-x-auto rounded-xl border border-border">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border bg-bg-elevated/50">
                      <th className="text-left py-4 pl-6 pr-4 text-text-dim font-medium w-[200px]">Feature</th>
                      <th className="py-4 px-4 text-center font-semibold text-green bg-green/[0.05] min-w-[110px]">CodeShield</th>
                      <th className="py-4 px-4 text-center text-text-secondary font-medium min-w-[100px]">Snyk</th>
                      <th className="py-4 px-4 text-center text-text-secondary font-medium min-w-[100px]">GitHub GHAS</th>
                      <th className="py-4 px-4 text-center text-text-secondary font-medium pr-6 min-w-[100px]">SonarCloud</th>
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
                    ].map((row, ri) => {
                      const vals = [row.cs, row.snyk, row.gh, row.sonar];
                      return (
                        <tr key={row.feature} className={ri % 2 === 0 ? "bg-transparent" : "bg-bg-surface/40"}>
                          <td className="py-3.5 pl-6 pr-4 text-text-primary font-medium">{row.feature}</td>
                          {vals.map((val, i) => (
                            <td key={i} className={`py-3.5 px-4 text-center ${i === 0 ? "bg-green/[0.03]" : ""} ${i === 3 ? "pr-6" : ""}`}>
                              {val === "full" ? (
                                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={i === 0 ? "#00E87B" : "#94A3B8"} strokeWidth="2.5" strokeLinecap="round" className="mx-auto"><polyline points="20 6 9 17 4 12" /></svg>
                              ) : val === "partial" ? (
                                <span className="text-orange font-mono">~</span>
                              ) : val === "no" ? (
                                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#64748B" strokeWidth="2" strokeLinecap="round" className="mx-auto"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>
                              ) : (
                                <span className="text-text-dim font-mono text-xs">{val}</span>
                              )}
                            </td>
                          ))}
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </section>
        </ScrollReveal>

        {/* ── Pricing preview ── */}
        <ScrollReveal delay={100}>
          <section className="py-24 md:py-32">
            <div className="max-w-5xl mx-auto px-5 md:px-8">
              <h2 className="text-3xl md:text-4xl font-bold text-text-primary text-center mb-3">Start free. Scale when ready.</h2>
              <p className="text-text-secondary text-center mb-14">Only active committers are billed.</p>

              <div className="grid md:grid-cols-3 gap-5 max-w-4xl mx-auto">
                {/* Free */}
                <div className="card p-7">
                  <h3 className="font-semibold text-text-primary mb-1">Free</h3>
                  <div className="text-3xl font-bold text-text-primary mb-6">$0</div>
                  <ul className="space-y-3 text-sm text-text-secondary">
                    {["5 repos, 10 scans/month", "Full vulnerability scanning", "PQC crypto discovery", "Secrets detection"].map((f) => (
                      <li key={f} className="flex items-start gap-2.5">
                        <Check />
                        <span>{f}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Team — highlighted */}
                <div className="card p-7 border-green/40 relative glow-green">
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-0.5 bg-green text-bg-primary text-[10px] font-bold rounded-full uppercase tracking-wider">
                    Most Popular
                  </div>
                  <h3 className="font-semibold text-text-primary mb-1">Team</h3>
                  <div className="text-3xl font-bold text-text-primary mb-6">
                    $29<span className="text-base font-normal text-text-dim">/dev/mo</span>
                  </div>
                  <ul className="space-y-3 text-sm text-text-secondary">
                    {["Unlimited scans", "AI auto-fix with Claude", "PQC migration + CBOM", "CI/CD integration"].map((f) => (
                      <li key={f} className="flex items-start gap-2.5">
                        <Check />
                        <span>{f}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Business */}
                <div className="card p-7">
                  <h3 className="font-semibold text-text-primary mb-1">Business</h3>
                  <div className="text-3xl font-bold text-text-primary mb-6">
                    $79<span className="text-base font-normal text-text-dim">/dev/mo</span>
                  </div>
                  <ul className="space-y-3 text-sm text-text-secondary">
                    {["SSO / SAML", "Compliance reports", "SBOM + custom rules", "Dedicated support"].map((f) => (
                      <li key={f} className="flex items-start gap-2.5">
                        <Check />
                        <span>{f}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              <div className="text-center mt-10">
                <a href="/pricing" className="text-green text-sm font-medium hover:underline transition-colors">
                  Compare all plans &amp; Enterprise pricing &rarr;
                </a>
              </div>
            </div>
          </section>
        </ScrollReveal>

        {/* ── Social proof quotes ── */}
        <ScrollReveal delay={120}>
          <section className="bg-bg-surface/30 py-24 md:py-32">
            <div className="max-w-5xl mx-auto px-5 md:px-8">
              <div className="grid md:grid-cols-2 gap-6">
                <div className="card p-8 border-l-2 border-l-green">
                  <blockquote className="text-text-secondary leading-relaxed mb-6">
                    &ldquo;Nearly half of all code changes scanned in our study contained a security flaw. AI code assistants produced insecure output in similar proportions to human developers &mdash; and far more volume.&rdquo;
                  </blockquote>
                  <div>
                    <p className="text-sm font-semibold text-text-primary">Veracode</p>
                    <p className="text-xs text-text-dim">State of Software Security Report, 2025</p>
                  </div>
                </div>

                <div className="card p-8 border-l-2 border-l-blue">
                  <blockquote className="text-text-secondary leading-relaxed mb-6">
                    &ldquo;The global average cost of a data breach reached $4.88 million in 2024 &mdash; a 10% jump and the highest figure in the report&rsquo;s history.&rdquo;
                  </blockquote>
                  <div>
                    <p className="text-sm font-semibold text-text-primary">IBM Security</p>
                    <p className="text-xs text-text-dim">Cost of a Data Breach Report, 2024</p>
                  </div>
                </div>
              </div>
            </div>
          </section>
        </ScrollReveal>

        {/* ── Final CTA ── */}
        <ScrollReveal delay={80}>
          <section className="py-24 md:py-32">
            <div className="max-w-3xl mx-auto px-5 md:px-8">
              <div className="card p-10 md:p-16 text-center relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-green/[0.06] via-transparent to-blue/[0.04] pointer-events-none" />
                <div className="absolute inset-0 bg-gradient-to-t from-bg-primary/50 to-transparent pointer-events-none" />
                <div className="relative">
                  <h2 className="text-2xl md:text-3xl font-bold text-text-primary mb-4">
                    Start securing your AI code in 30 seconds
                  </h2>
                  <p className="text-text-secondary mb-10 max-w-md mx-auto">
                    No credit card required. Free forever plan includes 5 repos and 10 scans / month.
                  </p>
                  <div className="flex flex-col sm:flex-row gap-3 justify-center">
                    <Link
                      href="/scan-free"
                      className="btn-primary text-base px-8 py-4 hover:translate-y-[-2px] hover:shadow-lg hover:shadow-green/20 transition-all duration-200"
                    >
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" /></svg>
                      Scan without signup
                    </Link>
                    <button
                      onClick={() => signIn("github")}
                      className="btn-secondary text-base px-8 py-4 hover:translate-y-[-2px] transition-all duration-200"
                    >
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" /></svg>
                      Connect GitHub
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </section>
        </ScrollReveal>
      </main>

      <Footer />
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
