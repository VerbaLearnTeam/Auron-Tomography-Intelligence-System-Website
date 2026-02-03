import { jsonResponse, parseAndValidate } from "@/lib/api/validation";
import {
  demoAccessRequestSchema,
  demoAccessRequestMessages,
  type DemoAccessRequest
} from "@/lib/forms/schemas";
import { prisma } from "@/lib/db/prisma";
import { normalizeEmail } from "@/lib/auth/allowlist";

export async function POST(req: Request) {
  const parsed = await parseAndValidate(req, demoAccessRequestSchema);
  if (!parsed.ok) return jsonResponse(parsed, { status: 400 });

  const data: DemoAccessRequest = parsed.value;
  const emailNormalized = normalizeEmail(data.email);

  await prisma.accessRequest.create({
    data: {
      fullName: data.full_name,
      email: data.email,
      emailNormalized,
      role: data.role,
      specialty: data.specialty ?? null,
      institution: data.institution,
      countryRegion: data.country_region,
      evaluationGoal: data.evaluation_goal,
      availability: data.availability ?? null,
      ackPrototypeNotMedicalAdvice: data.ack_prototype_not_medical_advice,
      ackNoSharing: data.ack_no_sharing
    }
  });

  return jsonResponse({
    ok: true,
    data: { message: demoAccessRequestMessages.success }
  });
}
