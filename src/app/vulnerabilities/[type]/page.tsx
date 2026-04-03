import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";

/* ═══════════════════════════════════════════════════════════════════════════
   Vulnerability data — inline for programmatic SEO
   ═══════════════════════════════════════════════════════════════════════════ */

type Severity = "critical" | "high" | "medium";

interface VulnerabilityData {
  title: string;
  severity: Severity;
  description: string;
  whyAIDangerous: string;
  vulnCode: string;
  vulnCodeLang: string;
  fixedCode: string;
  fixedCodeLang: string;
  howWeDetect: string[];
  affectedLanguages: string[];
  cweId: string;
  metaTitle: string;
}

const VULNERABILITIES: Record<string, VulnerabilityData> = {
  "sql-injection": {
    title: "SQL Injection",
    severity: "critical",
    description:
      "SQL injection occurs when untrusted data is sent to a database interpreter as part of a query. An attacker can use SQL injection to manipulate queries, access unauthorized data, modify or delete records, and in some cases execute operating system commands. It is consistently ranked as one of the most dangerous vulnerabilities in the OWASP Top 10 and is the leading cause of data breaches in web applications.",
    whyAIDangerous:
      "AI assistants frequently generate SQL queries using string concatenation or template literals instead of parameterized queries. When prompted to \"query the database for a user by email,\" tools like Copilot and Cursor will often produce code like `query(\"SELECT * FROM users WHERE email = '\" + email + \"'\")` instead of using prepared statements. This happens because AI models are trained on vast codebases that include legacy code, tutorials with shortcuts, and examples that prioritize readability over security. In benchmarks, over 30% of AI-generated database queries contain SQL injection vulnerabilities.",
    vulnCode: `// JavaScript — AI-generated vulnerable code
app.get("/api/users", async (req, res) => {
  const { email } = req.query;

  // VULNERABLE: template literal SQL injection
  const result = await db.query(
    \`SELECT * FROM users WHERE email = '\${email}'\`
  );

  res.json(result.rows);
});

# Python — AI-generated vulnerable code
@app.route("/api/users")
def get_user():
    email = request.args.get("email")

    # VULNERABLE: f-string SQL injection
    cursor.execute(
        f"SELECT * FROM users WHERE email = '{email}'"
    )

    return jsonify(cursor.fetchall())`,
    vulnCodeLang: "javascript",
    fixedCode: `// JavaScript — parameterized query (secure)
app.get("/api/users", async (req, res) => {
  const { email } = req.query;

  // SECURE: parameterized query prevents injection
  const result = await db.query(
    "SELECT * FROM users WHERE email = $1",
    [email]
  );

  res.json(result.rows);
});

# Python — parameterized query (secure)
@app.route("/api/users")
def get_user():
    email = request.args.get("email")

    # SECURE: parameterized query prevents injection
    cursor.execute(
        "SELECT * FROM users WHERE email = %s",
        (email,)
    )

    return jsonify(cursor.fetchall())`,
    fixedCodeLang: "javascript",
    howWeDetect: [
      "Pattern matching for string concatenation in SQL query functions (db.query, cursor.execute, Statement.execute)",
      "Detection of template literals and f-strings containing SQL keywords (SELECT, INSERT, UPDATE, DELETE)",
      "Analysis of ORM raw query methods (Prisma $queryRaw, Sequelize literal, ActiveRecord find_by_sql)",
      "Taint analysis tracking user input from request parameters to query execution",
      "Framework-specific detection for Express, Django, Flask, Rails, Spring, and Laravel",
    ],
    affectedLanguages: [
      "JavaScript",
      "TypeScript",
      "Python",
      "Java",
      "Go",
      "Ruby",
      "PHP",
      "Rust",
    ],
    cweId: "CWE-89",
    metaTitle: "SQL Injection in AI Code: Detection & Fix",
  },

  xss: {
    title: "Cross-Site Scripting (XSS)",
    severity: "high",
    description:
      "Cross-Site Scripting (XSS) allows attackers to inject malicious scripts into web pages viewed by other users. When a browser executes the injected script, the attacker can steal session tokens, redirect users to malicious sites, deface the page, or perform actions on behalf of the victim. XSS is the most common web application vulnerability and appears in three forms: Stored XSS, Reflected XSS, and DOM-based XSS.",
    whyAIDangerous:
      "AI code assistants routinely generate DOM manipulation code using innerHTML instead of textContent, and React code with dangerouslySetInnerHTML for rendering dynamic content. When asked to \"display user comments on the page\" or \"render HTML content from an API,\" AI tools default to the most straightforward approach — which is almost always the insecure one. AI models also frequently generate Express.js endpoints that reflect query parameters directly into HTML responses without encoding, creating reflected XSS vulnerabilities.",
    vulnCode: `// React — AI-generated vulnerable code
function UserComment({ comment }: { comment: string }) {
  // VULNERABLE: renders unsanitized HTML from user input
  return (
    <div
      dangerouslySetInnerHTML={{ __html: comment }}
    />
  );
}

// Vanilla JS — AI-generated vulnerable code
function displayResults(query: string) {
  const container = document.getElementById("results");

  // VULNERABLE: innerHTML with unsanitized input
  container!.innerHTML = \`
    <h2>Results for: \${query}</h2>
    <p>Searching...</p>
  \`;
}`,
    vulnCodeLang: "typescript",
    fixedCode: `// React — sanitized rendering (secure)
import DOMPurify from "dompurify";

function UserComment({ comment }: { comment: string }) {
  // SECURE: sanitize HTML before rendering
  const clean = DOMPurify.sanitize(comment);
  return (
    <div
      dangerouslySetInnerHTML={{ __html: clean }}
    />
  );
}

// Vanilla JS — textContent (secure)
function displayResults(query: string) {
  const container = document.getElementById("results");
  const heading = document.createElement("h2");

  // SECURE: textContent does not parse HTML
  heading.textContent = \`Results for: \${query}\`;
  container!.replaceChildren(heading);
}`,
    fixedCodeLang: "typescript",
    howWeDetect: [
      "Detection of dangerouslySetInnerHTML in React/Next.js components with dynamic data",
      "innerHTML, outerHTML, and insertAdjacentHTML assignments with non-literal values",
      "document.write() calls with dynamic content",
      "Express.js res.send() reflecting request parameters without encoding",
      "Detection of missing Content-Security-Policy headers in server configurations",
    ],
    affectedLanguages: ["JavaScript", "TypeScript", "PHP", "Ruby", "Java"],
    cweId: "CWE-79",
    metaTitle: "XSS in AI-Generated Code: Detection & Fix",
  },

  "hardcoded-secrets": {
    title: "Hardcoded Secrets & API Keys",
    severity: "critical",
    description:
      "Hardcoded secrets — including API keys, database passwords, JWT signing keys, and private encryption keys — embedded directly in source code are one of the most common and dangerous security vulnerabilities. When code is pushed to a repository, these secrets become accessible to anyone with read access. Even in private repos, secrets in code history persist after deletion. In 2024, GitHub detected over 12 million secret exposures in public repositories.",
    whyAIDangerous:
      "AI assistants generate hardcoded secrets constantly because they are trained on code that includes example configurations, tutorials, and working demos — all of which embed credentials inline for simplicity. When prompted to \"connect to a database\" or \"configure JWT authentication,\" AI tools produce code with placeholder values that look functional and are never replaced before deployment. Worse, AI tools sometimes generate realistic-looking API keys that developers assume are examples but accidentally ship to production.",
    vulnCode: `// Node.js — AI-generated vulnerable code
import jwt from "jsonwebtoken";

// VULNERABLE: JWT secret hardcoded in source
const JWT_SECRET = "super-secret-key-12345";

app.post("/api/login", async (req, res) => {
  const user = await authenticate(req.body);
  const token = jwt.sign(
    { userId: user.id },
    JWT_SECRET,
    { expiresIn: "7d" }
  );
  res.json({ token });
});

# Python — AI-generated vulnerable code
import psycopg2

# VULNERABLE: database credentials in source code
conn = psycopg2.connect(
    host="prod-db.example.com",
    database="myapp",
    user="admin",
    password="P@ssw0rd!2025"
)`,
    vulnCodeLang: "javascript",
    fixedCode: `// Node.js — environment variables (secure)
import jwt from "jsonwebtoken";

// SECURE: secret loaded from environment variable
const JWT_SECRET = process.env.JWT_SECRET;
if (!JWT_SECRET) throw new Error("JWT_SECRET not set");

app.post("/api/login", async (req, res) => {
  const user = await authenticate(req.body);
  const token = jwt.sign(
    { userId: user.id },
    JWT_SECRET,
    { expiresIn: "7d" }
  );
  res.json({ token });
});

# Python — environment variables (secure)
import psycopg2
import os

# SECURE: credentials from environment / secret manager
conn = psycopg2.connect(
    host=os.environ["DB_HOST"],
    database=os.environ["DB_NAME"],
    user=os.environ["DB_USER"],
    password=os.environ["DB_PASSWORD"]
)`,
    fixedCodeLang: "javascript",
    howWeDetect: [
      "High-entropy string detection in variable assignments (API keys, tokens, passwords)",
      "Pattern matching for known secret formats (AWS, Stripe, GitHub, Google Cloud, Slack, Twilio)",
      "Detection of hardcoded passwords in database connection strings and config objects",
      "JWT signing keys and session secrets assigned to string literals",
      "Private key material (PEM, PKCS8) embedded in source files",
    ],
    affectedLanguages: [
      "JavaScript",
      "TypeScript",
      "Python",
      "Java",
      "Go",
      "Ruby",
      "PHP",
      "Rust",
    ],
    cweId: "CWE-798",
    metaTitle: "Hardcoded Secrets in AI Code: Detection & Fix",
  },

  "rsa-quantum-vulnerable": {
    title: "RSA Quantum Vulnerability",
    severity: "critical",
    description:
      "RSA encryption, the foundation of internet security since 1977, is mathematically broken by Shor's algorithm running on a sufficiently powerful quantum computer. NIST has announced the deprecation of RSA for all key sizes by 2030, with a complete disallow by 2035. The NSA requires all National Security Systems to migrate away from RSA by 2027 for new deployments. Google's internal deadline is 2029. Organizations that rely on RSA for TLS, code signing, JWT tokens, or encrypted communications must begin migration to NIST-approved post-quantum algorithms (ML-KEM, ML-DSA) now — because \"harvest now, decrypt later\" attacks mean data encrypted with RSA today can be stored and decrypted once quantum computers are available.",
    whyAIDangerous:
      "AI code assistants generate RSA code by default for nearly all cryptographic operations. When asked to \"generate a key pair,\" \"encrypt data,\" or \"sign a JWT,\" AI tools produce RSA-2048 or RSA-4096 code because that is what dominates their training data. The AI models have no awareness of NIST deprecation timelines or quantum computing threats. This means every new project bootstrapped with AI assistance is being built with cryptography that has a known expiration date. Post-quantum alternatives exist but are almost never suggested by AI tools.",
    vulnCode: `// Node.js — AI-generated quantum-vulnerable code
import { generateKeyPairSync, sign } from "crypto";

// VULNERABLE: RSA is broken by Shor's algorithm
const { publicKey, privateKey } = generateKeyPairSync(
  "rsa",
  {
    modulusLength: 2048,
    publicKeyEncoding: {
      type: "spki",
      format: "pem",
    },
    privateKeyEncoding: {
      type: "pkcs8",
      format: "pem",
    },
  }
);

// VULNERABLE: RSA signature will be forgeable
const signature = sign("sha256", data, privateKey);

# Python — AI-generated quantum-vulnerable code
from cryptography.hazmat.primitives.asymmetric import rsa
from cryptography.hazmat.primitives import hashes
from cryptography.hazmat.primitives.asymmetric import padding

# VULNERABLE: RSA key generation — quantum-vulnerable
private_key = rsa.generate_private_key(
    public_exponent=65537,
    key_size=2048,
)

# VULNERABLE: RSA signing — will be forgeable
signature = private_key.sign(
    data,
    padding.PSS(mgf=padding.MGF1(hashes.SHA256()),
                salt_length=padding.PSS.MAX_LENGTH),
    hashes.SHA256()
)`,
    vulnCodeLang: "javascript",
    fixedCode: `// Node.js — post-quantum key encapsulation (secure)
// Using ML-KEM (FIPS 203) — NIST-approved PQC standard
import { mlKem768 } from "@noble/post-quantum/ml-kem";

// SECURE: ML-KEM key generation (quantum-resistant)
const { publicKey, secretKey } = mlKem768.keygen();

// SECURE: encapsulate a shared secret
const { cipherText, sharedSecret } =
  mlKem768.encapsulate(publicKey);

// SECURE: decapsulate the shared secret
const receivedSecret =
  mlKem768.decapsulate(cipherText, secretKey);

# Python — post-quantum digital signature (secure)
# Using ML-DSA (FIPS 204) — NIST-approved PQC standard
# Available via oqs-python or pqcrypto packages
from pqcrypto.sign.dilithium3 import (
    generate_keypair, sign, verify
)

# SECURE: ML-DSA key generation (quantum-resistant)
public_key, secret_key = generate_keypair()

# SECURE: quantum-resistant digital signature
signature = sign(secret_key, data)
verify(public_key, data, signature)`,
    fixedCodeLang: "javascript",
    howWeDetect: [
      "Detection of RSA key generation across all languages (crypto, OpenSSL, JCA, ring, rsa crate)",
      "RSA signing and verification operations (PKCS1v15, PSS, OAEP)",
      "RSA key imports from PEM/DER files",
      "JWT libraries configured with RS256, RS384, RS512 algorithms",
      "TLS configurations using RSA key exchange cipher suites",
    ],
    affectedLanguages: [
      "JavaScript",
      "TypeScript",
      "Python",
      "Java",
      "Go",
      "Ruby",
      "PHP",
      "Rust",
    ],
    cweId: "CWE-327",
    metaTitle: "RSA Quantum Vulnerability: Detection & Migration Guide",
  },

  "ecdsa-quantum-vulnerable": {
    title: "ECDSA/ECDH Quantum Vulnerability",
    severity: "high",
    description:
      "Elliptic Curve Cryptography — including ECDSA (signing), ECDH (key exchange), Ed25519, and X25519 — is broken by Shor's algorithm on a quantum computer, just like RSA. Although ECC uses smaller key sizes and is faster than RSA, it provides zero additional quantum resistance. NIST's post-quantum migration timeline applies equally to all elliptic curve algorithms. ECDSA is widely used in TLS 1.3, SSH, cryptocurrency wallets, code signing, and WebAuthn/FIDO2. All of these systems will need migration to ML-DSA (FIPS 204) or SLH-DSA (FIPS 205) for signatures, and ML-KEM (FIPS 203) for key exchange.",
    whyAIDangerous:
      "AI tools frequently suggest ECC as a \"modern\" and \"more secure\" alternative to RSA — which is true for classical attacks but completely irrelevant against quantum computers. When developers ask AI assistants to \"use a more secure algorithm than RSA,\" the AI will suggest switching to ECDSA with P-256 or Ed25519, giving developers a false sense of security. Both RSA and ECC fall to the same quantum algorithm. AI-generated code using the Web Crypto API, Node.js crypto module, or Python cryptography library almost always defaults to ECDSA P-256 for signing operations.",
    vulnCode: `// Node.js — AI-generated quantum-vulnerable code
import { generateKeyPairSync, sign } from "crypto";

// VULNERABLE: ECDSA is broken by Shor's algorithm
const { publicKey, privateKey } = generateKeyPairSync(
  "ec",
  {
    namedCurve: "P-256",
    publicKeyEncoding: {
      type: "spki",
      format: "pem",
    },
    privateKeyEncoding: {
      type: "pkcs8",
      format: "pem",
    },
  }
);

// VULNERABLE: ECDSA signature — quantum-forgeable
const signature = sign("sha256", data, privateKey);

# Python — AI-generated quantum-vulnerable code
from cryptography.hazmat.primitives.asymmetric import ec

# VULNERABLE: ECDSA P-256 — quantum-vulnerable
private_key = ec.generate_private_key(ec.SECP256R1())

# VULNERABLE: ECDH key exchange — quantum-breakable
shared_key = private_key.exchange(
    ec.ECDH(), peer_public_key
)`,
    vulnCodeLang: "javascript",
    fixedCode: `// Node.js — post-quantum signature (secure)
// ML-DSA (FIPS 204) — NIST-approved replacement for ECDSA
import { mlDsa65 } from "@noble/post-quantum/ml-dsa";

// SECURE: ML-DSA key generation (quantum-resistant)
const { publicKey, secretKey } = mlDsa65.keygen();

// SECURE: quantum-resistant digital signature
const signature = mlDsa65.sign(secretKey, message);

// SECURE: verification
const isValid = mlDsa65.verify(
  publicKey, message, signature
);

# Python — post-quantum key exchange (secure)
# ML-KEM (FIPS 203) — NIST-approved replacement for ECDH
from pqcrypto.kem.kyber768 import (
    generate_keypair, encrypt, decrypt
)

# SECURE: ML-KEM key generation (quantum-resistant)
public_key, secret_key = generate_keypair()

# SECURE: quantum-resistant key encapsulation
ciphertext, shared_secret = encrypt(public_key)
shared_secret_dec = decrypt(secret_key, ciphertext)`,
    fixedCodeLang: "javascript",
    howWeDetect: [
      "Detection of ECDSA, ECDH, Ed25519, and X25519 key generation across all languages",
      "Elliptic curve signing and verification operations (P-256, P-384, P-521, secp256k1)",
      "ECDH key exchange and shared secret derivation",
      "Web Crypto API subtle.generateKey with ECDSA/ECDH algorithm",
      "JWT libraries configured with ES256, ES384, ES512, EdDSA algorithms",
    ],
    affectedLanguages: [
      "JavaScript",
      "TypeScript",
      "Python",
      "Java",
      "Go",
      "Ruby",
      "Rust",
    ],
    cweId: "CWE-327",
    metaTitle: "ECDSA/ECDH Quantum Vulnerability: Detection & Migration Guide",
  },

  "sha1-broken": {
    title: "SHA-1 Broken Hash Function",
    severity: "medium",
    description:
      "SHA-1 is a cryptographic hash function that has been broken since 2017, when Google demonstrated a practical collision attack (SHAttered). Since then, chosen-prefix collision attacks have become feasible for under $100,000, making SHA-1 completely unsuitable for digital signatures, certificate validation, or integrity verification. Despite being deprecated by NIST, major browsers, and certificate authorities, SHA-1 continues to appear in codebases — particularly in AI-generated code. SHA-1 is still acceptable for non-security purposes like content-addressable storage (Git) or checksums where collision resistance is not required.",
    whyAIDangerous:
      "AI code assistants generate SHA-1 hashing code at an alarming rate because SHA-1 examples dominate their training data. When asked to \"hash a string\" or \"generate a checksum,\" AI tools default to SHA-1 or MD5 instead of SHA-256 or SHA-3. The AI models do not distinguish between security-critical and non-security hashing contexts, so they suggest SHA-1 for password hashing, HMAC operations, and integrity verification — all contexts where collision resistance matters. In Node.js, `crypto.createHash('sha1')` is one of the most commonly generated crypto patterns by AI assistants.",
    vulnCode: `// Node.js — AI-generated vulnerable code
import { createHash } from "crypto";

// VULNERABLE: SHA-1 is broken — collisions practical
function hashPassword(password: string): string {
  return createHash("sha1")
    .update(password)
    .digest("hex");
}

// VULNERABLE: SHA-1 for integrity verification
function verifyFileIntegrity(
  file: Buffer, expectedHash: string
): boolean {
  const hash = createHash("sha1")
    .update(file)
    .digest("hex");
  return hash === expectedHash;
}

# Python — AI-generated vulnerable code
import hashlib

# VULNERABLE: SHA-1 for password hashing
def hash_password(password: str) -> str:
    return hashlib.sha1(
        password.encode()
    ).hexdigest()`,
    vulnCodeLang: "typescript",
    fixedCode: `// Node.js — SHA-256 for integrity, bcrypt for passwords
import { createHash } from "crypto";
import bcrypt from "bcrypt";

// SECURE: bcrypt for password hashing (with salt)
async function hashPassword(
  password: string
): Promise<string> {
  return bcrypt.hash(password, 12);
}

// SECURE: SHA-256 for integrity verification
function verifyFileIntegrity(
  file: Buffer, expectedHash: string
): boolean {
  const hash = createHash("sha256")
    .update(file)
    .digest("hex");
  return hash === expectedHash;
}

# Python — SHA-256 and bcrypt (secure)
import hashlib
import bcrypt

# SECURE: bcrypt for password hashing
def hash_password(password: str) -> str:
    return bcrypt.hashpw(
        password.encode(), bcrypt.gensalt(12)
    ).decode()

# SECURE: SHA-256 for integrity checks
def verify_integrity(data: bytes) -> str:
    return hashlib.sha256(data).hexdigest()`,
    fixedCodeLang: "typescript",
    howWeDetect: [
      "Detection of createHash('sha1') and createHash('md5') in Node.js code",
      "hashlib.sha1() and hashlib.md5() usage in Python",
      "MessageDigest.getInstance(\"SHA-1\") and MessageDigest.getInstance(\"MD5\") in Java",
      "Digest::SHA1 and Digest::MD5 in Ruby",
      "sha1() and md5() function calls in PHP",
    ],
    affectedLanguages: [
      "JavaScript",
      "TypeScript",
      "Python",
      "Java",
      "Go",
      "Ruby",
      "PHP",
      "Rust",
    ],
    cweId: "CWE-328",
    metaTitle: "SHA-1 Broken Hash: Detection & Secure Alternatives",
  },
};

const SEVERITY_COLORS: Record<Severity, string> = {
  critical: "badge-critical",
  high: "badge-high",
  medium: "badge-medium",
};

/* ═══════════════════════════════════════════════════════════════════════════
   Static generation
   ═══════════════════════════════════════════════════════════════════════════ */

export function generateStaticParams() {
  return Object.keys(VULNERABILITIES).map((type) => ({ type }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ type: string }>;
}): Promise<Metadata> {
  const { type } = await params;
  const vuln = VULNERABILITIES[type];
  if (!vuln) return {};

  return {
    title: vuln.metaTitle,
    description: `${vuln.title} in AI-generated code: learn why AI tools produce this vulnerability, see real code examples, and auto-fix with CodeShield. ${vuln.cweId}.`,
    keywords: [
      `${vuln.title} AI code`,
      `${vuln.title} detection`,
      `${vuln.title} fix`,
      vuln.cweId,
      "AI code vulnerability",
      "code security scanner",
    ],
    alternates: { canonical: `/vulnerabilities/${type}` },
    openGraph: {
      title: `${vuln.metaTitle} | CodeShield.ai`,
      description: `Detect and auto-fix ${vuln.title} in AI-generated code. Real code examples and secure alternatives.`,
    },
  };
}

/* ═══════════════════════════════════════════════════════════════════════════
   Page component
   ═══════════════════════════════════════════════════════════════════════════ */

export default async function VulnerabilityPage({
  params,
}: {
  params: Promise<{ type: string }>;
}) {
  const { type } = await params;
  const vuln = VULNERABILITIES[type];

  if (!vuln) {
    notFound();
  }

  return (
    <div className="min-h-screen bg-bg-primary">
      {/* ── Nav ── */}
      <nav className="flex items-center justify-between px-6 md:px-8 py-5 max-w-7xl mx-auto">
        <Link href="/" className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-green/20 flex items-center justify-center border border-green/30">
            <svg
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="#00ff88"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
            </svg>
          </div>
          <span className="font-bold text-lg tracking-tight text-text-primary">
            CodeShield<span className="text-green">.ai</span>
          </span>
        </Link>
        <div className="flex items-center gap-6">
          <Link
            href="/"
            className="text-sm text-text-secondary hover:text-text-primary transition-colors"
          >
            Home
          </Link>
          <Link
            href="/pricing"
            className="text-sm text-text-secondary hover:text-text-primary transition-colors hidden sm:block"
          >
            Pricing
          </Link>
        </div>
      </nav>

      <div className="max-w-4xl mx-auto px-6 md:px-8 py-12 md:py-20">
        {/* ── Header ── */}
        <div className="mb-12">
          <div className="flex items-center gap-3 mb-6">
            <span
              className={`${SEVERITY_COLORS[vuln.severity]} px-3 py-1 rounded-full text-xs font-bold font-mono uppercase`}
            >
              {vuln.severity}
            </span>
            <span className="text-xs text-text-dim font-mono">{vuln.cweId}</span>
          </div>
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-text-primary mb-6 leading-tight">
            {vuln.title}:{" "}
            <span className="text-green">Detection &amp; Auto-Fix</span>
          </h1>
          <p className="text-text-secondary text-lg leading-relaxed max-w-3xl">
            {vuln.description}
          </p>
        </div>

        {/* ── Why AI tools generate this ── */}
        <section className="mb-14">
          <h2 className="text-xl md:text-2xl font-bold text-text-primary mb-6">
            Why AI tools generate this vulnerability
          </h2>
          <div className="bg-bg-card border border-orange/20 rounded-2xl p-6 md:p-8 relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-orange/5 via-transparent to-transparent pointer-events-none" />
            <div className="relative">
              <div className="flex items-center gap-2 mb-4">
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="#ff8844"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
                  <line x1="12" y1="9" x2="12" y2="13" />
                  <line x1="12" y1="17" x2="12.01" y2="17" />
                </svg>
                <span className="text-sm font-semibold text-orange">
                  AI Risk Factor
                </span>
              </div>
              <p className="text-text-secondary leading-relaxed">
                {vuln.whyAIDangerous}
              </p>
            </div>
          </div>
        </section>

        {/* ── Vulnerable code ── */}
        <section className="mb-14">
          <h2 className="text-xl md:text-2xl font-bold text-text-primary mb-6">
            Vulnerable code example
          </h2>
          <div className="relative">
            <div className="absolute top-3 right-3 z-10">
              <span className="badge-critical px-2 py-0.5 rounded text-xs font-mono font-bold">
                VULNERABLE
              </span>
            </div>
            <pre className="code-block text-red/80 overflow-x-auto whitespace-pre">
              {vuln.vulnCode}
            </pre>
          </div>
        </section>

        {/* ── Fixed code ── */}
        <section className="mb-14">
          <h2 className="text-xl md:text-2xl font-bold text-text-primary mb-6">
            Secure code example
          </h2>
          <div className="relative">
            <div className="absolute top-3 right-3 z-10">
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-mono font-bold bg-green/15 text-green border border-green/30">
                SECURE
              </span>
            </div>
            <pre className="code-block text-green/80 overflow-x-auto whitespace-pre">
              {vuln.fixedCode}
            </pre>
          </div>
        </section>

        {/* ── How CodeShield detects this ── */}
        <section className="mb-14">
          <h2 className="text-xl md:text-2xl font-bold text-text-primary mb-6">
            How CodeShield detects this
          </h2>
          <div className="bg-bg-card border border-border rounded-2xl p-6 md:p-8">
            <p className="text-text-secondary mb-6 leading-relaxed">
              CodeShield uses multi-layer static analysis to detect{" "}
              {vuln.title.toLowerCase()} vulnerabilities across your entire
              codebase:
            </p>
            <div className="space-y-3">
              {vuln.howWeDetect.map((method, i) => (
                <div key={i} className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded bg-green/10 flex items-center justify-center shrink-0 mt-0.5">
                    <svg
                      className="w-3.5 h-3.5 text-green"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2.5"
                    >
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                  </div>
                  <span className="text-sm text-text-secondary">{method}</span>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── Affected languages ── */}
        <section className="mb-14">
          <h2 className="text-xl md:text-2xl font-bold text-text-primary mb-4">
            Affected languages
          </h2>
          <div className="flex flex-wrap gap-2">
            {vuln.affectedLanguages.map((lang) => (
              <Link
                key={lang}
                href={`/scan/${lang.toLowerCase()}`}
                className="px-3 py-1.5 rounded-lg bg-bg-card border border-border text-sm text-text-secondary hover:border-green/30 hover:text-green transition-colors"
              >
                {lang}
              </Link>
            ))}
          </div>
        </section>

        {/* ── CTA ── */}
        <section className="text-center">
          <div className="bg-bg-card border border-border rounded-2xl p-8 md:p-12 relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-green/5 via-transparent to-orange/5 pointer-events-none" />
            <div className="relative">
              <h2 className="text-2xl md:text-3xl font-bold text-text-primary mb-4">
                Scan for {vuln.title.toLowerCase()} in your repos
              </h2>
              <p className="text-text-secondary mb-8 max-w-lg mx-auto">
                CodeShield detects {vuln.title.toLowerCase()} and {Object.keys(VULNERABILITIES).length - 1}+ other
                vulnerability types across your entire codebase. Auto-fix with
                AI in one click.
              </p>
              <Link
                href="/dashboard"
                className="inline-flex items-center gap-3 px-8 py-4 bg-green text-bg-primary font-semibold text-lg rounded-xl hover:bg-green-dim transition-all glow-green"
              >
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                </svg>
                Scan Your Repos Free
              </Link>
            </div>
          </div>
        </section>
      </div>

      {/* ── Footer ── */}
      <footer className="border-t border-border py-8 px-6 md:px-8 mt-12">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded bg-green/20 flex items-center justify-center border border-green/30">
              <svg
                width="12"
                height="12"
                viewBox="0 0 24 24"
                fill="none"
                stroke="#00ff88"
                strokeWidth="3"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
              </svg>
            </div>
            <span className="text-sm text-text-dim">
              CodeShield.ai &copy; {new Date().getFullYear()}
            </span>
          </div>
          <div className="flex items-center gap-6 text-sm text-text-dim">
            <Link
              href="/pricing"
              className="hover:text-text-secondary transition-colors"
            >
              Pricing
            </Link>
            <a
              href="mailto:hello@codeshield.ai"
              className="hover:text-text-secondary transition-colors"
            >
              Contact
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}
