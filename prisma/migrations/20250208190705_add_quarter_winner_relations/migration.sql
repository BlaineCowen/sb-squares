-- CreateTable
CREATE TABLE "QuarterWinner" (
    "id" TEXT NOT NULL,
    "gridId" TEXT NOT NULL,
    "quarter" INTEGER NOT NULL,
    "winnerId" TEXT,
    "awayScore" TEXT NOT NULL,
    "homeScore" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "QuarterWinner_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "QuarterWinner_gridId_quarter_key" ON "QuarterWinner"("gridId", "quarter");

-- AddForeignKey
ALTER TABLE "QuarterWinner" ADD CONSTRAINT "QuarterWinner_gridId_fkey" FOREIGN KEY ("gridId") REFERENCES "Grid"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "QuarterWinner" ADD CONSTRAINT "QuarterWinner_winnerId_fkey" FOREIGN KEY ("winnerId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
