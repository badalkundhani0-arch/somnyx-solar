import Link from "next/link";
import { Hero } from "@/components/Hero";
import { HorizontalPin } from "@/components/HorizontalPin";
import { ProductPanel } from "@/components/ProductPanel";
import { BypassDiagram } from "@/components/BypassDiagram";
import { SolarArt } from "@/components/Art";
import { IndustryPanels } from "@/components/IndustryPanels";
import { CTABand, Marker, RevealHeading } from "@/components/ui";
import { LazyExplorer } from "@/components/three/Lazy";
import { getContent } from "@/lib/content";
import { getProducts } from "@/lib/products";

export default async function Home() {
  const [c, products] = await Promise.all([getContent(), getProducts()]);
  const model = products.find((p) => p.modelUrl)?.modelUrl ?? null;

  return (
    <>
      <Hero subheadline={c["home.hero.subheadline"]} description={c["home.hero.description"]} />

      {/* Introduction */}
      <section className="relative py-28 md:py-40">
        <div className="wrap grid gap-12 lg:grid-cols-[1fr_1fr] lg:gap-20">
          <div>
            <Marker>Why the junction box matters</Marker>
            <RevealHeading lines={[c["home.intro.heading"]]} className="display-m max-w-[17ch]" />
          </div>
          <div className="lg:pt-16">
            <p className="lede" data-reveal>
              {c["home.intro.body"]}
            </p>
          </div>
        </div>
        <div className="wrap mt-20">
          <dl className="grid grid-cols-2 border-t border-line md:grid-cols-4" data-stagger>
            {[
              ["3.6 GW", "Annual manufacturing capacity"],
              ["1500 V DC", "Maximum system voltage"],
              ["25–35 A", "Three current ratings"],
              ["IP68", "Enclosure protection"],
            ].map(([v, l]) => (
              <div key={l} className="flex flex-col-reverse border-b border-line py-8 pr-4 md:border-b-0 md:border-r md:px-6 md:first:pl-0 md:last:border-r-0">
                <dt className="mt-2 text-sm text-silver">{l}</dt>
                <dd className="font-display text-3xl tracking-tight md:text-4xl">{v}</dd>
              </div>
            ))}
          </dl>
        </div>
      </section>

      {/* Products */}
      <div className="border-t border-line pt-24 lg:pt-0">
        <HorizontalPin
          progressLabel="Three variants, one platform"
          header={
            <div className="wrap mb-10 grid gap-6 lg:mb-12 lg:grid-cols-[1.3fr_1fr] lg:items-end">
              <RevealHeading lines={["PRECISION IN", "EVERY CONNECTION."]} className="display-l" />
              <p className="body-copy" data-reveal>
                {c["products.intro"]}
              </p>
            </div>
          }
        >
          {products.map((p, i) => (
            <ProductPanel key={p.id} p={p} index={i} total={products.length} />
          ))}
        </HorizontalPin>
      </div>

      {/* Explorer */}
      <section id="inside" className="py-28 md:py-40">
        <div className="wrap">
          <div className="mb-12 grid gap-6 lg:grid-cols-[1.3fr_1fr] lg:items-end">
            <div>
              <Marker>Interactive exploded view</Marker>
              <RevealHeading lines={["ENGINEERED FROM", "THE INSIDE OUT."]} className="display-l" />
            </div>
            <p className="body-copy" data-reveal>
              Take the three boxes apart. Select any component to isolate it, see what it does and the engineering behind it.
            </p>
          </div>
          <LazyExplorer modelUrl={model} />
        </div>
      </section>

      {/* Technology */}
      <section className="border-t border-line py-28 md:py-40">
        <div className="wrap">
          <div className="mb-12 grid gap-6 lg:grid-cols-[1.3fr_1fr] lg:items-end">
            <div>
              <Marker>Bypass diodes, explained</Marker>
              <RevealHeading lines={["RELIABILITY BEGINS", "WITH ENGINEERING."]} className="display-l" />
            </div>
            <div data-reveal>
              <p className="body-copy">{c["technology.intro"]}</p>
              <Link href="/technology" className="mt-5 inline-block font-display text-accent hover:underline">
                Our six engineering priorities
              </Link>
            </div>
          </div>
          <BypassDiagram />
        </div>
      </section>

      {/* Manufacturing */}
      <section className="relative overflow-hidden border-t border-line">
        <div className="relative h-[70vh] min-h-[480px] w-full" data-mask>
          <div className="absolute inset-0" data-parallax="0.25">
            <SolarArt variant="line" className="h-[120%] w-full" />
          </div>
          <div className="absolute inset-0 bg-gradient-to-t from-obsidian via-obsidian/40 to-transparent" />
          <div className="wrap absolute inset-x-0 bottom-0 pb-14">
            <RevealHeading lines={["BUILT FOR THE FUTURE OF", "SOLAR MANUFACTURING."]} className="display-l max-w-[20ch]" />
            <div className="mt-8 flex flex-wrap items-end justify-between gap-6" data-reveal>
              <p className="body-copy max-w-xl">{c["manufacturing.intro"]}</p>
              <Link href="/manufacturing" className="btn btn-ghost bg-obsidian/50 backdrop-blur" data-magnetic>
                See how we manufacture
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Industries */}
      <section className="py-28 md:py-40">
        <div className="wrap">
          <div className="mb-12 grid gap-6 lg:grid-cols-[1.3fr_1fr] lg:items-end">
            <RevealHeading lines={["POWERING THE", "SOLAR VALUE CHAIN."]} className="display-l" />
            <p className="body-copy" data-reveal>
              {c["industries.intro"]}
            </p>
          </div>
          <IndustryPanels />
        </div>
      </section>

      <CTABand />
    </>
  );
}
