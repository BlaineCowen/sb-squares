-- CreateTable
CREATE TABLE "GameData" (
    "id" TEXT NOT NULL,
    "homeTeam" TEXT NOT NULL,
    "awayTeam" TEXT NOT NULL,
    "homeLogo" TEXT NOT NULL,
    "awayLogo" TEXT NOT NULL,
    "homeScore" INTEGER,
    "awayScore" INTEGER,
    "quarter" INTEGER,
    "clock" TEXT,
    "status" TEXT NOT NULL,
    "gameDate" TIMESTAMP(3) NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "GameData_pkey" PRIMARY KEY ("id")
);
