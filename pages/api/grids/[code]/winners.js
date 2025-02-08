import prisma from "../../../../lib/prisma";

export default async function handler(req, res) {
  const { code } = req.query;

  try {
    const grid = await prisma.grid.findUnique({
      where: { code },
      select: { id: true },
    });

    if (!grid) return res.status(404).json({ error: "Grid not found" });

    const winners = await prisma.quarterWinner.findMany({
      where: { gridId: grid.id },
      include: { winner: true },
      orderBy: { quarter: "asc" },
    });

    res.json(winners);
  } catch (error) {
    console.error("Error fetching winners:", error);
    res.status(500).json({ error: "Failed to fetch quarter winners" });
  }
}
