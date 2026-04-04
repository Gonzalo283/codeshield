import { NextRequest } from "next/server";
import { scanFiles } from "@/lib/scanner";
import { RepoFile, Severity } from "@/types";

// Simple in-memory rate limiter (per IP, resets on deploy)
const rateLimitMap = new Map<string, { count: number; resetAt: number }>();
const RATE_LIMIT = 10; // max requests per window
const RATE_WINDOW = 60 * 1000; // 1 minute

function isRateLimited(ip: string): boolean {
  const now = Date.now();
  const entry = rateLimitMap.get(ip);
  if (!entry || now > entry.resetAt) {
    rateLimitMap.set(ip, { count: 1, resetAt: now + RATE_WINDOW });
    return false;
  }
  entry.count++;
  return entry.count > RATE_LIMIT;
}

// Fetch with timeout
async function fetchWithTimeout(url: string, options: RequestInit, timeoutMs = 8000): Promise<Response> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), timeoutMs);
  try {
    return await fetch(url, { ...options, signal: controller.signal });
  } finally {
    clearTimeout(timeout);
  }
}

export async function POST(request: NextRequest) {
  try {
    // Rate limiting by IP
    const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim()
      || request.headers.get("x-real-ip")
      || "unknown";

    if (isRateLimited(ip)) {
      return Response.json(
        { error: "Rate limit exceeded. Try again in a minute." },
        { status: 429 }
      );
    }

    const body = await request.json();
    const { code, language, repoUrl } = body;

    // ── Mode 1: Scan pasted code directly ──
    if (code) {
      // Limit code size to 100KB
      if (typeof code !== "string" || code.length > 100_000) {
        return Response.json({ error: "Code too large. Max 100KB." }, { status: 400 });
      }

      const allowedExts = new Set(["ts", "js", "py", "go", "java", "rs", "rb", "php", "c", "cpp", "cs"]);
      const ext = allowedExts.has(language) ? language : "ts";

      const files: RepoFile[] = [{ path: `input.${ext}`, content: code }];
      const vulnerabilities = scanFiles(files);
      const summary = { critical: 0, high: 0, medium: 0, low: 0, total: vulnerabilities.length };
      for (const v of vulnerabilities) summary[v.severity as Severity]++;

      return Response.json({
        filesScanned: 1,
        vulnerabilities,
        summary,
        mode: "code",
      });
    }

    // ── Mode 2: Scan a public GitHub repo ──
    if (repoUrl) {
      // Strict URL validation — only allow real github.com URLs
      if (typeof repoUrl !== "string" || repoUrl.length > 200) {
        return Response.json({ error: "Invalid URL" }, { status: 400 });
      }

      const match = repoUrl.match(/^https?:\/\/github\.com\/([a-zA-Z0-9._-]+)\/([a-zA-Z0-9._-]+)\/?$/);
      if (!match) {
        return Response.json(
          { error: "Invalid GitHub URL. Use format: https://github.com/owner/repo" },
          { status: 400 }
        );
      }
      const [, owner, rawRepo] = match;
      const repoName = rawRepo.replace(/\.git$/, "");

      // Validate owner/repo lengths
      if (owner.length > 39 || repoName.length > 100) {
        return Response.json({ error: "Invalid repository" }, { status: 400 });
      }

      // GitHub API headers
      const ghHeaders: Record<string, string> = {
        Accept: "application/vnd.github.v3+json",
        "User-Agent": "CodeShield-Scanner",
      };
      if (process.env.GITHUB_CLIENT_ID && process.env.GITHUB_CLIENT_SECRET) {
        ghHeaders.Authorization = `Basic ${Buffer.from(
          `${process.env.GITHUB_CLIENT_ID}:${process.env.GITHUB_CLIENT_SECRET}`
        ).toString("base64")}`;
      }

      // Get default branch
      const repoRes = await fetchWithTimeout(
        `https://api.github.com/repos/${owner}/${repoName}`,
        { headers: ghHeaders }
      );

      if (!repoRes.ok) {
        if (repoRes.status === 404) {
          return Response.json({ error: "Repository not found or is private." }, { status: 404 });
        }
        if (repoRes.status === 403) {
          return Response.json({ error: "GitHub API rate limit exceeded. Try again later." }, { status: 429 });
        }
        return Response.json({ error: "Failed to access repository" }, { status: 502 });
      }

      const repoData = await repoRes.json();

      // Block private repos (should not happen via API without auth, but defense-in-depth)
      if (repoData.private) {
        return Response.json({ error: "Private repos require sign-in." }, { status: 403 });
      }

      const defaultBranch = repoData.default_branch || "main";

      // Fetch tree
      const treeRes = await fetchWithTimeout(
        `https://api.github.com/repos/${owner}/${repoName}/git/trees/${defaultBranch}?recursive=1`,
        { headers: ghHeaders }
      );

      if (!treeRes.ok) {
        return Response.json({ error: "Failed to access repository" }, { status: 502 });
      }

      const treeData = await treeRes.json();
      const scannableExts = new Set([
        ".ts", ".tsx", ".js", ".jsx", ".mjs", ".py", ".go", ".java",
        ".rs", ".rb", ".php", ".cs", ".cpp", ".c", ".h", ".swift",
        ".kt", ".sh", ".yaml", ".yml", ".json", ".env", ".sql",
      ]);
      const excludedDirs = ["node_modules", "vendor", "dist", "build", ".next", "__pycache__", ".git", "coverage"];

      const scannableFiles = (treeData.tree || [])
        .filter((item: { type: string; path: string; size?: number }) => {
          if (item.type !== "blob") return false;
          const ext = "." + item.path.split(".").pop()?.toLowerCase();
          if (!scannableExts.has(ext)) return false;
          if (excludedDirs.some((d: string) => item.path.startsWith(d + "/") || item.path.includes("/" + d + "/"))) return false;
          if ((item.size || 0) > 200_000) return false;
          return true;
        })
        .slice(0, 50); // Cap at 50 files for free public scan

      // Fetch file contents (batches of 5 to reduce load)
      const files: RepoFile[] = [];
      for (let i = 0; i < scannableFiles.length; i += 5) {
        const batch = scannableFiles.slice(i, i + 5);
        const results = await Promise.all(
          batch.map(async (item: { path: string }) => {
            try {
              const res = await fetchWithTimeout(
                `https://api.github.com/repos/${owner}/${repoName}/contents/${item.path}?ref=${defaultBranch}`,
                { headers: ghHeaders },
                5000
              );
              if (!res.ok) return null;
              const data = await res.json();
              if (data.content && data.encoding === "base64") {
                const content = Buffer.from(data.content, "base64").toString("utf-8");
                // Skip files with too much content
                if (content.length > 200_000) return null;
                return { path: item.path, content };
              }
            } catch { /* skip timed out files */ }
            return null;
          })
        );
        files.push(...(results.filter(Boolean) as RepoFile[]));
      }

      const vulnerabilities = scanFiles(files);
      const summary = { critical: 0, high: 0, medium: 0, low: 0, total: vulnerabilities.length };
      for (const v of vulnerabilities) summary[v.severity as Severity]++;

      return Response.json({
        owner,
        repo: repoName,
        filesScanned: files.length,
        vulnerabilities: vulnerabilities.slice(0, 30), // Cap at 30 results for free scan
        summary,
        mode: "repo",
        limited: vulnerabilities.length > 30,
      });
    }

    return Response.json({ error: "Provide 'code' or 'repoUrl'" }, { status: 400 });
  } catch (error) {
    // Never leak internal errors
    const message = error instanceof Error && error.name === "AbortError"
      ? "Request timed out. Try a smaller repository."
      : "Scan failed";
    return Response.json({ error: message }, { status: 500 });
  }
}
