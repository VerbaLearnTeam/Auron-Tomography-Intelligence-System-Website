import { jsonResponse, parseAndValidate } from "@/lib/api/validation";
import { contributeUploadSchema, contributeUploadMessages, type ContributeUpload } from "@/lib/forms/schemas";

export async function POST(req: Request) {
  const parsed = await parseAndValidate(req, contributeUploadSchema);
  if (!parsed.ok) return jsonResponse(parsed, { status: 400 });

  const _data: ContributeUpload = parsed.value;

  return jsonResponse({ ok: true, data: { message: contributeUploadMessages.success } });
}
