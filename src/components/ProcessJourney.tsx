import { HorizontalPin } from "./HorizontalPin";
import { RevealHeading } from "./ui";

const STAGES = [
  {
    title: "Product engineering",
    body: "Current rating, diode selection, enclosure geometry and creepage distances defined against customer module requirements and IEC/EN 62790.",
    plan: "Design reviews with module manufacturers for every new configuration.",
    icon: "M8 40 L40 8 M14 40h-6v-6 M28 12l8 8 M20 20l8 8",
  },
  {
    title: "Component sourcing",
    body: "Qualified suppliers for diodes, terminal metals, housing polymers, PV cable and connectors, with traceability on every lot.",
    plan: "Dual sourcing for critical parts.",
    icon: "M6 14h36v24H6z M6 22h36 M16 14V8h16v6",
  },
  {
    title: "Assembly",
    body: "Terminal insertion, diode placement and joining, cable termination and housing closure in a repeatable, fixtured sequence.",
    plan: "Automated and semi-automated stations sized for 3.6 GW a year.",
    icon: "M10 36h28 M14 36V20h20v16 M24 20V8 M18 12h12",
  },
  {
    title: "Inspection",
    body: "In-line checks on joints, diode orientation, polarity and cable assembly, with results recorded against each batch.",
    plan: "Electrical end-of-line testing on every unit.",
    icon: "M21 6a15 15 0 1 0 0 30a15 15 0 1 0 0-30z M32 32l10 10",
  },
  {
    title: "Validation",
    body: "Testing aligned to IEC/EN 62790, with reliability sampling from production batches.",
    plan: "Ongoing reliability sampling on every production run.",
    icon: "M8 26l10 10 22-24",
  },
  {
    title: "Packaging",
    body: "Packed in complete sets, protected for transit and labelled for traceability, ready for module production lines.",
    plan: "Packaging formats agreed with each customer's line.",
    icon: "M6 16l18-9 18 9v18l-18 9-18-9z M6 16l18 9 18-9 M24 25v18",
  },
];

export function ProcessJourney() {
  return (
    <HorizontalPin
      cols="md:grid-cols-2 lg:grid-cols-3"
      header={
        <div className="wrap mb-10 grid gap-6 lg:mb-12 lg:grid-cols-[1.2fr_1fr] lg:items-end">
          <RevealHeading lines={["From drawing", "to dispatch."]} className="display-m" />
          <p className="body-copy" data-reveal>
            How every Somnyx junction box is made at our 3.6 GW facility in Gujarat.
          </p>
        </div>
      }
    >
      {STAGES.map((s, i) => (
        <article
          key={s.title}
          className="relative flex min-h-[340px] flex-col justify-between overflow-hidden rounded-[28px] border border-line bg-graphite p-7 md:p-9"
        >
          <div className="blueprint-grid absolute inset-0 opacity-50" />
          <div className="relative flex items-start justify-between">
            <span className="font-display text-7xl font-medium tracking-tighter text-line-strong lg:text-8xl">{i + 1}</span>
            <svg viewBox="0 0 48 48" className="h-12 w-12 text-accent" aria-hidden="true">
              <path d={s.icon} fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
          <div className="relative mt-14">
            <h3 className="display-s">{s.title}</h3>
            <p className="mt-3 text-silver">{s.body}</p>
            <p className="mt-5 border-t border-line pt-4 text-sm text-steel">
              {s.plan}
            </p>
          </div>
        </article>
      ))}
    </HorizontalPin>
  );
}
