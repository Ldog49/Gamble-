import type { FinalScore, MatcherOutcome } from "../types";

export function gradeBtts(selection: string, score: FinalScore): MatcherOutcome {
  const s = selection.toLowerCase();
  const saysYes = /\byes\b/.test(s);
  const saysNo = /\bno\b/.test(s);

  if (!saysYes && !saysNo) {
    return {
      result: "needs_review",
      note: `Could not tell if "${selection}" means both-teams-to-score Yes or No`,
    };
  }

  const bothScored = score.home > 0 && score.away > 0;
  const scoreline = `${score.homeTeam} ${score.home}-${score.away} ${score.awayTeam}`;
  const won = (saysYes && bothScored) || (saysNo && !bothScored);

  return won
    ? { result: "won", note: `${scoreline} — "${selection}" won` }
    : { result: "lost", note: `${scoreline} — "${selection}" lost` };
}
