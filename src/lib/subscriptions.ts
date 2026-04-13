// Subscription management — persists Stripe subscription state in DB.
// Source of truth is Stripe; the DB is a fast local cache kept in sync via webhooks.

import Stripe from "stripe";
import { db } from "./db";
import { PLANS, type PlanId } from "./stripe";
import { updateApiKeyPlan } from "./api-keys";
import { log } from "./logger";

/** Map a Stripe priceId back to our internal planId, or null. */
export function planIdFromPriceId(priceId: string | null | undefined): PlanId | null {
  if (!priceId) return null;
  for (const [id, plan] of Object.entries(PLANS)) {
    if ("priceId" in plan && plan.priceId === priceId) return id as PlanId;
  }
  return null;
}

/** Map checkout/subscription plan to internal API plan tier. */
export function planIdToApiPlan(planId: PlanId): "free" | "starter" | "growth" | "enterprise" {
  switch (planId) {
    case "team":
      return "growth";
    case "business":
      return "enterprise";
    case "enterprise":
      return "enterprise";
    default:
      return "free";
  }
}

/** Persist a Stripe Subscription row in our DB (upsert). */
export async function persistSubscription(
  subscription: Stripe.Subscription,
  userIdHint?: string | null
) {
  const priceId = subscription.items.data[0]?.price.id;
  const planId = planIdFromPriceId(priceId) || "free";
  const customerId =
    typeof subscription.customer === "string" ? subscription.customer : subscription.customer.id;

  // Find user: by hint, by customer, or by email fallback
  let userId = userIdHint || null;
  if (!userId) {
    const existing = await db.user.findUnique({ where: { stripeCustomerId: customerId } });
    userId = existing?.id || null;
  }

  if (!userId) {
    // Try by email from Stripe customer
    try {
      // Dynamic import to avoid circular
      const { getStripe } = await import("./stripe");
      const customer = await getStripe().customers.retrieve(customerId);
      if (!("deleted" in customer) || !customer.deleted) {
        const email = (customer as Stripe.Customer).email;
        if (email) {
          const user = await db.user.findUnique({ where: { email } });
          if (user) {
            userId = user.id;
            // Backfill stripeCustomerId
            await db.user.update({
              where: { id: user.id },
              data: { stripeCustomerId: customerId },
            });
          }
        }
      }
    } catch (e) {
      log.warn("Could not resolve customer to user", { customerId, error: String(e) });
    }
  }

  if (!userId) {
    log.warn("Subscription webhook: no matching user", {
      subscriptionId: subscription.id,
      customerId,
    });
    return null;
  }

  // Compute period bounds — in Stripe v21+ these moved to items
  const item = subscription.items.data[0];
  const startSec =
    (item?.current_period_start as number | undefined) ??
    (subscription as unknown as { current_period_start?: number }).current_period_start ??
    Math.floor(Date.now() / 1000);
  const endSec =
    (item?.current_period_end as number | undefined) ??
    (subscription as unknown as { current_period_end?: number }).current_period_end ??
    startSec + 30 * 24 * 3600;

  const data = {
    userId,
    stripeCustomerId: customerId,
    stripeSubscriptionId: subscription.id,
    stripePriceId: priceId || "",
    planId,
    status: subscription.status,
    currentPeriodStart: new Date(startSec * 1000),
    currentPeriodEnd: new Date(endSec * 1000),
    cancelAtPeriodEnd: subscription.cancel_at_period_end,
    canceledAt: subscription.canceled_at ? new Date(subscription.canceled_at * 1000) : null,
  };

  await db.subscription.upsert({
    where: { stripeSubscriptionId: subscription.id },
    create: data,
    update: data,
  });

  // Sync api-key plan on active subscriptions
  if (subscription.status === "active" || subscription.status === "trialing") {
    await updateApiKeyPlan(userId, planIdToApiPlan(planId));
  } else if (subscription.status === "canceled" || subscription.status === "unpaid") {
    await updateApiKeyPlan(userId, "free");
  }

  log.info("Subscription persisted", {
    userId,
    subscriptionId: subscription.id,
    planId,
    status: subscription.status,
  });

  return { userId, planId };
}

/** Get the active subscription for a user (if any). */
export async function getActiveSubscription(userId: string) {
  return db.subscription.findFirst({
    where: {
      userId,
      status: { in: ["active", "trialing", "past_due"] },
    },
    orderBy: { currentPeriodEnd: "desc" },
  });
}

/** Get the effective plan for a user: 'free' if no active sub. */
export async function getUserPlan(userId: string): Promise<PlanId> {
  const sub = await getActiveSubscription(userId);
  if (!sub) return "free";
  return (sub.planId as PlanId) || "free";
}
