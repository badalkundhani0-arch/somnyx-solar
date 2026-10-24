"use client";

import { useEffect, useRef, type ReactNode } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

/**
 * Horizontal gallery driven by vertical scroll on large screens.
 * Below 1024px, or with reduced motion, it is a native swipeable row.
 */
export function HorizontalPin({ children, header, progressLabel }: { children: ReactNode; header?: ReactNode; progressLabel?: string }) {
  const section = useRef<HTMLElement>(null);
  const track = useRef<HTMLDivElement>(null);
  const bar = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const mm = gsap.matchMedia();
    mm.add("(min-width: 1024px) and (prefers-reduced-motion: no-preference)", () => {
      const t = track.current!;
      const distance = () => Math.max(0, t.scrollWidth - window.innerWidth);
      const tween = gsap.to(t, {
        x: () => -distance(),
        ease: "none",
        scrollTrigger: {
          trigger: section.current,
          start: "top top",
          end: () => `+=${distance()}`,
          pin: true,
          scrub: 0.6,
          invalidateOnRefresh: true,
          anticipatePin: 1,
          onUpdate: (self) => {
            if (bar.current) bar.current.style.transform = `scaleX(${self.progress})`;
          },
        },
      });
      return () => tween.scrollTrigger?.kill();
    });
    return () => mm.revert();
  }, []);

  return (
    <section ref={section} className="relative overflow-hidden lg:flex lg:h-[100svh] lg:flex-col lg:justify-center">
      {header}
      <div
        ref={track}
        className="flex snap-x snap-mandatory gap-4 overflow-x-auto px-4 pb-6 [scrollbar-width:none] lg:snap-none lg:gap-6 lg:overflow-visible lg:px-[max(3.5rem,calc((100vw-88rem)/2+3.5rem))] lg:pb-0"
      >
        {children}
      </div>
      <div className="wrap mt-8 hidden items-center gap-4 lg:flex" aria-hidden="true">
        <div className="relative h-px flex-1 bg-line">
          <div ref={bar} className="absolute inset-0 origin-left scale-x-0 bg-cyan" />
        </div>
        {progressLabel && <span className="label">{progressLabel}</span>}
      </div>
    </section>
  );
}
