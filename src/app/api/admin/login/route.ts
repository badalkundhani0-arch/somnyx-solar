import { NextResponse } from "next/server";
import { adminConfigured, checkCredentials, createSession } from "@/lib/auth";
import { clientKey, rateLimit } from "@/lib/ratelimit";

export const runtime = "nodejs";

export async function POST(req: Request) {
  if (!adminConfigured()) return NextResponse.json({ error: "Admin access is not configured on this server." }, { status: 503 });
  if (!(await rateLimit(await clientKey("login"), 8, 900))) return NextResponse.json({ error: "Too many sign-in attempts. Wait 15 minutes and try again." }, { status: 429 });
  const { email, password } = (await req.json().catch(() => ({}))) as { email?: string; password?: string };
  if (!email || !password || !checkCredentials(email, password)) {
    await new Promise((r) => setTimeout(r, 400));
    return NextResponse.json({ error: "Email or password is incorrect." }, { status: 401 });
  }
  await createSession(email);
  return NextResponse.json({ ok: true });
}
