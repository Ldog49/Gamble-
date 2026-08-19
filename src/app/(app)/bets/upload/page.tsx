import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/session";
import { getCurrentGameweek } from "@/lib/footballData/gameweek";
import UploadFlow from "@/components/bets/UploadFlow";

export default async function UploadPage() {
  const user = await getCurrentUser();
  const gameweek = await getCurrentGameweek();

  const existingBet =
    user && gameweek != null
      ? await prisma.bet.findFirst({ where: { userId: user.id, gameweek } })
      : null;

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
