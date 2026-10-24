import "server-only";
import { adminConfigured } from "./auth";
import { dbMode } from "./db";
import { emailConfigured } from "./email";
import { storageMode } from "./storage";

export type Check = { label: string; ok: boolean; detail: string; fix?: string };

/** Honest report of what is and is not wired up in this deployment. */
export function systemChecks(): Check[] {
  const db = dbMode();
  const st = storageMode();
  return [
    {
      label: "Database",
      ok: db !== "ephemeral",
      detail: db === "remote" ? "Connected to Turso (persistent)." : db === "local" ? "Local SQLite file in ./storage (fine for development and self-hosting)." : "Temporary database: enquiries will be lost when the server restarts.",
      fix: db === "ephemeral" ? "Set TURSO_DATABASE_URL and TURSO_AUTH_TOKEN." : undefined,
    },
    {
      label: "Email notifications",
      ok: emailConfigured(),
      detail: emailConfigured() ? `Sending from ${process.env.EMAIL_FROM}. RFQs go to ${process.env.RFQ_NOTIFY_TO || "sales@somnyxsolar.com"}.` : "Not configured. Enquiries are saved here but nobody is emailed.",
      fix: emailConfigured() ? undefined : "Set RESEND_API_KEY and EMAIL_FROM (an address on a domain verified in Resend).",
    },
    {
      label: "File storage",
      ok: st !== "unavailable",
      detail: st === "blob" ? "Vercel Blob." : st === "local" ? "Local folder ./storage/files." : "Not configured. Uploads will fail.",
      fix: st === "unavailable" ? "Set BLOB_READ_WRITE_TOKEN." : undefined,
    },
    {
      label: "Admin security",
      ok: adminConfigured() && (process.env.ADMIN_PASSWORD?.length ?? 0) >= 12,
      detail: (process.env.ADMIN_PASSWORD?.length ?? 0) >= 12 ? "Admin credentials set." : "Use an admin password of at least 12 characters.",
    },
  ];
}
