import { TAGLINE } from "@/lib/brand";

/** Mark: an enclosure outline holding three diode bars — one per module substring. */
export function LogoMark({ className = "h-7 w-7" }: { className?: string }) {
  return (
    <svg viewBox="0 0 40 40" className={className} aria-hidden="true">
      <rect x="5" y="9" width="30" height="22" rx="4.5" fill="none" stroke="currentColor" strokeWidth="2.2" />
      <path d="M13 15v10M20 15v10M27 15v10" stroke="#00D9FF" strokeWidth="2.6" strokeLinecap="round" />
    </svg>
  );
}

export function Logo({ tagline = false, size = "md" }: { tagline?: boolean; size?: "md" | "lg" }) {
  return (
    <span className="inline-flex items-center gap-2.5">
      <LogoMark className={size === "lg" ? "h-9 w-9" : "h-7 w-7"} />
      <span className="flex flex-col leading-none">
        <span className={`font-display font-semibold tracking-[0.08em] ${size === "lg" ? "text-lg" : "text-[0.95rem]"}`}>
          SOMNYX <span className="font-normal text-silver">SOLAR</span>
        </span>
        {tagline && <span className="mt-1 text-[0.68rem] tracking-[0.01em] text-steel">{TAGLINE}</span>}
      </span>
    </span>
  );
}
