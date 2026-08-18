// Categorical palette, matched in lightness/chroma for visual consistency,
// anchored by the app's brand green so the first user's series always ties
// back to the rest of the UI.
const PALETTE = [
  "oklch(56% 0.16 150)", // brand green
  "oklch(60% 0.18 25)", // red
  "oklch(62% 0.15 250)", // blue
  "oklch(70% 0.15 80)", // amber
  "oklch(58% 0.18 320)", // magenta
  "oklch(60% 0.13 200)", // teal
  "oklch(55% 0.17 300)", // purple
  "oklch(65% 0.15 50)", // orange
];

/** Stable color per user by index, so a user's color never shifts between charts/renders. */
export function colorForUser(index: number): string {
  return PALETTE[index % PALETTE.length];
}
