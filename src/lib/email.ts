import "server-only";


export function emailConfigured() {
  return Boolean(process.env.RESEND_API_KEY && process.env.EMAIL_FROM);
}

export type SendResult = { status: "sent" } | { status: "not_configured" } | { status: "failed"; error: string };

export async function sendEmail(opts: { to: string; subject: string; text: string; replyTo?: string; idempotencyKey?: string }): Promise<SendResult> {
  if (!emailConfigured()) return { status: "not_configured" };
  try {
    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: { Authorization: `Bearer ${process.env.RESEND_API_KEY}`, "Content-Type": "application/json", ...(opts.idempotencyKey ? { "Idempotency-Key": opts.idempotencyKey } : {}) },
      body: JSON.stringify({ from: process.env.EMAIL_FROM, to: opts.to, subject: opts.subject, text: opts.text, reply_to: opts.replyTo }),
      signal: AbortSignal.timeout(8000),
    });
    if (!response.ok) return { status: "failed", error: `Email provider status ${response.status}` };
    return { status: "sent" };
  } catch (e) {
    return { status: "failed", error: "Email provider unavailable" };
  }
}

export function lines(obj: Record<string, unknown>) {
  return Object.entries(obj)
    .filter(([, v]) => v !== undefined && v !== null && v !== "")
    .map(([k, v]) => `${k}: ${v}`)
    .join("\n");
}
