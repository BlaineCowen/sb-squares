const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

async function queryGameData() {
  try {
    const gameData = await prisma.gameData.findMany({
      orderBy: {
        updatedAt: "desc",
      },
    });
    console.log(JSON.stringify(gameData, null, 2));
  } catch (error) {
    console.error("Error querying game data:", error);
  } finally {
    await prisma.$disconnect();
  }
}

queryGameData();
