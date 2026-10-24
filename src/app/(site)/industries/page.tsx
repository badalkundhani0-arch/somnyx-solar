import type { Metadata } from "next";
import { getContent } from "@/lib/content";
import { IndustryPanels } from "@/components/IndustryPanels";
import { CTABand } from "@/components/ui";
import { PhotoPageHero } from "@/components/PhotoHero";

export const metadata: Metadata = {
  title: "Industries & Applications",
  description: "Where Somnyx PV junction boxes are intended to serve: module manufacturers, utility-scale and C&I modules, OEM and ODM programmes and component procurement.",
  alternates: { canonical: "/industries" },
};

export default async function IndustriesPage() {
  const c = await getContent();
  return (
    <>
      <PhotoPageHero photo={c["photo.industries.hero"]} marker="Industries & Applications" lines={["POWERING THE", "SOLAR VALUE CHAIN."]} lede={c["industries.intro"]} />
      <section className="py-24 md:py-32">
        <div className="wrap">
          <IndustryPanels photos={c} />
        </div>
      </section>
      <CTABand />
    </>
  );
}
