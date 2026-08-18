import { prisma } from "@/lib/prisma";
import { aggregateSummary } from "@/lib/stats/aggregate";
import GameweekSummaryTable from "@/components/summary/GameweekSummaryTable";
import ProfitByGameweekChart from "@/components/summary/ProfitByGameweekChart";
import CumulativeProfitChart from "@/components/summary/CumulativeProfitChart";

export default async function SummaryPage() {
  const [users, bets] = await Promise.all([
    prisma.user.findMany({ orderBy: { createdAt: "asc" } }),
    prisma.bet.findMany({ include: { user: true } }),
  ]);

  const summary = aggregateSummary(
    bets,
    users.map((u) => u.name)
  );

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

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-lg font-semibold">Season Summary</h1>
      <ProfitByGameweekChart summary={summary} />
      <CumulativeProfitChart summary={summary} />
      <GameweekSummaryTable summary={summary} />
    </div>
  );
}
