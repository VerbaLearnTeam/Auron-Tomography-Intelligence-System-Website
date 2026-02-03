"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/db/prisma";
import { normalizeEmail } from "@/lib/auth/allowlist";
import { isAdminFromCookies, setAdminCookie, clearAdminCookie } from "@/lib/admin/session";
import {
  approvalEmailTemplate,
  inviteEmailTemplate,
  revokedEmailTemplate,
  sendEmail
} from "@/lib/email/send";

type InviteeType = "physician" | "partner" | "investor" | "other";

function requireAdmin() {
  if (!isAdminFromCookies()) throw new Error("Unauthorized");
}

function startLinkForEmail(email: string) {
  const base = process.env.APP_START_URL || "http://localhost:3000/start";
  const url = new URL(base);
  url.searchParams.set("email", email);
  url.searchParams.set("next", "/walkthrough");
  return url.toString();
}

export async function adminLoginAction(formData: FormData): Promise<void> {
  const key = String(formData.get("admin_key") || "");
  const expected = process.env.ADMIN_API_KEY || "";
  if (!expected || key !== expected) {
    // Invalid key - just revalidate (page will re-render with login form)
    revalidatePath("/admin");
    return;
  }
  setAdminCookie();
  revalidatePath("/admin");
}

export async function adminLogoutAction(): Promise<void> {
  requireAdmin();
  clearAdminCookie();
  revalidatePath("/admin");
}

export async function approveAccessRequestAction(formData: FormData): Promise<void> {
  requireAdmin();
  const requestId = String(formData.get("request_id") || "");
  const inviteeType = (String(formData.get("invitee_type") || "other") as InviteeType) || "other";
  const reviewedBy = String(formData.get("reviewed_by") || "").trim() || null;
  const notes = String(formData.get("notes") || "").trim() || null;
  const notify = String(formData.get("notify") || "") === "on";

  if (!requestId) {
    revalidatePath("/admin");
    return;
  }

  const reqRow = await prisma.accessRequest.findUnique({ where: { id: requestId } });
  if (!reqRow) {
    revalidatePath("/admin");
    return;
  }

  await prisma.$transaction(async (tx) => {
    await tx.accessRequest.update({
      where: { id: requestId },
      data: { status: "approved", reviewedAt: new Date(), reviewedBy }
    });

    await tx.allowlistEntry.upsert({
      where: { emailNormalized: reqRow.emailNormalized },
      create: {
        email: reqRow.email,
        emailNormalized: reqRow.emailNormalized,
        status: "approved",
        inviteeType,
        approvedAt: new Date(),
        notes,
        invitedBy: reviewedBy
      },
      update: {
        email: reqRow.email,
        status: "approved",
        inviteeType,
        approvedAt: new Date(),
        revokedAt: null,
        notes,
        invitedBy: reviewedBy
      }
    });
  });

  if (notify) {
    const startUrl = startLinkForEmail(reqRow.email);
    const tpl = approvalEmailTemplate({ startUrl });
    await sendEmail({ to: reqRow.email, subject: tpl.subject, html: tpl.html, text: tpl.text });
  }

  revalidatePath("/admin");
}

export async function rejectAccessRequestAction(formData: FormData): Promise<void> {
  requireAdmin();
  const requestId = String(formData.get("request_id") || "");
  const reviewedBy = String(formData.get("reviewed_by") || "").trim() || null;

  if (!requestId) {
    revalidatePath("/admin");
    return;
  }

  await prisma.accessRequest.update({
    where: { id: requestId },
    data: { status: "rejected", reviewedAt: new Date(), reviewedBy }
  });

  revalidatePath("/admin");
}

export async function directInviteAction(formData: FormData): Promise<void> {
  requireAdmin();
  const email = String(formData.get("email") || "").trim();
  const inviteeType = (String(formData.get("invitee_type") || "other") as InviteeType) || "other";
  const invitedBy = String(formData.get("invited_by") || "").trim() || null;
  const notes = String(formData.get("notes") || "").trim() || null;
  const notify = String(formData.get("notify") || "") === "on";

  if (!email) {
    revalidatePath("/admin");
    return;
  }

  const emailNormalized = normalizeEmail(email);

  await prisma.allowlistEntry.upsert({
    where: { emailNormalized },
    create: {
      email,
      emailNormalized,
      status: "approved",
      inviteeType,
      approvedAt: new Date(),
      invitedBy,
      notes
    },
    update: {
      email,
      status: "approved",
      inviteeType,
      approvedAt: new Date(),
      revokedAt: null,
      invitedBy,
      notes
    }
  });

  if (notify) {
    const startUrl = startLinkForEmail(email);
    const tpl = inviteEmailTemplate({ startUrl });
    await sendEmail({ to: email, subject: tpl.subject, html: tpl.html, text: tpl.text });
  }

  revalidatePath("/admin");
}

export async function revokeAllowlistAction(formData: FormData): Promise<void> {
  requireAdmin();
  const email = String(formData.get("email") || "").trim();
  const reason = String(formData.get("reason") || "").trim() || null;
  const revokedBy = String(formData.get("revoked_by") || "").trim() || null;
  const notify = String(formData.get("notify") || "") === "on";

  if (!email) {
    revalidatePath("/admin");
    return;
  }

  const emailNormalized = normalizeEmail(email);
  const existing = await prisma.allowlistEntry.findUnique({ where: { emailNormalized } });
  if (!existing) {
    revalidatePath("/admin");
    return;
  }

  await prisma.allowlistEntry.update({
    where: { emailNormalized },
    data: {
      status: "revoked",
      revokedAt: new Date(),
      invitedBy: revokedBy ?? existing.invitedBy,
      notes: [existing.notes, reason ? `Revoked: ${reason}` : "Revoked"].filter(Boolean).join("\n")
    }
  });

  if (notify) {
    const tpl = revokedEmailTemplate();
    await sendEmail({ to: email, subject: tpl.subject, html: tpl.html, text: tpl.text });
  }

  revalidatePath("/admin");
}

export async function reinstateAllowlistAction(formData: FormData): Promise<void> {
  requireAdmin();
  const email = String(formData.get("email") || "").trim();
  const invitedBy = String(formData.get("invited_by") || "").trim() || null;

  if (!email) {
    revalidatePath("/admin");
    return;
  }

  const emailNormalized = normalizeEmail(email);
  const existing = await prisma.allowlistEntry.findUnique({ where: { emailNormalized } });
  if (!existing) {
    revalidatePath("/admin");
    return;
  }

  await prisma.allowlistEntry.update({
    where: { emailNormalized },
    data: {
      status: "approved",
      approvedAt: new Date(),
      revokedAt: null,
      invitedBy: invitedBy ?? existing.invitedBy
    }
  });

  revalidatePath("/admin");
}
