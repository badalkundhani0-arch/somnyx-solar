import "server-only";
import { createHash } from "node:crypto";
import { headers } from "next/headers";
import { query, run } from "./db";

export async function clientKey(scope: string) {
  const h = await headers();
  const ip = (h.get("x-forwarded-for") || h.get("x-real-ip") || "local").split(",")[0].trim();
  // Store only a salted hash of the IP, never the IP itself.
  const hash = createHash("sha256").update(ip + (process.env.SESSION_SECRET || "smx")).digest("hex").slice(0, 24);
  return `${scope}:${hash}`;
}

/** Fixed-window limiter backed by the database. Returns true if allowed. */
export async function rateLimit(key: string, limit: number, windowSec: number): Promise<boolean> {
  const now = Math.floor(Date.now() / 1000);
  const rows = await query<{ window_start: number; count: number }>("SELECT window_start, count FROM rate_limits WHERE key = ?", [key]);
  const r = rows[0];
  if (!r || now - Number(r.window_start) >= windowSec) {
    await run("INSERT INTO rate_limits (key, window_start, count) VALUES (?, ?, 1) ON CONFLICT(key) DO UPDATE SET window_start = excluded.window_start, count = 1", [key, now]);
    return true;
  }
  if (Number(r.count) >= limit) return false;
  await run("UPDATE rate_limits SET count = count + 1 WHERE key = ?", [key]);
  return true;
}
