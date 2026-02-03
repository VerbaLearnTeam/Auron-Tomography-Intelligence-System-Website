import { jsonResponse, parseAndValidate } from "@/lib/api/validation";
import {
  contactPartnershipsSchema,
  contactMessages,
  type ContactPartnerships
} from "@/lib/forms/schemas";

export async function POST(req: Request) {
  const parsed = await parseAndValidate(req, contactPartnershipsSchema);
  if (!parsed.ok) return jsonResponse(parsed, { status: 400 });

  const _data: ContactPartnerships = parsed.value;

  return jsonResponse({ ok: true, data: { message: contactMessages.success } });
}
