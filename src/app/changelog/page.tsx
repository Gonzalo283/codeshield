import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Changelog",
  description: "What's new in CodeShield.ai. Release notes, new features, and improvements.",
};

const releases = [
  {
    version: "1.2.0",
    date: "2026-04-01",
    title: "Expanded PQC Scanner + Blog Launch",
    changes: [
      { type: "new" as const, text: "27 new cryptographic vulnerability patterns including AES-128, 3DES, RC4, Blowfish, and language-specific detections for Python, Go, and Java" },
      { type: "new" as const, text: "Blog with 5 in-depth security articles covering AI code security, PQC migration, OWASP, and more" },
      { type: "new" as const, text: "Programmatic SEO pages for 8 languages and 6 vulnerability types" },
      { type: "new" as const, text: "GitHub Action for automated PR scanning with inline comments" },
      { type: "improved" as const, text: "Homepage redesigned with PQC-first positioning and interactive terminal demo" },
      { type: "improved" as const, text: "Dashboard with skeleton loading, empty states, and progressive scan feedback" },
    ],
  },
  {
    version: "1.1.0",
    date: "2026-03-25",
    title: "Stripe Integration + Account Management",
    changes: [
      { type: "new" as const, text: "Stripe checkout for Team ($29/dev/mo) and Business ($79/dev/mo) plans" },
      { type: "new" as const, text: "Account page with subscription management and billing portal" },
      { type: "new" as const, text: "Pricing page with 4 tiers including Enterprise" },
      { type: "new" as const, text: "Auth middleware (proxy) protecting dashboard and API routes" },
      { type: "improved" as const, text: "NextAuth type augmentation eliminating unsafe type casts" },
      { type: "improved" as const, text: "Security headers: HSTS, X-Frame-Options, Referrer-Policy" },
    ],
  },
  {
    version: "1.0.0",
    date: "2026-03-20",
    title: "Initial Launch",
    changes: [
      { type: "new" as const, text: "Vulnerability scanner with 22 patterns: PQC, OWASP Top 10, and secrets detection" },
      { type: "new" as const, text: "GitHub OAuth integration with read-only repo access" },
      { type: "new" as const, text: "AI auto-fix powered by Claude (claude-sonnet-4-20250514)" },
      { type: "new" as const, text: "Dashboard with repo listing, inline scan results, and detailed reports" },
      { type: "new" as const, text: "Dark cybersecurity theme with JetBrains Mono and Space Grotesk" },
      { type: "new" as const, text: "Deploy-ready for Vercel with full TypeScript strict mode" },
    ],
  },
];

const badgeStyles = {
  new: "bg-green/10 text-green border-green/20",
  improved: "bg-blue/10 text-blue border-blue/20",
  fixed: "bg-orange/10 text-orange border-orange/20",
};

export default function ChangelogPage() {
  return (
    <div className="min-h-screen bg-bg-primary">
      <nav className="sticky top-0 z-50 backdrop-blur-lg bg-bg-primary/80 border-b border-border">
        <div className="max-w-7xl mx-auto px-6 md:px-8 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5">
            <img src="/logo.svg" alt="CodeShield" width={24} height={24} />
            <span className="font-bold text-text-primary font-mono">CodeShield</span>
          </Link>
          <div className="flex items-center gap-6 text-sm">
            <Link href="/docs" className="text-text-dim hover:text-text-secondary transition-colors">Docs</Link>
            <Link href="/blog" className="text-text-dim hover:text-text-secondary transition-colors">Blog</Link>
          </div>
        </div>
      </nav>

      <div className="max-w-3xl mx-auto px-6 md:px-8 py-12 md:py-20">
        <h1 className="text-3xl md:text-4xl font-bold text-text-primary mb-2">Changelog</h1>
        <p className="text-text-secondary mb-12">New features, improvements, and fixes.</p>

        <div className="relative">
          {/* Timeline line */}
          <div className="absolute left-[7px] top-2 bottom-0 w-px bg-border hidden md:block" />

          <div className="space-y-12">
            {releases.map((release) => (
              <div key={release.version} className="relative md:pl-10">
                {/* Timeline dot */}
                <div className="absolute left-0 top-2 w-[15px] h-[15px] rounded-full bg-green/20 border-2 border-green hidden md:flex items-center justify-center">
                  <div className="w-1.5 h-1.5 rounded-full bg-green" />
                </div>

                <div className="flex items-center gap-3 mb-4 flex-wrap">
                  <span className="text-sm font-mono font-semibold text-green bg-green/10 px-2.5 py-1 rounded-lg border border-green/20">
                    v{release.version}
                  </span>
                  <span className="text-sm text-text-dim">{release.date}</span>
                </div>

                <h2 className="text-xl font-bold text-text-primary mb-4">{release.title}</h2>

                <ul className="space-y-3">
                  {release.changes.map((change, i) => (
                    <li key={i} className="flex items-start gap-3">
                      <span className={`text-[10px] font-mono font-semibold uppercase px-1.5 py-0.5 rounded border shrink-0 mt-0.5 ${badgeStyles[change.type]}`}>
                        {change.type}
                      </span>
                      <span className="text-sm text-text-secondary leading-relaxed">{change.text}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
