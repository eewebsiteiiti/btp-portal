import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
interface User {
    id: string;
    name: string;
    email: string;
    password: string;
    role: "admin" | "professor" | "student";
  }
  
  const users: User[] = [
    { id: "1", name: "admin", email: "admin@gmail.com", password: bcrypt.hashSync("password123", 10), role: "admin" },
    { id: "2", name: "prof", email: "prof@gmail.com", password: bcrypt.hashSync("password123", 10), role: "professor" },
    { id: "3", name: "stu", email: "stu@gmail.com", password: bcrypt.hashSync("password123", 10), role: "student" },
  ];

export const authOptions: NextAuthOptions = {
    providers: [
        CredentialsProvider({
          name: "Credentials",
          credentials: {
            email: { label: "Email", type: "text" },
            password: { label: "Password", type: "password" },
          },
          async authorize(credentials): Promise<User>  {
            if (!credentials?.email || !credentials?.password) throw new Error("Missing credentials");
            const user = users.find((u) => u.email === credentials.email);
            if (user && bcrypt.compareSync(credentials.password, user.password)) {
              return { id: user.id, name: user.name, email: user.email, role: user.role, password:"" }; // No password field
            }
            throw new Error("Invalid credentials");
          },
        }),
      ],
      callbacks: {
        async jwt({ token, user}) {
          if (user) {
            token.role = user.role;
          }
          return token;
        },
        async session({ session, token }) {
          if (session?.user) {
            session.user.role = token.role as "admin" | "professor" | "student";
          }
          return session;
        },
      },
      secret: "fjdnfjksnfjd",
}