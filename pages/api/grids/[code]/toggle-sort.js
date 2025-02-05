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

  const { code } = req.query;
  const { sortState } = req.body;

  if (!code) {
    return res.status(400).json({ error: "Grid code is required" });
  }

  try {
    // First check if grid exists and user is owner
    const grid = await prisma.grid.findUnique({
      where: { code },
      select: {
        ownerId: true,
      },
    });

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: { id: true },
    });

    if (!grid || grid.ownerId !== user.id) {
      return res.status(403).json({ error: "Not authorized" });
    }

    // Then update the sort state
    const updatedGrid = await prisma.grid.update({
      where: { code },
      data: {
        isSortedByScores: sortState,
      },
    });

    return res.json({
      success: true,
      isSortedByScores: updatedGrid.isSortedByScores,
    });
  } catch (error) {
    console.error("Error updating sort state:", error);
    return res.status(500).json({ error: "Failed to update sort state" });
  }
}
