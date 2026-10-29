import { timingSafeEqual } from "node:crypto";
import { query, run } from "@/lib/db";
import { deliverSubmission } from "@/lib/delivery";

export const runtime = "nodejs";
export const maxDuration = 60;
export async function GET(req: Request) {
  const expected = process.env.CRON_SECRET;
  const value = req.headers.get("authorization") || "";
  const match = `Bearer ${expected}`;
  if (!expected || Buffer.byteLength(value) !== Buffer.byteLength(match) || !timingSafeEqual(Buffer.from(value), Buffer.from(match))) return Response.json({ error: "Unauthorised" }, { status: 401 });
  try {
    let attempted = 0;
    // Do not automatically retry after the provider's 24-hour deduplication period.
    const cutoff = new Date(Date.now() - 23 * 3600_000).toISOString();
    for (const kind of ["contact", "rfq"] as const) {
      const table = kind === "contact" ? "contacts" : "rfqs";
      await run(`UPDATE ${table} SET email_status = 'manual_review', email_error = 'Retry window elapsed; check Resend before manual resend' WHERE email_status IN ('pending','failed','not_configured') AND created_at < ?`, [cutoff]);
      const rows = await query<{ id: string }>(`SELECT id FROM ${table} WHERE email_status IN ('pending','failed','not_configured') AND created_at >= ? ORDER BY created_at LIMIT 2`, [cutoff]);
      for (const row of rows) { await deliverSubmission(kind, row.id); attempted++; }
    }
    await run("DELETE FROM rate_limits WHERE window_start < ?", [Math.floor(Date.now() / 1000) - 86400]);
    return Response.json({ attempted }, { headers: { "Cache-Control": "no-store" } });
  } catch {
    console.error("Form delivery retry failed");
    return Response.json({ error: "Delivery service unavailable" }, { status: 503 });
  }
}
