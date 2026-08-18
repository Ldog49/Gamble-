import type { SummaryResponse } from "@/types";
import { formatMoney, profitClass } from "@/lib/format";

export default function GameweekSummaryTable({ summary }: { summary: SummaryResponse }) {
  const cumulativeByGw = new Map(
    summary.cumulativeByGameweek.map((row) => [row.gameweek, row])
  );

  return (
    <div className="overflow-x-auto rounded-xl border border-zinc-200 dark:border-zinc-800">
      <table className="w-full text-sm">
        <thead className="bg-zinc-50 text-left text-xs uppercase tracking-wide text-zinc-500 dark:bg-zinc-900 dark:text-zinc-400">
          <tr>
            <th className="px-3 py-2">GW</th>
            <th className="px-3 py-2">User</th>
            <th className="px-3 py-2 text-right">Stake</th>
            <th className="px-3 py-2 text-right">Return</th>
            <th className="px-3 py-2 text-right">Profit</th>
            <th className="px-3 py-2 text-right">Cumulative</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
          {summary.byGameweek.flatMap((gw) =>
            summary.users.map((user) => {
              const cell = gw.perUser[user];
              const cumulative = cumulativeByGw.get(gw.gameweek)?.[user] ?? null;
              return (
                <tr key={`${gw.gameweek}-${user}`}>
                  <td className="px-3 py-2 text-zinc-500 dark:text-zinc-400">{gw.gameweek}</td>
                  <td className="px-3 py-2 font-medium">{user}</td>
                  <td className="px-3 py-2 text-right">
                    {cell.stake ? `£${cell.stake.toFixed(2)}` : "—"}
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
  );
}
