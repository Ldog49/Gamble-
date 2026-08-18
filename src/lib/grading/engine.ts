import type { Bet, Fixture } from "@prisma/client";
import { AUTO_GRADABLE_BET_TYPES, type BetStatus } from "@/types";
import { gradeMatchResult } from "./matchers/matchResult";
import { gradeOverUnder } from "./matchers/overUnder";
import { gradeBtts } from "./matchers/btts";
import { gradeDoubleChance } from "./matchers/doubleChance";
import type { FinalScore, MatcherOutcome } from "./types";

export interface GradeResult {
  status: BetStatus;
  note: string;
}

function toBetStatus(result: MatcherOutcome["result"]): BetStatus {
  switch (result) {
    case "won":
      return "WON";
    case "lost":
      return "LOST";
    case "push":
      return "PUSH";
    default:
      return "NEEDS_REVIEW";
  }
}

type GradableBet = Pick<Bet, "betType" | "selection" | "manualOverride">;

/**
 * Pure grading function: given a bet and its (possibly null/unfinished)
 * fixture, decides the outcome. Never called on manually-overridden bets —
 * callers are expected to filter those out before invoking this.
 */
export function gradeBet(bet: GradableBet, fixture: Fixture | null): GradeResult {
  if (bet.manualOverride) {
    throw new Error("gradeBet must not be called on a manually-overridden bet");
  }

  if (
    !fixture ||
    fixture.status !== "FINISHED" ||
    fixture.homeScore == null ||
    fixture.awayScore == null
  ) {
    return { status: "PENDING", note: "Awaiting final score" };
  }

  if (!AUTO_GRADABLE_BET_TYPES.includes(bet.betType)) {
    return {
      status: "NEEDS_REVIEW",
      note: "This bet type isn't auto-graded — set the result manually",
    };
  }

  const score: FinalScore = {
    home: fixture.homeScore,
    away: fixture.awayScore,
    homeTeam: fixture.homeTeam,
    awayTeam: fixture.awayTeam,
  };

  let outcome: MatcherOutcome;
  switch (bet.betType) {
    case "MATCH_RESULT":
      outcome = gradeMatchResult(bet.selection, score);
      break;
    case "OVER_UNDER":
      outcome = gradeOverUnder(bet.selection, score);
      break;
    case "BTTS":
      outcome = gradeBtts(bet.selection, score);
      break;
    case "DOUBLE_CHANCE":
      outcome = gradeDoubleChance(bet.selection, score);
      break;
    default:
      outcome = { result: "needs_review", note: "This bet type isn't auto-graded" };
  }

  return { status: toBetStatus(outcome.result), note: outcome.note };
}
