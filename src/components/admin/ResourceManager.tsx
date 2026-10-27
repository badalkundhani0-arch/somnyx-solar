"use client";
import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { attachFiles, type UploadMode } from "@/lib/upload-client";

type Row = { id: string; title: string; category: string; file_url: string; file_name: string; file_size: number; published: number; created: string };

export function ResourceManager({ rows, mode }: { rows: Row[]; mode: UploadMode }) {
  const router = useRouter();
  const form = useRef<HTMLFormElement>(null);
  const [busy, setBusy] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const post = async (fd: FormData) => {
    const res = await fetch("/api/admin/assets", { method: "POST", body: fd });
    const d = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(d.error || "Request failed");
    router.refresh();
  };

  const act = async (id: string, action: "toggle" | "remove") => {
    if (action === "remove" && !confirm("Delete this document permanently?")) return;
    const fd = new FormData();
    fd.append("target", "resource");
    fd.append("id", id);
    fd.append("action", action);
    try { await post(fd); } catch (e) { setError((e as Error).message); }
  };

  return (
    <div className="grid gap-10 xl:grid-cols-[1fr_1.4fr]">
      <form
        ref={form}
        className="space-y-4 rounded-2xl border border-line bg-graphite p-5"
        onSubmit={async (e) => {
          e.preventDefault();
          setError(null);
          const el = e.currentTarget;
          const fd = new FormData(el);
          const file = fd.get("file") as File | null;
          fd.delete("file");
          fd.append("target", "resource");
          fd.append("action", "upload");
          try {
            if (!file || !file.size) throw new Error("Choose a file to upload.");
            setBusy("Uploading");
            await attachFiles(fd, "file", [file], mode, "public/resources", "documents", (p) => setBusy(`Uploading ${p}%`));
            await post(fd);
            el.reset();
          } catch (err) { setError((err as Error).message); } finally { setBusy(null); }
        }}
      >
        <p className="font-display text-lg">Add a document</p>
        <div><label className="field-label" htmlFor="r-title">Title</label><input id="r-title" name="title" required className="field" /></div>
        <div><label className="field-label" htmlFor="r-desc">Description</label><textarea id="r-desc" name="description" rows={2} className="field" /></div>
        <div>
          <label className="field-label" htmlFor="r-cat">Category</label>
          <select id="r-cat" name="category" className="field">
            {["Datasheet", "Drawing", "Technical note", "Installation guide", "Quality document"].map((c) => <option key={c}>{c}</option>)}
          </select>
        </div>
        <div><label className="field-label" htmlFor="r-file">File</label><input id="r-file" name="file" type="file" required className="text-sm text-silver" /></div>
        <label className="flex items-center gap-2 text-sm text-silver"><input type="checkbox" name="published" value="yes" defaultChecked className="accent-[#B45309]" /> Publish now</label>
        {error && <p role="alert" className="text-sm text-danger">{error}</p>}
        <button disabled={!!busy || mode === "unavailable"} className="btn btn-primary btn-sm">{busy ?? "Upload document"}</button>
      </form>
      <div>
        {rows.length === 0 ? (
          <p className="rounded-2xl border border-line p-6 text-silver">No documents yet.</p>
        ) : (
          <ul className="divide-y divide-line rounded-2xl border border-line">
            {rows.map((r) => (
              <li key={r.id} className="flex flex-wrap items-center gap-3 p-4">
                <div className="min-w-0 flex-1">
                  <a href={r.file_url} target="_blank" rel="noopener" className="font-display hover:text-accent">{r.title}</a>
                  <p className="text-xs text-steel">{r.category}, {r.file_name}, {(r.file_size / 1024 / 1024).toFixed(1)} MB, added {r.created}</p>
                </div>
                <button onClick={() => act(r.id, "toggle")} className={`rounded-full px-3 py-1 text-xs ${r.published ? "bg-ok/15 text-ok" : "bg-line text-silver"}`}>{r.published ? "Published" : "Hidden"}</button>
                <button onClick={() => act(r.id, "remove")} className="text-xs text-silver hover:text-danger">Delete</button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
