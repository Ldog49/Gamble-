import type { Bet, User } from "@prisma/client";
import type { SummaryResponse, UserProfitCell } from "@/types";

export type BetWithUser = Bet & { user: Pick<User, "id" | "name"> };

function computeReturn(bet: Pick<Bet, "status" | "stake" | "potentialReturn">): number {
  const stake = Number(bet.stake);
  const potentialReturn = Number(bet.potentialReturn);
  switch (bet.status) {
    case "WON":
      return potentialReturn;
    case "PUSH":
    case "VOID":
      return stake;
    default:
      return 0; // LOST, or not yet settled
  }
}

export function computeProfit(
  bet: Pick<Bet, "status" | "stake" | "potentialReturn">
): number | null {
  if (bet.status === "PENDING" || bet.status === "NEEDS_REVIEW") return null;
  return computeReturn(bet) - Number(bet.stake);
}

/**
 * Builds the per-user/per-gameweek table and the cumulative-profit series
 * consumed by both the summary table and both charts, so they can never
 * disagree with each other.
 */
export function aggregateSummary(
  bets: BetWithUser[],
  userNames: string[]
): SummaryResponse {
  const gameweeks = Array.from(
    new Set(
      bets.filter((b) => b.gameweek != null).map((b) => b.gameweek as number)
    )
  ).sort((a, b) => a - b);

  const byGameweek = gameweeks.map((gameweek) => {
    const perUser: Record<string, UserProfitCell> = {};
    for (const name of userNames) {
      const bet = bets.find((b) => b.gameweek === gameweek && b.user.name === name);
      if (!bet) {
        perUser[name] = { stake: 0, return: 0, profit: null };
        continue;
      }
      perUser[name] = {
        stake: Number(bet.stake),
        return: computeReturn(bet),
        profit: computeProfit(bet),
      };
    }
    return { gameweek, perUser };
  });

  const runningTotals: Record<string, number> = Object.fromEntries(
    userNames.map((name) => [name, 0])
  );
  const hasSettled: Record<string, boolean> = Object.fromEntries(
    userNames.map((name) => [name, false])
  );

  const cumulativeByGameweek: SummaryResponse["cumulativeByGameweek"] = byGameweek.map(
    (gw) => {
      const row: SummaryResponse["cumulativeByGameweek"][number] = {
        gameweek: gw.gameweek,
      };
      for (const name of userNames) {
        const profit = gw.perUser[name].profit;
        if (profit != null) {
          runningTotals[name] += profit;
          hasSettled[name] = true;
        }
        row[name] = hasSettled[name] ? runningTotals[name] : null;
      }
      return row;
    }
  );

  return { users: userNames, byGameweek, cumulativeByGameweek };
}
