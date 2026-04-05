import { getUsage, canScan } from "@/lib/usage";

export async function GET() {
  const usage = await getUsage();
  const check = canScan(usage);

  return Response.json({
    scansUsed: usage.scans,
    scansLimit: 10,
    remaining: check.remaining,
    canScan: check.allowed,
    reposScanned: usage.repos.length,
    month: usage.month,
  });
}
