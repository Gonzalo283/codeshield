"use client";

import { use, useEffect, useState } from "react";
import { Severity } from "@/types";

// ── Types ──

interface ExecutiveSummary {
  totalVulnerabilities: number;
  criticalCount: number;
  pqcVulnerabilities: number;
  riskLevel: "CRITICAL" | "HIGH" | "MEDIUM" | "LOW";
  complianceStatus: "COMPLIANT" | "PARTIALLY_COMPLIANT" | "NON_COMPLIANT";
  estimatedRemediationHours: number;
}

interface CryptoInventoryItem {
  algorithm: string;
  locations: string[];
  status: string;
  replacement: string;
  priority: Severity;
}

interface ComplianceTimeline {
  nistDeadline: string;
  nsaDeadline: string;
  euDeadline: string;
  currentReadiness: string;
  estimatedMigrationMonths: number;
}

interface VulnerabilityBreakdown {
  byCategory: Record<string, number>;
  bySeverity: Record<string, number>;
}

interface Recommendation {
  priority: number;
  action: string;
  impact: string;
  effort: "Low" | "Medium" | "High";
}

interface Report {
  id: string;
  generatedAt: string;
  repo: string;
  filesScanned: number;
  executiveSummary: ExecutiveSummary;
  cryptographicInventory: CryptoInventoryItem[];
  complianceTimeline: ComplianceTimeline;
  vulnerabilityBreakdown: VulnerabilityBreakdown;
  recommendations: Recommendation[];
}

// ── Constants ──

const RISK_COLORS: Record<string, string> = {
  CRITICAL: "text-red",
  HIGH: "text-orange",
  MEDIUM: "text-blue",
  LOW: "text-green",
};

const RISK_BG: Record<string, string> = {
  CRITICAL: "bg-red/10 border-red/20",
  HIGH: "bg-orange/10 border-orange/20",
  MEDIUM: "bg-blue/10 border-blue/20",
  LOW: "bg-green/10 border-green/20",
};

const COMPLIANCE_LABELS: Record<string, { label: string; color: string }> = {
  COMPLIANT: { label: "Compliant", color: "text-green" },
  PARTIALLY_COMPLIANT: { label: "Partially Compliant", color: "text-orange" },
  NON_COMPLIANT: { label: "Non-Compliant", color: "text-red" },
};

const SEVERITY_COLORS: Record<string, string> = {
  critical: "bg-red",
  high: "bg-orange",
  medium: "bg-blue",
  low: "bg-text-dim",
};

const CATEGORY_LABELS: Record<string, string> = {
  pqc: "Post-Quantum Crypto",
  "weak-crypto": "Weak Cryptography",
  "sql-injection": "SQL Injection",
  xss: "Cross-Site Scripting",
  "code-injection": "Code Injection",
  cors: "CORS Misconfiguration",
  tls: "TLS/SSL Issues",
  secrets: "Exposed Secrets",
};

const CATEGORY_COLORS: Record<string, string> = {
  pqc: "bg-red",
  "weak-crypto": "bg-orange",
  "sql-injection": "bg-red",
  xss: "bg-orange",
  "code-injection": "bg-red",
  cors: "bg-blue",
  tls: "bg-orange",
  secrets: "bg-red",
};

const EFFORT_COLORS: Record<string, string> = {
  Low: "text-green",
  Medium: "text-orange",
  High: "text-red",
};

// ── Component ──

export default function ReportPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const [report, setReport] = useState<Report | null>(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);
  // Snapshot 'now' once at mount to keep render pure + stable
  const [now] = useState<number>(() => Date.now());

  useEffect(() => {
    try {
      const stored = sessionStorage.getItem(`report_${id}`);
      if (stored) {
        setReport(JSON.parse(stored));
      }
    } catch {
      // sessionStorage not available
    }
    setLoading(false);
  }, [id]);

  const handleDownloadPDF = () => {
    window.print();
  };

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-bg-primary">
        <div className="progress-bar w-48" />
      </div>
    );
  }

  if (!report) {
    return (
      <div className="min-h-screen bg-bg-primary">
        <nav className="sticky top-0 z-50 backdrop-blur-lg bg-bg-primary/80 border-b border-border print:hidden">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-14 flex items-center gap-3">
            <a href="/dashboard" className="flex items-center gap-2">
              <img src="/logo.svg" width={22} height={22} alt="CodeShield" />
              <span className="font-bold text-sm text-text-primary font-mono">CodeShield</span>
            </a>
          </div>
        </nav>
        <div className="flex flex-col items-center justify-center py-24 gap-4">
          <div className="w-12 h-12 rounded-2xl bg-red/10 flex items-center justify-center border border-red/20">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#F43F5E" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10" />
              <line x1="12" y1="8" x2="12" y2="12" />
              <line x1="12" y1="16" x2="12.01" y2="16" />
            </svg>
          </div>
          <p className="text-text-primary font-medium">Report not found</p>
          <p className="text-text-dim text-sm">This report may have expired or the link is invalid.</p>
          <a href="/dashboard" className="btn-secondary text-sm mt-2">Back to Dashboard</a>
        </div>
      </div>
    );
  }

  const summary = report.executiveSummary;
  const timeline = report.complianceTimeline;
  const breakdown = report.vulnerabilityBreakdown;
  const maxCategoryCount = Math.max(...Object.values(breakdown.byCategory), 1);
  const maxSeverityCount = Math.max(...Object.values(breakdown.bySeverity), 1);

  return (
    <>
      {/* Print styles */}
      <style>{`
        @media print {
          body { background: #fff !important; color: #111 !important; font-size: 11px !important; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
          .print\\:hidden { display: none !important; }
          .card { border: 1px solid #ddd !important; background: #fafafa !important; break-inside: avoid; }
          .print\\:text-black { color: #111 !important; }
          .print\\:bg-white { background: #fff !important; }
          .print\\:border-gray { border-color: #ddd !important; }
          .print\\:break-before { break-before: page; }
          @page { margin: 1.5cm; size: A4; }
        }
      `}</style>

      <div className="min-h-screen bg-bg-primary print:bg-white">
        {/* Navigation */}
        <nav className="sticky top-0 z-50 backdrop-blur-lg bg-bg-primary/80 border-b border-border print:hidden">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-14 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <a href="/dashboard" className="flex items-center gap-2">
                <img src="/logo.svg" width={22} height={22} alt="CodeShield" />
                <span className="font-bold text-sm text-text-primary font-mono hidden sm:inline">CodeShield</span>
              </a>
              <span className="text-text-dim text-sm">/</span>
              <span className="font-mono text-sm text-text-secondary">PQC Compliance Report</span>
            </div>
            <div className="flex items-center gap-2">
              <button onClick={handleShare} className="btn-secondary text-sm px-3 py-1.5">
                {copied ? "Copied!" : "Share Report"}
              </button>
              <button onClick={handleDownloadPDF} className="btn-primary text-sm px-3 py-1.5">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4" />
                  <polyline points="7 10 12 15 17 10" />
                  <line x1="12" y1="15" x2="12" y2="3" />
                </svg>
                Download PDF
              </button>
            </div>
          </div>
        </nav>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
          {/* ── Report Header ── */}
          <div className="mb-10">
            <div className="flex items-start justify-between flex-wrap gap-4 mb-6">
              <div>
                <p className="text-text-dim text-xs font-mono uppercase tracking-widest mb-2">PQC Compliance Report</p>
                <h1 className="text-2xl sm:text-3xl font-bold text-text-primary print:text-black mb-2">
                  {report.repo}
                </h1>
                <div className="flex items-center gap-4 text-sm text-text-dim">
                  <span className="font-mono">{report.id}</span>
                  <span>{new Date(report.generatedAt).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })}</span>
                  <span>{report.filesScanned.toLocaleString()} files scanned</span>
                </div>
              </div>
              <div className={`px-4 py-2 rounded-lg border font-mono text-sm font-semibold ${RISK_BG[summary.riskLevel]}`}>
                <span className={RISK_COLORS[summary.riskLevel]}>{summary.riskLevel} RISK</span>
              </div>
            </div>

            {/* Compliance status banner */}
            <div className={`card p-4 flex items-center justify-between flex-wrap gap-3 ${
              summary.complianceStatus === "COMPLIANT" ? "border-green/20" :
              summary.complianceStatus === "PARTIALLY_COMPLIANT" ? "border-orange/20" : "border-red/20"
            }`}>
              <div className="flex items-center gap-3">
                {summary.complianceStatus === "COMPLIANT" ? (
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#00E87B" strokeWidth="2.5" strokeLinecap="round"><polyline points="20 6 9 17 4 12"/></svg>
                ) : summary.complianceStatus === "PARTIALLY_COMPLIANT" ? (
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#F59E0B" strokeWidth="2.5" strokeLinecap="round"><path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
                ) : (
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#F43F5E" strokeWidth="2.5" strokeLinecap="round"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg>
                )}
                <div>
                  <span className={`text-sm font-semibold ${COMPLIANCE_LABELS[summary.complianceStatus].color}`}>
                    {COMPLIANCE_LABELS[summary.complianceStatus].label}
                  </span>
                  <span className="text-text-dim text-sm ml-2">
                    {summary.complianceStatus === "COMPLIANT"
                      ? "This repository meets current PQC migration requirements."
                      : summary.complianceStatus === "PARTIALLY_COMPLIANT"
                        ? "Some cryptographic components require migration to post-quantum algorithms."
                        : "Critical cryptographic vulnerabilities require immediate attention for PQC compliance."}
                  </span>
                </div>
              </div>
              <span className="text-xs font-mono text-text-dim">NIST SP 800-131A</span>
            </div>
          </div>

          {/* ── Section 1: Executive Summary ── */}
          <section className="mb-10">
            <h2 className="text-lg font-bold text-text-primary mb-4 flex items-center gap-2 print:text-black">
              <span className="text-xs font-mono text-text-dim bg-bg-elevated px-2 py-0.5 rounded print:bg-white">01</span>
              Executive Summary
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
              <div className="card p-4 text-center">
                <div className="text-2xl font-bold font-mono text-text-primary">{summary.totalVulnerabilities}</div>
                <div className="text-[11px] text-text-dim mt-1 uppercase tracking-wider">Total Issues</div>
              </div>
              <div className="card p-4 text-center">
                <div className="text-2xl font-bold font-mono text-red">{summary.criticalCount}</div>
                <div className="text-[11px] text-text-dim mt-1 uppercase tracking-wider">Critical</div>
              </div>
              <div className="card p-4 text-center">
                <div className="text-2xl font-bold font-mono text-orange">{summary.pqcVulnerabilities}</div>
                <div className="text-[11px] text-text-dim mt-1 uppercase tracking-wider">PQC Vulns</div>
              </div>
              <div className="card p-4 text-center">
                <div className={`text-2xl font-bold font-mono ${RISK_COLORS[summary.riskLevel]}`}>{summary.riskLevel}</div>
                <div className="text-[11px] text-text-dim mt-1 uppercase tracking-wider">Risk Level</div>
              </div>
              <div className="card p-4 text-center">
                <div className={`text-2xl font-bold font-mono ${COMPLIANCE_LABELS[summary.complianceStatus].color}`}>
                  {summary.complianceStatus === "COMPLIANT" ? "PASS" : summary.complianceStatus === "PARTIALLY_COMPLIANT" ? "PARTIAL" : "FAIL"}
                </div>
                <div className="text-[11px] text-text-dim mt-1 uppercase tracking-wider">Compliance</div>
              </div>
              <div className="card p-4 text-center">
                <div className="text-2xl font-bold font-mono text-blue">{summary.estimatedRemediationHours}h</div>
                <div className="text-[11px] text-text-dim mt-1 uppercase tracking-wider">Est. Remediation</div>
              </div>
            </div>
          </section>

          {/* ── Section 2: Cryptographic Inventory (CBOM) ── */}
          <section className="mb-10 print:break-before">
            <h2 className="text-lg font-bold text-text-primary mb-4 flex items-center gap-2 print:text-black">
              <span className="text-xs font-mono text-text-dim bg-bg-elevated px-2 py-0.5 rounded print:bg-white">02</span>
              Cryptographic Bill of Materials (CBOM)
            </h2>
            {report.cryptographicInventory.length > 0 ? (
              <div className="card overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-border bg-bg-elevated/50">
                        <th className="text-left px-4 py-3 text-[11px] text-text-dim uppercase tracking-wider font-medium">Algorithm</th>
                        <th className="text-left px-4 py-3 text-[11px] text-text-dim uppercase tracking-wider font-medium">Status</th>
                        <th className="text-left px-4 py-3 text-[11px] text-text-dim uppercase tracking-wider font-medium">PQC Replacement</th>
                        <th className="text-left px-4 py-3 text-[11px] text-text-dim uppercase tracking-wider font-medium">Priority</th>
                        <th className="text-left px-4 py-3 text-[11px] text-text-dim uppercase tracking-wider font-medium">Locations</th>
                      </tr>
                    </thead>
                    <tbody>
                      {report.cryptographicInventory.map((item, i) => (
                        <tr key={i} className="border-b border-border/50 hover:bg-bg-elevated/30 transition-colors">
                          <td className="px-4 py-3 font-mono font-semibold text-text-primary">{item.algorithm}</td>
                          <td className="px-4 py-3">
                            <span className={`text-xs font-mono px-2 py-0.5 rounded ${
                              item.status === "DEPRECATED_IMMEDIATELY"
                                ? "badge-critical"
                                : item.status === "DEPRECATED_BY_2030"
                                  ? "badge-high"
                                  : "badge-medium"
                            }`}>
                              {item.status.replace(/_/g, " ")}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-green font-mono text-xs">{item.replacement}</td>
                          <td className="px-4 py-3">
                            <span className={`badge-${item.priority} text-[10px] font-mono px-2 py-0.5 rounded font-semibold uppercase`}>
                              {item.priority}
                            </span>
                          </td>
                          <td className="px-4 py-3">
                            <div className="flex flex-col gap-0.5">
                              {item.locations.slice(0, 3).map((loc, j) => (
                                <span key={j} className="font-mono text-xs text-text-dim">{loc}</span>
                              ))}
                              {item.locations.length > 3 && (
                                <span className="text-xs text-text-dim">+{item.locations.length - 3} more</span>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            ) : (
              <div className="card p-8 text-center">
                <div className="w-10 h-10 rounded-xl bg-green/10 flex items-center justify-center border border-green/20 mx-auto mb-3">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#00E87B" strokeWidth="2.5" strokeLinecap="round"><polyline points="20 6 9 17 4 12"/></svg>
                </div>
                <p className="text-text-secondary text-sm">No deprecated cryptographic algorithms detected.</p>
              </div>
            )}
          </section>

          {/* ── Section 3: Compliance Timeline ── */}
          <section className="mb-10">
            <h2 className="text-lg font-bold text-text-primary mb-4 flex items-center gap-2 print:text-black">
              <span className="text-xs font-mono text-text-dim bg-bg-elevated px-2 py-0.5 rounded print:bg-white">03</span>
              Compliance Timeline
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Deadlines */}
              <div className="card p-6">
                <h3 className="text-sm font-semibold text-text-primary mb-4">Regulatory Deadlines</h3>
                <div className="space-y-4">
                  {[
                    { label: "NSA CNSA 2.0", deadline: timeline.nsaDeadline, desc: "All national security systems must use PQC", urgent: true },
                    { label: "NIST SP 800-131A", deadline: timeline.nistDeadline, desc: "Federal agencies must complete PQC migration" },
                    { label: "EU Crypto Regulation", deadline: timeline.euDeadline, desc: "European compliance framework deadline" },
                  ].map((item, i) => (
                    <div key={i} className="flex items-start gap-3">
                      <div className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 text-sm font-bold font-mono ${
                        item.urgent ? "bg-red/10 text-red border border-red/20" : "bg-orange/10 text-orange border border-orange/20"
                      }`}>
                        {item.deadline}
                      </div>
                      <div>
                        <p className="text-sm font-medium text-text-primary">{item.label}</p>
                        <p className="text-xs text-text-dim">{item.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Readiness */}
              <div className="card p-6">
                <h3 className="text-sm font-semibold text-text-primary mb-4">Migration Readiness</h3>
                <div className="space-y-5">
                  {/* Readiness gauge */}
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs text-text-dim uppercase tracking-wider">Current Readiness</span>
                      <span className={`text-lg font-bold font-mono ${
                        parseInt(timeline.currentReadiness) >= 80 ? "text-green" :
                        parseInt(timeline.currentReadiness) >= 50 ? "text-orange" : "text-red"
                      }`}>{timeline.currentReadiness}</span>
                    </div>
                    <div className="w-full h-2 bg-bg-primary rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-500 ${
                          parseInt(timeline.currentReadiness) >= 80 ? "bg-green" :
                          parseInt(timeline.currentReadiness) >= 50 ? "bg-orange" : "bg-red"
                        }`}
                        style={{ width: timeline.currentReadiness }}
                      />
                    </div>
                  </div>

                  {/* Migration estimate */}
                  <div className="flex items-center justify-between py-3 border-t border-border/50">
                    <span className="text-sm text-text-secondary">Estimated Migration Duration</span>
                    <span className="font-mono font-semibold text-text-primary">
                      {timeline.estimatedMigrationMonths === 0
                        ? "N/A"
                        : `${timeline.estimatedMigrationMonths} month${timeline.estimatedMigrationMonths > 1 ? "s" : ""}`
                      }
                    </span>
                  </div>

                  {/* Time remaining */}
                  <div className="flex items-center justify-between py-3 border-t border-border/50">
                    <span className="text-sm text-text-secondary">Time to NSA Deadline</span>
                    <span className="font-mono font-semibold text-orange">
                      {Math.max(0, Math.ceil((new Date("2027-12-31").getTime() - now) / (1000 * 60 * 60 * 24 * 30)))} months
                    </span>
                  </div>

                  <div className="flex items-center justify-between py-3 border-t border-border/50">
                    <span className="text-sm text-text-secondary">Time to NIST Deadline</span>
                    <span className="font-mono font-semibold text-text-primary">
                      {Math.max(0, Math.ceil((new Date("2030-12-31").getTime() - now) / (1000 * 60 * 60 * 24 * 30)))} months
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* ── Section 4: Vulnerability Breakdown ── */}
          <section className="mb-10 print:break-before">
            <h2 className="text-lg font-bold text-text-primary mb-4 flex items-center gap-2 print:text-black">
              <span className="text-xs font-mono text-text-dim bg-bg-elevated px-2 py-0.5 rounded print:bg-white">04</span>
              Vulnerability Breakdown
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* By Severity */}
              <div className="card p-6">
                <h3 className="text-sm font-semibold text-text-primary mb-4">By Severity</h3>
                <div className="space-y-3">
                  {(["critical", "high", "medium", "low"] as const).map((sev) => {
                    const count = breakdown.bySeverity[sev] || 0;
                    const pct = maxSeverityCount > 0 ? (count / maxSeverityCount) * 100 : 0;
                    return (
                      <div key={sev}>
                        <div className="flex items-center justify-between mb-1.5">
                          <span className="text-xs font-medium uppercase tracking-wider text-text-secondary">{sev}</span>
                          <span className="font-mono text-sm font-semibold text-text-primary">{count}</span>
                        </div>
                        <div className="w-full h-2 bg-bg-primary rounded-full overflow-hidden">
                          <div
                            className={`h-full rounded-full transition-all duration-700 ${SEVERITY_COLORS[sev]}`}
                            style={{ width: `${pct}%` }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* By Category */}
              <div className="card p-6">
                <h3 className="text-sm font-semibold text-text-primary mb-4">By Category</h3>
                <div className="space-y-3">
                  {Object.entries(breakdown.byCategory)
                    .sort(([, a], [, b]) => b - a)
                    .map(([cat, count]) => {
                      const pct = maxCategoryCount > 0 ? (count / maxCategoryCount) * 100 : 0;
                      return (
                        <div key={cat}>
                          <div className="flex items-center justify-between mb-1.5">
                            <span className="text-xs font-medium text-text-secondary">{CATEGORY_LABELS[cat] || cat}</span>
                            <span className="font-mono text-sm font-semibold text-text-primary">{count}</span>
                          </div>
                          <div className="w-full h-2 bg-bg-primary rounded-full overflow-hidden">
                            <div
                              className={`h-full rounded-full transition-all duration-700 ${CATEGORY_COLORS[cat] || "bg-blue"}`}
                              style={{ width: `${pct}%` }}
                            />
                          </div>
                        </div>
                      );
                    })}
                </div>
              </div>
            </div>
          </section>

          {/* ── Section 5: Recommendations ── */}
          <section className="mb-10">
            <h2 className="text-lg font-bold text-text-primary mb-4 flex items-center gap-2 print:text-black">
              <span className="text-xs font-mono text-text-dim bg-bg-elevated px-2 py-0.5 rounded print:bg-white">05</span>
              Remediation Recommendations
            </h2>
            {report.recommendations.length > 0 ? (
              <div className="space-y-3">
                {report.recommendations.map((rec) => (
                  <div key={rec.priority} className="card p-5 flex items-start gap-4">
                    <div className="w-8 h-8 rounded-lg bg-bg-elevated border border-border flex items-center justify-center shrink-0">
                      <span className="font-mono text-sm font-bold text-text-primary">{rec.priority}</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-text-primary mb-1">{rec.action}</p>
                      <p className="text-xs text-text-dim">{rec.impact}</p>
                    </div>
                    <div className={`shrink-0 text-xs font-mono font-semibold px-2 py-0.5 rounded ${EFFORT_COLORS[rec.effort]} bg-bg-elevated`}>
                      {rec.effort}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="card p-8 text-center">
                <p className="text-text-secondary text-sm">No immediate recommendations. Your repository is in good shape.</p>
              </div>
            )}
          </section>

          {/* ── Footer ── */}
          <footer className="border-t border-border pt-6 pb-12">
            <div className="flex items-center justify-between flex-wrap gap-4 text-xs text-text-dim">
              <div className="flex items-center gap-2">
                <img src="/logo.svg" width={16} height={16} alt="CodeShield" />
                <span className="font-mono">CodeShield.sh</span>
                <span>PQC Compliance Report</span>
              </div>
              <div className="flex items-center gap-4 font-mono">
                <span>{report.id}</span>
                <span>{new Date(report.generatedAt).toISOString().split("T")[0]}</span>
              </div>
            </div>
            <p className="text-[10px] text-text-dim mt-3 max-w-3xl">
              This report is generated by CodeShield.sh automated analysis tools. It provides an assessment of cryptographic
              posture and post-quantum readiness based on static code analysis. This report does not constitute legal advice
              and should be validated by qualified security professionals. Algorithm classifications are based on NIST SP 800-131A
              Rev 2, CNSA 2.0, and current NIST PQC standards (FIPS 203, 204, 205).
            </p>
          </footer>
        </div>
      </div>
    </>
  );
}
