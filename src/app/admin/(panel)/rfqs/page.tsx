import Link from "next/link";
import { query } from "@/lib/db";
import { H1, Pill, fmtDate } from "@/components/admin/ui";

const STATUSES = ["all", "new", "in-review", "quoted", "won", "lost", "archived"];
type R = { id: string; reference: string; created_at: string; company: string; contact_name: string; country: string; variant: string; quantity: number; status: string; email_status: string; attachments: string };

export default async function RfqList({ searchParams }: { searchParams: Promise<{ status?: string; q?: string }> }) {
  const sp = await searchParams;
  const status = STATUSES.includes(sp.status ?? "") ? sp.status! : "all";
  const q = (sp.q ?? "").trim();
  const where: string[] = [];
  const args: string[] = [];
  if (status !== "all") (where.push("status = ?"), args.push(status));
  if (q) (where.push("(company LIKE ? OR contact_name LIKE ? OR email LIKE ? OR reference LIKE ?)"), args.push(...Array(4).fill(`%${q}%`)));
  const rows = await query<R>(`SELECT id, reference, created_at, company, contact_name, country, variant, quantity, status, email_status, attachments FROM rfqs ${where.length ? "WHERE " + where.join(" AND ") : ""} ORDER BY created_at DESC LIMIT 500`, args);

  return (
    <>
      <H1 sub="Every submission from the Request a Quote form is stored here, whether or not email delivery succeeded.">Quotation requests</H1>
      <div className="mb-6 flex flex-wrap items-center gap-2">
        {STATUSES.map((s) => (
          <Link key={s} href={`/admin/rfqs?status=${s}${q ? `&q=${encodeURIComponent(q)}` : ""}`} className={`rounded-full border px-3 py-1 text-sm ${s === status ? "border-cyan text-white" : "border-line text-silver"}`}>
            {s.replace("-", " ")}
          </Link>
        ))}
        <form className="ml-auto">
          <input type="hidden" name="status" value={status} />
          <input name="q" defaultValue={q} placeholder="Search company, email, reference" className="field h-9 w-64 py-1 text-sm" />
        </form>
      </div>
      {rows.length === 0 ? (
        <p className="rounded-2xl border border-line p-6 text-silver">No requests match.</p>
      ) : (
        <div className="overflow-x-auto rounded-2xl border border-line">
          <table className="w-full min-w-[820px] text-left text-sm">
            <thead className="border-b border-line text-steel">
              <tr>
                {["Reference", "Received", "Company", "Variant", "Sets", "Files", "Email", "Status"].map((h) => (
                  <th key={h} className="px-4 py-3 font-normal">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              {rows.map((r) => (
                <tr key={r.id} className="hover:bg-graphite">
                  <td className="px-4 py-3"><Link href={`/admin/rfqs/${r.id}`} className="font-display text-accent hover:underline">{r.reference}</Link></td>
                  <td className="px-4 py-3 text-silver">{fmtDate(r.created_at)}</td>
                  <td className="px-4 py-3">{r.company}<span className="block text-xs text-steel">{r.contact_name}, {r.country}</span></td>
                  <td className="px-4 py-3">{r.variant.toUpperCase()}</td>
                  <td className="px-4 py-3 tabular-nums">{Number(r.quantity).toLocaleString("en-IN")}</td>
                  <td className="px-4 py-3">{JSON.parse(r.attachments || "[]").length}</td>
                  <td className="px-4 py-3"><Pill value={r.email_status} /></td>
                  <td className="px-4 py-3"><Pill value={r.status} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </>
  );
}
