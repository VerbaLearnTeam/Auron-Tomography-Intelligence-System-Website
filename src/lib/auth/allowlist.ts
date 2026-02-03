import { prisma } from "@/lib/db/prisma";

export function normalizeEmail(email: string) {
  return email.trim().toLowerCase();
}

export async function isAllowlisted(email: string) {
  const emailNormalized = normalizeEmail(email);
  const entry = await prisma.allowlistEntry.findUnique({
    where: { emailNormalized }
  });

  return {
    ok: Boolean(entry && entry.status === "approved"),
    entry
  };
}

export async function requireAllowlistedEmail(email: string) {
  const res = await isAllowlisted(email);
  if (!res.ok) return { ok: false as const };
  return { ok: true as const, entry: res.entry! };
}
