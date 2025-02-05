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

  const { gridCode } = req.query;
  if (!gridCode) {
    return res.status(400).json({ error: "Grid code is required" });
  }

  try {
    // Check if user is grid owner
    const grid = await prisma.grid.findUnique({
      where: { code: gridCode },
      select: {
        ownerId: true,
        id: true,
        squarePrice: true,
        isLocked: true,
      },
    });

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: { id: true },
    });

    if (!grid || grid.ownerId !== user.id) {
      return res.status(403).json({ error: "Not authorized" });
    }

    // Start a transaction to ensure all operations succeed or fail together
    await prisma.$transaction([
      // Delete all squares for this grid
      prisma.square.deleteMany({
        where: { gridId: grid.id },
      }),

      // Create new empty squares
      prisma.square.createMany({
        data: Array.from({ length: 100 }, (_, i) => ({
          gridId: grid.id,
          x: Math.floor(i / 10),
          y: i % 10,
          status: "AVAILABLE",
          price: grid.squarePrice,
        })),
      }),

      // Reset grid lock status and score arrays
      prisma.grid.update({
        where: { code: gridCode },
        data: {
          isLocked: false,
          xScoreArr: "?",
          yScoreArr: "?",
          isSortedByScores: false,
        },
      }),
    ]);

    return res.json({ success: true });
  } catch (error) {
    console.error("Reset squares error:", error);
    return res.status(500).json({ error: "Failed to reset squares" });
  }
}
