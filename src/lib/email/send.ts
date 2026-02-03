type SendEmailArgs = {
  to: string;
  subject: string;
  html: string;
  text?: string;
};

const RESEND_API_KEY = process.env.AUTH_RESEND_KEY || process.env.RESEND_API_KEY || "";
const FROM = process.env.EMAIL_FROM || "Auron Intelligence <no-reply@auronintelligence.com>";

export async function sendEmail(args: SendEmailArgs) {
  if (!RESEND_API_KEY) {
    return { ok: false as const, error: "Missing AUTH_RESEND_KEY" };
  }

  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${RESEND_API_KEY}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      from: FROM,
      to: [args.to],
      subject: args.subject,
      html: args.html,
      text: args.text
    })
  });

  if (!res.ok) {
    const errText = await res.text().catch(() => "");
    return { ok: false as const, error: `Resend error: ${res.status} ${errText}` };
  }

  return { ok: true as const };
}

export function approvalEmailTemplate(params: { startUrl: string }) {
  const { startUrl } = params;
  return {
    subject: "You are approved for the Auron prototype",
    html: `
      <div style="font-family: ui-sans-serif, system-ui; line-height: 1.5;">
        <h2>You are approved</h2>
        <p>Your email has been added to the invite-only allowlist for the Auron prototype.</p>
        <p>
          <a href="${startUrl}" style="display:inline-block;padding:12px 18px;border-radius:10px;background:#0a0a0a;color:#ffffff;text-decoration:none;font-weight:600;">
            Start the demo walkthrough
          </a>
        </p>
        <p style="color:#666; font-size: 13px;">
          Prototype platform for research and evaluation. Not medical advice. Not for emergency use.
        </p>
      </div>
    `,
    text:
      "You are approved for the Auron prototype.\n" +
      `Start the demo walkthrough: ${startUrl}\n\n` +
      "Prototype platform for research and evaluation. Not medical advice. Not for emergency use."
  };
}

export function inviteEmailTemplate(params: { startUrl: string }) {
  const { startUrl } = params;
  return {
    subject: "You are invited to the Auron prototype",
    html: `
      <div style="font-family: ui-sans-serif, system-ui; line-height: 1.5;">
        <h2>You are invited</h2>
        <p>You have been added to the invite-only allowlist for the Auron prototype.</p>
        <p>
          <a href="${startUrl}" style="display:inline-block;padding:12px 18px;border-radius:10px;background:#0a0a0a;color:#ffffff;text-decoration:none;font-weight:600;">
            Start the demo walkthrough
          </a>
        </p>
        <p style="color:#666; font-size: 13px;">
          Prototype platform for research and evaluation. Not medical advice. Not for emergency use.
        </p>
      </div>
    `,
    text:
      "You are invited to the Auron prototype.\n" +
      `Start the demo walkthrough: ${startUrl}\n\n` +
      "Prototype platform for research and evaluation. Not medical advice. Not for emergency use."
  };
}

export function revokedEmailTemplate() {
  return {
    subject: "Auron prototype access updated",
    html: `
      <div style="font-family: ui-sans-serif, system-ui; line-height: 1.5;">
        <h2>Access updated</h2>
        <p>Your access to the Auron prototype has been updated. If you believe this is a mistake, reply to this email.</p>
      </div>
    `,
    text:
      "Your access to the Auron prototype has been updated. If you believe this is a mistake, reply to this email."
  };
}
