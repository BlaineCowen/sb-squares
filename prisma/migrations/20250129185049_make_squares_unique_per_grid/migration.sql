/*
  Warnings:

  - A unique constraint covering the columns `[x,y,gridId]` on the table `Square` will be added. If there are existing duplicate values, this will fail.

*/
-- DropIndex
DROP INDEX "Square_x_y_key";

-- CreateIndex
CREATE UNIQUE INDEX "Square_x_y_gridId_key" ON "Square"("x", "y", "gridId");
