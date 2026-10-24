import { NextResponse } from "next/server";
import { handleUpload, type HandleUploadBody } from "@vercel/blob/client";
import { cookies } from "next/headers";
import path from "node:path";
import { ALLOWED } from "@/lib/storage";
import { SESSION_COOKIE, verifyToken } from "@/lib/auth";
import { clientKey, rateLimit } from "@/lib/ratelimit";

export const runtime = "nodejs";

/**
 * Issues short-lived tokens so browsers can upload large files straight to
 * Vercel Blob (serverless request bodies are capped at ~4.5 MB).
 * Public visitors may only upload RFQ documents; everything else requires an admin session.
 */
export async function POST(req: Request) {
  if (!process.env.BLOB_READ_WRITE_TOKEN) return NextResponse.json({ error: "Blob storage is not configured" }, { status: 501 });
  const body = (await req.json()) as HandleUploadBody;
  try {
    const result = await handleUpload({
      body,
      request: req,
      onBeforeGenerateToken: async (pathname, clientPayload) => {
        const payload = JSON.parse(clientPayload || "{}") as { kind?: keyof typeof ALLOWED };
        const kind = payload.kind && payload.kind in ALLOWED ? payload.kind : "documents";
        const isAdmin = await verifyToken((await cookies()).get(SESSION_COOKIE)?.value);
        if (pathname.startsWith("private/rfq/uploads/")) {
          if (kind !== "documents") throw new Error("Invalid upload kind");
          if (!(await rateLimit(await clientKey("upload"), 20, 3600))) throw new Error("Too many uploads");
        } else if (!isAdmin || !(pathname.startsWith("public/") || pathname.startsWith("private/"))) {
          throw new Error("Not allowed");
        }
        const ext = path.extname(pathname).toLowerCase();
        if (!ALLOWED[kind].exts.includes(ext)) throw new Error(`File type ${ext} not accepted`);
        return { maximumSizeInBytes: ALLOWED[kind].maxBytes, addRandomSuffix: true };
      },
    });
    return NextResponse.json(result);
  } catch (e) {
    return NextResponse.json({ error: e instanceof Error ? e.message : "Upload refused" }, { status: 400 });
  }
}
