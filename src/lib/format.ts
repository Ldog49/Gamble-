export function formatMoney(n: number | null | undefined): string {
  if (n == null) return "—";
  if (n > 0) return `+£${n.toFixed(2)}`;
  if (n < 0) return `-£${Math.abs(n).toFixed(2)}`;
  return `£${n.toFixed(2)}`;
}

export function formatKickoff(kickoff: Date): string {
  return new Intl.DateTimeFormat("en-GB", {
    weekday: "short",
    day: "numeric",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
    timeZone: "Europe/London",
  }).format(kickoff);
}

export function profitClass(n: number | null | undefined): string {
  if (n == null) return "text-muted-foreground/60";
  if (n > 0) return "text-success";
  if (n < 0) return "text-danger";
  return "text-muted-foreground";
}
