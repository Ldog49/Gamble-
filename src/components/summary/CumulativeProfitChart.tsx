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
    <div className="rounded-xl border border-zinc-200 p-3 dark:border-zinc-800">
      <h2 className="mb-2 text-sm font-semibold text-zinc-600 dark:text-zinc-300">
        Cumulative season profit
      </h2>
      <div className="h-64 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" className="stroke-zinc-200 dark:stroke-zinc-800" />
            <XAxis dataKey="gameweek" tick={{ fontSize: 12 }} />
            <YAxis tick={{ fontSize: 12 }} />
            <Tooltip
              formatter={(value) => (value == null ? "no result yet" : formatMoney(Number(value)))}
            />
            <Legend wrapperStyle={{ fontSize: 12 }} />
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
