import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Documentation",
  description: "Get started with CodeShield.ai. Learn how to scan repos, set up GitHub Actions, and use the API.",
};

const sections = [
  {
    id: "getting-started",
    title: "Getting Started",
    content: [
      {
        title: "1. Connect your GitHub account",
        body: "Click \"Get Started Free\" and authorize CodeShield with GitHub OAuth. We request read-only access to your repositories. Your code never leaves GitHub's servers — we fetch file contents via the GitHub API and scan them in memory.",
      },
      {
        title: "2. Scan a repository",
        body: "From the dashboard, click \"Scan\" on any repository. CodeShield will fetch all scannable files (.ts, .js, .py, .go, .java, .rs, and more), excluding node_modules, vendor, and dist directories. Files over 500KB are skipped.",
      },
      {
        title: "3. Review and fix",
        body: "Results are grouped by severity (Critical, High, Medium, Low). Each finding shows the vulnerable code, file location, and a suggested fix. On Team plan and above, click \"Auto-Fix\" to generate a secure replacement with AI.",
      },
    ],
  },
  {
    id: "github-action",
    title: "GitHub Action Setup",
    content: [
      {
        title: "Add to your workflow",
        body: "Create .github/workflows/codeshield.yml in your repository:",
        code: `name: CodeShield Security Scan
on:
  pull_request:
    types: [opened, synchronize]

permissions:
  contents: read
  pull-requests: write

jobs:
  scan:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: codeshield-ai/scan@v1
        with:
          fail-on-critical: true
        env:
          GITHUB_TOKEN: \${{ secrets.GITHUB_TOKEN }}`,
      },
      {
        title: "What it does",
        body: "The action scans every pull request for vulnerabilities and posts a comment with the results. If critical vulnerabilities are found, the check fails and blocks the merge (configurable).",
      },
    ],
  },
  {
    id: "api",
    title: "API Reference",
    content: [
      {
        title: "POST /api/scan",
        body: "Scan a repository for vulnerabilities.",
        code: `curl -X POST https://codeshield.ai/api/scan \\
  -H "Content-Type: application/json" \\
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \\
  -d '{
    "owner": "your-org",
    "repo": "your-repo",
    "accessToken": "github_pat_..."
  }'`,
      },
      {
        title: "POST /api/fix",
        body: "Generate an AI-powered fix for a vulnerability. Requires Team plan or above.",
        code: `curl -X POST https://codeshield.ai/api/fix \\
  -H "Content-Type: application/json" \\
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \\
  -d '{
    "vulnerability": {
      "id": "vuln-1",
      "file": "src/auth/crypto.ts",
      "line": 12,
      "severity": "critical",
      "category": "pqc",
      "title": "RSA Key Generation",
      "matchedCode": "generateKeyPair('rsa', ...)",
      "suggestedFix": "Migrate to ML-KEM"
    }
  }'`,
      },
    ],
  },
  {
    id: "faq",
    title: "FAQ",
    content: [
      {
        title: "Does CodeShield store my code?",
        body: "No. We fetch file contents via the GitHub API, scan them in memory, and discard them immediately. Nothing is persisted. Your code never leaves GitHub's infrastructure except transiently during the scan.",
      },
      {
        title: "What languages are supported?",
        body: "TypeScript, JavaScript, Python, Go, Java, Rust, Ruby, PHP, C/C++, C#, Kotlin, Swift, Scala, and shell scripts. We scan any text file with a recognized extension.",
      },
      {
        title: "How accurate is the scanner?",
        body: "CodeShield uses pattern-based detection (regex) optimized for AI-generated code patterns. This means fast scans with low false positives for common vulnerability patterns. We do not yet support cross-file taint analysis or semantic analysis — those are on the roadmap.",
      },
      {
        title: "What is Post-Quantum Cryptography (PQC)?",
        body: "PQC refers to cryptographic algorithms that are resistant to attacks by quantum computers. NIST finalized PQC standards in 2024 (ML-KEM, ML-DSA, SLH-DSA) and will deprecate RSA, ECDSA, and other current algorithms by 2030. CodeShield identifies quantum-vulnerable cryptography in your codebase.",
      },
    ],
  },
];

export default function DocsPage() {
  return (
    <div className="min-h-screen bg-bg-primary">
      <nav className="sticky top-0 z-50 backdrop-blur-lg bg-bg-primary/80 border-b border-border">
        <div className="max-w-7xl mx-auto px-6 md:px-8 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5">
            <img src="/logo.svg" alt="CodeShield" width={24} height={24} />
            <span className="font-bold text-text-primary font-mono">CodeShield</span>
          </Link>
          <div className="flex items-center gap-6 text-sm">
            <Link href="/pricing" className="text-text-dim hover:text-text-secondary transition-colors">Pricing</Link>
            <Link href="/blog" className="text-text-dim hover:text-text-secondary transition-colors">Blog</Link>
          </div>
        </div>
      </nav>

      <div className="max-w-4xl mx-auto px-6 md:px-8 py-12 md:py-20">
        <h1 className="text-3xl md:text-4xl font-bold text-text-primary mb-4">Documentation</h1>
        <p className="text-text-secondary mb-12">Everything you need to get started with CodeShield.ai.</p>

        {/* TOC */}
        <div className="bg-bg-surface border border-border rounded-xl p-6 mb-12">
          <h2 className="text-sm font-semibold text-text-dim uppercase tracking-wider mb-3">On this page</h2>
          <ul className="space-y-2">
            {sections.map((s) => (
              <li key={s.id}>
                <a href={`#${s.id}`} className="text-sm text-text-secondary hover:text-green transition-colors">{s.title}</a>
              </li>
            ))}
          </ul>
        </div>

        {/* Sections */}
        <div className="space-y-16">
          {sections.map((section) => (
            <section key={section.id} id={section.id}>
              <h2 className="text-2xl font-bold text-text-primary mb-8 pb-3 border-b border-border">{section.title}</h2>
              <div className="space-y-8">
                {section.content.map((item, i) => (
                  <div key={i}>
                    <h3 className="text-lg font-semibold text-text-primary mb-2">{item.title}</h3>
                    <p className="text-text-secondary text-sm leading-relaxed mb-3">{item.body}</p>
                    {"code" in item && item.code && (
                      <pre className="code-block text-text-secondary text-xs"><code>{item.code}</code></pre>
                    )}
                  </div>
                ))}
              </div>
            </section>
          ))}
        </div>
      </div>
    </div>
  );
}
