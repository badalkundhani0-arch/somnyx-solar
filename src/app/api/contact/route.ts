import { deliverSubmission } from "@/lib/delivery";
import { protectedForm } from "@/lib/form-security";
import { NextResponse } from "next/server";
import { contactSchema, fieldErrors } from "@/lib/validation";
import { newId, run } from "@/lib/db";
import { clientKey, rateLimit } from "@/lib/ratelimit";
import { spamCheck } from "@/lib/spam";

export const runtime = "nodejs";

async function submit(req: Request) {
  let fd: FormData;
  try {
    fd = await req.formData();
  } catch {
    return NextResponse.json({ error: "The message could not be read." }, { status: 400 });
  }
  if (spamCheck(fd)) return NextResponse.json({ error: "Please wait a moment and send the form again." }, { status: 400 });
  if (!(await rateLimit(await clientKey("contact"), 8, 3600))) return NextResponse.json({ error: "Too many messages from this connection. Please try again later." }, { status: 429 });

  const parsed = contactSchema.safeParse(Object.fromEntries(["topic", "name", "company", "email", "phone", "message", "consent"].map((k) => [k, fd.get(k) ?? undefined])));
  if (!parsed.success) return NextResponse.json({ error: "Some fields need attention.", fields: fieldErrors(parsed.error) }, { status: 422 });
  const v = parsed.data;
  const id = newId("msg_");
  try {
    await run(
      "INSERT INTO contacts (id, created_at, topic, name, company, email, phone, message, consent, status, email_status) VALUES (?, ?, ?, ?, ?, ?, ?, ?, 1, 'new', 'pending')",
      [id, new Date().toISOString(), v.topic, v.name, v.company ?? null, v.email, v.phone ?? null, v.message],
    );
  } catch (e) {
    console.error("Contact persistence failed");
    return NextResponse.json({ error: "We could not save your message. Please email us directly." }, { status: 500 });
  }
  const res = await deliverSubmission("contact", id);
  return NextResponse.json({ ok: true, notification: res.status });
}

export const POST = protectedForm("contact", submit);
