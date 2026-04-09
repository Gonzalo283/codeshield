// API Key management for public API monetization
// Keys are stored in-memory for MVP (production: move to DB)
// Format: cs_live_XXXXXXXXXXXX or cs_test_XXXXXXXXXXXX

import { hashApiKey } from "./security";

export interface ApiKeyData {
  keyHash: string;
  userId: string;
  email: string;
  plan: "free" | "starter" | "growth" | "enterprise";
  limits: {
    scansPerMonth: number;
    scansUsed: number;
    resetAt: string; // ISO date
  };
  createdAt: string;
  lastUsedAt: string;
}

// In-memory store (production: use Redis or Postgres)
const apiKeys = new Map<string, ApiKeyData>();

// Plan limits for API tiers
export const API_PLANS = {
  free: { scansPerMonth: 10, pricePerScan: 0 },
  starter: { scansPerMonth: 100, pricePerScan: 0.49 },
  growth: { scansPerMonth: 1000, pricePerScan: 0.30 },
  enterprise: { scansPerMonth: -1, pricePerScan: 0.20 },
} as const;

export async function validateApiKey(key: string): Promise<ApiKeyData | null> {
  const hash = await hashApiKey(key);
  return apiKeys.get(hash) || null;
}

export async function createApiKey(userId: string, email: string, plan: ApiKeyData["plan"] = "free"): Promise<string> {
  const raw = `cs_live_${generateRandomString(32)}`;
  const hash = await hashApiKey(raw);

  const now = new Date();
  const resetAt = new Date(now.getFullYear(), now.getMonth() + 1, 1).toISOString();

  apiKeys.set(hash, {
    keyHash: hash,
    userId,
    email,
    plan,
    limits: {
      scansPerMonth: API_PLANS[plan].scansPerMonth,
      scansUsed: 0,
      resetAt,
    },
    createdAt: now.toISOString(),
    lastUsedAt: now.toISOString(),
  });

  return raw;
}

export async function incrementApiUsage(key: string): Promise<{ allowed: boolean; remaining: number }> {
  const hash = await hashApiKey(key);
  const data = apiKeys.get(hash);
  if (!data) return { allowed: false, remaining: 0 };

  // Reset monthly counter if needed
  if (new Date() > new Date(data.limits.resetAt)) {
    data.limits.scansUsed = 0;
    const now = new Date();
    data.limits.resetAt = new Date(now.getFullYear(), now.getMonth() + 1, 1).toISOString();
  }

  // Enterprise = unlimited
  if (data.limits.scansPerMonth === -1) {
    data.limits.scansUsed++;
    data.lastUsedAt = new Date().toISOString();
    return { allowed: true, remaining: -1 };
  }

  if (data.limits.scansUsed >= data.limits.scansPerMonth) {
    return { allowed: false, remaining: 0 };
  }

  data.limits.scansUsed++;
  data.lastUsedAt = new Date().toISOString();
  return {
    allowed: true,
    remaining: data.limits.scansPerMonth - data.limits.scansUsed,
  };
}

function generateRandomString(length: number): string {
  const chars = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  let result = "";
  const array = new Uint8Array(length);
  crypto.getRandomValues(array);
  for (let i = 0; i < length; i++) {
    result += chars[array[i] % chars.length];
  }
  return result;
}
