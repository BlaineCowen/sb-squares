import prisma from "../../../../lib/prisma";
import { getServerSession } from "next-auth";
import authOptions from "../../auth/[...nextauth]";

export default async function handler(req, res) {
  const { code } = req.query;
  const session = await getServerSession(req, res, authOptions);

  try {
    if (!code || code.length !== 6) {
      return res.status(400).json({ error: "Invalid grid code" });
    }

    const user = await prisma.user.findUnique({
      where: { email: session?.user?.email },
      select: { id: true },
    });

    if (!user) {
      return res.json({ isAdmin: false });
    }

    const grid = await prisma.grid.findUnique({
      where: { code },
      select: { ownerId: true },
    });

    if (!grid) {
      return res.status(404).json({ error: "Grid not found" });
    }

    return res.json({
      isAdmin: user.id === grid.ownerId,
      debug:
        process.env.NODE_ENV === "development"
          ? {
              userId: user.id,
              gridOwnerId: grid.ownerId,
              match: user.id === grid.ownerId,
            }
          : undefined,
    });
  } catch (error) {
    console.error("Admin check error:", error);
    return res.status(500).json({
      error: "Failed to check admin status",
      message: error.message,
    });
  }
}
