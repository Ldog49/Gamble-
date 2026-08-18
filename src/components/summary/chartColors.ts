const PALETTE = [
  "#3b82f6",
  "#f97316",
  "#10b981",
  "#a855f7",
  "#ef4444",
  "#06b6d4",
  "#eab308",
  "#ec4899",
];

/** Stable color per user by index, so a user's color never shifts between charts/renders. */
export function colorForUser(index: number): string {
  return PALETTE[index % PALETTE.length];
}
