import { registerPost } from "./posts";

const post = {
  slug: "post-quantum-cryptography-migration-guide",
  title:
    "Post-Quantum Cryptography Migration: A Developer's Complete Guide (2026)",
  description:
    "NIST deprecates RSA and ECDSA by 2030. This guide covers which algorithms to replace, NIST standards ML-KEM and ML-DSA, and step-by-step migration for developers.",
  date: "2026-03-25",
  readTime: "15 min read",
  keyword: "post quantum cryptography migration guide",
  tags: ["PQC", "Cryptography", "NIST", "Migration", "RSA"],
  content: `
<h2>Why Post-Quantum Cryptography Migration Matters Right Now</h2>

<p>In 1994, mathematician Peter Shor published an algorithm that would eventually threaten the entire foundation of modern cryptography. <strong>Shor's algorithm</strong>, when executed on a sufficiently powerful quantum computer, can factor large integers and solve discrete logarithm problems in polynomial time. That means every RSA key, every elliptic curve signature, and every Diffie-Hellman key exchange deployed today becomes breakable.</p>

<p>The question is no longer <em>if</em> quantum computers will reach that capability, but <em>when</em>. IBM, Google, and several nation-state programs are racing toward fault-tolerant quantum systems with enough logical qubits to run Shor's algorithm against production key sizes. Current estimates place that threshold between 2029 and 2035, depending on the source. Yet only <strong>5% of enterprises</strong> have begun any form of post-quantum cryptography migration, according to a 2025 industry survey by the Cloud Security Alliance.</p>

<p>This post quantum cryptography migration guide will walk you through every step: which algorithms are at risk, what replaces them, the regulatory deadlines bearing down on your organization, and the concrete technical steps to protect your systems before it is too late.</p>

<h2>Which Cryptographic Algorithms Are Vulnerable?</h2>

<p>Shor's algorithm specifically targets the mathematical problems underpinning asymmetric (public-key) cryptography. Here is a breakdown of the algorithms you need to worry about:</p>

<ul>
  <li><strong>RSA (RSA-2048, RSA-4096)</strong> -- Used for encryption and digital signatures. Relies on integer factorization. Fully broken by Shor's algorithm regardless of key size.</li>
  <li><strong>ECDSA (Elliptic Curve Digital Signature Algorithm)</strong> -- The standard for TLS certificates, code signing, and blockchain. Relies on the elliptic curve discrete logarithm problem. Broken by a quantum variant of Shor's algorithm.</li>
  <li><strong>ECDH (Elliptic Curve Diffie-Hellman)</strong> -- Used for key agreement in TLS 1.3, Signal Protocol, and SSH. Same vulnerability as ECDSA.</li>
  <li><strong>Ed25519 / X25519</strong> -- Popular modern curves used in WireGuard, SSH, and Signal. Despite being newer, they are still elliptic-curve-based and equally vulnerable to quantum attack.</li>
  <li><strong>DH (Classic Diffie-Hellman)</strong> -- The original key exchange protocol. Relies on discrete logarithm in finite fields. Directly targeted by Shor's algorithm.</li>
  <li><strong>DSA (Digital Signature Algorithm)</strong> -- The older NIST signature standard. Same discrete logarithm weakness as DH.</li>
</ul>

<p><strong>Important:</strong> Symmetric algorithms like AES-256 and hash functions like SHA-256 are <em>not</em> broken by Shor's algorithm. Grover's algorithm provides a quadratic speedup against symmetric crypto, but doubling the key size (e.g., AES-128 to AES-256) is sufficient mitigation. The urgent crisis is in asymmetric cryptography.</p>

<h2>The NIST Post-Quantum Cryptography Standards</h2>

<p>After an eight-year evaluation process involving submissions from cryptographers worldwide, NIST finalized three post-quantum cryptography standards in August 2024. These are the algorithms you will migrate to:</p>

<h3>ML-KEM (FIPS 203) -- formerly CRYSTALS-Kyber</h3>

<p>ML-KEM (Module-Lattice-Based Key Encapsulation Mechanism) replaces RSA encryption and ECDH key exchange. It is based on the hardness of the Module Learning With Errors (MLWE) problem on structured lattices. ML-KEM comes in three parameter sets:</p>

<ul>
  <li><strong>ML-KEM-512</strong> -- Roughly equivalent to AES-128 security. Fastest performance, smallest keys.</li>
  <li><strong>ML-KEM-768</strong> -- Roughly equivalent to AES-192 security. The recommended default for most applications.</li>
  <li><strong>ML-KEM-1024</strong> -- Roughly equivalent to AES-256 security. For high-security environments.</li>
</ul>

<p>Key sizes are larger than RSA or ECDH: ML-KEM-768 public keys are 1,184 bytes versus 32 bytes for X25519. This has real implications for TLS handshakes, certificate chains, and bandwidth-constrained protocols.</p>

<h3>ML-DSA (FIPS 204) -- formerly CRYSTALS-Dilithium</h3>

<p>ML-DSA (Module-Lattice-Based Digital Signature Algorithm) replaces RSA signatures, ECDSA, and Ed25519 for digital signatures. Also based on lattice problems. Parameter sets:</p>

<ul>
  <li><strong>ML-DSA-44</strong> -- Category 2 security (~AES-128). Signatures are 2,420 bytes.</li>
  <li><strong>ML-DSA-65</strong> -- Category 3 security (~AES-192). Recommended default.</li>
  <li><strong>ML-DSA-87</strong> -- Category 5 security (~AES-256).</li>
</ul>

<h3>SLH-DSA (FIPS 205) -- formerly SPHINCS+</h3>

<p>SLH-DSA (Stateless Hash-Based Digital Signature Algorithm) is a conservative, hash-based alternative to ML-DSA. Its security rests purely on hash function properties rather than lattice assumptions. The trade-off is significantly larger signatures (up to 49,856 bytes) and slower signing. Use SLH-DSA when you need a fallback that does not depend on lattice assumptions, or when signature size and speed are not critical constraints.</p>

<h2>The Regulatory Timeline: Deadlines You Cannot Ignore</h2>

<p>Regulators worldwide have set firm deadlines. If you are building for any regulated industry -- finance, healthcare, government, defense -- these dates define your migration window:</p>

<ul>
  <li><strong>NSA CNSA 2.0 (2027)</strong> -- All new National Security Systems must use post-quantum algorithms by 2027. Legacy systems must transition by 2033. This applies to defense contractors, intelligence community vendors, and anyone touching classified data.</li>
  <li><strong>Google (2029)</strong> -- Google has announced it will distrust non-PQC TLS certificates by 2029 in Chrome. Given Chrome's market share, this effectively sets a deadline for the entire web.</li>
  <li><strong>NIST Deprecation (2030)</strong> -- NIST will formally deprecate RSA and ECDSA by 2030, removing them from approved algorithm lists. Federal agencies and their contractors must comply. The U.S. federal government has allocated <strong>$7.1 billion</strong> in combined budgets across agencies for quantum-readiness initiatives.</li>
  <li><strong>EU PQC Roadmap (2030)</strong> -- The European Commission's PQC migration roadmap targets 2030 for critical infrastructure. The EU Cybersecurity Act mandates PQC readiness for essential services.</li>
  <li><strong>UK NCSC (2035)</strong> -- The UK National Cyber Security Centre sets 2035 as the final deadline, with a phased approach starting in 2028 for high-priority systems.</li>
</ul>

<p>Even if your organization is not directly regulated, your customers, partners, and supply chain likely are. Compliance pressure flows downstream.</p>

<h2>Harvest Now, Decrypt Later: Why Migration Is Urgent Today</h2>

<p>The most compelling reason to begin your post quantum cryptography migration guide implementation today is the <strong>Harvest Now, Decrypt Later (HNDL)</strong> attack. Nation-state adversaries are already intercepting and storing encrypted traffic with the explicit intention of decrypting it once quantum computers become available.</p>

<p>Consider data with a long secrecy requirement: medical records (decades), trade secrets (years to decades), classified intelligence (permanent), financial records (7+ years). If that data is encrypted with RSA or ECDH today and intercepted tomorrow, a quantum computer in 2032 can decrypt it retroactively.</p>

<blockquote>
  <p>"The threat is not theoretical. Intelligence agencies have confirmed the existence of large-scale data harvesting programs targeting encrypted communications." -- NIST Post-Quantum Cryptography FAQ, 2025</p>
</blockquote>

<p>This means the effective deadline is not when quantum computers arrive. It is <strong>today</strong>, minus the secrecy lifetime of your data. If your data needs to stay secret for ten years, and quantum computers arrive in ten years, you are already late.</p>

<h2>Step-by-Step Migration Process</h2>

<p>A successful post quantum cryptography migration guide follows six phases. Rushing to swap algorithms without proper planning leads to outages, incompatibilities, and security gaps.</p>

<h3>Step 1: Inventory Your Cryptographic Assets</h3>

<p>You cannot migrate what you cannot find. Conduct a comprehensive audit of every cryptographic algorithm, key, certificate, and protocol in your codebase and infrastructure. This includes:</p>

<ul>
  <li>TLS/SSL certificates and their signing algorithms</li>
  <li>SSH keys and host key algorithms</li>
  <li>Code signing certificates</li>
  <li>API authentication tokens and JWT signing algorithms</li>
  <li>Database encryption (at-rest and in-transit)</li>
  <li>VPN configurations (IPSec, WireGuard)</li>
  <li>Hardware security modules (HSM) and their supported algorithms</li>
  <li>Third-party libraries and SDKs that embed cryptographic operations</li>
</ul>

<p>Manual inventory is impractical for any non-trivial system. Automated tools like <strong>CodeShield.ai</strong> can scan your entire codebase and infrastructure to produce a complete cryptographic inventory in minutes rather than months.</p>

<h3>Step 2: Assess Risk and Exposure</h3>

<p>Not all cryptographic usage carries the same risk. Classify each instance by:</p>

<ul>
  <li><strong>Data sensitivity:</strong> What does this algorithm protect? Public marketing pages or patient health records?</li>
  <li><strong>Secrecy lifetime:</strong> How long must this data remain confidential?</li>
  <li><strong>Exposure surface:</strong> Is this algorithm used in internet-facing protocols (high exposure) or internal-only systems (lower exposure)?</li>
  <li><strong>HNDL risk:</strong> Is the encrypted traffic traversing networks where it could be intercepted and stored?</li>
</ul>

<h3>Step 3: Prioritize Migration Targets</h3>

<p>Start with the highest-risk, highest-exposure systems: key exchanges in TLS for internet-facing services, VPN tunnels carrying sensitive data, and long-lived signing keys. Leave low-risk internal systems for later phases.</p>

<h3>Step 4: Replace Algorithms</h3>

<p>For each target, replace the vulnerable algorithm with its NIST PQC equivalent. Use <strong>hybrid mode</strong> during the transition period -- combining a classical algorithm with a PQC algorithm so that security is maintained even if one is broken. For example, TLS 1.3 now supports hybrid key exchange combining X25519 with ML-KEM-768.</p>

<h3>Step 5: Test Thoroughly</h3>

<p>PQC algorithms have different performance characteristics. ML-KEM key generation is fast, but key sizes are larger. ML-DSA signatures are larger than ECDSA, which affects certificate chain validation time. Test for:</p>

<ul>
  <li>Latency impact on TLS handshakes</li>
  <li>Bandwidth overhead on constrained networks (IoT, mobile)</li>
  <li>Compatibility with existing clients and intermediaries (load balancers, WAFs, CDNs)</li>
  <li>HSM firmware support for new algorithms</li>
</ul>

<h3>Step 6: Monitor and Iterate</h3>

<p>Post-quantum cryptography is still evolving. NIST is evaluating additional algorithms (notably HQC as a code-based backup to ML-KEM). Monitor for algorithm updates, vulnerability disclosures, and library patches. Treat your cryptographic migration as a continuous process, not a one-time project.</p>

<h2>Code Examples: Classical vs. Post-Quantum</h2>

<p>Below are practical examples showing the before and after of cryptographic operations. These illustrate the shape of the API changes you should expect.</p>

<h3>Key Encapsulation: RSA vs. ML-KEM (Node.js)</h3>

<pre class="code-block"><code>// BEFORE: RSA key exchange (VULNERABLE to quantum attack)
import crypto from 'node:crypto';

const { publicKey, privateKey } = crypto.generateKeyPairSync('rsa', {
  modulusLength: 2048,
});

const encrypted = crypto.publicEncrypt(publicKey, Buffer.from('shared-secret'));
const decrypted = crypto.privateDecrypt(privateKey, encrypted);
</code></pre>

<pre class="code-block"><code>// AFTER: ML-KEM-768 key encapsulation (quantum-resistant)
// Using oqs-provider or liboqs Node.js bindings
import { KEM } from 'liboqs-node';

const kem = new KEM('ML-KEM-768');
const { publicKey, secretKey } = kem.generateKeypair();

// Sender encapsulates: produces ciphertext + shared secret
const { ciphertext, sharedSecret: senderSecret } = kem.encapsulate(publicKey);

// Receiver decapsulates: recovers the same shared secret
const receiverSecret = kem.decapsulate(ciphertext, secretKey);

// senderSecret === receiverSecret (used as symmetric key material)
</code></pre>

<h3>Digital Signatures: ECDSA vs. ML-DSA (Python)</h3>

<pre class="code-block"><code># BEFORE: ECDSA signature (VULNERABLE to quantum attack)
from cryptography.hazmat.primitives.asymmetric import ec
from cryptography.hazmat.primitives import hashes

private_key = ec.generate_private_key(ec.SECP256R1())
signature = private_key.sign(b"message", ec.ECDSA(hashes.SHA256()))
</code></pre>

<pre class="code-block"><code># AFTER: ML-DSA-65 signature (quantum-resistant)
# Using oqs-python (liboqs wrapper)
import oqs

signer = oqs.Signature("ML-DSA-65")
public_key = signer.generate_keypair()
signature = signer.sign(b"message")

# Verification
verifier = oqs.Signature("ML-DSA-65")
is_valid = verifier.verify(b"message", signature, public_key)
</code></pre>

<p>Note that the API surface for PQC operations is often <em>simpler</em> than classical crypto. Key encapsulation replaces the more complex RSA encrypt/decrypt pattern, and PQC signature APIs closely mirror existing interfaces. The main differences are in key and signature sizes, not in developer ergonomics.</p>

<h2>What Is a CBOM (Cryptographic Bill of Materials)?</h2>

<p>A <strong>Cryptographic Bill of Materials (CBOM)</strong> is a structured, machine-readable inventory of every cryptographic asset in your software supply chain. Think of it as an SBOM (Software Bill of Materials) focused specifically on cryptography. A CBOM documents:</p>

<ul>
  <li>Every algorithm in use (RSA-2048, AES-256-GCM, SHA-384, etc.)</li>
  <li>Where each algorithm is used (file path, service, dependency)</li>
  <li>Key sizes and parameters</li>
  <li>Certificate authorities and trust chains</li>
  <li>Cryptographic library versions</li>
  <li>Compliance status against target standards (NIST, CNSA 2.0, etc.)</li>
</ul>

<p>CBOMs are becoming a regulatory requirement. The U.S. Office of Management and Budget (OMB) Memorandum M-23-02 mandates federal agencies to maintain cryptographic inventories. Private-sector frameworks like SOC 2 and ISO 27001 are following suit.</p>

<p>Without a CBOM, you are flying blind. You cannot assess your quantum risk, plan your migration, or prove compliance. With a CBOM, you have a single source of truth that drives every phase of your post quantum cryptography migration guide implementation.</p>

<h2>Tooling for Automated Discovery and CBOM Generation</h2>

<p>Building a CBOM manually is error-prone and does not scale. Modern codebases pull in hundreds of dependencies, each potentially importing its own cryptographic libraries. A developer might use <code>crypto.createSign('RSA-SHA256')</code> in application code while a transitive dependency calls OpenSSL directly through native bindings.</p>

<p><strong>CodeShield.ai</strong> automates this entire process. It performs deep static analysis of your codebase to discover every cryptographic operation -- including those buried in third-party dependencies -- and generates a complete CBOM. It flags quantum-vulnerable algorithms, maps them to their NIST PQC replacements, and prioritizes remediation based on risk exposure. This turns a months-long manual audit into an automated, repeatable scan that integrates into your CI/CD pipeline.</p>

<p>Other tools in the ecosystem include IBM's Quantum Safe Explorer, Cryptosense Analyzer, and the open-source crypolib-finder. However, for developer-centric workflows with tight CI/CD integration and actionable remediation guidance, CodeShield.ai provides the most streamlined path from discovery to migration.</p>

<h2>Putting It All Together: Your Migration Checklist</h2>

<p>Here is a condensed post quantum cryptography migration guide checklist you can act on immediately:</p>

<ul>
  <li><strong>Week 1:</strong> Run an automated scan to generate your CBOM. Know what you are dealing with.</li>
  <li><strong>Week 2-3:</strong> Classify assets by risk. Focus on internet-facing key exchanges and long-lived signing keys first.</li>
  <li><strong>Month 1-2:</strong> Deploy hybrid TLS (X25519 + ML-KEM-768) on your highest-traffic endpoints. Major cloud providers and CDNs already support this.</li>
  <li><strong>Month 3-6:</strong> Migrate code signing, API authentication, and internal service mesh encryption to ML-DSA or hybrid schemes.</li>
  <li><strong>Ongoing:</strong> Integrate CBOM generation into CI/CD. Block PRs that introduce new quantum-vulnerable cryptography. Monitor NIST updates for algorithm changes.</li>
</ul>

<p>The post quantum cryptography migration guide is not a single project with a finish line. It is a permanent shift in how you manage cryptographic risk. The organizations that start now will have years of runway to migrate gracefully. Those that wait will face emergency transitions under regulatory pressure, with far higher cost and far greater risk of security incidents.</p>

<h2>Start Your Migration Today</h2>

<p>Every week of delay is another week of encrypted data potentially harvested for future decryption. The standards are finalized. The tools exist. The regulatory deadlines are set. The only remaining variable is when <em>you</em> begin.</p>

<p><strong><a href="/dashboard">Scan your codebase for quantum-vulnerable cryptography with CodeShield.ai</a></strong> -- get a complete CBOM and a prioritized migration plan in minutes, not months.</p>
  `.trim(),
};

registerPost(post);
export default post;
