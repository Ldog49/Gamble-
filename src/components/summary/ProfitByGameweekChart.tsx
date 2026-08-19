"use client";

import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import type { SummaryResponse } from "@/types";
import { formatMoney } from "@/lib/format";
import { colorForUser } from "./chartColors";

export default function ProfitByGameweekChart({ summary }: { summary: SummaryResponse }) {
  const data = summary.byGameweek.map((gw) => {
    const row: Record<string, number | null | string> = { gameweek: `GW ${gw.gameweek}` };
    for (const user of summary.users) {
      row[user] = gw.perUser[user].profit;
    }
    return row;
  });

  return (
    <div className="rounded-xl border border-border bg-surface p-3">
      <h2 className="mb-2 text-sm font-semibold text-muted-foreground">Profit per gameweek</h2>
      <div className="h-64 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data}>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
            <XAxis dataKey="gameweek" tick={{ fontSize: 12, fill: "var(--muted-foreground)" }} />
            <YAxis tick={{ fontSize: 12, fill: "var(--muted-foreground)" }} />
            <Tooltip
              formatter={(value) => (value == null ? "no bet" : formatMoney(Number(value)))}
              contentStyle={{
                background: "var(--surface)",
                border: "1px solid var(--border)",
                borderRadius: 8,
                fontSize: 12,
                color: "var(--foreground)",
              }}
            />
            <Legend wrapperStyle={{ fontSize: 12, color: "var(--muted-foreground)" }} />
            {summary.users.map((user, i) => (
              <Bar
                key={user}
                dataKey={user}
                fill={colorForUser(i, summary.users.length)}
                radius={[3, 3, 0, 0]}
              />
            ))}
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
