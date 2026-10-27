import { TAGLINE } from "@/lib/brand";

/** SOMNYX wordmark: Space Grotesk Bold capitals, with the O drawn as a ring holding a rising sun. */
export function Wordmark({ className = "h-5 w-auto", title = "Somnyx" }: { className?: string; title?: string }) {
  return (
    <svg viewBox="0 -740 4314 780" className={className} role="img" aria-label={title} fill="currentColor">
      <path transform="translate(0 0)" d="M309 14Q228 14 166.0 -15.0Q104 -44 69.0 -98.0Q34 -152 34 -228V-256H164V-228Q164 -165 203.0 -133.5Q242 -102 309 -102Q377 -102 410.5 -129.0Q444 -156 444 -198Q444 -227 427.5 -245.0Q411 -263 379.5 -274.5Q348 -286 303 -296L280 -301Q208 -317 156.5 -341.5Q105 -366 77.5 -406.0Q50 -446 50 -510Q50 -574 80.5 -619.5Q111 -665 166.5 -689.5Q222 -714 297 -714Q372 -714 430.5 -688.5Q489 -663 522.5 -612.5Q556 -562 556 -486V-456H426V-486Q426 -526 410.5 -550.5Q395 -575 366.0 -586.5Q337 -598 297 -598Q237 -598 208.5 -575.5Q180 -553 180 -514Q180 -488 193.5 -470.0Q207 -452 234.0 -440.0Q261 -428 303 -419L326 -414Q401 -398 456.5 -373.0Q512 -348 543.0 -307.0Q574 -266 574 -202Q574 -138 541.5 -89.5Q509 -41 449.5 -13.5Q390 14 309 14Z"/><path transform="translate(1434 0)" d="M66 0V-700H311L432 -90H450L571 -700H816V0H688V-603H670L550 0H332L212 -603H194V0Z"/><path transform="translate(2336 0)" d="M66 0V-700H317L456 -90H474V-700H604V0H353L214 -610H196V0Z"/><path transform="translate(3026 0)" d="M246 0V-241L8 -700H155L303 -400H321L469 -700H616L378 -241V0Z"/><path transform="translate(3670 0)" d="M22 0 227 -353 24 -700H174L313 -447H331L470 -700H620L417 -353L622 0H472L331 -259H313L172 0Z"/>
      <g transform="translate(640 -730.0) scale(15.8333)"><circle cx="24" cy="24" r="20" fill="none" stroke="currentColor" strokeWidth="7"/><path d="M13 32A11 11 0 0 1 35 32Z" fill="#FFA319"/><path d="M13.66 23.32L10.59 20.75M24.00 18.50L24.00 14.50M34.34 23.32L37.41 20.75" stroke="#FFA319" strokeWidth="3" strokeLinecap="round" fill="none"/></g>
    </svg>
  );
}

/** The sun-O on its own, for tight spaces. */
export function LogoMark({ className = "h-7 w-7" }: { className?: string }) {
  return (
    <svg viewBox="0 0 48 48" className={className} aria-hidden="true">
      <circle cx="24" cy="24" r="20" fill="none" stroke="currentColor" strokeWidth="7" />
      <path d="M13 32A11 11 0 0 1 35 32Z" fill="#FFA319" />
      <path d="M13.66 23.32L10.59 20.75M24.00 18.50L24.00 14.50M34.34 23.32L37.41 20.75" stroke="#FFA319" strokeWidth="3" strokeLinecap="round" fill="none" />
    </svg>
  );
}

export function Logo({ tagline = false, size = "md" }: { tagline?: boolean; size?: "md" | "lg" }) {
  return (
    <span className="inline-flex flex-col items-start leading-none">
      <Wordmark className={size === "lg" ? "h-7 w-auto" : "h-[1.45rem] w-auto"} title="Somnyx Solar" />
      <span className={`mt-[0.4rem] font-display font-medium tracking-[0.62em] opacity-75 ${size === "lg" ? "text-[0.72rem]" : "text-[0.6rem]"}`}>SOLAR</span>
      {tagline && <span className="mt-1.5 text-[0.66rem] tracking-[0.01em] opacity-60">{TAGLINE}</span>}
    </span>
  );
}
