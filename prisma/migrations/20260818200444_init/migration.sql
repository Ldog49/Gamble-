-- CreateEnum
CREATE TYPE "BetType" AS ENUM ('MATCH_RESULT', 'OVER_UNDER', 'BTTS', 'DOUBLE_CHANCE', 'ANYTIME_SCORER', 'CORRECT_SCORE', 'OTHER');

-- CreateEnum
CREATE TYPE "BetStatus" AS ENUM ('PENDING', 'NEEDS_REVIEW', 'WON', 'LOST', 'PUSH', 'VOID');

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Bet" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "rawExtraction" JSONB,
    "betType" "BetType" NOT NULL,
    "betTypeRaw" TEXT,
    "homeTeam" TEXT NOT NULL,
    "awayTeam" TEXT NOT NULL,
    "selection" TEXT NOT NULL,
    "odds" DECIMAL(6,2) NOT NULL,
    "stake" DECIMAL(6,2) NOT NULL DEFAULT 5.00,
    "potentialReturn" DECIMAL(8,2) NOT NULL,
    "fixtureId" TEXT,
    "gameweek" INTEGER,
    "status" "BetStatus" NOT NULL DEFAULT 'PENDING',
    "gradedAt" TIMESTAMP(3),
    "gradeNote" TEXT,
    "manualOverride" BOOLEAN NOT NULL DEFAULT false,
    "slipImagePath" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Bet_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Fixture" (
    "id" TEXT NOT NULL,
    "externalId" INTEGER NOT NULL,
    "season" INTEGER NOT NULL,
    "gameweek" INTEGER NOT NULL,
    "homeTeam" TEXT NOT NULL,
    "awayTeam" TEXT NOT NULL,
    "homeTeamApiId" INTEGER NOT NULL,
    "awayTeamApiId" INTEGER NOT NULL,
    "kickoff" TIMESTAMP(3) NOT NULL,
    "status" TEXT NOT NULL,
    "homeScore" INTEGER,
    "awayScore" INTEGER,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Fixture_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_name_key" ON "User"("name");

-- CreateIndex
CREATE INDEX "Bet_userId_gameweek_idx" ON "Bet"("userId", "gameweek");

-- CreateIndex
CREATE INDEX "Bet_gameweek_idx" ON "Bet"("gameweek");

-- CreateIndex
CREATE INDEX "Bet_status_idx" ON "Bet"("status");

-- CreateIndex
CREATE UNIQUE INDEX "Fixture_externalId_key" ON "Fixture"("externalId");

-- CreateIndex
CREATE INDEX "Fixture_season_gameweek_idx" ON "Fixture"("season", "gameweek");

-- CreateIndex
CREATE INDEX "Fixture_homeTeam_awayTeam_idx" ON "Fixture"("homeTeam", "awayTeam");

-- AddForeignKey
ALTER TABLE "Bet" ADD CONSTRAINT "Bet_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Bet" ADD CONSTRAINT "Bet_fixtureId_fkey" FOREIGN KEY ("fixtureId") REFERENCES "Fixture"("id") ON DELETE SET NULL ON UPDATE CASCADE;
