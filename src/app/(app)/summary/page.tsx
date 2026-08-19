import { prisma } from "@/lib/prisma";
import { aggregateSummary } from "@/lib/stats/aggregate";
import { aggregateStandings } from "@/lib/stats/standings";
import StandingsTable from "@/components/summary/StandingsTable";
import GameweekSummaryTable from "@/components/summary/GameweekSummaryTable";
import ProfitByGameweekChart from "@/components/summary/ProfitByGameweekChart";
import CumulativeProfitChart from "@/components/summary/CumulativeProfitChart";

export default async function SummaryPage() {
  const [users, bets] = await Promise.all([
    prisma.user.findMany({ orderBy: { createdAt: "asc" } }),
    prisma.bet.findMany({ include: { user: true } }),
  ]);

  const userNames = users.map((u) => u.name);
  const summary = aggregateSummary(bets, userNames);

  if (summary.byGameweek.length === 0) {
    return (
      <div className="flex flex-col gap-4">
        <h1 className="text-lg font-semibold">Season Summary</h1>
        <p className="rounded-xl border border-dashed border-border p-6 text-center text-sm text-muted-foreground">
          No bets tied to a gameweek yet — upload a bet slip and sync results
          to see profit tables and charts here.
        </p>
      </div>
    );
  }

  const standings = aggregateStandings(bets, userNames);
  const throughGameweek = summary.byGameweek[summary.byGameweek.length - 1].gameweek;
  const betDetails = bets.map((bet) => ({
    gameweek: bet.gameweek,
    userName: bet.user.name,
    homeTeam: bet.homeTeam,
    awayTeam: bet.awayTeam,
    selection: bet.selection,
    odds: Number(bet.odds),
    potentialReturn: Number(bet.potentialReturn),
  }));

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-lg font-semibold">Season Summary</h1>
      <StandingsTable rows={standings} throughGameweek={throughGameweek} />
      <ProfitByGameweekChart summary={summary} />
      <CumulativeProfitChart summary={summary} />
      <GameweekSummaryTable summary={summary} betDetails={betDetails} />
      <a
        href="/api/export/bets"
        className="self-start rounded-lg border border-border px-3 py-1.5 text-sm text-muted-foreground transition hover:bg-surface-secondary hover:text-foreground"
      >
        Download backup (CSV + slip photos)
      </a>
    </div>
  );
}
