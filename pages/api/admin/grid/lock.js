import prisma from "../../../../lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "../../auth/[...nextauth]";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const session = await getServerSession(req, res, authOptions);
  if (!session) {
    return res.status(401).json({ error: "Not authenticated" });
  }

  const gridCode = req.query.gridCode;
  if (!gridCode) {
    return res.status(400).json({ error: "Grid code is required" });
  }

  const { randomize } = req.body;

  try {
    const grid = await prisma.grid.findUnique({
      where: { code: gridCode },
      include: { squares: true },
    });

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: { id: true },
    });

    if (!grid || grid.ownerId !== user.id) {
      return res.status(403).json({ error: "Not authorized" });
    }

    // Generate random arrays
    const xArr = shuffleArray([...Array(10)].map((_, i) => i));
    const yArr = shuffleArray([...Array(10)].map((_, i) => i));

    if (randomize) {
      // Update squares with scores
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
    }

    // Lock grid and save score arrays
    const updated = await prisma.grid.update({
      where: { code: gridCode },
      data: {
        isLocked: true,
        ...(randomize && {
          xScoreArr: JSON.stringify(xArr),
          yScoreArr: JSON.stringify(yArr),
        }),
      },
    });

    return res.json(updated);
  } catch (error) {
    console.error("Error locking grid:", error);
    return res.status(500).json({ error: "Failed to lock grid" });
  }
}
function shuffleArray(array) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
}
