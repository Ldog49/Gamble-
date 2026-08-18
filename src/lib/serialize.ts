import type { Bet } from "@prisma/client";
import type { BetDTO } from "@/types";
import { computeProfit } from "@/lib/stats/aggregate";

export function toBetDTO(bet: Bet & { user: { name: string } }): BetDTO {
  return {
    id: bet.id,
    userId: bet.userId,
    userName: bet.user.name,
    rawExtraction: bet.rawExtraction,
    betType: bet.betType,
    betTypeRaw: bet.betTypeRaw,
    homeTeam: bet.homeTeam,
    awayTeam: bet.awayTeam,
    selection: bet.selection,
    odds: Number(bet.odds),
    stake: Number(bet.stake),
    potentialReturn: Number(bet.potentialReturn),
    fixtureId: bet.fixtureId,
    gameweek: bet.gameweek,
    status: bet.status,
    gradedAt: bet.gradedAt ? bet.gradedAt.toISOString() : null,
    gradeNote: bet.gradeNote,
    manualOverride: bet.manualOverride,
    slipImagePath: bet.slipImagePath,
    profit: computeProfit(bet),
    createdAt: bet.createdAt.toISOString(),
    updatedAt: bet.updatedAt.toISOString(),
  };
}
