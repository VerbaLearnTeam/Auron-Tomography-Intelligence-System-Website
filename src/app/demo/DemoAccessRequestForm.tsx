"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  demoAccessRequestSchema,
  demoAccessRequestMessages,
  type DemoAccessRequest
} from "@/lib/forms/schemas";

export default function DemoAccessRequestForm() {
  const [serverMessage, setServerMessage] = useState<string | null>(null);
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    setError,
    reset
  } = useForm<DemoAccessRequest>({
    resolver: zodResolver(demoAccessRequestSchema),
    defaultValues: {
      availability: "No preference"
    }
  });

  async function onSubmit(values: DemoAccessRequest) {
    setServerMessage(null);
    const res = await fetch("/api/demo-access", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(values)
    });
    const json = await res.json().catch(() => null);

    if (!res.ok) {
      if (json?.fieldErrors) {
        Object.entries(json.fieldErrors as Record<string, string>).forEach(([field, message]) => {
          setError(field as keyof DemoAccessRequest, { message });
        });
      }
      setServerMessage(json?.message || demoAccessRequestMessages.genericError);
      return;
    }

    setServerMessage(demoAccessRequestMessages.success);
    reset();
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="form-grid">
      <label className="field">
        <span className="muted">Full name</span>
        <input className="input" placeholder="Full name" {...register("full_name")} />
        {errors.full_name?.message && <span className="error">{errors.full_name.message}</span>}
      </label>

      <label className="field">
        <span className="muted">Email</span>
        <input className="input" type="email" placeholder="Email" {...register("email")} />
        {errors.email?.message && <span className="error">{errors.email.message}</span>}
      </label>

      <label className="field">
        <span className="muted">Role</span>
        <select className="select" {...register("role")}>
          <option value="">Select a role</option>
          <option value="Physician">Physician</option>
          <option value="Radiologist">Radiologist</option>
          <option value="Researcher">Researcher</option>
          <option value="Healthcare Executive">Healthcare Executive</option>
          <option value="Engineer">Engineer</option>
          <option value="Other">Other</option>
        </select>
        {errors.role?.message && <span className="error">{errors.role.message}</span>}
      </label>

      <label className="field">
        <span className="muted">Specialty (optional)</span>
        <input className="input" placeholder="Specialty" {...register("specialty")} />
        {errors.specialty?.message && <span className="error">{errors.specialty.message}</span>}
      </label>

      <label className="field">
        <span className="muted">Institution or organization</span>
        <input className="input" placeholder="Institution" {...register("institution")} />
        {errors.institution?.message && <span className="error">{errors.institution.message}</span>}
      </label>

      <label className="field">
        <span className="muted">Country or region</span>
        <input className="input" placeholder="Country or region" {...register("country_region")} />
        {errors.country_region?.message && <span className="error">{errors.country_region.message}</span>}
      </label>

      <label className="field">
        <span className="muted">What do you want to evaluate?</span>
        <textarea className="textarea" {...register("evaluation_goal")} />
        {errors.evaluation_goal?.message && <span className="error">{errors.evaluation_goal.message}</span>}
      </label>

      <label className="field">
        <span className="muted">Availability (optional)</span>
        <select className="select" {...register("availability")}>
          <option value="No preference">No preference</option>
          <option value="Weekdays">Weekdays</option>
          <option value="Weekends">Weekends</option>
          <option value="Evenings">Evenings</option>
          <option value="Mornings">Mornings</option>
        </select>
      </label>

      <label className="field">
        <span className="muted">
          <input type="checkbox" {...register("ack_prototype_not_medical_advice")} /> I understand this is a prototype
          for evaluation and not medical advice.
        </span>
        {errors.ack_prototype_not_medical_advice?.message && (
          <span className="error">{errors.ack_prototype_not_medical_advice.message}</span>
        )}
      </label>

      <label className="field">
        <span className="muted">
          <input type="checkbox" {...register("ack_no_sharing")} /> I agree not to share prototype materials.
        </span>
        {errors.ack_no_sharing?.message && <span className="error">{errors.ack_no_sharing.message}</span>}
      </label>

      {serverMessage && <div className="notice">{serverMessage}</div>}

      <button className="btn btn-primary" type="submit" disabled={isSubmitting}>
        {isSubmitting ? "Submitting…" : "Request Access"}
      </button>
    </form>
  );
}
