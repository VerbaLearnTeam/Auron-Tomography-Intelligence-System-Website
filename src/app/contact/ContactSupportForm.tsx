"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { contactSupportSchema, contactMessages, type ContactSupport } from "@/lib/forms/schemas";

export default function ContactSupportForm() {
  const [serverMessage, setServerMessage] = useState<string | null>(null);
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    setError,
    reset
  } = useForm<ContactSupport>({
    resolver: zodResolver(contactSupportSchema)
  });

  async function onSubmit(values: ContactSupport) {
    setServerMessage(null);
    const res = await fetch("/api/contact/support", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(values)
    });
    const json = await res.json().catch(() => null);

    if (!res.ok) {
      if (json?.fieldErrors) {
        Object.entries(json.fieldErrors as Record<string, string>).forEach(([field, message]) => {
          setError(field as keyof ContactSupport, { message });
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
        <span className="muted">Topic</span>
        <select className="select" {...register("topic")}>
          <option value="">Select a topic</option>
          <option value="Demo access">Demo access</option>
          <option value="Scan submission">Scan submission</option>
          <option value="Other">Other</option>
        </select>
        {errors.topic?.message && <span className="error">{errors.topic.message}</span>}
      </label>
      <label className="field">
        <span className="muted">Message</span>
        <textarea className="textarea" {...register("message")} />
        {errors.message?.message && <span className="error">{errors.message.message}</span>}
      </label>

      {serverMessage && <div className="notice">{serverMessage}</div>}

      <button className="btn btn-primary" type="submit" disabled={isSubmitting}>
        {isSubmitting ? "Sending…" : "Send message"}
      </button>
    </form>
  );
}
