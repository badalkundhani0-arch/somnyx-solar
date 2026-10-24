import type { Metadata } from "next";
import { getContent } from "@/lib/content";
import { CTABand, Marker, PageHero, RevealHeading } from "@/components/ui";
import { LOCATION } from "@/lib/brand";

export const metadata: Metadata = {
  title: "About Us",
  description: "Somnyx Solar is a PV junction box manufacturer in Surat, Gujarat, with 3.6 GW of annual capacity supplying module manufacturers.",
  alternates: { canonical: "/about" },
};

const VALUES = [
  { t: "Engineering-led products", b: "Products are defined by engineering requirements and customer modules, not by catalogue copying." },
  { t: "Reliability as a design objective", b: "Thermal margin, sealing and material ageing are designed in from the first concept." },
  { t: "Transparent technical communication", b: "Clear specifications, drawings and datasheets for every variant we supply." },
  { t: "Customer-oriented specifications", b: "Cable lengths, connectors and ratings are shaped around the modules they will serve." },
  { t: "Manufacturing at scale", b: "3.6 GW of annual junction box capacity at our facility in Gujarat." },
  { t: "Commitment to India's solar ecosystem", b: "Domestic capability in a component the industry depends on." },
];

export default async function AboutPage() {
  const c = await getContent();
  return (
    <>
      <PageHero marker={LOCATION} lines={["ENGINEERING A", "CLEANER TOMORROW."]} lede={c["about.lead"]} />
      <section className="pb-28 md:pb-36">
        <div className="wrap grid gap-12 lg:grid-cols-[1fr_1.3fr] lg:gap-20">
          <div>
            <Marker>Who we are</Marker>
            <RevealHeading lines={["Built for the", "modules of today."]} className="display-m" />
          </div>
          <div className="space-y-6" data-reveal>
            {c["about.body"].split(/\n\s*\n/).map((para, i) => (
              <p key={i} className="lede">
                {para}
              </p>
            ))}
          </div>
        </div>
      </section>
      <section className="border-t border-line py-28 md:py-36">
        <div className="wrap">
          <Marker>What we stand for</Marker>
          <ul className="grid gap-px overflow-hidden rounded-[28px] border border-line bg-line md:grid-cols-2 lg:grid-cols-3" data-stagger>
            {VALUES.map((v) => (
              <li key={v.t} className="bg-obsidian p-8 md:p-10">
                <h3 className="font-display text-2xl tracking-tight">{v.t}</h3>
                <p className="mt-3 text-silver">{v.b}</p>
              </li>
            ))}
          </ul>
        </div>
      </section>
      <CTABand title="Let's build something that lasts" />
    </>
  );
}
