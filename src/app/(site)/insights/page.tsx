import type { Metadata } from "next";
import Link from "next/link";
import { PageHero, CTABand } from "@/components/ui";
import { ARTICLES, fmtArticleDate } from "@/lib/insights";

export const metadata: Metadata = {
  title: "Insights",
  description: "Guides to PV junction boxes: what they do, bypass diodes, choosing a current rating, 3-split designs and IP68 sealing.",
  alternates: { canonical: "/insights" },
};

export default function InsightsPage() {
  const [lead, ...rest] = ARTICLES;
  return (
    <>
      <PageHero
        marker="Insights"
        lines={["Know the box", "behind the module."]}
        lede="Practical guides to PV junction boxes for module engineers, procurement teams and anyone who wants to understand the smallest component that carries a module's power."
      />
      <section className="pb-16 md:pb-28">
        <div className="wrap">
          <Link href={`/insights/${lead.slug}`} className="group block rounded-[28px] border border-line bg-graphite p-8 transition-colors hover:border-cyan md:p-12" data-reveal>
            <p className="label">
              {lead.tag} · {lead.minutes} min read
            </p>
            <h2 className="mt-4 max-w-[22ch] font-display text-3xl tracking-tight md:text-5xl">{lead.title}</h2>
            <p className="mt-5 max-w-2xl text-silver">{lead.description}</p>
            <p className="mt-8 text-sm text-accent">Read the guide →</p>
          </Link>
          <ul className="mt-6 grid gap-6 md:grid-cols-2" data-stagger>
            {rest.map((a) => (
              <li key={a.slug}>
                <Link href={`/insights/${a.slug}`} className="flex h-full flex-col rounded-[24px] border border-line bg-graphite p-7 transition-colors hover:border-cyan md:p-9">
                  <p className="label">
                    {a.tag} · {a.minutes} min read
                  </p>
                  <h2 className="mt-4 font-display text-2xl tracking-tight">{a.title}</h2>
                  <p className="mt-3 flex-1 text-silver">{a.description}</p>
                  <p className="mt-6 text-xs text-steel">{fmtArticleDate(a.date)}</p>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </section>
      <CTABand title="Have a question we haven't covered?" body="Our technical team answers questions about ratings, sealing, cable assemblies and fit on your line." />
    </>
  );
}
