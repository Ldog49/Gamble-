// Categorical color per user, generated rather than hardcoded so it scales
// to however many people are actually in the league — a fixed 8-color
// palette would start repeating colors (two different people rendering
// identically) once a group passed 8 users. Hues are spread evenly around
// the full circle based on the actual user count, anchored at the app's
// brand green (150) so the first user's series always ties back to the
// rest of the UI.
const BASE_HUE = 150;

/** Stable color per user by index, spread across `total` users so any group
 * size stays maximally distinguishable (never repeats a color). */
export function colorForUser(index: number, total: number): string {
  const hueStep = 360 / Math.max(total, 1);
  const hue = (BASE_HUE + index * hueStep) % 360;
  return `oklch(58% 0.14 ${hue.toFixed(1)})`;
}
