/*
  Warnings:

  - Made the column `homeScore` on table `GameData` required. This step will fail if there are existing NULL values in that column.
  - Made the column `awayScore` on table `GameData` required. This step will fail if there are existing NULL values in that column.
  - Made the column `quarter` on table `GameData` required. This step will fail if there are existing NULL values in that column.
  - Made the column `clock` on table `GameData` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "GameData" ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "gameId" TEXT NOT NULL DEFAULT 'superbowl2024',
ALTER COLUMN "homeScore" SET NOT NULL,
ALTER COLUMN "homeScore" SET DEFAULT 0,
ALTER COLUMN "awayScore" SET NOT NULL,
ALTER COLUMN "awayScore" SET DEFAULT 0,
ALTER COLUMN "quarter" SET NOT NULL,
ALTER COLUMN "quarter" SET DEFAULT 0,
ALTER COLUMN "clock" SET NOT NULL,
ALTER COLUMN "clock" SET DEFAULT '',
ALTER COLUMN "status" SET DEFAULT 'pre';

-- CreateIndex
CREATE INDEX "GameData_gameId_idx" ON "GameData"("gameId");
