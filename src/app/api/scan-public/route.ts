import { NextRequest } from "next/server";
import { scanFiles } from "@/lib/scanner";
import { RepoFile, Severity } from "@/types";

export async function POST(request: NextRequest) {
  try {
    const { code, language, repoUrl } = await request.json();

    // Mode 1: Scan pasted code directly
    if (code) {
      const ext = language || "ts";
      const files: RepoFile[] = [
        { path: `input.${ext}`, content: code },
      ];
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

    // Mode 2: Scan a public GitHub repo (no auth needed)
    if (repoUrl) {
      const match = repoUrl.match(/github\.com\/([^/]+)\/([^/\s?#]+)/);
      if (!match) {
        return Response.json({ error: "Invalid GitHub URL. Use format: github.com/owner/repo" }, { status: 400 });
      }
      const [, owner, repo] = match;
      const repoName = repo.replace(/\.git$/, "");

      // Fetch public repo tree (no auth token needed for public repos)
      const treeRes = await fetch(
        `https://api.github.com/repos/${owner}/${repoName}/git/trees/HEAD?recursive=1`,
        {
          headers: {
            Accept: "application/vnd.github.v3+json",
            "User-Agent": "CodeShield-Scanner",
          },
        }
      );

      if (!treeRes.ok) {
        if (treeRes.status === 404) {
          return Response.json({ error: "Repository not found or is private. Only public repos can be scanned without login." }, { status: 404 });
        }
        return Response.json({ error: "Failed to access repository" }, { status: treeRes.status });
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
          if (excludedDirs.some((d) => item.path.startsWith(d + "/") || item.path.includes("/" + d + "/"))) return false;
          if ((item.size || 0) > 200_000) return false; // 200KB limit for public scan
          return true;
        })
        .slice(0, 100); // Cap at 100 files for free scan

      // Fetch file contents in parallel (batches of 10)
      const files: RepoFile[] = [];
      for (let i = 0; i < scannableFiles.length; i += 10) {
        const batch = scannableFiles.slice(i, i + 10);
        const results = await Promise.all(
          batch.map(async (item: { path: string }) => {
            try {
              const res = await fetch(
                `https://api.github.com/repos/${owner}/${repoName}/contents/${item.path}`,
                {
                  headers: {
                    Accept: "application/vnd.github.v3+json",
                    "User-Agent": "CodeShield-Scanner",
                  },
                }
              );
              if (!res.ok) return null;
              const data = await res.json();
              if (data.content && data.encoding === "base64") {
                return {
                  path: item.path,
                  content: Buffer.from(data.content, "base64").toString("utf-8"),
                };
              }
            } catch { /* skip */ }
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
        totalFilesInRepo: scannableFiles.length,
        vulnerabilities: vulnerabilities.slice(0, 50), // Cap results for free scan
        summary,
        mode: "repo",
        limited: vulnerabilities.length > 50,
      });
    }

    return Response.json({ error: "Provide 'code' or 'repoUrl'" }, { status: 400 });
  } catch (error) {
    console.error("Public scan error:", error);
    return Response.json({ error: "Scan failed" }, { status: 500 });
  }
}
