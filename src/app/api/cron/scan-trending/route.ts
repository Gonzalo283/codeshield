// Cron: runs daily at 8am UTC
// Scans trending/popular GitHub repos and caches results
// This generates social proof data: "We scanned 10,000+ repos"
// Results served at /api/stats/trending

import { NextRequest } from "next/server";
import { scanFiles } from "@/lib/scanner";
import { RepoFile, Severity } from "@/types";

// Popular repos to scan for social proof
const TRENDING_REPOS = [
  "expressjs/express",
  "fastify/fastify",
  "koajs/koa",
  "nestjs/nest",
  "django/django",
  "pallets/flask",
  "gin-gonic/gin",
  "gofiber/fiber",
  "spring-projects/spring-boot",
  "laravel/laravel",
  "rails/rails",
  "actix/actix-web",
  "tokio-rs/axum",
  "vercel/next.js",
  "remix-run/remix",
  "sveltejs/kit",
  "vuejs/core",
  "facebook/react",
  "denoland/deno",
  "prisma/prisma",
];

// In-memory cache for scan results (persists until next deploy)
const scanCache: {
  results: Array<{ repo: string; vulns: number; critical: number; scannedAt: string }>;
  lastRun: string;
  totalVulns: number;
  totalRepos: number;
} = {
  results: [],
  lastRun: "",
  totalVulns: 0,
  totalRepos: 0,
};

export { scanCache };

async function fetchWithTimeout(url: string, headers: Record<string, string>, ms = 5000) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), ms);
  try {
    return await fetch(url, { headers, signal: controller.signal });
  } finally {
    clearTimeout(timeout);
  }
}

export async function GET(request: NextRequest) {
  const authHeader = request.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const ghHeaders: Record<string, string> = {
    Accept: "application/vnd.github.v3+json",
    "User-Agent": "CodeShield-Scanner",
  };
  if (process.env.GITHUB_CLIENT_ID && process.env.GITHUB_CLIENT_SECRET) {
    ghHeaders.Authorization = `Basic ${Buffer.from(
      `${process.env.GITHUB_CLIENT_ID}:${process.env.GITHUB_CLIENT_SECRET}`
    ).toString("base64")}`;
  }

  const results: typeof scanCache.results = [];

  for (const repoFullName of TRENDING_REPOS) {
    const [owner, repo] = repoFullName.split("/");
    try {
      // Get default branch
      const repoRes = await fetchWithTimeout(
        `https://api.github.com/repos/${owner}/${repo}`,
        ghHeaders
      );
      if (!repoRes.ok) continue;
      const repoData = await repoRes.json();
      const branch = repoData.default_branch || "main";

      // Get tree (limit depth)
      const treeRes = await fetchWithTimeout(
        `https://api.github.com/repos/${owner}/${repo}/git/trees/${branch}?recursive=1`,
        ghHeaders,
        8000
      );
      if (!treeRes.ok) continue;
      const treeData = await treeRes.json();

      const scannableExts = new Set([".ts", ".tsx", ".js", ".jsx", ".py", ".go", ".java", ".rs", ".rb", ".php"]);
      const excludedDirs = ["node_modules", "vendor", "dist", "build", ".next", "__pycache__", ".git", "test", "tests", "spec", "docs"];

      const filesToScan = (treeData.tree || [])
        .filter((item: { type: string; path: string; size?: number }) => {
          if (item.type !== "blob") return false;
          const ext = "." + item.path.split(".").pop()?.toLowerCase();
          if (!scannableExts.has(ext)) return false;
          if (excludedDirs.some((d: string) => item.path.startsWith(d + "/") || item.path.includes("/" + d + "/"))) return false;
          if ((item.size || 0) > 100_000) return false;
          return true;
        })
        .slice(0, 20); // Only scan 20 files per repo for speed

      const files: RepoFile[] = [];
      for (const item of filesToScan) {
        try {
          const res = await fetchWithTimeout(
            `https://api.github.com/repos/${owner}/${repo}/contents/${(item as { path: string }).path}?ref=${branch}`,
            ghHeaders
          );
          if (!res.ok) continue;
          const data = await res.json();
          if (data.content && data.encoding === "base64") {
            files.push({
              path: (item as { path: string }).path,
              content: Buffer.from(data.content, "base64").toString("utf-8"),
            });
          }
        } catch { continue; }
      }

      const vulns = scanFiles(files);
      const critical = vulns.filter((v) => v.severity === "critical").length;

      results.push({
        repo: repoFullName,
        vulns: vulns.length,
        critical,
        scannedAt: new Date().toISOString(),
      });
    } catch { continue; }
  }

  // Update cache
  scanCache.results = results;
  scanCache.lastRun = new Date().toISOString();
  scanCache.totalVulns = results.reduce((acc, r) => acc + r.vulns, 0);
  scanCache.totalRepos = results.length;

  return Response.json({
    success: true,
    timestamp: scanCache.lastRun,
    reposScanned: scanCache.totalRepos,
    totalVulnerabilities: scanCache.totalVulns,
    results: results.map((r) => ({
      repo: r.repo,
      vulnerabilities: r.vulns,
      critical: r.critical,
    })),
  });
}
