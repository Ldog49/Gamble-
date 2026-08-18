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
