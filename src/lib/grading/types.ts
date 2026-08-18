export type MatcherResult = "won" | "lost" | "push" | "needs_review";

export interface MatcherOutcome {
  result: MatcherResult;
  note: string;
}

export interface FinalScore {
  home: number;
  away: number;
  homeTeam: string;
  awayTeam: string;
}
