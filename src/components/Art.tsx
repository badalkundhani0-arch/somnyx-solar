/**
 * Generated illustrations. Deliberately drawn rather than photographic so that
 * nothing here can be mistaken for a Somnyx facility or customer installation.
 */

type ArtVariant = "field" | "cells" | "line" | "rooftop" | "partners" | "supply";

function Cells({ x, y, w, h, cols, rows, fill = "#1b3c58", stroke = "#4f7c99" }: { x: number; y: number; w: number; h: number; cols: number; rows: number; fill?: string; stroke?: string }) {
  const cw = w / cols;
  const ch = h / rows;
  const out = [];
  for (let c = 0; c < cols; c++) for (let r = 0; r < rows; r++) out.push(<rect key={`${c}${r}`} x={x + c * cw + 1} y={y + r * ch + 1} width={cw - 2} height={ch - 2} fill={fill} stroke={stroke} strokeWidth="0.6" />);
  return <g>{out}</g>;
}

export function SolarArt({ variant, className = "" }: { variant: ArtVariant; className?: string }) {
  const sky = (
    <defs>
      <linearGradient id={`sky-${variant}`} x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stopColor="#FFF3E2" />
        <stop offset="0.55" stopColor="#FFF8EE" />
        <stop offset="1" stopColor="#FAF8F5" />
      </linearGradient>
      <radialGradient id={`sun-${variant}`} cx="70%" cy="30%" r="45%">
        <stop offset="0" stopColor="#F08C00" stopOpacity="0.35" />
        <stop offset="1" stopColor="#F08C00" stopOpacity="0" />
      </radialGradient>
    </defs>
  );
  return (
    <svg viewBox="0 0 800 520" preserveAspectRatio="xMidYMid slice" className={className} aria-hidden="true">
      {sky}
      <rect width="800" height="520" fill={`url(#sky-${variant})`} />
      <rect width="800" height="520" fill={`url(#sun-${variant})`} />
      {variant === "field" &&
        Array.from({ length: 7 }).map((_, r) => {
          const y = 250 + r * r * 9 + r * 18;
          const s = 0.35 + r * 0.16;
          return (
            <g key={r} transform={`translate(${400 - 520 * s} ${y}) scale(${s} ${s * 0.55}) skewX(-18)`}>
              {Array.from({ length: 6 }).map((__, i) => (
                <Cells key={i} x={i * 176} y={0} w={170} h={100} cols={6} rows={4} />
              ))}
            </g>
          );
        })}
      {variant === "cells" && (
        <g transform="translate(-40 -60) rotate(-12 400 260)">
          {Array.from({ length: 5 }).map((_, c) =>
            Array.from({ length: 4 }).map((__, r) => (
              <g key={`${c}${r}`} transform={`translate(${c * 190} ${r * 190})`}>
                <rect width="182" height="182" rx="10" fill="#0d2433" stroke="#4f7c99" />
                {Array.from({ length: 12 }).map((___, k) => (
                  <path key={k} d={`M0 ${15 * k + 8} H182`} stroke="#1a3b4d" strokeWidth="0.6" />
                ))}
                {[45, 91, 137].map((x) => (
                  <path key={x} d={`M${x} 0 V182`} stroke="#9aa7b4" strokeWidth="2.2" opacity="0.7" />
                ))}
              </g>
            )),
          )}
        </g>
      )}
      {variant === "line" && (
        <g>
          <path d="M0 380 L800 300" stroke="#dfe5eb" strokeWidth="60" />
          {Array.from({ length: 5 }).map((_, i) => (
            <g key={i} transform={`translate(${60 + i * 160} ${370 - i * 16}) skewY(-6)`}>
              <Cells x={0} y={-44} w={120} h={40} cols={6} rows={2} />
              <rect x="40" y="-120" width="40" height="70" fill="#ffffff" stroke="#C9C2B8" />
              <path d="M60 -50 V-40" stroke="#F08C00" strokeWidth="2" />
              <circle cx="60" cy="-36" r="3" fill="#F08C00" />
            </g>
          ))}
        </g>
      )}
      {variant === "rooftop" && (
        <g>
          <path d="M0 520 L0 330 L260 220 L800 300 L800 520Z" fill="#dce3ea" />
          <g transform="translate(150 250) skewY(8) skewX(-20)">
            {Array.from({ length: 3 }).map((_, r) =>
              Array.from({ length: 4 }).map((__, c) => <Cells key={`${r}${c}`} x={c * 130} y={r * 74} w={124} h={68} cols={6} rows={4} />),
            )}
          </g>
        </g>
      )}
      {variant === "partners" && (
        <g fill="none">
          {[220, 580].map((cx) => (
            <g key={cx}>
              <circle cx={cx} cy="260" r="120" stroke="#4f7c99" />
              <circle cx={cx} cy="260" r="80" stroke="#4f7c99" opacity="0.6" />
            </g>
          ))}
          <path d="M300 260 H500" stroke="#F08C00" strokeWidth="2" strokeDasharray="6 8" className="[animation:flow_1.2s_linear_infinite]" />
          <rect x="370" y="236" width="60" height="48" rx="8" fill="#ffffff" stroke="#F08C00" />
          <path d="M386 252v16M400 252v16M414 252v16" stroke="#F08C00" strokeWidth="2" />
        </g>
      )}
      {variant === "supply" && (
        <g>
          {Array.from({ length: 4 }).map((_, r) =>
            Array.from({ length: 6 }).map((__, c) => (
              <g key={`${r}${c}`} transform={`translate(${90 + c * 110 - r * 18} ${150 + r * 80})`}>
                <path d="M0 20 L40 0 L80 20 L80 56 L40 76 L0 56Z" fill="#ffffff" stroke="#D3CDC4" />
                <path d="M0 20 L40 40 L80 20 M40 40 V76" stroke="#D3CDC4" fill="none" />
                {(r + c) % 3 === 0 && <path d="M40 40 V76" stroke="#F08C00" />}
              </g>
            )),
          )}
        </g>
      )}
      <rect width="800" height="520" fill="url(#fade)" opacity="0" />
    </svg>
  );
}

/** Stepped cover outline used by the drawings (matches the 3D housing). */
function boxPath(x: number, y: number, w: number, h: number) {
  const r = 12;
  const step = 5;
  const sl = 22;
  return `M${x + sl} ${y} H${x + w - sl} V${y + step} H${x + w - r} Q${x + w} ${y + step} ${x + w} ${y + step + r} V${y + h - step - r} Q${x + w} ${y + h - step} ${x + w - r} ${y + h - step} H${x + w - sl} V${y + h} H${x + sl} V${y + h - step} H${x + r} Q${x} ${y + h - step} ${x} ${y + h - step - r} V${y + step + r} Q${x} ${y + step} ${x + r} ${y + step} H${x + sl} Z`;
}

/** Top view of the 3-split junction box: three slim housings, each with two clamps and a central diode. */
export function BoxDrawing({ rating, className = "" }: { rating: number; className?: string }) {
  const W = 118;
  const H = 46;
  const boxes = [34, 201, 368];
  const y = 132;
  return (
    <svg viewBox="0 0 520 340" className={className} role="img" aria-label={`Top view of the ${rating} A 3-split junction box`}>
      {/* cables from the outer ends, looping down to connectors */}
      <path d={`M${boxes[0]} ${y + H / 2} C 4 ${y + H / 2} 8 ${y + 110} 52 ${y + 128} L 96 ${y + 138}`} fill="none" stroke="#1a1f26" strokeWidth="7" strokeLinecap="round" />
      <path d={`M${boxes[2] + W} ${y + H / 2} C 516 ${y + H / 2} 512 ${y + 110} 468 ${y + 128} L 424 ${y + 138}`} fill="none" stroke="#1a1f26" strokeWidth="7" strokeLinecap="round" />
      <rect x="90" y={y + 128} width="40" height="20" rx="6" fill="#1a1f26" />
      <rect x="390" y={y + 128} width="40" height="20" rx="6" fill="#1a1f26" />
      {boxes.map((x, i) => (
        <g key={x}>
          {/* end tabs */}
          <rect x={x - 7} y={y + H / 2 - 9} width="10" height="18" rx="4" fill="#3a3f47" />
          <rect x={x + W - 3} y={y + H / 2 - 9} width="10" height="18" rx="4" fill="#3a3f47" />
          <path d={boxPath(x, y, W, H)} fill="#2b3038" stroke="#1a1f26" strokeWidth="1.5" />
          <path d={boxPath(x + 6, y + 6, W - 12, H - 12)} fill="#20242a" />
          {/* clamps either side of the diode */}
          <rect x={x + 26} y={y + 14} width="20" height="18" rx="3" fill="#cfd3d8" />
          <rect x={x + W - 46} y={y + 14} width="20" height="18" rx="3" fill="#cfd3d8" />
          <rect x={x + W / 2 - 9} y={y + 11} width="18" height="24" rx="2" fill="#0d0f12" />
          <rect x={x + W / 2 - 6} y={y + 11} width="3" height="24" fill="#FFA319" />
          {i === 1 && <path d={`M${x} ${y + H / 2} H${x - 22}`} stroke="#1a1f26" strokeWidth="2.5" />}
        </g>
      ))}
      <text x="260" y="96" textAnchor="middle" fontSize="12" fill="#57514A" fontFamily="Space Grotesk, sans-serif">
        One bypass diode between two clamps, in each split box
      </text>
      <text x="56" y="306" fontSize="13" fill="#3f7fe6" fontFamily="Space Grotesk, sans-serif">−</text>
      <text x="458" y="306" fontSize="13" fill="#e5484d" fontFamily="Space Grotesk, sans-serif">+</text>
    </svg>
  );
}
