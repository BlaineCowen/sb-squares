import prisma from "../../../lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]";

export default async function handler(req, res) {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const session = await getServerSession(req, res, authOptions);
  if (!session) {
    return res.status(401).json({ error: "Not authenticated" });
  }

  try {
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: { id: true },
    });

    const grids = await prisma.grid.findMany({
      where: {
        OR: [{ ownerId: user.id }, { squares: { some: { ownerId: user.id } } }],
      },
      select: {
        code: true,
        name: true,
        createdAt: true,
      },
      orderBy: { createdAt: "desc" },
    });

    // Always return an array, even if empty
    return res.json(grids || []);
  } catch (error) {
    console.error("Error fetching user grids:", error);
    return res.status(500).json({ error: "Failed to fetch grids" });
  }
}
