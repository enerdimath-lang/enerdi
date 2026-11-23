"use client";

import { useState, type FormEvent } from "react";

type Fields = {
  name: string;
  email: string;
  company: string;
  phone: string;
  message: string;
};

type Errors = Partial<Record<keyof Fields, string>>;

const emptyFields: Fields = { name: "", email: "", company: "", phone: "", message: "" };

function validate(fields: Fields): Errors {
  const errors: Errors = {};
  if (!fields.name.trim()) errors.name = "Please enter your name.";
  if (!fields.email.trim()) {
    errors.email = "Please enter your email address.";
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(fields.email.trim())) {
    errors.email = "Please enter a valid email address.";
  }
  if (!fields.message.trim()) {
    errors.message = "Please tell us what you are working on.";
  }
  return errors;
}

/**
 * Sends the enquiry to `src/app/api/contact/route.ts`, which emails it.
 * Returns an error message, or null when the email was sent.
 */
async function submitEnquiry(
  fields: Fields,
  website: string,
): Promise<string | null> {
  const fallback = "Your message could not be sent. Please try again.";
  try {
    const response = await fetch("/api/contact", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...fields, website }),
    });
    if (response.ok) return null;
    const data = await response.json().catch(() => null);
    return typeof data?.error === "string" ? data.error : fallback;
  } catch {
    return fallback;
  }
}

const inputClass =
  "mt-2 block w-full border border-line bg-white px-4 py-3 text-base text-ink placeholder:text-muted/60 focus:border-navy-800 focus:outline-none focus-visible:outline-3 focus-visible:outline-sky-brand";

export function ContactForm() {
  const [fields, setFields] = useState<Fields>(emptyFields);
  const [errors, setErrors] = useState<Errors>({});
  const [sent, setSent] = useState(false);
  const [sending, setSending] = useState(false);
  const [sendError, setSendError] = useState<string | null>(null);
  // Hidden "website" field: people leave it empty, bots fill it in.
  const [website, setWebsite] = useState("");

  function update(key: keyof Fields, value: string) {
    setFields((current) => ({ ...current, [key]: value }));
    if (errors[key]) {
      setErrors((current) => ({ ...current, [key]: undefined }));
    }
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const found = validate(fields);
    setErrors(found);
    if (Object.keys(found).length > 0) return;

    setSending(true);
    setSendError(null);
    const problem = await submitEnquiry(fields, website);
    setSending(false);

    if (problem) {
      setSendError(problem);
      return;
    }
    setSent(true);
  }

  if (sent) {
    return (
      <div
        role="status"
        className="border-l-[6px] border-sky-brand bg-paper p-8"
      >
        <h2 className="text-2xl font-extrabold text-navy-800">Thank you.</h2>
        <p className="mt-3 text-lg leading-relaxed text-muted">
          We have your message and will get back to you soon.
        </p>
        <button
          type="button"
          onClick={() => {
            setFields(emptyFields);
            setSent(false);
          }}
          className="mt-6 font-semibold text-navy-800 underline underline-offset-4 hover:text-navy-700"
        >
          Send another message
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="grid gap-6">
      <div className="grid gap-6 sm:grid-cols-2">
        <div>
          <label htmlFor="name" className="font-semibold text-navy-800">
            Name
          </label>
          <input
            id="name"
            name="name"
            type="text"
            autoComplete="name"
            value={fields.name}
            onChange={(event) => update("name", event.target.value)}
            aria-invalid={Boolean(errors.name)}
            aria-describedby={errors.name ? "name-error" : undefined}
            className={inputClass}
          />
          {errors.name && (
            <p id="name-error" className="mt-2 text-sm text-red-700">
              {errors.name}
            </p>
          )}
        </div>

        <div>
          <label htmlFor="email" className="font-semibold text-navy-800">
            Email
          </label>
          <input
            id="email"
            name="email"
            type="email"
            autoComplete="email"
            value={fields.email}
            onChange={(event) => update("email", event.target.value)}
            aria-invalid={Boolean(errors.email)}
            aria-describedby={errors.email ? "email-error" : undefined}
            className={inputClass}
          />
          {errors.email && (
            <p id="email-error" className="mt-2 text-sm text-red-700">
              {errors.email}
            </p>
          )}
        </div>
      </div>

      <div className="grid gap-6 sm:grid-cols-2">
        <div>
          <label htmlFor="company" className="font-semibold text-navy-800">
            Company <span className="font-normal text-muted">(optional)</span>
          </label>
          <input
            id="company"
            name="company"
            type="text"
            autoComplete="organization"
            value={fields.company}
            onChange={(event) => update("company", event.target.value)}
            className={inputClass}
          />
        </div>
        <div>
          <label htmlFor="phone" className="font-semibold text-navy-800">
            Phone <span className="font-normal text-muted">(optional)</span>
          </label>
          <input
            id="phone"
            name="phone"
            type="tel"
            autoComplete="tel"
            value={fields.phone}
            onChange={(event) => update("phone", event.target.value)}
            className={inputClass}
          />
        </div>
      </div>

      <div>
        <label htmlFor="message" className="font-semibold text-navy-800">
          What are you working on?
        </label>
        <textarea
          id="message"
          name="message"
          rows={6}
          placeholder="Share your challenges and problems."
          value={fields.message}
          onChange={(event) => update("message", event.target.value)}
          aria-invalid={Boolean(errors.message)}
          aria-describedby={errors.message ? "message-error" : undefined}
          className={inputClass}
        />
        {errors.message && (
          <p id="message-error" className="mt-2 text-sm text-red-700">
            {errors.message}
          </p>
        )}
      </div>

      <div aria-hidden="true" className="hidden">
        <label htmlFor="website">Website</label>
        <input
          id="website"
          name="website"
          type="text"
          tabIndex={-1}
          autoComplete="off"
          value={website}
          onChange={(event) => setWebsite(event.target.value)}
        />
      </div>

      {sendError && (
        <p
          role="alert"
          className="border-l-[6px] border-red-700 bg-red-50 px-5 py-4 text-red-800"
        >
          {sendError}
        </p>
      )}

      <div>
        <button
          type="submit"
          disabled={sending}
          className="bg-navy-800 px-8 py-4 text-base font-semibold text-white transition-colors hover:bg-navy-700 disabled:cursor-wait disabled:opacity-70"
        >
          {sending ? "Sending…" : "Send message"}
        </button>
      </div>
    </form>
  );
}
