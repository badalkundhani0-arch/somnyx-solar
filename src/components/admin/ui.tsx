export function H1({ children, sub }: { children: React.ReactNode; sub?: React.ReactNode }) {
  return (
    <div className="mb-8">
      <h1 className="font-display text-3xl tracking-tight">{children}</h1>
      {sub && <p className="mt-2 text-silver">{sub}</p>}
    </div>
  );
}

const COLORS: Record<string, string> = {
  new: "bg-cyan/15 text-accent",
  "in-review": "bg-warn/15 text-warn",
  quoted: "bg-[#7f8cff]/15 text-[#a5adff]",
  won: "bg-ok/15 text-ok",
  lost: "bg-danger/15 text-danger",
  archived: "bg-line text-steel",
  replied: "bg-ok/15 text-ok",
  sent: "bg-ok/15 text-ok",
  failed: "bg-danger/15 text-danger",
  not_configured: "bg-warn/15 text-warn",
  pending: "bg-line text-steel",
};

export function Pill({ value, label }: { value: string; label?: string }) {
  return <span className={`inline-block whitespace-nowrap rounded-full px-2.5 py-0.5 text-xs ${COLORS[value] ?? "bg-line text-silver"}`}>{label ?? value.replace("_", " ")}</span>;
}

export function fmtDate(iso: string) {
  return new Date(iso).toLocaleString("en-GB", { day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" });
}

export function Saved({ show, children = "Saved. The website has been updated." }: { show: boolean; children?: React.ReactNode }) {
  if (!show) return null;
  return <p role="status" className="mb-6 rounded-xl border border-ok/30 bg-ok/5 px-4 py-3 text-sm text-ok">{children}</p>;
}
