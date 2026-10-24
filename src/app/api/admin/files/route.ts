import path from "node:path";
import { requireAdmin } from "@/lib/auth";
import { MIME, readLocal } from "@/lib/storage";

export const runtime = "nodejs";

/** Authenticated access to private files (RFQ attachments). */
export async function GET(req: Request) {
  try {
    await requireAdmin();
  } catch {
    return new Response("Unauthorised", { status: 401 });
  }
  const u = new URL(req.url);
  const k = u.searchParams.get("k");
  const blob = u.searchParams.get("u");
  const name = u.searchParams.get("name") || undefined;
  if (k) {
    if (!k.startsWith("private/")) return new Response("Not found", { status: 404 });
    const buf = await readLocal(k);
    if (!buf) return new Response("Not found", { status: 404 });
    return new Response(new Uint8Array(buf), {
      headers: {
        "Content-Type": MIME[path.extname(k).toLowerCase()] ?? "application/octet-stream",
        "Content-Disposition": `attachment; filename="${(name || path.basename(k)).replace(/"/g, "")}"`,
        "Cache-Control": "private, no-store",
      },
    });
  }
  if (blob) {
    const url = new URL(blob);
    if (!url.hostname.endsWith(".public.blob.vercel-storage.com") || !url.pathname.startsWith("/private/")) return new Response("Not found", { status: 404 });
    const r = await fetch(url);
    if (!r.ok) return new Response("Not found", { status: 404 });
    return new Response(r.body, {
      headers: {
        "Content-Type": r.headers.get("content-type") ?? "application/octet-stream",
        "Content-Disposition": `attachment; filename="${(name || path.basename(url.pathname)).replace(/"/g, "")}"`,
        "Cache-Control": "private, no-store",
      },
    });
  }
  return new Response("Not found", { status: 404 });
}
