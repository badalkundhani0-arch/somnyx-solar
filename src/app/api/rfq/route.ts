import { deliverSubmission } from "@/lib/delivery";
import { protectedForm } from "@/lib/form-security";
import { NextResponse } from "next/server";
import { rfqSchema, fieldErrors } from "@/lib/validation";
import { newId, run } from "@/lib/db";
import { clientKey, rateLimit } from "@/lib/ratelimit";
import { spamCheck } from "@/lib/spam";
import { EMAILS } from "@/lib/brand";

export const runtime = "nodejs";

function reference() {
  const d = new Date();
  const ymd = `${String(d.getUTCFullYear()).slice(2)}${String(d.getUTCMonth() + 1).padStart(2, "0")}${String(d.getUTCDate()).padStart(2, "0")}`;
  const rand = Array.from(crypto.getRandomValues(new Uint8Array(4)))
    .map((b) => "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"[b % 32])
    .join("");
  return `SMX-${ymd}-${rand}`;
}

async function submit(req: Request) {
  let fd: FormData;
  try {
    fd = await req.formData();
  } catch {
    return NextResponse.json({ error: "The request could not be read. Please email attachments separately." }, { status: 400 });
  }

  const spam = spamCheck(fd);
  if (spam) {
    // Respond like a validation problem without revealing the check.
    return NextResponse.json({ error: "Please wait a moment and submit the form again." }, { status: 400 });
  }

  if (!(await rateLimit(await clientKey("rfq"), 5, 3600))) {
    return NextResponse.json({ error: "Too many requests from this connection. Please try again in an hour, or email " + EMAILS.sales }, { status: 429 });
  }

  const raw = Object.fromEntries(["intent", "company", "contactName", "email", "phone", "country", "variant", "currentRating", "quantity", "cableLength", "cableSection", "connectorType", "standard", "deliveryLocation", "deliveryDate", "requirements", "consent"].map((k) => [k, fd.get(k) ?? undefined]));
  const parsed = rfqSchema.safeParse(raw);
  if (!parsed.success) return NextResponse.json({ error: "Some fields need attention.", fields: fieldErrors(parsed.error) }, { status: 422 });
  const v = parsed.data;

  const id = newId("rfq_");
  const ref = reference();
  const now = new Date().toISOString();
  try {
    await run(
      `INSERT INTO rfqs (id, reference, created_at, status, company, contact_name, email, phone, country, variant, current_rating, quantity, cable_length, cable_section, connector_type, standard, delivery_location, delivery_date, requirements, attachments, consent, email_status)
       VALUES (?, ?, ?, 'new', ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 1, 'pending')`,
      [id, ref, now, v.company, v.contactName, v.email, v.phone, v.country, v.variant, v.currentRating, v.quantity, v.cableLength ?? null, v.cableSection ?? null, v.connectorType ?? null, v.standard ?? null, v.deliveryLocation, v.deliveryDate || null, (v.intent === "specifications" ? "[Specification request] " : "") + (v.requirements ?? ""), "[]"],
    );
  } catch (e) {
    console.error("RFQ persistence failed");
    return NextResponse.json({ error: `We could not save your request. Please try again, or email ${EMAILS.sales}.` }, { status: 500 });
  }

  const notify = await deliverSubmission("rfq", id);
  return NextResponse.json({ ok: true, reference: ref, confirmationSent: false, notification: notify.status });
}

export const POST = protectedForm("rfq", submit);
