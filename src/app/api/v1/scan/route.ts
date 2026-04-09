// ── Public API v1: /api/v1/scan ──
// Monetized scan endpoint for CI/CD integration and third-party tools
// Auth: Bearer token (API key) or Basic auth
// Rate limited per API key plan
//
// Usage:
//   curl -X POST https://codeshield.sh/api/v1/scan \
//     -H "Authorization: Bearer cs_live_xxx" \
//     -H "Content-Type: application/json" \
//     -d '{"repo": "https://github.com/owner/repo"}' | json
//
//   curl -X POST https://codeshield.sh/api/v1/scan \
//     -H "Authorization: Bearer cs_live_xxx" \
//     -H "Content-Type: application/json" \
//     -d '{"code": "eval(userInput)", "language": "js"}' | json

import { NextRequest } from "next/server";
import { scanFiles } from "@/lib/scanner";
import { validateApiKey, incrementApiUsage } from "@/lib/api-keys";
import { rateLimit, getClientIp, logRequest } from "@/lib/security";
import { RepoFile, Severity } from "@/types";

export async function POST(request: NextRequest) {
  try {
    // Extract API key from Authorization header
    const authHeader = request.headers.get("authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return Response.json(
        {
          error: "missing_api_key",
          message: "Include your API key: Authorization: Bearer cs_live_xxx",
          docs: "https://codeshield.sh/docs#api",
        },
        { status: 401 }
      );
    }

    const apiKey = authHeader.slice(7);

    // Validate key format
    if (!apiKey.startsWith("cs_live_") && !apiKey.startsWith("cs_test_")) {
      return Response.json(
        { error: "invalid_api_key", message: "API key must start with cs_live_ or cs_test_" },
        { status: 401 }
      );
    }

    // IP rate limit (global, regardless of API key)
    const ip = getClientIp(request);
    const ipLimit = rateLimit(ip, { maxRequests: 60, windowMs: 60 * 1000 });
    if (!ipLimit.allowed) {
      return Response.json(
        { error: "rate_limit", message: "Too many requests. Max 60/minute." },
        { status: 429, headers: { "Retry-After": "60" } }
      );
    }

    // Validate API key
    const keyData = await validateApiKey(apiKey);
    if (!keyData) {
      return Response.json(
        { error: "invalid_api_key", message: "API key not found. Generate one at codeshield.sh/settings" },
        { status: 401 }
      );
    }

    // Check plan usage
    const usage = await incrementApiUsage(apiKey);
    if (!usage.allowed) {
      return Response.json(
        {
          error: "quota_exceeded",
          message: `Monthly scan quota exceeded (${keyData.limits.scansPerMonth} scans). Upgrade at codeshield.sh/pricing`,
          plan: keyData.plan,
          upgradeUrl: "https://codeshield.sh/pricing",
        },
        { status: 429 }
      );
    }

    const body = await request.json();
    const { code, language, repo } = body;

    let files: RepoFile[] = [];

    // Mode 1: Direct code scan
    if (code) {
      if (typeof code !== "string" || code.length > 500_000) {
        return Response.json({ error: "invalid_input", message: "Code too large. Max 500KB." }, { status: 400 });
      }
      const ext = (typeof language === "string" && /^[a-z]{1,10}$/.test(language)) ? language : "ts";
      files = [{ path: `input.${ext}`, content: code }];
    }
    // Mode 2: GitHub repo scan
    else if (repo) {
      const match = String(repo).match(/^https?:\/\/github\.com\/([a-zA-Z0-9._-]+)\/([a-zA-Z0-9._-]+)\/?$/);
      if (!match) {
        return Response.json(
          { error: "invalid_repo", message: "Use format: https://github.com/owner/repo" },
          { status: 400 }
        );
      }

      const [, owner, repoName] = match;
      const ghHeaders: Record<string, string> = {
        Accept: "application/vnd.github.v3+json",
        "User-Agent": "CodeShield-API-v1",
      };
      if (process.env.GITHUB_CLIENT_ID && process.env.GITHUB_CLIENT_SECRET) {
        ghHeaders.Authorization = `Basic ${Buffer.from(
          `${process.env.GITHUB_CLIENT_ID}:${process.env.GITHUB_CLIENT_SECRET}`
        ).toString("base64")}`;
      }

      // Fetch repo + tree
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 10000);

      try {
        const repoRes = await fetch(`https://api.github.com/repos/${owner}/${repoName}`, {
          headers: ghHeaders, signal: controller.signal,
        });
        if (!repoRes.ok) {
          return Response.json({ error: "repo_not_found", message: "Repository not found or private" }, { status: 404 });
        }

        const repoData = await repoRes.json();
        if (repoData.private) {
          return Response.json({ error: "private_repo", message: "Private repos require OAuth. Use the dashboard." }, { status: 403 });
        }

        const branch = repoData.default_branch || "main";
        const treeRes = await fetch(
          `https://api.github.com/repos/${owner}/${repoName}/git/trees/${branch}?recursive=1`,
          { headers: ghHeaders, signal: controller.signal }
        );
        if (!treeRes.ok) {
          return Response.json({ error: "tree_error", message: "Failed to fetch repository tree" }, { status: 502 });
        }

        const treeData = await treeRes.json();
        const exts = new Set([".ts",".tsx",".js",".jsx",".py",".go",".java",".rs",".rb",".php",".cs",".cpp",".c",".h"]);
        const excluded = ["node_modules","vendor","dist","build",".next","__pycache__",".git"];

        // Scan limit based on plan
        const maxFiles = keyData.plan === "enterprise" ? 500 : keyData.plan === "growth" ? 200 : 100;

        const scannable = (treeData.tree || [])
          .filter((item: { type: string; path: string; size?: number }) => {
            if (item.type !== "blob") return false;
            const ext = "." + item.path.split(".").pop()?.toLowerCase();
            if (!exts.has(ext)) return false;
            if (excluded.some((d: string) => item.path.startsWith(d + "/") || item.path.includes("/" + d + "/"))) return false;
            if ((item.size || 0) > 200_000) return false;
            return true;
          })
          .slice(0, maxFiles);

        // Fetch files in batches
        for (let i = 0; i < scannable.length; i += 10) {
          const batch = scannable.slice(i, i + 10);
          const results = await Promise.all(
            batch.map(async (item: { path: string }) => {
              try {
                const res = await fetch(
                  `https://api.github.com/repos/${owner}/${repoName}/contents/${item.path}?ref=${branch}`,
                  { headers: ghHeaders }
                );
                if (!res.ok) return null;
                const data = await res.json();
                if (data.content && data.encoding === "base64") {
                  return { path: item.path, content: Buffer.from(data.content, "base64").toString("utf-8") };
                }
              } catch { /* skip */ }
              return null;
            })
          );
          files.push(...(results.filter(Boolean) as RepoFile[]));
        }
      } finally {
        clearTimeout(timeout);
      }
    } else {
      return Response.json(
        { error: "missing_input", message: "Provide 'code' or 'repo' in the request body" },
        { status: 400 }
      );
    }

    // Run scan
    const vulnerabilities = scanFiles(files);
    const summary = { critical: 0, high: 0, medium: 0, low: 0, total: vulnerabilities.length };
    for (const v of vulnerabilities) summary[v.severity as Severity]++;

    logRequest(request, `api-v1-scan files=${files.length} vulns=${summary.total} plan=${keyData.plan}`);

    // Response
    return Response.json({
      success: true,
      scan: {
        filesScanned: files.length,
        vulnerabilities,
        summary,
        scannedAt: new Date().toISOString(),
      },
      usage: {
        plan: keyData.plan,
        scansRemaining: usage.remaining,
      },
      _links: {
        dashboard: "https://codeshield.sh/dashboard",
        docs: "https://codeshield.sh/docs#api",
        upgrade: "https://codeshield.sh/pricing",
      },
    });
  } catch (error) {
    const message = error instanceof Error && error.name === "AbortError"
      ? "Request timed out"
      : "Internal error";
    return Response.json({ error: "server_error", message }, { status: 500 });
  }
}
