import { NextRequest } from "next/server";
import { fetchRepoFiles } from "@/lib/github";
import { scanFiles } from "@/lib/scanner";
import { ScanResult, Severity } from "@/types";

export async function POST(request: NextRequest) {
  try {
    const { owner, repo, accessToken } = await request.json();

    if (!owner || !repo || !accessToken) {
      return Response.json(
        { error: "Missing required fields: owner, repo, accessToken" },
        { status: 400 }
      );
    }

    const files = await fetchRepoFiles(owner, repo, accessToken);
    const vulnerabilities = scanFiles(files);

    const summary = {
      critical: 0,
      high: 0,
      medium: 0,
      low: 0,
      total: vulnerabilities.length,
    };

    for (const v of vulnerabilities) {
      summary[v.severity as Severity]++;
    }

    const result: ScanResult = {
      owner,
      repo,
      scannedAt: new Date().toISOString(),
      filesScanned: files.length,
      vulnerabilities,
      summary,
    };

    return Response.json(result);
  } catch (error) {
    console.error("Scan error:", error);
    return Response.json(
      { error: "Failed to scan repository" },
      { status: 500 }
    );
  }
}
