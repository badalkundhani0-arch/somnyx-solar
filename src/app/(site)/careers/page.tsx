import type { Metadata } from "next";
import { PageHero, Marker, RevealHeading } from "@/components/ui";
import { CAREERS_EMAIL, LOCATION } from "@/lib/brand";

export const metadata: Metadata = {
  title: "Careers",
  description: "Build the components India's solar industry depends on. Careers at Somnyx Solar in Surat, Gujarat: engineering, production, quality, supply chain and sales.",
  alternates: { canonical: "/careers" },
};

const WHY = [
  { t: "Work that matters", b: "Every module that leaves a factory with our junction boxes carries its power through something you helped build." },
  { t: "Real engineering", b: "Electrical, thermal, materials and process problems, solved on the line rather than in slides." },
  { t: "Scale from day one", b: "A 3.6 GW facility, with the systems and discipline that output demands." },
  { t: "Grow with us", b: "A growing company in a growing industry, where people who take ownership take on more." },
];

const AREAS = [
  { t: "Engineering", b: "Product, electrical and process engineering: diode selection, thermal design, sealing, fixtures and automation." },
  { t: "Production", b: "Operators, line leaders and maintenance technicians running automated and semi-automated stations." },
  { t: "Quality", b: "Inspection, testing, traceability and supplier quality." },
  { t: "Supply chain", b: "Procurement, planning, stores and logistics for components and finished sets." },
  { t: "Sales and customer support", b: "Working with module manufacturers on quotations, qualification and delivery." },
];

export default function CareersPage() {
  const subject = encodeURIComponent("Careers: [role or area]");
  return (
    <>
      <PageHero
        marker="Careers"
        lines={["Build what the", "industry runs on."]}
        lede={`We make the junction boxes that carry a solar module's power, at our facility in ${LOCATION}. If you want to do careful, practical work that ends up on rooftops and solar parks, we would like to hear from you.`}
      />

      <section className="pb-16 md:pb-28">
        <div className="wrap">
          <ul className="grid gap-px overflow-hidden rounded-[28px] border border-line bg-line md:grid-cols-2 lg:grid-cols-4" data-stagger>
            {WHY.map((w) => (
              <li key={w.t} className="bg-obsidian p-8">
                <h2 className="font-display text-xl tracking-tight">{w.t}</h2>
                <p className="mt-3 text-silver">{w.b}</p>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="border-t border-line py-16 md:py-32">
        <div className="wrap grid gap-12 lg:grid-cols-[1fr_1.3fr] lg:gap-20">
          <div>
            <Marker>Where you could work</Marker>
            <RevealHeading lines={["Teams we", "hire for."]} className="display-m" />
            <p className="lede mt-6" data-reveal>
              We don&rsquo;t keep a fixed list of openings. Tell us which area fits you and we will get in touch when there is a role that matches.
            </p>
          </div>
          <ul className="divide-y divide-line border-y border-line" data-stagger>
            {AREAS.map((a) => (
              <li key={a.t} className="py-6">
                <h3 className="font-display text-xl tracking-tight">{a.t}</h3>
                <p className="mt-2 text-silver">{a.b}</p>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="border-t border-line py-16 md:py-32">
        <div className="wrap">
          <div className="rounded-[28px] border border-line bg-graphite p-8 md:p-14" data-reveal>
            <Marker>How to apply</Marker>
            <h2 className="max-w-[20ch] font-display text-3xl tracking-tight md:text-5xl">Send us your CV and a few lines about you.</h2>
            <ol className="mt-8 grid gap-6 text-silver md:grid-cols-3">
              <li>
                <span className="font-display text-accent">1.</span> Email your CV to <a className="text-accent hover:underline" href={`mailto:${CAREERS_EMAIL}?subject=${subject}`}>{CAREERS_EMAIL}</a>.
              </li>
              <li>
                <span className="font-display text-accent">2.</span> Put &ldquo;Careers&rdquo; and the area you&rsquo;re interested in in the subject line.
              </li>
              <li>
                <span className="font-display text-accent">3.</span> Tell us what you have built, fixed or improved, in a few lines.
              </li>
            </ol>
            <a href={`mailto:${CAREERS_EMAIL}?subject=${subject}`} className="btn btn-primary mt-10">
              Email your CV
            </a>
          </div>
        </div>
      </section>
    </>
  );
}
