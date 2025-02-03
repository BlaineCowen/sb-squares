import prisma from "../../../lib/prisma";
import bcrypt from "bcryptjs";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { name, email, password } = req.body;

  try {
    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return res.status(400).json({ error: "Email already registered" });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    const data = {
      name,
      email,
      password: hashedPassword,
      color: `#${Math.floor(Math.random() * 16777215).toString(16)}`, // Random color
    };

    // Create user
    const user = await prisma.user.create({
      data,
    });

    res.status(201).json({ message: "User created successfully" });
  } catch (error) {
    console.error("Registration error:", error);
    res.status(500).json({ error: "Failed to create user" });
  }
}
