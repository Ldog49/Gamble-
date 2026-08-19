/**
 * Parses odds typed as either decimal ("1.85") or UK fractional ("6/4",
 * "5/2", "evens"/"evs") and returns the decimal value. Returns null if the
 * input isn't a recognizable odds format.
 */
export function parseOddsInput(raw: string): number | null {
  const trimmed = raw.trim().toLowerCase();
  if (!trimmed) return null;

  if (trimmed === "evens" || trimmed === "evs" || trimmed === "even") {
    return 2;
  }

  const fractionMatch = trimmed.match(/^(\d+(?:\.\d+)?)\s*\/\s*(\d+(?:\.\d+)?)$/);
  if (fractionMatch) {
    const numerator = Number(fractionMatch[1]);
    const denominator = Number(fractionMatch[2]);
    if (!denominator) return null;
    return 1 + numerator / denominator;
  }

  const decimal = Number(trimmed);
  return Number.isFinite(decimal) && decimal > 0 ? decimal : null;
}
