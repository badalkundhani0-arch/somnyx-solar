"use client";
import { upload } from "@vercel/blob/client";

export type UploadMode = "blob" | "local" | "unavailable";
export type UploadedRef = { url: string; name: string; size: number };

/**
 * Adds files to a FormData. In blob mode files go straight from the browser to
 * storage and only their references are sent; locally they are sent inline.
 */
export async function attachFiles(fd: FormData, field: string, files: File[], mode: UploadMode, folder: string, kind = "documents", onProgress?: (pct: number) => void) {
  if (!files.length) return;
  if (mode === "local") {
    files.forEach((f) => fd.append(field, f));
    return;
  }
  if (mode === "unavailable") throw new Error("File uploads are not available right now.");
  const refs: UploadedRef[] = [];
  let done = 0;
  const total = files.reduce((s, f) => s + f.size, 0);
  for (const f of files) {
    const safe = f.name.replace(/[^a-zA-Z0-9._-]+/g, "-");
    const res = await upload(`${folder}/${safe}`, f, {
      access: "public",
      handleUploadUrl: "/api/upload",
      clientPayload: JSON.stringify({ kind }),
      onUploadProgress: (e) => onProgress?.(Math.round(((done + e.loaded) / total) * 100)),
    });
    done += f.size;
    refs.push({ url: res.url, name: f.name, size: f.size });
  }
  fd.append(`${field}__refs`, JSON.stringify(refs));
}
