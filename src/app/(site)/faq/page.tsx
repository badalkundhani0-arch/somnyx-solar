import type { Metadata } from "next";
import Link from "next/link";
import { PageHero, CTABand } from "@/components/ui";
import { EMAILS } from "@/lib/brand";

export const metadata: Metadata = {
  title: "FAQ",
  description: "Answers to common questions about Somnyx 3-split PV junction boxes: ratings, customisation, samples, quotations, standards and supply.",
  alternates: { canonical: "/faq" },
};

type QA = { q: string; a: string; link?: { href: string; label: string } };

const GROUPS: { title: string; items: QA[] }[] = [
  {
    title: "Products",
    items: [
      {
        q: "What junction boxes do you make?",
        a: "We make 3-split photovoltaic junction boxes in three current ratings: SJB-1525 (25 A), SJB-1530 (30 A) and SJB-1535 (35 A). All three are rated for 1500 V DC systems, sealed to IP68, carry one bypass diode per split box and are built to IEC/EN 62790.",
        link: { href: "/products", label: "Compare the three ratings" },
      },
      {
        q: "Which current rating does my module need?",
        a: "It depends on your module's short-circuit current, including any bifacial gain, plus the design margin your engineering team applies. As a rule of thumb, the 25 A box suits mainstream modules, the 30 A box suits higher-current large-format and bifacial modules, and the 35 A box suits the highest-current formats. Send us your module datasheet and we will recommend a rating.",
        link: { href: "/insights/choosing-a-junction-box-current-rating", label: "Read the rating guide" },
      },
      {
        q: "What is a 3-split junction box?",
        a: "Instead of one box holding all three bypass diodes, a 3-split design uses three small boxes, each with one diode and its terminals. It spreads diode heat across three enclosures and places each box close to where its ribbons leave the module.",
        link: { href: "/insights/three-split-vs-single-junction-box", label: "3-split vs single boxes" },
      },
      {
        q: "What cable is fitted?",
        a: "Our boxes use 4 mm² PV cable. The typical length is 1400 mm per polarity, and cable length is configurable per order.",
      },
    ],
  },
  {
    title: "Customisation and OEM",
    items: [
      {
        q: "Can you customise cable length, connectors and labelling?",
        a: "Yes. Cable lengths, connector types, labelling and packaging can be specified to suit your module and production line, built on our 3-split platform.",
      },
      {
        q: "Do you work with OEM and ODM programmes?",
        a: "Yes. We build custom variants around a partner's specification. Tell us the module format, current and volumes, and our engineering team will work through the configuration with you.",
        link: { href: "/industries", label: "Industries and partnerships" },
      },
    ],
  },
  {
    title: "Quotations, samples and supply",
    items: [
      {
        q: "How do I get a quotation?",
        a: "Use the request for quotation form. It takes a few minutes and asks for your company details, the product and volumes you need, and your delivery location. Our sales team replies with pricing, lead times and the right configuration for your line.",
        link: { href: "/request-quote", label: "Request a quotation" },
      },
      {
        q: "Can I get samples?",
        a: `Yes. Ask for samples in your quotation request, or email ${EMAILS.sales} with your module details and the rating you want to evaluate.`,
      },
      {
        q: "What are your minimum order quantities and lead times?",
        a: "Both depend on the configuration and volumes, so we confirm them in our quotation rather than publishing fixed figures. Include your expected volumes and delivery dates in your request and we will reply with specifics.",
      },
      {
        q: "Where are your junction boxes made, and how much can you supply?",
        a: "At our facility in Gujarat, near Surat, with 3.6 GW of annual junction box capacity.",
        link: { href: "/manufacturing", label: "How we manufacture" },
      },
      {
        q: "Do you supply customers outside India?",
        a: "Yes. We supply module manufacturers in India and are a growing supplier to international markets. Tell us your delivery location in the quotation form and we will quote accordingly.",
      },
    ],
  },
  {
    title: "Quality and documentation",
    items: [
      {
        q: "Which standard are your junction boxes built to?",
        a: "IEC/EN 62790, the standard for junction boxes for photovoltaic modules. Our validation testing is aligned to its test categories, and every unit is electrically tested at the end of the line.",
        link: { href: "/quality", label: "Quality and testing" },
      },
      {
        q: "Can I get datasheets and drawings?",
        a: "Yes. Datasheets and drawings for each variant are available from our sales team, and published documents are listed on the Technical Resources page.",
        link: { href: "/resources", label: "Technical resources" },
      },
      {
        q: "Can I trace a junction box back to its production batch?",
        a: "Yes. Inspection results are recorded against each batch, and sets are labelled for traceability from component lot to finished set.",
      },
    ],
  },
  {
    title: "Contact",
    items: [
      {
        q: "Who do I contact with a technical question?",
        a: `Email our engineering team at ${EMAILS.technical}, or use the contact form and choose "Engineering and technical enquiries".`,
        link: { href: "/contact?topic=technical", label: "Contact engineering" },
      },
      { q: "I want to become a supplier. Who should I talk to?", a: `Our procurement team at ${EMAILS.procurement} handles component suppliers, materials and equipment partners.` },
    ],
  },
];

export default function FaqPage() {
  const ld = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: GROUPS.flatMap((g) => g.items).map((i) => ({ "@type": "Question", name: i.q, acceptedAnswer: { "@type": "Answer", text: i.a } })),
  };
  return (
    <>
      <PageHero marker="FAQ" lines={["Questions,", "answered."]} lede="The things module makers and procurement teams ask us most. If your question isn't here, our team is one email away." />
      <section className="pb-16 md:pb-28">
        <div className="wrap grid gap-12 lg:grid-cols-[16rem_1fr] lg:gap-20">
          <nav aria-label="FAQ sections" className="hidden lg:block">
            <ul className="sticky top-28 space-y-3 text-sm">
              {GROUPS.map((g) => (
                <li key={g.title}>
                  <a href={`#${g.title.toLowerCase().replace(/[^a-z]+/g, "-")}`} className="text-silver hover:text-accent">
                    {g.title}
                  </a>
                </li>
              ))}
            </ul>
          </nav>
          <div className="space-y-14">
            {GROUPS.map((g) => (
              <div key={g.title} id={g.title.toLowerCase().replace(/[^a-z]+/g, "-")} className="scroll-mt-28">
                <h2 className="label mb-4">{g.title}</h2>
                <div className="divide-y divide-line border-y border-line">
                  {g.items.map((i) => (
                    <details key={i.q} className="group py-5">
                      <summary className="flex cursor-pointer list-none items-start justify-between gap-6 font-display text-lg tracking-tight md:text-xl [&::-webkit-details-marker]:hidden">
                        {i.q}
                        <span aria-hidden="true" className="mt-1 text-2xl leading-none text-accent transition-transform group-open:rotate-45">
                          +
                        </span>
                      </summary>
                      <p className="mt-3 max-w-3xl text-silver">{i.a}</p>
                      {i.link && (
                        <Link href={i.link.href} className="mt-3 inline-block text-sm text-accent hover:underline">
                          {i.link.label} →
                        </Link>
                      )}
                    </details>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
      <CTABand title="Still have a question?" body="Tell us about your module and we will reply with an answer from the right team: sales, procurement or engineering." />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(ld) }} />
    </>
  );
}
