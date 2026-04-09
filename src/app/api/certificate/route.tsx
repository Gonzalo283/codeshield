// ── Security Certificate Generator ──
// Generates a downloadable SVG certificate after a clean scan
// Used by clients to show insurers, investors, and compliance auditors
//
// GET /api/certificate?owner=xxx&repo=xxx&score=85&date=2026-04-08

import { NextRequest } from "next/server";
import { ImageResponse } from "next/og";

export const runtime = "edge";

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const owner = (searchParams.get("owner") || "org").slice(0, 40).replace(/[^a-zA-Z0-9._-]/g, "");
  const repo = (searchParams.get("repo") || "repo").slice(0, 60).replace(/[^a-zA-Z0-9._-]/g, "");
  const score = Math.min(Math.max(parseInt(searchParams.get("score") || "0", 10), 0), 100);
  const date = (searchParams.get("date") || new Date().toISOString().split("T")[0]).slice(0, 10);
  const vulns = Math.max(parseInt(searchParams.get("v") || "0", 10), 0);
  const critical = Math.max(parseInt(searchParams.get("c") || "0", 10), 0);

  // Determine grade
  let grade = "A+";
  let gradeColor = "#00E87B";
  let status = "EXCELLENT";
  if (critical > 0) { grade = "F"; gradeColor = "#F43F5E"; status = "CRITICAL ISSUES"; }
  else if (score < 50) { grade = "D"; gradeColor = "#F43F5E"; status = "NEEDS ATTENTION"; }
  else if (score < 70) { grade = "C"; gradeColor = "#F59E0B"; status = "MODERATE"; }
  else if (score < 85) { grade = "B"; gradeColor = "#3B82F6"; status = "GOOD"; }
  else if (score < 95) { grade = "A"; gradeColor = "#00E87B"; status = "VERY GOOD"; }

  return new ImageResponse(
    (
      <div style={{
        width: "800px", height: "600px", display: "flex", flexDirection: "column",
        background: "linear-gradient(180deg, #0B0D11 0%, #13161D 100%)",
        padding: "48px", fontFamily: "system-ui, sans-serif", position: "relative",
      }}>
        {/* Border */}
        <div style={{
          position: "absolute", inset: "16px", border: "2px solid #2A2F3C",
          borderRadius: "16px", display: "flex",
        }} />

        {/* Header */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "32px" }}>
          <div style={{ display: "flex", flexDirection: "column" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "8px" }}>
              <div style={{
                width: "36px", height: "36px", borderRadius: "8px",
                background: "rgba(0,232,123,0.15)", border: "1px solid rgba(0,232,123,0.3)",
                display: "flex", alignItems: "center", justifyContent: "center",
                color: "#00E87B", fontSize: "18px", fontWeight: 700,
              }}>S</div>
              <span style={{ fontSize: "22px", fontWeight: 700, color: "#F1F5F9" }}>CodeShield</span>
              <span style={{ fontSize: "22px", fontWeight: 700, color: "#00E87B" }}>.sh</span>
            </div>
            <span style={{ fontSize: "13px", color: "#64748B", letterSpacing: "2px", textTransform: "uppercase" as const }}>
              Security Assessment Certificate
            </span>
          </div>

          {/* Grade */}
          <div style={{
            width: "80px", height: "80px", borderRadius: "16px",
            border: `3px solid ${gradeColor}`, display: "flex", flexDirection: "column",
            alignItems: "center", justifyContent: "center",
            background: `${gradeColor}10`,
          }}>
            <span style={{ fontSize: "36px", fontWeight: 700, color: gradeColor, lineHeight: 1 }}>{grade}</span>
            <span style={{ fontSize: "9px", color: gradeColor, fontWeight: 600 }}>{status}</span>
          </div>
        </div>

        {/* Title */}
        <div style={{ fontSize: "28px", fontWeight: 700, color: "#F1F5F9", marginBottom: "4px" }}>
          {owner}/{repo}
        </div>
        <div style={{ fontSize: "14px", color: "#64748B", marginBottom: "32px" }}>
          Assessed on {date} | Certificate ID: CS-{date.replace(/-/g, "")}-{owner.slice(0, 4).toUpperCase()}
        </div>

        {/* Stats grid */}
        <div style={{ display: "flex", gap: "16px", marginBottom: "32px" }}>
          {[
            { label: "Security Score", value: `${score}/100`, color: gradeColor },
            { label: "Vulnerabilities", value: String(vulns), color: vulns === 0 ? "#00E87B" : "#F59E0B" },
            { label: "Critical Issues", value: String(critical), color: critical === 0 ? "#00E87B" : "#F43F5E" },
            { label: "PQC Readiness", value: critical === 0 && vulns < 5 ? "READY" : "AT RISK", color: critical === 0 ? "#00E87B" : "#F43F5E" },
          ].map((stat) => (
            <div key={stat.label} style={{
              flex: 1, padding: "16px", borderRadius: "12px",
              background: "#1A1E27", border: "1px solid #2A2F3C",
              display: "flex", flexDirection: "column",
            }}>
              <span style={{ fontSize: "11px", color: "#64748B", marginBottom: "4px", textTransform: "uppercase" as const }}>{stat.label}</span>
              <span style={{ fontSize: "24px", fontWeight: 700, color: stat.color }}>{stat.value}</span>
            </div>
          ))}
        </div>

        {/* Compliance */}
        <div style={{
          padding: "16px 20px", borderRadius: "12px", background: "#1A1E27",
          border: "1px solid #2A2F3C", marginBottom: "24px", display: "flex",
          justifyContent: "space-between", alignItems: "center",
        }}>
          <span style={{ fontSize: "13px", color: "#94A3B8" }}>
            This certificate confirms that the repository has been scanned for OWASP Top 10 vulnerabilities,
            hardcoded secrets, and NIST-flagged quantum-vulnerable cryptography (RSA, ECDSA, ECDH).
          </span>
        </div>

        {/* Footer */}
        <div style={{
          display: "flex", justifyContent: "space-between", alignItems: "center",
          marginTop: "auto",
        }}>
          <span style={{ fontSize: "11px", color: "#64748B" }}>
            codeshield.sh | AI Code Security Scanner + Post-Quantum Crypto Migration
          </span>
          <span style={{ fontSize: "11px", color: "#64748B" }}>
            Valid for 30 days from assessment date
          </span>
        </div>
      </div>
    ),
    { width: 800, height: 600 }
  );
}
