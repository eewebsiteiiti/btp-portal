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

        // Admin (DUGC) login
        if (role === "admin") {
          if (
            email !== process.env.ADMIN_EMAIL ||
            password !== process.env.ADMIN_PASSWORD
          ) {
            throw new Error("Invalid email or password");
          }
          return { id: "admin", name: "Admin", email: "", role: "admin" };
        }

        // DPGC login
        if (role === "dpgc") {
          if (
            email !== process.env.DPGC_EMAIL ||
            password !== process.env.DPGC_PASSWORD
          ) {
            throw new Error("Invalid email or password");
          }
          return { id: "dpgc", name: "DPGC", email: "", role: "dpgc" };
        }

        // BTP Student login
        if (role === "student") {
          const student = await prisma.student.findUnique({
            where: { email },
          });

          if (!student || student.program !== "BTP") {
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

        // MTP Student login
        if (role === "mtp_student") {
          const student = await prisma.student.findUnique({
            where: { email },
          });

          if (!student || student.program !== "MTP") {
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
            role: "mtp_student",
            name: student.name,
            domain: student.domain,
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

        // Program Coordinator login (env-based, one per domain)
        if (role === "program_coordinator") {
          const pcCredentials = [
            { email: process.env.PC_CSP_EMAIL, password: process.env.PC_CSP_PASSWORD, domain: "CSP", name: "PC CSP" },
            { email: process.env.PC_PSPE_EMAIL, password: process.env.PC_PSPE_PASSWORD, domain: "PSPE", name: "PC PSPE" },
            { email: process.env.PC_VDN_EMAIL, password: process.env.PC_VDN_PASSWORD, domain: "VDN", name: "PC VDN" },
          ];

          const matched = pcCredentials.find(
            (pc) => pc.email === email && pc.password === password
          );

          if (!matched) {
            throw new Error("Invalid email or password");
          }

          return {
            id: `pc-${matched.domain.toLowerCase()}`,
            email: matched.email || "",
            role: "program_coordinator",
            name: matched.name,
            domain: matched.domain,
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
        token.domain = user.domain ?? null;
      }
      return token;
    },
    async session({ session, token }) {
      if (session?.user) {
        session.user.role = token.role as string;
        session.user.id = token.id as string;
        session.user.domain = token.domain as string | null | undefined;
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
