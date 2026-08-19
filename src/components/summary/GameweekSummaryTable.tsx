"use client";

import { useState } from "react";
import type { SummaryResponse } from "@/types";
import { formatMoney, profitClass } from "@/lib/format";

export interface BetDetail {
  gameweek: number | null;
  userName: string;
  homeTeam: string;
  awayTeam: string;
  selection: string;
  odds: number;
  potentialReturn: number;
}

export default function GameweekSummaryTable({
  summary,
  betDetails,
}: {
  summary: SummaryResponse;
  betDetails: BetDetail[];
}) {
  const cumulativeByGw = new Map(
    summary.cumulativeByGameweek.map((row) => [row.gameweek, row])
  );
  const detailByGwUser = new Map(
    betDetails.map((d) => [`${d.gameweek}-${d.userName}`, d])
  );

  const gameweeks = summary.byGameweek.map((gw) => gw.gameweek);
  const [selected, setSelected] = useState<number>(gameweeks[gameweeks.length - 1]);
  const rows = summary.byGameweek.filter((gw) => gw.gameweek === selected);

  return (
    <div className="overflow-hidden rounded-xl border border-border">
      <div className="flex items-center justify-between gap-2 border-b border-border bg-surface-secondary px-3 py-2">
        <h2 className="text-sm font-semibold text-muted-foreground">Gameweek breakdown</h2>
        <label className="flex items-center gap-2 text-sm">
          <span className="text-muted-foreground">Viewing</span>
          <select
            value={selected}
            onChange={(e) => setSelected(Number(e.target.value))}
            className="rounded-lg border border-border bg-surface px-2 py-1 text-sm"
          >
            {[...gameweeks].reverse().map((gw) => (
              <option key={gw} value={gw}>
                GW {gw}
              </option>
            ))}
          </select>
        </label>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-surface-secondary text-left text-xs uppercase tracking-wide text-muted-foreground">
            <tr>
              <th className="px-3 py-2">User</th>
              <th className="px-3 py-2">Home</th>
              <th className="px-3 py-2">Away</th>
              <th className="px-3 py-2">Bet</th>
              <th className="px-3 py-2 text-right">Odds</th>
              <th className="px-3 py-2 text-right">Stake</th>
              <th className="px-3 py-2 text-right">Potential Return</th>
              <th className="px-3 py-2 text-right">Return</th>
              <th className="px-3 py-2 text-right">Profit</th>
              <th className="px-3 py-2 text-right">Cumulative</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {rows.flatMap((gw) =>
              summary.users.map((user) => {
                const cell = gw.perUser[user];
                const cumulative = cumulativeByGw.get(gw.gameweek)?.[user] ?? null;
                const detail = detailByGwUser.get(`${gw.gameweek}-${user}`);
                return (
                  <tr key={`${gw.gameweek}-${user}`} className="bg-surface">
                    <td className="px-3 py-2 font-medium">{user}</td>
                    <td className="px-3 py-2 text-muted-foreground">
                      {detail?.homeTeam ?? "—"}
                    </td>
                    <td className="px-3 py-2 text-muted-foreground">
                      {detail?.awayTeam ?? "—"}
                    </td>
                    <td className="px-3 py-2">{detail?.selection ?? "—"}</td>
                    <td className="px-3 py-2 text-right">
                      {detail ? detail.odds.toFixed(2) : "—"}
                    </td>
                    <td className="px-3 py-2 text-right">
                      {cell.stake ? `£${cell.stake.toFixed(2)}` : "—"}
                    </td>
                    <td className="px-3 py-2 text-right">
                      {detail ? `£${detail.potentialReturn.toFixed(2)}` : "—"}
                    </td>
                    <td className="px-3 py-2 text-right">
                      {cell.return ? `£${cell.return.toFixed(2)}` : "—"}
                    </td>
                    <td className={`px-3 py-2 text-right font-medium ${profitClass(cell.profit)}`}>
                      {formatMoney(cell.profit)}
                    </td>
                    <td className={`px-3 py-2 text-right ${profitClass(cumulative)}`}>
                      {formatMoney(cumulative)}
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
