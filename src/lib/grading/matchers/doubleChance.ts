import { normalizeTeamName, teamCandidateStrings } from "@/lib/footballData/teamNameMatch";
import type { FinalScore, MatcherOutcome } from "../types";

export function gradeDoubleChance(selection: string, score: FinalScore): MatcherOutcome {
  const normalizedSelection = normalizeTeamName(selection);
  const homeCandidates = teamCandidateStrings(score.homeTeam);
  const awayCandidates = teamCandidateStrings(score.awayTeam);

  const mentionsHome = homeCandidates.some((c) => normalizedSelection.includes(c));
  const mentionsAway = awayCandidates.some((c) => normalizedSelection.includes(c));
  const mentionsDraw = /\bdraw\b/.test(normalizedSelection);

  const impliedSides = [mentionsHome, mentionsAway, mentionsDraw].filter(Boolean).length;
  if (impliedSides < 2) {
    return {
      result: "needs_review",
      note: `Could not parse a double-chance combination from "${selection}"`,
    };
  }

  const actual: "home" | "away" | "draw" =
    score.home === score.away ? "draw" : score.home > score.away ? "home" : "away";
  const scoreline = `${score.homeTeam} ${score.home}-${score.away} ${score.awayTeam}`;

  const covers =
    (actual === "home" && mentionsHome) ||
    (actual === "away" && mentionsAway) ||
    (actual === "draw" && mentionsDraw);

  return covers
    ? { result: "won", note: `${scoreline} — "${selection}" covered the result` }
    : { result: "lost", note: `${scoreline} — "${selection}" did not cover the result` };
}
