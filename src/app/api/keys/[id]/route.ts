// DELETE /api/keys/:id — revoke an API key owned by the session user

import { NextRequest } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { revokeApiKey } from "@/lib/api-keys";
import { log } from "@/lib/logger";

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return Response.json({ error: "unauthenticated" }, { status: 401 });
  }

  const { id } = await params;
  await revokeApiKey(id, session.user.id);
  log.info("api-key-revoked", { userId: session.user.id, id });

  return Response.json({ ok: true });
}
