export default async function handler(req, res) {
  const { x, y, userId } = req.body;

  // Check if square is available
  const existing = await prisma.square.findFirst({
    where: { x, y, status: "APPROVED" },
  });

  if (existing) return res.status(400).json({ error: "Square already taken" });

  // Reserve square
  await prisma.square.upsert({
    where: { x_y: { x, y } },
    create: {
      x,
      y,
      ownerId: userId,
    },
  });

  return res.status(200).json({ success: true });
}
