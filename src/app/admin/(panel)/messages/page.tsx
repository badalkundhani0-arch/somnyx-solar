import { query } from "@/lib/db";
import { setMessageStatus } from "@/app/admin/actions";
import { H1, Pill, fmtDate } from "@/components/admin/ui";
import { CONTACT_TOPICS } from "@/lib/validation";

type M = { id: string; created_at: string; topic: string; name: string; company: string | null; email: string; phone: string | null; message: string; status: string; email_status: string };

export default async function Messages() {
  const rows = await query<M>("SELECT * FROM contacts ORDER BY created_at DESC LIMIT 300");
  return (
    <>
      <H1 sub="Messages from the contact page, routed by topic.">Messages</H1>
      {rows.length === 0 ? (
        <p className="rounded-2xl border border-line p-6 text-silver">No messages yet.</p>
      ) : (
        <ul className="space-y-3">
          {rows.map((m) => (
            <li key={m.id} className={`rounded-2xl border p-5 ${m.status === "new" ? "border-cyan/40 bg-graphite" : "border-line"}`}>
              <div className="flex flex-wrap items-center gap-3">
                <span className="font-display">{m.name}{m.company ? `, ${m.company}` : ""}</span>
                <Pill value={m.status} />
                <span className="text-xs text-steel">{CONTACT_TOPICS.find((t) => t.value === m.topic)?.label}</span>
                <span className="ml-auto text-xs text-steel">{fmtDate(m.created_at)}</span>
              </div>
              <p className="mt-3 whitespace-pre-wrap text-silver">{m.message}</p>
              <div className="mt-4 flex flex-wrap items-center gap-4 text-sm">
                <a className="text-accent hover:underline" href={`mailto:${m.email}?subject=${encodeURIComponent("Re: your enquiry to Somnyx Solar")}`}>{m.email}</a>
                {m.phone && <span className="text-silver">{m.phone}</span>}
                <span className="text-xs text-steel">Email notification: {m.email_status.replace("_", " ")}</span>
                <span className="ml-auto flex gap-2">
                  {["new", "replied", "archived"].filter((s) => s !== m.status).map((s) => (
                    <form key={s} action={setMessageStatus.bind(null, m.id, s)}>
                      <button className="rounded-full border border-line px-3 py-1 text-xs text-silver hover:border-cyan hover:text-white">Mark {s}</button>
                    </form>
                  ))}
                </span>
              </div>
            </li>
          ))}
        </ul>
      )}
    </>
  );
}
