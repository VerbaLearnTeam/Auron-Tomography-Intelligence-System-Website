import { z } from "zod";
import { jsonResponse, parseAndValidate } from "@/lib/api/validation";
import { isAllowlisted } from "@/lib/auth/allowlist";

const schema = z.object({
  email: z.string({ required_error: "Email is required." }).trim().email("Enter a valid email address.")
});

export async function POST(req: Request) {
  const parsed = await parseAndValidate(req, schema);
  if (!parsed.ok) return jsonResponse(parsed, { status: 400 });

  const { ok } = await isAllowlisted(parsed.value.email);
  if (!ok) {
    return jsonResponse(
      {
        ok: false,
        code: "NOT_WHITELISTED",
        message: "This email isn’t approved yet. Request access or contact the team."
      },
      { status: 403 }
    );
  }

  return jsonResponse({ ok: true, data: { message: "Approved." } });
}
