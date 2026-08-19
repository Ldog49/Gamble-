import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/session";
import { getCurrentGameweek, getGameweekLockTime } from "@/lib/footballData/gameweek";
import { formatKickoff } from "@/lib/format";
import UploadFlow from "@/components/bets/UploadFlow";

export default async function UploadPage() {
  const user = await getCurrentUser();
  const gameweek = await getCurrentGameweek();

  const [existingBet, lockTime] = await Promise.all([
    user && gameweek != null
      ? prisma.bet.findFirst({ where: { userId: user.id, gameweek } })
      : null,
    gameweek != null ? getGameweekLockTime(gameweek) : null,
  ]);
  const locked = lockTime != null && new Date() >= lockTime;

  if (locked) {
    return (
      <div className="flex flex-col gap-4">
        <h1 className="text-lg font-semibold">Upload a bet slip</h1>
        <div className="rounded-xl border border-danger/30 bg-danger-subtle p-4">
          <p className="font-medium">
            Too late — the first game of Gameweek {gameweek} has already
            kicked off.
          </p>
          <p className="mt-1 text-sm text-muted-foreground">
            Betting closed at {formatKickoff(lockTime)}.
          </p>
        </div>
        <Link
          href="/bets/week"
          className="rounded-xl bg-brand px-4 py-3 text-center text-sm font-medium text-brand-foreground transition hover:bg-brand-strong"
        >
          View this week&apos;s bets
        </Link>
      </div>
    );
  }

  if (existingBet) {
    return (
      <div className="flex flex-col gap-4">
        <h1 className="text-lg font-semibold">Upload a bet slip</h1>
        <div className="rounded-xl border border-brand/30 bg-brand-subtle p-4">
          <p className="font-medium">
            You&apos;ve already got a bet in for Gameweek {gameweek}.
          </p>
          <p className="mt-1 text-sm text-muted-foreground">
            {existingBet.homeTeam} v {existingBet.awayTeam} — {existingBet.selection}
          </p>
          <p className="mt-1 text-sm text-muted-foreground">
            One bet per person per gameweek — ask an admin if this needs
            correcting.
          </p>
        </div>
        <Link
          href="/bets/week"
          className="rounded-xl bg-brand px-4 py-3 text-center text-sm font-medium text-brand-foreground transition hover:bg-brand-strong"
        >
          View this week&apos;s bets
        </Link>
      </div>
    );
  }

  return <UploadFlow userName={user?.name ?? ""} />;
}
