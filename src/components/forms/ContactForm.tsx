"use client";

import { useRef, useState } from "react";
import { contactSchema, fieldErrors, CONTACT_TOPICS } from "@/lib/validation";
import { Consent, Field, FormError, Honeypot } from "./parts";
import { EMAILS } from "@/lib/brand";

export function ContactForm({ initialTopic, devMode }: { initialTopic?: string; devMode: boolean }) {
  const startedAt = useRef(Date.now());
  const [values, setValues] = useState<Record<string, string>>({ topic: CONTACT_TOPICS.some((t) => t.value === initialTopic) ? initialTopic! : "sales" });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [state, setState] = useState<"idle" | "sending" | "sent">("idle");
  const [notification, setNotification] = useState<string>("");

  const set = (k: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const val = e.target.type === "checkbox" ? ((e.target as HTMLInputElement).checked ? "yes" : "") : e.target.value;
    setValues((c) => ({ ...c, [k]: val }));
    if (errors[k]) setErrors((c) => ({ ...c, [k]: "" }));
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const parsed = contactSchema.safeParse(values);
    if (!parsed.success) {
      setErrors(fieldErrors(parsed.error));
      setFormError("Check the highlighted fields.");
      return;
    }
    setState("sending");
    setFormError(null);
    try {
      const fd = new FormData();
      Object.entries(values).forEach(([k, v]) => fd.append(k, v));
      fd.append("_t", String(startedAt.current));
      fd.append("website", (document.getElementById("contact-website") as HTMLInputElement)?.value ?? "");
      const res = await fetch("/api/contact", { method: "POST", body: fd });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        if (data.fields) setErrors(data.fields);
        setFormError(data.error || "Your message could not be sent.");
        setState("idle");
        return;
      }
      setNotification(data.notification);
      setState("sent");
    } catch {
      setFormError(`Network error. Check your connection, or email ${EMAILS.sales}.`);
      setState("idle");
    }
  };

  const topic = CONTACT_TOPICS.find((t) => t.value === values.topic);

  if (state === "sent") {
    return (
      <div className="rounded-[24px] border border-line bg-graphite p-8" role="status">
        <h2 className="display-s">Message sent</h2>
        <p className="mt-3 text-silver">
          Thanks, {values.name}. Your message is with our {topic?.label.toLowerCase().replace(" enquiries", "")} team, and we will reply to {values.email}.
        </p>
        {devMode && notification !== "sent" && (
          <p className="mt-5 rounded-xl border border-warn/30 bg-warn/5 p-4 text-sm text-warn">
            Setup note (shown only outside production): the message is saved in the admin dashboard, but email delivery is {notification === "failed" ? "failing" : "not configured"}.
          </p>
        )}
        <button type="button" className="btn btn-ghost mt-6" onClick={() => (setValues({ topic: values.topic }), setState("idle"), (startedAt.current = Date.now()))}>
          Send another message
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={submit} noValidate className="relative grid gap-5">
      <Honeypot id="contact-website" />
      <fieldset>
        <legend className="field-label">What is your enquiry about?</legend>
        <div className="grid gap-2 sm:grid-cols-3">
          {CONTACT_TOPICS.map((t) => (
            <label
              key={t.value}
              className={`cursor-pointer rounded-xl border p-4 text-sm transition-colors ${values.topic === t.value ? "border-cyan bg-cyan/5 text-white" : "border-line-strong text-silver hover:border-silver"}`}
            >
              <input type="radio" name="topic" value={t.value} checked={values.topic === t.value} onChange={set("topic")} className="sr-only" />
              <span className="block font-display text-base">{t.label.split(" enquiries")[0].replace(" and customer", "").replace(" and supplier", "").replace("Engineering and technical", "Engineering")}</span>
              <span className="mt-1 block text-xs text-steel">{EMAILS[t.value]}</span>
            </label>
          ))}
        </div>
      </fieldset>
      <div className="grid gap-5 md:grid-cols-2">
        <Field label="Your name" name="name" value={values.name} onChange={set("name")} error={errors.name} autoComplete="name" required />
        <Field label="Company" name="company" value={values.company} onChange={set("company")} error={errors.company} autoComplete="organization" />
        <Field label="Email" name="email" type="email" value={values.email} onChange={set("email")} error={errors.email} autoComplete="email" required />
        <Field label="Phone or WhatsApp" name="phone" type="tel" value={values.phone} onChange={set("phone")} error={errors.phone} autoComplete="tel" />
      </div>
      <Field label="Message" name="message" as="textarea" rows={6} value={values.message} onChange={set("message")} error={errors.message} required />
      <Consent checked={values.consent === "yes"} onChange={set("consent")} error={errors.consent} />
      <FormError message={formError} />
      <div>
        <button type="submit" className="btn btn-primary" disabled={state === "sending"} aria-busy={state === "sending"}>
          {state === "sending" ? "Sending message" : `Send to ${topic?.label.split(" ")[0].toLowerCase()} team`}
        </button>
      </div>
    </form>
  );
}
