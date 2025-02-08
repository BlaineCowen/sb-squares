import prisma from "../../../../lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "../../auth/[...nextauth]";

export default async function handler(req, res) {
  if (req.method !== "PUT") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const session = await getServerSession(req, res, authOptions);
  if (!session) {
    return res.status(401).json({ error: "Not authenticated" });
  }

  const { code } = req.query;
  const { name, squarePrice, payouts, randomizeQuarters } = req.body;

  try {
    const grid = await prisma.grid.findUnique({
      where: { code },
      select: { ownerId: true },
    });

    if (!grid) {
      return res.status(404).json({ error: "Grid not found" });
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: { id: true },
    });

    if (grid.ownerId !== user.id) {
      return res.status(403).json({ error: "Not authorized" });
    }

    const updatedGrid = await prisma.grid.update({
      where: { code },
      data: {
        name,
        squarePrice,
        payoutQ1: payouts.q1,
        payoutQ2: payouts.q2,
        payoutQ3: payouts.q3,
        payoutFinal: payouts.final,
        randomizeQuarters,
      },
    });

    return res.json(updatedGrid);
  } catch (error) {
    console.error("Settings update error:", error);
    return res.status(500).json({ error: "Failed to update settings" });
  }
}
