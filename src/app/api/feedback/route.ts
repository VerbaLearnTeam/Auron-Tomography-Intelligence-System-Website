import { jsonResponse, parseAndValidate } from "@/lib/api/validation";
import { appFeedbackSchema, appFeedbackMessages, type AppFeedback } from "@/lib/forms/schemas";

export async function POST(req: Request) {
  const parsed = await parseAndValidate(req, appFeedbackSchema);
  if (!parsed.ok) return jsonResponse(parsed, { status: 400 });

  const _data: AppFeedback = parsed.value;

  return jsonResponse({ ok: true, data: { message: appFeedbackMessages.success } });
}
