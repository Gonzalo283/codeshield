#!/usr/bin/env node

const fs = require("fs");
const path = require("path");

const VERSION = "1.0.0";
const SITE = "https://codeshield.sh";

// Colors
const R = "\x1b[31m";
const Y = "\x1b[33m";
const B = "\x1b[34m";
const G = "\x1b[32m";
const D = "\x1b[90m";
const W = "\x1b[97m";
const X = "\x1b[0m";
const BOLD = "\x1b[1m";

const patterns = [
  { regex: /(?:password|passwd|secret)\s*[:=]\s*['"][^'"]{4,}['"]/gi, severity: "critical", title: "Hardcoded Secret", category: "secrets" },
  { regex: /(?:api[_-]?key|apikey|access[_-]?token|auth[_-]?token)\s*[:=]\s*['"][^'"]{8,}['"]/gi, severity: "critical", title: "Hardcoded API Key/Token", category: "secrets" },
  { regex: /\bsk_(?:live|test)_[a-zA-Z0-9]{20,}/g, severity: "critical", title: "Stripe Key Exposed", category: "secrets" },
  { regex: /\bghp_[a-zA-Z0-9]{36,}/g, severity: "critical", title: "GitHub Token Exposed", category: "secrets" },
  { regex: /\bAIza[0-9A-Za-z_-]{35}/g, severity: "critical", title: "Google API Key Exposed", category: "secrets" },
  { regex: /-----BEGIN\s+(?:RSA\s+)?PRIVATE\s+KEY-----/g, severity: "critical", title: "Private Key in Code", category: "secrets" },
  { regex: /\beval\s*\(/g, severity: "critical", title: "eval() Usage", category: "code-injection" },
  { regex: /\bRSA\b.*?(?:encrypt|decrypt|sign|verify|key|generate)/gi, severity: "critical", title: "RSA (Quantum-Vulnerable)", category: "pqc" },
  { regex: /\b(generateKeyPair|createSign|createVerify)\s*\(\s*['"]rsa['"]/gi, severity: "critical", title: "RSA Key Generation", category: "pqc" },
  { regex: /\b(ECDSA|ECDH|Ed25519|X25519|secp256k1)\b/g, severity: "high", title: "ECC (Quantum-Vulnerable)", category: "pqc" },
  { regex: /\b(createDiffieHellman|DiffieHellman)\b/gi, severity: "high", title: "Diffie-Hellman (Quantum-Vulnerable)", category: "pqc" },
  { regex: /\b(sha-?1|SHA1)\b|createHash\s*\(\s*['"]sha1['"]\)/gi, severity: "medium", title: "SHA-1 Usage", category: "weak-crypto" },
  { regex: /\bMD5\b|createHash\s*\(\s*['"]md5['"]\)/gi, severity: "medium", title: "MD5 Usage", category: "weak-crypto" },
  { regex: /\b(3DES|triple[-_]?des|DESede)\b/gi, severity: "high", title: "3DES/DES Usage", category: "weak-crypto" },
  { regex: /\bRC4\b|['"]rc4['"]/gi, severity: "high", title: "RC4 Usage", category: "weak-crypto" },
  { regex: /\.innerHTML\s*=\s*(?!['"`]<)/g, severity: "high", title: "Potential XSS (innerHTML)", category: "xss" },
  { regex: /['"]Access-Control-Allow-Origin['"]\s*[:,]\s*['"]?\s*\*\s*['"]?/gi, severity: "medium", title: "CORS Wildcard", category: "cors" },
  { regex: /(?:rejectUnauthorized|verify_ssl)\s*[:=]\s*(?:false|0)/gi, severity: "high", title: "TLS Verification Disabled", category: "tls" },
  { regex: /NODE_TLS_REJECT_UNAUTHORIZED\s*=\s*['"]?0['"]?/g, severity: "high", title: "TLS Verification Disabled (Global)", category: "tls" },
  { regex: /\bSSLv[23]\b|['"]SSLv[23]['"]/gi, severity: "critical", title: "SSL Protocol (Broken)", category: "tls" },
  { regex: /(?:modulusLength|keySize)\s*[:=]\s*(?:512|768|1024|2048)\b/gi, severity: "critical", title: "RSA Key < 3072 bits", category: "pqc" },
];

const SCANNABLE_EXTS = new Set([
  ".ts", ".tsx", ".js", ".jsx", ".mjs", ".cjs",
  ".py", ".go", ".java", ".rs", ".rb", ".php",
  ".cs", ".cpp", ".c", ".h", ".hpp", ".swift",
  ".kt", ".scala", ".sh", ".bash",
  ".yaml", ".yml", ".json", ".env", ".sql",
]);

const EXCLUDED = new Set([
  "node_modules", "vendor", "dist", "build", ".next",
  "__pycache__", ".git", "coverage", ".turbo", "target",
  "bin", "obj", ".cache", ".vscode", ".idea",
]);

function walk(dir) {
  let files = [];
  try {
    for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
      if (entry.name.startsWith(".") && entry.isDirectory()) continue;
      const full = path.join(dir, entry.name);
      if (entry.isDirectory()) {
        if (!EXCLUDED.has(entry.name)) files = files.concat(walk(full));
      } else if (entry.isFile()) {
        const ext = path.extname(entry.name).toLowerCase();
        if (SCANNABLE_EXTS.has(ext)) {
          const stat = fs.statSync(full);
          if (stat.size < 500000) files.push(full);
        }
      }
    }
  } catch {}
  return files;
}

function scan(filePath, cwd) {
  const content = fs.readFileSync(filePath, "utf-8");
  const lines = content.split("\n");
  const relative = path.relative(cwd, filePath);
  const results = [];

  for (const p of patterns) {
    for (let i = 0; i < lines.length; i++) {
      p.regex.lastIndex = 0;
      if (p.regex.test(lines[i])) {
        results.push({
          file: relative,
          line: i + 1,
          severity: p.severity,
          title: p.title,
          category: p.category,
          code: lines[i].trim().substring(0, 120),
        });
      }
    }
  }
  return results;
}

// ── Main ──
const args = process.argv.slice(2);

if (args.includes("--help") || args.includes("-h")) {
  console.log(`
${G}${BOLD}CodeShield${X} v${VERSION} — AI Code Security Scanner
${D}${SITE}${X}

${W}USAGE${X}
  npx codeshield [path]        Scan a directory (default: current dir)
  npx codeshield --help        Show this help

${W}EXAMPLES${X}
  npx codeshield               Scan current directory
  npx codeshield ./src         Scan only src/
  npx codeshield ~/projects    Scan a specific path

${W}WHAT IT DETECTS${X}
  - OWASP Top 10 (SQL injection, XSS, eval, CORS)
  - Hardcoded secrets (API keys, passwords, tokens)
  - Quantum-vulnerable crypto (RSA, ECDSA, DH)
  - Weak crypto (MD5, SHA-1, DES, RC4)

${D}Full dashboard & auto-fix: ${SITE}${X}
`);
  process.exit(0);
}

const targetDir = path.resolve(args[0] || ".");

if (!fs.existsSync(targetDir)) {
  console.error(`${R}Error: Directory not found: ${targetDir}${X}`);
  process.exit(1);
}

console.log(`\n${G}${BOLD}  CodeShield${X} v${VERSION}`);
console.log(`${D}  ${SITE}${X}\n`);
console.log(`${D}  Scanning ${targetDir}...${X}\n`);

const files = walk(targetDir);
const allResults = [];

for (const file of files) {
  const results = scan(file, targetDir);
  allResults.push(...results);
}

// Count by severity
const counts = { critical: 0, high: 0, medium: 0, low: 0 };
for (const r of allResults) counts[r.severity]++;

// Print summary
console.log(`  ${W}${BOLD}${files.length}${X} files scanned`);
console.log(`  ${W}${BOLD}${allResults.length}${X} vulnerabilities found\n`);

if (allResults.length === 0) {
  console.log(`  ${G}${BOLD}No vulnerabilities detected.${X} Your code looks secure.\n`);
} else {
  // Summary bar
  if (counts.critical > 0) console.log(`  ${R}${BOLD}${counts.critical} CRITICAL${X}`);
  if (counts.high > 0) console.log(`  ${Y}${BOLD}${counts.high} HIGH${X}`);
  if (counts.medium > 0) console.log(`  ${B}${BOLD}${counts.medium} MEDIUM${X}`);
  console.log();

  // Print findings (top 30)
  const top = allResults
    .sort((a, b) => {
      const order = { critical: 0, high: 1, medium: 2, low: 3 };
      return order[a.severity] - order[b.severity];
    })
    .slice(0, 30);

  for (const r of top) {
    const sevColor = r.severity === "critical" ? R : r.severity === "high" ? Y : B;
    const sevLabel = r.severity.toUpperCase().padEnd(8);
    console.log(`  ${sevColor}${BOLD}${sevLabel}${X} ${W}${r.title}${X}`);
    console.log(`  ${D}${r.file}:${r.line}${X}`);
    console.log(`  ${D}${r.code}${X}\n`);
  }

  if (allResults.length > 30) {
    console.log(`  ${D}...and ${allResults.length - 30} more findings.${X}\n`);
  }
}

// CTA
console.log(`${D}  ─────────────────────────────────────────────${X}`);
console.log(`  ${G}${BOLD}Get auto-fix with AI:${X} ${SITE}/scan-free`);
console.log(`  ${D}Full dashboard:${X}      ${SITE}/dashboard`);
console.log(`${D}  ─────────────────────────────────────────────${X}\n`);

// Exit code
process.exit(counts.critical > 0 ? 1 : 0);
