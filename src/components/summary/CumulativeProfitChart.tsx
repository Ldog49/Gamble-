"use client";

import {
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import type { SummaryResponse } from "@/types";
import { formatMoney } from "@/lib/format";
import { colorForUser } from "./chartColors";

export default function CumulativeProfitChart({ summary }: { summary: SummaryResponse }) {
  const data = summary.cumulativeByGameweek.map((row) => ({
    ...row,
    gameweek: `GW ${row.gameweek}`,
  }));

  return (
    <div className="rounded-xl border border-border bg-surface p-3">
      <h2 className="mb-2 text-sm font-semibold text-muted-foreground">
        Cumulative season profit
      </h2>
      <div className="h-64 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
            <XAxis dataKey="gameweek" tick={{ fontSize: 12, fill: "var(--muted-foreground)" }} />
            <YAxis tick={{ fontSize: 12, fill: "var(--muted-foreground)" }} />
            <Tooltip
              formatter={(value) => (value == null ? "no result yet" : formatMoney(Number(value)))}
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
              <Line
                key={user}
                type="monotone"
                dataKey={user}
                stroke={colorForUser(i)}
                strokeWidth={2}
                dot={{ r: 3 }}
                connectNulls
              />
            ))}
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
