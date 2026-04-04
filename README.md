# CodeShield

**The only security scanner built for AI-generated code.**

Detects OWASP vulnerabilities, leaked secrets, and quantum-unsafe cryptography in your GitHub repos — then fixes them automatically with AI.

[![CodeShield](https://codeshield.sh/api/badge?v=0)](https://codeshield.sh)

**Live at [codeshield.sh](https://codeshield.sh)**

---

## What it does

CodeShield scans your codebase for security vulnerabilities with a focus on patterns commonly introduced by AI coding tools (Copilot, Cursor, Claude Code).

- **46 vulnerability patterns** across OWASP Top 10, secrets, and cryptography
- **Post-quantum crypto detection** — finds RSA, ECDSA, ECDH, DH, and other algorithms NIST is deprecating by 2030
- **AI auto-fix** — Claude generates secure code replacements with explanations
- **Works with** TypeScript, JavaScript, Python, Go, Java, Rust, Ruby, PHP, C/C++, and more

## Quick start

### Free online scanner (no login)

Go to **[codeshield.sh/scan-free](https://codeshield.sh/scan-free)** and paste a public GitHub repo URL or your code.

### CLI

```bash
npx codeshield
```

Scans the current directory and reports vulnerabilities. Exit code 1 if critical issues found.

### GitHub Action

Add to `.github/workflows/codeshield.yml`:

```yaml
name: CodeShield Security Scan
on:
  pull_request:
    types: [opened, synchronize]

permissions:
  contents: read
  pull-requests: write

jobs:
  scan:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: Gonzalo283/codeshield@main
        env:
          GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
```

## What we detect

| Category | Examples | Severity |
|----------|----------|----------|
| **Post-Quantum Crypto** | RSA, ECDSA, ECDH, Ed25519, DH, DSA | Critical/High |
| **Weak Crypto** | MD5, SHA-1, DES, 3DES, RC4, Blowfish, AES-128 | High/Medium |
| **SQL Injection** | String concatenation, template literals in queries | Critical |
| **XSS** | innerHTML, dangerouslySetInnerHTML | High |
| **Secrets** | Stripe keys, GitHub tokens, Google API keys, private keys | Critical |
| **Code Injection** | eval(), pickle.loads() | Critical |
| **TLS/SSL** | Disabled verification, SSLv2/v3, TLS 1.0/1.1 | Critical/High |
| **CORS** | Wildcard Access-Control-Allow-Origin | Medium |

## Pricing

| Plan | Price | Includes |
|------|-------|----------|
| **Free** | $0 | 5 repos, 10 scans/month, full detection, PQC discovery |
| **Team** | $29/dev/mo | Unlimited scans, AI auto-fix, CBOM, CI/CD integration |
| **Business** | $79/dev/mo | SSO, compliance reports, SBOM, custom rules |
| **Enterprise** | Custom | Self-hosted, dedicated support, PQC consulting |

## Stack

- Next.js 16 (App Router) + TypeScript + Tailwind CSS v4
- NextAuth with GitHub OAuth
- Anthropic Claude API for auto-fix
- Stripe for billing
- Deployed on Vercel

## Badge

Add to your README:

```markdown
[![CodeShield](https://codeshield.sh/api/badge?v=0)](https://codeshield.sh)
```

## Links

- **Website:** [codeshield.sh](https://codeshield.sh)
- **Free scanner:** [codeshield.sh/scan-free](https://codeshield.sh/scan-free)
- **Blog:** [codeshield.sh/blog](https://codeshield.sh/blog)
- **Docs:** [codeshield.sh/docs](https://codeshield.sh/docs)
- **Pricing:** [codeshield.sh/pricing](https://codeshield.sh/pricing)

## License

Proprietary. See [codeshield.sh](https://codeshield.sh) for terms.
