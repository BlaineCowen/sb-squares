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

    // Clear scores from squares
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

    // Unlock grid and reset score arrays
    const updated = await prisma.grid.update({
      where: { code: gridCode },
      data: {
        isLocked: false,
        xScoreArr: "?",
        yScoreArr: "?",
      },
    });

    return res.json(updated);
  } catch (error) {
    console.error("Error unlocking grid:", error);
    return res.status(500).json({ error: "Failed to unlock grid" });
  }
}
