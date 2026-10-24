import { NextResponse } from "next/server";
import { rfqSchema, fieldErrors, VARIANTS } from "@/lib/validation";
import { newId, run } from "@/lib/db";
import { acceptRefs, storeFile, storageMode, validateFile, type StoredFile } from "@/lib/storage";
import { sendEmail, lines } from "@/lib/email";
import { clientKey, rateLimit } from "@/lib/ratelimit";
import { spamCheck } from "@/lib/spam";
import { EMAILS, SITE_URL } from "@/lib/brand";

export const runtime = "nodejs";

function reference() {
  const d = new Date();
  const ymd = `${String(d.getUTCFullYear()).slice(2)}${String(d.getUTCMonth() + 1).padStart(2, "0")}${String(d.getUTCDate()).padStart(2, "0")}`;
  const rand = Array.from(crypto.getRandomValues(new Uint8Array(4)))
    .map((b) => "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"[b % 32])
    .join("");
  return `SMX-${ymd}-${rand}`;
}

export async function POST(req: Request) {
  let fd: FormData;
  try {
    fd = await req.formData();
  } catch {
    return NextResponse.json({ error: "The request could not be read. Attachments may be too large (30 MB total)." }, { status: 400 });
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

  const files = fd.getAll("attachments").filter((f): f is File => f instanceof File && f.size > 0);
  const refs = acceptRefs(fd.get("attachments__refs"), "private/rfq/uploads/", "documents");
  if (refs.error) return NextResponse.json({ error: refs.error, fields: { attachments: refs.error } }, { status: 422 });
  if (files.length + refs.files.length > 5) return NextResponse.json({ error: "Attach up to 5 files.", fields: { attachments: "Attach up to 5 files." } }, { status: 422 });
  for (const f of files) {
    const err = validateFile(f, "documents");
    if (err) return NextResponse.json({ error: err, fields: { attachments: err } }, { status: 422 });
  }
  if (files.length && storageMode() === "unavailable") {
    return NextResponse.json({ error: `File uploads are temporarily unavailable. Submit without attachments and email them to ${EMAILS.sales}.`, fields: { attachments: "Uploads unavailable" } }, { status: 503 });
  }

  const id = newId("rfq_");
  const ref = reference();
  const stored: StoredFile[] = [...refs.files];
  try {
    for (const f of files) stored.push(await storeFile(f, `private/rfq/${ref}`));
  } catch (e) {
    console.error("attachment storage failed", e);
    return NextResponse.json({ error: `Your attachments could not be stored. Please try again, or email them to ${EMAILS.sales}.` }, { status: 500 });
  }

  const now = new Date().toISOString();
  try {
    await run(
      `INSERT INTO rfqs (id, reference, created_at, status, company, contact_name, email, phone, country, variant, current_rating, quantity, cable_length, cable_section, connector_type, standard, delivery_location, delivery_date, requirements, attachments, consent, email_status)
       VALUES (?, ?, ?, 'new', ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 1, 'pending')`,
      [id, ref, now, v.company, v.contactName, v.email, v.phone, v.country, v.variant, v.currentRating, v.quantity, v.cableLength ?? null, v.cableSection ?? null, v.connectorType ?? null, v.standard ?? null, v.deliveryLocation, v.deliveryDate || null, (v.intent === "specifications" ? "[Specification request] " : "") + (v.requirements ?? ""), JSON.stringify(stored)],
    );
  } catch (e) {
    console.error("rfq insert failed", e);
    return NextResponse.json({ error: `We could not save your request. Please try again, or email ${EMAILS.sales}.` }, { status: 500 });
  }

  const variantLabel = VARIANTS.find((x) => x.value === v.variant)?.label ?? v.variant;
  const body = [
    `New ${v.intent === "specifications" ? "specification request" : "RFQ"} ${ref}`,
    "",
    lines({
      Company: v.company,
      Contact: v.contactName,
      Email: v.email,
      "Mobile / WhatsApp": v.phone,
      Country: v.country,
      Variant: variantLabel,
      "Current rating": v.currentRating,
      "Quantity (sets)": v.quantity,
      "Cable length": v.cableLength,
      "Cable cross-section": v.cableSection,
      Connector: v.connectorType,
      "Standard / certification": v.standard,
      "Delivery location": v.deliveryLocation,
      "Expected delivery": v.deliveryDate,
      Attachments: stored.length ? stored.map((s) => s.name).join(", ") : "None",
    }),
    "",
    "Additional requirements:",
    v.requirements || "None",
    "",
    `Open in dashboard: ${SITE_URL}/admin/rfqs/${id}`,
  ].join("\n");

  const notify = await sendEmail({ to: process.env.RFQ_NOTIFY_TO || EMAILS.sales, subject: `RFQ ${ref}: ${v.company} (${variantLabel}, ${v.quantity} sets)`, text: body, replyTo: v.email });
  let ack: { status: string } = { status: "not_configured" };
  if (notify.status === "sent") {
    ack = await sendEmail({
      to: v.email,
      subject: `We received your request ${ref}`,
      replyTo: EMAILS.sales,
      text: `Dear ${v.contactName},\n\nThank you for your request to Somnyx Solar. Your reference is ${ref}.\n\nOur sales team will reply from ${EMAILS.sales}.\n\nSomnyx Solar\nEngineering a Cleaner Tomorrow.`,
    });
  }
  await run("UPDATE rfqs SET email_status = ?, email_error = ? WHERE id = ?", [notify.status, notify.status === "failed" ? notify.error : null, id]);

  return NextResponse.json({ ok: true, reference: ref, confirmationSent: ack.status === "sent", notification: notify.status });
}
