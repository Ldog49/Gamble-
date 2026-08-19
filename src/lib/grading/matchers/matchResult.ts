import { normalizeTeamName, teamCandidateStrings } from "@/lib/footballData/teamNameMatch";
import type { FinalScore, MatcherOutcome } from "../types";

/**
 * Determines which side a match-result selection refers to, from the
 * selection text alone (no score needed). Exported for reuse by the
 * season standings aggregation (home/away/draw pick counts), not just
 * grading.
 */
export function classifySide(
  selection: string,
  homeTeam: string,
  awayTeam: string
): "home" | "away" | "draw" | null {
  const normalizedSelection = normalizeTeamName(selection);
  if (/\bdraw\b|\btie\b/.test(normalizedSelection)) return "draw";

  const homeCandidates = teamCandidateStrings(homeTeam);
  const awayCandidates = teamCandidateStrings(awayTeam);

  const mentionsHome = homeCandidates.some((c) => normalizedSelection.includes(c));
  const mentionsAway = awayCandidates.some((c) => normalizedSelection.includes(c));

  if (mentionsHome && !mentionsAway) return "home";
  if (mentionsAway && !mentionsHome) return "away";
  return null;
}

export function gradeMatchResult(selection: string, score: FinalScore): MatcherOutcome {
  const scoreline = `${score.homeTeam} ${score.home}-${score.away} ${score.awayTeam}`;
  const side = classifySide(selection, score.homeTeam, score.awayTeam);

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
