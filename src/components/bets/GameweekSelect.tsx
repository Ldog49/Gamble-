"use client";

import { useRouter } from "next/navigation";

export default function GameweekSelect({
  available,
  current,
}: {
  available: number[];
  current: number | null;
}) {
  const router = useRouter();

  if (available.length === 0) {
    return <h1 className="text-lg font-semibold">This Week&apos;s Bets</h1>;
  }

  return (
    <div className="flex items-center gap-2">
      <label className="text-sm text-zinc-500 dark:text-zinc-400">Gameweek</label>
      <select
        value={current ?? ""}
        onChange={(e) => router.push(`/bets/week?gameweek=${e.target.value}`)}
        className="rounded-lg border border-zinc-300 bg-white px-2 py-1.5 text-sm dark:border-zinc-700 dark:bg-zinc-950"
      >
        {available.map((gw) => (
          <option key={gw} value={gw}>
            GW {gw}
          </option>
        ))}
      </select>
    </div>
  );
}
