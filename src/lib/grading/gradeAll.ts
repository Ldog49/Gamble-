import { prisma } from "@/lib/prisma";
import { resolveFixture } from "@/lib/footballData/teamNameMatch";
import { gradeBet } from "./engine";
import type { Bet, Fixture } from "@prisma/client";

type BetWithFixture = Bet & { fixture: Fixture | null };

async function regrade(bet: BetWithFixture) {
  let fixture = bet.fixture;
  let fixtureId = bet.fixtureId;

  if (!fixture) {
    const resolved = await resolveFixture(bet.homeTeam, bet.awayTeam, bet.createdAt);
    if (resolved) {
      fixture = resolved;
      fixtureId = resolved.id;
    }
  }

  const result = gradeBet(bet, fixture);

  return prisma.bet.update({
    where: { id: bet.id },
    data: {
      fixtureId,
      status: result.status,
      gradeNote: result.note,
      gradedAt: result.status === "PENDING" ? null : new Date(),
    },
    include: { user: true },
  });
}

/** Re-resolves the fixture (if not yet linked) and re-grades a single bet. */
export async function regradeBetById(betId: string) {
  const bet = await prisma.bet.findUnique({
    where: { id: betId },
    include: { fixture: true, user: true },
  });
  if (!bet) return null;
  if (bet.manualOverride) return bet;
  return regrade(bet);
}

/** Re-resolves fixtures and re-grades every non-overridden pending/needs-review bet. */
export async function gradeAllPendingBets(): Promise<{
  betsGraded: number;
  betsNeedingReview: number;
}> {
  const bets = await prisma.bet.findMany({
    where: { manualOverride: false, status: { in: ["PENDING", "NEEDS_REVIEW"] } },
    include: { fixture: true },
  });

  let betsGraded = 0;
  let betsNeedingReview = 0;

  for (const bet of bets) {
    const updated = await regrade(bet);
    if (["WON", "LOST", "PUSH", "VOID"].includes(updated.status)) {
      betsGraded++;
    } else if (updated.status === "NEEDS_REVIEW") {
      betsNeedingReview++;
    }
  }

  return { betsGraded, betsNeedingReview };
}
