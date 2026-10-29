import "server-only";
import { NextResponse } from "next/server";
import { clientKey, rateLimit } from "./ratelimit";

export async function verifyTurnstile(token: unknown, action: string, hostnames: string[]) {
  if (typeof token !== "string" || !token || token.length > 2048) return false;
  const response = await fetch("https://challenges.cloudflare.com/turnstile/v0/siteverify", {
    method: "POST", headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ secret: process.env.TURNSTILE_SECRET_KEY, response: token }), signal: AbortSignal.timeout(8000),
  });
  if (!response.ok) throw new Error("Verification service unavailable");
  const result = await response.json();
  return result.success === true && result.action === action && hostnames.includes(result.hostname);
}

export function protectedForm(action: "contact" | "rfq", handler: (req: Request) => Promise<Response>) {
  return async (req: Request) => {
    try {
      const origins = (process.env.FORM_ALLOWED_ORIGINS || "https://www.somnyxsolar.com,https://somnyxsolar.com").split(",").map(v => v.trim());
      if (process.env.NODE_ENV !== "production") origins.push("http://localhost:3000");
      const origin = req.headers.get("origin");
      if (!origin || !origins.includes(origin)) return NextResponse.json({ error: "This origin is not allowed." }, { status: 403 });
      // Refuse ephemeral persistence and incomplete security/delivery configuration on Vercel.
      if (process.env.VERCEL && (!process.env.TURSO_DATABASE_URL?.startsWith("libsql://") || !process.env.TURSO_AUTH_TOKEN || !process.env.RESEND_API_KEY || !process.env.EMAIL_FROM || !process.env.TURNSTILE_SECRET_KEY || !process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY || (process.env.SESSION_SECRET?.length || 0) < 32)) {
        return NextResponse.json({ error: "Enquiries are temporarily unavailable. Please email sales@somnyxsolar.com." }, { status: 503 });
      }
      if (!req.headers.get("content-type")?.startsWith("multipart/form-data")) return NextResponse.json({ error: "Use the website form." }, { status: 415 });
      // Streaming cap protects memory even when Content-Length is absent or forged.
      const reader = req.body?.getReader();
      if (!reader) return NextResponse.json({ error: "Empty submission." }, { status: 400 });
      const chunks: Uint8Array[] = [];
      let size = 0;
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        size += value.byteLength;
        if (size > 64 * 1024) {
          await reader.cancel();
          return NextResponse.json({ error: "Submission too large. Email attachments to sales@somnyxsolar.com." }, { status: 413 });
        }
        chunks.push(value);
      }
      if (!(await rateLimit(await clientKey("public-forms"), 8, 3600))) return NextResponse.json({ error: "Too many submissions. Please try again later." }, { status: 429, headers: { "Retry-After": "3600" } });
      const body = Buffer.concat(chunks);
      const copy = new Request(req.url, { method: "POST", headers: req.headers, body });
      let fd: FormData;
      try { fd = await copy.clone().formData(); } catch { return NextResponse.json({ error: "Invalid submission." }, { status: 400 }); }
      for (const key of new Set(fd.keys())) {
        if (fd.getAll(key).length !== 1 || typeof fd.get(key) !== "string") return NextResponse.json({ error: "Invalid fields. Please email attachments separately." }, { status: 400 });
      }
      if (fd.has("attachments__refs")) return NextResponse.json({ error: "Please email attachments separately to sales@somnyxsolar.com." }, { status: 422 });
      const secret = process.env.TURNSTILE_SECRET_KEY;
      if (secret || process.env.NODE_ENV === "production") {
        if (!secret) return NextResponse.json({ error: "Verification unavailable." }, { status: 503 });
        const hostnames = origins.map(o => new URL(o).hostname);
        if (!(await verifyTurnstile(fd.get("cf-turnstile-response"), action, hostnames))) return NextResponse.json({ error: "Verification expired or failed. Please try again." }, { status: 422 });
      }
      const response = await handler(copy);
      response.headers.set("Cache-Control", "no-store");
      return response;
    } catch {
      console.error(`Form ${action}: service failure`);
      return NextResponse.json({ error: "The service is temporarily unavailable. Please email sales@somnyxsolar.com." }, { status: 503 });
    }
  };
}
