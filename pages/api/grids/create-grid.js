import prisma from "../../../lib/prisma";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../auth/[...nextauth]";
import { generateCode } from "../../../utils/codeGenerator";

export default async function handler(req, res) {
  const session = await getServerSession(req, res, authOptions);

  if (!session?.user?.email) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  if (req.method === "POST") {
    try {
      // Get user from database using email
      const user = await prisma.user.findUnique({
        where: { email: session.user.email },
        select: { id: true },
      });

      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }

      // Restore code generation
      let code;
      let isUnique = false;
      let attempts = 0;

      while (!isUnique && attempts < 5) {
        code = generateCode(6);
        const existingGrid = await prisma.grid.findUnique({ where: { code } });
        if (!existingGrid) isUnique = true;
        attempts++;
      }

      if (!isUnique) {
        return res.status(500).json({
          error: "Could not generate unique grid code after 5 attempts",
        });
      }

      const grid = await prisma.grid.create({
        data: {
          code,
          owner: { connect: { id: user.id } },
          squares: {
            create: Array.from({ length: 100 }).map((_, i) => ({
              x: i % 10,
              y: Math.floor(i / 10),
              price: 5,
              status: "AVAILABLE",
            })),
          },
        },
        include: { squares: true },
      });

      console.log("Created grid:", grid.code);
      console.log("Squares created:", grid.squares.length);
      //   get grid code and return with res
      const gridCode = grid.code;
      return res.status(200).json({ gridCode: gridCode });
    } catch (error) {
      console.error("Full error details:", {
        message: error.message,
        code: error.code,
        meta: error.meta,
        stack: error.stack,
      });
      return res.status(500).json({
        error: "Failed to create grid",
        details: error.message,
      });
    }
  }

  return res.status(405).json({ error: "Method not allowed" });
}
