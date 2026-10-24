"use client";
import { useEffect } from "react";
import { usePathname } from "next/navigation";

/** Subtle magnetic pull on [data-magnetic] elements for fine pointers only. */
export function Magnetic() {
  const pathname = usePathname();
  useEffect(() => {
    if (!window.matchMedia("(pointer: fine)").matches || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const els = Array.from(document.querySelectorAll<HTMLElement>("[data-magnetic]"));
    const cleanups = els.map((el) => {
      el.style.transition = "transform 0.4s cubic-bezier(0.16,1,0.3,1)";
      const move = (e: PointerEvent) => {
        const r = el.getBoundingClientRect();
        const x = (e.clientX - (r.left + r.width / 2)) * 0.22;
        const y = (e.clientY - (r.top + r.height / 2)) * 0.3;
        el.style.transform = `translate(${x}px, ${y}px)`;
      };
      const leave = () => (el.style.transform = "");
      el.addEventListener("pointermove", move);
      el.addEventListener("pointerleave", leave);
      return () => {
        el.removeEventListener("pointermove", move);
        el.removeEventListener("pointerleave", leave);
      };
    });
    return () => cleanups.forEach((c) => c());
  }, [pathname]);
  return null;
}
