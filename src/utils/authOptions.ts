import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { dbConnect } from "@/lib/mongodb";
import User from "@/models/User";


interface User {
    _id: string;
    name: string;
    email: string;
    password: string;
    role: "admin" | "professor" | "student";
  }
  export const authOptions: NextAuthOptions = {
    providers: [
      CredentialsProvider({
        name: "Credentials",
        credentials: {
          email: { label: "Email", type: "text" },
          password: { label: "Password", type: "password" },
        },
        async authorize(credentials) {
          console.log(credentials);
          
          await dbConnect();
          
          const user = await User.findOne({ email: credentials?.email }).lean() as unknown as User;
          console.log(user);
          
          if(!user || user?.password !== credentials?.password){
            throw new Error("Invalid email or password");
          }
          // if (!user || !bcrypt.compareSync(credentials?.password || "", user.password)) {
          //   throw new Error("Invalid email or password");
          // }
  
          return { id: user._id.toString(), name: user.name, email: user.email, role: user.role };
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