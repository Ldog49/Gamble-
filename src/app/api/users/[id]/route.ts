import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireCurrentUser, SessionRequiredError } from "@/lib/session";

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireCurrentUser();
  } catch (err) {
    if (err instanceof SessionRequiredError) {
      return NextResponse.json({ error: "Not logged in" }, { status: 401 });
    }
    throw err;
  }

  const { id } = await params;

  // Removing a user also removes their bets — there's no "orphaned bet"
  // state in this app, and an admin deleting someone is expected to clear
  // their history too (e.g. a mistaken/duplicate sign-up).
  await prisma.$transaction([
    prisma.bet.deleteMany({ where: { userId: id } }),
    prisma.user.delete({ where: { id } }),
  ]);

  return NextResponse.json({ ok: true });
}
