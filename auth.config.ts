import type { NextAuthConfig } from "next-auth";
import { isAdminEmail } from "@/lib/admin";

export const authConfig = {
  pages: {
    signIn: "/"
  },
  providers: [],
  callbacks: {
    authorized({ auth, request }) {
      const isAdminRoute = request.nextUrl.pathname.startsWith("/admin");
      if (!isAdminRoute) return true;
      return isAdminEmail(auth?.user?.email);
    }
  }
} satisfies NextAuthConfig;
