import path from "node:path";
import { MIME, readLocal } from "@/lib/storage";

export const runtime = "nodejs";

/** Serves locally stored PUBLIC files (local development / self-hosting): /api/files?k=public/... */
export async function GET(req: Request) {
  const key = new URL(req.url).searchParams.get("k") ?? "";
  if (!key.startsWith("public/")) return new Response("Not found", { status: 404 });
  const buf = await readLocal(key);
  if (!buf) return new Response("Not found", { status: 404 });
  const ext = path.extname(key).toLowerCase();
  return new Response(new Uint8Array(buf), {
    headers: { "Content-Type": MIME[ext] ?? "application/octet-stream", "Cache-Control": "public, max-age=3600", "X-Content-Type-Options": "nosniff" },
  });
}
