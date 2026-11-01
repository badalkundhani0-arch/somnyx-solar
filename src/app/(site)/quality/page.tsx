import type { Metadata } from "next";
import Link from "next/link";
import { getContent } from "@/lib/content";
import { CTABand, Marker, RevealHeading } from "@/components/ui";
import { PhotoPageHero } from "@/components/PhotoHero";

export const metadata: Metadata = {
  title: "Quality & Testing",
  description: "How Somnyx Solar builds quality into every 3-split junction box: qualified components, in-line inspection, end-of-line electrical testing, IEC/EN 62790 validation and full traceability.",
  alternates: { canonical: "/quality" },
};

const CHECKPOINTS = [
  {
    n: "01",
    t: "Design against the standard",
    b: "Current rating, diode selection, enclosure geometry and creepage distances are defined against the customer's module and IEC/EN 62790 before anything is built.",
  },
  {
    n: "02",
    t: "Qualified components",
    b: "Diodes, terminal metals, housing polymers, PV cable and connectors come from qualified suppliers, with traceability on every component lot.",
  },
  {
    n: "03",
    t: "Error-proofed assembly",
    b: "Fixtured, repeatable assembly with error-proofing of polarity and orientation, so every unit is built the same way by any operator on any shift.",
  },
  {
    n: "04",
    t: "In-line inspection",
    b: "Checks on joints, diode orientation, polarity and cable assembly during production, with results recorded against each batch.",
  },
  {
    n: "05",
    t: "End-of-line electrical test",
    b: "Every finished unit is electrically tested at the end of the line before it is packed.",
  },
  {
    n: "06",
    t: "Batch validation",
    b: "Reliability sampling from production batches, with testing aligned to the IEC/EN 62790 test categories.",
  },
];

const STANDARD = [
  { t: "Construction and insulation", b: "Insulation, creepage and clearance distances suitable for the system voltage, here 1500 V DC." },
  { t: "Ingress protection", b: "Protection of live parts against dust and water. Our split boxes are sealed to IP68." },
  { t: "Thermal behaviour", b: "Temperatures inside the box, including with a bypass diode conducting, kept within material and component limits." },
  { t: "Materials and ageing", b: "Housing, insulation and potting materials that keep their properties under UV, heat and humidity." },
  { t: "Mechanical robustness", b: "Cable retention, lid retention and the bond to the module surface." },
];

export default async function QualityPage() {
  const c = await getContent();
  return (
    <>
      <PhotoPageHero
        photo={c["photo.manufacturing.3"]}
        marker="Quality & Testing"
        lines={["QUALITY BUILT IN,", "NOT CHECKED ON."]}
        lede="A junction box has to work for 25 years on a roof or a tracker. We design quality into the product and the line, test every unit, and keep a record of how each batch was made."
      />

      <section className="py-16 md:py-32">
        <div className="wrap">
          <Marker>Six checkpoints</Marker>
          <RevealHeading lines={["From drawing to", "dispatch, checked."]} className="display-m max-w-[16ch]" />
          <ol className="mt-12 grid gap-px overflow-hidden rounded-[28px] border border-line bg-line md:grid-cols-2 lg:grid-cols-3" data-stagger>
            {CHECKPOINTS.map((s) => (
              <li key={s.n} className="bg-obsidian p-8 md:p-10">
                <p className="font-display text-4xl tracking-tight text-steel">{s.n}</p>
                <h3 className="mt-6 font-display text-2xl tracking-tight">{s.t}</h3>
                <p className="mt-3 text-silver">{s.b}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section className="border-t border-line py-16 md:py-32">
        <div className="wrap grid gap-12 lg:grid-cols-[1fr_1.3fr] lg:gap-20">
          <div>
            <Marker>The standard</Marker>
            <RevealHeading lines={["What IEC/EN 62790", "asks of a junction box."]} className="display-m" />
            <p className="lede mt-6" data-reveal>
              IEC/EN 62790 sets the safety requirements and tests for junction boxes used on photovoltaic modules. Our junction boxes are built to it, and our validation testing follows its test categories.
            </p>
          </div>
          <ul className="divide-y divide-line border-y border-line" data-stagger>
            {STANDARD.map((s) => (
              <li key={s.t} className="py-6">
                <h3 className="font-display text-xl tracking-tight">{s.t}</h3>
                <p className="mt-2 text-silver">{s.b}</p>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="border-t border-line py-16 md:py-32">
        <div className="wrap grid gap-6 md:grid-cols-2">
          <div className="rounded-[28px] border border-line bg-graphite p-8 md:p-12" data-reveal>
            <Marker>Traceability</Marker>
            <h2 className="font-display text-3xl tracking-tight">Every set has a history.</h2>
            <p className="mt-4 text-silver">
              Component lots are traced into production, inspection results are recorded against each batch, and finished sets are packed and labelled for traceability. If a question ever comes up in the field, we can follow a set back to how it was made.
            </p>
          </div>
          <div className="rounded-[28px] border border-line bg-graphite p-8 md:p-12" data-reveal>
            <Marker>Documentation</Marker>
            <h2 className="font-display text-3xl tracking-tight">Ask for what your audit needs.</h2>
            <p className="mt-4 text-silver">
              Datasheets, drawings and the quality documentation for your programme are available from our sales and technical teams as part of qualification.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link href="/resources" className="btn btn-ghost btn-sm">
                Technical resources
              </Link>
              <Link href="/contact?topic=technical" className="btn btn-ghost btn-sm">
                Talk to engineering
              </Link>
            </div>
          </div>
        </div>
      </section>

      <CTABand title="Qualifying a new junction box?" body="Tell us your module and line. We will support your qualification with samples, documentation and engineering time." />
    </>
  );
}
