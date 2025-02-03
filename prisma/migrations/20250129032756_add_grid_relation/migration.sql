/*
  Warnings:

  - Added the required column `gridId` to the `Square` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Square" ADD COLUMN     "gridId" TEXT NOT NULL,
ADD COLUMN     "price" INTEGER NOT NULL DEFAULT 5;

-- CreateTable
CREATE TABLE "Grid" (
    "id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "ownerId" TEXT NOT NULL,

    CONSTRAINT "Grid_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Grid_code_key" ON "Grid"("code");

-- AddForeignKey
ALTER TABLE "Square" ADD CONSTRAINT "Square_gridId_fkey" FOREIGN KEY ("gridId") REFERENCES "Grid"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Grid" ADD CONSTRAINT "Grid_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
