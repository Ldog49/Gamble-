import { prisma } from "@/lib/prisma";
import type { Fixture } from "@prisma/client";

function normalize(name: string): string {
  return name
    .toLowerCase()
    .replace(/\bfc\b/g, " ")
    .replace(/\bafc\b/g, " ")
    .replace(/[^a-z0-9\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

// Nicknames/abbreviations that aren't simple substrings of the full club
// name, so the substring/distance fallback below wouldn't catch them.
const NICKNAME_ALIASES: Record<string, string> = {
  spurs: "tottenham hotspur",
  wolves: "wolverhampton wanderers",
  mcfc: "manchester city",
  "man city": "manchester city",
  "man utd": "manchester united",
  "man united": "manchester united",
  "man u": "manchester united",
  "notts forest": "nottingham forest",
  "nottm forest": "nottingham forest",
};

function canonicalize(rawName: string): string {
  const normalized = normalize(rawName);
  return NICKNAME_ALIASES[normalized] ?? normalized;
}

/** Lowercase, punctuation-stripped form of a name/phrase — exported for the
 * grading matchers, which need to search selection text for team mentions. */
export function normalizeTeamName(name: string): string {
  return normalize(name);
}

/**
 * All the normalized strings ("candidates") that could plausibly refer to
 * this team in freeform text: its canonical name plus any known nicknames
 * that resolve to it. Used by the grading matchers to check whether a bet's
 * selection text mentions the home or away side.
 */
export function teamCandidateStrings(teamName: string): string[] {
  const canonical = canonicalize(teamName);
  const nicknames = Object.entries(NICKNAME_ALIASES)
    .filter(([, value]) => value === canonical)
    .map(([key]) => key);
  return Array.from(new Set([canonical, ...nicknames]));
}

function levenshtein(a: string, b: string): number {
  const dp: number[][] = Array.from({ length: a.length + 1 }, () =>
    new Array(b.length + 1).fill(0)
  );
  for (let i = 0; i <= a.length; i++) dp[i][0] = i;
  for (let j = 0; j <= b.length; j++) dp[0][j] = j;
  for (let i = 1; i <= a.length; i++) {
    for (let j = 1; j <= b.length; j++) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;
      dp[i][j] = Math.min(
        dp[i - 1][j] + 1,
        dp[i][j - 1] + 1,
        dp[i - 1][j - 1] + cost
      );
    }
  }
  return dp[a.length][b.length];
}

function namesLikelyMatch(a: string, b: string): boolean {
  const na = canonicalize(a);
  const nb = canonicalize(b);
  if (!na || !nb) return false;
  if (na === nb) return true;
  if (na.length >= 4 && nb.length >= 4 && (na.includes(nb) || nb.includes(na))) {
    return true;
  }
  const distance = levenshtein(na, nb);
  const threshold = Math.max(1, Math.floor(Math.min(na.length, nb.length) * 0.2));
  return distance <= threshold;
}

/**
 * Finds the single cached Fixture whose two teams best match the given team
 * names (order-insensitive, since vision extraction can swap home/away).
 * Returns null — never a guess — if there's no match or if multiple
 * candidate fixtures are equally plausible.
 */
export async function resolveFixture(
  teamA: string,
  teamB: string,
  around: Date = new Date()
): Promise<Fixture | null> {
  const candidates = await prisma.fixture.findMany();

  const matches = candidates.filter((fixture) => {
    const straight =
      namesLikelyMatch(teamA, fixture.homeTeam) &&
      namesLikelyMatch(teamB, fixture.awayTeam);
    const swapped =
      namesLikelyMatch(teamA, fixture.awayTeam) &&
      namesLikelyMatch(teamB, fixture.homeTeam);
    return straight || swapped;
  });

  if (matches.length === 0) return null;
  if (matches.length === 1) return matches[0];

  const sorted = [...matches].sort(
    (a, b) =>
      Math.abs(a.kickoff.getTime() - around.getTime()) -
      Math.abs(b.kickoff.getTime() - around.getTime())
  );
  const [closest, secondClosest] = sorted;
  const closestDiff = Math.abs(closest.kickoff.getTime() - around.getTime());
  const secondDiff = secondClosest
    ? Math.abs(secondClosest.kickoff.getTime() - around.getTime())
    : Infinity;

  // If two candidates are both plausibly "the" match (within a week of each
  // other in distance-from-now), don't guess — flag for manual review.
  const oneWeekMs = 7 * 24 * 60 * 60 * 1000;
  if (secondDiff - closestDiff < oneWeekMs) return null;

  return closest;
}
