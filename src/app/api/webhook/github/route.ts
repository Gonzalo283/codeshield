/**
 * GitHub Webhook Handler — CodeShield.ai
 *
 * Receives GitHub webhook events and triggers automatic security scans.
 *
 * ── Setup Instructions ──
 *
 * 1. Go to your GitHub repo -> Settings -> Webhooks -> Add webhook
 * 2. Set Payload URL to: https://codeshield.sh/api/webhook/github
 * 3. Set Content type to: application/json
 * 4. Set Secret to the value of GITHUB_WEBHOOK_SECRET env var
 * 5. Select events: "Pushes" and "Pull requests"
 * 6. Ensure the webhook is active
 *
 * ── Environment Variables ──
 *
 * GITHUB_WEBHOOK_SECRET  — shared secret for HMAC-SHA256 signature verification
 * GITHUB_APP_TOKEN       — GitHub App installation token (or OAuth token) for
 *                          accessing private repos and posting PR comments
 *
 * ── Supported Events ──
 *
 * push                   — triggers a full repo scan when pushed to the default branch
 * pull_request (opened)  — triggers a scan of changed files in the PR
 * pull_request (synchronize) — re-scans when new commits are pushed to the PR
 *
 * ── Security ──
 *
 * - All payloads are verified against X-Hub-Signature-256 using HMAC-SHA256
 * - Rate limited to 10 webhook events per minute per repo
 * - All events are logged (without sensitive data)
 * - Internal errors are never exposed to the caller
 */

import { NextRequest } from "next/server";
import crypto from "crypto";
import { scanFiles } from "@/lib/scanner";
import { rateLimit, logRequest } from "@/lib/security";
import { Severity, RepoFile, Vulnerability } from "@/types";

/** Vercel function timeout — stay under the 30s hard limit */
export const maxDuration = 25;

// ── Constants ──

const GITHUB_API = "https://api.github.com";

const SCANNABLE_EXTENSIONS = new Set([
  ".ts", ".tsx", ".js", ".jsx", ".mjs", ".cjs",
  ".py", ".go", ".java", ".rs", ".rb", ".php",
  ".cs", ".cpp", ".c", ".h", ".hpp",
  ".swift", ".kt", ".scala", ".sh", ".bash",
  ".yaml", ".yml", ".json", ".toml", ".env",
  ".sql", ".graphql", ".gql",
]);

const EXCLUDED_DIRS = [
  "node_modules", "vendor", "dist", "build", ".next",
  "__pycache__", ".git", "coverage", ".turbo",
  "target", "bin", "obj", ".cache",
];

// ── Types ──

interface WebhookPushPayload {
  ref: string;
  repository: {
    full_name: string;
    name: string;
    owner: { login: string };
    default_branch: string;
  };
  installation?: { id: number };
  head_commit?: { id: string };
}

interface WebhookPullRequestPayload {
  action: string;
  number: number;
  pull_request: {
    head: { sha: string; ref: string };
    base: { ref: string };
  };
  repository: {
    full_name: string;
    name: string;
    owner: { login: string };
    default_branch: string;
  };
  installation?: { id: number };
}

interface GitHubTreeItem {
  path: string;
  type: string;
  size?: number;
  sha: string;
}

interface PRFileItem {
  filename: string;
  status: string;
  sha: string;
}

// ── Signature Verification ──

function verifySignature(payload: string, signature: string, secret: string): boolean {
  const expected = "sha256=" + crypto
    .createHmac("sha256", secret)
    .update(payload, "utf-8")
    .digest("hex");

  // Constant-time comparison to prevent timing attacks
  try {
    return crypto.timingSafeEqual(
      Buffer.from(expected, "utf-8"),
      Buffer.from(signature, "utf-8"),
    );
  } catch {
    return false;
  }
}

// ── File Helpers ──

function isScannableFile(path: string): boolean {
  const ext = "." + path.split(".").pop()?.toLowerCase();
  if (!SCANNABLE_EXTENSIONS.has(ext)) return false;
  return !EXCLUDED_DIRS.some(
    (dir) => path.startsWith(dir + "/") || path.includes("/" + dir + "/"),
  );
}

async function githubFetch(url: string, token: string): Promise<Response> {
  return fetch(url, {
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: "application/vnd.github.v3+json",
    },
  });
}

async function githubFetchJson(url: string, token: string) {
  const res = await githubFetch(url, token);
  if (!res.ok) {
    throw new Error(`GitHub API ${res.status}: ${res.statusText}`);
  }
  return res.json();
}

// ── File Fetching ──

/**
 * Fetch all scannable files from the repo tree (for push events).
 * Uses the recursive tree API to minimise requests.
 */
async function fetchAllFiles(
  owner: string,
  repo: string,
  branch: string,
  token: string,
): Promise<RepoFile[]> {
  const treeData = await githubFetchJson(
    `${GITHUB_API}/repos/${owner}/${repo}/git/trees/${branch}?recursive=1`,
    token,
  );

  const scannableItems: GitHubTreeItem[] = (treeData.tree || []).filter(
    (item: GitHubTreeItem) =>
      item.type === "blob" &&
      isScannableFile(item.path) &&
      (item.size || 0) < 500_000,
  );

  // Fetch in parallel batches of 10
  const files: RepoFile[] = [];
  const batchSize = 10;

  for (let i = 0; i < scannableItems.length; i += batchSize) {
    const batch = scannableItems.slice(i, i + batchSize);
    const results = await Promise.all(
      batch.map(async (item): Promise<RepoFile | null> => {
        try {
          const data = await githubFetchJson(
            `${GITHUB_API}/repos/${owner}/${repo}/contents/${item.path}?ref=${branch}`,
            token,
          );
          if (data.content && data.encoding === "base64") {
            const content = Buffer.from(data.content, "base64").toString("utf-8");
            return { path: item.path, content };
          }
        } catch {
          // Skip files that fail to fetch
        }
        return null;
      }),
    );
    files.push(...(results.filter(Boolean) as RepoFile[]));
  }

  return files;
}

/**
 * Fetch only the files changed in a pull request.
 * Uses the PR files endpoint and then fetches content for each scannable file.
 */
async function fetchPRFiles(
  owner: string,
  repo: string,
  prNumber: number,
  headSha: string,
  token: string,
): Promise<RepoFile[]> {
  const prFiles: PRFileItem[] = await githubFetchJson(
    `${GITHUB_API}/repos/${owner}/${repo}/pulls/${prNumber}/files?per_page=100`,
    token,
  );

  const scannable = prFiles.filter(
    (f) => f.status !== "removed" && isScannableFile(f.filename),
  );

  const files: RepoFile[] = [];
  const batchSize = 10;

  for (let i = 0; i < scannable.length; i += batchSize) {
    const batch = scannable.slice(i, i + batchSize);
    const results = await Promise.all(
      batch.map(async (item): Promise<RepoFile | null> => {
        try {
          const data = await githubFetchJson(
            `${GITHUB_API}/repos/${owner}/${repo}/contents/${item.filename}?ref=${headSha}`,
            token,
          );
          if (data.content && data.encoding === "base64") {
            const content = Buffer.from(data.content, "base64").toString("utf-8");
            return { path: item.filename, content };
          }
        } catch {
          // Skip files that fail to fetch
        }
        return null;
      }),
    );
    files.push(...(results.filter(Boolean) as RepoFile[]));
  }

  return files;
}

// ── PR Comment Formatting ──

function severityIcon(severity: Severity): string {
  switch (severity) {
    case "critical": return "\u{1F534}";  // red circle
    case "high":     return "\u{1F7E0}";  // orange circle
    case "medium":   return "\u{1F7E1}";  // yellow circle
    case "low":      return "\u{1F7E2}";  // green circle
  }
}

function formatPRComment(
  vulnerabilities: Vulnerability[],
  filesScanned: number,
): string {
  const summary = { critical: 0, high: 0, medium: 0, low: 0 };
  for (const v of vulnerabilities) {
    summary[v.severity]++;
  }

  const topFindings = vulnerabilities
    .slice(0, 10)
    .map((v) => `- ${severityIcon(v.severity)} **${v.title}** \u2014 ${v.file}:${v.line}`)
    .join("\n");

  const totalIssues = vulnerabilities.length;
  const statusLine = totalIssues === 0
    ? "\u2705 **No security issues found!**"
    : `Found **${totalIssues}** issue${totalIssues === 1 ? "" : "s"} across **${filesScanned}** files.`;

  return [
    "## CodeShield Security Scan",
    "",
    statusLine,
    "",
    "| Severity | Count |",
    "|----------|-------|",
    `| CRITICAL | ${summary.critical} |`,
    `| HIGH | ${summary.high} |`,
    `| MEDIUM | ${summary.medium} |`,
    "",
    ...(topFindings ? ["### Top Findings", "", topFindings, ""] : []),
    `[View full report](https://codeshield.sh/dashboard) | [Get auto-fix](https://codeshield.sh/pricing)`,
    "",
    "_Scanned by [CodeShield](https://codeshield.sh) \u2014 AI code security + post-quantum crypto_",
  ].join("\n");
}

/**
 * Post a comment on a pull request with the scan results.
 */
async function postPRComment(
  owner: string,
  repo: string,
  prNumber: number,
  body: string,
  token: string,
): Promise<void> {
  const res = await fetch(
    `${GITHUB_API}/repos/${owner}/${repo}/issues/${prNumber}/comments`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: "application/vnd.github.v3+json",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ body }),
    },
  );

  if (!res.ok) {
    const text = await res.text();
    console.error(`Failed to post PR comment (${res.status}):`, text);
  }
}

// ── Access Token Resolution ──

/**
 * Resolve the access token for GitHub API calls.
 * Prefers the installation token from the webhook payload (GitHub App),
 * falls back to the configured GITHUB_APP_TOKEN env var.
 */
function resolveAccessToken(): string {
  const token = process.env.GITHUB_APP_TOKEN;
  if (!token) {
    throw new Error("No GitHub access token configured");
  }
  return token;
}

// ── Webhook Handler ──

export async function POST(request: NextRequest) {
  try {
    // ── 1. Validate webhook secret is configured ──
    const webhookSecret = process.env.GITHUB_WEBHOOK_SECRET;
    if (!webhookSecret) {
      console.error("GITHUB_WEBHOOK_SECRET is not configured");
      return Response.json({ error: "Webhook not configured" }, { status: 500 });
    }

    // ── 2. Read raw body and verify signature ──
    const rawBody = await request.text();
    const signature = request.headers.get("x-hub-signature-256");

    if (!signature) {
      logRequest(request, "webhook:rejected — missing signature");
      return Response.json({ error: "Missing signature" }, { status: 401 });
    }

    if (!verifySignature(rawBody, signature, webhookSecret)) {
      logRequest(request, "webhook:rejected — invalid signature");
      return Response.json({ error: "Invalid signature" }, { status: 401 });
    }

    // ── 3. Parse payload ──
    let payload: WebhookPushPayload | WebhookPullRequestPayload;
    try {
      payload = JSON.parse(rawBody);
    } catch {
      return Response.json({ error: "Invalid JSON" }, { status: 400 });
    }

    const event = request.headers.get("x-github-event");
    if (!event) {
      return Response.json({ error: "Missing event header" }, { status: 400 });
    }

    // ── 4. Rate limit — 10 webhooks per minute per repo ──
    const repoFullName =
      "repository" in payload ? payload.repository.full_name : "unknown";
    const rateLimitKey = `webhook:${repoFullName}`;
    const limit = rateLimit(rateLimitKey, { maxRequests: 10, windowMs: 60_000 });
    if (!limit.allowed) {
      logRequest(request, `webhook:rate-limited — ${repoFullName}`);
      return Response.json({ error: "Rate limit exceeded" }, { status: 429 });
    }

    logRequest(request, `webhook:${event} — ${repoFullName}`);

    // ── 5. Resolve access token ──
    let accessToken: string;
    try {
      accessToken = resolveAccessToken();
    } catch {
      console.error("No access token available for webhook processing");
      return Response.json({ error: "Server configuration error" }, { status: 500 });
    }

    // ── 6. Handle push event (full scan on default branch) ──
    if (event === "push") {
      const pushPayload = payload as WebhookPushPayload;
      const { repository } = pushPayload;
      const owner = repository.owner.login;
      const repo = repository.name;
      const defaultBranch = repository.default_branch;
      const pushedBranch = pushPayload.ref.replace("refs/heads/", "");

      // Only scan pushes to the default branch
      if (pushedBranch !== defaultBranch) {
        return Response.json({
          message: "Skipped — not the default branch",
          branch: pushedBranch,
          defaultBranch,
        });
      }

      const files = await fetchAllFiles(owner, repo, defaultBranch, accessToken);
      const vulnerabilities = scanFiles(files);

      const summary = { critical: 0, high: 0, medium: 0, low: 0, total: vulnerabilities.length };
      for (const v of vulnerabilities) summary[v.severity as Severity]++;

      console.log(
        `[webhook:push] ${owner}/${repo} — scanned ${files.length} files, found ${vulnerabilities.length} issues`,
      );

      return Response.json({
        event: "push",
        repo: `${owner}/${repo}`,
        branch: defaultBranch,
        filesScanned: files.length,
        summary,
      });
    }

    // ── 7. Handle pull_request event (scan changed files) ──
    if (event === "pull_request") {
      const prPayload = payload as WebhookPullRequestPayload;
      const { action, number: prNumber, pull_request: pr, repository } = prPayload;

      // Only scan on opened or synchronize (new commits pushed)
      if (action !== "opened" && action !== "synchronize") {
        return Response.json({
          message: `Skipped — PR action "${action}" is not scanned`,
        });
      }

      const owner = repository.owner.login;
      const repo = repository.name;
      const headSha = pr.head.sha;

      const files = await fetchPRFiles(owner, repo, prNumber, headSha, accessToken);
      const vulnerabilities = scanFiles(files);

      // Post results as a PR comment
      const commentBody = formatPRComment(vulnerabilities, files.length);
      await postPRComment(owner, repo, prNumber, commentBody, accessToken);

      const summary = { critical: 0, high: 0, medium: 0, low: 0, total: vulnerabilities.length };
      for (const v of vulnerabilities) summary[v.severity as Severity]++;

      console.log(
        `[webhook:pull_request] ${owner}/${repo}#${prNumber} — scanned ${files.length} files, found ${vulnerabilities.length} issues`,
      );

      return Response.json({
        event: "pull_request",
        action,
        repo: `${owner}/${repo}`,
        pr: prNumber,
        filesScanned: files.length,
        summary,
      });
    }

    // ── 8. Unhandled event types ──
    return Response.json({ message: `Event "${event}" is not handled` });

  } catch (error) {
    // Never expose internal errors to the caller
    console.error(
      "[webhook:error]",
      error instanceof Error ? error.message : "Unknown error",
    );
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
}
