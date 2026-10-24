import type { Metadata } from "next";
import Link from "next/link";
import { getContent } from "@/lib/content";
import { getProducts } from "@/lib/products";
import { query } from "@/lib/db";
import { CTABand, PageHero } from "@/components/ui";

export const metadata: Metadata = {
  title: "Technical Resources",
  description: "Somnyx Solar datasheets, drawings and technical notes for PV junction boxes, published as they are approved.",
  alternates: { canonical: "/resources" },
};

type Res = { id: string; title: string; description: string; category: string; file_url: string; file_name: string; file_size: number; created_at: string };

export default async function ResourcesPage() {
  const [c, products, resources] = await Promise.all([
    getContent(),
    getProducts(),
    query<Res>("SELECT * FROM resources WHERE published = 1 ORDER BY created_at DESC"),
  ]);
  const datasheets = products.filter((p) => p.datasheetUrl);
  const groups = Array.from(new Set(resources.map((r) => r.category)));

  return (
    <>
      <PageHero marker="Technical Resources" lines={["Documents and", "technical notes."]} lede={c["resources.intro"]} />
      <section className="pb-28">
        <div className="wrap grid gap-14 lg:grid-cols-[1fr_2fr]">
          <p className="text-silver">Need something not listed here? Our engineering team shares drawings and test documentation on request.</p>
          <div className="space-y-14">
            <div>
              <h2 className="display-s mb-5">Product datasheets</h2>
              {datasheets.length ? (
                <ul className="divide-y divide-line border-y border-line">
                  {datasheets.map((p) => (
                    <li key={p.id}>
                      <a href={p.datasheetUrl!} target="_blank" rel="noopener" className="flex items-center justify-between gap-4 py-5 hover:text-accent">
                        <span>
                          <span className="block font-display text-lg">{p.name} datasheet</span>
                          <span className="text-sm text-steel">PDF</span>
                        </span>
                        <span className="text-sm text-accent">Download</span>
                      </a>
                    </li>
                  ))}
                </ul>
              ) : (
                <div className="rounded-2xl border border-line p-6">
                  <p className="text-silver">Full specifications for each variant are on the product pages. Request datasheets and drawings from our team.</p>
                  <div className="mt-4 flex flex-wrap gap-2">
                    {products.map((p) => (
                      <Link key={p.id} href={`/products/${p.id}`} className="btn btn-ghost btn-sm">
                        {p.code}
                      </Link>
                    ))}
                    <Link href="/request-quote?intent=specifications" className="btn btn-primary btn-sm">
                      Request specifications
                    </Link>
                  </div>
                </div>
              )}
            </div>
            {groups.map((g) => (
              <div key={g}>
                <h2 className="display-s mb-5">{g}</h2>
                <ul className="divide-y divide-line border-y border-line">
                  {resources
                    .filter((r) => r.category === g)
                    .map((r) => (
                      <li key={r.id}>
                        <a href={r.file_url} target="_blank" rel="noopener" className="grid gap-1 py-5 hover:text-accent md:grid-cols-[1fr_auto] md:items-center md:gap-6">
                          <span>
                            <span className="block font-display text-lg">{r.title}</span>
                            {r.description && <span className="block text-sm text-silver">{r.description}</span>}
                          </span>
                          <span className="text-sm text-steel">
                            {r.file_name.split(".").pop()?.toUpperCase()}, {(Number(r.file_size) / 1024 / 1024).toFixed(1)} MB
                          </span>
                        </a>
                      </li>
                    ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>
      <CTABand title="Need a document we haven't published?" body="Ask our engineering team. We share drawings and technical data under NDA where appropriate." />
    </>
  );
}
