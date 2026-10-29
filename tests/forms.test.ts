import { test } from "node:test";
import assert from "node:assert/strict";
import { contactSchema, rfqSchema } from "../src/lib/validation";
import { spamCheck } from "../src/lib/spam";
import { protectedForm, verifyTurnstile } from "../src/lib/form-security";
import { rateLimit } from "../src/lib/ratelimit";
import { run, query } from "../src/lib/db";
import { deliverSubmission } from "../src/lib/delivery";
import { GET as retryDelivery } from "../src/app/api/cron/form-delivery/route";

test("RFQ validates required fields, quantities and consent", () => {
  const valid = { company: "Buyer Ltd", contactName: "Buyer", email: "buyer@example.com", phone: "+44 123456789", country: "UK", variant: "sjb-1530", currentRating: "30 A", quantity: "1000", deliveryLocation: "London", consent: "yes" };
  assert.equal(rfqSchema.parse(valid).quantity, 1000);
  for (const change of [{ quantity: "0" }, { quantity: "1.5" }, { quantity: "100000001" }, { variant: "unknown" }, { consent: "no" }, { company: "" }]) assert.equal(rfqSchema.safeParse({ ...valid, ...change }).success, false);
});
test("delivery retry endpoint refuses unauthenticated requests", async () => {
  assert.equal((await retryDelivery(new Request("http://localhost/api/cron/form-delivery"))).status, 401);
});

test("validation rejects missing consent, invalid email and header injection", () => {
  const valid = { topic: "sales", name: "Buyer", email: "BUYER@example.com", message: "Please contact me about modules.", consent: "yes" };
  assert.equal(contactSchema.parse(valid).email, "buyer@example.com");
  for (const change of [{ consent: "no" }, { email: "bad" }, { message: "x" }, { name: "Buyer\r\nBcc: victim@example.com" }]) assert.equal(contactSchema.safeParse({ ...valid, ...change }).success, false);
});
test("spam checks reject non-finite, future and stale timestamps", () => {
  for (const timestamp of ["NaN", "Infinity", "0", String(Date.now() + 10000), String(Date.now() - 86400_000)]) {
    const fd = new FormData(); fd.set("_t", timestamp); assert.ok(spamCheck(fd));
  }
  const fd = new FormData(); fd.set("_t", String(Date.now() - 4000)); assert.equal(spamCheck(fd), null);
  fd.set("website", "spam"); assert.equal(spamCheck(fd), "honeypot");
});
test("guard rejects foreign origins, invalid types and oversized bodies", async () => {
  let calls = 0;
  const handler = protectedForm("contact", async () => { calls++; return Response.json({ ok: true }); });
  const request = (origin: string, type: string, body: string) => new Request("http://localhost/api/contact", { method: "POST", headers: { origin, "content-type": type }, body });
  assert.equal((await handler(request("https://evil.example", "application/json", "{}"))).status, 403);
  assert.equal((await handler(request("https://www.somnyxsolar.com", "application/json", "{}"))).status, 415);
  assert.equal((await handler(request("https://www.somnyxsolar.com", "multipart/form-data; boundary=x", "x".repeat(65537)))).status, 413);
  assert.equal(calls, 0);
});
test("limiter permits exactly five concurrent requests and resets", async () => {
  const key = `test:${crypto.randomUUID()}`;
  try {
    const results = await Promise.all(Array.from({ length: 20 }, () => rateLimit(key, 5, 3600)));
    assert.equal(results.filter(Boolean).length, 5);
    await run("UPDATE rate_limits SET window_start = 0 WHERE key = ?", [key]);
    assert.equal(await rateLimit(key, 5, 3600), true);
  } finally { await run("DELETE FROM rate_limits WHERE key = ?", [key]); }
});
test("Turnstile rejects invalid tokens, hostname/action mismatch, replay and outage", async () => {
  const originalFetch = globalThis.fetch;
  let result: unknown = { success: true, hostname: "www.somnyxsolar.com", action: "contact" };
  globalThis.fetch = async () => Response.json(result);
  try {
    const hosts = ["www.somnyxsolar.com"];
    assert.equal(await verifyTurnstile("", "contact", hosts), false);
    assert.equal(await verifyTurnstile("x".repeat(2049), "contact", hosts), false);
    assert.equal(await verifyTurnstile("token", "contact", hosts), true);
    assert.equal(await verifyTurnstile("token", "rfq", hosts), false);
    assert.equal(await verifyTurnstile("token", "contact", ["evil.example"]), false);
    result = { success: false, "error-codes": ["timeout-or-duplicate"] };
    assert.equal(await verifyTurnstile("used-token", "contact", hosts), false);
    globalThis.fetch = async () => new Response("", { status: 503 });
    await assert.rejects(verifyTurnstile("token", "contact", hosts));
  } finally { globalThis.fetch = originalFetch; }
});
test("failed delivery stays saved; retries preserve payload and idempotency key", async () => {
  const id = `test_${crypto.randomUUID()}`;
  const originalFetch = globalThis.fetch;
  const saved = { key: process.env.RESEND_API_KEY, from: process.env.EMAIL_FROM };
  process.env.RESEND_API_KEY = "test-key"; process.env.EMAIL_FROM = "forms@notify.example.com";
  const requests: RequestInit[] = [];
  globalThis.fetch = async (_url, init) => { requests.push(init!); return new Response("{}", { status: requests.length === 1 ? 503 : 200 }); };
  try {
    await run("INSERT INTO contacts (id,created_at,topic,name,email,message,consent) VALUES (?,?,?,?,?,?,1)", [id, new Date().toISOString(), "sales", "Buyer", "buyer@example.com", "Please send details"]);
    assert.equal((await deliverSubmission("contact", id)).status, "failed");
    assert.equal((await query<{ email_status: string }>("SELECT email_status FROM contacts WHERE id = ?", [id]))[0].email_status, "failed");
    assert.equal((await deliverSubmission("contact", id)).status, "sent");
    assert.equal(requests[0].body, requests[1].body);
    assert.deepEqual(requests[0].headers, requests[1].headers);
    const body = JSON.parse(String(requests[0].body));
    assert.equal(body.to, "sales@somnyxsolar.com"); assert.equal(body.reply_to, "buyer@example.com");
    await deliverSubmission("contact", id); assert.equal(requests.length, 2);
  } finally {
    globalThis.fetch = originalFetch;
    if (saved.key === undefined) delete process.env.RESEND_API_KEY; else process.env.RESEND_API_KEY = saved.key;
    if (saved.from === undefined) delete process.env.EMAIL_FROM; else process.env.EMAIL_FROM = saved.from;
    await run("DELETE FROM contacts WHERE id = ?", [id]);
  }
});
