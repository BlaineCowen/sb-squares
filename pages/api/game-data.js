import prisma from "../../lib/prisma";

export const config = {
  maxDuration: 30,
  memory: 300,
};

export default async function handler(req, res) {
  res.setHeader("Cache-Control", "s-maxage=60, stale-while-revalidate=300");
  console.log("Game data API called");
  if (req.method !== "GET") {
    console.log("Method not allowed:", req.method);
    res.status(405).end(JSON.stringify({ error: "Method not allowed" }));
    return;
  }

  try {
    console.log("Fetching game data from database...");
    const gameData = await prisma.gameData.findFirst({
      where: { gameId: "superbowl2024" },
      orderBy: {
        updatedAt: "desc",
      },
      select: {
        id: true,
        gameId: true,
        homeTeam: true,
        awayTeam: true,
        homeLogo: true,
        awayLogo: true,
        homeScore: true,
        awayScore: true,
        awayQ1: true,
        homeQ1: true,
        awayQ2: true,
        homeQ2: true,
        awayQ3: true,
        homeQ3: true,
        awayQ4: true,
        homeQ4: true,
        status: true,
        quarter: true,
        clock: true,
        gameDate: true,
      },
    });

    // Get previous game state (second most recent)
    const prevGameData = await prisma.gameData.findFirst({
      where: {
        gameId: "superbowl2024",
        NOT: {
          id: gameData?.id,
        },
      },
      orderBy: {
        updatedAt: "desc",
      },
    });

    // Check if quarter has changed
    if (gameData?.quarter > prevGameData?.quarter) {
      console.log("Quarter changed, checking for grids to randomize...");

      // Find grids that need randomization
      const gridsToRandomize = await prisma.grid.findMany({
        where: {
          randomizeQuarters: true,
          isLocked: true,
        },
        include: {
          squares: true,
        },
      });

      console.log(`Found ${gridsToRandomize.length} grids to randomize`);

      for (const grid of gridsToRandomize) {
        // Generate new random arrays
        const xArr = shuffleArray([...Array(10)].map((_, i) => i));
        const yArr = shuffleArray([...Array(10)].map((_, i) => i));

        // Update squares with new scores
        await Promise.all(
          grid.squares.map(async (square) => {
            await prisma.square.update({
              where: { id: square.id },
              data: {
                awayScore: xArr[square.x].toString(),
                homeScore: yArr[square.y].toString(),
              },
            });
          })
        );

        // Update grid score arrays
        await prisma.grid.update({
          where: { id: grid.id },
          data: {
            xScoreArr: JSON.stringify(xArr),
            yScoreArr: JSON.stringify(yArr),
          },
        });

        console.log(`Randomized scores for grid ${grid.code}`);
      }
    }

    console.log("Game data result:", gameData);
    const responseData = gameData || {
      id: "superbowl2024",
      homeTeam: "Kansas City Chiefs",
      awayTeam: "San Francisco 49ers",
      homeLogo: "https://a.espncdn.com/i/teamlogos/nfl/500/kc.png",
      awayLogo: "https://a.espncdn.com/i/teamlogos/nfl/500/sf.png",
      homeScore: 0,
      awayScore: 0,
      status: "pre",
      quarter: 0,
      clock: "",
      gameDate: new Date("2024-02-11T23:30:00.000Z"),
    };

    res.setHeader("Content-Type", "application/json");
    res.end(JSON.stringify(responseData));
    return;
  } catch (error) {
    console.error("Error in game-data API:", error);
    res.status(500).end(
      JSON.stringify({
        error: "Failed to fetch game data",
        message: error.message,
      })
    );
    return;
  }
}
