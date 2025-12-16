import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import prisma from "@/lib/prisma";
import bcrypt from "bcryptjs";

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "text" },
        password: { label: "Password", type: "password" },
        role: { label: "Role", type: "text" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password || !credentials?.role) {
          throw new Error("Missing credentials");
        }

        const { email, password, role } = credentials;

        // Admin login
        if (role === "admin") {
          if (
            email !== process.env.ADMIN_EMAIL ||
            password !== process.env.ADMIN_PASSWORD
          ) {
            throw new Error("Invalid email or password");
          }
          return { id: "admin", name: "Admin", email: "", role: "admin" };
        }

        // Student login
        if (role === "student") {
          const student = await prisma.student.findUnique({
            where: { email },
          });

          if (!student) {
            throw new Error("Invalid email or password");
          }

          const isValidPassword = await bcrypt.compare(password, student.password);
          if (!isValidPassword) {
            throw new Error("Invalid email or password");
          }

          return {
            id: student.id,
            rollNo: student.rollNo,
            email: student.email,
            role: "student",
            name: student.name,
          };
        }

        // Professor login
        if (role === "professor") {
          const professor = await prisma.professor.findUnique({
            where: { email },
          });

          if (!professor) {
            throw new Error("Invalid email or password");
          }

          // Now professors also use hashed passwords
          const isValidPassword = await bcrypt.compare(password, professor.password);
          if (!isValidPassword) {
            throw new Error("Invalid email or password");
          }

          return {
            id: professor.id,
            email: professor.email,
            role: "professor",
            name: professor.name,
          };
        }

        return null;
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.role = user.role;
        token.id = user.id;
      }
      return token;
    },
    async session({ session, token }) {
      if (session?.user) {
        session.user.role = token.role as "admin" | "professor" | "student";
        session.user.id = token.id as string;
      }
      return session;
    },
  },
  secret: process.env.NEXTAUTH_SECRET,
  session: {
    strategy: "jwt",
  },
  pages: {
    signIn: "/login",
    error: "/login",
  },
};
