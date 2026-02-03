"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  contributeEligibilitySchema,
  contributeConsentSchema,
  contributeUploadSchema,
  contributeSubmissionDetailsSchema,
  contributeEligibilityMessages,
  contributeConsentMessages,
  contributeUploadMessages,
  type ContributeEligibility,
  type ContributeConsent,
  type ContributeUpload,
  type ContributeSubmissionDetails
} from "@/lib/forms/schemas";

function applyFieldErrors<T>(
  fieldErrors: Record<string, string>,
  setError: (name: keyof T, error: { message: string }) => void
) {
  Object.entries(fieldErrors).forEach(([field, message]) => {
    setError(field as keyof T, { message });
  });
}

export default function ContributeWizard({ uploadLink }: { uploadLink: string }) {
  const [step, setStep] = useState(1);
  const [serverMessage, setServerMessage] = useState<string | null>(null);
  const [submissionId, setSubmissionId] = useState<string | null>(null);

  const eligibilityForm = useForm<ContributeEligibility>({
    resolver: zodResolver(contributeEligibilitySchema),
    defaultValues: {
      eligible_right_to_share: false,
      eligible_raw_dicom: false,
      eligible_zipped_folder: false,
      eligible_arterial_anatomy: false
    }
  });

  const consentForm = useForm<ContributeConsent>({
    resolver: zodResolver(contributeConsentSchema),
    defaultValues: {
      consent_submit_for_review_and_research: false,
      ack_not_medical_care: false,
      ack_identifiable_during_intake: false
    }
  });

  const uploadForm = useForm<ContributeUpload>({
    resolver: zodResolver(contributeUploadSchema),
    defaultValues: { upload_completed: false }
  });

  const submissionForm = useForm<ContributeSubmissionDetails>({
    resolver: zodResolver(contributeSubmissionDetailsSchema),
    defaultValues: {
      scan_type: "CTA",
      scan_region: "Head & neck (arterial)",
      confirm_match_upload: false
    }
  });

  async function submitStep<T>(
    url: string,
    values: T,
    setError: (name: keyof T, error: { message: string }) => void,
    successMessage?: string,
    onSuccess?: (json: any) => void
  ) {
    setServerMessage(null);
    const res = await fetch(url, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(values)
    });
    const json = await res.json().catch(() => null);

    if (!res.ok) {
      if (json?.fieldErrors) {
        applyFieldErrors(json.fieldErrors as Record<string, string>, setError);
      }
      setServerMessage(json?.message || "Something went wrong. Please try again.");
      return false;
    }

    setServerMessage(successMessage || json?.data?.message || null);
    onSuccess?.(json);
    return true;
  }

  return (
    <div className="panel">
      <div className="badge">Step {step} of 4</div>
      {step === 1 && (
        <form
          onSubmit={eligibilityForm.handleSubmit(async (values) => {
            const ok = await submitStep(
              "/api/contribute/eligibility",
              values,
              eligibilityForm.setError,
              contributeEligibilityMessages.success
            );
            if (ok) setStep(2);
          })}
          className="form-grid"
        >
          <h2>Check eligibility</h2>
          <p className="muted">
            We review arterial CT imaging suitable for segmentation and prototype development. Submission does not
            guarantee acceptance.
          </p>
          <label className="field">
            <span className="muted">
              <input type="checkbox" {...eligibilityForm.register("eligible_right_to_share")} /> I have the legal right
              to access and share these scans.
            </span>
            {eligibilityForm.formState.errors.eligible_right_to_share?.message && (
              <span className="error">{eligibilityForm.formState.errors.eligible_right_to_share.message}</span>
            )}
          </label>
          <label className="field">
            <span className="muted">
              <input type="checkbox" {...eligibilityForm.register("eligible_raw_dicom")} /> Files are raw DICOM.
            </span>
            {eligibilityForm.formState.errors.eligible_raw_dicom?.message && (
              <span className="error">{eligibilityForm.formState.errors.eligible_raw_dicom.message}</span>
            )}
          </label>
          <label className="field">
            <span className="muted">
              <input type="checkbox" {...eligibilityForm.register("eligible_zipped_folder")} /> I can upload a zipped
              folder.
            </span>
            {eligibilityForm.formState.errors.eligible_zipped_folder?.message && (
              <span className="error">{eligibilityForm.formState.errors.eligible_zipped_folder.message}</span>
            )}
          </label>
          <label className="field">
            <span className="muted">
              <input type="checkbox" {...eligibilityForm.register("eligible_arterial_anatomy")} /> The scan includes
              arterial anatomy.
            </span>
            {eligibilityForm.formState.errors.eligible_arterial_anatomy?.message && (
              <span className="error">{eligibilityForm.formState.errors.eligible_arterial_anatomy.message}</span>
            )}
          </label>
          {serverMessage && <div className="notice">{serverMessage}</div>}
          <button className="btn btn-primary" type="submit">
            Continue
          </button>
        </form>
      )}

      {step === 2 && (
        <form
          onSubmit={consentForm.handleSubmit(async (values) => {
            const ok = await submitStep(
              "/api/contribute/consent",
              values,
              consentForm.setError,
              contributeConsentMessages.success
            );
            if (ok) setStep(3);
          })}
          className="form-grid"
        >
          <h2>Consent and terms</h2>
          <p className="muted">
            We accept raw DICOM immediately and de-identify after receipt. Prototype platform for research and
            evaluation. Not medical advice. Not for emergency use.
          </p>
          <label className="field">
            <span className="muted">
              <input type="checkbox" {...consentForm.register("consent_submit_for_review_and_research")} /> I consent to
              submit my imaging for review.
            </span>
            {consentForm.formState.errors.consent_submit_for_review_and_research?.message && (
              <span className="error">
                {consentForm.formState.errors.consent_submit_for_review_and_research.message}
              </span>
            )}
          </label>
          <label className="field">
            <span className="muted">
              <input type="checkbox" {...consentForm.register("ack_not_medical_care")} /> I understand this is not medical
              care.
            </span>
            {consentForm.formState.errors.ack_not_medical_care?.message && (
              <span className="error">{consentForm.formState.errors.ack_not_medical_care.message}</span>
            )}
          </label>
          <label className="field">
            <span className="muted">
              <input type="checkbox" {...consentForm.register("ack_identifiable_during_intake")} /> I acknowledge
              identifiable information may exist during intake.
            </span>
            {consentForm.formState.errors.ack_identifiable_during_intake?.message && (
              <span className="error">{consentForm.formState.errors.ack_identifiable_during_intake.message}</span>
            )}
          </label>
          {serverMessage && <div className="notice">{serverMessage}</div>}
          <button className="btn btn-primary" type="submit">
            I agree - continue
          </button>
        </form>
      )}

      {step === 3 && (
        <form
          onSubmit={uploadForm.handleSubmit(async (values) => {
            const ok = await submitStep(
              "/api/contribute/upload",
              values,
              uploadForm.setError,
              contributeUploadMessages.success
            );
            if (ok) setStep(4);
          })}
          className="form-grid"
        >
          <h2>Upload your DICOM</h2>
          <p className="muted">
            Use the secure upload link to submit your zipped DICOM folder. When finished, confirm below.
          </p>
          <a className="btn btn-outline" href={uploadLink} target="_blank" rel="noreferrer">
            Open secure upload link
          </a>
          <label className="field">
            <span className="muted">
              <input type="checkbox" {...uploadForm.register("upload_completed")} /> I finished uploading my zipped
              DICOM folder.
            </span>
            {uploadForm.formState.errors.upload_completed?.message && (
              <span className="error">{uploadForm.formState.errors.upload_completed.message}</span>
            )}
          </label>
          {serverMessage && <div className="notice">{serverMessage}</div>}
          <button className="btn btn-primary" type="submit">
            Continue to submission details
          </button>
        </form>
      )}

      {step === 4 && (
        <form
          onSubmit={submissionForm.handleSubmit(async (values) => {
            const ok = await submitStep(
              "/api/contribute/submit",
              values,
              submissionForm.setError,
              undefined,
              (json) => {
                setSubmissionId(json?.data?.submissionId || null);
              }
            );
            if (ok) {
              submissionForm.reset();
            }
          })}
          className="form-grid"
        >
          <h2>Submission details</h2>
          <p className="muted">
            If accepted for use, you will receive a prepaid card delivered via email.
          </p>

          <label className="field">
            <span className="muted">Contact email</span>
            <input className="input" type="email" {...submissionForm.register("contact_email")} />
            {submissionForm.formState.errors.contact_email?.message && (
              <span className="error">{submissionForm.formState.errors.contact_email.message}</span>
            )}
          </label>

          <label className="field">
            <span className="muted">Name (optional)</span>
            <input className="input" {...submissionForm.register("submitter_name")} />
            {submissionForm.formState.errors.submitter_name?.message && (
              <span className="error">{submissionForm.formState.errors.submitter_name.message}</span>
            )}
          </label>

          <label className="field">
            <span className="muted">Scan type</span>
            <select className="select" {...submissionForm.register("scan_type")}>
              <option value="CTA">CTA</option>
              <option value="CT">CT</option>
              <option value="Other">Other</option>
            </select>
            {submissionForm.formState.errors.scan_type?.message && (
              <span className="error">{submissionForm.formState.errors.scan_type.message}</span>
            )}
          </label>

          <label className="field">
            <span className="muted">Scan region</span>
            <select className="select" {...submissionForm.register("scan_region")}>
              <option value="Head & neck (arterial)">Head & neck (arterial)</option>
              <option value="Coronary (arterial)">Coronary (arterial)</option>
              <option value="Other arterial region">Other arterial region</option>
            </select>
            {submissionForm.formState.errors.scan_region?.message && (
              <span className="error">{submissionForm.formState.errors.scan_region.message}</span>
            )}
          </label>

          <label className="field">
            <span className="muted">Scan date (MM/YYYY, optional)</span>
            <input className="input" placeholder="MM/YYYY" {...submissionForm.register("scan_date_month_year")} />
            {submissionForm.formState.errors.scan_date_month_year?.message && (
              <span className="error">{submissionForm.formState.errors.scan_date_month_year.message}</span>
            )}
          </label>

          <label className="field">
            <span className="muted">Source hospital/system (optional)</span>
            <input className="input" {...submissionForm.register("source_hospital_system")} />
            {submissionForm.formState.errors.source_hospital_system?.message && (
              <span className="error">{submissionForm.formState.errors.source_hospital_system.message}</span>
            )}
          </label>

          <label className="field">
            <span className="muted">Notes (optional)</span>
            <textarea className="textarea" {...submissionForm.register("notes")} />
            {submissionForm.formState.errors.notes?.message && (
              <span className="error">{submissionForm.formState.errors.notes.message}</span>
            )}
          </label>

          <label className="field">
            <span className="muted">Payout email</span>
            <input className="input" type="email" {...submissionForm.register("payout_email")} />
            {submissionForm.formState.errors.payout_email?.message && (
              <span className="error">{submissionForm.formState.errors.payout_email.message}</span>
            )}
          </label>

          <label className="field">
            <span className="muted">Payout country</span>
            <input className="input" {...submissionForm.register("payout_country")} />
            {submissionForm.formState.errors.payout_country?.message && (
              <span className="error">{submissionForm.formState.errors.payout_country.message}</span>
            )}
          </label>

          <label className="field">
            <span className="muted">
              <input type="checkbox" {...submissionForm.register("confirm_match_upload")} /> I confirm the uploaded files
              match this submission.
            </span>
            {submissionForm.formState.errors.confirm_match_upload?.message && (
              <span className="error">{submissionForm.formState.errors.confirm_match_upload.message}</span>
            )}
          </label>

          {serverMessage && (
            <div className="success">
              {serverMessage}
              {submissionId && (
                <div style={{ marginTop: 8 }}>
                  Submission ID: <strong>{submissionId}</strong>
                </div>
              )}
            </div>
          )}

          <button className="btn btn-primary" type="submit">
            Submit for review
          </button>
        </form>
      )}
    </div>
  );
}
