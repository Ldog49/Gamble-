import { NextResponse } from "next/server";
import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { requireCurrentUser, SessionRequiredError } from "@/lib/session";
import { BetCreateSchema } from "@/lib/validation/betSchemas";
import { resolveFixture } from "@/lib/footballData/teamNameMatch";
import { toBetDTO } from "@/lib/serialize";

export async function GET(request: Request) {
  try {
    await requireCurrentUser();
  } catch (err) {
    if (err instanceof SessionRequiredError) {
      return NextResponse.json({ error: "Not logged in" }, { status: 401 });
    }
    throw err;
  }

  const { searchParams } = new URL(request.url);
  const gameweekParam = searchParams.get("gameweek");

  const bets = await prisma.bet.findMany({
    where: gameweekParam ? { gameweek: Number(gameweekParam) } : undefined,
    include: { user: true },
    orderBy: [{ gameweek: "asc" }, { createdAt: "asc" }],
  });

  return NextResponse.json(bets.map(toBetDTO));
}

export async function POST(request: Request) {
  let user;
  try {
    user = await requireCurrentUser();
  } catch (err) {
    if (err instanceof SessionRequiredError) {
      return NextResponse.json({ error: "Not logged in" }, { status: 401 });
    }
    throw err;
  }

  const body = await request.json().catch(() => null);
  const parsed = BetCreateSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.message }, { status: 400 });
  }
  const data = parsed.data;

  const fixture = await resolveFixture(data.homeTeam, data.awayTeam);

  const bet = await prisma.bet.create({
    data: {
      userId: user.id,
      rawExtraction: (data.rawExtraction ?? undefined) as
        | Prisma.InputJsonValue
        | undefined,
      betType: data.betType,
      betTypeRaw: data.betTypeRaw ?? null,
      homeTeam: data.homeTeam,
      awayTeam: data.awayTeam,
      selection: data.selection,
      odds: data.odds,
      stake: data.stake,
      potentialReturn: data.potentialReturn,
      slipImagePath: data.slipImagePath,
      fixtureId: fixture?.id ?? null,
      gameweek: fixture?.gameweek ?? null,
      status: fixture ? "PENDING" : "NEEDS_REVIEW",
      gradeNote: fixture
        ? null
        : "No matching fixture found yet — try syncing results or check the team names",
    },
    include: { user: true },
  });

  return NextResponse.json(toBetDTO(bet), { status: 201 });
}
