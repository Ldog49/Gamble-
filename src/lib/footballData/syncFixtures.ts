import { prisma } from "@/lib/prisma";
import { fetchPremierLeagueMatches, getCurrentSeason } from "./client";

export async function syncFixtures(
  season: number = getCurrentSeason()
): Promise<{ fixturesUpdated: number }> {
  const matches = await fetchPremierLeagueMatches(season);

  for (const match of matches) {
    const data = {
      gameweek: match.matchday,
      homeTeam: match.homeTeam.name,
      awayTeam: match.awayTeam.name,
      homeTeamApiId: match.homeTeam.id,
      awayTeamApiId: match.awayTeam.id,
      kickoff: new Date(match.utcDate),
      status: match.status,
      homeScore: match.score.fullTime.home,
      awayScore: match.score.fullTime.away,
    };

    await prisma.fixture.upsert({
      where: { externalId: match.id },
      update: data,
      create: { externalId: match.id, season, ...data },
    });
  }

  return { fixturesUpdated: matches.length };
}
