import "server-only";
import { Resend } from "resend";

export function emailConfigured() {
  return Boolean(process.env.RESEND_API_KEY && process.env.EMAIL_FROM);
}

export type SendResult = { status: "sent" } | { status: "not_configured" } | { status: "failed"; error: string };

export async function sendEmail(opts: { to: string; subject: string; text: string; replyTo?: string }): Promise<SendResult> {
  if (!emailConfigured()) return { status: "not_configured" };
  try {
    const resend = new Resend(process.env.RESEND_API_KEY);
    const { error } = await resend.emails.send({
      from: process.env.EMAIL_FROM!,
      to: opts.to,
      subject: opts.subject,
      text: opts.text,
      replyTo: opts.replyTo,
    });
    if (error) return { status: "failed", error: error.message };
    return { status: "sent" };
  } catch (e) {
    return { status: "failed", error: e instanceof Error ? e.message : String(e) };
  }
}

export function lines(obj: Record<string, unknown>) {
  return Object.entries(obj)
    .filter(([, v]) => v !== undefined && v !== null && v !== "")
    .map(([k, v]) => `${k}: ${v}`)
    .join("\n");
}
