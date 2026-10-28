import type { ReactNode } from "react";

/**
 * Section of cards that scrolls normally with the page — no pinning or
 * scroll hijacking. `cols` sets the grid on larger screens.
 */
export function HorizontalPin({ children, header, cols = "grid-cols-1" }: { children: ReactNode; header?: ReactNode; progressLabel?: string; cols?: string }) {
  return (
    <section className="relative py-14 md:py-28">
      {header}
      <div className={`wrap grid gap-5 ${cols}`} data-stagger>
        {children}
      </div>
    </section>
  );
}
