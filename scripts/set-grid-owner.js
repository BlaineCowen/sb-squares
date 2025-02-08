const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

async function setGridOwner() {
  try {
    // First, find the user
    const user = await prisma.user.findFirst({
      where: {
        name: "Blaine Cowen",
      },
    });

    if (!user) {
      console.error("User 'Blaine Cowen' not found");
      return;
    }

    // Update all squares in the grid
    const result = await prisma.square.updateMany({
      where: {
        gridId: "cm6vre5740000s9qber7yv0pg",
      },
      data: {
        ownerId: user.id,
        status: "APPROVED",
      },
    });

    console.log(`Updated ${result.count} squares to owner: Blaine Cowen`);
  } catch (error) {
    console.error("Error updating squares:", error);
  } finally {
    await prisma.$disconnect();
  }
}

setGridOwner();
