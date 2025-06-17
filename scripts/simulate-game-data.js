require("dotenv/config");

const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

async function simulateGameData() {
  try {
    // Get current game data
    const currentGame = await prisma.gameData.findFirst({
      where: {
        gameId: "superbowl2024",
      },
      orderBy: {
        updatedAt: "desc",
      },
    });

    // Initialize base values if no current game
    const baseData = {
      gameId: "superbowl2024",
      homeTeam: "Kansas City Chiefs",
      awayTeam: "Philadelphia Eagles",
      homeLogo: "https://a.espncdn.com/i/teamlogos/nfl/500/kc.png",
      awayLogo: "https://a.espncdn.com/i/teamlogos/nfl/500/phi.png",
      homeScore: 7,
      awayScore: 0,
      homeQ1: 0,
      awayQ1: 0,
      homeQ2: 0,
      awayQ2: 0,
      homeQ3: 0,
      awayQ3: 0,
      homeQ4: 0,
      awayQ4: 0,
      status: "in-progress",
      quarter: 1,
      clock: "1:00",
      gameDate: "2025-02-10T00:29:05.209Z",
    };

    // Use current game data or base data
    const prevData = currentGame || baseData;

    // Simulate time passing
    let [minutes, seconds] = prevData.clock.split(":").map(Number);
    minutes -= 3; // Decrease by 1 minute
    seconds = 30; // Reset seconds to 0

    if (minutes < 0) {
      minutes = 15; // Reset to 15 minutes for new quarter
      prevData.quarter += 1;
      if (prevData.quarter > 4) {
        prevData.status = "final";
      }
    }

    // Random score changes
    const homeScoreChange =
      Math.random() < 0.3 ? Math.floor(Math.random() * 7) : 0;
    const awayScoreChange =
      Math.random() < 0.3 ? Math.floor(Math.random() * 7) : 0;

    // Update quarter scores
    const quarterKey = `Q${prevData.quarter}`;
    const newHomeQuarterScore = prevData[`home${quarterKey}`] + homeScoreChange;
    const newAwayQuarterScore = prevData[`away${quarterKey}`] + awayScoreChange;

    // Create new game data
    const newGameData = {
      ...prevData,
      id: Date.now().toString(),
      updatedAt: new Date(),
      homeScore: prevData.homeScore + homeScoreChange,
      awayScore: prevData.awayScore + awayScoreChange,
      [`home${quarterKey}`]: newHomeQuarterScore,
      [`away${quarterKey}`]: newAwayQuarterScore,
      clock: `${minutes.toString().padStart(2, "0")}:${seconds
        .toString()
        .padStart(2, "0")}`,
    };

    // Save to database
    const result = await prisma.gameData.create({
      data: newGameData,
    });

    console.log("Updated game data:", result);
  } catch (error) {
    console.error("Error simulating game data:", error);
  } finally {
    await prisma.$disconnect();
  }
}

simulateGameData();
