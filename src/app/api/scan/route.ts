import { NextRequest } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { fetchRepoFiles } from "@/lib/github";
import { scanFiles } from "@/lib/scanner";
import {
  getUsage,
  canScan,
  incrementUsage,
  serializeUsage,
  canUserScan,
  logUsage,
} from "@/lib/usage";
import { rateLimit, getClientIp, verifyCsrf, logRequest } from "@/lib/security";
import { db } from "@/lib/db";
import { log } from "@/lib/logger";
import { ScanResult, Severity } from "@/types";

export async function POST(request: NextRequest) {
  const started = Date.now();
  try {
    if (!verifyCsrf(request)) {
      return Response.json({ error: "Forbidden" }, { status: 403 });
    }

    const session = await getServerSession(authOptions);
    if (!session) {
      return Response.json({ error: "Not authenticated" }, { status: 401 });
    }

    // Rate limit: 30 scans per hour per IP
    const ip = getClientIp(request);
    const limit = rateLimit(ip, { maxRequests: 30, windowMs: 60 * 60 * 1000 });
    if (!limit.allowed) {
      return Response.json({ error: "Rate limit exceeded" }, { status: 429 });
    }

    const userId = session.user?.id;

    // Check plan quota if we have a DB user; otherwise fallback to cookie
    if (userId) {
      const check = await canUserScan(userId);
      if (!check.allowed) {
        await logUsage({
          userId,
          endpoint: "/api/scan",
          status: "quota_exceeded",
          ip,
        });
        return Response.json(
          {
            error: "limit_reached",
            message: check.reason,
            scansUsed: check.usage.scansThisMonth,
            planId: check.usage.planId,
            upgradeUrl: "/pricing",
          },
          { status: 403 }
        );
      }
    } else {
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
    }

    const { owner, repo, accessToken } = await request.json();

    if (!owner || !repo || !accessToken) {
      return Response.json({ error: "Missing required fields" }, { status: 400 });
    }

    if (!/^[a-zA-Z0-9._-]+$/.test(owner) || !/^[a-zA-Z0-9._-]+$/.test(repo)) {
      return Response.json({ error: "Invalid owner or repo name" }, { status: 400 });
    }

    logRequest(request, `scan ${owner}/${repo} by ${session.user?.email}`);

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

    const durationMs = Date.now() - started;
    const repoFullName = `${owner}/${repo}`;

    // Persist ScanRecord + UsageLog for authenticated users
    if (userId) {
      try {
        await db.scanRecord.create({
          data: {
            userId,
            repoFullName,
            source: "dashboard",
            status: "completed",
            filesScanned: files.length,
            critical: summary.critical,
            high: summary.high,
            medium: summary.medium,
            low: summary.low,
            findingsJson: JSON.stringify(vulnerabilities.slice(0, 500)),
            durationMs,
          },
        });
      } catch (e) {
        log.warn("Failed to persist ScanRecord", { error: String(e) });
      }

      await logUsage({
        userId,
        endpoint: "/api/scan",
        repoFullName,
        filesScanned: files.length,
        vulnFound: summary.total,
        durationMs,
        status: "ok",
        ip,
      });

      return Response.json({ ...result, usage: { scansRecorded: true } });
    }

    // Anonymous: keep legacy cookie-based usage
    const usage = await getUsage();
    const newUsage = incrementUsage(usage, `${owner}/${repo}`);
    const response = Response.json({
      ...result,
      usage: { scansUsed: newUsage.scans, remaining: 10 - newUsage.scans },
    });
    response.headers.set(
      "Set-Cookie",
      `cs_usage=${encodeURIComponent(serializeUsage(newUsage))}; Path=/; HttpOnly; SameSite=Lax; Max-Age=${60 * 60 * 24 * 35}`
    );
    return response;
  } catch (error) {
    log.error("Scan error", error as Error);
    return Response.json({ error: "Failed to scan repository" }, { status: 500 });
  }
}
