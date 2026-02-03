import { jsonResponse, parseAndValidate } from "@/lib/api/validation";
import { contactSupportSchema, contactMessages, type ContactSupport } from "@/lib/forms/schemas";

export async function POST(req: Request) {
  const parsed = await parseAndValidate(req, contactSupportSchema);
  if (!parsed.ok) return jsonResponse(parsed, { status: 400 });

  const _data: ContactSupport = parsed.value;

  return jsonResponse({ ok: true, data: { message: contactMessages.success } });
}
