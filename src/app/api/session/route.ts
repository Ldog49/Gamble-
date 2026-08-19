import { NextResponse } from "next/server";
import crypto from "crypto";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { setSessionUser, clearSession } from "@/lib/session";
import { isAdminUser } from "@/lib/admin";

const BodySchema = z.object({
  userId: z.string().min(1),
  password: z.string().optional(),
});

// Timing-safe compare against ADMIN_PASSWORD — mirrors the session cookie
// signature check in lib/session.ts.
function passwordMatches(input: string): boolean {
  const expected = process.env.ADMIN_PASSWORD;
  if (!expected) return false;
  const a = Buffer.from(input);
  const b = Buffer.from(expected);
  if (a.length !== b.length) return false;
  return crypto.timingSafeEqual(a, b);
}

// Picking an existing name on the login page — no session required yet.
// The admin's name additionally requires ADMIN_PASSWORD so no one else can
// pick it off the list and get admin rights.
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

  if (isAdminUser(user.name)) {
    const { password } = parsed.data;
    if (!password || !passwordMatches(password)) {
      return NextResponse.json(
        {
          error: password ? "Incorrect password." : "Password required",
          passwordRequired: true,
        },
        { status: 401 }
      );
    }
  }

  await setSessionUser(user.id);
  return NextResponse.json({ id: user.id, name: user.name });
}

export async function DELETE() {
  await clearSession();
  return NextResponse.json({ ok: true });
}
