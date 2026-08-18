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
    <div className="rounded-xl border border-zinc-200 p-3 dark:border-zinc-800">
      <h2 className="mb-2 text-sm font-semibold text-zinc-600 dark:text-zinc-300">
        Profit per gameweek
      </h2>
      <div className="h-64 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data}>
            <CartesianGrid strokeDasharray="3 3" className="stroke-zinc-200 dark:stroke-zinc-800" />
            <XAxis dataKey="gameweek" tick={{ fontSize: 12 }} />
            <YAxis tick={{ fontSize: 12 }} />
            <Tooltip
              formatter={(value) => (value == null ? "no bet" : formatMoney(Number(value)))}
            />
            <Legend wrapperStyle={{ fontSize: 12 }} />
            {summary.users.map((user, i) => (
              <Bar key={user} dataKey={user} fill={colorForUser(i)} radius={[3, 3, 0, 0]} />
            ))}
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
