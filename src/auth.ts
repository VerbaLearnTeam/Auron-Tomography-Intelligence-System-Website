import NextAuth from "next-auth";
import Resend from "next-auth/providers/resend";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { prisma } from "@/lib/db/prisma";
import { isAllowlisted, normalizeEmail } from "@/lib/auth/allowlist";

export const { handlers, auth, signIn, signOut } = NextAuth({
  adapter: PrismaAdapter(prisma),
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
