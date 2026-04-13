// API Key management — DB-backed (Prisma)
// Format: cs_live_XXXXXXXXXXXX or cs_test_XXXXXXXXXXXX
// Keys are hashed (SHA-256) before storage. Plaintext shown only at creation.

import { db } from "./db";
import { hashApiKey } from "./security";

export type ApiPlan = "free" | "starter" | "growth" | "enterprise";

export interface ApiKeyData {
  id: string;
  userId: string;
  plan: ApiPlan;
  limits: {
    scansPerMonth: number;
    scansUsed: number;
    resetAt: string;
  };
  createdAt: string;
  lastUsedAt: string;
}

// Plan limits for API tiers
export const API_PLANS = {
  free: { scansPerMonth: 10, pricePerScan: 0 },
  starter: { scansPerMonth: 100, pricePerScan: 0.49 },
  growth: { scansPerMonth: 1000, pricePerScan: 0.3 },
  enterprise: { scansPerMonth: -1, pricePerScan: 0.2 },
} as const;

function nextMonthStart(): Date {
  const now = new Date();
  return new Date(now.getFullYear(), now.getMonth() + 1, 1);
}

function toApiKeyData(row: {
  id: string;
  userId: string;
  plan: string;
  scansUsed: number;
  resetAt: Date;
  createdAt: Date;
  lastUsedAt: Date;
}): ApiKeyData {
  const plan = (row.plan as ApiPlan) || "free";
  return {
    id: row.id,
    userId: row.userId,
    plan,
    limits: {
      scansPerMonth: API_PLANS[plan].scansPerMonth,
      scansUsed: row.scansUsed,
      resetAt: row.resetAt.toISOString(),
    },
    createdAt: row.createdAt.toISOString(),
    lastUsedAt: row.lastUsedAt.toISOString(),
  };
}

export async function validateApiKey(key: string): Promise<ApiKeyData | null> {
  const hash = await hashApiKey(key);
  const row = await db.apiKey.findUnique({ where: { keyHash: hash } });
  if (!row || row.revokedAt) return null;
  return toApiKeyData(row);
}

export async function createApiKey(
  userId: string,
  plan: ApiPlan = "free",
  name: string = "Default key"
): Promise<{ rawKey: string; id: string; last4: string }> {
  const raw = `cs_live_${generateRandomString(32)}`;
  const hash = await hashApiKey(raw);
  const last4 = raw.slice(-4);

  const key = await db.apiKey.create({
    data: {
      userId,
      name,
      prefix: "cs_live_",
      last4,
      keyHash: hash,
      plan,
      scansUsed: 0,
      resetAt: nextMonthStart(),
    },
  });

  return { rawKey: raw, id: key.id, last4 };
}

export async function listApiKeysForUser(userId: string) {
  return db.apiKey.findMany({
    where: { userId, revokedAt: null },
    select: {
      id: true,
      name: true,
      prefix: true,
      last4: true,
      plan: true,
      scansUsed: true,
      resetAt: true,
      createdAt: true,
      lastUsedAt: true,
    },
    orderBy: { createdAt: "desc" },
  });
}

export async function revokeApiKey(id: string, userId: string) {
  await db.apiKey.updateMany({
    where: { id, userId },
    data: { revokedAt: new Date() },
  });
}

export async function incrementApiUsage(
  key: string
): Promise<{ allowed: boolean; remaining: number; keyData: ApiKeyData | null }> {
  const hash = await hashApiKey(key);
  const row = await db.apiKey.findUnique({ where: { keyHash: hash } });
  if (!row || row.revokedAt) return { allowed: false, remaining: 0, keyData: null };

  const now = new Date();
  const plan = (row.plan as ApiPlan) || "free";
  const limit = API_PLANS[plan].scansPerMonth;

  // Reset monthly counter if past resetAt
  let scansUsed = row.scansUsed;
  let resetAt = row.resetAt;
  if (now > row.resetAt) {
    scansUsed = 0;
    resetAt = nextMonthStart();
  }

  // Enterprise = unlimited
  if (limit === -1) {
    const updated = await db.apiKey.update({
      where: { id: row.id },
      data: { scansUsed: scansUsed + 1, resetAt, lastUsedAt: now },
    });
    return { allowed: true, remaining: -1, keyData: toApiKeyData(updated) };
  }

  if (scansUsed >= limit) {
    // Still update resetAt if expired
    if (resetAt !== row.resetAt) {
      await db.apiKey.update({ where: { id: row.id }, data: { resetAt } });
    }
    return { allowed: false, remaining: 0, keyData: toApiKeyData(row) };
  }

  const updated = await db.apiKey.update({
    where: { id: row.id },
    data: { scansUsed: scansUsed + 1, resetAt, lastUsedAt: now },
  });
  return {
    allowed: true,
    remaining: limit - (scansUsed + 1),
    keyData: toApiKeyData(updated),
  };
}

export async function updateApiKeyPlan(userId: string, plan: ApiPlan) {
  // Apply the plan to all active keys of this user
  await db.apiKey.updateMany({
    where: { userId, revokedAt: null },
    data: { plan },
  });
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
