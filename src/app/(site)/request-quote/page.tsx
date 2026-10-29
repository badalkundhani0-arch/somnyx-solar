import type { Metadata } from "next";
import { getContent } from "@/lib/content";
import { RfqForm } from "@/components/forms/RfqForm";
import { Marker, RevealHeading } from "@/components/ui";
import { EMAILS } from "@/lib/brand";

export const metadata: Metadata = {
  title: "Request a Quote",
  description: "Request a quotation or specifications for Somnyx PV junction boxes. Share your module requirements, volumes and delivery location.",
  alternates: { canonical: "/request-quote" },
};

type Props = { searchParams: Promise<{ variant?: string; intent?: string }> };

export default async function RequestQuotePage({ searchParams }: Props) {
  const sp = await searchParams;
  const c = await getContent();
  const intent = sp.intent === "specifications" ? "specifications" : "quotation";
  return (
    <section className="relative pb-28 pt-36 md:pt-44">
      <div className="blueprint-grid pointer-events-none absolute inset-x-0 top-0 h-[40rem] [mask-image:linear-gradient(black,transparent)]" />
      <div className="wrap relative grid gap-14 lg:grid-cols-[1fr_1.5fr] lg:gap-20">
        <div className="lg:sticky lg:top-32 lg:self-start">
          <Marker>{intent === "specifications" ? "Request specifications" : "Request for quotation"}</Marker>
          <RevealHeading as="h1" lines={intent === "specifications" ? ["Request", "specifications."] : ["Request a", "quotation."]} className="display-l" />
          <p className="lede mt-8" data-reveal>
            {c["rfq.intro"]}
          </p>
          <p className="mt-8 text-sm text-steel">
            Prefer email? Write to{" "}
            <a className="text-accent hover:underline" href={`mailto:${EMAILS.sales}`}>
              {EMAILS.sales}
            </a>
          </p>
        </div>
        <div className="rounded-[28px] border border-line bg-graphite/60 p-6 backdrop-blur md:p-10">
          <RfqForm initialVariant={sp.variant} intent={intent} uploadMode="unavailable" devMode={process.env.NODE_ENV !== "production" || process.env.VERCEL_ENV === "preview"} />
        </div>
      </div>
    </section>
  );
}
