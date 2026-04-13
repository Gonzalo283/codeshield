// API Key management endpoints (authenticated user only)
// GET  /api/keys        → list user's keys (hash never exposed; only last4)
// POST /api/keys        → create a new key { name? } → returns raw key ONCE

import { NextRequest } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import {
  listApiKeysForUser,
  createApiKey,
  type ApiPlan,
} from "@/lib/api-keys";
import { getUserPlan } from "@/lib/subscriptions";
import { planIdToApiPlan } from "@/lib/subscriptions";
import { log } from "@/lib/logger";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return Response.json({ error: "unauthenticated" }, { status: 401 });
  }

  const keys = await listApiKeysForUser(session.user.id);
  return Response.json({
    keys: keys.map((k) => ({
      id: k.id,
      name: k.name,
      display: `${k.prefix}${"•".repeat(24)}${k.last4}`,
      last4: k.last4,
      plan: k.plan,
      scansUsed: k.scansUsed,
      resetAt: k.resetAt,
      createdAt: k.createdAt,
      lastUsedAt: k.lastUsedAt,
    })),
  });
}

export async function POST(request: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return Response.json({ error: "unauthenticated" }, { status: 401 });
  }

  let body: { name?: string } = {};
  try {
    body = await request.json();
  } catch {
    // body is optional
  }

  const name =
    typeof body.name === "string" && body.name.trim()
      ? body.name.trim().slice(0, 60)
      : "Default key";

  // Derive API plan from the user's current subscription
  const planId = await getUserPlan(session.user.id);
  const apiPlan: ApiPlan = planIdToApiPlan(planId);

  const { rawKey, id, last4 } = await createApiKey(session.user.id, apiPlan, name);

  log.info("api-key-created", { userId: session.user.id, id, apiPlan });

  return Response.json({
    id,
    name,
    // RAW key shown ONCE — client must save it
    key: rawKey,
    last4,
    plan: apiPlan,
  });
}
