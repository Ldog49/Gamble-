import type { FinalScore, MatcherOutcome } from "../types";

export function gradeOverUnder(selection: string, score: FinalScore): MatcherOutcome {
  const s = selection.toLowerCase();
  const lineMatch = s.match(/(\d+(?:\.\d+)?)/);
  const isOver = /\bover\b/.test(s);
  const isUnder = /\bunder\b/.test(s);

  if (!lineMatch || (!isOver && !isUnder)) {
    return {
      result: "needs_review",
      note: `Could not parse an over/under line and direction from "${selection}"`,
    };
  }

  const line = Number(lineMatch[1]);
  const totalGoals = score.home + score.away;
  const scoreline = `${score.homeTeam} ${score.home}-${score.away} ${score.awayTeam} (${totalGoals} total goals)`;

  if (totalGoals === line) {
    return { result: "push", note: `${scoreline} — exact push on the ${line} line` };
  }

  const overWon = totalGoals > line;
  const won = (isOver && overWon) || (isUnder && !overWon);

  return won
    ? { result: "won", note: `${scoreline} — "${selection}" won` }
    : { result: "lost", note: `${scoreline} — "${selection}" lost` };
}
