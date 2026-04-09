import { NextRequest } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { Vulnerability, Category, Severity } from "@/types";

// ── Algorithm extraction map ──
const ALGORITHM_MAP: Record<string, { replacement: string; deadline: string }> =
  {
    "RSA-2048": {
      replacement: "ML-KEM (FIPS 203)",
      deadline: "DEPRECATED_BY_2030",
    },
    "RSA-1024": {
      replacement: "ML-KEM (FIPS 203)",
      deadline: "DEPRECATED_IMMEDIATELY",
    },
    "RSA-512": {
      replacement: "ML-KEM (FIPS 203)",
      deadline: "DEPRECATED_IMMEDIATELY",
    },
    RSA: { replacement: "ML-KEM (FIPS 203)", deadline: "DEPRECATED_BY_2030" },
    ECDSA: {
      replacement: "ML-DSA (FIPS 204)",
      deadline: "DEPRECATED_BY_2030",
    },
    ECDH: { replacement: "ML-KEM (FIPS 203)", deadline: "DEPRECATED_BY_2030" },
    Ed25519: {
      replacement: "ML-DSA (FIPS 204)",
      deadline: "DEPRECATED_BY_2030",
    },
    X25519: {
      replacement: "ML-KEM (FIPS 203)",
      deadline: "DEPRECATED_BY_2030",
    },
    secp256k1: {
      replacement: "ML-DSA (FIPS 204)",
      deadline: "DEPRECATED_BY_2030",
    },
    "Diffie-Hellman": {
      replacement: "ML-KEM (FIPS 203)",
      deadline: "DEPRECATED_BY_2030",
    },
    DSA: {
      replacement: "ML-DSA (FIPS 204)",
      deadline: "DEPRECATED_IMMEDIATELY",
    },
    "SHA-1": {
      replacement: "SHA-256 or SHA-3",
      deadline: "DEPRECATED_IMMEDIATELY",
    },
    MD5: {
      replacement: "SHA-256 or SHA-3",
      deadline: "DEPRECATED_IMMEDIATELY",
    },
    "AES-128": {
      replacement: "AES-256",
      deadline: "DEPRECATED_BY_2030",
    },
    DES: {
      replacement: "AES-256-GCM",
      deadline: "DEPRECATED_IMMEDIATELY",
    },
    "3DES": {
      replacement: "AES-256-GCM",
      deadline: "DEPRECATED_IMMEDIATELY",
    },
    RC4: {
      replacement: "AES-256-GCM or ChaCha20-Poly1305",
      deadline: "DEPRECATED_IMMEDIATELY",
    },
    Blowfish: {
      replacement: "AES-256-GCM or ChaCha20-Poly1305",
      deadline: "DEPRECATED_IMMEDIATELY",
    },
    "TLS 1.0": {
      replacement: "TLS 1.3",
      deadline: "DEPRECATED_IMMEDIATELY",
    },
    "TLS 1.1": {
      replacement: "TLS 1.3",
      deadline: "DEPRECATED_IMMEDIATELY",
    },
    "SSL 2.0": {
      replacement: "TLS 1.3",
      deadline: "DEPRECATED_IMMEDIATELY",
    },
    "SSL 3.0": {
      replacement: "TLS 1.3",
      deadline: "DEPRECATED_IMMEDIATELY",
    },
  };

// Extract algorithm name from vulnerability title
function extractAlgorithm(vuln: Vulnerability): string | null {
  const title = vuln.title;
  // Direct algorithm names in the title
  for (const algo of Object.keys(ALGORITHM_MAP)) {
    if (title.toLowerCase().includes(algo.toLowerCase())) {
      return algo;
    }
  }
  // Fallback patterns
  if (/RSA/i.test(title)) return "RSA";
  if (/elliptic\s*curve/i.test(title)) return "ECDSA";
  if (/diffie/i.test(title)) return "Diffie-Hellman";
  if (/sha-?1/i.test(title)) return "SHA-1";
  if (/md5/i.test(title)) return "MD5";
  if (/aes-?128/i.test(title)) return "AES-128";
  if (/des|3des/i.test(title)) return "3DES";
  if (/rc4/i.test(title)) return "RC4";
  if (/blowfish/i.test(title)) return "Blowfish";
  if (/ssl.*2/i.test(title)) return "SSL 2.0";
  if (/ssl.*3/i.test(title)) return "SSL 3.0";
  if (/tls.*1\.0|tls.*1_0/i.test(title)) return "TLS 1.0";
  if (/tls.*1\.1|tls.*1_1/i.test(title)) return "TLS 1.1";
  return null;
}

function generateReportId(): string {
  const chars = "abcdefghijklmnopqrstuvwxyz0123456789";
  let id = "rpt_";
  for (let i = 0; i < 12; i++) {
    id += chars[Math.floor(Math.random() * chars.length)];
  }
  return id;
}

function computeRiskLevel(
  criticalCount: number,
  highCount: number,
  total: number
): "CRITICAL" | "HIGH" | "MEDIUM" | "LOW" {
  if (criticalCount >= 5) return "CRITICAL";
  if (criticalCount >= 1 || highCount >= 5) return "HIGH";
  if (highCount >= 1 || total >= 5) return "MEDIUM";
  return "LOW";
}

function computeComplianceStatus(
  pqcCount: number,
  criticalCount: number
): "COMPLIANT" | "PARTIALLY_COMPLIANT" | "NON_COMPLIANT" {
  if (pqcCount === 0 && criticalCount === 0) return "COMPLIANT";
  if (pqcCount <= 2 && criticalCount === 0) return "PARTIALLY_COMPLIANT";
  return "NON_COMPLIANT";
}

function estimateRemediationHours(vulns: Vulnerability[]): number {
  let hours = 0;
  for (const v of vulns) {
    switch (v.severity) {
      case "critical":
        hours += 8;
        break;
      case "high":
        hours += 4;
        break;
      case "medium":
        hours += 2;
        break;
      case "low":
        hours += 1;
        break;
    }
  }
  return hours;
}

function estimateMigrationMonths(pqcCount: number, total: number): number {
  if (pqcCount === 0) return 0;
  if (pqcCount <= 3) return 2;
  if (pqcCount <= 10) return 6;
  if (pqcCount <= 25) return 12;
  return 18;
}

function computeReadiness(pqcCount: number, total: number): string {
  if (total === 0) return "100%";
  if (pqcCount === 0) return "95%";
  const ratio = 1 - pqcCount / Math.max(total, 1);
  return `${Math.max(5, Math.round(ratio * 100))}%`;
}

interface CryptoInventoryItem {
  algorithm: string;
  locations: string[];
  status: string;
  replacement: string;
  priority: Severity;
}

function buildCryptoInventory(vulns: Vulnerability[]): CryptoInventoryItem[] {
  const map = new Map<
    string,
    { locations: Set<string>; severity: Severity }
  >();

  for (const v of vulns) {
    const algo = extractAlgorithm(v);
    if (!algo) continue;

    if (!map.has(algo)) {
      map.set(algo, { locations: new Set(), severity: v.severity });
    }
    const entry = map.get(algo)!;
    entry.locations.add(`${v.file}:${v.line}`);
    // Keep the highest severity
    const order: Record<Severity, number> = {
      critical: 0,
      high: 1,
      medium: 2,
      low: 3,
    };
    if (order[v.severity] < order[entry.severity]) {
      entry.severity = v.severity;
    }
  }

  const items: CryptoInventoryItem[] = [];
  for (const [algo, data] of map) {
    const info = ALGORITHM_MAP[algo] || {
      replacement: "Consult NIST guidelines",
      deadline: "REVIEW_REQUIRED",
    };
    items.push({
      algorithm: algo,
      locations: Array.from(data.locations),
      status: info.deadline,
      replacement: info.replacement,
      priority: data.severity,
    });
  }

  // Sort by severity
  const order: Record<Severity, number> = {
    critical: 0,
    high: 1,
    medium: 2,
    low: 3,
  };
  items.sort((a, b) => order[a.priority] - order[b.priority]);

  return items;
}

interface Recommendation {
  priority: number;
  action: string;
  impact: string;
  effort: "Low" | "Medium" | "High";
}

function generateRecommendations(
  vulns: Vulnerability[],
  inventory: CryptoInventoryItem[]
): Recommendation[] {
  const recs: Recommendation[] = [];
  let priority = 1;

  // PQC crypto migration recommendations from inventory
  for (const item of inventory) {
    if (item.priority === "critical" || item.priority === "high") {
      recs.push({
        priority: priority++,
        action: `Replace ${item.algorithm} with ${item.replacement}`,
        impact: `Eliminates quantum vulnerability across ${item.locations.length} location${item.locations.length > 1 ? "s" : ""}`,
        effort:
          item.locations.length > 5
            ? "High"
            : item.locations.length > 2
              ? "Medium"
              : "Low",
      });
    }
  }

  // Category-based recommendations
  const categoryCounts: Partial<Record<Category, number>> = {};
  for (const v of vulns) {
    categoryCounts[v.category] = (categoryCounts[v.category] || 0) + 1;
  }

  if (categoryCounts["secrets"] && categoryCounts["secrets"] > 0) {
    recs.push({
      priority: priority++,
      action:
        "Implement secrets management (HashiCorp Vault, AWS Secrets Manager)",
      impact: `Remediates ${categoryCounts["secrets"]} exposed credential${categoryCounts["secrets"] > 1 ? "s" : ""}`,
      effort: "Medium",
    });
  }

  if (categoryCounts["sql-injection"] && categoryCounts["sql-injection"] > 0) {
    recs.push({
      priority: priority++,
      action:
        "Migrate all SQL queries to parameterized statements or an ORM",
      impact: `Eliminates ${categoryCounts["sql-injection"]} SQL injection vector${categoryCounts["sql-injection"] > 1 ? "s" : ""}`,
      effort: "Medium",
    });
  }

  if (categoryCounts["xss"] && categoryCounts["xss"] > 0) {
    recs.push({
      priority: priority++,
      action:
        "Implement Content Security Policy and sanitize all dynamic HTML output",
      impact: `Resolves ${categoryCounts["xss"]} XSS vulnerabilit${categoryCounts["xss"] > 1 ? "ies" : "y"}`,
      effort: "Medium",
    });
  }

  if (categoryCounts["tls"] && categoryCounts["tls"] > 0) {
    recs.push({
      priority: priority++,
      action: "Enforce TLS 1.3 minimum across all connections",
      impact: `Fixes ${categoryCounts["tls"]} TLS/SSL configuration issue${categoryCounts["tls"] > 1 ? "s" : ""}`,
      effort: "Low",
    });
  }

  if (
    categoryCounts["code-injection"] &&
    categoryCounts["code-injection"] > 0
  ) {
    recs.push({
      priority: priority++,
      action:
        "Remove eval() and unsafe deserialization patterns",
      impact: `Closes ${categoryCounts["code-injection"]} code injection vector${categoryCounts["code-injection"] > 1 ? "s" : ""}`,
      effort: "Low",
    });
  }

  if (categoryCounts["cors"] && categoryCounts["cors"] > 0) {
    recs.push({
      priority: priority++,
      action:
        "Restrict CORS origins to trusted domains only",
      impact: `Fixes ${categoryCounts["cors"]} CORS misconfiguration${categoryCounts["cors"] > 1 ? "s" : ""}`,
      effort: "Low",
    });
  }

  // Medium-severity inventory items
  for (const item of inventory) {
    if (item.priority === "medium") {
      recs.push({
        priority: priority++,
        action: `Upgrade ${item.algorithm} to ${item.replacement}`,
        impact: `Strengthens cryptographic posture in ${item.locations.length} location${item.locations.length > 1 ? "s" : ""}`,
        effort: "Low",
      });
    }
  }

  // General PQC readiness recommendation if any PQC vulns exist
  const pqcCount = vulns.filter((v) => v.category === "pqc").length;
  if (pqcCount > 0) {
    recs.push({
      priority: priority++,
      action:
        "Establish a PQC migration roadmap aligned with NIST SP 800-131A Rev 3",
      impact:
        "Ensures organizational readiness before CNSA 2.0 compliance deadlines",
      effort: "High",
    });
  }

  return recs;
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return Response.json({ error: "Not authenticated" }, { status: 401 });
    }

    const body = await request.json();
    const { vulnerabilities, owner, repo, filesScanned } = body as {
      vulnerabilities: Vulnerability[];
      owner: string;
      repo: string;
      filesScanned: number;
    };

    if (!vulnerabilities || !owner || !repo || filesScanned == null) {
      return Response.json(
        { error: "Missing required fields: vulnerabilities, owner, repo, filesScanned" },
        { status: 400 }
      );
    }

    // ── Aggregate counts ──
    const severityCounts: Record<Severity, number> = {
      critical: 0,
      high: 0,
      medium: 0,
      low: 0,
    };
    const categoryCounts: Partial<Record<Category, number>> = {};

    for (const v of vulnerabilities) {
      severityCounts[v.severity]++;
      categoryCounts[v.category] = (categoryCounts[v.category] || 0) + 1;
    }

    const pqcVulns = vulnerabilities.filter((v) => v.category === "pqc");
    const pqcCount = pqcVulns.length;
    const totalVulns = vulnerabilities.length;

    // ── Build sections ──
    const cryptographicInventory = buildCryptoInventory(vulnerabilities);
    const riskLevel = computeRiskLevel(
      severityCounts.critical,
      severityCounts.high,
      totalVulns
    );
    const complianceStatus = computeComplianceStatus(
      pqcCount,
      severityCounts.critical
    );
    const remediationHours = estimateRemediationHours(vulnerabilities);
    const migrationMonths = estimateMigrationMonths(pqcCount, totalVulns);
    const readiness = computeReadiness(pqcCount, totalVulns);
    const recommendations = generateRecommendations(
      vulnerabilities,
      cryptographicInventory
    );

    const report = {
      id: generateReportId(),
      generatedAt: new Date().toISOString(),
      repo: `${owner}/${repo}`,
      filesScanned,
      executiveSummary: {
        totalVulnerabilities: totalVulns,
        criticalCount: severityCounts.critical,
        pqcVulnerabilities: pqcCount,
        riskLevel,
        complianceStatus,
        estimatedRemediationHours: remediationHours,
      },
      cryptographicInventory,
      complianceTimeline: {
        nistDeadline: "2030",
        nsaDeadline: "2027",
        euDeadline: "2030",
        currentReadiness: readiness,
        estimatedMigrationMonths: migrationMonths,
      },
      vulnerabilityBreakdown: {
        byCategory: categoryCounts,
        bySeverity: severityCounts,
      },
      recommendations,
    };

    return Response.json({ report });
  } catch (error) {
    console.error(
      "Report generation error:",
      error instanceof Error ? error.message : "Unknown"
    );
    return Response.json(
      { error: "Failed to generate compliance report" },
      { status: 500 }
    );
  }
}
