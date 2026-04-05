import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";

/* ═══════════════════════════════════════════════════════════════════════════
   CWE Vulnerability data — inline for programmatic SEO (100+ pages)
   ═══════════════════════════════════════════════════════════════════════════ */

type Severity = "critical" | "high" | "medium";

interface CWEEntry {
  slug: string;
  cweId: string;
  title: string;
  severity: Severity;
  description: string;
  whyAiGenerates: string;
  vulnCode: string;
  fixedCode: string;
  languages: string[];
  category: string;
}

const CWE_DATABASE: CWEEntry[] = [
  /* ── Injection ── */
  {
    slug: "cwe-89",
    cweId: "CWE-89",
    title: "SQL Injection",
    severity: "critical",
    description:
      "SQL injection occurs when untrusted data is interpolated into a SQL query without sanitization, allowing attackers to read, modify, or delete database records. It remains the leading cause of data breaches in web applications and is ranked #1 in the OWASP Top 10 injection category.",
    whyAiGenerates:
      "AI assistants default to string concatenation and template literals when constructing SQL queries because that pattern dominates tutorial code in their training data. Over 30% of AI-generated database queries use f-strings, template literals, or string formatting instead of parameterized statements. The AI optimizes for readability and brevity, not security.",
    vulnCode: `# Python - AI-generated vulnerable code
@app.route("/api/users")
def get_user():
    email = request.args.get("email")
    cursor.execute(
        f"SELECT * FROM users WHERE email = '{email}'"
    )
    return jsonify(cursor.fetchall())`,
    fixedCode: `# Python - parameterized query (secure)
@app.route("/api/users")
def get_user():
    email = request.args.get("email")
    cursor.execute(
        "SELECT * FROM users WHERE email = %s",
        (email,)
    )
    return jsonify(cursor.fetchall())`,
    languages: ["Python", "JavaScript", "TypeScript", "Java", "Go", "PHP", "Ruby"],
    category: "Injection",
  },
  {
    slug: "cwe-79",
    cweId: "CWE-79",
    title: "Cross-Site Scripting (XSS)",
    severity: "high",
    description:
      "XSS allows attackers to inject malicious scripts into web pages viewed by other users, enabling session hijacking, credential theft, and page defacement. It exists in three forms: stored, reflected, and DOM-based XSS.",
    whyAiGenerates:
      "AI code generators routinely use innerHTML and dangerouslySetInnerHTML when asked to display dynamic content because these APIs produce the most concise code. Models trained on older tutorials and Stack Overflow answers default to the simplest DOM manipulation methods, which are inherently unsafe.",
    vulnCode: `// React - AI-generated vulnerable code
function Comment({ body }: { body: string }) {
  return (
    <div dangerouslySetInnerHTML={{ __html: body }} />
  );
}`,
    fixedCode: `// React - sanitized rendering (secure)
import DOMPurify from "dompurify";

function Comment({ body }: { body: string }) {
  const clean = DOMPurify.sanitize(body);
  return (
    <div dangerouslySetInnerHTML={{ __html: clean }} />
  );
}`,
    languages: ["JavaScript", "TypeScript", "PHP", "Ruby", "Java"],
    category: "Injection",
  },
  {
    slug: "cwe-78",
    cweId: "CWE-78",
    title: "OS Command Injection",
    severity: "critical",
    description:
      "OS command injection occurs when user input is passed unsanitized to a system shell, allowing attackers to execute arbitrary commands on the host operating system. Successful exploitation can lead to full server compromise, data exfiltration, and lateral movement.",
    whyAiGenerates:
      "AI assistants frequently use os.system(), subprocess with shell=True, or child_process.exec() when asked to run system commands because these are the simplest APIs. The models rarely suggest safer alternatives like subprocess.run with a list argument or execFile, which avoid shell interpretation entirely.",
    vulnCode: `# Python - AI-generated vulnerable code
import subprocess

def convert_file(filename):
    subprocess.run(
        f"convert {filename} output.pdf",
        shell=True
    )`,
    fixedCode: `# Python - no shell interpretation (secure)
import subprocess

def convert_file(filename):
    subprocess.run(
        ["convert", filename, "output.pdf"],
        shell=False
    )`,
    languages: ["Python", "JavaScript", "Ruby", "PHP", "Go", "Java"],
    category: "Injection",
  },
  {
    slug: "cwe-94",
    cweId: "CWE-94",
    title: "Code Injection via eval()",
    severity: "critical",
    description:
      "Code injection through eval() or similar dynamic code execution functions allows attackers to run arbitrary code within the application context. This can lead to remote code execution, data theft, and complete system compromise.",
    whyAiGenerates:
      "AI tools suggest eval() when asked to dynamically evaluate expressions, parse JSON from untrusted sources, or build calculators. The convenience of eval makes it the shortest solution for dynamic code execution, and AI models optimize for conciseness over safety.",
    vulnCode: `// Node.js - AI-generated vulnerable code
app.post("/api/calculate", (req, res) => {
  const { expression } = req.body;
  const result = eval(expression);
  res.json({ result });
});`,
    fixedCode: `// Node.js - safe expression parser (secure)
import { evaluate } from "mathjs";

app.post("/api/calculate", (req, res) => {
  const { expression } = req.body;
  const result = evaluate(expression);
  res.json({ result });
});`,
    languages: ["JavaScript", "TypeScript", "Python", "Ruby", "PHP"],
    category: "Injection",
  },

  /* ── Credentials & Secrets ── */
  {
    slug: "cwe-798",
    cweId: "CWE-798",
    title: "Hardcoded Credentials",
    severity: "critical",
    description:
      "Hardcoded credentials, including API keys, database passwords, and JWT secrets embedded in source code, are exposed when code is pushed to repositories. Even in private repos, secrets persist in git history after deletion. GitHub detected over 12 million secret exposures in public repos in 2024.",
    whyAiGenerates:
      "AI assistants produce hardcoded secrets constantly because their training data is full of tutorials and demo code with inline credentials. When asked to connect to a database or configure authentication, AI tools generate realistic-looking placeholder values that developers never replace before deployment.",
    vulnCode: `// Node.js - AI-generated vulnerable code
import jwt from "jsonwebtoken";

const JWT_SECRET = "super-secret-key-12345";
const token = jwt.sign(
  { userId: user.id },
  JWT_SECRET,
  { expiresIn: "7d" }
);`,
    fixedCode: `// Node.js - environment variable (secure)
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET;
if (!JWT_SECRET) throw new Error("JWT_SECRET not set");
const token = jwt.sign(
  { userId: user.id },
  JWT_SECRET,
  { expiresIn: "7d" }
);`,
    languages: ["JavaScript", "TypeScript", "Python", "Java", "Go", "Ruby", "PHP", "Rust"],
    category: "Credentials",
  },
  {
    slug: "cwe-321",
    cweId: "CWE-321",
    title: "Hardcoded Cryptographic Key",
    severity: "critical",
    description:
      "Hardcoded cryptographic keys in source code undermine the entire encryption scheme. If an attacker obtains the key from the code, they can decrypt all data ever encrypted with it. Unlike passwords, cryptographic keys cannot be easily rotated once embedded in distributed software.",
    whyAiGenerates:
      "When asked to encrypt data, AI tools generate inline key material as byte arrays or hex strings because that produces immediately runnable code. The model has no concept of key management infrastructure and defaults to the simplest approach that compiles.",
    vulnCode: `# Python - AI-generated vulnerable code
from cryptography.fernet import Fernet

KEY = b"ZmRmZDM4YjYtOGQxMS00MzA5LWE4M2UtNW"
cipher = Fernet(KEY)
encrypted = cipher.encrypt(b"sensitive data")`,
    fixedCode: `# Python - key from secure storage (secure)
import os
from cryptography.fernet import Fernet

KEY = os.environ["ENCRYPTION_KEY"].encode()
cipher = Fernet(KEY)
encrypted = cipher.encrypt(b"sensitive data")`,
    languages: ["Python", "JavaScript", "TypeScript", "Java", "Go", "Rust"],
    category: "Credentials",
  },

  /* ── Cryptography ── */
  {
    slug: "cwe-327",
    cweId: "CWE-327",
    title: "Broken Cryptography (MD5/SHA1/DES/RC4)",
    severity: "high",
    description:
      "Using broken or deprecated cryptographic algorithms like MD5, SHA-1, DES, or RC4 exposes data to practical attacks. MD5 and SHA-1 have demonstrated collision attacks, while DES and RC4 have exploitable weaknesses that make encrypted data recoverable.",
    whyAiGenerates:
      "AI models generate MD5 and SHA-1 hashing by default because these algorithms dominate the training corpus. When asked to hash a string or generate a checksum, AI tools reach for createHash('md5') or hashlib.sha1() because they appear in millions of code examples online.",
    vulnCode: `// Node.js - AI-generated vulnerable code
import { createHash } from "crypto";

function hashPassword(password: string) {
  return createHash("md5")
    .update(password)
    .digest("hex");
}`,
    fixedCode: `// Node.js - bcrypt for passwords (secure)
import bcrypt from "bcrypt";

async function hashPassword(password: string) {
  return bcrypt.hash(password, 12);
}`,
    languages: ["JavaScript", "TypeScript", "Python", "Java", "Go", "PHP", "Ruby", "Rust"],
    category: "Cryptography",
  },
  {
    slug: "cwe-326",
    cweId: "CWE-326",
    title: "Inadequate Encryption Strength (RSA-1024/2048)",
    severity: "high",
    description:
      "RSA keys below 3072 bits are considered inadequate by NIST for use beyond 2030. RSA-1024 can be factored with modern hardware, and RSA-2048 is being phased out as quantum computing advances. NIST recommends migrating to post-quantum algorithms entirely.",
    whyAiGenerates:
      "AI tools default to RSA-2048 because it has been the standard for two decades and dominates training data. When asked to generate a key pair, AI produces modulusLength: 2048 without considering current NIST guidance recommending minimum 3072-bit keys or migration to post-quantum cryptography.",
    vulnCode: `// Node.js - AI-generated vulnerable code
import { generateKeyPairSync } from "crypto";

const { publicKey, privateKey } = generateKeyPairSync(
  "rsa", { modulusLength: 1024 }
);`,
    fixedCode: `// Node.js - ML-KEM post-quantum (secure)
import { mlKem768 } from "@noble/post-quantum/ml-kem";

const { publicKey, secretKey } = mlKem768.keygen();
const { cipherText, sharedSecret } =
  mlKem768.encapsulate(publicKey);`,
    languages: ["JavaScript", "TypeScript", "Python", "Java", "Go", "Rust"],
    category: "Cryptography",
  },
  {
    slug: "cwe-295",
    cweId: "CWE-295",
    title: "Improper Certificate Validation",
    severity: "critical",
    description:
      "Disabling TLS certificate validation removes protection against man-in-the-middle attacks, allowing attackers on the network to intercept and modify all encrypted traffic. This is equivalent to having no encryption at all.",
    whyAiGenerates:
      "AI tools suggest disabling certificate verification whenever developers encounter SSL errors in development. The model sees thousands of Stack Overflow answers recommending verify=False or rejectUnauthorized: false as quick fixes, and reproduces this pattern without warning about the security implications.",
    vulnCode: `# Python - AI-generated vulnerable code
import requests

response = requests.get(
    "https://api.example.com/data",
    verify=False
)`,
    fixedCode: `# Python - proper cert validation (secure)
import requests

response = requests.get(
    "https://api.example.com/data",
    verify="/path/to/ca-bundle.crt"
)`,
    languages: ["Python", "JavaScript", "TypeScript", "Java", "Go", "Ruby"],
    category: "Cryptography",
  },
  {
    slug: "cwe-319",
    cweId: "CWE-319",
    title: "Cleartext Transmission of Sensitive Data",
    severity: "high",
    description:
      "Transmitting sensitive data like passwords, tokens, or personal information over unencrypted HTTP connections exposes it to network eavesdropping. Any attacker on the same network can intercept and read the data in transit.",
    whyAiGenerates:
      "AI tools generate HTTP URLs instead of HTTPS in API endpoint configurations, webhook registrations, and fetch calls because many training examples use http://localhost or http:// URLs. The model does not distinguish between development and production contexts.",
    vulnCode: `// JavaScript - AI-generated vulnerable code
const response = await fetch(
  "http://api.example.com/auth/login",
  {
    method: "POST",
    body: JSON.stringify({ email, password }),
  }
);`,
    fixedCode: `// JavaScript - HTTPS enforced (secure)
const response = await fetch(
  "https://api.example.com/auth/login",
  {
    method: "POST",
    body: JSON.stringify({ email, password }),
  }
);`,
    languages: ["JavaScript", "TypeScript", "Python", "Java", "Go", "PHP"],
    category: "Cryptography",
  },
  {
    slug: "cwe-330",
    cweId: "CWE-330",
    title: "Insufficient Randomness",
    severity: "high",
    description:
      "Using Math.random() or similar non-cryptographic PRNGs for security-sensitive operations like token generation, password resets, or session IDs produces predictable values. Attackers can predict future outputs and forge tokens.",
    whyAiGenerates:
      "AI assistants default to Math.random() for all randomness needs because it is the most common random function in JavaScript training data. Models do not distinguish between cryptographic and non-cryptographic randomness requirements, producing predictable tokens for authentication flows.",
    vulnCode: `// JavaScript - AI-generated vulnerable code
function generateResetToken() {
  return Math.random().toString(36).substring(2);
}`,
    fixedCode: `// JavaScript - crypto random (secure)
import { randomBytes } from "crypto";

function generateResetToken() {
  return randomBytes(32).toString("hex");
}`,
    languages: ["JavaScript", "TypeScript", "Python", "Java", "Go", "PHP"],
    category: "Cryptography",
  },
  {
    slug: "cwe-338",
    cweId: "CWE-338",
    title: "Weak Pseudo-Random Number Generator (PRNG)",
    severity: "high",
    description:
      "Using weak PRNGs like random.random() in Python or java.util.Random in Java for cryptographic purposes produces values that can be predicted by observing a small number of outputs. Session tokens, API keys, and nonces generated this way are vulnerable to brute-force and prediction attacks.",
    whyAiGenerates:
      "AI tools import the standard random module by default when asked to generate tokens or IDs because it requires no additional dependencies. The simplicity of random.choice() and random.randint() makes them the AI's first choice, even for security-critical randomness.",
    vulnCode: `# Python - AI-generated vulnerable code
import random
import string

def generate_api_key():
    chars = string.ascii_letters + string.digits
    return "".join(random.choice(chars) for _ in range(32))`,
    fixedCode: `# Python - secrets module (secure)
import secrets
import string

def generate_api_key():
    chars = string.ascii_letters + string.digits
    return "".join(secrets.choice(chars) for _ in range(32))`,
    languages: ["Python", "Java", "JavaScript", "Go", "Ruby", "PHP"],
    category: "Cryptography",
  },
  {
    slug: "cwe-347",
    cweId: "CWE-347",
    title: "Improper Cryptographic Signature Verification",
    severity: "critical",
    description:
      "Failing to verify cryptographic signatures on JWTs, webhooks, or software updates allows attackers to forge tokens and tamper with data. Accepting unverified tokens means any attacker can impersonate any user.",
    whyAiGenerates:
      "AI tools often generate JWT decoding without verification using jwt.decode with verify=False or algorithms='none' because many tutorials demonstrate decoding separately from verification. The AI produces code that reads token claims without confirming their authenticity.",
    vulnCode: `# Python - AI-generated vulnerable code
import jwt

def get_user_from_token(token):
    payload = jwt.decode(
        token,
        options={"verify_signature": False}
    )
    return payload["user_id"]`,
    fixedCode: `# Python - verified JWT decode (secure)
import jwt
import os

def get_user_from_token(token):
    payload = jwt.decode(
        token,
        os.environ["JWT_SECRET"],
        algorithms=["HS256"]
    )
    return payload["user_id"]`,
    languages: ["Python", "JavaScript", "TypeScript", "Java", "Go", "Ruby"],
    category: "Cryptography",
  },
  {
    slug: "cwe-312",
    cweId: "CWE-312",
    title: "Cleartext Storage of Sensitive Information",
    severity: "high",
    description:
      "Storing passwords, tokens, or personal data in plaintext in databases, files, or local storage means any data breach exposes all user credentials directly. Attackers who gain read access to the storage medium immediately obtain usable credentials.",
    whyAiGenerates:
      "AI tools store user passwords as plain strings in database columns because the generated signup/login code focuses on functionality, not security. Models produce INSERT statements with raw password values and SELECT queries that compare plaintext passwords directly.",
    vulnCode: `// Node.js - AI-generated vulnerable code
app.post("/api/register", async (req, res) => {
  const { email, password } = req.body;
  await db.query(
    "INSERT INTO users (email, password) VALUES ($1, $2)",
    [email, password]
  );
});`,
    fixedCode: `// Node.js - hashed password storage (secure)
import bcrypt from "bcrypt";

app.post("/api/register", async (req, res) => {
  const { email, password } = req.body;
  const hash = await bcrypt.hash(password, 12);
  await db.query(
    "INSERT INTO users (email, password) VALUES ($1, $2)",
    [email, hash]
  );
});`,
    languages: ["JavaScript", "TypeScript", "Python", "Java", "Go", "PHP", "Ruby"],
    category: "Cryptography",
  },

  /* ── Deserialization & Parsing ── */
  {
    slug: "cwe-502",
    cweId: "CWE-502",
    title: "Insecure Deserialization (pickle)",
    severity: "critical",
    description:
      "Deserializing untrusted data with pickle, yaml.load(), or Java ObjectInputStream allows attackers to execute arbitrary code by crafting malicious serialized payloads. Pickle deserialization is equivalent to eval() on attacker-controlled input.",
    whyAiGenerates:
      "AI tools default to pickle.loads() for Python serialization tasks because it handles arbitrary Python objects with a single function call. When asked to cache objects or transfer data between services, AI generates pickle code without any mention of the remote code execution risk.",
    vulnCode: `# Python - AI-generated vulnerable code
import pickle

@app.route("/api/load-session", methods=["POST"])
def load_session():
    data = request.get_data()
    session = pickle.loads(data)
    return jsonify(session)`,
    fixedCode: `# Python - safe JSON deserialization (secure)
import json

@app.route("/api/load-session", methods=["POST"])
def load_session():
    data = request.get_data()
    session = json.loads(data)
    return jsonify(session)`,
    languages: ["Python", "Java", "Ruby", "PHP", "JavaScript"],
    category: "Deserialization",
  },
  {
    slug: "cwe-611",
    cweId: "CWE-611",
    title: "XML External Entity (XXE) Injection",
    severity: "high",
    description:
      "XXE attacks exploit XML parsers that process external entity references, allowing attackers to read local files, perform SSRF, or cause denial of service. Default XML parser configurations in most languages are vulnerable to XXE.",
    whyAiGenerates:
      "AI tools use default XML parser constructors without disabling external entities because that is the simplest invocation. The models are unaware that the default configuration of most XML parsers is insecure and requires explicit hardening.",
    vulnCode: `# Python - AI-generated vulnerable code
from lxml import etree

def parse_xml(xml_string):
    parser = etree.XMLParser()
    tree = etree.fromstring(xml_string, parser)
    return tree`,
    fixedCode: `# Python - XXE-safe parsing (secure)
from lxml import etree

def parse_xml(xml_string):
    parser = etree.XMLParser(
        resolve_entities=False,
        no_network=True
    )
    tree = etree.fromstring(xml_string, parser)
    return tree`,
    languages: ["Java", "Python", "PHP", "Ruby", "Go", "JavaScript"],
    category: "Injection",
  },

  /* ── SSRF & Path Traversal ── */
  {
    slug: "cwe-918",
    cweId: "CWE-918",
    title: "Server-Side Request Forgery (SSRF)",
    severity: "high",
    description:
      "SSRF occurs when a server makes HTTP requests to URLs controlled by an attacker, allowing access to internal services, cloud metadata endpoints (169.254.169.254), and private network resources. SSRF is a top vector for cloud infrastructure compromise.",
    whyAiGenerates:
      "AI tools pass user-supplied URLs directly to fetch or requests.get without validation because URL fetching code is straightforward. The models do not include internal network filtering or URL allowlisting because these safeguards do not appear in most training examples.",
    vulnCode: `// Node.js - AI-generated vulnerable code
app.get("/api/preview", async (req, res) => {
  const { url } = req.query;
  const response = await fetch(url as string);
  const html = await response.text();
  res.send(html);
});`,
    fixedCode: `// Node.js - URL validation with allowlist (secure)
import { URL } from "url";

const ALLOWED_HOSTS = ["example.com", "cdn.example.com"];

app.get("/api/preview", async (req, res) => {
  const parsed = new URL(req.query.url as string);
  if (!ALLOWED_HOSTS.includes(parsed.hostname)) {
    return res.status(403).json({ error: "Blocked" });
  }
  const response = await fetch(parsed.toString());
  res.send(await response.text());
});`,
    languages: ["JavaScript", "TypeScript", "Python", "Java", "Go", "Ruby", "PHP"],
    category: "SSRF",
  },
  {
    slug: "cwe-22",
    cweId: "CWE-22",
    title: "Path Traversal",
    severity: "high",
    description:
      "Path traversal allows attackers to access files outside the intended directory by injecting sequences like ../ into file paths. This can expose sensitive system files, application source code, and configuration files containing secrets.",
    whyAiGenerates:
      "AI tools construct file paths by concatenating user input with a base directory without any validation or canonicalization. When asked to serve user-uploaded files or read documents by name, AI generates path joins with no traversal protection.",
    vulnCode: `// Node.js - AI-generated vulnerable code
import { readFileSync } from "fs";
import path from "path";

app.get("/api/files/:name", (req, res) => {
  const filePath = path.join("./uploads", req.params.name);
  const content = readFileSync(filePath);
  res.send(content);
});`,
    fixedCode: `// Node.js - resolved path validation (secure)
import { readFileSync } from "fs";
import path from "path";

const UPLOADS_DIR = path.resolve("./uploads");

app.get("/api/files/:name", (req, res) => {
  const filePath = path.resolve(UPLOADS_DIR, req.params.name);
  if (!filePath.startsWith(UPLOADS_DIR)) {
    return res.status(403).json({ error: "Forbidden" });
  }
  res.send(readFileSync(filePath));
});`,
    languages: ["JavaScript", "TypeScript", "Python", "Java", "Go", "PHP", "Ruby"],
    category: "File Handling",
  },
  {
    slug: "cwe-434",
    cweId: "CWE-434",
    title: "Unrestricted File Upload",
    severity: "critical",
    description:
      "Allowing unrestricted file uploads enables attackers to upload web shells, executables, or malicious scripts that can be executed on the server. Without file type validation, size limits, and content inspection, the upload endpoint becomes a direct path to remote code execution.",
    whyAiGenerates:
      "AI tools generate file upload handlers that save files directly to disk using the original filename without any validation of file type, size, or content. The model focuses on making the upload work and omits security controls that would add complexity to the code.",
    vulnCode: `// Node.js - AI-generated vulnerable code
import multer from "multer";

const upload = multer({ dest: "uploads/" });

app.post("/api/upload", upload.single("file"), (req, res) => {
  res.json({ path: req.file.path });
});`,
    fixedCode: `// Node.js - validated upload (secure)
import multer from "multer";
import path from "path";

const ALLOWED_TYPES = ["image/jpeg", "image/png", "application/pdf"];
const upload = multer({
  dest: "uploads/",
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    if (!ALLOWED_TYPES.includes(file.mimetype)) {
      return cb(new Error("Invalid file type"));
    }
    cb(null, true);
  },
});`,
    languages: ["JavaScript", "TypeScript", "Python", "Java", "PHP", "Go", "Ruby"],
    category: "File Handling",
  },

  /* ── Access Control ── */
  {
    slug: "cwe-352",
    cweId: "CWE-352",
    title: "Cross-Site Request Forgery (CSRF)",
    severity: "high",
    description:
      "CSRF attacks trick authenticated users into submitting unintended requests to a web application they are logged into. Without CSRF tokens, attackers can transfer funds, change passwords, or modify account settings by embedding malicious requests in third-party pages.",
    whyAiGenerates:
      "AI tools build form handlers and API endpoints without CSRF token validation because adding CSRF protection requires middleware configuration that complicates the generated code. Models produce POST handlers that accept and process requests without any origin verification.",
    vulnCode: `// Express - AI-generated vulnerable code
app.post("/api/transfer", async (req, res) => {
  const { to, amount } = req.body;
  await transferFunds(req.user.id, to, amount);
  res.json({ success: true });
});`,
    fixedCode: `// Express - CSRF protection (secure)
import csrf from "csurf";
const csrfProtection = csrf({ cookie: true });

app.post("/api/transfer", csrfProtection, async (req, res) => {
  const { to, amount } = req.body;
  await transferFunds(req.user.id, to, amount);
  res.json({ success: true });
});`,
    languages: ["JavaScript", "TypeScript", "Python", "Java", "PHP", "Ruby"],
    category: "Access Control",
  },
  {
    slug: "cwe-863",
    cweId: "CWE-863",
    title: "Incorrect Authorization",
    severity: "critical",
    description:
      "Incorrect authorization occurs when an application fails to verify that a user has permission to access a specific resource. This allows attackers to access other users' data, perform privileged actions, or escalate their role by manipulating request parameters.",
    whyAiGenerates:
      "AI tools generate CRUD endpoints that use IDs from request parameters to fetch resources without checking if the authenticated user owns or has access to that resource. The model produces functional code that retrieves data by ID but omits the critical ownership check.",
    vulnCode: `// Node.js - AI-generated vulnerable code (IDOR)
app.get("/api/invoices/:id", async (req, res) => {
  const invoice = await db.query(
    "SELECT * FROM invoices WHERE id = $1",
    [req.params.id]
  );
  res.json(invoice.rows[0]);
});`,
    fixedCode: `// Node.js - ownership check (secure)
app.get("/api/invoices/:id", async (req, res) => {
  const invoice = await db.query(
    "SELECT * FROM invoices WHERE id = $1 AND user_id = $2",
    [req.params.id, req.user.id]
  );
  if (!invoice.rows[0]) return res.status(404).end();
  res.json(invoice.rows[0]);
});`,
    languages: ["JavaScript", "TypeScript", "Python", "Java", "Go", "PHP", "Ruby"],
    category: "Access Control",
  },
  {
    slug: "cwe-287",
    cweId: "CWE-287",
    title: "Improper Authentication",
    severity: "critical",
    description:
      "Improper authentication allows attackers to bypass login mechanisms, use default credentials, or exploit weak authentication flows. This includes missing authentication on sensitive endpoints, timing-safe comparison failures, and accepting unsigned or self-issued tokens.",
    whyAiGenerates:
      "AI tools generate authentication code that compares passwords with simple equality operators (===) instead of constant-time comparison, accepts tokens without signature verification, and omits authentication middleware on sensitive API routes. The shortest working code often skips critical security checks.",
    vulnCode: `// Node.js - AI-generated vulnerable code
app.post("/api/login", async (req, res) => {
  const { email, password } = req.body;
  const user = await db.findUser(email);
  if (user.password === password) {
    res.json({ token: generateToken(user) });
  }
});`,
    fixedCode: `// Node.js - bcrypt comparison (secure)
import bcrypt from "bcrypt";

app.post("/api/login", async (req, res) => {
  const { email, password } = req.body;
  const user = await db.findUser(email);
  if (!user) return res.status(401).end();
  const valid = await bcrypt.compare(password, user.hash);
  if (!valid) return res.status(401).end();
  res.json({ token: generateToken(user) });
});`,
    languages: ["JavaScript", "TypeScript", "Python", "Java", "Go", "PHP", "Ruby"],
    category: "Authentication",
  },
  {
    slug: "cwe-307",
    cweId: "CWE-307",
    title: "Missing Rate Limiting (Brute Force)",
    severity: "medium",
    description:
      "Endpoints without rate limiting are vulnerable to brute-force attacks, credential stuffing, and denial of service. Login endpoints, password reset flows, and API endpoints that lack throttling allow attackers to make unlimited attempts.",
    whyAiGenerates:
      "AI tools generate authentication endpoints without any rate limiting because adding throttling requires middleware configuration and state management that the model considers out of scope for the immediate request. The generated login handler works correctly but has no protection against automated attacks.",
    vulnCode: `// Express - AI-generated vulnerable code
app.post("/api/login", async (req, res) => {
  const { email, password } = req.body;
  const user = await authenticate(email, password);
  if (!user) return res.status(401).end();
  res.json({ token: signToken(user) });
});`,
    fixedCode: `// Express - rate limited (secure)
import rateLimit from "express-rate-limit";

const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  message: "Too many attempts, try again later",
});

app.post("/api/login", loginLimiter, async (req, res) => {
  const user = await authenticate(req.body.email, req.body.password);
  if (!user) return res.status(401).end();
  res.json({ token: signToken(user) });
});`,
    languages: ["JavaScript", "TypeScript", "Python", "Java", "Go", "PHP"],
    category: "Access Control",
  },

  /* ── Information Exposure ── */
  {
    slug: "cwe-200",
    cweId: "CWE-200",
    title: "Information Exposure",
    severity: "medium",
    description:
      "Information exposure occurs when an application reveals sensitive data like stack traces, database schemas, internal paths, or user information in error messages and API responses. This information helps attackers map the application and plan targeted attacks.",
    whyAiGenerates:
      "AI tools generate error handlers that pass raw error objects to the client, including full stack traces, database error messages, and internal file paths. The model prioritizes debugging convenience over security, sending detailed error information to help developers but also informing attackers.",
    vulnCode: `// Node.js - AI-generated vulnerable code
app.use((err, req, res, next) => {
  res.status(500).json({
    error: err.message,
    stack: err.stack,
    query: err.sql,
  });
});`,
    fixedCode: `// Node.js - safe error handling (secure)
app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({
    error: "An internal error occurred",
  });
});`,
    languages: ["JavaScript", "TypeScript", "Python", "Java", "Go", "PHP", "Ruby"],
    category: "Information Exposure",
  },
  {
    slug: "cwe-532",
    cweId: "CWE-532",
    title: "Sensitive Data in Log Files",
    severity: "medium",
    description:
      "Logging sensitive data like passwords, tokens, credit card numbers, or personal information exposes these values to anyone with access to log files, log aggregation services, or SIEM platforms. Log files often have weaker access controls than production databases.",
    whyAiGenerates:
      "AI tools add verbose logging to generated code for debugging purposes, including logging entire request bodies, authorization headers, and user credentials. The model produces console.log(req.body) and logger.info(f'User login: {credentials}') without redacting sensitive fields.",
    vulnCode: `# Python - AI-generated vulnerable code
@app.route("/api/login", methods=["POST"])
def login():
    data = request.get_json()
    logger.info(f"Login attempt: {data}")
    user = authenticate(data["email"], data["password"])
    return jsonify({"token": create_token(user)})`,
    fixedCode: `# Python - redacted logging (secure)
@app.route("/api/login", methods=["POST"])
def login():
    data = request.get_json()
    logger.info(f"Login attempt for: {data['email']}")
    user = authenticate(data["email"], data["password"])
    return jsonify({"token": create_token(user)})`,
    languages: ["Python", "JavaScript", "TypeScript", "Java", "Go", "Ruby"],
    category: "Information Exposure",
  },

  /* ── Configuration ── */
  {
    slug: "cwe-942",
    cweId: "CWE-942",
    title: "CORS Misconfiguration",
    severity: "high",
    description:
      "Overly permissive CORS policies that allow any origin (Access-Control-Allow-Origin: *) with credentials enable attackers on any domain to make authenticated API requests on behalf of users. This bypasses the same-origin policy that is the foundation of browser security.",
    whyAiGenerates:
      "AI tools configure CORS with origin: '*' and credentials: true because that is the fastest way to eliminate CORS errors during development. The wildcard origin appears in virtually every CORS tutorial and Stack Overflow answer, and AI reproduces it without distinguishing between development and production configurations.",
    vulnCode: `// Express - AI-generated vulnerable code
import cors from "cors";

app.use(cors({
  origin: "*",
  credentials: true,
}));`,
    fixedCode: `// Express - restricted CORS (secure)
import cors from "cors";

const ALLOWED_ORIGINS = [
  "https://app.example.com",
  "https://admin.example.com",
];

app.use(cors({
  origin: ALLOWED_ORIGINS,
  credentials: true,
}));`,
    languages: ["JavaScript", "TypeScript", "Python", "Java", "Go", "PHP", "Ruby"],
    category: "Configuration",
  },
  {
    slug: "cwe-614",
    cweId: "CWE-614",
    title: "Missing Secure Cookie Flag",
    severity: "medium",
    description:
      "Cookies without the Secure flag are transmitted over unencrypted HTTP connections, allowing network attackers to intercept session tokens and authentication cookies. This enables session hijacking on any insecure network, including public Wi-Fi.",
    whyAiGenerates:
      "AI tools set cookies without the Secure flag because many training examples configure cookies for localhost development where HTTPS is not available. The generated res.cookie() calls include basic options but omit the Secure flag that is essential for production.",
    vulnCode: `// Express - AI-generated vulnerable code
res.cookie("session", token, {
  httpOnly: true,
  maxAge: 86400000,
});`,
    fixedCode: `// Express - secure cookie flags (secure)
res.cookie("session", token, {
  httpOnly: true,
  secure: true,
  sameSite: "strict",
  maxAge: 86400000,
});`,
    languages: ["JavaScript", "TypeScript", "Python", "Java", "PHP", "Ruby"],
    category: "Configuration",
  },
  {
    slug: "cwe-1004",
    cweId: "CWE-1004",
    title: "Missing HttpOnly Cookie Flag",
    severity: "medium",
    description:
      "Cookies without the HttpOnly flag are accessible to JavaScript via document.cookie, allowing XSS attacks to steal session tokens and authentication cookies. The HttpOnly flag prevents client-side scripts from reading cookie values.",
    whyAiGenerates:
      "AI tools often generate cookie-setting code without the httpOnly flag because many frontend tutorials demonstrate reading cookies from JavaScript, which requires cookies without HttpOnly. The model generates cookies optimized for accessibility rather than security.",
    vulnCode: `// Express - AI-generated vulnerable code
res.cookie("authToken", token, {
  maxAge: 3600000,
  path: "/",
});`,
    fixedCode: `// Express - HttpOnly cookie (secure)
res.cookie("authToken", token, {
  httpOnly: true,
  secure: true,
  sameSite: "strict",
  maxAge: 3600000,
  path: "/",
});`,
    languages: ["JavaScript", "TypeScript", "Python", "Java", "PHP", "Ruby"],
    category: "Configuration",
  },
  {
    slug: "cwe-16",
    cweId: "CWE-16",
    title: "Insecure TLS Configuration (TLS 1.0/1.1)",
    severity: "high",
    description:
      "Enabling TLS 1.0 or TLS 1.1 exposes connections to known cryptographic attacks including BEAST, POODLE, and Lucky13. NIST, PCI DSS, and all major browsers have deprecated these protocol versions. Only TLS 1.2 and TLS 1.3 are considered secure.",
    whyAiGenerates:
      "AI tools generate TLS server configurations that set minVersion to TLSv1 for maximum compatibility because their training data includes server configurations from the era when TLS 1.0 was standard. The model prioritizes broad client support over protocol security.",
    vulnCode: `// Node.js - AI-generated vulnerable code
import https from "https";

const server = https.createServer({
  key: privateKey,
  cert: certificate,
  minVersion: "TLSv1",
});`,
    fixedCode: `// Node.js - modern TLS only (secure)
import https from "https";

const server = https.createServer({
  key: privateKey,
  cert: certificate,
  minVersion: "TLSv1.2",
  ciphers: "TLS_AES_256_GCM_SHA384:TLS_AES_128_GCM_SHA256",
});`,
    languages: ["JavaScript", "TypeScript", "Python", "Java", "Go", "Ruby"],
    category: "Configuration",
  },

  /* ── Resource Management ── */
  {
    slug: "cwe-400",
    cweId: "CWE-400",
    title: "Uncontrolled Resource Consumption (DoS)",
    severity: "medium",
    description:
      "Endpoints that accept unbounded input sizes, allow unlimited request rates, or perform expensive operations without limits are vulnerable to denial-of-service attacks. Attackers can exhaust server memory, CPU, or disk space with crafted requests.",
    whyAiGenerates:
      "AI tools generate request handlers that parse unlimited JSON bodies, accept arbitrarily large file uploads, and perform regex matching on user input without size constraints. The model generates functional code without considering adversarial input sizes.",
    vulnCode: `// Express - AI-generated vulnerable code
app.post("/api/data", (req, res) => {
  const data = JSON.parse(req.body);
  processData(data);
  res.json({ ok: true });
});`,
    fixedCode: `// Express - bounded input (secure)
import express from "express";

app.use(express.json({ limit: "100kb" }));

app.post("/api/data", (req, res) => {
  processData(req.body);
  res.json({ ok: true });
});`,
    languages: ["JavaScript", "TypeScript", "Python", "Java", "Go", "PHP"],
    category: "Resource Management",
  },

  /* ═══════════════════════════════════════════════════════════════════════════
     PQC-specific entries — quantum computing vulnerabilities
     ═══════════════════════════════════════════════════════════════════════════ */
  {
    slug: "pqc-rsa",
    cweId: "PQC-RSA",
    title: "RSA Quantum Vulnerability",
    severity: "critical",
    description:
      "RSA encryption is mathematically broken by Shor's algorithm on a quantum computer. NIST has announced deprecation of RSA for all key sizes by 2030, with complete disallow by 2035. 'Harvest now, decrypt later' attacks mean data encrypted with RSA today can be stored and decrypted once quantum computers arrive.",
    whyAiGenerates:
      "AI code assistants generate RSA by default for virtually all asymmetric cryptography tasks. When asked to generate key pairs, encrypt data, or sign JWTs, AI produces RSA-2048 because that dominates training data. The models have no awareness of NIST deprecation timelines, post-quantum standards, or the harvest-now-decrypt-later threat model.",
    vulnCode: `// Node.js - AI-generated quantum-vulnerable code
import { generateKeyPairSync } from "crypto";

const { publicKey, privateKey } = generateKeyPairSync(
  "rsa",
  {
    modulusLength: 2048,
    publicKeyEncoding: { type: "spki", format: "pem" },
    privateKeyEncoding: { type: "pkcs8", format: "pem" },
  }
);`,
    fixedCode: `// Node.js - ML-KEM post-quantum (secure)
import { mlKem768 } from "@noble/post-quantum/ml-kem";

// FIPS 203 ML-KEM: quantum-resistant key encapsulation
const { publicKey, secretKey } = mlKem768.keygen();
const { cipherText, sharedSecret } =
  mlKem768.encapsulate(publicKey);
const decrypted = mlKem768.decapsulate(cipherText, secretKey);`,
    languages: ["JavaScript", "TypeScript", "Python", "Java", "Go", "Rust", "Ruby", "PHP"],
    category: "Post-Quantum Cryptography",
  },
  {
    slug: "pqc-ecdsa",
    cweId: "PQC-ECDSA",
    title: "ECDSA/ECDH Quantum Vulnerability",
    severity: "high",
    description:
      "Elliptic Curve Cryptography, including ECDSA, ECDH, Ed25519, and X25519, is broken by Shor's algorithm just like RSA. Although ECC is faster and uses smaller keys, it provides zero additional quantum resistance. NIST's deprecation timeline applies equally to all elliptic curve algorithms.",
    whyAiGenerates:
      "AI tools frequently suggest ECC as a 'modern, more secure alternative to RSA,' which is true for classical attacks but irrelevant against quantum computers. When developers ask AI to use a more secure algorithm, the AI suggests ECDSA P-256 or Ed25519, giving a false sense of future-proof security.",
    vulnCode: `# Python - AI-generated quantum-vulnerable code
from cryptography.hazmat.primitives.asymmetric import ec

# ECDSA P-256 is broken by Shor's algorithm
private_key = ec.generate_private_key(ec.SECP256R1())

shared_key = private_key.exchange(
    ec.ECDH(), peer_public_key
)`,
    fixedCode: `# Python - ML-DSA post-quantum signature (secure)
from pqcrypto.sign.dilithium3 import (
    generate_keypair, sign, verify
)

# FIPS 204 ML-DSA: quantum-resistant signatures
public_key, secret_key = generate_keypair()
signature = sign(secret_key, message)
verify(public_key, message, signature)`,
    languages: ["JavaScript", "TypeScript", "Python", "Java", "Go", "Rust", "Ruby"],
    category: "Post-Quantum Cryptography",
  },
  {
    slug: "pqc-dh",
    cweId: "PQC-DH",
    title: "Diffie-Hellman Quantum Vulnerability",
    severity: "high",
    description:
      "Classic Diffie-Hellman key exchange relies on the discrete logarithm problem, which Shor's algorithm solves efficiently on a quantum computer. DH is widely used in TLS, SSH, IPsec, and VPN protocols. All DH-based key exchanges must migrate to ML-KEM (FIPS 203) for quantum resistance.",
    whyAiGenerates:
      "AI tools generate classic DH key exchange code when asked to implement secure key agreement between parties. The model suggests createDiffieHellman() or DH parameter generation without any mention of quantum vulnerability. Training data contains decades of DH examples but almost no post-quantum alternatives.",
    vulnCode: `// Node.js - AI-generated quantum-vulnerable code
import { createDiffieHellman } from "crypto";

const alice = createDiffieHellman(2048);
alice.generateKeys();
const alicePublic = alice.getPublicKey();

// Bob receives Alice's public key and computes shared secret
const sharedSecret = bob.computeSecret(alicePublic);`,
    fixedCode: `// Node.js - ML-KEM post-quantum key exchange (secure)
import { mlKem768 } from "@noble/post-quantum/ml-kem";

// Alice generates ML-KEM keypair
const alice = mlKem768.keygen();

// Bob encapsulates shared secret with Alice's public key
const { cipherText, sharedSecret: bobSecret } =
  mlKem768.encapsulate(alice.publicKey);

// Alice decapsulates to get the same shared secret
const aliceSecret = mlKem768.decapsulate(cipherText, alice.secretKey);`,
    languages: ["JavaScript", "TypeScript", "Python", "Java", "Go", "Rust"],
    category: "Post-Quantum Cryptography",
  },
];

/* ═══════════════════════════════════════════════════════════════════════════
   Lookup map — slug -> entry
   ═══════════════════════════════════════════════════════════════════════════ */

const CWE_MAP: Record<string, CWEEntry> = {};
for (const entry of CWE_DATABASE) {
  CWE_MAP[entry.slug] = entry;
}

const SEVERITY_BADGE: Record<Severity, string> = {
  critical: "badge-critical",
  high: "badge-high",
  medium: "badge-medium",
};

/* ═══════════════════════════════════════════════════════════════════════════
   Static generation — pre-render all pages
   ═══════════════════════════════════════════════════════════════════════════ */

export function generateStaticParams() {
  return CWE_DATABASE.map((entry) => ({ cwe: entry.slug }));
}

/* ═══════════════════════════════════════════════════════════════════════════
   Per-page SEO metadata
   ═══════════════════════════════════════════════════════════════════════════ */

export async function generateMetadata({
  params,
}: {
  params: Promise<{ cwe: string }>;
}): Promise<Metadata> {
  const { cwe } = await params;
  const entry = CWE_MAP[cwe];
  if (!entry) return {};

  const pageTitle = `${entry.cweId}: ${entry.title} in AI-Generated Code`;

  return {
    title: pageTitle,
    description: `Detect and fix ${entry.title} (${entry.cweId}) in AI-generated code. Real vulnerable code examples, secure alternatives, and automated scanning with CodeShield.ai.`,
    keywords: [
      entry.cweId,
      entry.title,
      `${entry.title} AI code`,
      `${entry.title} fix`,
      `${entry.title} detection`,
      "AI code vulnerability",
      "code security scanner",
      "CodeShield",
    ],
    alternates: { canonical: `/vuln/${cwe}` },
    openGraph: {
      title: `${pageTitle} | CodeShield.ai`,
      description: `Detect and auto-fix ${entry.title} (${entry.cweId}) in AI-generated code. Real code examples and secure alternatives.`,
      type: "article",
    },
    twitter: {
      card: "summary_large_image",
      title: `${pageTitle} | CodeShield.ai`,
      description: `Detect and auto-fix ${entry.title} (${entry.cweId}) in AI-generated code.`,
    },
  };
}

/* ═══════════════════════════════════════════════════════════════════════════
   Page component
   ═══════════════════════════════════════════════════════════════════════════ */

export default async function CWEVulnerabilityPage({
  params,
}: {
  params: Promise<{ cwe: string }>;
}) {
  const { cwe } = await params;
  const entry = CWE_MAP[cwe];

  if (!entry) {
    notFound();
  }

  return (
    <div className="min-h-screen bg-bg-primary">
      {/* ── Nav ── */}
      <nav className="flex items-center justify-between px-6 md:px-8 py-5 max-w-7xl mx-auto">
        <Link href="/" className="flex items-center gap-2">
          <img src="/logo.svg" width={24} height={24} alt="CodeShield.ai logo" />
          <span className="font-bold text-lg tracking-tight text-text-primary">
            CodeShield<span className="text-green">.ai</span>
          </span>
        </Link>
        <div className="flex items-center gap-6">
          <Link
            href="/scan-free"
            className="text-sm text-text-secondary hover:text-text-primary transition-colors"
          >
            Free Scan
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
              className={`${SEVERITY_BADGE[entry.severity]} px-3 py-1 rounded-full text-xs font-bold font-mono uppercase`}
            >
              {entry.severity}
            </span>
            <span className="text-xs text-text-dim font-mono">{entry.category}</span>
          </div>
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-text-primary mb-6 leading-tight">
            {entry.cweId}: {entry.title}
          </h1>
          <p className="text-text-secondary text-lg leading-relaxed max-w-3xl">
            {entry.description}
          </p>
        </div>

        {/* ── Why AI tools generate this ── */}
        <section className="mb-14">
          <h2 className="text-xl md:text-2xl font-bold text-text-primary mb-6">
            Why AI tools generate this vulnerability
          </h2>
          <div className="bg-bg-surface border border-border rounded-2xl p-6 md:p-8 relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-orange/5 via-transparent to-transparent pointer-events-none" />
            <div className="relative">
              <div className="flex items-center gap-2 mb-4">
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="#F59E0B"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
                  <line x1="12" y1="9" x2="12" y2="13" />
                  <line x1="12" y1="17" x2="12.01" y2="17" />
                </svg>
                <span className="text-sm font-semibold text-orange">AI Risk Factor</span>
              </div>
              <p className="text-text-secondary leading-relaxed">{entry.whyAiGenerates}</p>
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
              {entry.vulnCode}
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
              {entry.fixedCode}
            </pre>
          </div>
        </section>

        {/* ── Affected languages ── */}
        <section className="mb-14">
          <h2 className="text-xl md:text-2xl font-bold text-text-primary mb-4">
            Affected languages
          </h2>
          <div className="flex flex-wrap gap-2">
            {entry.languages.map((lang) => (
              <span
                key={lang}
                className="px-3 py-1.5 rounded-lg bg-bg-elevated border border-border text-sm text-text-secondary"
              >
                {lang}
              </span>
            ))}
          </div>
        </section>

        {/* ── CTA Card ── */}
        <section className="mb-14">
          <div className="card p-8 md:p-12 text-center relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-green/5 via-transparent to-orange/5 pointer-events-none" />
            <div className="relative">
              <h2 className="text-2xl md:text-3xl font-bold text-text-primary mb-4">
                Scan your code for this vulnerability
              </h2>
              <p className="text-text-secondary mb-8 max-w-lg mx-auto">
                CodeShield detects {entry.title} and {CWE_DATABASE.length - 1}+ other
                vulnerability types across your entire codebase. Auto-fix with AI in one click.
              </p>
              <Link href="/scan-free" className="btn-primary text-lg px-8 py-4 glow-green">
                Scan Your Code Free
              </Link>
            </div>
          </div>
        </section>

        {/* ── Back link ── */}
        <div className="text-center">
          <Link
            href="/vuln"
            className="text-sm text-text-dim hover:text-green transition-colors"
          >
            &larr; View all vulnerabilities
          </Link>
        </div>
      </div>

      {/* ── Footer ── */}
      <footer className="border-t border-border py-8 px-6 md:px-8 mt-12">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <img src="/logo.svg" width={16} height={16} alt="" />
            <span className="text-sm text-text-dim">
              CodeShield.ai &copy; {new Date().getFullYear()}
            </span>
          </div>
          <div className="flex items-center gap-6 text-sm text-text-dim">
            <Link href="/pricing" className="hover:text-text-secondary transition-colors">
              Pricing
            </Link>
            <Link href="/scan-free" className="hover:text-text-secondary transition-colors">
              Free Scan
            </Link>
            <a href="mailto:hello@codeshield.ai" className="hover:text-text-secondary transition-colors">
              Contact
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}
