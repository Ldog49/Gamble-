import { prisma } from "@/lib/prisma";

/** The gameweek to show by default: the soonest upcoming fixture's gameweek,
 * or the most recent one if the season (or the cached data) has ended. */
export async function getDefaultGameweek(): Promise<number | null> {
  const upcoming = await prisma.fixture.findFirst({
    where: { kickoff: { gte: new Date() } },
    orderBy: { kickoff: "asc" },
  });
  if (upcoming) return upcoming.gameweek;

  const latest = await prisma.fixture.findFirst({ orderBy: { kickoff: "desc" } });
  return latest?.gameweek ?? null;
}

export async function getAvailableGameweeks(): Promise<number[]> {
  const rows = await prisma.fixture.findMany({
    select: { gameweek: true },
    distinct: ["gameweek"],
    orderBy: { gameweek: "asc" },
  });
  return rows.map((r) => r.gameweek);
}
