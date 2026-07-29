"use client";

import type { FormEvent } from "react";
import { profile } from "@/lib/portfolio";

export default function ContactForm() {
  const onSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const name = String(form.get("name") || "").trim();
    const email = String(form.get("email") || "").trim();
    const inquiry = String(form.get("inquiry") || "Project inquiry").trim();
    const details = String(form.get("details") || "").trim();
    const subject = encodeURIComponent(`${inquiry} from ${name}`);
    const body = encodeURIComponent(
      `Name: ${name}\nEmail: ${email}\n\nProject details:\n${details}`,
    );

    window.location.href = `mailto:${profile.email}?subject=${subject}&body=${body}`;
  };

  return (
    <form className="contact-form" onSubmit={onSubmit}>
      <div className="form-row">
        <label>
          Name
          <input name="name" type="text" autoComplete="name" placeholder="Your name" required />
        </label>
        <label>
          Email
          <input
            name="email"
            type="email"
            autoComplete="email"
            placeholder="you@company.com"
            required
          />
        </label>
      </div>
      <label>
        What do you need?
        <select name="inquiry" defaultValue="Google Workspace project">
          <option>Google Workspace project</option>
          <option>Email migration</option>
          <option>DNS or deliverability help</option>
          <option>Backend or automation project</option>
          <option>General collaboration</option>
        </select>
      </label>
      <label>
        Short brief
        <textarea
          name="details"
          rows={5}
          placeholder="Current setup, desired outcome, and timeline."
          required
        />
      </label>
      <div className="contact-form-foot">
        <p>Opens your email app. Nothing is stored.</p>
        <button className="button" type="submit">
          Open email draft
        </button>
      </div>
    </form>
  );
}
