"use client";
import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { attachFiles, type UploadMode } from "@/lib/upload-client";

type Props = { productId: string; target: string; label: string; help: string; current: string | null; accept: string; kind: string; mode: UploadMode };

export function AssetUploader({ productId, target, label, help, current, accept, kind, mode }: Props) {
  const router = useRouter();
  const input = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const send = async (action: "upload" | "remove") => {
    setError(null);
    const fd = new FormData();
    fd.append("target", target);
    fd.append("id", productId);
    fd.append("action", action);
    try {
      if (action === "upload") {
        const f = input.current?.files?.[0];
        if (!f) return setError("Choose a file first.");
        setBusy("Uploading");
        await attachFiles(fd, "file", [f], mode, `public/products/${productId}`, kind, (p) => setBusy(`Uploading ${p}%`));
      } else {
        if (!confirm(`Remove the current ${label.toLowerCase()}?`)) return;
        setBusy("Removing");
      }
      const res = await fetch("/api/admin/assets", { method: "POST", body: fd });
      const d = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(d.error || "Upload failed");
      if (input.current) input.current.value = "";
      router.refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Upload failed");
    } finally {
      setBusy(null);
    }
  };

  return (
    <div className="rounded-2xl border border-line bg-graphite p-5">
      <p className="font-display">{label}</p>
      <p className="mt-1 text-xs text-steel">{help}</p>
      {current ? (
        <p className="mt-3 flex items-center justify-between gap-3 text-sm">
          <a href={current} target="_blank" rel="noopener" className="truncate text-accent hover:underline">Current file</a>
          <button type="button" disabled={!!busy} onClick={() => send("remove")} className="text-silver hover:text-danger">Remove</button>
        </p>
      ) : (
        <p className="mt-3 text-sm text-steel">{target === "product-model" ? "Using the conceptual model." : "None uploaded."}</p>
      )}
      <div className="mt-4 flex items-center gap-2">
        <input ref={input} type="file" accept={accept} className="min-w-0 flex-1 text-sm text-silver file:mr-3 file:rounded-full file:border-0 file:bg-line file:px-3 file:py-1.5 file:text-white" aria-label={`Choose ${label}`} />
        <button type="button" disabled={!!busy || mode === "unavailable"} onClick={() => send("upload")} className="btn btn-primary btn-sm">{busy ?? (current ? "Replace" : "Upload")}</button>
      </div>
      {mode === "unavailable" && <p className="mt-2 text-xs text-warn">File storage is not configured (BLOB_READ_WRITE_TOKEN).</p>}
      {error && <p role="alert" className="mt-2 text-sm text-danger">{error}</p>}
    </div>
  );
}
