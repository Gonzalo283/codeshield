import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { getStripe } from "@/lib/stripe";
import { db } from "@/lib/db";
import { log } from "@/lib/logger";

export async function POST() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return Response.json({ error: "Not authenticated" }, { status: 401 });
    }

    // Prefer DB-linked customer
    let customerId: string | null = null;
    if (session.user.id) {
      const user = await db.user.findUnique({
        where: { id: session.user.id },
        select: { stripeCustomerId: true },
      });
      customerId = user?.stripeCustomerId || null;
    }

    // Fallback to email lookup
    if (!customerId) {
      const customers = await getStripe().customers.list({
        email: session.user.email,
        limit: 1,
      });
      customerId = customers.data[0]?.id || null;

      // Persist it for next time
      if (customerId && session.user.id) {
        await db.user.update({
          where: { id: session.user.id },
          data: { stripeCustomerId: customerId },
        }).catch(() => {});
      }
    }

    if (!customerId) {
      return Response.json(
        { error: "No billing account found. Subscribe to a plan first." },
        { status: 404 }
      );
    }

    const portalSession = await getStripe().billingPortal.sessions.create({
      customer: customerId,
      return_url: `${process.env.NEXTAUTH_URL}/account`,
    });

    return Response.json({ url: portalSession.url });
  } catch (error) {
    log.error("Stripe portal error", error as Error);
    return Response.json(
      { error: "Failed to create portal session" },
      { status: 500 }
    );
  }
}
