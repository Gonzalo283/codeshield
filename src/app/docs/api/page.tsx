import type { Metadata } from "next";
import Link from "next/link";
import { Nav } from "@/components/nav";
import { Footer } from "@/components/footer";

export const metadata: Metadata = {
  title: "API Reference",
  description:
    "Complete API reference for CodeShield.sh — authenticate, scan code, and integrate with CI/CD.",
  alternates: { canonical: "/docs/api" },
};

const BASE = "https://codeshield.sh/api/v1";

export default function ApiDocsPage() {
  return (
    <div className="min-h-screen flex flex-col bg-bg-primary">
      <Nav />
      <main className="flex-1">
        <div className="max-w-4xl mx-auto px-6 md:px-8 py-16 md:py-24">
          <header className="mb-12">
            <div className="text-xs font-mono uppercase tracking-[0.2em] text-text-dim mb-2">
              API Reference
            </div>
            <h1 className="text-4xl md:text-5xl font-bold text-text-primary mb-4">
              CodeShield API v1
            </h1>
            <p className="text-text-secondary text-lg leading-relaxed">
              A single REST endpoint to scan code for vulnerabilities. Designed
              for CI/CD pipelines, editors, and security tooling.
            </p>
            <div className="mt-5 flex flex-wrap gap-3">
              <a
                href="/api/openapi"
                className="btn-secondary text-sm px-4 py-2"
                target="_blank"
                rel="noreferrer"
              >
                Download OpenAPI spec
              </a>
              <Link href="/settings" className="btn-primary text-sm px-4 py-2">
                Get an API key
              </Link>
            </div>
          </header>

          <div className="space-y-12 text-text-secondary leading-relaxed">
            <section>
              <h2 className="text-xl font-semibold text-text-primary mb-3">Base URL</h2>
              <pre className="bg-bg-surface border border-border rounded-lg p-4 text-sm font-mono overflow-x-auto">
                <code>{BASE}</code>
              </pre>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-text-primary mb-3">Authentication</h2>
              <p className="mb-3">
                All requests require a bearer token. Generate one at{" "}
                <Link href="/settings" className="text-green hover:underline">
                  /settings
                </Link>
                .
              </p>
              <pre className="bg-bg-surface border border-border rounded-lg p-4 text-sm font-mono overflow-x-auto">
                <code>{`Authorization: Bearer cs_live_XXXXXXXXXXXX`}</code>
              </pre>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-text-primary mb-3">Rate limits &amp; quotas</h2>
              <ul className="list-disc pl-6 space-y-1.5">
                <li><strong className="text-text-primary">60 requests / minute</strong> per IP.</li>
                <li><strong className="text-text-primary">Free:</strong> 10 scans / month · 100 files / scan.</li>
                <li><strong className="text-text-primary">Team:</strong> unlimited scans · 100 files / scan.</li>
                <li><strong className="text-text-primary">Business:</strong> unlimited scans · 200 files / scan.</li>
                <li><strong className="text-text-primary">Enterprise:</strong> unlimited · 500 files / scan.</li>
              </ul>
              <p className="mt-3">
                Quota resets on the 1st of each month. When exceeded we return
                HTTP <code className="px-1.5 py-0.5 rounded bg-bg-elevated">429</code>.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-text-primary mb-3">
                POST <code className="font-mono text-green">/scan</code>
              </h2>
              <p className="mb-4">Scan either a code snippet or a public GitHub repo.</p>

              <h3 className="text-text-primary font-semibold mb-2 mt-6">Scan a snippet</h3>
              <pre className="bg-bg-surface border border-border rounded-lg p-4 text-sm font-mono overflow-x-auto whitespace-pre">
{`curl -X POST ${BASE}/scan \\
  -H "Authorization: Bearer cs_live_XXXX" \\
  -H "Content-Type: application/json" \\
  -d '{"code": "eval(req.body.payload)", "language": "js"}'`}
              </pre>

              <h3 className="text-text-primary font-semibold mb-2 mt-6">Scan a GitHub repo</h3>
              <pre className="bg-bg-surface border border-border rounded-lg p-4 text-sm font-mono overflow-x-auto whitespace-pre">
{`curl -X POST ${BASE}/scan \\
  -H "Authorization: Bearer cs_live_XXXX" \\
  -H "Content-Type: application/json" \\
  -d '{"repo": "https://github.com/expressjs/express"}'`}
              </pre>

              <h3 className="text-text-primary font-semibold mb-2 mt-6">Response 200</h3>
              <pre className="bg-bg-surface border border-border rounded-lg p-4 text-sm font-mono overflow-x-auto whitespace-pre">
{`{
  "success": true,
  "scan": {
    "filesScanned": 42,
    "vulnerabilities": [
      {
        "file": "src/auth.ts",
        "line": 128,
        "severity": "critical",
        "type": "code-injection",
        "cwe": "CWE-94",
        "message": "Use of eval() with user input"
      }
    ],
    "summary": { "critical": 1, "high": 0, "medium": 2, "low": 0, "total": 3 },
    "scannedAt": "2026-04-13T13:50:01.234Z"
  },
  "usage": { "plan": "growth", "scansRemaining": 849 }
}`}
              </pre>

              <h3 className="text-text-primary font-semibold mb-2 mt-6">Error responses</h3>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border text-left">
                      <th className="text-text-primary py-2 pr-4 font-semibold">Status</th>
                      <th className="text-text-primary py-2 pr-4 font-semibold">Error code</th>
                      <th className="text-text-primary py-2 font-semibold">Meaning</th>
                    </tr>
                  </thead>
                  <tbody className="font-mono text-xs">
                    <tr className="border-b border-border/50"><td className="py-2 pr-4">400</td><td className="py-2 pr-4">invalid_input</td><td className="py-2">Missing or malformed fields.</td></tr>
                    <tr className="border-b border-border/50"><td className="py-2 pr-4">401</td><td className="py-2 pr-4">missing_api_key</td><td className="py-2">No Authorization header.</td></tr>
                    <tr className="border-b border-border/50"><td className="py-2 pr-4">401</td><td className="py-2 pr-4">invalid_api_key</td><td className="py-2">Key unknown or revoked.</td></tr>
                    <tr className="border-b border-border/50"><td className="py-2 pr-4">403</td><td className="py-2 pr-4">private_repo</td><td className="py-2">Use the dashboard for private repos.</td></tr>
                    <tr className="border-b border-border/50"><td className="py-2 pr-4">404</td><td className="py-2 pr-4">repo_not_found</td><td className="py-2">Repo missing or private.</td></tr>
                    <tr className="border-b border-border/50"><td className="py-2 pr-4">429</td><td className="py-2 pr-4">rate_limit</td><td className="py-2">IP rate limit hit.</td></tr>
                    <tr><td className="py-2 pr-4">429</td><td className="py-2 pr-4">quota_exceeded</td><td className="py-2">Monthly scans exhausted.</td></tr>
                  </tbody>
                </table>
              </div>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-text-primary mb-3">SDK examples</h2>
              <h3 className="text-text-primary font-semibold mb-2 mt-4">Node.js</h3>
              <pre className="bg-bg-surface border border-border rounded-lg p-4 text-sm font-mono overflow-x-auto whitespace-pre">
{`const res = await fetch("${BASE}/scan", {
  method: "POST",
  headers: {
    Authorization: \`Bearer \${process.env.CODESHIELD_API_KEY}\`,
    "Content-Type": "application/json",
  },
  body: JSON.stringify({ repo: "https://github.com/owner/repo" }),
});
const { scan } = await res.json();
if (scan.summary.critical > 0) process.exit(1);`}
              </pre>

              <h3 className="text-text-primary font-semibold mb-2 mt-6">Python</h3>
              <pre className="bg-bg-surface border border-border rounded-lg p-4 text-sm font-mono overflow-x-auto whitespace-pre">
{`import os, requests
r = requests.post("${BASE}/scan",
  headers={"Authorization": f"Bearer {os.environ['CODESHIELD_API_KEY']}"},
  json={"repo": "https://github.com/owner/repo"})
r.raise_for_status()
summary = r.json()["scan"]["summary"]
exit(1 if summary["critical"] else 0)`}
              </pre>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-text-primary mb-3">Webhooks</h2>
              <p>
                Auto-scan on every push or pull request — see the{" "}
                <Link href="/docs#github-action" className="text-green hover:underline">
                  GitHub Action guide
                </Link>
                .
              </p>
            </section>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
