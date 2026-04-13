import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { getActiveSubscription } from "@/lib/subscriptions";
import { getUserUsage } from "@/lib/usage";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return Response.json({ error: "unauthenticated" }, { status: 401 });
  }

  const [subscription, usage] = await Promise.all([
    getActiveSubscription(session.user.id),
    getUserUsage(session.user.id),
  ]);

  return Response.json({
    user: {
      id: session.user.id,
      email: session.user.email,
      name: session.user.name,
      image: session.user.image,
    },
    subscription: subscription
      ? {
          planId: subscription.planId,
          status: subscription.status,
          currentPeriodEnd: subscription.currentPeriodEnd,
          cancelAtPeriodEnd: subscription.cancelAtPeriodEnd,
        }
      : null,
    usage: {
      scansThisMonth: usage.scansThisMonth,
      limit: usage.limit,
      remaining: usage.remaining,
      reposScanned: usage.reposScanned,
      planId: usage.planId,
    },
  });
}
