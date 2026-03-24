import type { DefaultSession } from "next-auth";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      name?: string | null;
      email?: string | null;
      image?: string | null;
      role: string;
      domain?: string | null;
    } & DefaultSession["user"];
  }

  interface User {
    id: string;
    role: string;
    domain?: string | null;
  }
}
