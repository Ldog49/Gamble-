import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireCurrentUser, SessionRequiredError } from "@/lib/session";
import { aggregateSummary } from "@/lib/stats/aggregate";
import { getLockedGameweeks } from "@/lib/footballData/gameweek";

export async function GET() {
  try {
    await requireCurrentUser();
  } catch (err) {
    if (err instanceof SessionRequiredError) {
      return NextResponse.json({ error: "Not logged in" }, { status: 401 });
    }
    throw err;
  }

  const [users, bets, lockedGameweeks] = await Promise.all([
    prisma.user.findMany({ orderBy: { createdAt: "asc" } }),
    prisma.bet.findMany({ include: { user: true } }),
    getLockedGameweeks(),
  ]);

  const summary = aggregateSummary(
    bets,
    users.map((u) => u.name),
    lockedGameweeks
  );
  return NextResponse.json(summary);
}
