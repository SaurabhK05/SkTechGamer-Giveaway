import NextAuth from "next-auth";
import Google from "next-auth/providers/google";
import { authConfig } from "./auth.config";

export const { handlers, auth, signIn, signOut } = NextAuth({
  ...authConfig,
  session: {
    strategy: "jwt",
    maxAge: 24 * 60 * 60
  },
  jwt: {
    maxAge: 24 * 60 * 60
  },
  providers: [
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      authorization: {
        params: {
          scope: [
            "email",
            "https://www.googleapis.com/auth/youtube.readonly"
          ].join(" "),
          access_type: "offline",
          prompt: "select_account"
        }
      }
    })
  ],
  callbacks: {
    async jwt({ token, account }) {
      if (account) {
        token.accessToken = account.access_token;
        token.refreshToken = account.refresh_token;
        token.expiresAt = account.expires_at;
        return token;
      }

      // Google access tokens usually expire after one hour. Keep the one-day
      // login session usable by refreshing the token before YouTube checks.
      if (
        token.expiresAt &&
        Date.now() < token.expiresAt * 1000 - 60_000
      ) {
        return token;
      }

      if (!token.refreshToken) {
        return token;
      }

      try {
        const response = await fetch("https://oauth2.googleapis.com/token", {
          method: "POST",
          headers: { "Content-Type": "application/x-www-form-urlencoded" },
          body: new URLSearchParams({
            client_id: process.env.GOOGLE_CLIENT_ID!,
            client_secret: process.env.GOOGLE_CLIENT_SECRET!,
            grant_type: "refresh_token",
            refresh_token: token.refreshToken
          })
        });
        const refreshed = await response.json();

        if (!response.ok) {
          throw new Error(refreshed.error ?? "Google token refresh failed");
        }

        token.accessToken = refreshed.access_token;
        token.expiresAt = Math.floor(Date.now() / 1000) + refreshed.expires_in;
      } catch (error) {
        console.error("Google access token refresh failed:", error);
      }

      return token;
    },
    async session({ session, token }) {
      session.accessToken = token.accessToken as string | undefined;
      return session;
    }
  }
});
