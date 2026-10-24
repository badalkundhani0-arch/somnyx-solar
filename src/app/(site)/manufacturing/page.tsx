import type { Metadata } from "next";
import { getContent } from "@/lib/content";
import { ProcessJourney } from "@/components/ProcessJourney";
import { SolarArt } from "@/components/Art";
import { CTABand, Marker, PageHero, RevealHeading } from "@/components/ui";

export const metadata: Metadata = {
  title: "Manufacturing",
  description: "Somnyx Solar manufactures 3-split PV junction boxes in Gujarat, India, with 3.6 GW of annual capacity: engineering, sourcing, assembly, inspection, validation and packaging.",
  alternates: { canonical: "/manufacturing" },
};

const PILLARS = [
  { t: "Automation", b: "The most repeatable, quality-critical steps run on automated stations, sized for 3.6 GW of output a year." },
  { t: "Process repeatability", b: "Fixtures, defined work sequences and error-proofing so every unit is built the same way by any operator on any shift." },
  { t: "Quality-focused production", b: "Inspection designed into the line rather than added at the end, with records that follow each batch." },
  { t: "Scalable manufacturing", b: "A layout that adds stations and lines without redesigning the product or the process." },
  { t: "Indian supply chain", b: "Components sourced from Indian suppliers wherever they meet our technical requirements." },
];

export default async function ManufacturingPage() {
  const c = await getContent();
  return (
    <>
      <PageHero marker="Manufacturing" lines={["BUILT FOR THE FUTURE OF", "SOLAR MANUFACTURING."]} lede={c["manufacturing.intro"]}>
        <dl className="mt-14 grid max-w-4xl grid-cols-2 border-t border-line md:grid-cols-3" data-stagger>
          {[
            ["3.6 GW", "Annual production capacity"],
            ["Gujarat", "Manufacturing in India"],
            ["3", "Current ratings, 25 to 35 A"],
          ].map(([v, l]) => (
            <div key={l} className="flex flex-col-reverse py-7 pr-6">
              <dt className="mt-2 text-sm text-silver">{l}</dt>
              <dd className="font-display text-4xl tracking-tight md:text-5xl">{v}</dd>
            </div>
          ))}
        </dl>
      </PageHero>

      <section className="relative h-[75vh] min-h-[460px] overflow-hidden" data-mask>
        <div className="absolute inset-0" data-parallax="0.3">
          <SolarArt variant="line" className="h-[125%] w-full" />
        </div>
        <div className="absolute inset-0 bg-gradient-to-b from-obsidian/30 via-transparent to-obsidian" />
      </section>

      <div className="py-24 lg:py-0">
        <ProcessJourney />
      </div>

      <section className="border-t border-line py-28 md:py-36">
        <div className="wrap grid gap-14 lg:grid-cols-[1fr_1.4fr]">
          <div>
            <Marker>How we build</Marker>
            <RevealHeading lines={["Quality is a", "process decision."]} className="display-m" />
          </div>
          <dl className="border-t border-line" data-stagger>
            {PILLARS.map((p) => (
              <div key={p.t} className="grid gap-2 border-b border-line py-7 md:grid-cols-[1fr_1.4fr] md:gap-10">
                <dt className="font-display text-xl tracking-tight">{p.t}</dt>
                <dd className="text-silver">{p.b}</dd>
              </div>
            ))}
          </dl>
        </div>
      </section>

      <section className="border-t border-line py-28 md:py-36">
        <div className="wrap grid items-center gap-12 lg:grid-cols-2">
          <div>
            <Marker>Why Gujarat</Marker>
            <RevealHeading lines={["Close to the modules", "we serve."]} className="display-m" />
            <p className="lede mt-8" data-reveal>
              Gujarat is home to a large share of India&rsquo;s solar module manufacturing. Making junction boxes here shortens supply lines, simplifies engineering
              collaboration with customers and supports a more resilient domestic supply chain.
            </p>
          </div>
          <div className="relative aspect-[4/3] overflow-hidden rounded-[28px] border border-line">
            <SolarArt variant="supply" className="absolute inset-0 h-full w-full" />
          </div>
        </div>
      </section>
      <CTABand title="Interested in supplying or partnering?" body="We work with component suppliers and equipment partners. Procurement enquiries are welcome." />
    </>
  );
}
