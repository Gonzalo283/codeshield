import { NextRequest } from "next/server";
import { generateFix } from "@/lib/autofix";

export async function POST(request: NextRequest) {
  try {
    const { vulnerability } = await request.json();

    if (!vulnerability) {
      return Response.json(
        { error: "Missing vulnerability data" },
        { status: 400 }
      );
    }

    const result = await generateFix(vulnerability);
    return Response.json(result);
  } catch (error) {
    console.error("Fix error:", error);
    return Response.json(
      { error: "Failed to generate fix" },
      { status: 500 }
    );
  }
}
