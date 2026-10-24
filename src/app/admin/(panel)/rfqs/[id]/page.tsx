import Link from "next/link";
import { notFound } from "next/navigation";
import { query } from "@/lib/db";
import { setRfqStatus, deleteRfq } from "@/app/admin/actions";
import { H1, Pill, fmtDate } from "@/components/admin/ui";
import { ConfirmButton } from "@/components/admin/ConfirmButton";

type Att = { url: string; name: string; size: number };

export default async function RfqDetail({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const rows = await query<Record<string, string>>("SELECT * FROM rfqs WHERE id = ?", [id]);
  const r = rows[0];
  if (!r) notFound();
  const atts: Att[] = JSON.parse(r.attachments || "[]");
  const fields: [string, React.ReactNode][] = [
    ["Company", r.company],
    ["Contact person", r.contact_name],
    ["Business email", <a key="e" className="text-accent hover:underline" href={`mailto:${r.email}?subject=${encodeURIComponent(`Your Somnyx Solar request ${r.reference}`)}`}>{r.email}</a>],
    ["Mobile / WhatsApp", <span key="p">{r.phone} <a className="ml-2 text-accent hover:underline" href={`https://wa.me/${r.phone.replace(/[^\d]/g, "")}`} target="_blank" rel="noopener">WhatsApp</a></span>],
    ["Country", r.country],
    ["Product variant", r.variant.toUpperCase()],
    ["Current rating", r.current_rating],
    ["Quantity (complete sets)", Number(r.quantity).toLocaleString("en-IN")],
    ["Cable length", r.cable_length],
    ["Cable cross-section", r.cable_section],
    ["Connector type", r.connector_type],
    ["Standard / certification", r.standard],
    ["Delivery location", r.delivery_location],
    ["Expected delivery", r.delivery_date],
  ];
  return (
    <>
      <Link href="/admin/rfqs" className="text-sm text-silver hover:text-white">All requests</Link>
      <div className="mt-3">
        <H1 sub={`Received ${fmtDate(r.created_at)}`}>{r.reference}: {r.company}</H1>
      </div>
      <div className="grid gap-8 xl:grid-cols-[1.5fr_1fr]">
        <div className="space-y-8">
          <dl className="divide-y divide-line rounded-2xl border border-line">
            {fields.map(([k, v]) => (
              <div key={k} className="grid gap-1 px-5 py-3 text-sm md:grid-cols-[14rem_1fr]">
                <dt className="text-steel">{k}</dt>
                <dd>{v || <span className="text-steel">Not given</span>}</dd>
              </div>
            ))}
          </dl>
          <div className="rounded-2xl border border-line p-5">
            <h2 className="mb-2 text-sm text-steel">Additional technical requirements</h2>
            <p className="whitespace-pre-wrap">{r.requirements || <span className="text-steel">None</span>}</p>
          </div>
          <div className="rounded-2xl border border-line p-5">
            <h2 className="mb-3 text-sm text-steel">Attachments</h2>
            {atts.length ? (
              <ul className="space-y-2">
                {atts.map((a) => (
                  <li key={a.url}>
                    <a href={`${a.url}&name=${encodeURIComponent(a.name)}`} className="text-accent hover:underline">{a.name}</a>
                    <span className="ml-2 text-xs text-steel">{(a.size / 1024 / 1024).toFixed(2)} MB</span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-steel">None</p>
            )}
          </div>
        </div>
        <div className="space-y-6">
          <form key={`${r.status}-${r.admin_notes.length}`} action={setRfqStatus.bind(null, r.id)} className="space-y-4 rounded-2xl border border-line bg-graphite p-5">
            <div>
              <label className="field-label" htmlFor="status">Status</label>
              <select id="status" name="status" defaultValue={r.status} className="field">
                {["new", "in-review", "quoted", "won", "lost", "archived"].map((s) => <option key={s} value={s}>{s.replace("-", " ")}</option>)}
              </select>
            </div>
            <div>
              <label className="field-label" htmlFor="notes">Internal notes</label>
              <textarea id="notes" name="notes" rows={6} defaultValue={r.admin_notes} className="field" />
            </div>
            <button className="btn btn-primary btn-sm">Save status and notes</button>
          </form>
          <div className="rounded-2xl border border-line p-5 text-sm">
            <p className="text-steel">Email notification</p>
            <p className="mt-2"><Pill value={r.email_status} /></p>
            {r.email_error && <p className="mt-2 text-danger">{r.email_error}</p>}
            {r.email_status === "not_configured" && <p className="mt-2 text-silver">Email delivery is not set up, so this request was not emailed to sales. Reply directly from here.</p>}
          </div>
          <form action={deleteRfq.bind(null, r.id)}>
            <ConfirmButton message={`Delete ${r.reference} permanently? This cannot be undone.`} className="text-sm text-danger hover:underline">Delete this request</ConfirmButton>
          </form>
        </div>
      </div>
    </>
  );
}
