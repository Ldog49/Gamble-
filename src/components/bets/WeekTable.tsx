"use client";

import { useState } from "react";
import { BET_TYPE_LABELS, type BetDTO } from "@/types";
import { formatMoney, profitClass } from "@/lib/format";
import ResultBadge from "./ResultBadge";

export default function WeekTable({ bets: initialBets }: { bets: BetDTO[] }) {
  const [bets, setBets] = useState(initialBets);

  function handleBetUpdated(updated: BetDTO) {
    setBets((prev) => prev.map((b) => (b.id === updated.id ? updated : b)));
  }

  if (bets.length === 0) {
    return (
      <p className="rounded-xl border border-dashed border-zinc-300 p-6 text-center text-sm text-zinc-500 dark:border-zinc-700 dark:text-zinc-400">
        No bets for this gameweek yet.
      </p>
    );
  }

  return (
    <>
      {/* Desktop / tablet table */}
      <div className="hidden overflow-x-auto rounded-xl border border-zinc-200 sm:block dark:border-zinc-800">
        <table className="w-full text-sm">
          <thead className="bg-zinc-50 text-left text-xs uppercase tracking-wide text-zinc-500 dark:bg-zinc-900 dark:text-zinc-400">
            <tr>
              <th className="px-3 py-2">User</th>
              <th className="px-3 py-2">Match</th>
              <th className="px-3 py-2">Selection</th>
              <th className="px-3 py-2 text-right">Odds</th>
              <th className="px-3 py-2 text-right">Stake</th>
              <th className="px-3 py-2 text-right">Profit</th>
              <th className="px-3 py-2">Result</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
            {bets.map((bet) => (
              <tr key={bet.id}>
                <td className="px-3 py-2 font-medium">{bet.userName}</td>
                <td className="px-3 py-2 text-zinc-600 dark:text-zinc-400">
                  {bet.homeTeam} v {bet.awayTeam}
                </td>
                <td className="px-3 py-2">
                  <div>{bet.selection}</div>
                  <div className="text-xs text-zinc-400">{BET_TYPE_LABELS[bet.betType]}</div>
                </td>
                <td className="px-3 py-2 text-right">{bet.odds.toFixed(2)}</td>
                <td className="px-3 py-2 text-right">£{bet.stake.toFixed(2)}</td>
                <td className={`px-3 py-2 text-right font-medium ${profitClass(bet.profit)}`}>
                  {formatMoney(bet.profit)}
                </td>
                <td className="px-3 py-2">
                  <ResultBadge bet={bet} onChanged={handleBetUpdated} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile cards */}
      <div className="flex flex-col gap-3 sm:hidden">
        {bets.map((bet) => (
          <div
            key={bet.id}
            className="rounded-xl border border-zinc-200 p-3 dark:border-zinc-800"
          >
            <div className="flex items-start justify-between gap-2">
              <div>
                <div className="font-medium">{bet.userName}</div>
                <div className="text-sm text-zinc-500 dark:text-zinc-400">
                  {bet.homeTeam} v {bet.awayTeam}
                </div>
              </div>
              <ResultBadge bet={bet} onChanged={handleBetUpdated} />
            </div>
            <div className="mt-2 flex items-center justify-between text-sm">
              <span>{bet.selection}</span>
              <span className={`font-medium ${profitClass(bet.profit)}`}>{formatMoney(bet.profit)}</span>
            </div>
            <div className="mt-1 text-xs text-zinc-400">
              Odds {bet.odds.toFixed(2)} · Stake £{bet.stake.toFixed(2)}
            </div>
          </div>
        ))}
      </div>
    </>
  );
}
