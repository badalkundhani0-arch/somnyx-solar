import "server-only";
import path from "node:path";
import fs from "node:fs/promises";
import { put, del } from "@vercel/blob";

export type StoredFile = { url: string; name: string; size: number; type: string };

export function storageMode(): "blob" | "local" | "unavailable" {
  if (process.env.BLOB_READ_WRITE_TOKEN) return "blob";
  return process.env.VERCEL ? "unavailable" : "local";
}

const LOCAL_ROOT = path.join(process.cwd(), "storage", "files");

export const ALLOWED = {
  documents: {
    exts: [".pdf", ".dwg", ".dxf", ".step", ".stp", ".png", ".jpg", ".jpeg", ".xlsx", ".xls", ".docx", ".doc", ".zip", ".csv", ".txt"],
    maxBytes: 15 * 1024 * 1024,
  },
  images: { exts: [".png", ".jpg", ".jpeg", ".webp", ".avif"], maxBytes: 8 * 1024 * 1024 },
  models: { exts: [".glb"], maxBytes: 25 * 1024 * 1024 },
  datasheets: { exts: [".pdf"], maxBytes: 20 * 1024 * 1024 },
};

export function validateFile(file: File, kind: keyof typeof ALLOWED): string | null {
  const ext = path.extname(file.name).toLowerCase();
  const rule = ALLOWED[kind];
  if (!rule.exts.includes(ext)) return `${file.name}: file type ${ext || "(none)"} is not accepted. Accepted: ${rule.exts.join(", ")}`;
  if (file.size > rule.maxBytes) return `${file.name} is larger than ${Math.round(rule.maxBytes / 1024 / 1024)} MB.`;
  if (file.size === 0) return `${file.name} is empty.`;
  return null;
}

function safeName(name: string) {
  const ext = path.extname(name).toLowerCase();
  const base = path.basename(name, path.extname(name)).replace(/[^a-zA-Z0-9-_]+/g, "-").slice(0, 60) || "file";
  return `${base}${ext}`;
}

/**
 * Store a file. `folder` decides visibility:
 *  - "private/..." files are only served through the authenticated admin route.
 *  - "public/..." files (approved images, models, datasheets) are served to everyone.
 */
export async function storeFile(file: File, folder: string): Promise<StoredFile> {
  const mode = storageMode();
  const name = `${crypto.randomUUID().slice(0, 8)}-${safeName(file.name)}`;
  const key = `${folder}/${name}`;
  if (mode === "unavailable") throw new Error("File storage is not configured. Set BLOB_READ_WRITE_TOKEN.");
  if (mode === "blob") {
    const blob = await put(key, file, { access: "public", addRandomSuffix: true, contentType: file.type || undefined });
    // Private files are proxied through /api/admin/files so their URLs are never shown publicly.
    const url = folder.startsWith("private/") ? `/api/admin/files?u=${encodeURIComponent(blob.url)}` : blob.url;
    return { url, name: file.name, size: file.size, type: file.type };
  }
  const dest = path.join(LOCAL_ROOT, key);
  await fs.mkdir(path.dirname(dest), { recursive: true });
  await fs.writeFile(dest, Buffer.from(await file.arrayBuffer()));
  const url = folder.startsWith("private/") ? `/api/admin/files?k=${encodeURIComponent(key)}` : `/api/files?k=${encodeURIComponent(key)}`;
  return { url, name: file.name, size: file.size, type: file.type };
}

export async function removeFile(url: string | null) {
  if (!url) return;
  try {
    if (url.includes("blob.vercel-storage.com")) {
      const real = url.startsWith("/api/") ? new URL(url, "http://x").searchParams.get("u")! : url;
      await del(real);
    } else if (url.startsWith("/api/files?k=")) {
      const key = new URL(url, "http://x").searchParams.get("k") ?? "";
      const full = path.normalize(path.join(LOCAL_ROOT, key));
      if (key.startsWith("public/") && full.startsWith(LOCAL_ROOT)) await fs.unlink(full);
    }
  } catch (e) {
    console.error("removeFile failed", e);
  }
}

export async function readLocal(key: string): Promise<Buffer | null> {
  const full = path.normalize(path.join(LOCAL_ROOT, key));
  if (!full.startsWith(LOCAL_ROOT)) return null;
  try {
    return await fs.readFile(full);
  } catch {
    return null;
  }
}

export const MIME: Record<string, string> = {
  ".pdf": "application/pdf",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".webp": "image/webp",
  ".avif": "image/avif",
  ".glb": "model/gltf-binary",
  ".zip": "application/zip",
  ".csv": "text/csv",
  ".txt": "text/plain",
};

/** Accept browser-uploaded blob references, verifying they live in our store under the expected prefix. */
export function acceptRefs(raw: FormDataEntryValue | null, prefix: string, kind: keyof typeof ALLOWED): { files: StoredFile[]; error?: string } {
  if (!raw) return { files: [] };
  let refs: { url: string; name: string; size: number }[];
  try {
    refs = JSON.parse(String(raw));
  } catch {
    return { files: [], error: "Invalid upload data" };
  }
  const files: StoredFile[] = [];
  for (const r of refs) {
    let u: URL;
    try {
      u = new URL(r.url);
    } catch {
      return { files: [], error: "Invalid upload URL" };
    }
    if (!u.hostname.endsWith(".public.blob.vercel-storage.com") || !u.pathname.startsWith(`/${prefix}`)) return { files: [], error: "Upload location not accepted" };
    const ext = path.extname(u.pathname).toLowerCase();
    if (!ALLOWED[kind].exts.includes(ext)) return { files: [], error: `File type ${ext} not accepted` };
    const url = prefix.startsWith("private/") ? `/api/admin/files?u=${encodeURIComponent(r.url)}` : r.url;
    files.push({ url, name: String(r.name).slice(0, 200), size: Number(r.size) || 0, type: MIME[ext] ?? "application/octet-stream" });
  }
  return { files };
}
