// Client-safe mirrors of the Prisma enums (kept in sync with prisma/schema.prisma
// manually — plain string unions so client components never need to import
// @prisma/client).

export const BET_TYPES = [
  "MATCH_RESULT",
  "OVER_UNDER",
  "BTTS",
  "DOUBLE_CHANCE",
  "ANYTIME_SCORER",
  "CORRECT_SCORE",
  "OTHER",
] as const;
export type BetType = (typeof BET_TYPES)[number];

export const BET_TYPE_LABELS: Record<BetType, string> = {
  MATCH_RESULT: "Match Result",
  OVER_UNDER: "Over/Under Goals",
  BTTS: "Both Teams to Score",
  DOUBLE_CHANCE: "Double Chance",
  ANYTIME_SCORER: "Anytime Goalscorer",
  CORRECT_SCORE: "Correct Score",
  OTHER: "Other",
};

// Bet types the grading engine can auto-grade from a final score. Anything
// else always falls to NEEDS_REVIEW once the fixture finishes.
export const AUTO_GRADABLE_BET_TYPES: BetType[] = [
  "MATCH_RESULT",
  "OVER_UNDER",
  "BTTS",
  "DOUBLE_CHANCE",
];

export const BET_STATUSES = [
  "PENDING",
  "NEEDS_REVIEW",
  "WON",
  "LOST",
  "PUSH",
  "VOID",
] as const;
export type BetStatus = (typeof BET_STATUSES)[number];

export const BET_STATUS_LABELS: Record<BetStatus, string> = {
  PENDING: "Pending",
  NEEDS_REVIEW: "Needs Review",
  WON: "Won",
  LOST: "Lost",
  PUSH: "Push",
  VOID: "Void",
};

export interface ParsedSlip {
  betType: BetType;
  betTypeRaw: string | null;
  homeTeam: string;
  awayTeam: string;
  selection: string;
  odds: number;
  stake: number;
  potentialReturn: number;
  confidence: "high" | "medium" | "low";
  notes: string | null;
}

export interface BetDTO {
  id: string;
  userId: string;
  userName: string;
  rawExtraction: unknown;
  betType: BetType;
  betTypeRaw: string | null;
  homeTeam: string;
  awayTeam: string;
  selection: string;
  odds: number;
  stake: number;
  potentialReturn: number;
  fixtureId: string | null;
  gameweek: number | null;
  status: BetStatus;
  gradedAt: string | null;
  gradeNote: string | null;
  manualOverride: boolean;
  slipImagePath: string;
  profit: number | null;
  createdAt: string;
  updatedAt: string;
}

export interface UserProfitCell {
  stake: number;
  return: number;
  profit: number | null;
}

export interface SummaryResponse {
  users: string[];
  byGameweek: {
    gameweek: number;
    perUser: Record<string, UserProfitCell>;
  }[];
  cumulativeByGameweek: {
    gameweek: number;
    [userName: string]: number | null;
  }[];
}
