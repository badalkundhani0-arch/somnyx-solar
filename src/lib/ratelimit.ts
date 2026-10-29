import "server-only";
import { createHash } from "node:crypto";
import { headers } from "next/headers";
import { run } from "./db";

export async function clientKey(scope: string) {
  const h = await headers();
  const ip = ((process.env.VERCEL ? h.get("x-vercel-forwarded-for") : h.get("x-forwarded-for")) || "local").split(",")[0].trim();
  // Store only a salted hash of the IP, never the IP itself.
  const hash = createHash("sha256").update(ip + (process.env.SESSION_SECRET || "smx")).digest("hex").slice(0, 24);
  return `${scope}:${hash}`;
}

/** Fixed-window limiter backed by the database. Returns true if allowed. */
export async function rateLimit(key: string, limit: number, windowSec: number): Promise<boolean> {
  const now = Math.floor(Date.now() / 1000);
  const result = await run(`INSERT INTO rate_limits (key, window_start, count) VALUES (?, ?, 1)
    ON CONFLICT(key) DO UPDATE SET
      window_start = CASE WHEN rate_limits.window_start <= ? THEN excluded.window_start ELSE rate_limits.window_start END,
      count = CASE WHEN rate_limits.window_start <= ? THEN 1 ELSE rate_limits.count + 1 END
    RETURNING count`, [key, now, now - windowSec, now - windowSec]);
  return Number(result.rows[0].count) <= limit;
}
