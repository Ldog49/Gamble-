import { prisma } from "@/lib/prisma";
import { toBetDTO } from "@/lib/serialize";
import { getCurrentGameweek } from "@/lib/footballData/gameweek";
import WeekTable from "@/components/bets/WeekTable";
import SyncResultsButton from "@/components/bets/SyncResultsButton";

export default async function WeekPage() {
  const gameweek = await getCurrentGameweek();

  const bets = gameweek
    ? await prisma.bet.findMany({
        where: { gameweek },
        include: { user: true },
        orderBy: { createdAt: "asc" },
      })
    : [];

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between gap-2">
        <h1 className="text-lg font-semibold">
          {gameweek ? `Gameweek ${gameweek}` : "This Week's Bets"}
        </h1>
        <SyncResultsButton />
      </div>
      {gameweek == null ? (
        <p className="rounded-xl border border-dashed border-zinc-300 p-6 text-center text-sm text-zinc-500 dark:border-zinc-700 dark:text-zinc-400">
          No fixtures synced yet — tap &quot;Sync results&quot; to load the
          Premier League schedule, then upload a bet.
        </p>
      ) : (
        <WeekTable bets={bets.map(toBetDTO)} />
      )}
    </div>
  );
}
