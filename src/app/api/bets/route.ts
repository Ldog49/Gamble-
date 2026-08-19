import { NextResponse } from "next/server";
import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { requireCurrentUser, SessionRequiredError } from "@/lib/session";
import { BetCreateSchema } from "@/lib/validation/betSchemas";
import { resolveFixture } from "@/lib/footballData/teamNameMatch";
import { getCurrentGameweek, getGameweekLockTime } from "@/lib/footballData/gameweek";
import { formatKickoff } from "@/lib/format";
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

  // Every bet is filed under the app's single "current" gameweek, not
  // whichever gameweek the matched fixture happens to belong to — this
  // keeps "this week" locked to one week even if someone uploads a slip
  // for an older or rescheduled match.
  const [fixture, gameweek] = await Promise.all([
    resolveFixture(data.homeTeam, data.awayTeam),
    getCurrentGameweek(),
  ]);

  if (gameweek != null) {
    const lockTime = await getGameweekLockTime(gameweek);
    if (lockTime && new Date() >= lockTime) {
      return NextResponse.json(
        {
          error: `Too late — the first game of Gameweek ${gameweek} kicked off at ${formatKickoff(lockTime)}. Betting is closed.`,
        },
        { status: 409 }
      );
    }

    const existing = await prisma.bet.findFirst({
      where: { userId: user.id, gameweek },
    });
    if (existing) {
      return NextResponse.json(
        { error: `You've already got a bet in for Gameweek ${gameweek} — one per person per week.` },
        { status: 409 }
      );
    }
  }

  let bet;
  try {
    bet = await prisma.bet.create({
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
        gameweek,
        status: fixture ? "PENDING" : "NEEDS_REVIEW",
        gradeNote: fixture
          ? null
          : "No matching fixture found for these teams this season — check the team names, or this match may not be in the Premier League this season",
      },
      include: { user: true },
    });
  } catch (err) {
    // Race-condition fallback if two uploads for the same gameweek land at
    // the same instant — the DB-level unique constraint is the real guard.
    if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === "P2002") {
      return NextResponse.json(
        { error: `You've already got a bet in for Gameweek ${gameweek} — one per person per week.` },
        { status: 409 }
      );
    }
    throw err;
  }

  return NextResponse.json(toBetDTO(bet), { status: 201 });
}
