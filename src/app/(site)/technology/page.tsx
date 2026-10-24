import type { Metadata } from "next";
import { getContent } from "@/lib/content";
import { getProducts } from "@/lib/products";
import { BypassDiagram } from "@/components/BypassDiagram";
import { Priorities } from "@/components/Priorities";
import { CTABand, Marker, RevealHeading } from "@/components/ui";
import { PhotoPageHero } from "@/components/PhotoHero";
import { LazyExplorer } from "@/components/three/Lazy";

export const metadata: Metadata = {
  title: "Technology & Engineering",
  description: "How Somnyx Solar engineers 3-split PV junction boxes: bypass diodes, thermal design, sealing, materials, manufacturability and quality assurance.",
  alternates: { canonical: "/technology" },
};

export default async function TechnologyPage() {
  const [c, products] = await Promise.all([getContent(), getProducts()]);
  return (
    <>
      <PhotoPageHero photo={c["photo.technology.hero"]} marker="Technology & Engineering" lines={["RELIABILITY BEGINS", "WITH ENGINEERING."]} lede={c["technology.intro"]} />

      <section className="py-24 md:py-32">
        <div className="wrap">
          <Priorities />
        </div>
      </section>

      <section className="border-t border-line py-28 md:py-36">
        <div className="wrap">
          <div className="mb-12 grid gap-6 lg:grid-cols-[1.3fr_1fr] lg:items-end">
            <div>
              <Marker>Why bypass diodes exist</Marker>
              <RevealHeading lines={["Shade one substring.", "Keep the rest working."]} className="display-m" />
            </div>
            <p className="body-copy" data-reveal>
              Crystalline modules are usually wired as three substrings, each protected by its own bypass diode. In a 3-split junction box, each diode sits in its own box. The diagram shows what happens when one substring is shaded.
            </p>
          </div>
          <BypassDiagram />
        </div>
      </section>

      <section className="border-t border-line py-28 md:py-36">
        <div className="wrap">
          <div className="mb-12 grid gap-6 lg:grid-cols-[1.3fr_1fr] lg:items-end">
            <RevealHeading lines={["ENGINEERED FROM", "THE INSIDE OUT."]} className="display-l" />
            <p className="body-copy" data-reveal>
              Inspect each component of the 3-split box and the engineering behind it.
            </p>
          </div>
          <LazyExplorer modelUrl={products.find((p) => p.modelUrl)?.modelUrl ?? null} />
        </div>
      </section>
      <CTABand title="Talk to us about your module's requirements" />
    </>
  );
}
