export function formatMoney(n: number | null | undefined): string {
  if (n == null) return "—";
  if (n > 0) return `+£${n.toFixed(2)}`;
  if (n < 0) return `-£${Math.abs(n).toFixed(2)}`;
  return `£${n.toFixed(2)}`;
}

export function profitClass(n: number | null | undefined): string {
  if (n == null) return "text-muted-foreground/60";
  if (n > 0) return "text-success";
  if (n < 0) return "text-danger";
  return "text-muted-foreground";
}
