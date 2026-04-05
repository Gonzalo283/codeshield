import { NextRequest } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { fetchRepoFiles } from "@/lib/github";
import { scanFiles } from "@/lib/scanner";
import { getUsage, canScan, incrementUsage, serializeUsage } from "@/lib/usage";
import { ScanResult, Severity } from "@/types";

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return Response.json({ error: "Not authenticated" }, { status: 401 });
    }

    // Check usage limits (free tier)
    const usage = await getUsage();
    const check = canScan(usage);

    if (!check.allowed) {
      return Response.json(
        {
          error: "limit_reached",
          message: check.reason,
          scansUsed: usage.scans,
          upgradeUrl: "/pricing",
        },
        { status: 403 }
      );
    }

    const { owner, repo, accessToken } = await request.json();

    if (!owner || !repo || !accessToken) {
      return Response.json({ error: "Missing required fields" }, { status: 400 });
    }

    if (!/^[a-zA-Z0-9._-]+$/.test(owner) || !/^[a-zA-Z0-9._-]+$/.test(repo)) {
      return Response.json({ error: "Invalid owner or repo name" }, { status: 400 });
    }

    const files = await fetchRepoFiles(owner, repo, accessToken);
    const vulnerabilities = scanFiles(files);

    const summary = { critical: 0, high: 0, medium: 0, low: 0, total: vulnerabilities.length };
    for (const v of vulnerabilities) summary[v.severity as Severity]++;

    const result: ScanResult = {
      owner,
      repo,
      scannedAt: new Date().toISOString(),
      filesScanned: files.length,
      vulnerabilities,
      summary,
    };

    // Increment usage and set cookie
    const newUsage = incrementUsage(usage, `${owner}/${repo}`);
    const response = Response.json({ ...result, usage: { scansUsed: newUsage.scans, remaining: 10 - newUsage.scans } });

    response.headers.set(
      "Set-Cookie",
      `cs_usage=${encodeURIComponent(serializeUsage(newUsage))}; Path=/; HttpOnly; SameSite=Lax; Max-Age=${60 * 60 * 24 * 35}`
    );

    return response;
  } catch (error) {
    console.error("Scan error:", error instanceof Error ? error.message : "Unknown");
    return Response.json({ error: "Failed to scan repository" }, { status: 500 });
  }
}
