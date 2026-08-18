const BASE_URL = "https://api.football-data.org/v4";
const PL_COMPETITION_CODE = "PL";

function getApiKey(): string {
  const key = process.env.FOOTBALL_DATA_API_KEY;
  if (!key) throw new Error("FOOTBALL_DATA_API_KEY is not set");
  return key;
}

export interface FootballDataMatch {
  id: number;
  matchday: number;
  utcDate: string;
  status: string;
  homeTeam: { id: number; name: string };
  awayTeam: { id: number; name: string };
  score: {
    fullTime: { home: number | null; away: number | null };
  };
}

export function getCurrentSeason(): number {
  return Number(process.env.FOOTBALL_DATA_SEASON ?? new Date().getFullYear());
}

export async function fetchPremierLeagueMatches(
  season: number
): Promise<FootballDataMatch[]> {
  const res = await fetch(
    `${BASE_URL}/competitions/${PL_COMPETITION_CODE}/matches?season=${season}`,
    {
      headers: { "X-Auth-Token": getApiKey() },
      cache: "no-store",
    }
  );

  if (res.status === 429) {
    throw new Error(
      "football-data.org rate limit hit — please wait a minute and try again"
    );
  }
  if (!res.ok) {
    const body = await res.text().catch(() => "");
    throw new Error(`football-data.org request failed (${res.status}): ${body}`);
  }

  const data = (await res.json()) as { matches: FootballDataMatch[] };
  return data.matches;
}
