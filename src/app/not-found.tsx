import Link from "next/link";
import { Logo } from "@/components/Logo";

export default function NotFound() {
  return (
    <section className="flex min-h-dvh items-center py-24">
      <div className="wrap">
        <Link href="/" aria-label="Somnyx Solar home" className="mb-16 inline-block"><Logo id="nf-logo" tagline /></Link>
        <p className="font-display text-[clamp(6rem,20vw,16rem)] font-medium leading-none tracking-[-0.06em] text-graphite-2">404</p>
        <h1 className="display-m -mt-6">This connection is open.</h1>
        <p className="lede mt-5">The page you were looking for does not exist or has moved.</p>
        <div className="mt-8 flex flex-wrap gap-3">
          <Link href="/" className="btn btn-primary">Go to the homepage</Link>
          <Link href="/products" className="btn btn-ghost">See products</Link>
        </div>
      </div>
    </section>
  );
}
