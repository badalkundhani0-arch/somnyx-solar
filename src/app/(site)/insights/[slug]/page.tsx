import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { CTABand, Marker } from "@/components/ui";
import { ARTICLES, getArticle, fmtArticleDate } from "@/lib/insights";
import { SITE_URL } from "@/lib/brand";

type Props = { params: Promise<{ slug: string }> };

export const dynamicParams = false;
export function generateStaticParams() {
  return ARTICLES.map((a) => ({ slug: a.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const a = getArticle((await params).slug);
  if (!a) return {};
  return {
    title: a.title,
    description: a.description,
    alternates: { canonical: `/insights/${a.slug}` },
    openGraph: { type: "article", title: a.title, description: a.description, publishedTime: a.date },
  };
}

export default async function ArticlePage({ params }: Props) {
  const a = getArticle((await params).slug);
  if (!a) notFound();
  const related = a.related.map(getArticle).filter((r): r is NonNullable<typeof r> => Boolean(r));
  const ld = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: a.title,
    description: a.description,
    datePublished: a.date,
    author: { "@type": "Organization", name: "Somnyx Solar" },
    publisher: { "@type": "Organization", name: "Somnyx Solar", logo: { "@type": "ImageObject", url: `${SITE_URL}/icon-512.png` } },
    mainEntityOfPage: `${SITE_URL}/insights/${a.slug}`,
  };
  return (
    <>
      <article className="pb-16 pt-36 md:pb-24 md:pt-48">
        <div className="wrap max-w-3xl">
          <nav aria-label="Breadcrumb" className="text-sm text-steel">
            <Link href="/insights" className="hover:text-accent">
              Insights
            </Link>{" "}
            / {a.tag}
          </nav>
          <h1 className="mt-6 font-display text-[clamp(2rem,5vw,3.6rem)] font-medium leading-[1.05] tracking-tight">{a.title}</h1>
          <p className="lede mt-6">{a.description}</p>
          <p className="mt-6 text-sm text-steel">
            {fmtArticleDate(a.date)} · {a.minutes} min read · Somnyx Solar engineering
          </p>
          <div className="mt-12 space-y-10 border-t border-line pt-10">
            {a.sections.map((s, i) => (
              <section key={i}>
                {s.heading && <h2 className="mb-4 font-display text-2xl tracking-tight md:text-[1.7rem]">{s.heading}</h2>}
                {s.paragraphs.map((p, j) => (
                  <p key={j} className="mb-4 text-[1.05rem] leading-relaxed text-silver">
                    {p}
                  </p>
                ))}
                {s.points && (
                  <ul className="mt-2 space-y-2.5">
                    {s.points.map((pt) => (
                      <li key={pt} className="flex gap-3 text-[1.05rem] leading-relaxed text-silver">
                        <span aria-hidden="true" className="mt-[0.7em] h-px w-4 shrink-0 bg-cyan" />
                        {pt}
                      </li>
                    ))}
                  </ul>
                )}
              </section>
            ))}
          </div>
        </div>
      </article>
      {related.length > 0 && (
        <section className="border-t border-line py-16 md:py-24">
          <div className="wrap">
            <Marker>Keep reading</Marker>
            <ul className="grid gap-6 md:grid-cols-2">
              {related.map((r) => (
                <li key={r.slug}>
                  <Link href={`/insights/${r.slug}`} className="block h-full rounded-[24px] border border-line bg-graphite p-7 transition-colors hover:border-cyan md:p-9">
                    <p className="label">
                      {r.tag} · {r.minutes} min read
                    </p>
                    <h2 className="mt-4 font-display text-2xl tracking-tight">{r.title}</h2>
                    <p className="mt-3 text-silver">{r.description}</p>
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </section>
      )}
      <CTABand title="Need a recommendation for your module?" body="Send us your module datasheet and our technical team will recommend a rating and configuration for your line." />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(ld) }} />
    </>
  );
}
