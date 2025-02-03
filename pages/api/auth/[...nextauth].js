import NextAuth from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import { PrismaAdapter } from "@next-auth/prisma-adapter";
import prisma from "../../../lib/prisma";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";

export const authOptions = {
  adapter: PrismaAdapter(prisma),
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    }),
    CredentialsProvider({
      id: "credentials",
      name: "Email/Password",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        const user = await prisma.user.findUnique({
          where: { email: credentials.email },
        });

        if (!user || !user.password) return null;

        const isValid = await bcrypt.compare(
          credentials.password,
          user.password
        );
        if (!isValid) return null;

        return {
          id: user.id,
          name: user.name,
          email: user.email,
          color: user.color,
        };
      },
    }),
    CredentialsProvider({
      id: "test-account",
      name: "Test Account",
      credentials: {
        email: { label: "Email", type: "text" },
      },
      async authorize(credentials) {
        if (
          process.env.DISABLE_TEST_ACCOUNT === "true" &&
          process.env.NODE_ENV === "production"
        ) {
          return null;
        }

        if (credentials.email === "test@example.com") {
          const user = await prisma.user.upsert({
            where: { email: "test@example.com" },
            update: {},
            create: {
              email: "test@example.com",
              name: "Test User",
              color: "#FF0000",
            },
          });

          return {
            id: user.id,
            email: user.email,
            name: user.name,
            color: user.color,
          };
        }

        return null;
      },
    }),
  ],
  callbacks: {
    async session({ session, token }) {
      session.user = token.user;
      session.user.color = token.user.color;
      return session;
    },
    async jwt({ token, user }) {
      if (user) {
        token.user = {
          id: user.id,
          name: user.name,
          email: user.email,
          color: user.color || "#000000",
          dbVersion: process.env.DB_VERSION || "1",
        };
      } else if (token?.user) {
        const dbUser = await prisma.user.findUnique({
          where: { email: token.user.email },
          select: { id: true, color: true },
        });
        token.user.id = dbUser?.id || token.user.id;
        token.user.color = dbUser?.color || token.user.color || "#000000";
      }
      return token;
    },
  },
  session: {
    strategy: "jwt",
  },
  pages: {
    signIn: "/login",
  },
};

export default NextAuth(authOptions);
