import Anthropic from "@anthropic-ai/sdk";

const globalForAnthropic = globalThis as unknown as {
  anthropic: Anthropic | undefined;
};

export const anthropic =
  globalForAnthropic.anthropic ??
  new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

if (process.env.NODE_ENV !== "production") {
  globalForAnthropic.anthropic = anthropic;
}

// Cheap vision-capable model — this is bounded structured extraction from a
// single photo, not open-ended reasoning, so Haiku is plenty and keeps
// per-slip cost to fractions of a cent.
export const VISION_MODEL =
  process.env.ANTHROPIC_MODEL ?? "claude-haiku-4-5-20251001";
