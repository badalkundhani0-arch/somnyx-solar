"use client";

import { useState } from "react";

/**
 * Schematic of a three-substring PV module and its junction box.
 * Full sun: current flows through every substring; all diodes are reverse-biased.
 * Shaded: the middle substring can no longer carry string current, so its diode
 * becomes forward-biased and conducts the current around it.
 */
const SUB_X = [70, 270, 470];
const BUS_Y = 340;
const NODES = [50, 250, 450, 650];

function subPath(i: number) {
  const x = SUB_X[i];
  return `M ${NODES[i]} ${BUS_Y} L ${x + 30} ${BUS_Y} L ${x + 30} 46 L ${x + 130} 46 L ${x + 130} ${BUS_Y} L ${NODES[i + 1]} ${BUS_Y}`;
}
function busPath(i: number) {
  return `M ${NODES[i]} ${BUS_Y} L ${NODES[i + 1]} ${BUS_Y}`;
}

function Cells({ i, shaded }: { i: number; shaded: boolean }) {
  const x = SUB_X[i];
  const cells = [];
  for (let c = 0; c < 2; c++)
    for (let r = 0; r < 6; r++)
      cells.push(
        <rect
          key={`${c}-${r}`}
          x={x + 8 + c * 100}
          y={56 + r * 40}
          width={44}
          height={34}
          rx={3}
          className="transition-[fill,opacity] duration-700"
          fill={shaded ? "#d9dee5" : "#123447"}
          stroke={shaded ? "#D3CDC4" : "#1f5f7a"}
          strokeWidth={1}
        />,
      );
  return <g>{cells}</g>;
}

function Diode({ i, on }: { i: number; on: boolean }) {
  const cx = (NODES[i] + NODES[i + 1]) / 2;
  const color = on ? "#F08C00" : "#4a5563";
  return (
    <g transform={`translate(${cx} ${BUS_Y})`} className="transition-all duration-500">
      {on && <circle r="26" fill="#F08C00" opacity="0.14" />}
      <path d="M -11 -12 L 11 0 L -11 12 Z" fill={on ? "#F08C00" : "#ffffff"} stroke={color} strokeWidth="2" strokeLinejoin="round" />
      <path d="M 11 -13 L 11 13" stroke={color} strokeWidth="2.5" />
      <text y="34" textAnchor="middle" fontSize="12" fill={on ? "#F08C00" : "#6b7684"} fontFamily="Space Grotesk, sans-serif">
        {on ? `D${i + 1} conducting` : `D${i + 1} off`}
      </text>
    </g>
  );
}

export function BypassDiagram() {
  const [shaded, setShaded] = useState(false);

  return (
    <div className="overflow-hidden rounded-[28px] border border-line bg-graphite">
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-line p-4 md:p-6">
        <div role="radiogroup" aria-label="Lighting condition" className="inline-flex rounded-full border border-line-strong p-1">
          {[
            { v: false, l: "Full sun" },
            { v: true, l: "Shade one substring" },
          ].map((o) => (
            <button
              key={o.l}
              role="radio"
              aria-checked={shaded === o.v}
              type="button"
              onClick={() => setShaded(o.v)}
              className={`rounded-full px-4 py-2 text-sm transition-colors ${shaded === o.v ? "bg-cyan text-ink" : "text-silver hover:text-white"}`}
            >
              {o.l}
            </button>
          ))}
        </div>
        <p className="text-sm text-steel">Three-substring module with a 3-split junction box</p>
      </div>

      <div className="grid lg:grid-cols-[1.5fr_1fr]">
        <div className="relative p-4 md:p-8">
          <svg viewBox="0 0 700 400" className="w-full" role="img" aria-labelledby="bypass-title bypass-desc">
            <title id="bypass-title">Bypass diode operation</title>
            <desc id="bypass-desc">
              {shaded
                ? "The middle substring is shaded. Its bypass diode conducts, so string current flows along the junction box bus around the shaded cells."
                : "In full sun, current flows through all three substrings in series and every bypass diode is off."}
            </desc>
            {/* module frame */}
            <rect x="60" y="30" width="580" height="270" rx="10" fill="#ffffff" stroke="#DDD8D0" />
            {[0, 1, 2].map((i) => (
              <g key={i}>
                <Cells i={i} shaded={shaded && i === 1} />
                <text x={SUB_X[i] + 80} y="22" textAnchor="middle" fontSize="13" fill="#4a5563" fontFamily="Space Grotesk, sans-serif">
                  Substring {i + 1}
                </text>
              </g>
            ))}

            {/* shadow */}
            <g className="transition-opacity duration-700" style={{ opacity: shaded ? 1 : 0 }}>
              <rect x={SUB_X[1] - 4} y="34" width="168" height="262" rx="8" fill="#000" opacity="0.55" />
              <text x={SUB_X[1] + 80} y="176" textAnchor="middle" fontSize="15" fill="#ffffff" fontFamily="Space Grotesk, sans-serif">
                Shaded
              </text>
            </g>

            {/* three split junction boxes, one per diode */}
            {[0, 1, 2].map((i) => {
              const cx = (NODES[i] + NODES[i + 1]) / 2;
              return <rect key={`jb-${i}`} x={cx - 62} y="314" width="124" height="58" rx="12" fill="#FAF8F5" stroke="#C9C2B8" />;
            })}
            <text x="650" y="396" textAnchor="end" fontSize="12" fill="#6b7684" fontFamily="Inter, sans-serif">
              3-split junction box
            </text>

            {/* base wiring */}
            {[0, 1, 2].map((i) => (
              <path key={i} d={subPath(i)} fill="none" stroke="#D3CDC4" strokeWidth="3" />
            ))}
            <path d={`M ${NODES[0]} ${BUS_Y} L ${NODES[3]} ${BUS_Y}`} fill="none" stroke="#D3CDC4" strokeWidth="3" />

            {/* current flow overlay */}
            {[0, 1, 2].map((i) => {
              const bypass = shaded && i === 1;
              return (
                <g key={`flow-${i}`}>
                  <path
                    d={subPath(i)}
                    fill="none"
                    stroke="#F08C00"
                    strokeWidth="3"
                    strokeDasharray="10 10"
                    className="transition-opacity duration-500 [animation:flow_0.8s_linear_infinite]"
                    style={{ opacity: bypass ? 0 : 1 }}
                  />
                  <path
                    d={busPath(i)}
                    fill="none"
                    stroke="#F08C00"
                    strokeWidth="4"
                    strokeDasharray="10 10"
                    className="transition-opacity duration-500 [animation:flow_0.8s_linear_infinite]"
                    style={{ opacity: bypass ? 1 : 0 }}
                  />
                </g>
              );
            })}
            {NODES.map((x) => (
              <circle key={x} cx={x} cy={BUS_Y} r="4.5" fill="#4a5563" />
            ))}
            {[0, 1, 2].map((i) => (
              <Diode key={i} i={i} on={shaded && i === 1} />
            ))}
            <text x={NODES[0] - 6} y={BUS_Y - 12} textAnchor="middle" fontSize="16" fill="#3f7fe6" fontFamily="Space Grotesk, sans-serif">
              −
            </text>
            <text x={NODES[3] + 6} y={BUS_Y - 12} textAnchor="middle" fontSize="16" fill="#e5484d" fontFamily="Space Grotesk, sans-serif">
              +
            </text>
          </svg>
        </div>
        <div className="border-t border-line p-6 md:p-8 lg:border-l lg:border-t-0" aria-live="polite">
          {shaded ? (
            <div key="s" className="animate-[fadein_0.5s_ease]">
              <h3 className="display-s">The diode takes the current</h3>
              <p className="mt-4 text-silver">
                Shaded cells can no longer carry the current the rest of the string is pushing through them. Without protection they would be driven into reverse bias and
                dissipate power as heat, creating a hot spot that can damage the module.
              </p>
              <p className="mt-4 text-silver">
                Instead, the diode across that substring becomes forward-biased and routes the string current around it. The module loses roughly the shaded
                substring&rsquo;s share of its voltage, and the rest keeps producing.
              </p>
              <p className="mt-4 text-silver">
                The diode now carries full current continuously, which is why its temperature, and the box&rsquo;s ability to shed that heat, are central design
                questions.
              </p>
            </div>
          ) : (
            <div key="f" className="animate-[fadein_0.5s_ease]">
              <h3 className="display-s">Current flows through every cell</h3>
              <p className="mt-4 text-silver">
                In full sun all three substrings generate, and current passes through them in series. Each bypass diode is reverse-biased and carries almost no
                current.
              </p>
              <p className="mt-4 text-silver">Switch to a shaded condition to see what the junction box does when part of the module stops producing.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
