import { classifySide } from "@/lib/grading/matchers/matchResult";
import { computeProfit, MISSED_BET_PENALTY } from "./aggregate";
import type { BetWithUser } from "./aggregate";

export interface StandingsRow {
  userName: string;
  runningProfit: number;
  totalStaked: number;
  winCount: number;
  avgOdds: number | null;
  home: number;
  away: number;
  draw: number;
  roi: number | null; // percentage
}

/**
 * Season-long leaderboard: one row per user, sorted by running profit
 * (highest first). Home/away/draw counts only classify MATCH_RESULT bets —
 * other bet types (BTTS, over/under, etc.) don't map onto a side pick, so
 * they're counted in profit/odds/wins but not in H/A/D.
 */
export function aggregateStandings(
  bets: BetWithUser[],
  userNames: string[],
  lockedGameweeks: Set<number> = new Set()
): StandingsRow[] {
  const rows = userNames.map((name): StandingsRow => {
    const userBets = bets.filter((b) => b.user.name === name);
    const betGameweeks = new Set(userBets.map((b) => b.gameweek));

    let runningProfit = 0;
    let totalStaked = 0;
    let winCount = 0;
    let oddsSum = 0;
    let oddsCount = 0;
    let home = 0;
    let away = 0;
    let draw = 0;

    for (const bet of userBets) {
      totalStaked += Number(bet.stake);

      const profit = computeProfit(bet);
      if (profit != null) runningProfit += profit;

      if (bet.status === "WON") winCount++;

      const odds = Number(bet.odds);
      if (Number.isFinite(odds)) {
        oddsSum += odds;
        oddsCount++;
      }

      if (bet.betType === "MATCH_RESULT") {
        const side = classifySide(bet.selection, bet.homeTeam, bet.awayTeam);
        if (side === "home") home++;
        else if (side === "away") away++;
        else if (side === "draw") draw++;
      }
    }

    for (const gameweek of lockedGameweeks) {
      if (!betGameweeks.has(gameweek)) {
        totalStaked += MISSED_BET_PENALTY;
        runningProfit -= MISSED_BET_PENALTY;
      }
    }

    return {
      userName: name,
      runningProfit,
      totalStaked,
      winCount,
      avgOdds: oddsCount > 0 ? oddsSum / oddsCount : null,
      home,
      away,
      draw,
      roi: totalStaked > 0 ? (runningProfit / totalStaked) * 100 : null,
    };
  });

  return rows.sort((a, b) => b.runningProfit - a.runningProfit);
}
