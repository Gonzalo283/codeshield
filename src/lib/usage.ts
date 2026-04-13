// Usage tracking — DB-backed for authenticated users, cookie-backed for anonymous.
// Free tier: 10 scans/month. Team/Business/Enterprise: unlimited.

import { cookies } from "next/headers";
import { db } from "./db";
import { getActiveSubscription } from "./subscriptions";
import { sendEmail, emailTemplates } from "./email";
import { log } from "./logger";

const FREE_SCAN_LIMIT = 10;
const COOKIE_NAME = "cs_usage";

interface UsageData {
  scans: number;
  month: string; // "2026-04"
  repos: string[];
}

function getCurrentMonth(): string {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
}

function monthBoundaries(): { start: Date; end: Date } {
  const now = new Date();
  const start = new Date(now.getFullYear(), now.getMonth(), 1);
  const end = new Date(now.getFullYear(), now.getMonth() + 1, 1);
  return { start, end };
}

// ── Cookie-based (anonymous / pre-auth) ──
export async function getUsage(): Promise<UsageData> {
  const cookieStore = await cookies();
  const raw = cookieStore.get(COOKIE_NAME)?.value;
  const currentMonth = getCurrentMonth();

  if (!raw) return { scans: 0, month: currentMonth, repos: [] };

  try {
    const data: UsageData = JSON.parse(raw);
    if (data.month !== currentMonth) return { scans: 0, month: currentMonth, repos: [] };
    return data;
  } catch {
    return { scans: 0, month: currentMonth, repos: [] };
  }
}

export function serializeUsage(data: UsageData): string {
  return JSON.stringify(data);
}

export function canScan(usage: UsageData): { allowed: boolean; remaining: number; reason?: string } {
  const remaining = Math.max(0, FREE_SCAN_LIMIT - usage.scans);
  if (usage.scans >= FREE_SCAN_LIMIT) {
    return {
      allowed: false,
      remaining: 0,
      reason: `You've used all ${FREE_SCAN_LIMIT} free scans this month. Upgrade to Team for unlimited scans.`,
    };
  }
  return { allowed: true, remaining };
}

export function incrementUsage(usage: UsageData, repoName?: string): UsageData {
  const newUsage: UsageData = {
    ...usage,
    scans: usage.scans + 1,
    month: getCurrentMonth(),
  };
  if (repoName && !newUsage.repos.includes(repoName)) {
    newUsage.repos = [...newUsage.repos, repoName];
  }
  return newUsage;
}

// ── DB-based (authenticated users) ──

export interface UserUsage {
  scansThisMonth: number;
  monthStart: Date;
  monthEnd: Date;
  limit: number; // -1 = unlimited
  remaining: number; // -1 = unlimited
  planId: string;
  reposScanned: number;
}

export async function getUserUsage(userId: string): Promise<UserUsage> {
  const { start, end } = monthBoundaries();

  const [scansThisMonth, subscription, reposScanned] = await Promise.all([
    db.usageLog.count({
      where: {
        userId,
        status: "ok",
        createdAt: { gte: start, lt: end },
      },
    }),
    getActiveSubscription(userId),
    db.scanRecord
      .findMany({
        where: { userId, createdAt: { gte: start, lt: end } },
        distinct: ["repoFullName"],
        select: { repoFullName: true },
      })
      .then((r) => r.filter((x) => x.repoFullName).length),
  ]);

  const planId = subscription?.planId || "free";
  const limit =
    planId === "free" ? FREE_SCAN_LIMIT : -1; // Paid plans = unlimited
  const remaining = limit === -1 ? -1 : Math.max(0, limit - scansThisMonth);

  return {
    scansThisMonth,
    monthStart: start,
    monthEnd: end,
    limit,
    remaining,
    planId,
    reposScanned,
  };
}

export async function canUserScan(
  userId: string
): Promise<{ allowed: boolean; usage: UserUsage; reason?: string }> {
  const usage = await getUserUsage(userId);
  if (usage.limit === -1) return { allowed: true, usage };
  if (usage.scansThisMonth >= usage.limit) {
    return {
      allowed: false,
      usage,
      reason: `Monthly free limit reached (${usage.limit}). Upgrade to Team for unlimited scans.`,
    };
  }
  return { allowed: true, usage };
}

// ── Log a usage event (audit + billing basis) ──
export async function logUsage(input: {
  userId?: string | null;
  apiKeyId?: string | null;
  endpoint: string;
  repoFullName?: string | null;
  filesScanned?: number;
  vulnFound?: number;
  durationMs?: number;
  status?: "ok" | "error" | "quota_exceeded" | "rate_limited";
  errorCode?: string | null;
  ip?: string | null;
}) {
  try {
    await db.usageLog.create({
      data: {
        userId: input.userId || null,
        apiKeyId: input.apiKeyId || null,
        endpoint: input.endpoint,
        repoFullName: input.repoFullName || null,
        filesScanned: input.filesScanned || 0,
        vulnFound: input.vulnFound || 0,
        durationMs: input.durationMs || 0,
        status: input.status || "ok",
        errorCode: input.errorCode || null,
        ip: input.ip || null,
      },
    });

    // After-the-fact: warn the user once when they cross 80% of the free quota.
    // We do this only for "ok" scans with a userId, to avoid firing on errors.
    if (input.status === "ok" && input.userId) {
      await maybeSendUsageWarning(input.userId).catch(() => {});
    }
  } catch {
    // Never fail the request because of audit logging
  }
}

// ── 80%-quota warning (fires at most once per month per user) ──
const WARNING_THRESHOLD = 0.8;

async function maybeSendUsageWarning(userId: string) {
  const usage = await getUserUsage(userId);
  if (usage.limit === -1) return; // unlimited, nothing to warn
  const threshold = Math.floor(usage.limit * WARNING_THRESHOLD);
  if (usage.scansThisMonth < threshold) return;

  // Check if we already warned this month
  const alreadyWarned = await db.usageLog.findFirst({
    where: {
      userId,
      endpoint: "__email:usage-warning",
      createdAt: { gte: usage.monthStart, lt: usage.monthEnd },
    },
  });
  if (alreadyWarned) return;

  const user = await db.user.findUnique({ where: { id: userId }, select: { email: true } });
  if (!user?.email) return;

  await sendEmail({
    to: user.email,
    ...emailTemplates.usageWarning(usage.scansThisMonth, usage.limit),
  });

  // Mark as warned (idempotency marker) — reuse UsageLog with a distinctive endpoint
  await db.usageLog.create({
    data: {
      userId,
      endpoint: "__email:usage-warning",
      status: "ok",
    },
  });

  log.info("usage-warning-sent", { userId, used: usage.scansThisMonth, limit: usage.limit });
}
