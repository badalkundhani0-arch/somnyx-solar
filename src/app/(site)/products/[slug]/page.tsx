import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getProduct, getProducts } from "@/lib/products";
import { CTABand, Marker, RevealHeading, SpecTable, StatusBadge } from "@/components/ui";
import { LazyProductViewer } from "@/components/three/Lazy";
import { SITE_URL } from "@/lib/brand";

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const p = await getProduct((await params).slug);
  if (!p) return { title: "Product not found" };
  return {
    title: `${p.code} ${p.currentRating} A PV Junction Box`,
    description: `${p.name}: ${p.summary}`,
    alternates: { canonical: `/products/${p.id}` },
  };
}

export default async function ProductPage({ params }: Props) {
  const { slug } = await params;
  const [p, all] = await Promise.all([getProduct(slug), getProducts()]);
  if (!p) notFound();
  const others = all.filter((o) => o.id !== p.id);

  const ld = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: p.name,
    sku: p.code,
    category: "Photovoltaic junction box",
    description: p.summary,
    brand: { "@type": "Brand", name: "Somnyx Solar" },
    manufacturer: { "@type": "Organization", name: "Somnyx Industries" },
    url: `${SITE_URL}/products/${p.id}`,
    additionalProperty: p.specs.map((s) => ({ "@type": "PropertyValue", name: s.label, value: s.value, description: s.note })),
  };

  return (
    <>
      <section className="relative overflow-hidden pt-28 md:pt-32">
        <div className="wrap grid gap-10 lg:grid-cols-[1.15fr_1fr] lg:gap-16">
          <div className="relative order-2 aspect-square overflow-hidden rounded-[32px] border border-line bg-[radial-gradient(ellipse_at_center,#ffffff,#F1EEE9_75%)] lg:order-1 lg:aspect-auto lg:min-h-[640px]">
            <div className="blueprint-grid absolute inset-0" />
            <LazyProductViewer modelUrl={p.modelUrl} label={`3D model of the ${p.name}`} />
          </div>
          <div className="order-1 flex flex-col justify-center lg:order-2">
            <nav aria-label="Breadcrumb" className="label mb-8">
              <Link href="/products" className="hover:text-white">
                Products
              </Link>
              <span className="mx-2">/</span>
              <span className="text-silver">{p.code}</span>
            </nav>
            <h1 className="sr-only">{p.name}</h1>
            <p className="font-display text-[clamp(6rem,14vw,12rem)] font-medium leading-[0.8] tracking-[-0.06em]" aria-hidden="true">
              {p.currentRating}
              <span className="ml-2 text-[0.36em] text-accent">A</span>
            </p>
            <p className="mt-6 font-display text-3xl tracking-tight">{p.name}</p>
            <p className="mt-1 text-silver">{p.tagline}</p>
            <p className="lede mt-6">{p.summary}</p>
            <div className="mt-8">
              <StatusBadge status={p.status} />
            </div>
            <div className="mt-10 flex flex-wrap gap-3">
              <Link href={`/request-quote?variant=${p.id}`} className="btn btn-primary" data-magnetic>
                Request a Quotation
              </Link>
              <Link href={`/request-quote?variant=${p.id}&intent=specifications`} className="btn btn-ghost" data-magnetic>
                Request Specifications
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section className="py-24 md:py-32">
        <div className="wrap grid gap-12 lg:grid-cols-[1fr_1.3fr] lg:gap-20">
          <div>
            <Marker>Technical data</Marker>
            <RevealHeading lines={["Specification"]} className="display-m" />
            {p.statusNote && <p className="mt-6 text-silver">{p.statusNote}</p>}
            {p.datasheetUrl ? (
              <a href={p.datasheetUrl} className="btn btn-ghost mt-6" target="_blank" rel="noopener">
                Download datasheet (PDF)
              </a>
            ) : (
              <p className="mt-6 text-sm text-steel">Request the full datasheet and drawings for this variant from our sales team.</p>
            )}
          </div>
          <div data-reveal>
            <SpecTable specs={p.specs} />
            <p className="mt-4 text-xs text-steel">Last updated {new Date(p.updatedAt).toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" })}</p>
          </div>
        </div>
      </section>

      <section className="border-t border-line py-24">
        <div className="wrap">
          <p className="label mb-6">Other variants</p>
          <div className="grid gap-3 md:grid-cols-2">
            {others.map((o) => (
              <Link key={o.id} href={`/products/${o.id}`} className="group flex items-center justify-between rounded-[24px] border border-line bg-graphite p-7 transition-colors hover:border-cyan">
                <span>
                  <span className="block font-display text-2xl tracking-tight">{o.name}</span>
                  <span className="text-sm text-silver">{o.tagline}</span>
                </span>
                <span className="font-display text-5xl tracking-tighter text-line-strong transition-colors group-hover:text-accent">{o.currentRating} A</span>
              </Link>
            ))}
          </div>
        </div>
      </section>
      <CTABand title={`Evaluating the ${p.code}?`} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(ld) }} />
    </>
  );
}
