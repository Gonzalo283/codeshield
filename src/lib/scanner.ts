import { Vulnerability, Severity, Category, RepoFile } from "@/types";

interface Pattern {
  regex: RegExp;
  severity: Severity;
  category: Category;
  title: string;
  description: string;
  suggestedFix: string;
  autoFixable: boolean;
}

const patterns: Pattern[] = [
  // ── Post-Quantum Crypto (PQC) ──
  {
    regex: /\b(generateKeyPair|createSign|createVerify)\s*\(\s*['"]rsa['"]/gi,
    severity: "critical",
    category: "pqc",
    title: "RSA Key Generation/Usage",
    description:
      "RSA is vulnerable to quantum computing attacks. NIST recommends migrating to post-quantum algorithms (ML-KEM, ML-DSA) by 2030.",
    suggestedFix:
      "Replace RSA with a post-quantum algorithm such as ML-KEM (CRYSTALS-Kyber) for key exchange or ML-DSA (CRYSTALS-Dilithium) for signatures.",
    autoFixable: true,
  },
  {
    regex: /\bRSA\b.*?(encrypt|decrypt|sign|verify|key|generate)/gi,
    severity: "critical",
    category: "pqc",
    title: "RSA Cryptographic Operation",
    description:
      "RSA cryptographic operations are not quantum-safe. Transition to PQC algorithms before Q-Day.",
    suggestedFix:
      "Migrate to NIST-approved post-quantum cryptography standards.",
    autoFixable: true,
  },
  {
    regex: /\b(ECDSA|ECDH|Ed25519|X25519|secp256k1)\b/g,
    severity: "high",
    category: "pqc",
    title: "Elliptic Curve Cryptography Usage",
    description:
      "ECC algorithms (ECDSA, ECDH, Ed25519, X25519, secp256k1) are vulnerable to Shor's algorithm on quantum computers.",
    suggestedFix:
      "Plan migration to ML-DSA (for signatures) or ML-KEM (for key exchange). Consider hybrid approaches during transition.",
    autoFixable: true,
  },
  {
    regex: /\b(createDiffieHellman|DiffieHellman|diffie[-_]?hellman)\b/gi,
    severity: "high",
    category: "pqc",
    title: "Diffie-Hellman Key Exchange",
    description:
      "Classic Diffie-Hellman is vulnerable to quantum attacks. Use post-quantum key encapsulation mechanisms.",
    suggestedFix:
      "Replace with ML-KEM (CRYSTALS-Kyber) for key encapsulation.",
    autoFixable: true,
  },
  {
    regex: /\b(sha-?1|SHA1)\b|createHash\s*\(\s*['"]sha1['"]\)/gi,
    severity: "medium",
    category: "pqc",
    title: "SHA-1 Hash Function",
    description:
      "SHA-1 is cryptographically broken. Collision attacks are practical and well-documented.",
    suggestedFix: "Replace SHA-1 with SHA-256 or SHA-3.",
    autoFixable: true,
  },

  // ── Extended PQC & Weak Crypto Patterns ──

  // AES-128 usage (quantum reduces to 64-bit security)
  {
    regex: /\bAES[-_]?128\b|['"]aes-128-/gi,
    severity: "medium",
    category: "pqc",
    title: "AES-128 Usage (Quantum-Vulnerable Key Size)",
    description:
      "AES-128 is reduced to 64-bit security under Grover's algorithm on quantum computers. Use AES-256 for quantum resilience.",
    suggestedFix:
      "Upgrade to AES-256 to maintain 128-bit security in a post-quantum context.",
    autoFixable: true,
  },
  // 3DES / DES usage
  {
    regex: /\b(3DES|triple[-_]?des|DESede)\b|['"]des-ede3-|createCipher(?:iv)?\s*\(\s*['"]des\b/gi,
    severity: "high",
    category: "weak-crypto",
    title: "3DES / DES Cipher Usage",
    description:
      "DES and 3DES are obsolete ciphers with insufficient key lengths. They are trivially broken with modern hardware and completely insecure against quantum attacks.",
    suggestedFix:
      "Replace with AES-256-GCM or a post-quantum symmetric cipher.",
    autoFixable: true,
  },
  // MD5 hash usage
  {
    regex: /\bMD5\b|createHash\s*\(\s*['"]md5['"]\)/gi,
    severity: "medium",
    category: "weak-crypto",
    title: "MD5 Hash Function Usage",
    description:
      "MD5 is cryptographically broken. Collision attacks are trivial, and it provides no security against quantum or classical adversaries.",
    suggestedFix: "Replace MD5 with SHA-256 or SHA-3.",
    autoFixable: true,
  },
  // HMAC with SHA-1
  {
    regex: /createHmac\s*\(\s*['"]sha1['"]\)|HMAC[-_]?SHA[-_]?1\b/gi,
    severity: "medium",
    category: "weak-crypto",
    title: "HMAC with SHA-1",
    description:
      "HMAC-SHA1 uses a weakened hash function. While HMAC construction mitigates some attacks, SHA-1 is deprecated by NIST.",
    suggestedFix:
      "Replace with HMAC-SHA256 or HMAC-SHA3.",
    autoFixable: true,
  },
  // RSA key sizes < 3072
  {
    regex: /(?:modulusLength|keySize|key_size)\s*[:=]\s*(?:512|768|1024|2048)\b/gi,
    severity: "critical",
    category: "pqc",
    title: "RSA Key Size Below 3072 Bits",
    description:
      "RSA keys smaller than 3072 bits do not meet current NIST minimum recommendations and are especially vulnerable to quantum factoring via Shor's algorithm.",
    suggestedFix:
      "Use a minimum RSA key size of 3072 bits, or preferably migrate to post-quantum algorithms (ML-KEM, ML-DSA).",
    autoFixable: true,
  },
  // DSA algorithm usage
  {
    regex: /\bDSA\b.*?(?:sign|verify|key|generate)|(?:sign|verify|key|generate).*?\bDSA\b|['"]dsa['"]/gi,
    severity: "high",
    category: "pqc",
    title: "DSA Algorithm Usage",
    description:
      "DSA is vulnerable to quantum attacks via Shor's algorithm and has been deprecated by NIST in FIPS 186-5.",
    suggestedFix:
      "Migrate to ML-DSA (CRYSTALS-Dilithium) or Ed25519 as a short-term measure.",
    autoFixable: true,
  },
  // RC4 cipher usage
  {
    regex: /\bRC4\b|['"]rc4['"]/gi,
    severity: "high",
    category: "weak-crypto",
    title: "RC4 Cipher Usage",
    description:
      "RC4 is a broken stream cipher with multiple practical attacks. It has been prohibited by RFC 7465 for TLS.",
    suggestedFix:
      "Replace with AES-256-GCM or ChaCha20-Poly1305.",
    autoFixable: true,
  },
  // Blowfish cipher usage
  {
    regex: /\bBlowfish\b|['"]bf-|createCipher(?:iv)?\s*\(\s*['"]blowfish['"]/gi,
    severity: "medium",
    category: "weak-crypto",
    title: "Blowfish Cipher Usage",
    description:
      "Blowfish has a 64-bit block size making it vulnerable to birthday attacks (Sweet32). It is not suitable for modern cryptographic use.",
    suggestedFix:
      "Replace with AES-256-GCM or ChaCha20-Poly1305.",
    autoFixable: true,
  },
  // Static/hardcoded IVs/nonces
  {
    regex: /\b(?:iv|nonce|IV|NONCE)\s*[:=]\s*(?:['"][^'"]+['"]|Buffer\.from\s*\(\s*['"]|new\s+Uint8Array\s*\(\s*\[)/gi,
    severity: "high",
    category: "weak-crypto",
    title: "Static / Hardcoded IV or Nonce",
    description:
      "Using a static or hardcoded initialization vector (IV) or nonce breaks the semantic security of encryption schemes and can allow plaintext recovery.",
    suggestedFix:
      "Generate a cryptographically random IV/nonce for each encryption operation using crypto.randomBytes() or equivalent.",
    autoFixable: false,
  },
  // crypto.randomBytes with small sizes (<16)
  {
    regex: /crypto\.randomBytes\s*\(\s*([1-9]|1[0-5])\s*\)/g,
    severity: "medium",
    category: "weak-crypto",
    title: "Insufficient Random Byte Length",
    description:
      "Generating fewer than 16 random bytes (128 bits) may not provide adequate security for keys, IVs, or tokens.",
    suggestedFix:
      "Use at least 16 bytes (128 bits) for random values, or 32 bytes (256 bits) for post-quantum security margins.",
    autoFixable: true,
  },
  // OpenSSL legacy provider usage
  {
    regex: /--openssl-legacy-provider|OPENSSL_LEGACY_PROVIDER|legacy\s*provider/gi,
    severity: "medium",
    category: "weak-crypto",
    title: "OpenSSL Legacy Provider Usage",
    description:
      "The OpenSSL legacy provider enables deprecated and insecure algorithms. This often masks underlying use of broken cryptography.",
    suggestedFix:
      "Update code to use modern algorithms supported by the default OpenSSL provider.",
    autoFixable: false,
  },
  // TLS 1.0/1.1 usage
  {
    regex: /\bTLS(?:v?1[._][01]|1_0|1_1)\b|['"]TLSv1['".]|minVersion\s*[:=]\s*['"]TLSv1(?:\.1)?['"]/gi,
    severity: "high",
    category: "tls",
    title: "TLS 1.0 / 1.1 Protocol Usage",
    description:
      "TLS 1.0 and 1.1 are deprecated (RFC 8996) due to known vulnerabilities including BEAST, POODLE, and lack of modern cipher suites.",
    suggestedFix:
      "Enforce TLS 1.2 as minimum, preferably TLS 1.3.",
    autoFixable: true,
  },
  // SSL protocol usage
  {
    regex: /\bSSLv[23]\b|['"]SSLv[23]['"]|PROTOCOL_SSLv[23]|ssl\.PROTOCOL_SSL/gi,
    severity: "critical",
    category: "tls",
    title: "SSL Protocol Usage (SSLv2/SSLv3)",
    description:
      "SSL 2.0 and 3.0 are fundamentally broken protocols with no security guarantees. POODLE and DROWN attacks make them trivially exploitable.",
    suggestedFix:
      "Remove all SSL usage and enforce TLS 1.2+ as the minimum protocol version.",
    autoFixable: true,
  },
  // Certificate pinning disabled
  {
    regex: /(?:certificate[-_]?pinning|cert[-_]?pinning|pin[-_]?certificates?)\s*[:=]\s*(?:false|False|0|disabled|off)/gi,
    severity: "medium",
    category: "tls",
    title: "Certificate Pinning Disabled",
    description:
      "Disabling certificate pinning allows man-in-the-middle attacks with rogue or compromised CA certificates.",
    suggestedFix:
      "Enable certificate pinning with known good certificate hashes for critical connections.",
    autoFixable: false,
  },
  // Weak PBKDF2 iterations (<100000)
  {
    regex: /pbkdf2(?:Sync)?\s*\([^)]*,\s*(\d{1,5})\s*[,)]/gi,
    severity: "medium",
    category: "weak-crypto",
    title: "Weak PBKDF2 Iteration Count",
    description:
      "PBKDF2 with fewer than 100,000 iterations does not provide adequate resistance to brute-force attacks. OWASP recommends at least 600,000 iterations for SHA-256.",
    suggestedFix:
      "Increase PBKDF2 iterations to at least 600,000 (OWASP 2023 recommendation), or migrate to Argon2id.",
    autoFixable: true,
  },

  // ── Python-Specific Patterns ──
  {
    regex: /\bhashlib\.md5\b/g,
    severity: "medium",
    category: "weak-crypto",
    title: "Python hashlib.md5 Usage",
    description:
      "hashlib.md5() uses the cryptographically broken MD5 algorithm. Collisions can be generated in seconds.",
    suggestedFix:
      "Replace with hashlib.sha256() or hashlib.sha3_256().",
    autoFixable: true,
  },
  {
    regex: /\bhashlib\.sha1\b/g,
    severity: "medium",
    category: "weak-crypto",
    title: "Python hashlib.sha1 Usage",
    description:
      "hashlib.sha1() uses the deprecated SHA-1 algorithm, which has known collision attacks (SHAttered).",
    suggestedFix:
      "Replace with hashlib.sha256() or hashlib.sha3_256().",
    autoFixable: true,
  },
  {
    regex: /from\s+Crypto\.Cipher\s+import\s+(?:DES|Blowfish)/g,
    severity: "high",
    category: "weak-crypto",
    title: "Python PyCryptodome DES/Blowfish Import",
    description:
      "Importing DES or Blowfish from PyCryptodome indicates use of obsolete ciphers that are insecure against both classical and quantum attacks.",
    suggestedFix:
      "Use Crypto.Cipher.AES with a 256-bit key in GCM mode instead.",
    autoFixable: true,
  },
  {
    regex: /ssl\.PROTOCOL_TLSv1\b|ssl\.PROTOCOL_TLSv1_1\b/g,
    severity: "high",
    category: "tls",
    title: "Python ssl.PROTOCOL_TLSv1/1.1 Usage",
    description:
      "Using ssl.PROTOCOL_TLSv1 or TLSv1_1 forces deprecated TLS versions with known vulnerabilities.",
    suggestedFix:
      "Use ssl.PROTOCOL_TLS_CLIENT with ssl.SSLContext and set minimum_version to TLSVersion.TLSv1_2.",
    autoFixable: true,
  },
  {
    regex: /\bpickle\.loads?\s*\(/g,
    severity: "high",
    category: "code-injection",
    title: "Python pickle Deserialization",
    description:
      "pickle.load/loads can execute arbitrary code during deserialization. Never unpickle data from untrusted sources.",
    suggestedFix:
      "Use safer serialization formats like JSON, or use a restricted unpickler. Consider the 'fickling' library for safety analysis.",
    autoFixable: false,
  },

  // ── Go-Specific Patterns ──
  {
    regex: /["']crypto\/des["']|crypto\/des\b/g,
    severity: "high",
    category: "weak-crypto",
    title: "Go crypto/des Package Usage",
    description:
      "The Go crypto/des package implements the obsolete DES and 3DES ciphers which are insecure.",
    suggestedFix:
      "Use crypto/aes with a 256-bit key instead.",
    autoFixable: true,
  },
  {
    regex: /["']crypto\/rc4["']|crypto\/rc4\b/g,
    severity: "high",
    category: "weak-crypto",
    title: "Go crypto/rc4 Package Usage",
    description:
      "The Go crypto/rc4 package implements the broken RC4 stream cipher.",
    suggestedFix:
      "Use crypto/aes in GCM mode or golang.org/x/crypto/chacha20poly1305.",
    autoFixable: true,
  },
  {
    regex: /tls\.VersionTLS1[01]\b|VersionTLS10|VersionTLS11/g,
    severity: "high",
    category: "tls",
    title: "Go TLS 1.0/1.1 Version Constant",
    description:
      "Using tls.VersionTLS10 or tls.VersionTLS11 enables deprecated TLS protocol versions.",
    suggestedFix:
      "Use tls.VersionTLS12 as minimum, preferably tls.VersionTLS13.",
    autoFixable: true,
  },

  // ── Java-Specific Patterns ──
  {
    regex: /Cipher\.getInstance\s*\(\s*['"]DES['"]/gi,
    severity: "high",
    category: "weak-crypto",
    title: "Java Cipher.getInstance(\"DES\")",
    description:
      "DES cipher in Java provides only 56-bit security and is trivially breakable.",
    suggestedFix:
      "Use Cipher.getInstance(\"AES/GCM/NoPadding\") with a 256-bit key.",
    autoFixable: true,
  },
  {
    regex: /MessageDigest\.getInstance\s*\(\s*['"]MD5['"]/gi,
    severity: "medium",
    category: "weak-crypto",
    title: "Java MessageDigest.getInstance(\"MD5\")",
    description:
      "MD5 in Java is cryptographically broken and must not be used for security purposes.",
    suggestedFix:
      "Use MessageDigest.getInstance(\"SHA-256\") or \"SHA3-256\".",
    autoFixable: true,
  },
  {
    regex: /new\s+SecureRandom\s*\(\s*[^)]+\)|SecureRandom\.getInstance\s*\([^)]*\)\s*;\s*\w+\.setSeed\s*\(/gi,
    severity: "medium",
    category: "weak-crypto",
    title: "Java SecureRandom with Explicit Seed",
    description:
      "Seeding SecureRandom with a fixed or predictable value undermines its randomness guarantees and may produce predictable output.",
    suggestedFix:
      "Use new SecureRandom() without arguments to allow the JVM to select a strong entropy source automatically.",
    autoFixable: true,
  },

  // ── OWASP Top 10 ──
  {
    regex:
      /(['"`])\s*(SELECT|INSERT|UPDATE|DELETE|DROP)\s+.*?\+\s*(?!['"`])\w+/gi,
    severity: "critical",
    category: "sql-injection",
    title: "SQL Injection via String Concatenation",
    description:
      "Building SQL queries with string concatenation allows attackers to inject malicious SQL. This is OWASP A03:2021 - Injection.",
    suggestedFix:
      "Use parameterized queries or prepared statements instead of string concatenation.",
    autoFixable: true,
  },
  {
    regex: /\$\{[^}]*\}\s*(?:SELECT|INSERT|UPDATE|DELETE|DROP|WHERE)/gi,
    severity: "critical",
    category: "sql-injection",
    title: "SQL Injection via Template Literal",
    description:
      "Template literals in SQL queries are vulnerable to injection attacks.",
    suggestedFix:
      "Use parameterized queries with placeholders ($1, ?, :param) instead of template literals.",
    autoFixable: true,
  },
  {
    regex: /\.innerHTML\s*=\s*(?!['"`]<)/g,
    severity: "high",
    category: "xss",
    title: "XSS via innerHTML",
    description:
      "Setting innerHTML with dynamic content enables Cross-Site Scripting (XSS). This is OWASP A03:2021 - Injection.",
    suggestedFix: "Use textContent instead of innerHTML, or sanitize with DOMPurify.",
    autoFixable: true,
  },
  {
    regex: /dangerouslySetInnerHTML\s*=\s*\{\s*\{\s*__html\s*:/g,
    severity: "high",
    category: "xss",
    title: "XSS via dangerouslySetInnerHTML",
    description:
      "dangerouslySetInnerHTML can execute arbitrary HTML/JS. Ensure input is sanitized.",
    suggestedFix:
      "Sanitize the HTML content using DOMPurify before passing to dangerouslySetInnerHTML.",
    autoFixable: true,
  },
  {
    regex: /\beval\s*\(/g,
    severity: "critical",
    category: "code-injection",
    title: "eval() Usage Detected",
    description:
      "eval() executes arbitrary code and is a critical security risk, especially with user input. This is OWASP A03:2021 - Injection.",
    suggestedFix:
      "Remove eval() and use safer alternatives like JSON.parse() for data, or Function constructor with strict validation.",
    autoFixable: true,
  },
  {
    regex:
      /['"]Access-Control-Allow-Origin['"]\s*[:,]\s*['"]?\s*\*\s*['"]?/gi,
    severity: "medium",
    category: "cors",
    title: "CORS Wildcard Configuration",
    description:
      "CORS wildcard (*) allows any origin to access your API. This is OWASP A05:2021 - Security Misconfiguration.",
    suggestedFix:
      "Restrict Access-Control-Allow-Origin to specific trusted domains.",
    autoFixable: true,
  },
  {
    regex:
      /(?:rejectUnauthorized|verify_ssl|VERIFY_PEER|check_hostname)\s*[:=]\s*(?:false|False|0|nil)/gi,
    severity: "high",
    category: "tls",
    title: "TLS/SSL Verification Disabled",
    description:
      "Disabling TLS verification exposes the application to man-in-the-middle attacks. This is OWASP A02:2021 - Cryptographic Failures.",
    suggestedFix:
      "Enable TLS certificate verification. Use proper CA certificates.",
    autoFixable: true,
  },
  {
    regex: /NODE_TLS_REJECT_UNAUTHORIZED\s*=\s*['"]?0['"]?/g,
    severity: "high",
    category: "tls",
    title: "Node.js TLS Verification Disabled",
    description:
      "Setting NODE_TLS_REJECT_UNAUTHORIZED=0 disables all TLS verification globally.",
    suggestedFix:
      "Remove this setting and use proper CA certificates instead.",
    autoFixable: true,
  },

  // ── Secrets ──
  {
    regex:
      /(?:password|passwd|pwd|secret)\s*[:=]\s*['"][^'"]{4,}['"]/gi,
    severity: "critical",
    category: "secrets",
    title: "Hardcoded Password/Secret",
    description:
      "Hardcoded credentials in source code can be extracted by attackers. This is OWASP A07:2021 - Identification and Authentication Failures.",
    suggestedFix:
      "Use environment variables or a secrets manager (AWS Secrets Manager, HashiCorp Vault).",
    autoFixable: true,
  },
  {
    regex:
      /(?:api[_-]?key|apikey|access[_-]?token|auth[_-]?token)\s*[:=]\s*['"][^'"]{8,}['"]/gi,
    severity: "critical",
    category: "secrets",
    title: "Hardcoded API Key/Token",
    description:
      "API keys and tokens should never be committed to source code.",
    suggestedFix:
      "Move to environment variables and add the pattern to .gitignore.",
    autoFixable: true,
  },
  {
    regex: /\bsk_(?:live|test)_[a-zA-Z0-9]{20,}/g,
    severity: "critical",
    category: "secrets",
    title: "Stripe Secret Key Exposed",
    description:
      "A Stripe secret key was found in the code. This could lead to unauthorized charges.",
    suggestedFix:
      "Immediately rotate the key in Stripe dashboard. Use environment variables.",
    autoFixable: true,
  },
  {
    regex: /\bAIza[0-9A-Za-z_-]{35}\b/g,
    severity: "critical",
    category: "secrets",
    title: "Google API Key Exposed",
    description: "A Google API key was found in the code.",
    suggestedFix:
      "Rotate the key in Google Cloud Console. Use environment variables.",
    autoFixable: true,
  },
  {
    regex: /\bghp_[a-zA-Z0-9]{36,}\b/g,
    severity: "critical",
    category: "secrets",
    title: "GitHub Personal Access Token Exposed",
    description:
      "A GitHub PAT was found in the code. This grants access to repositories and user data.",
    suggestedFix:
      "Revoke the token on GitHub immediately. Use environment variables.",
    autoFixable: true,
  },
  {
    regex:
      /-----BEGIN\s+(?:RSA\s+)?PRIVATE\s+KEY-----/g,
    severity: "critical",
    category: "secrets",
    title: "Private Key Embedded in Code",
    description:
      "A private key was found in the source code. This is a critical security breach.",
    suggestedFix:
      "Remove the private key immediately. Store in a secure key vault and reference via environment variable.",
    autoFixable: true,
  },
];

let idCounter = 0;

function scanFileContent(
  file: RepoFile,
  allPatterns: Pattern[]
): Vulnerability[] {
  const vulnerabilities: Vulnerability[] = [];
  const lines = file.content.split("\n");

  for (const pattern of allPatterns) {
    // Reset regex state
    pattern.regex.lastIndex = 0;

    for (let i = 0; i < lines.length; i++) {
      pattern.regex.lastIndex = 0;
      const match = pattern.regex.exec(lines[i]);
      if (match) {
        idCounter++;
        vulnerabilities.push({
          id: `vuln-${idCounter}`,
          file: file.path,
          line: i + 1,
          severity: pattern.severity,
          category: pattern.category,
          title: pattern.title,
          description: pattern.description,
          matchedCode: lines[i].trim(),
          suggestedFix: pattern.suggestedFix,
          autoFixable: pattern.autoFixable,
        });
      }
    }
  }

  return vulnerabilities;
}

export function scanFiles(files: RepoFile[]): Vulnerability[] {
  const allVulnerabilities: Vulnerability[] = [];
  idCounter = 0;

  for (const file of files) {
    const vulns = scanFileContent(file, patterns);
    allVulnerabilities.push(...vulns);
  }

  return allVulnerabilities.sort((a, b) => {
    const order: Record<Severity, number> = {
      critical: 0,
      high: 1,
      medium: 2,
      low: 3,
    };
    return order[a.severity] - order[b.severity];
  });
}
