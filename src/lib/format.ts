export function formatMoney(n: number | null | undefined): string {
  if (n == null) return "—";
  if (n > 0) return `+£${n.toFixed(2)}`;
  if (n < 0) return `-£${Math.abs(n).toFixed(2)}`;
  return `£${n.toFixed(2)}`;
}

export function profitClass(n: number | null | undefined): string {
  if (n == null) return "text-zinc-400";
  if (n > 0) return "text-emerald-600 dark:text-emerald-400";
  if (n < 0) return "text-rose-600 dark:text-rose-400";
  return "text-zinc-500 dark:text-zinc-400";
}
