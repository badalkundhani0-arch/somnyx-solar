/** Static illustration used when WebGL is unavailable. */
export function JunctionBoxIllustration({ className = "" }: { className?: string }) {
  const boxes = [120, 245, 370];
  return (
    <svg viewBox="0 0 600 360" className={className} role="img" aria-label="Illustration of a 3-split PV junction box">
      <defs>
        <linearGradient id="jb-top" x1="0" x2="1" y1="0" y2="1">
          <stop offset="0" stopColor="#2a323d" />
          <stop offset="1" stopColor="#0d1015" />
        </linearGradient>
      </defs>
      <ellipse cx="300" cy="292" rx="250" ry="20" fill="#0b1118" opacity="0.12" />
      <path d="M120 200 C70 205 50 240 60 290" stroke="#0b0c0e" strokeWidth="13" fill="none" strokeLinecap="round" />
      <path d="M480 200 C530 205 550 240 540 290" stroke="#0b0c0e" strokeWidth="13" fill="none" strokeLinecap="round" />
      <rect x="49" y="284" width="22" height="44" rx="6" fill="#1a1f26" />
      <rect x="529" y="284" width="22" height="44" rx="6" fill="#1a1f26" />
      {boxes.map((x) => (
        <g key={x}>
          <path d={`M${x + 18} 150 h74 l18 30 v34 h-110 v-34 z`} fill="#0d1015" />
          <path d={`M${x + 18} 130 h74 l18 30 h-110 z`} fill="url(#jb-top)" stroke="#3a4552" />
          <rect x={x + 10} y="160" width="90" height="20" fill="#14181e" />
          <rect x={x + 38} y="144" width="34" height="3" rx="1.5" fill="#00D9FF" />
        </g>
      ))}
    </svg>
  );
}
