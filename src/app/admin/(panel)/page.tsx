import Link from "next/link";
import { query } from "@/lib/db";
import { systemChecks } from "@/lib/status";
import { H1, Pill, fmtDate } from "@/components/admin/ui";

type R = { id: string; reference: string; created_at: string; company: string; variant: string; quantity: number; status: string; email_status: string };

export default async function Overview() {
  const [rfqs, counts, msgs] = await Promise.all([
    query<R>("SELECT id, reference, created_at, company, variant, quantity, status, email_status FROM rfqs ORDER BY created_at DESC LIMIT 6"),
    query<{ status: string; n: number }>("SELECT status, COUNT(*) AS n FROM rfqs GROUP BY status"),
    query<{ n: number }>("SELECT COUNT(*) AS n FROM contacts WHERE status = 'new'"),
  ]);
  const checks = systemChecks();
  const c = Object.fromEntries(counts.map((x) => [x.status, Number(x.n)]));
  const total = counts.reduce((s, x) => s + Number(x.n), 0);

  return (
    <>
      <H1 sub="Enquiries, products and website content for Somnyx Solar.">Overview</H1>

      <section className="mb-10 grid gap-3 md:grid-cols-2 xl:grid-cols-4">
        {checks.map((ch) => (
          <div key={ch.label} className={`rounded-2xl border p-5 ${ch.ok ? "border-line bg-graphite" : "border-warn/40 bg-warn/5"}`}>
            <p className="flex items-center gap-2 text-sm">
              <span className={`h-2 w-2 rounded-full ${ch.ok ? "bg-ok" : "bg-warn"}`} />
              {ch.label}
            </p>
            <p className="mt-2 text-sm text-silver">{ch.detail}</p>
            {ch.fix && <p className="mt-2 text-sm text-warn">Setup required: {ch.fix}</p>}
          </div>
        ))}
      </section>

      <section className="mb-10 grid grid-cols-2 gap-3 md:grid-cols-4">
        {[
          ["New RFQs", c.new ?? 0, "/admin/rfqs?status=new"],
          ["In review", c["in-review"] ?? 0, "/admin/rfqs?status=in-review"],
          ["All RFQs", total, "/admin/rfqs"],
          ["New messages", Number(msgs[0].n), "/admin/messages"],
        ].map(([l, n, href]) => (
          <Link key={String(l)} href={String(href)} className="rounded-2xl border border-line bg-graphite p-5 hover:border-cyan">
            <p className="font-display text-4xl tracking-tight">{n}</p>
            <p className="mt-1 text-sm text-silver">{l}</p>
          </Link>
        ))}
      </section>

      <section>
        <div className="mb-4 flex items-center justify-between">
          <h2 className="font-display text-xl">Latest quotation requests</h2>
          <Link href="/admin/rfqs" className="text-sm text-accent hover:underline">All requests</Link>
        </div>
        {rfqs.length === 0 ? (
          <p className="rounded-2xl border border-line p-6 text-silver">No requests yet. Submissions from the Request a Quote page will appear here.</p>
        ) : (
          <ul className="divide-y divide-line rounded-2xl border border-line">
            {rfqs.map((r) => (
              <li key={r.id}>
                <Link href={`/admin/rfqs/${r.id}`} className="grid gap-1 p-4 hover:bg-graphite md:grid-cols-[10rem_1fr_auto_auto] md:items-center md:gap-4">
                  <span className="font-display text-sm">{r.reference}</span>
                  <span>{r.company} <span className="text-silver">· {r.variant.toUpperCase()} · {Number(r.quantity).toLocaleString("en-IN")} sets</span></span>
                  <span className="text-sm text-steel">{fmtDate(r.created_at)}</span>
                  <Pill value={r.status} />
                </Link>
              </li>
            ))}
          </ul>
        )}
      </section>
    </>
  );
}
