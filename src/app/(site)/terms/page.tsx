import type { Metadata } from "next";
import { EMAILS } from "@/lib/brand";

export const metadata: Metadata = { title: "Terms of Use", alternates: { canonical: "/terms" } };

export default function TermsPage() {
  return (
    <section className="pb-28 pt-36 md:pt-44">
      <div className="wrap max-w-4xl prose-legal">
        <h1 className="display-m">Terms of Use</h1>
        <p className="mt-6 text-steel">Last updated 24 October 2026</p>

        <h2>About this website</h2>
        <p>This website is operated by Somnyx Solar, a business of Somnyx Industries, Surat, Gujarat, India. By using it you accept these terms.</p>

        <h2>Product information</h2>
        <p>Specifications on this website describe our standard products and may be updated as products improve. The binding specification for any order is the datasheet and drawing confirmed in your quotation.</p>
        <p>3D models, drawings and illustrations are representative and are not manufacturing drawings.</p>

        <h2>Quotations</h2>
        <p>Submitting a request does not create a contract. Any quotation we issue is indicative unless it expressly states otherwise, and supply is subject to a separate written agreement.</p>

        <h2>Intellectual property</h2>
        <p>The Somnyx Solar name, logo, text, graphics and 3D models on this website belong to Somnyx Industries. You may view and print pages for evaluating our products. Other reuse requires our written permission.</p>

        <h2>Information you send us</h2>
        <p>You confirm that you are entitled to share any documents you upload. We treat drawings and specifications you send as confidential and use them only to respond to your enquiry.</p>

        <h2>Liability</h2>
        <p>
          We take care to keep this website accurate, but provide it as is. To the extent permitted by law, we are not liable for decisions made on the basis of general information published here.
        </p>

        <h2>Governing law</h2>
        <p>These terms are governed by the laws of India, and the courts at Surat, Gujarat have jurisdiction.</p>

        <h2>Contact</h2>
        <p>
          Questions about these terms: <a href={`mailto:${EMAILS.sales}`}>{EMAILS.sales}</a>.
        </p>
      </div>
    </section>
  );
}
