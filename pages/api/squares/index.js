import prisma from "../../../lib/prisma";
import { getServerSession } from "next-auth";
import authOptions from "../auth/[...nextauth]";

export default async function handler(req, res) {
  const session = await getServerSession(req, res, authOptions);

  if (!session?.user?.email) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  try {
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: { id: true },
    });

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    // Add validation for gridCode parameter
    const gridCode = req.query.gridCode;
    if (!gridCode || typeof gridCode !== "string") {
      return res.status(400).json({ error: "Invalid grid code" });
    }

    if (req.method === "GET") {
      const grid = await prisma.grid.findUnique({
        where: { code: gridCode },
        select: { id: true },
      });

      if (!grid) return res.status(404).json({ error: "Grid not found" });

      // Get squares for a grid with owner info and scores
      const squares = await prisma.square.findMany({
        where: { gridId: grid.id },
        include: {
          owner: {
            select: {
              name: true,
              color: true,
            },
          },
        },
        orderBy: [{ y: "asc" }, { x: "asc" }],
      });

      return res.status(200).json(squares);
    }

    if (req.method === "POST") {
      try {
        // Check if grid is locked
        const grid = await prisma.grid.findUnique({
          where: { code: gridCode },
          select: {
            id: true,
            isLocked: true,
            ownerId: true,
          },
        });

        // Only allow grid owner to modify squares when locked
        if (grid.isLocked) {
          if (grid.ownerId !== user.id) {
            return res.status(403).json({ error: "Grid is locked" });
          }
        }

        const { x, y, price } = req.body;

        // Validate all required fields
        if (
          typeof x !== "number" ||
          x < 0 ||
          x > 9 ||
          typeof y !== "number" ||
          y < 0 ||
          y > 9 ||
          typeof price !== "number" ||
          price <= 0
        ) {
          return res.status(400).json({
            error: "Invalid request",
            details: "Provide valid x(0-9), y(0-9) and positive price",
          });
        }

        // Find existing AVAILABLE square
        const existingSquare = await prisma.square.findFirst({
          where: {
            x,
            y,
            grid: { code: gridCode },
            status: "AVAILABLE",
          },
        });

        if (!existingSquare) {
          return res.status(400).json({
            error: "Square unavailable",
            details: `Square (${x},${y}) is already taken or does not exist`,
          });
        }

        // Update existing square
        const updatedSquare = await prisma.square.update({
          where: { id: existingSquare.id },
          data: {
            status: "PENDING",
            ownerId: user.id,
            price: Math.abs(price),
          },
          select: {
            id: true,
            x: true,
            y: true,
            price: true,
            status: true,
            owner: {
              select: {
                name: true,
                color: true,
              },
            },
          },
        });

        return res.status(200).json(updatedSquare);
      } catch (error) {
        console.error("Claim square error:", {
          error,
          body: req.body,
          user: session?.user?.id,
          gridCode,
        });
        return res.status(500).json({
          error: "Failed to claim square",
          details: error.meta?.cause || error.message,
        });
      }
    }

    return res.status(405).json({ error: "Method not allowed" });
  } catch (error) {
    console.error("API Error:", error);
    return res.status(500).json({
      error: "Internal server error",
      message: error.message,
      details: error,
    });
  }
}
