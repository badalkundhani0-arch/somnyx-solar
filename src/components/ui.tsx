import Link from "next/link";
import { Photo } from "./Photo";
import type { ReactNode } from "react";
import { STATUS_LABELS, type ProductStatus, type Spec } from "@/lib/seed";

/** Headline with a masked line-by-line reveal. Pass lines explicitly for control over breaks. */
export function RevealHeading({
  lines,
  as: Tag = "h2",
  className = "display-l",
}: {
  lines: string[];
  as?: "h1" | "h2" | "h3";
  className?: string;
}) {
  return (
    <Tag className={className}>
      {lines.map((l, i) => (
        <span key={i} data-reveal-line>
          <span>{l}</span>
        </span>
      ))}
    </Tag>
  );
}

/** Small engineering-style section marker: a hairline leader and a plain label. */
export function Marker({ children }: { children: ReactNode }) {
  return (
    <div className="mb-8 flex items-center gap-4" data-reveal>
      <div className="leader w-16" />
      <span className="label">{children}</span>
    </div>
  );
}

export function PageHero({ marker, lines, lede, children }: { marker: string; lines: string[]; lede?: string; children?: ReactNode }) {
  return (
    <section className="relative overflow-hidden pb-16 pt-40 md:pb-24 md:pt-52">
      <div className="blueprint-grid pointer-events-none absolute inset-0 [mask-image:radial-gradient(ellipse_at_top_left,black,transparent_70%)]" />
      <div className="pointer-events-none absolute -left-40 -top-40 h-[36rem] w-[36rem] rounded-full bg-cyan/[0.06] blur-3xl" />
      <div className="wrap relative">
        <Marker>{marker}</Marker>
        <RevealHeading as="h1" lines={lines} className="display-l max-w-[14ch]" />
        {lede && (
          <p className="lede mt-10" data-reveal data-reveal-delay="0.25">
            {lede}
          </p>
        )}
        {children}
      </div>
    </section>
  );
}

export function StatusBadge({ status }: { status: ProductStatus }) {
  const color = status === "available" ? "text-ok bg-ok" : "text-warn bg-warn";
  return (
    <span className={`inline-flex items-center gap-2 text-sm ${color.split(" ")[0]}`}>
      <span className={`relative h-2 w-2 rounded-full ${color.split(" ")[1]}`}>
        <span className={`absolute inset-0 animate-ping rounded-full opacity-60 ${color.split(" ")[1]}`} />
      </span>
      {STATUS_LABELS[status]}
    </span>
  );
}

export function SpecTable({ specs, caption }: { specs: Spec[]; caption?: string }) {
  return (
    <table className="w-full border-collapse text-left">
      {caption && <caption className="label mb-3 text-left">{caption}</caption>}
      <tbody>
        {specs.map((s) => (
          <tr key={s.label} className="border-b border-line align-baseline">
            <th scope="row" className="py-4 pr-4 text-[0.95rem] font-normal text-silver">
              {s.label}
            </th>
            <td className="py-4 text-right font-display text-lg tracking-tight text-white tabular-nums">
              {s.value}
              {s.note && <span className="mt-0.5 block font-sans text-xs tracking-normal text-steel">{s.note}</span>}
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

export function CTABand({ title = "Planning a module programme?", body, photo }: { title?: string; body?: string; photo?: string }) {
  return (
    <section className={`relative overflow-hidden py-16 md:py-36 ${photo ? "on-photo bg-[#17130F]" : "border-t border-line"}`}>
      {photo ? (
        <>
          <div className="absolute inset-0" data-parallax="0.2">
            <Photo src={photo} alt="" className="h-[120%] w-full" />
          </div>
          <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(23,19,15,0.88)_0%,rgba(23,19,15,0.55)_60%,rgba(23,19,15,0.35)_100%)]" />
        </>
      ) : (
        <div className="pointer-events-none absolute right-[-10rem] top-1/2 h-[30rem] w-[30rem] -translate-y-1/2 rounded-full bg-cyan/[0.08] blur-3xl" />
      )}
      <div className="wrap relative grid items-end gap-10 md:grid-cols-[1.4fr_1fr]">
        <div>
          <RevealHeading lines={[title]} className="display-m max-w-[18ch]" />
          <p className="lede mt-6" data-reveal>
            {body ?? "Tell us your module format, current and volumes. We will reply with pricing, lead times and the right configuration for your line."}
          </p>
        </div>
        <div className="flex flex-wrap gap-3 md:justify-end" data-reveal>
          <Link href="/request-quote" className="btn btn-primary" data-magnetic>
            Request a Quotation
          </Link>
          <Link href="/contact" className={`btn ${photo ? "btn-on-photo" : "btn-ghost"}`} data-magnetic>
            Talk to engineering
          </Link>
        </div>
      </div>
    </section>
  );
}
