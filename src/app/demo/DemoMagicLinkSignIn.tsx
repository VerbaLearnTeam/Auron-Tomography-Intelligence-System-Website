"use client";

import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { signIn } from "next-auth/react";

const NOT_WHITELISTED_MSG =
  "This email isn’t approved yet. Request access or contact the team.";

function isValidEmail(email: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
}

function safeCallbackUrl(raw?: string | null) {
  if (!raw) return "/walkthrough";
  if (!raw.startsWith("/")) return "/walkthrough";
  if (raw.startsWith("//")) return "/walkthrough";
  return raw;
}

export default function DemoMagicLinkSignIn() {
  const sp = useSearchParams();
  const callbackUrl = useMemo(
    () => safeCallbackUrl(sp.get("callbackUrl") || sp.get("next")),
    [sp]
  );
  const prefillEmail = useMemo(() => (sp.get("email") || "").trim(), [sp]);

  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "checking" | "sending" | "sent">("idle");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (prefillEmail && !email) setEmail(prefillEmail);
  }, [prefillEmail, email]);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    const clean = email.trim().toLowerCase();
    if (!isValidEmail(clean)) {
      setError("Enter a valid email address.");
      return;
    }

    setStatus("checking");
    try {
      const res = await fetch("/api/allowlist/check", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ email: clean })
      });
      const json = await res.json().catch(() => null);
      if (!res.ok) {
        if (res.status === 403 && json?.code === "NOT_WHITELISTED") {
          setError(NOT_WHITELISTED_MSG);
        } else {
          setError(json?.message || "Something went wrong. Please try again.");
        }
        setStatus("idle");
        return;
      }
    } catch {
      setError("Something went wrong. Please try again.");
      setStatus("idle");
      return;
    }

    setStatus("sending");
    const result = await signIn("resend", {
      email: clean,
      callbackUrl,
      redirect: false
    });

    if (result?.error) {
      if (result.error === "AccessDenied") {
        setError(NOT_WHITELISTED_MSG);
      } else {
        setError("Something went wrong. Please try again.");
      }
      setStatus("idle");
      return;
    }

    setStatus("sent");
  }

  return (
    <form onSubmit={onSubmit} className="form-grid" style={{ maxWidth: 520 }}>
      <label className="field">
        <span className="muted">Email</span>
        <input
          className="input"
          type="email"
          placeholder="name@hospital.org"
          autoComplete="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
      </label>

      {error && <div className="notice">{error}</div>}

      {status === "sent" ? (
        <div className="success">Check your email for a sign-in link…</div>
      ) : (
        <button className="btn btn-primary" type="submit" disabled={status !== "idle"}>
          {status === "checking"
            ? "Checking access…"
            : status === "sending"
              ? "Sending link…"
              : "Email me a sign-in link"}
        </button>
      )}

      <div className="muted" style={{ fontSize: 12 }}>
        After sign-in you will be sent to: <code>{callbackUrl}</code>
      </div>
    </form>
  );
}
