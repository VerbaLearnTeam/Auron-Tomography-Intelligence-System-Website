import { jsonResponse, parseAndValidate } from "@/lib/api/validation";
import { contributeConsentSchema, contributeConsentMessages, type ContributeConsent } from "@/lib/forms/schemas";

export async function POST(req: Request) {
  const parsed = await parseAndValidate(req, contributeConsentSchema);
  if (!parsed.ok) return jsonResponse(parsed, { status: 400 });

  const _data: ContributeConsent = parsed.value;

  return jsonResponse({ ok: true, data: { message: contributeConsentMessages.success } });
}
