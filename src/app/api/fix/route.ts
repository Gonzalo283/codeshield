import { NextRequest } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { generateFix } from "@/lib/autofix";

export async function POST(request: NextRequest) {
  try {
    // Defense-in-depth: verify auth even though proxy covers this route
    const session = await getServerSession(authOptions);
    if (!session) {
      return Response.json({ error: "Not authenticated" }, { status: 401 });
    }

    const { vulnerability } = await request.json();

    if (!vulnerability || !vulnerability.id || !vulnerability.title) {
      return Response.json(
        { error: "Missing or invalid vulnerability data" },
        { status: 400 }
      );
    }

    const result = await generateFix(vulnerability);
    return Response.json(result);
  } catch (error) {
    console.error("Fix error:", error instanceof Error ? error.message : "Unknown");
    return Response.json(
      { error: "Failed to generate fix" },
      { status: 500 }
    );
  }
}
