// returns grid data

import prisma from "../../../../lib/prisma";

export default async function handler(req, res) {
  const { code } = req.query;
  const grid = await prisma.grid.findUnique({ where: { code } });
  res.status(200).json(grid);
}
