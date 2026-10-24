import type { Metadata } from "next";
import { EMAILS } from "@/lib/brand";

export const metadata: Metadata = { title: "Privacy Policy", alternates: { canonical: "/privacy" } };

export default function PrivacyPage() {
  return (
    <section className="pb-28 pt-36 md:pt-44">
      <div className="wrap max-w-4xl prose-legal">
        <h1 className="display-m">Privacy Policy</h1>
        <p className="mt-6 text-steel">Last updated 24 October 2026</p>

        <h2>Who we are</h2>
        <p>
          This website is operated by Somnyx Solar, a business of Somnyx Industries, based in Surat, Gujarat, India. For any privacy question, write to{" "}
          <a href={`mailto:${EMAILS.sales}`}>{EMAILS.sales}</a>.
        </p>

        <h2>What we collect</h2>
        <ul>
          <li>Details you enter in our request-for-quotation and contact forms: name, company, business email, phone or WhatsApp number, country, product requirements, delivery information and your message.</li>
          <li>Files you choose to attach, such as drawings, datasheets and specifications.</li>
          <li>A one-way hashed form of your connection&rsquo;s IP address, kept briefly to limit spam and abuse. We do not store the IP address itself.</li>
        </ul>
        <p>We do not use advertising or tracking cookies. If we enable website analytics, we use a privacy-focused, cookie-free service that does not identify individual visitors.</p>

        <h2>How we use it</h2>
        <ul>
          <li>To respond to your enquiry, prepare quotations and share technical information you request.</li>
          <li>To keep a record of commercial discussions with your organisation.</li>
          <li>To protect the website from spam and misuse.</li>
        </ul>
        <p>We process this information with your consent, given when you submit a form, and for our legitimate interest in responding to business enquiries. We do not sell your information or use it for unrelated marketing.</p>

        <h2>Who processes it</h2>
        <p>
          We use service providers to host the website and its database, store uploaded files and deliver email notifications. They process data only on our instructions. Some of these providers may store
          data outside India.
        </p>

        <h2>How long we keep it</h2>
        <p>We keep enquiry records for as long as needed to handle your request and any resulting business relationship, and then for up to three years unless a longer period is required by law.</p>

        <h2>Your rights</h2>
        <p>
          Subject to applicable law, including India&rsquo;s Digital Personal Data Protection Act, 2023, you may ask to access, correct or erase your personal data, or withdraw consent for future
          processing. Write to <a href={`mailto:${EMAILS.sales}`}>{EMAILS.sales}</a> and we will respond within a reasonable time.
        </p>

        <h2>Changes</h2>
        <p>We will update this page if our practices change and show the date of the latest revision above.</p>
      </div>
    </section>
  );
}
