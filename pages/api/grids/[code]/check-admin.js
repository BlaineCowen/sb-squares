import prisma from "../../../../lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "../../auth/[...nextauth]";

export default async function handler(req, res) {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const session = await getServerSession(req, res, authOptions);
  if (!session) {
    return res.status(401).json({ error: "Not authenticated" });
  }

  const { code } = req.query;

  try {
    // Get the user's ID
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: { id: true },
    });

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    // Check if user is the grid owner
    const grid = await prisma.grid.findUnique({
      where: { code },
      select: { ownerId: true },
    });

    if (!grid) {
      return res.status(404).json({ error: "Grid not found" });
    }

    // User is admin if they are the grid owner
    const isAdmin = grid.ownerId === user.id;

    return res.json({ isAdmin });
  } catch (error) {
    console.error("Check admin error:", error);
    return res.status(500).json({ error: "Failed to check admin status" });
  }
}
