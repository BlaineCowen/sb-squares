/*
  Warnings:

  - You are about to drop the column `awayQ1` on the `GameData` table. All the data in the column will be lost.
  - You are about to drop the column `awayQ2` on the `GameData` table. All the data in the column will be lost.
  - You are about to drop the column `awayQ3` on the `GameData` table. All the data in the column will be lost.
  - You are about to drop the column `awayQ4` on the `GameData` table. All the data in the column will be lost.
  - You are about to drop the column `homeQ1` on the `GameData` table. All the data in the column will be lost.
  - You are about to drop the column `homeQ2` on the `GameData` table. All the data in the column will be lost.
  - You are about to drop the column `homeQ3` on the `GameData` table. All the data in the column will be lost.
  - You are about to drop the column `homeQ4` on the `GameData` table. All the data in the column will be lost.
  - You are about to drop the column `awayScore` on the `Square` table. All the data in the column will be lost.
  - You are about to drop the column `createdAt` on the `Square` table. All the data in the column will be lost.
  - You are about to drop the column `gridCode` on the `Square` table. All the data in the column will be lost.
  - You are about to drop the column `homeScore` on the `Square` table. All the data in the column will be lost.
  - You are about to drop the column `updatedAt` on the `Square` table. All the data in the column will be lost.
  - You are about to alter the column `price` on the `Square` table. The data in that column could be lost. The data in that column will be cast from `DoublePrecision` to `Integer`.
  - A unique constraint covering the columns `[gridId,x,y]` on the table `Square` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `gridId` to the `Square` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "Square" DROP CONSTRAINT "Square_gridCode_fkey";

-- DropIndex
DROP INDEX "Square_gridCode_x_y_key";

-- AlterTable
ALTER TABLE "GameData" DROP COLUMN "awayQ1",
DROP COLUMN "awayQ2",
DROP COLUMN "awayQ3",
DROP COLUMN "awayQ4",
DROP COLUMN "homeQ1",
DROP COLUMN "homeQ2",
DROP COLUMN "homeQ3",
DROP COLUMN "homeQ4";

-- AlterTable
ALTER TABLE "Square" DROP COLUMN "awayScore",
DROP COLUMN "createdAt",
DROP COLUMN "gridCode",
DROP COLUMN "homeScore",
DROP COLUMN "updatedAt",
ADD COLUMN     "approvedAt" TIMESTAMP(3),
ADD COLUMN     "gridId" TEXT NOT NULL,
ALTER COLUMN "price" SET DATA TYPE INTEGER;

-- CreateIndex
CREATE UNIQUE INDEX "Square_gridId_x_y_key" ON "Square"("gridId", "x", "y");

-- AddForeignKey
ALTER TABLE "Square" ADD CONSTRAINT "Square_gridId_fkey" FOREIGN KEY ("gridId") REFERENCES "Grid"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
