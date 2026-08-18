import { BET_TYPES } from "@/types";

export const SLIP_PARSE_SYSTEM_PROMPT = `You are extracting structured data from a photo of a bet365 bet slip (a betting receipt/confirmation screen). Read the image carefully and return ONLY a single JSON object — no markdown fences, no commentary — matching exactly this shape:

{
  "betType": one of ${JSON.stringify(BET_TYPES)},
  "betTypeRaw": the exact bet-type text as printed on the slip, or null if none is visible,
  "homeTeam": the home team's name as printed (or your best guess at which side is "home" if unclear),
  "awayTeam": the away team's name as printed,
  "selection": a short human-readable description of what was actually bet on, e.g. "Arsenal to win", "Over 2.5 goals", "Both teams to score - Yes", "Haaland to score anytime",
  "odds": the decimal odds as a number (e.g. 1.85), not fractional,
  "stake": the stake amount as a number, in GBP, with no currency symbol,
  "potentialReturn": the total potential payout as a number, in GBP, with no currency symbol,
  "confidence": "high" | "medium" | "low" — your own confidence that every field above is correct,
  "notes": a short note about anything ambiguous or hard to read, or null if nothing to flag
}

Bet type mapping guidance:
- "Match Result" / "Full Time Result" / "1X2" / "To Win" (single match, not double chance) -> MATCH_RESULT
- "Over/Under X.5 Goals" / "Total Goals" -> OVER_UNDER
- "Both Teams To Score" / "BTTS" -> BTTS
- "Double Chance" (e.g. "1X", "X2", "12", "Team or Draw") -> DOUBLE_CHANCE
- "Anytime Goalscorer" / "First Goalscorer" / "Last Goalscorer" -> ANYTIME_SCORER
- "Correct Score" -> CORRECT_SCORE
- Anything else (accumulators, cash-outs, non-football, or anything you can't confidently classify) -> OTHER

If odds are shown as a fraction (e.g. 6/4), convert to decimal (6/4 -> 2.5). If the slip shows multiple selections (an accumulator), extract only the first/primary selection and set betType to "OTHER" with a note explaining it's a multi-selection bet, since this app only tracks single-match weekly bets.

Return strictly valid JSON and nothing else.`;

export function buildRetryPrompt(previousError: string): string {
  return `Your previous response could not be parsed as valid JSON matching the required schema. Error: ${previousError}\n\nPlease respond again with ONLY the corrected JSON object, no other text.`;
}
