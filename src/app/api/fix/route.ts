import { NextRequest } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { generateFix } from "@/lib/autofix";
import { rateLimit, getClientIp, verifyCsrf, logRequest } from "@/lib/security";

export async function POST(request: NextRequest) {
  try {
    // CSRF check
    if (!verifyCsrf(request)) {
      return Response.json({ error: "Forbidden" }, { status: 403 });
    }

    // Auth check
    const session = await getServerSession(authOptions);
    if (!session) {
      return Response.json({ error: "Not authenticated" }, { status: 401 });
    }

    // Rate limit: 20 fixes per hour per user (expensive AI calls)
    const ip = getClientIp(request);
    const limit = rateLimit(ip, { maxRequests: 20, windowMs: 60 * 60 * 1000 });
    if (!limit.allowed) {
      return Response.json(
        { error: "Rate limit exceeded. Max 20 auto-fixes per hour." },
        { status: 429, headers: { "Retry-After": "3600" } }
      );
    }

    const { vulnerability } = await request.json();

    if (!vulnerability || !vulnerability.id || !vulnerability.title) {
      return Response.json({ error: "Missing or invalid vulnerability data" }, { status: 400 });
    }

    // Validate vulnerability fields to prevent prompt injection
    const safeVuln = {
      ...vulnerability,
      id: String(vulnerability.id).slice(0, 50),
      title: String(vulnerability.title).slice(0, 200),
      description: String(vulnerability.description || "").slice(0, 1000),
      matchedCode: String(vulnerability.matchedCode || "").slice(0, 2000),
      file: String(vulnerability.file || "").slice(0, 300),
      suggestedFix: String(vulnerability.suggestedFix || "").slice(0, 1000),
    };

    logRequest(request, `auto-fix for ${safeVuln.id} by ${session.user?.email}`);

    const result = await generateFix(safeVuln);
    return Response.json(result);
  } catch (error) {
    console.error("Fix error:", error instanceof Error ? error.message : "Unknown");
    return Response.json({ error: "Failed to generate fix" }, { status: 500 });
  }
}
