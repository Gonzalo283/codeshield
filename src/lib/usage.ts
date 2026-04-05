// Usage tracking via cookies (no DB needed)
// Free tier: 10 scans/month, 5 repos
// When limit hit → show upgrade wall

import { cookies } from "next/headers";

const FREE_SCAN_LIMIT = 10;
const COOKIE_NAME = "cs_usage";

interface UsageData {
  scans: number;
  month: string; // "2026-04" format
  repos: string[]; // repo full names scanned
}

function getCurrentMonth(): string {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
}

export async function getUsage(): Promise<UsageData> {
  const cookieStore = await cookies();
  const raw = cookieStore.get(COOKIE_NAME)?.value;
  const currentMonth = getCurrentMonth();

  if (!raw) {
    return { scans: 0, month: currentMonth, repos: [] };
  }

  try {
    const data: UsageData = JSON.parse(raw);
    // Reset if new month
    if (data.month !== currentMonth) {
      return { scans: 0, month: currentMonth, repos: [] };
    }
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
  const newUsage = {
    ...usage,
    scans: usage.scans + 1,
    month: getCurrentMonth(),
  };

  if (repoName && !newUsage.repos.includes(repoName)) {
    newUsage.repos = [...newUsage.repos, repoName];
  }

  return newUsage;
}
