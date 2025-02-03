/*
  Warnings:

  - You are about to drop the column `approvedAt` on the `Square` table. All the data in the column will be lost.
  - You are about to drop the column `gridId` on the `Square` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[gridCode,x,y]` on the table `Square` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `gridCode` to the `Square` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `Square` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "Square" DROP CONSTRAINT "Square_gridId_fkey";

-- DropIndex
DROP INDEX "Square_gridId_x_y_key";

-- AlterTable
ALTER TABLE "Square" DROP COLUMN "approvedAt",
DROP COLUMN "gridId",
ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "gridCode" TEXT NOT NULL,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL,
ALTER COLUMN "price" SET DATA TYPE DOUBLE PRECISION;

-- CreateIndex
CREATE UNIQUE INDEX "Square_gridCode_x_y_key" ON "Square"("gridCode", "x", "y");

-- AddForeignKey
ALTER TABLE "Square" ADD CONSTRAINT "Square_gridCode_fkey" FOREIGN KEY ("gridCode") REFERENCES "Grid"("code") ON DELETE RESTRICT ON UPDATE CASCADE;
