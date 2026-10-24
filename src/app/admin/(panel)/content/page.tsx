import { CONTENT_FIELDS, getContent, TAGLINE, type ContentKey } from "@/lib/content";
import { saveCopy } from "@/app/admin/actions";
import { H1, Saved } from "@/components/admin/ui";

export default async function ContentAdmin({ searchParams }: { searchParams: Promise<{ saved?: string }> }) {
  const [c, sp] = await Promise.all([getContent(), searchParams]);
  const groups = Array.from(new Set(Object.values(CONTENT_FIELDS).map((f) => f.group)));
  return (
    <>
      <H1 sub="Edit the main copy on each page. Changes go live as soon as you save.">Website copy</H1>
      <Saved show={sp.saved === "1"} />
      <div className="mb-8 rounded-2xl border border-line bg-graphite p-5">
        <p className="text-sm text-steel">Brand tagline (locked)</p>
        <p className="mt-1 font-display text-xl">{TAGLINE}</p>
        <p className="mt-1 text-xs text-steel">The official tagline is fixed in code so it stays exactly as written everywhere it appears.</p>
      </div>
      <form action={saveCopy} className="space-y-10">
        {groups.map((g) => (
          <fieldset key={g} className="space-y-5">
            <legend className="mb-4 font-display text-xl">{g}</legend>
            {(Object.entries(CONTENT_FIELDS) as [ContentKey, (typeof CONTENT_FIELDS)[ContentKey]][])
              .filter(([, f]) => f.group === g)
              .map(([k, f]) => (
                <div key={k}>
                  <label className="field-label" htmlFor={k}>{f.label}</label>
                  {"photo" in f && f.photo ? (
                    <div className="flex items-start gap-4">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={c[k].includes("unsplash.com") ? `${c[k]}?w=240&q=60&auto=format` : c[k]} alt="" className="h-16 w-28 shrink-0 rounded-lg object-cover" />
                      <div className="flex-1">
                        <input id={k} name={k} defaultValue={c[k]} className="field" />
                        <p className="mt-1 text-xs text-steel">Paste an image web address (https://…), or upload one under Technical resources and paste its link.</p>
                      </div>
                    </div>
                  ) : "multiline" in f && f.multiline ? (
                    <textarea id={k} name={k} defaultValue={c[k]} rows={Math.min(10, Math.ceil(c[k].length / 90) + 1)} className="field" />
                  ) : (
                    <input id={k} name={k} defaultValue={c[k]} className="field" />
                  )}
                  {c[k] !== f.value && <p className="mt-1 text-xs text-steel">Edited. Default: {f.value.slice(0, 120)}{f.value.length > 120 ? "…" : ""}</p>}
                </div>
              ))}
          </fieldset>
        ))}
        <div className="sticky bottom-4">
          <button className="btn btn-primary shadow-lg">Save all copy</button>
        </div>
      </form>
    </>
  );
}
