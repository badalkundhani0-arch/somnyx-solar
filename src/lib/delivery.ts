import "server-only";
import { query, run } from "./db";
import { lines, sendEmail } from "./email";

/** Reconstruct the same message for initial delivery and retries. The provider
 * idempotency key prevents duplicates across concurrent workers for 24 hours. */
export async function deliverSubmission(kind: "contact" | "rfq", id: string) {
  const table = kind === "contact" ? "contacts" : "rfqs";
  const [row] = await query<Record<string, unknown>>(`SELECT * FROM ${table} WHERE id = ?`, [id]);
  if (!row) throw new Error("Submission missing");
  if (row.email_status === "sent") return { status: "sent" as const };
  const content = Object.fromEntries(Object.entries(row).filter(([key]) => !["email_status", "email_error", "admin_notes", "status"].includes(key)));
  const subject = kind === "rfq" ? `Website RFQ ${row.reference}` : `Website contact ${id}`;
  const result = await sendEmail({ to: "sales@somnyxsolar.com", subject, text: lines(content), replyTo: String(row.email), idempotencyKey: `submission/${kind}/${id}` });
  try {
    await run(`UPDATE ${table} SET email_status = ?, email_error = ? WHERE id = ?`, [result.status, result.status === "failed" ? result.error : null, id]);
  } catch {
    // The saved pending row remains retryable with the same provider key.
    console.error("Notification status update failed");
  }
  return result;
}
