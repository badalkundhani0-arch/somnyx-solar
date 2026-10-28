"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { Logo } from "./Logo";
import { NAV } from "@/lib/brand";

type NavProduct = { id: string; code: string; currentRating: number; tagline: string; statusLabel: string };

export function Nav({ products }: { products: NavProduct[] }) {
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const [mega, setMega] = useState(false);
  const [showSticky, setShowSticky] = useState(false);
  const [overlay, setOverlay] = useState(false);
  const megaTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    const onScroll = () => {
      setScrolled(window.scrollY > 24);
      setShowSticky(window.scrollY > window.innerHeight * 0.9);
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    setOpen(false);
    setMega(false);
    // Pages that open on a full-bleed photo mark their hero with data-nav-overlay.
    setOverlay(Boolean(document.querySelector("[data-nav-overlay]")));
  }, [pathname]);

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && (setOpen(false), setMega(false));
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  const isActive = (href: string) => pathname === href || pathname.startsWith(href + "/");
  const openMega = () => {
    if (megaTimer.current) clearTimeout(megaTimer.current);
    setMega(true);
  };
  const closeMega = () => {
    megaTimer.current = setTimeout(() => setMega(false), 140);
  };

  const solid = scrolled || open || mega;
  const onPhoto = overlay && !solid;
  const hideRfqSticky = pathname.startsWith("/request-quote");

  return (
    <>
      <a href="#main" className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[100] focus:rounded focus:bg-cyan focus:px-4 focus:py-2 focus:text-ink">
        Skip to content
      </a>
      <header
        className={`fixed inset-x-0 top-0 z-50 transition-[background-color,border-color,backdrop-filter,color] duration-500 ${onPhoto ? "on-photo" : ""} ${
          solid ? "border-b border-white/[0.06] bg-obsidian/70 backdrop-blur-xl backdrop-saturate-150" : "border-b border-transparent"
        }`}
      >
        <div className="wrap flex h-[72px] items-center justify-between gap-6">
          <Link href="/" aria-label="Somnyx Solar home" className="shrink-0">
            <span className="hidden lg:block">
              <Logo id="nav-desktop" tagline={!scrolled} />
            </span>
            <span className="lg:hidden">
              <Logo id="nav-mobile" />
            </span>
          </Link>

          <nav aria-label="Primary" className="hidden lg:block">
            <ul className="flex items-center gap-1">
              {NAV.map((item) => {
                const active = isActive(item.href);
                const isProducts = item.href === "/products";
                return (
                  <li key={item.href} onMouseEnter={isProducts ? openMega : undefined} onMouseLeave={isProducts ? closeMega : undefined} className="relative">
                    <Link
                      href={item.href}
                      aria-current={active ? "page" : undefined}
                      aria-expanded={isProducts ? mega : undefined}
                      onFocus={isProducts ? openMega : undefined}
                      className={`relative block px-4 py-2 font-display text-[0.94rem] transition-colors ${onPhoto ? (active ? "text-[#fff]" : "text-[#ffffffd9] hover:text-[#fff]") : active ? "text-white" : "text-silver hover:text-white"}`}
                    >
                      {item.label}
                      <span
                        className={`absolute inset-x-4 -bottom-[3px] h-px origin-left bg-cyan transition-transform duration-500 ease-out-expo ${active ? "scale-x-100" : "scale-x-0"}`}
                      />
                    </Link>
                  </li>
                );
              })}
            </ul>
          </nav>

          <div className="flex items-center gap-3">
            <Link href="/request-quote" className="btn btn-primary btn-sm hidden sm:inline-flex">
              Request a Quote
            </Link>
            <button
              type="button"
              className={`relative flex h-11 w-11 items-center justify-center rounded-full border lg:hidden ${onPhoto ? "border-[#ffffff80]" : "border-line-strong"}`}
              aria-label={open ? "Close menu" : "Open menu"}
              aria-expanded={open}
              aria-controls="mobile-menu"
              onClick={() => setOpen((v) => !v)}
            >
              <span className={`absolute h-px w-5 transition-transform duration-300 ${onPhoto ? "bg-[#fff]" : "bg-white"} ${open ? "rotate-45" : "-translate-y-[4px]"}`} />
              <span className={`absolute h-px w-5 transition-transform duration-300 ${onPhoto ? "bg-[#fff]" : "bg-white"} ${open ? "-rotate-45" : "translate-y-[4px]"}`} />
            </button>
          </div>
        </div>

        {/* Product mega-menu */}
        <div
          onMouseEnter={openMega}
          onMouseLeave={closeMega}
          className={`absolute inset-x-0 top-full hidden overflow-hidden border-b border-white/[0.06] bg-obsidian/90 backdrop-blur-xl transition-[max-height,opacity] duration-500 ease-out-expo lg:block ${
            mega ? "max-h-[420px] opacity-100" : "pointer-events-none max-h-0 opacity-0"
          }`}
        >
          <div className="wrap grid grid-cols-[1fr_3fr] gap-12 py-10">
            <div>
              <p className="font-display text-2xl tracking-tight">Junction box platform</p>
              <p className="mt-3 text-sm text-silver">3-split junction boxes in three current ratings for 1500 V modules.</p>
              <Link href="/products" className="mt-5 inline-block text-sm text-accent hover:underline">
                See the full range
              </Link>
            </div>
            <ul className="grid grid-cols-3 gap-px overflow-hidden rounded-2xl bg-line">
              {products.map((p) => (
                <li key={p.id}>
                  <Link href={`/products/${p.id}`} className="group block h-full bg-graphite p-6 transition-colors hover:bg-graphite-2">
                    <span className="font-display text-5xl font-medium tracking-tighter text-white transition-colors group-hover:text-accent">
                      {p.currentRating}
                      <span className="ml-1 text-2xl text-steel">A</span>
                    </span>
                    <span className="mt-6 block font-display text-lg">{p.code}</span>
                    <span className="mt-1 block text-sm text-silver">{p.tagline}</span>
                    <span className="mt-4 inline-flex items-center gap-2 text-xs text-warn">
                      <span className="h-1.5 w-1.5 rounded-full bg-warn" />
                      {p.statusLabel}
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </header>

      {/* Mobile menu */}
      <div
        id="mobile-menu"
        className={`fixed inset-0 z-40 bg-obsidian transition-[opacity,visibility] duration-500 lg:hidden ${open ? "visible opacity-100" : "invisible opacity-0"}`}
      >
        <nav aria-label="Mobile" className="wrap flex h-full flex-col pb-10 pt-28">
          <ul className="space-y-1">
            {[{ href: "/", label: "Home" }, ...NAV, { href: "/industries", label: "Industries" }, { href: "/resources", label: "Technical Resources" }].map((item, i) => (
              <li
                key={item.href}
                style={{ transitionDelay: open ? `${80 + i * 45}ms` : "0ms" }}
                className={`transition-[opacity,transform] duration-500 ease-out-expo ${open ? "translate-y-0 opacity-100" : "translate-y-4 opacity-0"}`}
              >
                <Link
                  href={item.href}
                  aria-current={pathname === item.href ? "page" : undefined}
                  className={`flex items-baseline justify-between border-b border-line py-4 font-display text-3xl tracking-tight ${pathname === item.href ? "text-accent" : "text-white"}`}
                >
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
          <div className="mt-6 grid grid-cols-3 gap-2">
            {products.map((p) => (
              <Link key={p.id} href={`/products/${p.id}`} className="rounded-xl border border-line p-3 text-center">
                <span className="block font-display text-2xl">{p.currentRating} A</span>
                <span className="text-xs text-steel">{p.code}</span>
              </Link>
            ))}
          </div>
          <Link href="/request-quote" className="btn btn-primary mt-auto justify-center">
            Request a Quote
          </Link>
        </nav>
      </div>

      {/* Sticky RFQ access */}
      {!hideRfqSticky && (
        <Link
          href="/request-quote"
          className={`btn btn-primary fixed bottom-5 right-5 z-30 shadow-[0_10px_40px_-10px_rgba(255,163,25,0.7)] transition-[opacity,transform] duration-500 ease-out-expo ${
            showSticky && !open ? "translate-y-0 opacity-100" : "pointer-events-none translate-y-6 opacity-0"
          }`}
          tabIndex={showSticky ? 0 : -1}
          aria-hidden={!showSticky}
        >
          Request a Quote
        </Link>
      )}
    </>
  );
}
