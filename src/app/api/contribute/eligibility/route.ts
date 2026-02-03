import { jsonResponse, parseAndValidate } from "@/lib/api/validation";
import {
  contributeEligibilitySchema,
  contributeEligibilityMessages,
  type ContributeEligibility
} from "@/lib/forms/schemas";

export async function POST(req: Request) {
  const parsed = await parseAndValidate(req, contributeEligibilitySchema, {
    message: contributeEligibilityMessages.genericError
  });
  if (!parsed.ok) return jsonResponse(parsed, { status: 400 });

  const _data: ContributeEligibility = parsed.value;

  return jsonResponse({ ok: true, data: { message: contributeEligibilityMessages.success } });
}
