import { z } from "zod";

const emailSchema = z
  .string({ required_error: "Email is required." })
  .trim()
  .max(254, { message: "Enter a valid email address." })
  .email({ message: "Enter a valid email address." });

const textTrimmed = (requiredMsg: string, min: number, minMsg: string, max: number, maxMsg: string) =>
  z
    .string({ required_error: requiredMsg })
    .trim()
    .min(min, { message: minMsg })
    .max(max, { message: maxMsg });

const optionalTrimmedMax = (max: number, msg: string) =>
  z
    .string()
    .trim()
    .max(max, { message: msg })
    .optional()
    .or(z.literal("").transform(() => undefined));

const requiredCheckbox = (msg: string) => z.literal(true, { errorMap: () => ({ message: msg }) });

const monthYearOptional = z
  .string()
  .trim()
  .regex(/^(0[1-9]|1[0-2])\/(19|20)\d{2}$/, { message: "Enter date as MM/YYYY." })
  .optional()
  .or(z.literal("").transform(() => undefined));

export const demoAccessRequestSchema = z.object({
  full_name: textTrimmed(
    "Full name is required.",
    2,
    "Full name must be at least 2 characters.",
    80,
    "Full name must be 80 characters or fewer."
  ),
  email: emailSchema,
  role: z.enum(
    ["Physician", "Radiologist", "Researcher", "Healthcare Executive", "Engineer", "Other"],
    { required_error: "Select a role." }
  ),
  specialty: optionalTrimmedMax(80, "Specialty must be 80 characters or fewer."),
  institution: textTrimmed(
    "Institution or organization is required.",
    2,
    "Institution must be at least 2 characters.",
    120,
    "Institution must be 120 characters or fewer."
  ),
  country_region: textTrimmed(
    "Country or region is required.",
    2,
    "Country or region must be at least 2 characters.",
    80,
    "Country or region must be 80 characters or fewer."
  ),
  evaluation_goal: z
    .string({ required_error: "Tell us what you want to evaluate." })
    .trim()
    .min(10, { message: "Please provide at least 10 characters." })
    .max(800, { message: "Please keep this to 800 characters or fewer." }),
  availability: z
    .enum(["No preference", "Weekdays", "Weekends", "Evenings", "Mornings"])
    .optional()
    .or(z.literal("").transform(() => undefined)),
  ack_prototype_not_medical_advice: requiredCheckbox("You must acknowledge the prototype disclaimer."),
  ack_no_sharing: requiredCheckbox("You must agree not to share prototype materials.")
});

export type DemoAccessRequest = z.infer<typeof demoAccessRequestSchema>;

export const demoAccessRequestMessages = {
  success:
    "Thanks—your request was received. If approved, you’ll get an email when your address is whitelisted and you can sign in.",
  genericError: "Something went wrong. Please try again or contact us."
} as const;

export const contactPartnershipsSchema = z.object({
  full_name: textTrimmed(
    "Name is required.",
    2,
    "Name must be at least 2 characters.",
    80,
    "Name must be 80 characters or fewer."
  ),
  email: emailSchema,
  organization: textTrimmed(
    "Organization is required.",
    2,
    "Organization must be at least 2 characters.",
    120,
    "Organization must be 120 characters or fewer."
  ),
  role_title: textTrimmed(
    "Role/title is required.",
    2,
    "Role/title must be at least 2 characters.",
    80,
    "Role/title must be 80 characters or fewer."
  ),
  interest_area: z.enum(
    ["Clinical validation", "Data partnership", "Technical integration", "Commercial collaboration", "Other"],
    { required_error: "Select an interest area." }
  ),
  message: z
    .string({ required_error: "Message is required." })
    .trim()
    .min(10, { message: "Message must be at least 10 characters." })
    .max(2000, { message: "Message must be 2000 characters or fewer." })
});

export type ContactPartnerships = z.infer<typeof contactPartnershipsSchema>;

export const contactSupportSchema = z.object({
  full_name: textTrimmed(
    "Name is required.",
    2,
    "Name must be at least 2 characters.",
    80,
    "Name must be 80 characters or fewer."
  ),
  email: emailSchema,
  topic: z.enum(["Demo access", "Scan submission", "Other"], { required_error: "Select a topic." }),
  message: z
    .string({ required_error: "Message is required." })
    .trim()
    .min(10, { message: "Message must be at least 10 characters." })
    .max(2000, { message: "Message must be 2000 characters or fewer." })
});

export type ContactSupport = z.infer<typeof contactSupportSchema>;

export const contactMessages = {
  success: "Thanks—your message was sent. We’ll respond as soon as we can.",
  genericError: "Something went wrong. Please try again or contact us."
} as const;

export const contributeEligibilitySchema = z.object({
  eligible_right_to_share: requiredCheckbox("You must confirm you have the right to share the scans."),
  eligible_raw_dicom: requiredCheckbox("You must confirm the files are raw DICOM."),
  eligible_zipped_folder: requiredCheckbox("You must confirm you can upload a zipped folder."),
  eligible_arterial_anatomy: requiredCheckbox("You must confirm the scan includes arterial anatomy.")
});

export type ContributeEligibility = z.infer<typeof contributeEligibilitySchema>;

export const contributeEligibilityMessages = {
  success: "Eligibility confirmed. Continue to consent and terms.",
  genericError: "Please complete all eligibility checks before continuing."
} as const;

export const contributeConsentSchema = z.object({
  consent_submit_for_review_and_research: requiredCheckbox(
    "You must consent to submit your imaging for review."
  ),
  ack_not_medical_care: requiredCheckbox("You must acknowledge this is not medical care."),
  ack_identifiable_during_intake: requiredCheckbox(
    "You must acknowledge identifiable information may exist during intake."
  )
});

export type ContributeConsent = z.infer<typeof contributeConsentSchema>;

export const contributeConsentMessages = {
  success: "Consent recorded. Continue to upload.",
  genericError: "Please accept all required terms to continue."
} as const;

export const contributeUploadSchema = z.object({
  upload_completed: requiredCheckbox("Confirm upload completion to continue.")
});

export type ContributeUpload = z.infer<typeof contributeUploadSchema>;

export const contributeUploadMessages = {
  success: "Upload confirmed. Continue to submission details.",
  genericError: "Please confirm that you finished uploading."
} as const;

export const contributeSubmissionDetailsSchema = z.object({
  contact_email: z
    .string({ required_error: "Email is required so we can contact you." })
    .trim()
    .max(254, { message: "Enter a valid email address." })
    .email({ message: "Enter a valid email address." }),
  submitter_name: optionalTrimmedMax(80, "Name must be 80 characters or fewer."),
  scan_type: z.enum(["CTA", "CT", "Other"], { required_error: "Select a scan type." }),
  scan_region: z.enum(
    ["Head & neck (arterial)", "Coronary (arterial)", "Other arterial region"],
    { required_error: "Select a scan region." }
  ),
  scan_date_month_year: monthYearOptional,
  source_hospital_system: optionalTrimmedMax(120, "This must be 120 characters or fewer."),
  notes: optionalTrimmedMax(800, "Notes must be 800 characters or fewer."),
  payout_email: z
    .string({ required_error: "Payout email is required." })
    .trim()
    .max(254, { message: "Enter a valid email address." })
    .email({ message: "Enter a valid email address." }),
  payout_country: textTrimmed(
    "Country is required for payout fulfillment.",
    2,
    "Country must be at least 2 characters.",
    80,
    "Country must be 80 characters or fewer."
  ),
  confirm_match_upload: requiredCheckbox("You must confirm your upload details.")
});

export type ContributeSubmissionDetails = z.infer<typeof contributeSubmissionDetailsSchema>;

export const contributeSubmissionMessages = {
  success:
    "Thank you—your submission is received. Your submission ID is {SUBMISSION_ID}. We’ll email you after review.",
  genericError: "Something went wrong submitting your information. Please try again or contact support."
} as const;

export const appFeedbackSchema = z
  .object({
    case_id: optionalTrimmedMax(40, "Case ID must be 40 characters or fewer."),
    workflow_rating: z.enum(["1", "2", "3", "4", "5"], { required_error: "Select a rating." }),
    most_useful: z
      .string({ required_error: "Please tell us what felt most useful." })
      .trim()
      .min(10, { message: "Please provide at least 10 characters." })
      .max(1200, { message: "Please keep this to 1200 characters or fewer." }),
    confusing_or_missing: z
      .string({ required_error: "Please tell us what felt confusing or missing." })
      .trim()
      .min(10, { message: "Please provide at least 10 characters." })
      .max(1200, { message: "Please keep this to 1200 characters or fewer." }),
    would_use_in_workflow: z.enum(["Yes", "No", "Not sure"], { required_error: "Select an option." }),
    request_follow_up: z.boolean().optional().default(false),
    follow_up_email: z
      .string()
      .trim()
      .max(254, { message: "Enter a valid email address." })
      .email({ message: "Enter a valid email address." })
      .optional()
      .or(z.literal("").transform(() => undefined))
  })
  .superRefine((data, ctx) => {
    if (data.request_follow_up && !data.follow_up_email) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["follow_up_email"],
        message: "Email is required if you request a follow-up."
      });
    }
  });

export type AppFeedback = z.infer<typeof appFeedbackSchema>;

export const appFeedbackMessages = {
  success: "Thanks—your feedback was sent.",
  genericError: "Something went wrong. Please try again."
} as const;

export function zodFieldErrors(err: z.ZodError) {
  const out: Record<string, string> = {};
  for (const issue of err.issues) {
    const key = issue.path.join(".");
    if (!out[key]) out[key] = issue.message;
  }
  return out;
}
