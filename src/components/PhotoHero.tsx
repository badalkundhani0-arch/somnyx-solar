import Link from "next/link";
import { Photo } from "./Photo";

/** Full-bleed photo hero with a slow three-slide crossfade and a capacity strip. */
export function PhotoHero({ photos, subheadline, description }: { photos: string[]; subheadline: string; description: string }) {
  return (
    <section data-nav-overlay className="on-photo relative flex h-[100svh] min-h-[600px] items-end overflow-hidden bg-[#17130F]">
      <div className="absolute inset-0">
        {photos.map((src, i) => (
          <div key={src + i} className="hero-slide absolute inset-0">
            <Photo src={src} alt="" priority={i === 0} className="h-full w-full" />
          </div>
        ))}
      </div>
      <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(23,19,15,0.55)_0%,rgba(23,19,15,0.15)_35%,rgba(23,19,15,0.35)_60%,rgba(23,19,15,0.88)_100%)]" />
      <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(23,19,15,0.55)_0%,transparent_60%)]" />

      <div className="wrap relative pb-10 md:pb-12">
        <h1 className="display-xl max-w-[16ch] font-medium">
          <span data-reveal-line>
            <span>ENGINEERING A</span>
          </span>
          <span data-reveal-line>
            <span>CLEANER TOMORROW.</span>
          </span>
        </h1>
        <div className="mt-6 flex flex-wrap items-end justify-between gap-8" data-reveal data-reveal-delay="0.3">
          <div className="max-w-xl">
            <p className="font-display text-xl tracking-tight md:text-2xl">{subheadline}</p>
            <p className="mt-2 text-white/85" style={{ color: "rgba(255,255,255,0.85)" }}>
              {description}
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <Link href="/products" className="btn btn-primary" data-magnetic>
              Explore Products
            </Link>
            <Link href="/request-quote" className="btn btn-on-photo" data-magnetic>
              Request a Quotation
            </Link>
          </div>
        </div>

        <dl className="mt-10 grid grid-cols-2 gap-px overflow-hidden rounded-2xl border border-white/15 bg-white/10 backdrop-blur-md md:grid-cols-4" data-reveal data-reveal-delay="0.45">
          {[
            ["3.6 GW", "Annual capacity"],
            ["1500 V DC", "System voltage"],
            ["25–35 A", "Current ratings"],
            ["IP68", "Enclosure protection"],
          ].map(([v, l]) => (
            <div key={l} className="flex flex-col-reverse bg-[#17130F]/35 px-5 py-4">
              <dt className="mt-1 text-xs" style={{ color: "rgba(255,255,255,0.7)" }}>
                {l}
              </dt>
              <dd className="font-display text-2xl tracking-tight md:text-3xl">{v}</dd>
            </div>
          ))}
        </dl>
      </div>
    </section>
  );
}

/** Photo header for inner pages. */
export function PhotoPageHero({ photo, marker, lines, lede }: { photo: string; marker: string; lines: string[]; lede?: string }) {
  return (
    <section data-nav-overlay className="on-photo relative flex min-h-[78svh] items-end overflow-hidden bg-[#17130F] pb-14 pt-40 md:pb-20">
      <div className="absolute inset-0" data-parallax="0.15">
        <Photo src={photo} alt="" priority className="h-[115%] w-full" />
      </div>
      <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(23,19,15,0.6)_0%,rgba(23,19,15,0.25)_40%,rgba(23,19,15,0.85)_100%)]" />
      <div className="wrap relative">
        <div className="mb-8 flex items-center gap-4" data-reveal>
          <div className="leader w-16" />
          <span className="label">{marker}</span>
        </div>
        <h1 className="display-l max-w-[18ch]">
          {lines.map((l, i) => (
            <span key={i} data-reveal-line>
              <span>{l}</span>
            </span>
          ))}
        </h1>
        {lede && (
          <p className="lede mt-8" data-reveal data-reveal-delay="0.25">
            {lede}
          </p>
        )}
      </div>
    </section>
  );
}
