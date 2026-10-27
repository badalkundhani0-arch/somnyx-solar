/** Static illustration used when WebGL is unavailable: three slim split housings with cables. */
export function JunctionBoxIllustration({ className = "" }: { className?: string }) {
  const boxes = [40, 230, 420];
  const W = 140;
  return (
    <svg viewBox="0 0 600 300" className={className} role="img" aria-label="Illustration of a 3-split PV junction box">
      <ellipse cx="300" cy="250" rx="270" ry="16" fill="#17130F" opacity="0.1" />
      <path d="M40 120 C 6 120 4 210 60 228" stroke="#0b0c0e" strokeWidth="11" fill="none" strokeLinecap="round" />
      <path d="M560 120 C 594 120 596 210 540 228" stroke="#0b0c0e" strokeWidth="11" fill="none" strokeLinecap="round" />
      <rect x="58" y="216" width="46" height="24" rx="7" fill="#1a1f26" />
      <rect x="496" y="216" width="46" height="24" rx="7" fill="#1a1f26" />
      {boxes.map((x) => (
        <g key={x}>
          <rect x={x - 8} y="110" width="12" height="20" rx="5" fill="#2a2f36" />
          <rect x={x + W - 4} y="110" width="12" height="20" rx="5" fill="#2a2f36" />
          <rect x={x} y="98" width={W} height="44" rx="14" fill="#14181e" />
          <rect x={x + 2} y="92" width={W - 4} height="40" rx="13" fill="#2b3038" stroke="#3a4552" />
          <rect x={x + 22} y="104" width="58" height="16" rx="3" fill="#353b44" />
          <rect x={x + 96} y="108" width="26" height="3" rx="1.5" fill="#FFA319" />
        </g>
      ))}
    </svg>
  );
}
