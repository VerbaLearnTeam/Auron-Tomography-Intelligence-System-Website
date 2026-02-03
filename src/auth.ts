import NextAuth from "next-auth";
import Resend from "next-auth/providers/resend";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { prisma } from "@/lib/db/prisma";
import { isAllowlisted, normalizeEmail } from "@/lib/auth/allowlist";

export const { handlers, auth, signIn, signOut } = NextAuth({
  adapter: PrismaAdapter(prisma),
  // Use JWT sessions to avoid Prisma calls in Edge middleware
  session: { strategy: "jwt" },
  providers: [
    Resend({
      from: process.env.EMAIL_FROM || "Auron Intelligence <no-reply@auronintelligence.com>",
      apiKey: process.env.AUTH_RESEND_KEY
    })
  ],
  pages: {
    signIn: "/demo"
  },
  callbacks: {
    async signIn({ user }) {
      const email = user?.email ? normalizeEmail(user.email) : null;
      if (!email) return false;
      const { ok } = await isAllowlisted(email);
      return ok;
    },
    // Include user info in JWT token
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.email = user.email;
      }
      return token;
    },
    // Make user info available in session
    async session({ session, token }) {
      if (token && session.user) {
        session.user.id = token.id as string;
      }
      return session;
    }
  },
  events: {
    async signIn({ user }) {
      if (!user.email) return;
      const emailNormalized = normalizeEmail(user.email);
      await prisma.allowlistEntry
        .update({
          where: { emailNormalized },
          data: { lastLoginAt: new Date() }
        })
        .catch(() => {});
    }
  }
});
