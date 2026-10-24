import type { Metadata } from "next";
import { getContent } from "@/lib/content";
import { ContactForm } from "@/components/forms/ContactForm";
import { Marker, RevealHeading } from "@/components/ui";
import { EMAILS, LOCATION } from "@/lib/brand";

export const metadata: Metadata = {
  title: "Contact",
  description: "Contact Somnyx Solar in Surat, Gujarat: sales, procurement and engineering enquiries.",
  alternates: { canonical: "/contact" },
};

const ROUTES = [
  { k: "sales" as const, t: "Sales and customer enquiries", b: "Quotations, samples, volumes and commercial terms." },
  { k: "procurement" as const, t: "Procurement and supplier enquiries", b: "Component suppliers, materials and equipment partners." },
  { k: "technical" as const, t: "Engineering and technical enquiries", b: "Specifications, module integration and design questions." },
];

export default async function ContactPage({ searchParams }: { searchParams: Promise<{ topic?: string }> }) {
  const [c, sp] = await Promise.all([getContent(), searchParams]);
  return (
    <section className="relative pb-28 pt-36 md:pt-44">
      <div className="blueprint-grid pointer-events-none absolute inset-x-0 top-0 h-[40rem] [mask-image:linear-gradient(black,transparent)]" />
      <div className="wrap relative">
        <Marker>Contact</Marker>
        <RevealHeading as="h1" lines={["Talk to the people", "building it."]} className="display-l" />
        <p className="lede mt-8" data-reveal>
          {c["contact.intro"]}
        </p>

        <div className="mt-16 grid gap-14 lg:grid-cols-[1fr_1.4fr] lg:gap-20">
          <div>
            <address className="not-italic">
              <p className="font-display text-2xl tracking-tight">Somnyx Solar</p>
              <p className="mt-1 text-silver">{LOCATION}</p>
            </address>
            <ul className="mt-10 border-t border-line" data-stagger>
              {ROUTES.map((r) => (
                <li key={r.k} className="border-b border-line py-6">
                  <p className="text-sm text-steel">{r.t}</p>
                  <a href={`mailto:${EMAILS[r.k]}`} className="mt-1 block break-all font-display text-xl tracking-tight text-white transition-colors hover:text-accent md:text-2xl">
                    {EMAILS[r.k]}
                  </a>
                  <p className="mt-2 text-sm text-silver">{r.b}</p>
                </li>
              ))}
            </ul>
          </div>
          <div className="rounded-[28px] border border-line bg-graphite/60 p-6 md:p-10">
            <ContactForm initialTopic={sp.topic} devMode={process.env.NODE_ENV !== "production" || process.env.VERCEL_ENV === "preview"} />
          </div>
        </div>
      </div>
    </section>
  );
}
