import type { Metadata } from "next";
import Link from "next/link";
import { getProducts } from "@/lib/products";
import { getContent } from "@/lib/content";
import { CTABand, PageHero, SpecTable, StatusBadge } from "@/components/ui";
import { LazyProductViewer } from "@/components/three/Lazy";

export const metadata: Metadata = {
  title: "Products",
  description: "Somnyx SJB-1525, SJB-1530 and SJB-1535: 25 A, 30 A and 35 A 3-split PV junction boxes for 1500 V modules, rated IP68 to IEC/EN 62790.",
  alternates: { canonical: "/products" },
};

export default async function ProductsPage() {
  const [products, c] = await Promise.all([getProducts(), getContent()]);
  return (
    <>
      <PageHero marker="Products" lines={["PRECISION IN", "EVERY CONNECTION."]} lede={c["products.intro"]}>
      </PageHero>

      {products.map((p, i) => (
        <section key={p.id} className="border-t border-line py-20 md:py-28" aria-labelledby={`p-${p.id}`}>
          <div className={`wrap grid items-center gap-10 lg:grid-cols-2 lg:gap-20 ${i % 2 ? "lg:[&>*:first-child]:order-2" : ""}`}>
            <div className="relative aspect-[4/3] overflow-hidden rounded-[28px] border border-line bg-[radial-gradient(ellipse_at_center,#ffffff,#e9eff4_75%)]" data-reveal>
              <div className="blueprint-grid absolute inset-0" />
              <LazyProductViewer modelUrl={p.modelUrl} label={`3D model of the ${p.name}`} />
            </div>
            <div>
              <div className="flex flex-wrap items-center justify-between gap-4">
                <p className="font-display text-7xl font-medium tracking-[-0.06em] md:text-8xl">
                  {p.currentRating}
                  <span className="ml-1 text-[0.4em] text-accent">A</span>
                </p>
                <StatusBadge status={p.status} />
              </div>
              <h2 id={`p-${p.id}`} className="display-s mt-5">
                {p.name}
              </h2>
              <p className="mt-3 text-silver">{p.summary}</p>
              <div className="mt-8">
                <SpecTable specs={p.specs.slice(0, 6)} />
              </div>
              <div className="mt-8 flex flex-wrap gap-3">
                <Link href={`/products/${p.id}`} className="btn btn-primary" data-magnetic>
                  Full details
                </Link>
                <Link href={`/request-quote?variant=${p.id}&intent=specifications`} className="btn btn-ghost">
                  Request Specifications
                </Link>
                <Link href={`/request-quote?variant=${p.id}`} className="btn btn-ghost">
                  Request a Quotation
                </Link>
              </div>
            </div>
          </div>
        </section>
      ))}
      <CTABand title="Need a different rating or cable length?" body="Cable lengths, connectors and ratings can be configured per order. Tell us what your module needs." />
    </>
  );
}
