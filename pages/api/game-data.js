import prisma from "../../lib/prisma";

export const config = {
  maxDuration: 30,
  memory: 300,
};

export default async function handler(req, res) {
  res.setHeader("Cache-Control", "s-maxage=60, stale-while-revalidate=300");

  if (req.method !== "GET") {
    res.status(405).end(JSON.stringify({ error: "Method not allowed" }));
    return;
  }

  try {
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
      const allGrids = await prisma.grid.findMany({
        where: { isLocked: true },
        include: { squares: true },
      });

      for (const grid of allGrids) {
        const currentQuarter = gameData.quarter;
        const prevQuarter = currentQuarter - 1;

        // Check if winner already exists
        const existingWinner = await prisma.quarterWinner.findFirst({
          where: {
            gridId: grid.id,
            quarter: prevQuarter,
          },
        });

        if (!existingWinner) {
          // Calculate winning numbers
          let awayTotal, homeTotal;
          switch (prevQuarter) {
            case 1:
              awayTotal = gameData.awayQ1;
              homeTotal = gameData.homeQ1;
              break;
            case 2:
              awayTotal = gameData.awayQ1 + gameData.awayQ2;
              homeTotal = gameData.homeQ1 + gameData.homeQ2;
              break;
            case 3:
              awayTotal = gameData.awayQ1 + gameData.awayQ2 + gameData.awayQ3;
              homeTotal = gameData.homeQ1 + gameData.homeQ2 + gameData.homeQ3;
              break;
            case 4:
              awayTotal = gameData.awayScore;
              homeTotal = gameData.homeScore;
              break;
          }

          const awayLastDigit = String(awayTotal).slice(-1);
          const homeLastDigit = String(homeTotal).slice(-1);

          // Find winning square
          const winningSquare = grid.squares.find(
            (s) =>
              s.awayScore === awayLastDigit && s.homeScore === homeLastDigit
          );

          if (winningSquare) {
            await prisma.quarterWinner.create({
              data: {
                gridId: grid.id,
                quarter: prevQuarter,
                winnerId: winningSquare.ownerId,
                awayScore: awayLastDigit,
                homeScore: homeLastDigit,
              },
            });
          }

          const shuffleArray = (array) => {
            for (let i = array.length - 1; i > 0; i--) {
              const j = Math.floor(Math.random() * (i + 1));
              [array[i], array[j]] = [array[j], array[i]];
            }
            return array;
          };

          // Find grids that need randomization
          const gridsToRandomize = await prisma.grid.findMany({
            where: {
              randomizeQuarters: true,
              isLocked: true,
              [`randomQ${currentQuarter}`]: false,
            },
            include: {
              squares: true,
            },
          });

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
                [`randomQ${currentQuarter}`]: true,
                xScoreArr: JSON.stringify(xArr),
                yScoreArr: JSON.stringify(yArr),
              },
            });
          }
        }
      }
    }

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
