# PQC Alert Email

**Subject:** We found quantum-vulnerable cryptography in your code

---

Hi {firstName},

During your latest scan of **{repo}**, CodeShield detected cryptographic algorithms that are vulnerable to quantum computing attacks.

### What we found

Your codebase contains {pqcCount} instances of quantum-vulnerable cryptography:

- **RSA** ({rsaCount} instances) -- used for key exchange and encryption
- **ECDSA** ({ecdsaCount} instances) -- used for digital signatures
- **Classic Diffie-Hellman** ({dhCount} instances) -- used for key agreement

### Why this matters

Quantum computers will be able to break RSA, ECDSA, and classic Diffie-Hellman. While large-scale quantum hardware is still in development, the threat is not future-only. Nation-state actors are already collecting encrypted data today with the intent to decrypt it once quantum capability is available. This is known as a harvest-now-decrypt-later attack. If your application handles data that needs to remain confidential for more than a few years, the risk window is already open.

### The timeline

- **August 2024:** NIST published final post-quantum cryptography standards (ML-KEM, ML-DSA, SLH-DSA).
- **2030:** NIST deadline for federal agencies to complete migration away from quantum-vulnerable algorithms.
- **Now:** NSA CNSA 2.0 guidance and PCI DSS 4.0 reference cryptographic agility requirements that auditors are beginning to enforce.

### What to do next

The first step in any PQC migration is a complete inventory of where quantum-vulnerable cryptography exists in your codebase. CodeShield's Cryptographic Bill of Materials (CBOM) provides exactly this -- a structured document listing every algorithm, key size, and protocol across your repositories, mapped to NIST-approved replacements.

Upgrade to generate your CBOM: https://codeshield.ai/pricing

View your scan results: https://codeshield.ai/reports/{reportId}

-- CodeShield
