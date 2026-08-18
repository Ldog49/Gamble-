import { anthropic, VISION_MODEL } from "./client";
import { SLIP_PARSE_SYSTEM_PROMPT, buildRetryPrompt } from "./prompts";
import { ParsedSlipSchema } from "@/lib/validation/betSchemas";
import type { ParsedSlip } from "@/types";

function extractJson(text: string): unknown {
  const trimmed = text.trim();
  const fencedMatch = trimmed.match(/```(?:json)?\s*([\s\S]*?)```/i);
  const candidate = fencedMatch ? fencedMatch[1] : trimmed;
  return JSON.parse(candidate);
}

async function callVision(
  imageBase64: string,
  extraMessages: { role: "assistant" | "user"; content: string }[] = []
): Promise<string> {
  const response = await anthropic.messages.create({
    model: VISION_MODEL,
    max_tokens: 1024,
    system: SLIP_PARSE_SYSTEM_PROMPT,
    messages: [
      {
        role: "user",
        content: [
          {
            type: "image",
            source: {
              type: "base64",
              media_type: "image/jpeg",
              data: imageBase64,
            },
          },
          { type: "text", text: "Extract the bet details from this bet365 slip." },
        ],
      },
      ...extraMessages,
    ],
  });

  const textBlock = response.content.find((block) => block.type === "text");
  if (!textBlock || textBlock.type !== "text") {
    throw new Error("No text content in vision response");
  }
  return textBlock.text;
}

/**
 * Sends a preprocessed (JPEG) slip photo to Claude vision and returns a
 * validated extraction. Retries once, feeding the parse error back to the
 * model, if the first response isn't valid JSON matching the schema.
 */
export async function parseBetSlip(imageBuffer: Buffer): Promise<ParsedSlip> {
  const imageBase64 = imageBuffer.toString("base64");

  let rawText = await callVision(imageBase64);
  let lastError: string | null = null;

  for (let attempt = 0; attempt < 2; attempt++) {
    try {
      const json = extractJson(rawText);
      return ParsedSlipSchema.parse(json);
    } catch (err) {
      lastError = err instanceof Error ? err.message : String(err);
      if (attempt === 1) break;
      rawText = await callVision(imageBase64, [
        { role: "assistant", content: rawText },
        { role: "user", content: buildRetryPrompt(lastError) },
      ]);
    }
  }

  throw new Error(
    `Could not parse a valid bet slip extraction after retry: ${lastError}`
  );
}
