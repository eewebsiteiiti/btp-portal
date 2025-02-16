import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { dbConnect } from "@/lib/mongodb";
import Student from "@/models/Student";
import Professor from "@/models/Professor";

interface Student {
  _id: string;
  roll_no: string;
  name: string;
  email: string;
  password: string;
  cpi: number;
  preference: Array<object>;
}
interface Professor {
  _id: string;
  faculty_id: string;
  name: string;
  email: string;
  password: string;
  preference: Array<object>;
}
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
        console.log(credentials);
        if(credentials?.role === "admin"){
          if(credentials?.email !== process.env.ADMIN_EMAIL || credentials?.password !== process.env.ADMIN_PASSWORD){
            throw new Error("Invalid email or password");
          }

          return { id: "admin", name: "Admin", email: "", role: "admin" };
        }
        if (credentials?.role === "student") {
          await dbConnect();
          const user = (await Student.findOne({
            email: credentials?.email,
          }).lean()) as unknown as Student;
          console.log(user);

          if (!user || user?.password !== credentials?.password) {
            throw new Error("Invalid email or password");
          }
          // if (!user || !bcrypt.compareSync(credentials?.password || "", user.password)) {
          //   throw new Error("Invalid email or password");
          // }
          return {
            id: user._id,
            email: user.email,
            role: "student",
            name: user.name,
          };
        }
        if (credentials?.role === "professor") {
          await dbConnect();

          const user = (await Professor.findOne({
            email: credentials?.email,
          }).lean()) as unknown as Professor;
          console.log(user);

          if (!user || user?.password !== credentials?.password) {
            throw new Error("Invalid email or password");
          }
          // if (!user || !bcrypt.compareSync(credentials?.password || "", user.password)) {
          //   throw new Error("Invalid email or password");
          // }
          return {
            id: user._id,
            email: user.email,
            role: "professor",
            name: user.name,
          };
        }
        else return null;
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) token.role = user.role;
      return token;
    },
    async session({ session, token }) {
      if (session?.user) {
        session.user.role = token.role as "admin" | "professor" | "student";
      }
      return session;
    },
  },
  secret: process.env.NEXTAUTH_SECRET,
  session: {
    strategy: "jwt",
  },
};
