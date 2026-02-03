"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  contactPartnershipsSchema,
  contactMessages,
  type ContactPartnerships
} from "@/lib/forms/schemas";

export default function ContactPartnershipsForm() {
  const [serverMessage, setServerMessage] = useState<string | null>(null);
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    setError,
    reset
  } = useForm<ContactPartnerships>({
    resolver: zodResolver(contactPartnershipsSchema)
  });

  async function onSubmit(values: ContactPartnerships) {
    setServerMessage(null);
    const res = await fetch("/api/contact/partnerships", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(values)
    });
    const json = await res.json().catch(() => null);

    if (!res.ok) {
      if (json?.fieldErrors) {
        Object.entries(json.fieldErrors as Record<string, string>).forEach(([field, message]) => {
          setError(field as keyof ContactPartnerships, { message });
        });
      }
      setServerMessage(json?.message || contactMessages.genericError);
      return;
    }

    setServerMessage(contactMessages.success);
    reset();
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="form-grid">
      <label className="field">
        <span className="muted">Full name</span>
        <input className="input" {...register("full_name")} />
        {errors.full_name?.message && <span className="error">{errors.full_name.message}</span>}
      </label>
      <label className="field">
        <span className="muted">Email</span>
        <input className="input" type="email" {...register("email")} />
        {errors.email?.message && <span className="error">{errors.email.message}</span>}
      </label>
      <label className="field">
        <span className="muted">Organization</span>
        <input className="input" {...register("organization")} />
        {errors.organization?.message && <span className="error">{errors.organization.message}</span>}
      </label>
      <label className="field">
        <span className="muted">Role/title</span>
        <input className="input" {...register("role_title")} />
        {errors.role_title?.message && <span className="error">{errors.role_title.message}</span>}
      </label>
      <label className="field">
        <span className="muted">Interest area</span>
        <select className="select" {...register("interest_area")}>
          <option value="">Select an interest area</option>
          <option value="Clinical validation">Clinical validation</option>
          <option value="Data partnership">Data partnership</option>
          <option value="Technical integration">Technical integration</option>
          <option value="Commercial collaboration">Commercial collaboration</option>
          <option value="Other">Other</option>
        </select>
        {errors.interest_area?.message && <span className="error">{errors.interest_area.message}</span>}
      </label>
      <label className="field">
        <span className="muted">Message</span>
        <textarea className="textarea" {...register("message")} />
        {errors.message?.message && <span className="error">{errors.message.message}</span>}
      </label>

      {serverMessage && <div className="notice">{serverMessage}</div>}

      <button className="btn btn-primary" type="submit" disabled={isSubmitting}>
        {isSubmitting ? "Sending…" : "Send partnership inquiry"}
      </button>
    </form>
  );
}
