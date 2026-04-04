"use client";

import { useState } from "react";
import Link from "next/link";
import { Vulnerability, Severity } from "@/types";

type ScanMode = "repo" | "code";

interface ScanResult {
  filesScanned: number;
  vulnerabilities: Vulnerability[];
  summary: { critical: number; high: number; medium: number; low: number; total: number };
  mode: string;
  limited?: boolean;
  owner?: string;
  repo?: string;
}

const LANGUAGE_OPTIONS = [
  { value: "ts", label: "TypeScript" },
  { value: "js", label: "JavaScript" },
  { value: "py", label: "Python" },
  { value: "go", label: "Go" },
  { value: "java", label: "Java" },
  { value: "rs", label: "Rust" },
  { value: "rb", label: "Ruby" },
  { value: "php", label: "PHP" },
];

const SEV_COLORS: Record<Severity, string> = {
  critical: "text-red",
  high: "text-orange",
  medium: "text-blue",
  low: "text-text-dim",
};

export default function ScanFreePage() {
  const [mode, setMode] = useState<ScanMode>("repo");
  const [repoUrl, setRepoUrl] = useState("");
  const [code, setCode] = useState("");
  const [language, setLanguage] = useState("ts");
  const [scanning, setScanning] = useState(false);
  const [scanPhase, setScanPhase] = useState("");
  const [result, setResult] = useState<ScanResult | null>(null);
  const [error, setError] = useState("");
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set());

  const toggleExpanded = (id: string) => {
    setExpandedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const handleScan = async () => {
    setError("");
    setResult(null);
    setScanning(true);
    setExpandedIds(new Set());

    const phases = mode === "repo"
      ? ["Connecting to GitHub...", "Fetching files...", "Scanning for vulnerabilities...", "Analyzing cryptography..."]
      : ["Parsing code...", "Scanning for vulnerabilities...", "Analyzing cryptography..."];

    let i = 0;
    setScanPhase(phases[0]);
    const interval = setInterval(() => {
      i++;
      if (i < phases.length) setScanPhase(phases[i]);
    }, 1500);

    try {
      const body = mode === "repo" ? { repoUrl } : { code, language };
      const res = await fetch("/api/scan-public", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Scan failed");
      } else {
        setResult(data);
        // Auto-expand first 3
        const autoExpand = new Set<string>();
        (data.vulnerabilities || []).slice(0, 3).forEach((v: Vulnerability) => autoExpand.add(v.id));
        setExpandedIds(autoExpand);
      }
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      clearInterval(interval);
      setScanning(false);
      setScanPhase("");
    }
  };

  return (
    <div className="min-h-screen bg-bg-primary">
      {/* Nav */}
      <nav className="sticky top-0 z-50 backdrop-blur-lg bg-bg-primary/80 border-b border-border">
        <div className="max-w-7xl mx-auto px-6 md:px-8 h-14 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5">
            <img src="/logo.svg" alt="CodeShield" width={24} height={24} />
            <span className="font-bold text-text-primary font-mono text-[15px]">CodeShield</span>
          </Link>
          <div className="flex items-center gap-4 text-sm">
            <Link href="/pricing" className="text-text-dim hover:text-text-secondary transition-colors hidden sm:block">Pricing</Link>
            <Link href="/dashboard" className="btn-primary text-sm px-4 py-2">
              Sign In with GitHub
            </Link>
          </div>
        </div>
      </nav>

      <div className="max-w-4xl mx-auto px-6 md:px-8 py-10 md:py-16">
        {/* Header */}
        <div className="text-center mb-10">
          <h1 className="text-3xl md:text-4xl font-bold text-text-primary mb-3">
            Free Security Scanner
          </h1>
          <p className="text-text-secondary max-w-lg mx-auto">
            Paste a public GitHub repo URL or your code. No login required.
            We detect OWASP vulnerabilities, leaked secrets, and quantum-unsafe crypto.
          </p>
        </div>

        {/* Mode toggle */}
        <div className="flex justify-center mb-6">
          <div className="inline-flex bg-bg-surface border border-border rounded-xl p-1">
            <button
              onClick={() => setMode("repo")}
              className={`px-5 py-2 text-sm font-medium rounded-lg transition-colors ${
                mode === "repo" ? "bg-bg-elevated text-text-primary" : "text-text-dim hover:text-text-secondary"
              }`}
            >
              GitHub Repo
            </button>
            <button
              onClick={() => setMode("code")}
              className={`px-5 py-2 text-sm font-medium rounded-lg transition-colors ${
                mode === "code" ? "bg-bg-elevated text-text-primary" : "text-text-dim hover:text-text-secondary"
              }`}
            >
              Paste Code
            </button>
          </div>
        </div>

        {/* Input */}
        <div className="bg-bg-surface border border-border rounded-2xl p-6 mb-8">
          {mode === "repo" ? (
            <div>
              <label className="block text-xs font-semibold text-text-dim uppercase tracking-wider mb-2">
                Public GitHub Repository URL
              </label>
              <input
                type="text"
                value={repoUrl}
                onChange={(e) => setRepoUrl(e.target.value)}
                placeholder="https://github.com/owner/repo"
                className="w-full px-4 py-3 bg-bg-primary border border-border rounded-xl text-text-primary text-sm font-mono placeholder:text-text-dim focus:outline-none focus:border-green/40"
              />
              <p className="text-xs text-text-dim mt-2">Only public repos. Up to 100 files scanned. Private repos require sign-in.</p>
            </div>
          ) : (
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-xs font-semibold text-text-dim uppercase tracking-wider">
                  Paste Your Code
                </label>
                <select
                  value={language}
                  onChange={(e) => setLanguage(e.target.value)}
                  className="px-3 py-1 bg-bg-primary border border-border rounded-lg text-xs text-text-secondary focus:outline-none"
                >
                  {LANGUAGE_OPTIONS.map((l) => (
                    <option key={l.value} value={l.value}>{l.label}</option>
                  ))}
                </select>
              </div>
              <textarea
                value={code}
                onChange={(e) => setCode(e.target.value)}
                placeholder={`// Paste your code here...\nconst password = "admin123";\nconst query = "SELECT * FROM users WHERE id=" + userId;`}
                rows={12}
                className="w-full px-4 py-3 bg-bg-primary border border-border rounded-xl text-text-primary text-sm font-mono placeholder:text-text-dim focus:outline-none focus:border-green/40 resize-y"
              />
            </div>
          )}

          <button
            onClick={handleScan}
            disabled={scanning || (mode === "repo" ? !repoUrl : !code)}
            className="btn-primary w-full mt-4 py-3.5 text-base disabled:opacity-40"
          >
            {scanning ? (
              <span className="flex items-center gap-2">
                <span className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                {scanPhase}
              </span>
            ) : (
              <>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
                </svg>
                Scan for Vulnerabilities
              </>
            )}
          </button>
        </div>

        {/* Error */}
        {error && (
          <div className="bg-red/10 border border-red/20 rounded-xl p-4 mb-8 text-sm text-red">
            {error}
          </div>
        )}

        {/* Results */}
        {result && (
          <div>
            {/* Summary */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
              {(["critical", "high", "medium", "low"] as Severity[]).map((sev) => (
                <div key={sev} className="card p-4 text-center">
                  <div className={`text-2xl font-bold font-mono ${SEV_COLORS[sev]}`}>
                    {result.summary[sev]}
                  </div>
                  <div className="text-[10px] text-text-dim uppercase tracking-wider mt-1">{sev}</div>
                </div>
              ))}
            </div>

            <p className="text-sm text-text-secondary mb-6">
              <span className="font-mono text-text-primary">{result.filesScanned}</span> files scanned
              {" / "}
              <span className="font-mono text-text-primary">{result.summary.total}</span> issues found
              {result.limited && (
                <span className="text-orange"> (showing first 50 — sign in for full results)</span>
              )}
            </p>

            {/* Vulnerability list */}
            <div className="space-y-3 mb-10">
              {result.vulnerabilities.map((vuln) => {
                const isExpanded = expandedIds.has(vuln.id);
                return (
                  <div key={vuln.id} className="card overflow-hidden">
                    <button
                      onClick={() => toggleExpanded(vuln.id)}
                      className="w-full px-5 py-4 flex items-center justify-between gap-4 text-left hover:bg-bg-elevated/50 transition-colors"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <span className={`badge-${vuln.severity} text-[10px] font-mono px-2 py-0.5 rounded font-semibold uppercase shrink-0`}>
                          {vuln.severity}
                        </span>
                        <div className="min-w-0">
                          <span className="text-sm font-medium text-text-primary block truncate">{vuln.title}</span>
                          <span className="text-xs font-mono text-text-dim">{vuln.file}:{vuln.line}</span>
                        </div>
                      </div>
                      <svg
                        width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"
                        className={`text-text-dim transition-transform shrink-0 ${isExpanded ? "rotate-180" : ""}`}
                      >
                        <polyline points="6 9 12 15 18 9"/>
                      </svg>
                    </button>

                    {isExpanded && (
                      <div className="px-5 pb-5 border-t border-border pt-4">
                        <p className="text-sm text-text-secondary mb-3">{vuln.description}</p>
                        <div className="code-block text-red/70 mb-3">
                          <code>{vuln.matchedCode}</code>
                        </div>
                        <div className="code-block text-green/70 mb-4">
                          <div className="text-[11px] text-text-dim mb-1">Suggested fix:</div>
                          <code>{vuln.suggestedFix}</code>
                        </div>
                        <div className="flex items-center gap-3">
                          <Link href="/dashboard" className="btn-primary text-sm px-4 py-2">
                            Auto-Fix with AI
                          </Link>
                          <span className="text-xs text-text-dim">Requires free account</span>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Upsell CTA */}
            <div className="card p-8 text-center relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-green/5 via-transparent to-blue/5 pointer-events-none" />
              <div className="relative">
                <h3 className="text-xl font-bold text-text-primary mb-2">
                  {result.summary.total > 0
                    ? `Found ${result.summary.total} vulnerabilities. Want to fix them automatically?`
                    : "Your code looks clean. Want to scan private repos too?"}
                </h3>
                <p className="text-text-secondary text-sm mb-6 max-w-md mx-auto">
                  Sign in with GitHub to get AI-powered auto-fix, scan private repos, and monitor all your repositories continuously.
                </p>
                <Link href="/dashboard" className="btn-primary text-base px-8 py-3.5">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/></svg>
                  Connect GitHub — Free
                </Link>
              </div>
            </div>
          </div>
        )}

        {/* No results yet — show examples */}
        {!result && !scanning && (
          <div className="text-center text-text-dim text-sm mt-8">
            <p className="mb-4">Try scanning a popular open-source repo:</p>
            <div className="flex flex-wrap justify-center gap-2">
              {[
                "https://github.com/expressjs/express",
                "https://github.com/pallets/flask",
                "https://github.com/gin-gonic/gin",
              ].map((url) => (
                <button
                  key={url}
                  onClick={() => { setRepoUrl(url); setMode("repo"); }}
                  className="px-3 py-1.5 bg-bg-surface border border-border rounded-lg text-xs font-mono hover:border-border-light transition-colors"
                >
                  {url.replace("https://github.com/", "")}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
