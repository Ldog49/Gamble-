import { normalizeTeamName, teamCandidateStrings } from "@/lib/footballData/teamNameMatch";
import type { FinalScore, MatcherOutcome } from "../types";

function sideFromSelection(
  selection: string,
  score: FinalScore
): "home" | "away" | "draw" | null {
  const normalizedSelection = normalizeTeamName(selection);
  if (/\bdraw\b|\btie\b/.test(normalizedSelection)) return "draw";

  const homeCandidates = teamCandidateStrings(score.homeTeam);
  const awayCandidates = teamCandidateStrings(score.awayTeam);

  const mentionsHome = homeCandidates.some((c) => normalizedSelection.includes(c));
  const mentionsAway = awayCandidates.some((c) => normalizedSelection.includes(c));

  if (mentionsHome && !mentionsAway) return "home";
  if (mentionsAway && !mentionsHome) return "away";
  return null;
}

export function gradeMatchResult(selection: string, score: FinalScore): MatcherOutcome {
  const scoreline = `${score.homeTeam} ${score.home}-${score.away} ${score.awayTeam}`;
  const side = sideFromSelection(selection, score);

  if (!side) {
    return {
      result: "needs_review",
      note: `Could not tell which side selection "${selection}" refers to (${scoreline})`,
    };
  }

  const actual: "home" | "away" | "draw" =
    score.home === score.away ? "draw" : score.home > score.away ? "home" : "away";

  return side === actual
    ? { result: "won", note: `${scoreline} — "${selection}" won` }
    : { result: "lost", note: `${scoreline} — "${selection}" lost` };
}
