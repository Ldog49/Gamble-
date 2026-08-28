import { prisma } from "@/lib/prisma";

/** The single "current" gameweek the whole app operates on: the soonest
 * upcoming fixture's gameweek, or the most recent one once the season (or
 * the cached data) has ended. Every uploaded bet is filed under this
 * gameweek regardless of which fixture it matches, and the week view never
 * shows any other gameweek. */
export async function getCurrentGameweek(): Promise<number | null> {
  const upcoming = await prisma.fixture.findFirst({
    where: { kickoff: { gte: new Date() } },
    orderBy: { kickoff: "asc" },
  });
  if (upcoming) return upcoming.gameweek;

  const latest = await prisma.fixture.findFirst({ orderBy: { kickoff: "desc" } });
  return latest?.gameweek ?? null;
}

/** Kickoff time of the first fixture in a gameweek — betting closes the
 * instant this passes, so this is the single source of truth for the lock. */
export async function getGameweekLockTime(gameweek: number): Promise<Date | null> {
  const first = await prisma.fixture.findFirst({
    where: { gameweek },
    orderBy: { kickoff: "asc" },
  });
  return first?.kickoff ?? null;
}

/** Every gameweek whose first fixture has already kicked off. Anyone with no
 * bet in one of these has missed their window for good — the standings
 * treat that as a forfeited stake. */
export async function getLockedGameweeks(): Promise<Set<number>> {
  const fixtures = await prisma.fixture.findMany({
    select: { gameweek: true, kickoff: true },
    orderBy: { kickoff: "asc" },
  });

  const firstKickoffByGameweek = new Map<number, Date>();
  for (const fixture of fixtures) {
    if (!firstKickoffByGameweek.has(fixture.gameweek)) {
      firstKickoffByGameweek.set(fixture.gameweek, fixture.kickoff);
    }
  }

  const now = new Date();
  const locked = new Set<number>();
  for (const [gameweek, kickoff] of firstKickoffByGameweek) {
    if (kickoff <= now) locked.add(gameweek);
  }
  return locked;
}
