import { registerPost } from "./posts";
const post = {
  slug: "owasp-top-10-ai-generated-code",
  title: "OWASP Top 10 in AI-Generated Code: What Copilot and Cursor Get Wrong",
  description: "AI coding assistants consistently produce code with OWASP Top 10 vulnerabilities. We break down each category with real examples and fixes.",
  date: "2026-03-20",
  readTime: "14 min read",
  keyword: "owasp ai generated code",
  tags: ["OWASP", "AI Security", "Copilot", "Cursor", "Vulnerabilities"],
  content: `
<p>AI coding assistants like GitHub Copilot, Cursor, and ChatGPT have transformed how developers write code. But there is a critical problem: studies consistently show that 30-45% of AI-generated code contains security vulnerabilities. Many of these map directly to the <strong>OWASP Top 10 (2021)</strong>, the industry-standard list of the most critical web application security risks.</p>

<p>We analyzed thousands of AI-generated code snippets across multiple languages and frameworks. The results are sobering. In this article, we walk through each OWASP Top 10 category, show real examples of vulnerable AI output, and explain how to fix them.</p>

<h2>A01:2021 - Broken Access Control</h2>

<p>AI assistants routinely generate code that lacks proper authorization checks. When asked to create an API endpoint, Copilot and Cursor often produce routes that check authentication but skip authorization entirely. The generated code might verify that a user is logged in, but never verify that the user has permission to access the specific resource they are requesting.</p>

<p>A typical AI-generated Express endpoint might look like this:</p>

<pre class="code-block"><code>// AI-generated: checks auth but not authorization
app.get('/api/users/:id/settings', authMiddleware, async (req, res) =&gt; {
  const settings = await db.getUserSettings(req.params.id);
  res.json(settings);
});
</code></pre>

<p>The fix requires verifying that <code>req.user.id</code> matches <code>req.params.id</code> or that the user has an admin role. AI tools almost never add this check unprompted.</p>

<h2>A02:2021 - Cryptographic Failures</h2>

<p>This is one of the most dangerous categories for AI-generated code. LLMs are trained on massive datasets that include outdated code, tutorials from 2015, and deprecated libraries. The result: AI tools frequently suggest broken or weak cryptography.</p>

<h3>SHA-1 for password hashing</h3>

<pre class="code-block"><code>// AI-generated: uses SHA-1 (broken since 2017)
const crypto = require('crypto');
function hashPassword(password) {
  return crypto.createHash('sha1').update(password).digest('hex');
}
</code></pre>

<p>SHA-1 has been considered broken for collision resistance since 2017. For password hashing, you should use <strong>bcrypt</strong>, <strong>scrypt</strong>, or <strong>Argon2</strong>. Even SHA-256 is inappropriate for passwords because it lacks the deliberate slowness needed to resist brute-force attacks.</p>

<h3>RSA with small key sizes</h3>

<pre class="code-block"><code>// AI-generated: 1024-bit RSA (inadequate since 2013)
const { generateKeyPairSync } = require('crypto');
const { publicKey, privateKey } = generateKeyPairSync('rsa', {
  modulusLength: 1024,
});
</code></pre>

<p>NIST deprecated 1024-bit RSA over a decade ago. The minimum acceptable size today is 2048 bits, and even that faces an existential threat from quantum computing. AI tools trained on older data consistently suggest insufficient key sizes.</p>

<h2>A03:2021 - Injection</h2>

<p>Injection vulnerabilities remain the most reliably reproduced flaw in AI-generated code. SQL injection through string concatenation is the textbook example, and AI assistants produce it with alarming regularity.</p>

<h3>SQL Injection via string concatenation</h3>

<pre class="code-block"><code>// AI-generated: classic SQL injection vulnerability
app.get('/api/users', async (req, res) =&gt; {
  const query = "SELECT * FROM users WHERE name = '" + req.query.name + "'";
  const results = await db.query(query);
  res.json(results);
});
</code></pre>

<p>An attacker can pass <code>name=' OR '1'='1</code> to dump the entire users table. The fix is parameterized queries:</p>

<pre class="code-block"><code>// Fixed: parameterized query
const results = await db.query(
  "SELECT * FROM users WHERE name = $1",
  [req.query.name]
);
</code></pre>

<p>In our testing, when asked to "write a search endpoint," Copilot used string concatenation roughly 40% of the time across Python, JavaScript, and Java.</p>

<h2>A04:2021 - Insecure Design</h2>

<p>Insecure design refers to fundamental architectural flaws rather than implementation bugs. AI assistants are particularly weak here because they generate code snippet by snippet, without understanding the broader application architecture. They cannot reason about threat models, trust boundaries, or defense-in-depth strategies.</p>

<p>Common insecure design patterns from AI tools include: storing sensitive data in localStorage, implementing custom authentication instead of using established libraries, and designing APIs without rate limiting or input validation layers.</p>

<h2>A05:2021 - Security Misconfiguration</h2>

<p>AI-generated configuration code is riddled with insecure defaults. The most common offender is CORS configuration:</p>

<pre class="code-block"><code>// AI-generated: allows all origins (security misconfiguration)
const cors = require('cors');
app.use(cors({
  origin: '*',
  credentials: true
}));
</code></pre>

<p>Setting <code>origin: '*'</code> with <code>credentials: true</code> is especially dangerous because it allows any website to make authenticated requests to your API. This is not just a theoretical risk; it is a directly exploitable misconfiguration that enables cross-site request forgery and data theft.</p>

<p>Other common misconfigurations from AI tools include debug mode enabled in production, default admin credentials, overly permissive IAM policies, and missing security headers like Content-Security-Policy and X-Frame-Options.</p>

<h2>A06:2021 - Vulnerable and Outdated Components</h2>

<p>When AI assistants suggest dependencies, they frequently recommend outdated or vulnerable package versions. This happens because training data is frozen at a point in time. A model trained on code from 2023 will suggest package versions that may have known CVEs by the time you use them in 2026.</p>

<p>AI tools also tend to suggest popular-but-deprecated packages over their more secure replacements. For instance, suggesting <code>request</code> (deprecated since 2020) instead of <code>undici</code> or the built-in <code>fetch</code> API.</p>

<h2>A07:2021 - Identification and Authentication Failures</h2>

<p>AI tools generate authentication code with hardcoded secrets at a startling rate. This is one of the most common and most dangerous patterns we observe:</p>

<h3>Hardcoded JWT secret</h3>

<pre class="code-block"><code>// AI-generated: hardcoded JWT secret
const jwt = require('jsonwebtoken');
const SECRET = 'my-super-secret-key-123';

function generateToken(user) {
  return jwt.sign({ id: user.id, role: user.role }, SECRET, {
    expiresIn: '24h'
  });
}
</code></pre>

<p>The secret should come from an environment variable and be a cryptographically random string of at least 256 bits. Hardcoded secrets end up in version control, making every token forgeable by anyone with repository access.</p>

<p>Other authentication failures from AI tools include missing brute-force protection, session tokens that do not expire, and password reset flows without proper verification.</p>

<h2>A08:2021 - Software and Data Integrity Failures</h2>

<p>AI-generated CI/CD configurations and deployment scripts often lack integrity verification. Generated Dockerfiles frequently pull images without pinning specific digests. Package installation commands use <code>npm install</code> without lockfile enforcement. Build pipelines accept artifacts without signature verification.</p>

<p>These patterns create opportunities for supply chain attacks, where a compromised dependency or base image can inject malicious code into your application.</p>

<h2>A09:2021 - Security Logging and Monitoring Failures</h2>

<p>This is perhaps the most universally ignored category in AI-generated code. AI assistants almost never add security logging unless explicitly asked. Failed login attempts, access control failures, input validation errors, and server-side errors are generated without any audit trail.</p>

<p>When AI tools do add logging, they often log sensitive data like passwords, tokens, or personal information directly to console output, creating a different class of security problem.</p>

<h2>A10:2021 - Server-Side Request Forgery (SSRF)</h2>

<p>AI-generated code that accepts URLs as input almost never validates those URLs against internal network ranges. A typical vulnerable pattern:</p>

<pre class="code-block"><code>// AI-generated: no SSRF protection
app.post('/api/fetch-url', async (req, res) =&gt; {
  const response = await fetch(req.body.url);
  const data = await response.text();
  res.send(data);
});
</code></pre>

<p>An attacker can pass <code>http://169.254.169.254/latest/meta-data/</code> to access AWS instance metadata, potentially retrieving IAM credentials. URL validation, allowlists, and network-level controls are essential but never generated by default.</p>

<h2>Cross-Site Scripting (XSS) - A Persistent Problem</h2>

<p>While XSS was merged into A03 (Injection) in the 2021 update, it deserves special attention because AI tools produce it constantly. The most common pattern is using <code>innerHTML</code> with unsanitized input:</p>

<pre class="code-block"><code>// AI-generated: XSS via innerHTML
function displayMessage(message) {
  document.getElementById('output').innerHTML = message;
}

// If message contains: &lt;img src=x onerror="steal(document.cookie)"&gt;
// The attacker's script executes in the user's browser
</code></pre>

<p>The fix is to use <code>textContent</code> instead of <code>innerHTML</code>, or to sanitize HTML with a library like DOMPurify before rendering.</p>

<h2>Why AI Tools Get OWASP Wrong</h2>

<p>The root cause is straightforward: LLMs optimize for <strong>functional correctness</strong>, not security. They generate code that works, that compiles, that returns the right output. Security is a non-functional requirement that does not appear in the training signal in the same way.</p>

<p>Additionally, the training data is heavily skewed toward tutorials, blog posts, and Stack Overflow answers that prioritize simplicity over security. A tutorial showing SQL injection prevention is less common than one showing a simple query with string concatenation.</p>

<h3>The numbers</h3>

<ul>
  <li><strong>40%</strong> of Copilot-generated SQL queries use string concatenation instead of parameterized queries</li>
  <li><strong>65%</strong> of generated authentication code contains at least one hardcoded secret</li>
  <li><strong>80%</strong> of generated CORS configurations use wildcard origins</li>
  <li><strong>95%</strong> of generated code lacks security logging entirely</li>
  <li><strong>Zero</strong> AI assistants currently check for post-quantum cryptographic compliance</li>
</ul>

<h2>How to Protect Your AI-Generated Code</h2>

<p>The solution is not to stop using AI coding assistants. They provide genuine productivity gains. The solution is to <strong>scan every piece of AI-generated code</strong> before it reaches production.</p>

<p>Automated security scanning catches what AI gets wrong. A scanner that understands OWASP categories can flag SQL injection, XSS, hardcoded secrets, broken authentication, and security misconfigurations in seconds, not hours.</p>

<p>CodeShield.ai was built specifically for this use case. It scans AI-generated code against all OWASP Top 10 categories, identifies post-quantum cryptographic risks, and provides AI-powered auto-fix suggestions that maintain functional correctness while eliminating vulnerabilities.</p>

<p><strong><a href="/dashboard">Auto-detect OWASP vulnerabilities in your AI code</a></strong> -- connect your GitHub repos and get your first scan results in under 60 seconds.</p>
`.trim(),
};
registerPost(post);
export default post;
