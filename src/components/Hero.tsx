"use client";

import dynamic from "next/dynamic";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { JunctionBoxIllustration } from "./three/Fallback";
import { webglAvailable } from "./three/webgl";

gsap.registerPlugin(ScrollTrigger);

const HeroScene = dynamic(() => import("./three/HeroScene"), { ssr: false });

const STEPS = [
  { at: [0.2, 0.4], title: "Three sealed split boxes", body: "Bonded to the back of the module, one at each pair of bus ribbons, they keep every live part insulated for decades outdoors." },
  { at: [0.42, 0.62], title: "Opened along its assembly order", body: "Covers, gaskets, diodes, terminals and ribbons separate in the order they are built up." },
  { at: [0.64, 0.86], title: "Every part has a job", body: "One bypass diode per box protects each substring. Terminals carry the current. Cables and connectors join the string." },
];

export function Hero({ subheadline, description }: { subheadline: string; description: string }) {
  const section = useRef<HTMLElement>(null);
  const intro = useRef<HTMLDivElement>(null);
  const stepRefs = useRef<(HTMLDivElement | null)[]>([]);
  const rail = useRef<HTMLDivElement>(null);
  const progress = useRef(0);
  const [mode, setMode] = useState<"pending" | "3d" | "static">("pending");
  const [reduced, setReduced] = useState(false);

  useEffect(() => {
    const r = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    setReduced(r);
    setMode(webglAvailable() ? "3d" : "static");
  }, []);

  useEffect(() => {
    if (mode === "pending" || !section.current) return;
    if (reduced) {
      progress.current = 0.08;
      return;
    }
    const st = ScrollTrigger.create({
      trigger: section.current,
      start: "top top",
      end: "bottom bottom",
      scrub: true,
      onUpdate: (self) => {
        const p = self.progress;
        progress.current = p;
        if (intro.current) {
          const o = 1 - Math.min(1, Math.max(0, (p - 0.08) / 0.12));
          intro.current.style.opacity = String(o);
          intro.current.style.transform = `translate3d(0, ${(1 - o) * -40}px, 0)`;
          intro.current.style.visibility = o < 0.01 ? "hidden" : "visible";
        }
        STEPS.forEach((s, i) => {
          const el = stepRefs.current[i];
          if (!el) return;
          const [a, b] = s.at;
          const inn = Math.min(1, Math.max(0, (p - a) / 0.05));
          const outv = Math.min(1, Math.max(0, (p - (b - 0.05)) / 0.05));
          const o = inn * (1 - outv);
          el.style.opacity = String(o);
          el.style.transform = `translate3d(0, ${(1 - inn) * 24 - outv * 24}px, 0)`;
          el.style.visibility = o < 0.01 ? "hidden" : "visible";
        });
        if (rail.current) rail.current.style.transform = `scaleY(${p})`;
      },
    });
    return () => st.kill();
  }, [mode, reduced]);

  const sticky = !reduced && mode === "3d";

  return (
    <section ref={section} aria-label="Introduction" className={`relative ${sticky ? "h-[400vh] md:h-[460vh]" : ""}`}>
      <div className={`${sticky ? "sticky top-0" : "relative"} h-[100svh] min-h-[620px] overflow-hidden`}>
        {/* studio backdrop */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_70%_55%_at_50%_42%,#dff1f8_0%,#eef5f9_45%,#f6f8fa_75%)]" />
        <div className="blueprint-grid absolute inset-0 opacity-60 [mask-image:radial-gradient(ellipse_60%_50%_at_50%_45%,black,transparent)]" />
        <div className="pointer-events-none absolute left-1/2 top-[38%] h-[32rem] w-[32rem] -translate-x-1/2 -translate-y-1/2 rounded-full bg-cyan/[0.07] blur-[100px]" />
        <div className="grain" />

        {mode === "3d" && <HeroScene progress={progress} reduced={reduced} />}
        {mode === "static" && (
          <div className="absolute inset-x-0 top-[18%] flex justify-center px-6">
            <JunctionBoxIllustration className="w-full max-w-xl" />
          </div>
        )}


        {/* intro copy */}
        <div ref={intro} className="pointer-events-none absolute inset-x-0 bottom-0 z-10 pb-20 md:pb-16">
          <div className="wrap relative">
            <h1 className="display-xl font-medium lg:whitespace-nowrap">
              <span data-reveal-line>
                <span>ENGINEERING A</span>
              </span>
              <span data-reveal-line>
                <span>CLEANER TOMORROW.</span>
              </span>
            </h1>
            <div
              className="pointer-events-auto mt-8 max-w-md lg:absolute lg:right-[clamp(1rem,4vw,3.5rem)] lg:mt-0 lg:bottom-[calc(clamp(2.7rem,7.2vw,8.25rem)*1.02)] lg:max-w-[min(26rem,32vw)]"
              data-reveal
              data-reveal-delay="0.35"
            >
              <p className="font-display text-xl tracking-tight text-white md:text-2xl">{subheadline}</p>
              <p className="mt-3 text-silver">{description}</p>
              <div className="mt-7 flex flex-wrap gap-3">
                <Link href="/products" className="btn btn-primary" data-magnetic>
                  Explore Products
                </Link>
                <Link href="/request-quote" className="btn btn-ghost bg-obsidian/40 backdrop-blur" data-magnetic>
                  Request a Quotation
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* scroll-linked captions */}
        {sticky && (
          <>
            <div className="absolute inset-x-0 bottom-10 z-10 md:bottom-auto md:top-1/2 md:-translate-y-1/2">
              <div className="wrap relative">
                {STEPS.map((s, i) => (
                  <div
                    key={s.title}
                    ref={(el) => {
                      stepRefs.current[i] = el;
                    }}
                    className="absolute left-4 right-4 max-w-sm rounded-2xl md:left-auto md:right-14 border border-line/60 bg-obsidian/55 p-5 backdrop-blur-md md:border-0 md:bg-transparent md:p-0 md:backdrop-blur-none"
                    style={{ opacity: 0, visibility: "hidden", bottom: 0 }}
                  >
                    <p className="label mb-2">Step {i + 1} of 3</p>
                    <p className="font-display text-2xl tracking-tight md:text-4xl">{s.title}</p>
                    <p className="mt-3 text-silver">{s.body}</p>
                  </div>
                ))}
              </div>
            </div>
            <div className="absolute left-4 top-1/2 hidden h-40 w-px -translate-y-1/2 bg-line md:block lg:left-8" aria-hidden="true">
              <div ref={rail} className="h-full w-full origin-top scale-y-0 bg-cyan" />
            </div>
          </>
        )}

        {/* scroll indicator */}
        <div className="pointer-events-none absolute bottom-5 left-1/2 z-10 -translate-x-1/2" aria-hidden="true">
          <div className="relative h-10 w-px overflow-hidden bg-line">
            <span className="absolute left-0 top-0 h-4 w-px animate-[scrollcue_2.2s_cubic-bezier(0.16,1,0.3,1)_infinite] bg-cyan" />
          </div>
        </div>
      </div>
    </section>
  );
}
