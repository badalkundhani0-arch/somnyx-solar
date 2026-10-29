"use client";
import { Verification } from "./Verification";

import Link from "next/link";
import { useMemo, useRef, useState } from "react";
import { rfqSchema, fieldErrors, VARIANTS } from "@/lib/validation";
import { attachFiles, type UploadMode } from "@/lib/upload-client";
import { EMAILS } from "@/lib/brand";
import { Field, Honeypot, Consent, FormError } from "./parts";

const STEPS = [
  { title: "Company", fields: ["company", "contactName", "email", "phone", "country"] },
  { title: "Product", fields: ["variant", "currentRating", "quantity", "cableLength", "cableSection", "connectorType", "standard"] },
  { title: "Delivery", fields: ["deliveryLocation", "deliveryDate", "requirements"] },
  { title: "Review", fields: ["attachments", "consent"] },
] as const;

const COUNTRIES = ["India", "United Arab Emirates", "Saudi Arabia", "United States", "United Kingdom", "Germany", "Spain", "Italy", "Turkey", "Vietnam", "Bangladesh", "Sri Lanka", "Nepal", "Egypt", "South Africa", "Brazil", "Australia"];
const RATING: Record<string, string> = { "sjb-1525": "25 A", "sjb-1530": "30 A", "sjb-1535": "35 A" };

type Values = Record<string, string>;
type Result = { reference: string; confirmationSent: boolean; notification: string; email: string };

export function RfqForm({ initialVariant, intent, uploadMode, devMode }: { initialVariant?: string; intent: "quotation" | "specifications"; uploadMode: UploadMode; devMode: boolean }) {
  const [attempt, setAttempt] = useState(0);
  const formRef = useRef<HTMLFormElement>(null);
  const startedAt = useRef(Date.now());
  const top = useRef<HTMLDivElement>(null);
  const [step, setStep] = useState(0);
  const [values, setValues] = useState<Values>(() => {
    const v = initialVariant && initialVariant in RATING ? initialVariant : "";
    return {
      intent,
      variant: v,
      currentRating: v ? RATING[v] : "",
      cableLength: "1400 mm per polarity",
      cableSection: "4 mm²",
      standard: "IEC/EN 62790",
      consent: "",
    };
  });
  const [files, setFiles] = useState<File[]>([]);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [progress, setProgress] = useState<number | null>(null);
  const [result, setResult] = useState<Result | null>(null);

  const set = (k: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const val = e.target.type === "checkbox" ? ((e.target as HTMLInputElement).checked ? "yes" : "") : e.target.value;
    setValues((cur) => {
      const n = { ...cur, [k]: val };
      if (k === "variant" && RATING[val]) n.currentRating = RATING[val];
      return n;
    });
    if (errors[k]) setErrors((cur) => ({ ...cur, [k]: "" }));
  };

  const validateStep = (i: number) => {
    const parsed = rfqSchema.safeParse(values);
    const all = parsed.success ? {} : fieldErrors(parsed.error);
    const own = Object.fromEntries(Object.entries(all).filter(([k]) => (STEPS[i].fields as readonly string[]).includes(k)));
    if (i === 3 && files.length > 5) own.attachments = "Attach up to 5 files.";
    setErrors(own);
    return Object.keys(own).length === 0;
  };

  const go = (i: number) => {
    setStep(i);
    setFormError(null);
    requestAnimationFrame(() => top.current?.scrollIntoView({ behavior: "smooth", block: "start" }));
  };

  const next = () => {
    if (validateStep(step)) go(step + 1);
    else setFormError("Check the highlighted fields.");
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (step < 3) return next();
    for (let i = 0; i < 4; i++) {
      if (!validateStep(i)) {
        if (i !== 3) go(i);
        setFormError("Check the highlighted fields.");
        return;
      }
    }
    setSubmitting(true);
    setFormError(null);
    try {
      const fd = new FormData();
      Object.entries(values).forEach(([k, v]) => fd.append(k, v));
      fd.append("cf-turnstile-response", String(new FormData(formRef.current!).get("cf-turnstile-response") || ""));
      fd.append("_t", String(startedAt.current));
      fd.append("website", (document.getElementById("rfq-website") as HTMLInputElement)?.value ?? "");
      if (files.length) {
        setProgress(0);
        await attachFiles(fd, "attachments", files, uploadMode, "private/rfq/uploads", "documents", setProgress);
      }
      const res = await fetch("/api/rfq", { method: "POST", body: fd });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        if (data.fields) {
          setErrors(data.fields);
          const first = STEPS.findIndex((s) => Object.keys(data.fields).some((f) => (s.fields as readonly string[]).includes(f)));
          if (first >= 0 && first !== step) go(first);
        }
        setFormError(data.error || "Your request could not be sent. Please try again.");
        return;
      }
      setResult({ reference: data.reference, confirmationSent: data.confirmationSent, notification: data.notification, email: values.email });
      requestAnimationFrame(() => top.current?.scrollIntoView({ behavior: "smooth", block: "start" }));
    } catch (err) {
      setFormError(err instanceof Error ? `${err.message} You can also email ${EMAILS.sales}.` : `Network error. Check your connection, or email ${EMAILS.sales}.`);
    } finally {
      setAttempt(a => a + 1);
      setSubmitting(false);
      setProgress(null);
    }
  };

  const summary = useMemo(
    () => [
      ["Company", values.company],
      ["Contact", `${values.contactName ?? ""}, ${values.email ?? ""}`],
      ["Variant", VARIANTS.find((v) => v.value === values.variant)?.label],
      ["Quantity", values.quantity ? `${Number(values.quantity).toLocaleString("en-IN")} complete sets` : ""],
      ["Delivery", [values.deliveryLocation, values.deliveryDate].filter(Boolean).join(", ")],
    ],
    [values],
  );

  if (result) {
    return (
      <div ref={top} className="scroll-mt-28 rounded-[28px] border border-line bg-graphite p-8 md:p-12" role="status">
        <div className="flex h-14 w-14 items-center justify-center rounded-full bg-cyan/10 text-accent">
          <svg viewBox="0 0 24 24" className="h-7 w-7" aria-hidden="true">
            <path d="M5 12.5l4.5 4.5L19 7.5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>
        <h2 className="display-s mt-6">Request received</h2>
        <p className="mt-3 text-silver">
          Your {values.intent === "specifications" ? "specification request" : "quotation request"} is saved under reference{" "}
          <strong className="font-display text-white">{result.reference}</strong>. Please quote it in any correspondence.
        </p>
        {result.confirmationSent ? (
          <p className="mt-3 text-silver">A confirmation has been sent to {result.email}.</p>
        ) : (
          <p className="mt-3 text-silver">Our sales team will reply from {EMAILS.sales}.</p>
        )}
        {devMode && result.notification !== "sent" && (
          <p className="mt-6 rounded-xl border border-warn/30 bg-warn/5 p-4 text-sm text-warn">
            Setup note (shown only outside production): email notifications are {result.notification === "failed" ? "failing" : "not configured"}. The enquiry is saved in the
            admin dashboard. Set RESEND_API_KEY and EMAIL_FROM to deliver it to {EMAILS.sales}.
          </p>
        )}
        <div className="mt-8 flex flex-wrap gap-3">
          <Link href="/products" className="btn btn-ghost">
            Back to products
          </Link>
          <Link href="/" className="btn btn-ghost">
            Home
          </Link>
        </div>
      </div>
    );
  }

  return (
    <form ref={formRef} onSubmit={submit} noValidate className="relative">
      <div ref={top} className="scroll-mt-28" />
      {/* progress */}
      <ol className="mb-10 grid grid-cols-4 gap-2" aria-label="Form progress">
        {STEPS.map((s, i) => (
          <li key={s.title}>
            <button
              type="button"
              disabled={i > step}
              onClick={() => i < step && go(i)}
              aria-current={i === step ? "step" : undefined}
              className="w-full text-left disabled:cursor-default"
            >
              <span className="block h-1 overflow-hidden rounded-full bg-line">
                <span className={`block h-full bg-cyan transition-transform duration-700 ease-out-expo ${i <= step ? "translate-x-0" : "-translate-x-full"}`} />
              </span>
              <span className={`mt-2 block whitespace-nowrap text-xs sm:text-sm ${i === step ? "text-white" : "text-steel"}`}>
                <span className="tabular-nums">{i + 1}.</span> {s.title}
              </span>
            </button>
          </li>
        ))}
      </ol>

      <Honeypot id="rfq-website" />

      <div key={step} className="animate-[fadein_0.45s_ease]">
        {step === 0 && (
          <fieldset className="grid gap-5 md:grid-cols-2">
            <legend className="display-s mb-6">Company information</legend>
            <Field label="Company name" name="company" value={values.company} onChange={set("company")} error={errors.company} autoComplete="organization" required />
            <Field label="Contact person" name="contactName" value={values.contactName} onChange={set("contactName")} error={errors.contactName} autoComplete="name" required />
            <Field label="Business email" name="email" type="email" value={values.email} onChange={set("email")} error={errors.email} autoComplete="email" required />
            <Field label="Mobile / WhatsApp" name="phone" type="tel" value={values.phone} onChange={set("phone")} error={errors.phone} autoComplete="tel" placeholder="+91 98765 43210" required />
            <Field label="Country" name="country" value={values.country} onChange={set("country")} error={errors.country} autoComplete="country-name" list="countries" required />
            <datalist id="countries">
              {COUNTRIES.map((c) => (
                <option key={c} value={c} />
              ))}
            </datalist>
          </fieldset>
        )}

        {step === 1 && (
          <fieldset className="grid gap-5 md:grid-cols-2">
            <legend className="display-s mb-6">Product requirements</legend>
            <Field label="Product variant" name="variant" as="select" value={values.variant} onChange={set("variant")} error={errors.variant} required>
              <option value="">Choose a variant</option>
              {VARIANTS.map((v) => (
                <option key={v.value} value={v.value}>
                  {v.label}
                </option>
              ))}
            </Field>
            <Field label="Required current rating" name="currentRating" value={values.currentRating} onChange={set("currentRating")} error={errors.currentRating} placeholder="e.g. 30 A" required />
            <Field label="Quantity in complete sets" name="quantity" type="number" inputMode="numeric" min={1} value={values.quantity} onChange={set("quantity")} error={errors.quantity} hint="One set = one box with both cable assemblies" required />
            <Field label="Cable length" name="cableLength" value={values.cableLength} onChange={set("cableLength")} error={errors.cableLength} />
            <Field label="Cable cross-section" name="cableSection" as="select" value={values.cableSection} onChange={set("cableSection")} error={errors.cableSection}>
              <option>4 mm²</option>
              <option>6 mm²</option>
              <option>2.5 mm²</option>
              <option>Other (describe in requirements)</option>
            </Field>
            <Field label="Connector type" name="connectorType" value={values.connectorType} onChange={set("connectorType")} error={errors.connectorType} placeholder="Connector make and model you use" />
            <div className="md:col-span-2">
              <Field label="Required technical standard or certification" name="standard" value={values.standard} onChange={set("standard")} error={errors.standard} hint="For example IEC/EN 62790, UL 3730 or BIS requirements" />
            </div>
          </fieldset>
        )}

        {step === 2 && (
          <fieldset className="grid gap-5 md:grid-cols-2">
            <legend className="display-s mb-6">Delivery and details</legend>
            <Field label="Delivery location" name="deliveryLocation" value={values.deliveryLocation} onChange={set("deliveryLocation")} error={errors.deliveryLocation} placeholder="City, state, country" required />
            <Field label="Expected delivery date" name="deliveryDate" type="date" value={values.deliveryDate} onChange={set("deliveryDate")} error={errors.deliveryDate} min={new Date().toISOString().slice(0, 10)} />
            <div className="md:col-span-2">
              <Field
                label="Additional technical requirements"
                name="requirements"
                as="textarea"
                rows={6}
                value={values.requirements}
                onChange={set("requirements")}
                error={errors.requirements}
                placeholder="Module type and Isc, bifacial or monofacial, labelling, packaging, annual volumes, timeline"
              />
            </div>
          </fieldset>
        )}

        {step === 3 && (
          <fieldset className="grid gap-8">
            <legend className="display-s mb-6">Attachments and review</legend>
            <div>
              <label className="field-label" htmlFor="attachments">
                Drawings, datasheets or specifications <span className="text-steel">(optional, up to 5 files, 15 MB each)</span>
              </label>
              <label
                htmlFor="attachments"
                className={`flex cursor-pointer flex-col items-center justify-center rounded-2xl border border-dashed px-6 py-10 text-center transition-colors hover:border-cyan ${
                  errors.attachments ? "border-danger" : "border-line-strong"
                }`}
              >
                <span className="font-display text-lg">Choose files</span>
                <span className="mt-1 text-sm text-steel">PDF, DWG, DXF, STEP, images, Office documents or ZIP</span>
                <input
                  id="attachments"
                  type="file"
                  disabled={uploadMode === "unavailable"}
                  multiple
                  className="sr-only"
                  accept=".pdf,.dwg,.dxf,.step,.stp,.png,.jpg,.jpeg,.xlsx,.xls,.docx,.doc,.zip,.csv,.txt"
                  onChange={(e) => {
                    const picked = Array.from(e.target.files ?? []);
                    const tooBig = picked.find((f) => f.size > 15 * 1024 * 1024);
                    setErrors((c) => ({ ...c, attachments: tooBig ? `${tooBig.name} is larger than 15 MB.` : "" }));
                    setFiles((cur) => [...cur, ...picked.filter((f) => f.size <= 15 * 1024 * 1024)].slice(0, 5));
                    e.target.value = "";
                  }}
                />
              </label>
              {errors.attachments && <p className="field-error">{errors.attachments}</p>}
              {uploadMode === "unavailable" && <p className="mt-2 text-sm text-warn">Uploads are unavailable right now. Email files to {EMAILS.sales} with your reference.</p>}
              {files.length > 0 && (
                <ul className="mt-3 divide-y divide-line rounded-xl border border-line">
                  {files.map((f, i) => (
                    <li key={f.name + i} className="flex items-center justify-between gap-3 px-4 py-3 text-sm">
                      <span className="truncate">{f.name}</span>
                      <span className="flex shrink-0 items-center gap-4 text-steel">
                        {(f.size / 1024 / 1024).toFixed(1)} MB
                        <button type="button" className="text-silver hover:text-danger" onClick={() => setFiles((cur) => cur.filter((_, j) => j !== i))} aria-label={`Remove ${f.name}`}>
                          Remove
                        </button>
                      </span>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            <dl className="divide-y divide-line rounded-2xl border border-line">
              {summary.map(([k, v]) => (
                <div key={k} className="grid grid-cols-[8rem_1fr] gap-4 px-5 py-3 text-sm">
                  <dt className="text-steel">{k}</dt>
                  <dd className="text-white">{v || "—"}</dd>
                </div>
              ))}
            </dl>

            <Consent checked={values.consent === "yes"} onChange={set("consent")} error={errors.consent} />
          </fieldset>
        )}
      </div>

      <Verification action="rfq" attempt={attempt} />
      <FormError message={formError} />

      <div className="mt-10 flex items-center justify-between gap-4 border-t border-line pt-6">
        {step > 0 ? (
          <button type="button" className="btn btn-ghost" onClick={() => go(step - 1)}>
            Back
          </button>
        ) : (
          <span />
        )}
        {step < 3 ? (
          <button type="button" className="btn btn-primary" onClick={next}>
            Continue to {STEPS[step + 1].title.toLowerCase()}
          </button>
        ) : (
          <button type="submit" className="btn btn-primary" disabled={submitting} aria-busy={submitting}>
            {submitting ? (progress !== null && progress < 100 ? `Uploading ${progress}%` : "Sending request") : values.intent === "specifications" ? "Send specification request" : "Send quotation request"}
          </button>
        )}
      </div>
    </form>
  );
}
