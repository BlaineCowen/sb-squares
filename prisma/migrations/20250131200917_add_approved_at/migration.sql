/*
  Warnings:

  - A unique constraint covering the columns `[gridId,x,y]` on the table `Square` will be added. If there are existing duplicate values, this will fail.
  - Made the column `name` on table `User` required. This step will fail if there are existing NULL values in that column.
  - Made the column `email` on table `User` required. This step will fail if there are existing NULL values in that column.

*/
-- DropIndex
DROP INDEX "Grid_ownerId_idx";

-- DropIndex
DROP INDEX "Square_x_y_gridId_key";

-- AlterTable
ALTER TABLE "Square" ADD COLUMN     "approvedAt" TIMESTAMP(3),
ALTER COLUMN "status" DROP DEFAULT,
ALTER COLUMN "price" DROP DEFAULT;

-- AlterTable
ALTER TABLE "User" ALTER COLUMN "name" SET NOT NULL,
ALTER COLUMN "email" SET NOT NULL;

-- CreateIndex
CREATE INDEX "position_index" ON "Square"("x", "y");

-- CreateIndex
CREATE UNIQUE INDEX "Square_gridId_x_y_key" ON "Square"("gridId", "x", "y");
