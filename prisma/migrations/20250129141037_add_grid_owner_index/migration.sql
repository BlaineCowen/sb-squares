-- AlterTable
ALTER TABLE "Square" ALTER COLUMN "status" SET DEFAULT 'AVAILABLE';

-- CreateIndex
CREATE INDEX "Grid_ownerId_idx" ON "Grid"("ownerId");
