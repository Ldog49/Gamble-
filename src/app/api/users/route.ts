import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { setSessionUser } from "@/lib/session";
import { CreateUserSchema } from "@/lib/validation/betSchemas";

export async function GET() {
  const users = await prisma.user.findMany({ orderBy: { name: "asc" } });
  return NextResponse.json(users.map((u) => ({ id: u.id, name: u.name })));
}

// Creating a user IS the login action for a new person — no session required
// to call this, and it logs the new user in immediately.
export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const parsed = CreateUserSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.message }, { status: 400 });
  }

  const user = await prisma.user.upsert({
    where: { name: parsed.data.name },
    update: {},
    create: { name: parsed.data.name },
  });

  await setSessionUser(user.id);
  return NextResponse.json({ id: user.id, name: user.name }, { status: 201 });
}
