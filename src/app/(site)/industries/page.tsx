import type { Metadata } from "next";
import { getContent } from "@/lib/content";
import { IndustryPanels } from "@/components/IndustryPanels";
import { CTABand, PageHero } from "@/components/ui";

export const metadata: Metadata = {
  title: "Industries & Applications",
  description: "Where Somnyx PV junction boxes are intended to serve: module manufacturers, utility-scale and C&I modules, OEM and ODM programmes and component procurement.",
  alternates: { canonical: "/industries" },
};

export default async function IndustriesPage() {
  const c = await getContent();
  return (
    <>
      <PageHero marker="Industries & Applications" lines={["POWERING THE", "SOLAR VALUE CHAIN."]} lede={c["industries.intro"]} />
      <section className="pb-28 md:pb-36">
        <div className="wrap">
          <IndustryPanels />
        </div>
      </section>
      <CTABand />
    </>
  );
}
