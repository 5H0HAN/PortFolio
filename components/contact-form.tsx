"use client";

import { useRef, useState, type FormEvent } from "react";
import {
  buildContactMailto,
  CONTACT_INQUIRIES,
  type ContactInquiry,
} from "@/lib/contact";
import { profile } from "@/lib/portfolio";

type ContactFormProps = {
  deliveryEnabled: boolean;
};

type SubmissionState =
  | { status: "idle" }
  | { status: "sending" }
  | { status: "success"; message: string }
  | { fallbackUrl: string; message: string; status: "error" };

export default function ContactForm({ deliveryEnabled }: ContactFormProps) {
  const [submission, setSubmission] = useState<SubmissionState>({ status: "idle" });
  const submittingRef = useRef(false);

  const onSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (submittingRef.current) return;
    const formElement = event.currentTarget;
    const form = new FormData(formElement);
    const payload = {
      name: String(form.get("name") || "").trim(),
      email: String(form.get("email") || "").trim(),
      inquiry: String(
        form.get("inquiry") || CONTACT_INQUIRIES[0],
      ).trim() as ContactInquiry,
      details: String(form.get("details") || "").trim(),
      company: String(form.get("company") || "").trim(),
      submissionId: crypto.randomUUID(),
    };
    const fallbackUrl = buildContactMailto(profile.email, payload);

    if (!deliveryEnabled) {
      window.location.href = fallbackUrl;
      return;
    }

    submittingRef.current = true;
    setSubmission({ status: "sending" });
    try {
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const result = (await response.json()) as { error?: string; ok?: boolean };
      if (!response.ok || !result.ok) {
        throw new Error(result.error || "The message could not be delivered.");
      }

      formElement.reset();
      setSubmission({
        status: "success",
        message: "Your message was sent. I’ll reply as soon as possible.",
      });
    } catch (error) {
      setSubmission({
        status: "error",
        message:
          error instanceof Error
            ? error.message
            : "The message could not be delivered.",
        fallbackUrl,
      });
    } finally {
      submittingRef.current = false;
    }
  };

  const isSending = submission.status === "sending";

  return (
    <form className="contact-form" onSubmit={onSubmit}>
      <div className="form-row">
        <label>
          Name
          <input
            name="name"
            type="text"
            autoComplete="name"
            placeholder="Your name"
            minLength={2}
            maxLength={80}
            required
          />
        </label>
        <label>
          Email
          <input
            name="email"
            type="email"
            autoComplete="email"
            placeholder="you@company.com"
            maxLength={254}
            required
          />
        </label>
      </div>
      <label>
        What do you need?
        <select name="inquiry" defaultValue={CONTACT_INQUIRIES[0]}>
          {CONTACT_INQUIRIES.map((inquiry) => (
            <option key={inquiry}>{inquiry}</option>
          ))}
        </select>
      </label>
      <label>
        Short brief
        <textarea
          name="details"
          rows={5}
          placeholder="Current setup, desired outcome, and timeline."
          minLength={20}
          maxLength={4_000}
          required
        />
      </label>

      <label className="contact-honeypot" aria-hidden="true">
        Company website
        <input name="company" type="text" tabIndex={-1} autoComplete="off" />
      </label>

      {submission.status === "success" ? (
        <p className="contact-form-message is-success" role="status">
          {submission.message}
        </p>
      ) : null}
      {submission.status === "error" ? (
        <p className="contact-form-message is-error" role="alert">
          {submission.message}{" "}
          <a href={submission.fallbackUrl}>Open an email draft instead.</a>
        </p>
      ) : null}

      <div className="contact-form-foot">
        <p>
          {deliveryEnabled
            ? "Sent securely to my inbox. Nothing is published."
            : "Opens your email app. Nothing is stored."}
        </p>
        <button className="button" type="submit" disabled={isSending}>
          {isSending
            ? "Sending…"
            : deliveryEnabled
              ? "Send project brief"
              : "Open email draft"}
        </button>
      </div>
    </form>
  );
}
