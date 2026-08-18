import { z } from "zod";
import { BET_STATUSES, BET_TYPES } from "@/types";

export const ParsedSlipSchema = z.object({
  betType: z.enum(BET_TYPES),
  betTypeRaw: z.string().nullable(),
  homeTeam: z.string().min(1),
  awayTeam: z.string().min(1),
  selection: z.string().min(1),
  odds: z.number().positive(),
  stake: z.number().positive(),
  potentialReturn: z.number().nonnegative(),
  confidence: z.enum(["high", "medium", "low"]),
  notes: z.string().nullable(),
});

export const BetCreateSchema = z.object({
  slipImagePath: z.string().min(1),
  rawExtraction: z.unknown().optional(),
  betType: z.enum(BET_TYPES),
  betTypeRaw: z.string().nullable().optional(),
  homeTeam: z.string().min(1),
  awayTeam: z.string().min(1),
  selection: z.string().min(1),
  odds: z.number().positive(),
  stake: z.number().positive(),
  potentialReturn: z.number().nonnegative(),
});

export const BetUpdateSchema = z
  .object({
    betType: z.enum(BET_TYPES).optional(),
    betTypeRaw: z.string().nullable().optional(),
    homeTeam: z.string().min(1).optional(),
    awayTeam: z.string().min(1).optional(),
    selection: z.string().min(1).optional(),
    odds: z.number().positive().optional(),
    stake: z.number().positive().optional(),
    potentialReturn: z.number().nonnegative().optional(),
    status: z.enum(BET_STATUSES).optional(),
  })
  .refine((data) => Object.keys(data).length > 0, {
    message: "At least one field must be provided",
  });

export const CreateUserSchema = z.object({
  name: z.string().trim().min(1).max(40),
});
