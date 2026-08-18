import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { setSessionUser, clearSession } from "@/lib/session";

const BodySchema = z.object({ userId: z.string().min(1) });

// Picking an existing name on the login page — no session required yet.
export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const parsed = BodySchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "userId is required" }, { status: 400 });
  }

  const user = await prisma.user.findUnique({ where: { id: parsed.data.userId } });
  if (!user) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  await setSessionUser(user.id);
  return NextResponse.json({ id: user.id, name: user.name });
}

export async function DELETE() {
  await clearSession();
  return NextResponse.json({ ok: true });
}
