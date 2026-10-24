import { NextResponse } from "next/server";
import { contactSchema, fieldErrors, CONTACT_TOPICS } from "@/lib/validation";
import { newId, run } from "@/lib/db";
import { sendEmail, lines } from "@/lib/email";
import { clientKey, rateLimit } from "@/lib/ratelimit";
import { spamCheck } from "@/lib/spam";
import { EMAILS, SITE_URL } from "@/lib/brand";

export const runtime = "nodejs";

const ROUTE: Record<string, () => string> = {
  sales: () => process.env.RFQ_NOTIFY_TO || EMAILS.sales,
  procurement: () => process.env.PROCUREMENT_NOTIFY_TO || EMAILS.procurement,
  technical: () => process.env.TECHNICAL_NOTIFY_TO || EMAILS.technical,
};

export async function POST(req: Request) {
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
    console.error(e);
    return NextResponse.json({ error: "We could not save your message. Please email us directly." }, { status: 500 });
  }
  const topic = CONTACT_TOPICS.find((t) => t.value === v.topic)!.label;
  const res = await sendEmail({
    to: ROUTE[v.topic](),
    subject: `Website enquiry (${topic}): ${v.name}${v.company ? `, ${v.company}` : ""}`,
    replyTo: v.email,
    text: `${lines({ Topic: topic, Name: v.name, Company: v.company, Email: v.email, Phone: v.phone })}\n\n${v.message}\n\nOpen in dashboard: ${SITE_URL}/admin/messages`,
  });
  await run("UPDATE contacts SET email_status = ?, email_error = ? WHERE id = ?", [res.status, res.status === "failed" ? res.error : null, id]);
  return NextResponse.json({ ok: true, notification: res.status });
}
