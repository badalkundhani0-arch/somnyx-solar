import Link from "next/link";
import { EMAILS, LOCATION, TAGLINE } from "@/lib/brand";
import { LogoLockup, LogoMark } from "./Logo";

export function Footer({ products }: { products: { id: string; code: string; currentRating: number }[] }) {
  const year = new Date().getFullYear();
  const cols = [
    { title: "Products", links: [{ href: "/products", label: "All products" }, ...products.map((p) => ({ href: `/products/${p.id}`, label: `${p.code} · ${p.currentRating} A` }))] },
    {
      title: "Company",
      links: [
        { href: "/technology", label: "Technology & Engineering" },
        { href: "/manufacturing", label: "Manufacturing" },
        { href: "/industries", label: "Industries & Applications" },
        { href: "/about", label: "About us" },
        { href: "/resources", label: "Technical resources" },
      ],
    },
    {
      title: "Enquiries",
      links: [
        { href: "/request-quote", label: "Request a quote" },
        { href: "/contact", label: "Contact" },
        { href: `mailto:${EMAILS.sales}`, label: EMAILS.sales },
        { href: `mailto:${EMAILS.procurement}`, label: EMAILS.procurement },
        { href: `mailto:${EMAILS.technical}`, label: EMAILS.technical },
      ],
    },
  ];

  return (
    <footer className="relative overflow-hidden border-t border-line bg-graphite-2">
      <div className="pointer-events-none absolute -top-40 left-1/2 h-80 w-[60rem] -translate-x-1/2 rounded-full bg-cyan/[0.07] blur-3xl" />
      <div className="wrap relative pt-20">
        <div className="grid gap-12 md:grid-cols-[1.3fr_repeat(3,1fr)]">
          <div>
            <p className="font-display text-3xl tracking-tight">{TAGLINE}</p>
            <p className="mt-4 max-w-xs text-sm text-silver">3-split photovoltaic junction boxes, made in Gujarat. 3.6 GW annual capacity.</p>
          </div>
          {cols.map((c) => (
            <div key={c.title}>
              <p className="label mb-4">{c.title}</p>
              <ul className="space-y-2.5">
                {c.links.map((l) => (
                  <li key={l.href}>
                    <Link href={l.href} className="break-all text-sm text-silver transition-colors hover:text-accent sm:break-normal">
                      {l.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="relative mt-24 pb-10 select-none" aria-hidden="true">
          <LogoLockup id="footer-logo" className="mx-auto h-auto w-full max-w-5xl text-[#DDD6CB]" title="Somnyx Solar" />
        </div>

        <div className="flex flex-col gap-4 border-t border-line py-8 text-sm text-steel md:flex-row md:items-center md:justify-between">
          <div className="flex items-center gap-3">
            <LogoMark id="footer-mark" className="h-6 w-6 text-silver" />
            <span>
              © {year} Somnyx Solar, a business of Somnyx Industries. {LOCATION}.
            </span>
          </div>
          <div className="flex gap-6">
            <Link href="/privacy" className="hover:text-white">Privacy Policy</Link>
            <Link href="/terms" className="hover:text-white">Terms of Use</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
