import Link from "next/link";
import { getCurrentUser } from "@/lib/session";

export default async function Home() {
  const user = await getCurrentUser();
  const nextHref = user ? "/bets/week" : "/login";

  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-8 p-4 text-center">
      <div className="flex flex-col items-center gap-3">
        <span aria-hidden className="text-6xl">
          ⚽
        </span>
        <h1 className="text-3xl font-bold tracking-tight">Gamble Gamble Gamble</h1>
        <p className="max-w-xs text-sm text-muted-foreground">
          Track the group&apos;s £5 Premier League bets, week by week.
        </p>
      </div>

      <Link
        href={nextHref}
        className="rounded-xl bg-brand px-8 py-3 text-sm font-medium text-brand-foreground transition hover:bg-brand-strong"
      >
        {user ? `Let's go, ${user.name}` : "Let's go"}
      </Link>
    </div>
  );
}
