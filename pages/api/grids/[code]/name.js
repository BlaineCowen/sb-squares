import prisma from "../../../../lib/prisma";

export default async function handler(req, res) {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { code } = req.query;

  try {
    const grid = await prisma.grid.findUnique({
      where: { code },
      select: { name: true },
    });

    if (!grid) {
      return res.status(404).json({ error: "Grid not found" });
    }

    return res.json(grid.name);
  } catch (error) {
    console.error("Error fetching grid name:", error);
    return res.status(500).json({ error: "Failed to fetch grid name" });
  }
}
