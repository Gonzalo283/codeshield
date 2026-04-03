import { NextRequest } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { getStripe, PLANS, PlanId } from "@/lib/stripe";

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return Response.json({ error: "Not authenticated" }, { status: 401 });
    }

    const { planId } = (await request.json()) as { planId: PlanId };

    if (planId === "free" || planId === "enterprise") {
      return Response.json({ error: "This plan cannot be purchased online" }, { status: 400 });
    }

    if (planId !== "team" && planId !== "business") {
      return Response.json({ error: "Invalid plan" }, { status: 400 });
    }

    const plan = PLANS[planId];
    if (!plan.priceId) {
      return Response.json(
        { error: `Stripe price not configured. Set STRIPE_${planId.toUpperCase()}_PRICE_ID.` },
        { status: 500 }
      );
    }

    const checkoutSession = await getStripe().checkout.sessions.create({
      mode: "subscription",
      payment_method_types: ["card"],
      line_items: [{ price: plan.priceId, quantity: 1 }],
      customer_email: session.user.email,
      success_url: `${process.env.NEXTAUTH_URL}/account?checkout=success`,
      cancel_url: `${process.env.NEXTAUTH_URL}/pricing?checkout=cancelled`,
      metadata: {
        userId: session.user.id || "",
        planId,
      },
    });

    return Response.json({ url: checkoutSession.url });
  } catch (error) {
    console.error("Stripe checkout error:", error);
    return Response.json(
      { error: "Failed to create checkout session" },
      { status: 500 }
    );
  }
}
