"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

export function prefersReducedMotion() {
  return typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

/**
 * Site-wide motion: line-masked headline reveals ([data-reveal-line]),
 * staggered entrances ([data-reveal], [data-stagger] children) and
 * parallax layers ([data-parallax="0.2"]). Re-runs on every route change.
 */
export function Motion() {
  const pathname = usePathname();

  useEffect(() => {
    const reduce = prefersReducedMotion();
    const root = document.documentElement;
    if (reduce) {
      root.classList.remove("js-motion");
      return;
    }
    root.classList.add("js-motion");

    const ctx = gsap.context(() => {
      gsap.utils.toArray<HTMLElement>("[data-reveal-line]").forEach((el) => {
        const inner = el.querySelectorAll(":scope > span");
        gsap.fromTo(inner, { y: 0, yPercent: 105 }, {
          yPercent: 0,
          duration: 1.1,
          ease: "expo.out",
          stagger: 0.08,
          scrollTrigger: { trigger: el, start: "top 92%", once: true },
        });
      });

      gsap.utils.toArray<HTMLElement>("[data-reveal]").forEach((el) => {
        const delay = Number(el.dataset.revealDelay || 0);
        gsap.fromTo(el, { opacity: 0, y: 28 }, { opacity: 1, y: 0, duration: 1, delay, ease: "expo.out", scrollTrigger: { trigger: el, start: "top 90%", once: true } });
      });

      gsap.utils.toArray<HTMLElement>("[data-stagger]").forEach((el) => {
        gsap.fromTo(
          el.children,
          { opacity: 0, y: 24 },
          { opacity: 1, y: 0, duration: 0.9, ease: "expo.out", stagger: 0.07, scrollTrigger: { trigger: el, start: "top 88%", once: true } },
        );
      });

      if (window.innerWidth > 768) {
        gsap.utils.toArray<HTMLElement>("[data-parallax]").forEach((el) => {
          const speed = Number(el.dataset.parallax || 0.2);
          gsap.fromTo(el, { yPercent: -speed * 50 }, { yPercent: speed * 50, ease: "none", scrollTrigger: { trigger: el.parentElement || el, start: "top bottom", end: "bottom top", scrub: true } });
        });
      }

      gsap.utils.toArray<HTMLElement>("[data-mask]").forEach((el) => {
        gsap.fromTo(el, { clipPath: "inset(12% 12% 12% 12% round 24px)" }, { clipPath: "inset(0% 0% 0% 0% round 0px)", ease: "none", scrollTrigger: { trigger: el, start: "top 85%", end: "top 25%", scrub: true } });
      });
    });

    const t = setTimeout(() => ScrollTrigger.refresh(), 300);
    return () => {
      clearTimeout(t);
      ctx.revert();
    };
  }, [pathname]);

  return null;
}
