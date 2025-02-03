import prisma from "../../../lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "../../../pages/api/auth/[...nextauth]";

export default async function handler(req, res) {
  const session = await getServerSession(req, res, authOptions);
  console.log("Session data:", session?.user);

  const user = await prisma.user.findUnique({
    where: { email: session?.user?.email },
    select: { id: true },
  });

  const { id } = req.query;

  if (req.method === "PUT") {
    const { action } = req.body;
    try {
      if (action === "reject") {
        const square = await prisma.square.update({
          where: { id },
          data: {
            status: "AVAILABLE",
            ownerId: null,
          },
          select: {
            id: true,
            status: true,
            owner: {
              select: {
                name: true,
                color: true,
              },
            },
          },
        });
        return res.json(square);
      }

      // Get the square and its grid
      const square = await prisma.square.findUnique({
        where: { id },
        include: {
          grid: {
            select: { ownerId: true },
          },
        },
      });

      if (!square) {
        return res.status(404).json({ error: "Square not found" });
      }

      // Verify user is grid owner
      if (square.grid.ownerId !== user?.id) {
        return res.status(403).json({ error: "Not authorized" });
      }

      const updatedSquare = await prisma.square.update({
        where: { id },
        data: {
          status: "APPROVED",
          approvedAt: new Date(),
        },
        select: {
          id: true,
          status: true,
          owner: {
            select: {
              name: true,
              color: true,
            },
          },
          approvedAt: true,
        },
      });

      return res.json(updatedSquare);
    } catch (error) {
      console.error("Approve error:", error);
      return res.status(500).json({ error: "Failed to approve square" });
    }
  }

  return res.status(405).json({ error: "Method not allowed" });
}
