"use client";
import { useState } from "react";
import type { Spec } from "@/lib/seed";

export function SpecEditor({ initial }: { initial: Spec[] }) {
  const [rows, setRows] = useState<(Spec & { k: number })[]>(initial.map((s, i) => ({ ...s, k: i })));
  const update = (k: number, f: keyof Spec, v: string) => setRows((r) => r.map((x) => (x.k === k ? { ...x, [f]: v } : x)));
  const move = (i: number, d: number) => setRows((r) => { const n = [...r]; const [x] = n.splice(i, 1); n.splice(i + d, 0, x); return n; });
  return (
    <div className="space-y-2">
      <div className="hidden grid-cols-[1.2fr_1fr_1fr_auto] gap-2 px-1 text-xs text-steel md:grid">
        <span>Parameter</span><span>Value</span><span>Note (e.g. &ldquo;Development target&rdquo;)</span><span />
      </div>
      {rows.map((s, i) => (
        <div key={s.k} className="grid gap-2 rounded-xl border border-line p-2 md:grid-cols-[1.2fr_1fr_1fr_auto] md:border-0 md:p-0">
          <input name="spec_label" value={s.label} onChange={(e) => update(s.k, "label", e.target.value)} className="field py-2 text-sm" aria-label="Parameter" />
          <input name="spec_value" value={s.value} onChange={(e) => update(s.k, "value", e.target.value)} className="field py-2 text-sm" aria-label="Value" />
          <input name="spec_note" value={s.note ?? ""} onChange={(e) => update(s.k, "note", e.target.value)} className="field py-2 text-sm" aria-label="Note" />
          <div className="flex items-center gap-1">
            <button type="button" disabled={i === 0} onClick={() => move(i, -1)} className="h-9 w-8 rounded-lg border border-line text-silver disabled:opacity-30" aria-label="Move up">↑</button>
            <button type="button" disabled={i === rows.length - 1} onClick={() => move(i, 1)} className="h-9 w-8 rounded-lg border border-line text-silver disabled:opacity-30" aria-label="Move down">↓</button>
            <button type="button" onClick={() => setRows((r) => r.filter((x) => x.k !== s.k))} className="h-9 rounded-lg border border-line px-2 text-xs text-silver hover:text-danger" aria-label={`Remove ${s.label}`}>Remove</button>
          </div>
        </div>
      ))}
      <button type="button" onClick={() => setRows((r) => [...r, { label: "", value: "", note: "", k: Date.now() }])} className="btn btn-ghost btn-sm">Add specification</button>
    </div>
  );
}
