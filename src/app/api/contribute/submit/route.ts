import { jsonResponse, parseAndValidate } from "@/lib/api/validation";
import {
  contributeSubmissionDetailsSchema,
  contributeSubmissionMessages,
  type ContributeSubmissionDetails
} from "@/lib/forms/schemas";

function generateSubmissionId() {
  const n = Math.floor(100000 + Math.random() * 900000);
  return `AURON-${n}`;
}

export async function POST(req: Request) {
  const parsed = await parseAndValidate(req, contributeSubmissionDetailsSchema);
  if (!parsed.ok) return jsonResponse(parsed, { status: 400 });

  const _data: ContributeSubmissionDetails = parsed.value;
  const submissionId = generateSubmissionId();

  return jsonResponse({
    ok: true,
    data: {
      submissionId,
      message: contributeSubmissionMessages.success.replace("{SUBMISSION_ID}", submissionId)
    }
  });
}
