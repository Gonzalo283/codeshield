"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState, use } from "react";
import { ScanResult, Vulnerability, AutoFixResult, Severity, Category } from "@/types";

const SEVERITY_ORDER: Severity[] = ["critical", "high", "medium", "low"];
const CATEGORY_LABELS: Record<Category, string> = {
  pqc: "Post-Quantum Crypto",
  "weak-crypto": "Weak Cryptography",
  "sql-injection": "SQL Injection",
  xss: "Cross-Site Scripting",
  "code-injection": "Code Injection",
  cors: "CORS Misconfiguration",
  tls: "TLS/SSL Issues",
  secrets: "Exposed Secrets",
};

const SEV_COLORS: Record<Severity, string> = {
  critical: "text-red",
  high: "text-orange",
  medium: "text-blue",
  low: "text-text-dim",
};

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);
  const handleCopy = () => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };
  return (
    <button
      onClick={handleCopy}
      className="text-[11px] text-text-dim hover:text-text-secondary transition-colors font-mono"
      aria-label="Copy code"
    >
      {copied ? "Copied" : "Copy"}
    </button>
  );
}

export default function RepoReportPage({
  params,
}: {
  params: Promise<{ repo: string }>;
}) {
  const { repo: repoSlug } = use(params);
  const { data: session, status } = useSession();
  const router = useRouter();
  const [scanResult, setScanResult] = useState<ScanResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [scanPhase, setScanPhase] = useState("Fetching files...");
  const [severityFilter, setSeverityFilter] = useState<Severity | "all">("all");
  const [categoryFilter, setCategoryFilter] = useState<Category | "all">("all");
  const [fixingId, setFixingId] = useState<string | null>(null);
  const [fixes, setFixes] = useState<Record<string, AutoFixResult>>({});
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set());

  const accessToken = session?.accessToken;
  const [owner, repoName] = repoSlug.split("__");

  const toggleExpanded = (id: string) => {
    setExpandedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/");
      return;
    }

    if (status === "authenticated" && accessToken && owner && repoName) {
      // Scan phase animation
      const phases = ["Fetching files...", "Scanning for vulnerabilities...", "Analyzing cryptography...", "Generating report..."];
      let i = 0;
      const interval = setInterval(() => {
        i++;
        if (i < phases.length) setScanPhase(phases[i]);
      }, 2000);

      fetch("/api/scan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ owner, repo: repoName, accessToken }),
      })
        .then((res) => res.json())
        .then((data) => {
          setScanResult(data);
          // Auto-expand first 3 critical/high vulns
          const autoExpand = new Set<string>();
          (data.vulnerabilities || [])
            .filter((v: Vulnerability) => v.severity === "critical" || v.severity === "high")
            .slice(0, 3)
            .forEach((v: Vulnerability) => autoExpand.add(v.id));
          setExpandedIds(autoExpand);
        })
        .catch(console.error)
        .finally(() => {
          clearInterval(interval);
          setLoading(false);
        });

      return () => clearInterval(interval);
    }
  }, [status, accessToken, owner, repoName, router]);

  const handleAutoFix = async (vuln: Vulnerability) => {
    setFixingId(vuln.id);
    try {
      const res = await fetch("/api/fix", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ vulnerability: vuln }),
      });
      const result: AutoFixResult = await res.json();
      setFixes((prev) => ({ ...prev, [vuln.id]: result }));
    } catch {
      setFixes((prev) => ({
        ...prev,
        [vuln.id]: { fixedCode: "", explanation: "Failed to generate fix.", success: false },
      }));
    } finally {
      setFixingId(null);
    }
  };

  const filteredVulns = scanResult?.vulnerabilities.filter((v) => {
    if (severityFilter !== "all" && v.severity !== severityFilter) return false;
    if (categoryFilter !== "all" && v.category !== categoryFilter) return false;
    return true;
  });

  if (status === "loading" || status === "unauthenticated") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-bg-primary">
        <div className="progress-bar w-48" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-bg-primary">
      {/* Nav */}
      <nav className="sticky top-0 z-50 backdrop-blur-lg bg-bg-primary/80 border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-14 flex items-center gap-4">
          <button
            onClick={() => router.push("/dashboard")}
            className="text-text-dim hover:text-text-secondary transition-colors"
            aria-label="Back to dashboard"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M19 12H5"/><polyline points="12 19 5 12 12 5"/>
            </svg>
          </button>
          <a href="/dashboard" className="flex items-center gap-2">
            <img src="/logo.svg" width={22} height={22} alt="CodeShield" />
            <span className="font-bold text-sm text-text-primary font-mono hidden sm:inline">CodeShield</span>
          </a>
          <span className="text-text-dim text-sm">/</span>
          <span className="font-mono text-sm text-text-secondary truncate">{owner}/{repoName}</span>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-24 gap-6">
            <div className="w-12 h-12 rounded-2xl bg-green/10 flex items-center justify-center border border-green/20">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#00E87B" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
              </svg>
            </div>
            <div className="text-center">
              <p className="text-text-primary font-medium mb-1">{scanPhase}</p>
              <p className="text-text-dim text-sm">This may take a moment for large repositories</p>
            </div>
            <div className="progress-bar w-64" />
          </div>
        ) : scanResult ? (
          <>
            {/* Summary cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-8">
              {SEVERITY_ORDER.map((sev) => (
                <button
                  key={sev}
                  onClick={() => setSeverityFilter(severityFilter === sev ? "all" : sev)}
                  className={`card p-4 text-center cursor-pointer transition-all ${
                    severityFilter === sev ? "border-border-light bg-bg-elevated" : ""
                  }`}
                >
                  <div className={`text-3xl font-bold font-mono ${SEV_COLORS[sev]}`}>
                    {scanResult.summary[sev]}
                  </div>
                  <div className="text-[11px] text-text-dim mt-1 uppercase tracking-wider font-medium">{sev}</div>
                </button>
              ))}
            </div>

            {/* Info + filters bar */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 gap-4">
              <p className="text-sm text-text-secondary">
                <span className="font-mono text-text-primary">{scanResult.filesScanned}</span> files
                {" / "}
                <span className="font-mono text-text-primary">{scanResult.summary.total}</span> issues
                {" / "}
                <span className="text-text-dim">{new Date(scanResult.scannedAt).toLocaleString()}</span>
              </p>
              <div className="flex gap-2 w-full sm:w-auto">
                <select
                  value={severityFilter}
                  onChange={(e) => setSeverityFilter(e.target.value as Severity | "all")}
                  className="flex-1 sm:flex-none px-3 py-1.5 bg-bg-surface border border-border rounded-lg text-sm text-text-primary focus:outline-none focus:border-green/40"
                >
                  <option value="all">All Severities</option>
                  {SEVERITY_ORDER.map((s) => (
                    <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>
                  ))}
                </select>
                <select
                  value={categoryFilter}
                  onChange={(e) => setCategoryFilter(e.target.value as Category | "all")}
                  className="flex-1 sm:flex-none px-3 py-1.5 bg-bg-surface border border-border rounded-lg text-sm text-text-primary focus:outline-none focus:border-green/40"
                >
                  <option value="all">All Categories</option>
                  {Object.entries(CATEGORY_LABELS).map(([key, label]) => (
                    <option key={key} value={key}>{label}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Vulnerability list */}
            <div className="space-y-3">
              {filteredVulns && filteredVulns.length > 0 ? (
                filteredVulns.map((vuln) => {
                  const isExpanded = expandedIds.has(vuln.id);
                  return (
                    <div key={vuln.id} className="card overflow-hidden">
                      {/* Header — always visible, clickable */}
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
                        <div className="flex items-center gap-3 shrink-0">
                          <span className="text-[10px] font-mono text-text-dim px-2 py-0.5 bg-bg-primary rounded hidden sm:block">
                            {CATEGORY_LABELS[vuln.category]}
                          </span>
                          <svg
                            width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
                            className={`text-text-dim transition-transform ${isExpanded ? "rotate-180" : ""}`}
                          >
                            <polyline points="6 9 12 15 18 9"/>
                          </svg>
                        </div>
                      </button>

                      {/* Expanded content */}
                      {isExpanded && (
                        <div className="px-5 pb-5 border-t border-border pt-4">
                          <p className="text-sm text-text-secondary mb-4">{vuln.description}</p>

                          {/* Vulnerable code */}
                          <div className="mb-3">
                            <div className="flex items-center justify-between mb-1.5">
                              <span className="text-[11px] text-text-dim font-medium uppercase tracking-wider">Vulnerable code</span>
                              <CopyButton text={vuln.matchedCode} />
                            </div>
                            <div className="code-block text-red/70">
                              <code>{vuln.matchedCode}</code>
                            </div>
                          </div>

                          {/* Suggested fix */}
                          <div className="mb-4">
                            <div className="flex items-center justify-between mb-1.5">
                              <span className="text-[11px] text-text-dim font-medium uppercase tracking-wider">Suggested fix</span>
                              <CopyButton text={vuln.suggestedFix} />
                            </div>
                            <div className="code-block text-green/70">
                              <code>{vuln.suggestedFix}</code>
                            </div>
                          </div>

                          {/* Auto-fix button */}
                          {vuln.autoFixable && (
                            <button
                              onClick={() => handleAutoFix(vuln)}
                              disabled={fixingId === vuln.id}
                              className="btn-primary text-sm px-4 py-2 disabled:opacity-50"
                            >
                              {fixingId === vuln.id ? (
                                <span className="flex items-center gap-2">
                                  <span className="w-3.5 h-3.5 border-2 border-current border-t-transparent rounded-full animate-spin" />
                                  Generating fix...
                                </span>
                              ) : fixes[vuln.id] ? (
                                "Regenerate Fix"
                              ) : (
                                <>
                                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
                                  </svg>
                                  Auto-Fix with AI
                                </>
                              )}
                            </button>
                          )}

                          {/* AI Fix result */}
                          {fixes[vuln.id] && (
                            <div className="mt-4 bg-green/5 border border-green/15 rounded-xl p-5">
                              <div className="flex items-center justify-between mb-3">
                                <div className="flex items-center gap-2">
                                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#00E87B" strokeWidth="2.5" strokeLinecap="round"><polyline points="20 6 9 17 4 12"/></svg>
                                  <span className="text-sm font-semibold text-green">AI Auto-Fix</span>
                                </div>
                                {fixes[vuln.id].success && <CopyButton text={fixes[vuln.id].fixedCode} />}
                              </div>
                              {fixes[vuln.id].success && (
                                <div className="code-block text-green/80 mb-3">
                                  <code className="whitespace-pre-wrap">{fixes[vuln.id].fixedCode}</code>
                                </div>
                              )}
                              <p className="text-sm text-text-secondary">{fixes[vuln.id].explanation}</p>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })
              ) : (
                <div className="text-center py-20">
                  <div className="w-12 h-12 rounded-2xl bg-green/10 flex items-center justify-center border border-green/20 mx-auto mb-4">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#00E87B" strokeWidth="2" strokeLinecap="round"><polyline points="20 6 9 17 4 12"/></svg>
                  </div>
                  <p className="text-text-primary font-medium">
                    {scanResult.summary.total === 0 ? "No vulnerabilities found" : "No matches for current filters"}
                  </p>
                  <p className="text-text-dim text-sm mt-1">
                    {scanResult.summary.total === 0 ? "Your code looks secure. Nice work." : "Try adjusting your severity or category filters."}
                  </p>
                </div>
              )}
            </div>
          </>
        ) : (
          <div className="text-center py-24 text-text-dim">Failed to scan repository.</div>
        )}
      </div>
    </div>
  );
}
