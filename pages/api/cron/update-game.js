import prisma from "../../../lib/prisma";

export default async function handler(req, res) {
  // Add basic auth or other security measure
  if (req.headers.authorization !== `Bearer ${process.env.CRON_SECRET}`) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  try {
    const response = await fetch(
      "https://site.api.espn.com/apis/site/v2/sports/football/nfl/scoreboard?&dates=2025#"
    );
    const data = await response.json();

    const game = data.events[data.events.length - 1].competitions[0];
    const homeTeam = game.competitors.find((team) => team.homeAway === "home");
    const awayTeam = game.competitors.find((team) => team.homeAway === "away");

    // Get quarter scores
    const homeLines = homeTeam.linescores || [];
    const awayLines = awayTeam.linescores || [];

    // Check if there's any existing game data
    const existingGameData = await prisma.gameData.findFirst();

    // If no existing data, we need to ensure we create the initial record
    if (!existingGameData) {
      await prisma.gameData.create({
        data: {
          gameId: "superbowl2024",
          homeTeam: homeTeam.team.name,
          awayTeam: awayTeam.team.name,
          homeLogo: homeTeam.team.logo,
          awayLogo: awayTeam.team.logo,
          homeScore: parseInt(homeTeam.score),
          awayScore: parseInt(awayTeam.score),
          homeQ1: homeLines[0]?.value || null,
          homeQ2: homeLines[1]?.value || null,
          homeQ3: homeLines[2]?.value || null,
          homeQ4: homeLines[3]?.value || null,
          awayQ1: awayLines[0]?.value || null,
          awayQ2: awayLines[1]?.value || null,
          awayQ3: awayLines[2]?.value || null,
          awayQ4: awayLines[3]?.value || null,
          quarter: game.status.period,
          clock: game.status.displayClock,
          status: game.status.type.state,
          gameDate: new Date(game.date),
        },
      });
      return res.status(200).json({ message: "Initial game data created" });
    }

    const gameData = await prisma.gameData.create({
      data: {
        gameId: "superbowl2024",
        homeTeam: homeTeam.team.name,
        awayTeam: awayTeam.team.name,
        homeLogo: homeTeam.team.logo,
        awayLogo: awayTeam.team.logo,
        homeScore: parseInt(homeTeam.score),
        awayScore: parseInt(awayTeam.score),
        homeQ1: homeLines[0]?.value || null,
        homeQ2: homeLines[1]?.value + homeLines[0]?.value || null,
        homeQ3:
          homeLines[2]?.value + homeLines[1]?.value + homeLines[0]?.value ||
          null,
        homeQ4:
          homeLines[3]?.value +
            homeLines[2]?.value +
            homeLines[1]?.value +
            homeLines[0]?.value || null,
        awayQ1: awayLines[0]?.value || null,
        awayQ2: awayLines[1]?.value + awayLines[0]?.value || null,
        awayQ3:
          awayLines[2]?.value + awayLines[1]?.value + awayLines[0]?.value ||
          null,
        awayQ4:
          awayLines[3]?.value +
            awayLines[2]?.value +
            awayLines[1]?.value +
            awayLines[0]?.value || null,
        quarter: game.status.period,
        clock: game.status.displayClock,
        status: game.status.type.state,
        gameDate: new Date(game.date),
      },
    });

    return res.json(gameData);
  } catch (error) {
    console.error("Update game error:", error);
    res.status(500).json({ error: "Failed to update game data" });
  }
}
