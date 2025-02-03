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
      },
    });

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: { id: true },
    });

    if (!grid || grid.ownerId !== user.id) {
      return res.status(403).json({ error: "Not authorized" });
    }

    // Delete all squares for this grid
    await prisma.square.deleteMany({
      where: { gridId: grid.id },
    });

    // Create new empty squares
    const squares = [];
    for (let x = 0; x < 10; x++) {
      for (let y = 0; y < 10; y++) {
        squares.push({
          gridId: grid.id,
          x,
          y,
          status: "AVAILABLE",
          price: grid.squarePrice,
        });
      }
    }

    await prisma.square.createMany({
      data: squares,
    });

    return res.json({ success: true });
  } catch (error) {
    console.error("Reset squares error:", error);
    return res.status(500).json({ error: "Failed to reset squares" });
  }
}
