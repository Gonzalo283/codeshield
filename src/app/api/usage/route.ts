import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { getUsage, canScan, getUserUsage } from "@/lib/usage";

export async function GET() {
  const session = await getServerSession(authOptions);

  if (session?.user?.id) {
    // Authenticated — return DB-backed usage
    const usage = await getUserUsage(session.user.id);
    return Response.json({
      authenticated: true,
      scansUsed: usage.scansThisMonth,
      scansLimit: usage.limit,
      remaining: usage.remaining,
      canScan: usage.limit === -1 || usage.scansThisMonth < usage.limit,
      reposScanned: usage.reposScanned,
      planId: usage.planId,
      periodStart: usage.monthStart.toISOString(),
      periodEnd: usage.monthEnd.toISOString(),
    });
  }

  // Anonymous — fall back to cookie
  const usage = await getUsage();
  const check = canScan(usage);
  return Response.json({
    authenticated: false,
    scansUsed: usage.scans,
    scansLimit: 10,
    remaining: check.remaining,
    canScan: check.allowed,
    reposScanned: usage.repos.length,
    planId: "free",
    month: usage.month,
  });
}
