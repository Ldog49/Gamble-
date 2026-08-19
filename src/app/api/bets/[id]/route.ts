import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireCurrentUser, SessionRequiredError } from "@/lib/session";
import { BetUpdateSchema } from "@/lib/validation/betSchemas";
import { toBetDTO } from "@/lib/serialize";
import { isAdminUser } from "@/lib/admin";

export async function PATCH(
  request: Request,
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
  const body = await request.json().catch(() => null);
  const parsed = BetUpdateSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.message }, { status: 400 });
  }
  const data = parsed.data;

  const existing = await prisma.bet.findUnique({ where: { id } });
  if (!existing) {
    return NextResponse.json({ error: "Bet not found" }, { status: 404 });
  }

  const settingStatus = data.status !== undefined;

  const bet = await prisma.bet.update({
    where: { id },
    data: {
      ...(data.betType !== undefined ? { betType: data.betType } : {}),
      ...(data.betTypeRaw !== undefined ? { betTypeRaw: data.betTypeRaw } : {}),
      ...(data.homeTeam !== undefined ? { homeTeam: data.homeTeam } : {}),
      ...(data.awayTeam !== undefined ? { awayTeam: data.awayTeam } : {}),
      ...(data.selection !== undefined ? { selection: data.selection } : {}),
      ...(data.odds !== undefined ? { odds: data.odds } : {}),
      ...(data.stake !== undefined ? { stake: data.stake } : {}),
      ...(data.potentialReturn !== undefined
        ? { potentialReturn: data.potentialReturn }
        : {}),
      // Setting status directly is always a manual override — the grading
      // engine never touches a bet again after this.
      ...(settingStatus
        ? {
            status: data.status,
            manualOverride: true,
            gradedAt: new Date(),
            gradeNote: "Manually set",
          }
        : {}),
    },
    include: { user: true },
  });

  return NextResponse.json(toBetDTO(bet));
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  let user;
  try {
    user = await requireCurrentUser();
  } catch (err) {
    if (err instanceof SessionRequiredError) {
      return NextResponse.json({ error: "Not logged in" }, { status: 401 });
    }
    throw err;
  }
  if (!isAdminUser(user.name)) {
    return NextResponse.json({ error: "Not allowed" }, { status: 403 });
  }

  const { id } = await params;
  await prisma.bet.delete({ where: { id } }).catch(() => null);
  return NextResponse.json({ ok: true });
}
