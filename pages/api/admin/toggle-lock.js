import prisma from "../../../lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const session = await getServerSession(req, res, authOptions);
  if (!session) {
    return res.status(401).json({ error: "Not authenticated" });
  }

  // Check both query and body for gridCode
  const gridCode = req.query.gridCode || req.body.gridCode;
  if (!gridCode) {
    return res.status(400).json({ error: "Grid code is required" });
  }

  try {
    // Check if user is grid owner
    const grid = await prisma.grid.findUnique({
      where: { code: gridCode },
      include: {
        squares: true,
      },
    });

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: { id: true },
    });

    if (!grid || grid.ownerId !== user.id) {
      return res.status(403).json({ error: "Not authorized" });
    }

    // Generate random arrays for x and y axes
    const xArr = shuffleArray([...Array(10)].map((_, i) => i));
    const yArr = shuffleArray([...Array(10)].map((_, i) => i));

    // If we're unlocking, reset scores to empty
    if (!grid.isLocked) {
      try {
        await Promise.all(
          grid.squares.map(async (square) => {
            await prisma.square.update({
              where: { id: square.id },
              data: {
                awayScore: "",
                homeScore: "",
              },
            });
          })
        );
      } catch (error) {
        console.error("Error updating squares:", error);
        return res.status(500).json({ error: "Failed to update squares" });
      }
    }
    if (grid.isLocked) {
      // Update all squares with their corresponding scores
      try {
        await Promise.all(
          grid.squares.map(async (square) => {
            // Only set scores if we're locking the grid
            const scores = !grid.isLocked
              ? {
                  awayScore: xArr[square.x].toString(),
                  homeScore: yArr[square.y].toString(),
                }
              : newScores;

            await prisma.square.update({
              where: { id: square.id },
              data: {
                ...scores,
              },
            });
          })
        );
      } catch (error) {
        console.error("Error updating squares:", error);
        return res.status(500).json({ error: "Failed to update squares" });
      }
    }

    const updated = await prisma.grid.update({
      where: { code: gridCode },
      data: {
        isLocked: !grid.isLocked,
        // Only set score arrays if we're locking
        xScoreArr: !grid.isLocked ? JSON.stringify(xArr) : "?",
        yScoreArr: !grid.isLocked ? JSON.stringify(yArr) : "?",
      },
    });

    return res.status(200).json({
      success: true,
      message: `Grid ${updated.isLocked ? "locked" : "unlocked"} successfully`,
    });
  } catch (error) {
    console.error("Error toggling grid lock:", error);
    return res.status(500).json({ error: "Failed to toggle grid lock" });
  }
}

function shuffleArray(array) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
}
