import { Nav } from "@/components/Nav";
import { Footer } from "@/components/Footer";
import { Motion } from "@/components/Motion";
import { Magnetic } from "@/components/Magnetic";
import { getProducts } from "@/lib/products";
import { STATUS_LABELS } from "@/lib/seed";
import { SITE_URL, EMAILS, TAGLINE } from "@/lib/brand";
import Script from "next/script";

export const dynamic = "force-dynamic";

export default async function SiteLayout({ children }: { children: React.ReactNode }) {
  const products = await getProducts();
  const navProducts = products.map((p) => ({ id: p.id, code: p.code, currentRating: p.currentRating, tagline: p.tagline, statusLabel: STATUS_LABELS[p.status] }));
  const org = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: "Somnyx Solar",
    parentOrganization: { "@type": "Organization", name: "Somnyx Industries" },
    url: SITE_URL,
    logo: `${SITE_URL}/icon.svg`,
    slogan: TAGLINE,
    address: { "@type": "PostalAddress", addressLocality: "Surat", addressRegion: "Gujarat", addressCountry: "IN" },
    contactPoint: [
      { "@type": "ContactPoint", contactType: "sales", email: EMAILS.sales },
      { "@type": "ContactPoint", contactType: "technical support", email: EMAILS.technical },
    ],
  };
  const plausible = process.env.NEXT_PUBLIC_PLAUSIBLE_DOMAIN;
  return (
    <>
      <Nav products={navProducts} />
      <main id="main">{children}</main>
      <Footer products={products} />
      <Motion />
      <Magnetic />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(org) }} />
      {plausible && <Script defer data-domain={plausible} src="https://plausible.io/js/script.js" strategy="afterInteractive" />}
    </>
  );
}
