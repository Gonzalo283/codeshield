import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { getStripe } from "@/lib/stripe";

export async function POST() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return Response.json({ error: "Not authenticated" }, { status: 401 });
    }

    // Find the Stripe customer by email
    const customers = await getStripe().customers.list({
      email: session.user.email,
      limit: 1,
    });

    if (customers.data.length === 0) {
      return Response.json(
        { error: "No billing account found. Subscribe to a plan first." },
        { status: 404 }
      );
    }

    const portalSession = await getStripe().billingPortal.sessions.create({
      customer: customers.data[0].id,
      return_url: `${process.env.NEXTAUTH_URL}/account`,
    });

    return Response.json({ url: portalSession.url });
  } catch (error) {
    console.error("Stripe portal error:", error);
    return Response.json(
      { error: "Failed to create portal session" },
      { status: 500 }
    );
  }
}
