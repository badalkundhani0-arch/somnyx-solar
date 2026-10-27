"use client";

import Link from "next/link";
import type { ReactNode } from "react";

type FieldProps = {
  label: string;
  name: string;
  error?: string;
  hint?: string;
  as?: "input" | "select" | "textarea";
  children?: ReactNode;
  value?: string;
  required?: boolean;
} & Omit<React.InputHTMLAttributes<HTMLInputElement> & React.TextareaHTMLAttributes<HTMLTextAreaElement> & React.SelectHTMLAttributes<HTMLSelectElement>, "value">;

export function Field({ label, name, error, hint, as = "input", children, value, required, ...rest }: FieldProps) {
  const id = `f-${name}`;
  const describedBy = [error ? `${id}-err` : null, hint ? `${id}-hint` : null].filter(Boolean).join(" ") || undefined;
  const common = {
    id,
    name,
    value: value ?? "",
    "aria-invalid": error ? true : undefined,
    "aria-describedby": describedBy,
    "aria-required": required || undefined,
    className: "field",
  };
  return (
    <div>
      <label htmlFor={id} className="field-label">
        {label}
        {required && <span className="ml-1 text-accent" aria-hidden="true">*</span>}
      </label>
      {as === "select" ? (
        <select {...common} {...(rest as React.SelectHTMLAttributes<HTMLSelectElement>)}>
          {children}
        </select>
      ) : as === "textarea" ? (
        <textarea {...common} {...(rest as React.TextareaHTMLAttributes<HTMLTextAreaElement>)} />
      ) : (
        <input {...common} {...(rest as React.InputHTMLAttributes<HTMLInputElement>)} />
      )}
      {hint && !error && (
        <p id={`${id}-hint`} className="mt-1.5 text-xs text-steel">
          {hint}
        </p>
      )}
      {error && (
        <p id={`${id}-err`} className="field-error">
          {error}
        </p>
      )}
    </div>
  );
}

/** Hidden from people and assistive tech; bots tend to fill it. */
export function Honeypot({ id }: { id: string }) {
  return (
    <div aria-hidden="true" className="absolute left-[-9999px] top-auto h-px w-px overflow-hidden">
      <label htmlFor={id}>Website</label>
      <input id={id} name="website" type="text" tabIndex={-1} autoComplete="off" defaultValue="" />
    </div>
  );
}

export function Consent({ checked, onChange, error }: { checked: boolean; onChange: (e: React.ChangeEvent<HTMLInputElement>) => void; error?: string }) {
  return (
    <div>
      <label className="flex cursor-pointer items-start gap-3 text-sm text-silver">
        <input
          type="checkbox"
          name="consent"
          checked={checked}
          onChange={onChange}
          aria-invalid={error ? true : undefined}
          aria-describedby={error ? "consent-err" : undefined}
          className="mt-0.5 h-5 w-5 shrink-0 accent-[#B45309]"
        />
        <span>
          I agree that Somnyx Solar may store and use these details to respond to my enquiry, as described in the{" "}
          <Link href="/privacy" className="text-accent underline-offset-2 hover:underline" target="_blank">
            Privacy Policy
          </Link>
          .
        </span>
      </label>
      {error && (
        <p id="consent-err" className="field-error">
          {error}
        </p>
      )}
    </div>
  );
}

export function FormError({ message }: { message: string | null }) {
  if (!message) return null;
  return (
    <p role="alert" className="mt-6 rounded-xl border border-danger/40 bg-danger/5 px-4 py-3 text-sm text-danger">
      {message}
    </p>
  );
}
