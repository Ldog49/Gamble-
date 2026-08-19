import type { StandingsRow } from "@/lib/stats/standings";
import { formatMoney, profitClass } from "@/lib/format";

const RANK_MEDALS = ["🥇", "🥈", "🥉"];

function formatRoi(roi: number | null): string {
  if (roi == null) return "—";
  const sign = roi > 0 ? "+" : "";
  return `${sign}${roi.toFixed(0)}%`;
}

export default function StandingsTable({
  rows,
  throughGameweek,
}: {
  rows: StandingsRow[];
  throughGameweek: number | null;
}) {
  return (
    <div className="overflow-hidden rounded-2xl border-2 border-brand/30 bg-surface shadow-sm">
      <div className="flex items-baseline justify-between gap-2 border-b border-border bg-brand-subtle px-4 py-3">
        <h2 className="text-base font-bold tracking-tight">Season Standings</h2>
        {throughGameweek != null && (
          <span className="text-xs font-medium text-muted-foreground">
            through GW {throughGameweek}
          </span>
        )}
      </div>
      <div className="overflow-x-auto">
        <table className="w-full min-w-[640px] text-sm">
          <thead className="bg-surface-secondary text-left text-xs uppercase tracking-wide text-muted-foreground">
            <tr>
              <th className="px-3 py-2">#</th>
              <th className="px-3 py-2">Player</th>
              <th className="px-3 py-2 text-right">Profit</th>
              <th className="px-3 py-2 text-right">Wins</th>
              <th className="px-3 py-2 text-right">Avg odds</th>
              <th className="px-3 py-2 text-center" title="Home wins picked">
                H
              </th>
              <th className="px-3 py-2 text-center" title="Away wins picked">
                A
              </th>
              <th className="px-3 py-2 text-center" title="Draws picked">
                D
              </th>
              <th className="px-3 py-2 text-right">ROI</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {rows.map((row, i) => (
              <tr key={row.userName} className={i === 0 ? "bg-brand-subtle/40" : "bg-surface"}>
                <td className="px-3 py-2.5 font-semibold text-muted-foreground">
                  {RANK_MEDALS[i] ?? i + 1}
                </td>
                <td className="px-3 py-2.5 font-semibold">{row.userName}</td>
                <td className={`px-3 py-2.5 text-right font-bold ${profitClass(row.runningProfit)}`}>
                  {formatMoney(row.runningProfit)}
                </td>
                <td className="px-3 py-2.5 text-right">{row.winCount}</td>
                <td className="px-3 py-2.5 text-right">
                  {row.avgOdds != null ? row.avgOdds.toFixed(2) : "—"}
                </td>
                <td className="px-3 py-2.5 text-center text-muted-foreground">{row.home}</td>
                <td className="px-3 py-2.5 text-center text-muted-foreground">{row.away}</td>
                <td className="px-3 py-2.5 text-center text-muted-foreground">{row.draw}</td>
                <td className={`px-3 py-2.5 text-right font-semibold ${profitClass(row.roi)}`}>
                  {formatRoi(row.roi)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
