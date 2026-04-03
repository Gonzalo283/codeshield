# CodeShield -- Hacker News Launch

## Title

Show HN: CodeShield -- Scan AI-generated code for vulnerabilities + quantum-unsafe crypto

## First Comment

Hey HN. I built CodeShield to solve two problems I kept running into: AI coding assistants generating insecure code, and the total absence of tooling for post-quantum cryptography migration.

**What it does:** You connect a GitHub repo, and CodeShield scans your code (on every PR or on-demand) for security vulnerabilities with a focus on patterns commonly introduced by AI code generation tools. It also identifies quantum-vulnerable cryptography (RSA, ECDSA, classic Diffie-Hellman) and generates a Cryptographic Bill of Materials (CBOM).

**How it works technically:** The core scanner is regex-based pattern matching against 50+ vulnerability signatures. Yes, regex -- not AST-based analysis. I want to be upfront about that. We chose this approach for speed and language-agnostic coverage. It means we get false positives on some patterns (especially in comments and strings), and we cannot do cross-file taint analysis or track data flow. We know these limitations. AST-based analysis per language is on the roadmap but it is a significant engineering effort we have not completed yet.

**What makes it different:** The PQC detection is the angle no other developer tool covers well. We scan for every instance of RSA, ECDSA, DSA, classic DH, and other algorithms that NIST has marked for deprecation by 2030. We map these to their post-quantum replacements (ML-KEM, ML-DSA, SLH-DSA) and generate a CBOM document. If you think quantum is decades away and this does not matter yet, consider harvest-now-decrypt-later attacks. Adversaries are already collecting encrypted traffic today to decrypt once quantum hardware is available. If your application handles data with long-term confidentiality requirements -- health records, financial data, government communications -- the migration window is now, not 2029.

**Auto-fix:** For paid tiers, we use the Claude API to generate fix suggestions. These are suggestions, not automatic commits. A human reviews and approves every change.

**What it does NOT do:** No software composition analysis (SCA) -- use Snyk or Dependabot for that. No secrets scanning -- use GitLeaks or TruffleHog. No cross-file data flow analysis yet. We are not trying to be a full SAST platform.

Free tier: 5 repos, 100 scans/month. Code and core patterns are on GitHub: https://github.com/codeshield-ai

Feedback welcome, especially on the scanner patterns. We know regex has limits, and community contributions to improve accuracy are genuinely appreciated.

---

## Talking Points for HN Questions

### 1. "Regex vs AST -- how accurate can this really be?"

Honest answer: regex-based scanning has inherent limitations. We cannot parse code semantics, track variable assignments across lines, or understand control flow. Our false positive rate varies by pattern -- some patterns like hardcoded secrets in strings are quite accurate, while others like SQL injection detection without data flow analysis produce more noise. We mitigate this with confidence scoring and context-aware filtering. AST-based analysis for Python, JavaScript, and Go is on our roadmap for Q3. We chose to ship with regex first because it gave us language-agnostic coverage across 12+ languages immediately, and the PQC detection patterns (which are mostly API call matching) work well with regex. We track our false positive rates and publish them. Currently averaging around 15% false positive rate across all patterns, which is not great but not terrible for a v1.

### 2. "Why not just use Snyk / GitHub GHAS / Semgrep?"

Those are excellent tools and you should use them. We are not a replacement. The gap we address is specific: (a) vulnerability patterns that are disproportionately common in AI-generated code, which existing SAST rules were not designed around, and (b) post-quantum cryptography detection, which none of those tools currently offer as a first-class feature. Snyk focuses heavily on SCA (dependency vulnerabilities). GitHub GHAS uses CodeQL which is powerful but requires per-language setup and does not have PQC rules. Semgrep is the closest competitor and is genuinely good -- if you already use Semgrep and write custom rules for PQC, you have covered much of what we do. Our value is that this is pre-configured and opinionated out of the box for the AI + PQC use case.

### 3. "Is PQC really urgent? Quantum computers are years away."

The urgency is not about when quantum computers arrive. It is about harvest-now-decrypt-later (HNDL). Nation-state actors are already collecting encrypted network traffic and storing it. When cryptographically relevant quantum computers exist, they will decrypt that stored data retroactively. If your application encrypted sensitive data with RSA or ECDSA today and that data needs to remain confidential for 10+ years (medical records, financial records, legal documents, government data), you are already in the threat window. NIST published final PQC standards in August 2024. The federal migration deadline is 2030. NSA has issued CNSAs 2.0 guidance. PCI DSS 4.0 references crypto agility. This is not theoretical -- compliance requirements are arriving now, and the migration itself takes years for large codebases. Starting inventory (which is what our CBOM provides) is step one.

### 4. "What justifies the pricing when Semgrep/Snyk have free tiers?"

Our free tier is genuinely usable: 5 repos, 100 scans/month. For individual developers and small open source projects, that may be enough permanently. The paid tiers ($29/month Team, $99/month Enterprise) add AI-powered auto-fix, unlimited scans, CBOM export, compliance reporting, and priority support. The pricing reflects the cost of the Claude API calls for auto-fix generation, which is the most expensive part of our infrastructure. If you do not need auto-fix or CBOM, the free tier plus manual remediation guidance may be sufficient for your needs.

### 5. "Any plans to open source the full tool?"

The core scanning engine and pattern library are already open source on GitHub. The proprietary components are the SaaS infrastructure (dashboard, GitHub App integration, user management) and the AI auto-fix pipeline (prompt engineering, fix validation). We plan to keep the pattern library open and accept community contributions. The auto-fix and CBOM generation involve API costs that make full open source of the hosted service impractical, but self-hosted deployment is something we are evaluating for the enterprise tier.
