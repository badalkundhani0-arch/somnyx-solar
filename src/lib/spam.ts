import "server-only";

/** Honeypot + minimum fill time. Returns a reason string when the submission looks automated. */
export function spamCheck(fd: FormData): string | null {
  if (String(fd.get("website") ?? "").trim() !== "") return "honeypot";
  const started = Number(fd.get("_t") ?? 0);
  if (!started || Date.now() - started < 3000) return "too-fast";
  if (Date.now() - started > 1000 * 60 * 60 * 12) return "stale";
  return null;
}
