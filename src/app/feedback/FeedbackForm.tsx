"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { appFeedbackSchema, appFeedbackMessages, type AppFeedback } from "@/lib/forms/schemas";

export default function FeedbackForm() {
  const [serverMessage, setServerMessage] = useState<string | null>(null);
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
    setError,
    reset
  } = useForm<AppFeedback>({
    resolver: zodResolver(appFeedbackSchema),
    defaultValues: {
      request_follow_up: false
    }
  });

  const requestFollowUp = watch("request_follow_up");

  async function onSubmit(values: AppFeedback) {
    setServerMessage(null);
    const res = await fetch("/api/feedback", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(values)
    });
    const json = await res.json().catch(() => null);

    if (!res.ok) {
      if (json?.fieldErrors) {
        Object.entries(json.fieldErrors as Record<string, string>).forEach(([field, message]) => {
          setError(field as keyof AppFeedback, { message });
        });
      }
      setServerMessage(json?.message || appFeedbackMessages.genericError);
      return;
    }

    setServerMessage(appFeedbackMessages.success);
    reset();
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="form-grid">
      <label className="field">
        <span className="muted">Case ID (optional)</span>
        <input className="input" {...register("case_id")} />
        {errors.case_id?.message && <span className="error">{errors.case_id.message}</span>}
      </label>

      <label className="field">
        <span className="muted">Overall workflow rating</span>
        <select className="select" {...register("workflow_rating")}>
          <option value="">Select a rating</option>
          <option value="1">1</option>
          <option value="2">2</option>
          <option value="3">3</option>
          <option value="4">4</option>
          <option value="5">5</option>
        </select>
        {errors.workflow_rating?.message && <span className="error">{errors.workflow_rating.message}</span>}
      </label>

      <label className="field">
        <span className="muted">What felt most useful?</span>
        <textarea className="textarea" {...register("most_useful")} />
        {errors.most_useful?.message && <span className="error">{errors.most_useful.message}</span>}
      </label>

      <label className="field">
        <span className="muted">What felt confusing or missing?</span>
        <textarea className="textarea" {...register("confusing_or_missing")} />
        {errors.confusing_or_missing?.message && <span className="error">{errors.confusing_or_missing.message}</span>}
      </label>

      <label className="field">
        <span className="muted">Would you use this in your workflow?</span>
        <select className="select" {...register("would_use_in_workflow")}>
          <option value="">Select an option</option>
          <option value="Yes">Yes</option>
          <option value="No">No</option>
          <option value="Not sure">Not sure</option>
        </select>
        {errors.would_use_in_workflow?.message && (
          <span className="error">{errors.would_use_in_workflow.message}</span>
        )}
      </label>

      <label className="field">
        <span className="muted">
          <input type="checkbox" {...register("request_follow_up")} /> Request follow-up
        </span>
      </label>

      {requestFollowUp && (
        <label className="field">
          <span className="muted">Follow-up email</span>
          <input className="input" type="email" {...register("follow_up_email")} />
          {errors.follow_up_email?.message && <span className="error">{errors.follow_up_email.message}</span>}
        </label>
      )}

      {serverMessage && <div className="notice">{serverMessage}</div>}

      <button className="btn btn-primary" type="submit" disabled={isSubmitting}>
        {isSubmitting ? "Sending…" : "Send feedback"}
      </button>
    </form>
  );
}
