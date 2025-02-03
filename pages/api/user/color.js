import prisma from "../../../lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "../../../pages/api/auth/[...nextauth]";

export default async function handler(req, res) {
  if (req.method !== "PUT") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const session = await getServerSession(req, res, authOptions);
  if (!session) {
    return res.status(401).json({ error: "Not authenticated" });
  }

  try {
    const { color } = req.body;
    const user = await prisma.user.update({
      where: { email: session.user.email },
      data: { color },
      select: { color: true },
    });

    return res.json(user);
  } catch (error) {
    console.error("Color update error:", error);
    return res.status(500).json({ error: "Failed to update color" });
  }
}
