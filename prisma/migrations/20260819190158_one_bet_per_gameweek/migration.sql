-- DropIndex
DROP INDEX "Bet_userId_gameweek_idx";

-- CreateIndex
CREATE UNIQUE INDEX "Bet_userId_gameweek_key" ON "Bet"("userId", "gameweek");
