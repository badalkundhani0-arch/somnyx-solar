"use client";

import { useState } from "react";

type Item = { title: string; body: string; points: string[]; Diagram: () => React.ReactElement };

const stroke = { fill: "none", stroke: "currentColor", strokeWidth: 1.5 } as const;

function ElectricalDiagram() {
  return (
    <svg viewBox="0 0 400 260" className="w-full text-silver" aria-hidden="true">
      <path d="M30 200 H110 V80 H190 V200 H270 V80 H370" {...stroke} stroke="#c3ccd6" strokeWidth="3" />
      <path d="M30 200 H110 V80 H190 V200 H270 V80 H370" fill="none" stroke="#00a3c7" strokeWidth="3" strokeDasharray="8 10" className="[animation:flow_1s_linear_infinite]" />
      {[110, 190, 270].map((x) => (
        <g key={x} transform={`translate(${x} 140)`}>
          <rect x="-16" y="-22" width="32" height="44" rx="4" fill="#ffffff" stroke="#b8c2cd" />
          <path d="M-7 -8 L7 0 L-7 8Z M7 -9V9" fill="none" stroke="#00a3c7" strokeWidth="1.6" />
        </g>
      ))}
      <text x="30" y="232" fontSize="12" fill="#6b7684">Contact resistance, conductor section, diode forward voltage</text>
    </svg>
  );
}

function ThermalDiagram() {
  return (
    <svg viewBox="0 0 400 260" className="w-full" aria-hidden="true">
      <defs>
        <radialGradient id="heat" cx="50%" cy="50%" r="50%">
          <stop offset="0" stopColor="#ff8a3d" stopOpacity="0.9" />
          <stop offset="0.45" stopColor="#b26a00" stopOpacity="0.35" />
          <stop offset="1" stopColor="#00a3c7" stopOpacity="0" />
        </radialGradient>
      </defs>
      <rect x="30" y="40" width="160" height="150" rx="10" fill="#ffffff" stroke="#b8c2cd" />
      <circle cx="110" cy="115" r="70" fill="url(#heat)" className="animate-pulse" />
      <rect x="92" y="100" width="36" height="30" rx="3" fill="#16181c" stroke="#6b7684" />
      <path d="M50 115h42 M128 115h42" stroke="#9aa5b1" strokeWidth="6" />
      <g transform="translate(220 40)">
        <path d="M0 0 V150 H160" fill="none" stroke="#b8c2cd" />
        <path d="M0 30 H80 Q100 30 120 80 L150 140" fill="none" stroke="#00a3c7" strokeWidth="2" />
        <text x="4" y="-8" fontSize="11" fill="#6b7684">Allowable current</text>
        <text x="160" y="168" fontSize="11" fill="#6b7684" textAnchor="end">Ambient temperature</text>
      </g>
      <text x="30" y="230" fontSize="12" fill="#6b7684">Diode derating with ambient temperature</text>
    </svg>
  );
}

function SealingDiagram() {
  return (
    <svg viewBox="0 0 400 260" className="w-full" aria-hidden="true">
      <path d="M60 80 H340 V96 H60Z" fill="#11151b" stroke="#b8c2cd" />
      <path d="M70 96 H330" stroke="#2a8aa3" strokeWidth="6" />
      <path d="M60 100 H340 V200 H60Z" fill="#ffffff" stroke="#b8c2cd" />
      <rect x="76" y="150" width="248" height="46" fill="#5fdcf5" opacity="0.14" />
      {[100, 170, 240, 300].map((x, i) => (
        <path key={x} d={`M${x} 30 q6 10 0 16 q-6 -6 0 -16z`} fill="#3f7fe6" opacity="0.8" className="animate-bounce" style={{ animationDelay: `${i * 0.2}s` }} />
      ))}
      <text x="200" y="230" fontSize="12" fill="#6b7684" textAnchor="middle">Lid gasket, potting fill and cable gland seal</text>
    </svg>
  );
}

function MaterialsDiagram() {
  const layers = [
    { h: 26, c: "#11151b", l: "UV-stabilised housing polymer" },
    { h: 22, c: "#1b4555", l: "Insulation and creepage barriers" },
    { h: 18, c: "#9aa5b1", l: "Tin-plated copper terminals" },
    { h: 24, c: "#164a5c", l: "Silicone potting" },
    { h: 18, c: "#c7d0da", l: "Adhesive bond to module" },
  ];
  let y = 30;
  return (
    <svg viewBox="0 0 400 260" className="w-full" aria-hidden="true">
      {layers.map((L) => {
        const yy = y;
        y += L.h + 8;
        return (
          <g key={L.l}>
            <rect x="30" y={yy} width="150" height={L.h} rx="4" fill={L.c} stroke="#b8c2cd" />
            <path d={`M186 ${yy + L.h / 2} H210`} stroke="#00a3c7" />
            <text x="216" y={yy + L.h / 2 + 4} fontSize="12" fill="#4a5563">
              {L.l}
            </text>
          </g>
        );
      })}
    </svg>
  );
}

function ManufacturingDiagram() {
  const st = ["Insert", "Join", "Terminate", "Seal", "Test"];
  return (
    <svg viewBox="0 0 400 260" className="w-full" aria-hidden="true">
      <path d="M20 140 H380" stroke="#b8c2cd" strokeWidth="2" />
      <path d="M20 140 H380" stroke="#00a3c7" strokeWidth="2" strokeDasharray="4 14" className="[animation:flow_1.4s_linear_infinite]" />
      {st.map((s, i) => (
        <g key={s} transform={`translate(${50 + i * 75} 140)`}>
          <rect x="-28" y="-46" width="56" height="40" rx="6" fill="#ffffff" stroke="#b8c2cd" />
          <path d="M0 -6 V0" stroke="#6b7684" />
          <circle r="4" fill="#00a3c7" />
          <text y="-22" textAnchor="middle" fontSize="11" fill="#4a5563">
            {s}
          </text>
          <text y="30" textAnchor="middle" fontSize="10" fill="#6b7684">
            Station {i + 1}
          </text>
        </g>
      ))}
      <text x="200" y="230" fontSize="12" fill="#6b7684" textAnchor="middle">
        Fixtured stations, defined sequence, recorded results
      </text>
    </svg>
  );
}

function ValidationDiagram() {
  const tests = ["Ingress protection", "Thermal cycling", "Damp heat", "Humidity freeze", "UV exposure", "Bypass diode thermal", "Cable anchorage", "Insulation and impulse"];
  return (
    <svg viewBox="0 0 400 260" className="w-full" aria-hidden="true">
      {tests.map((t, i) => (
        <g key={t} transform={`translate(${30 + (i % 2) * 180} ${34 + Math.floor(i / 2) * 44})`}>
          <rect width="160" height="32" rx="16" fill="#ffffff" stroke="#b8c2cd" />
          <circle cx="16" cy="16" r="5" fill="none" stroke="#00a3c7" />
          <text x="30" y="20" fontSize="11" fill="#4a5563">
            {t}
          </text>
        </g>
      ))}
      <text x="200" y="232" fontSize="12" fill="#6b7684" textAnchor="middle">
        Test categories under IEC/EN 62790
      </text>
    </svg>
  );
}

const ITEMS: Item[] = [
  {
    title: "Electrical performance and component selection",
    body: "Every joint and conductor in the current path adds resistance and heat. We select diodes, terminal metals and cable for low losses at each variant's rated current.",
    points: ["Diode forward voltage and current rating", "Conductor cross-sections sized for continuous current", "Stable, low-resistance joints"],
    Diagram: ElectricalDiagram,
  },
  {
    title: "Thermal management and diode derating",
    body: "A bypassing diode dissipates heat continuously inside a sealed box on a hot module. Our split design places one diode in each of three boxes, and terminal design spreads heat away from each junction.",
    points: ["Junction temperature limits at worst-case ambient", "Derating against module short-circuit current", "Heat spreading through terminals and potting"],
    Diagram: ThermalDiagram,
  },
  {
    title: "Environmental sealing and enclosure design",
    body: "The box must keep water out for decades through rain, condensation and thermal cycling. Each split box is sealed to IP68 with a cover gasket, potting and sealed cable entries.",
    points: ["Gasket and lid retention under thermal cycling", "Sealing at every cable entry", "Potting coverage of live parts"],
    Diagram: SealingDiagram,
  },
  {
    title: "Material and insulation selection",
    body: "Housing, insulation and potting materials must hold their electrical and mechanical properties after long exposure to UV, heat and humidity at 1500 V.",
    points: ["UV and thermal ageing resistance", "Tracking resistance and flammability", "Adhesion to the module surface"],
    Diagram: MaterialsDiagram,
  },
  {
    title: "Manufacturing and assembly optimisation",
    body: "The product and its assembly process are designed together, so that every unit is built the same way and inspected at each step.",
    points: ["Design for fixtured, repeatable assembly", "Error-proofing of polarity and orientation", "Traceability from component lot to finished set"],
    Diagram: ManufacturingDiagram,
  },
  {
    title: "Validation and quality assurance",
    body: "Our junction boxes are built to IEC/EN 62790, with quality checks designed into production and electrical testing at the end of the line.",
    points: ["Testing aligned to IEC/EN 62790 categories", "End-of-line electrical testing on every unit", "Production quality checks and batch sampling"],
    Diagram: ValidationDiagram,
  },
];

export function Priorities() {
  const [active, setActive] = useState(0);
  const A = ITEMS[active];
  return (
    <div className="grid gap-8 lg:grid-cols-[1fr_1.1fr] lg:gap-16">
      <ol className="border-t border-line">
        {ITEMS.map((it, i) => {
          const on = i === active;
          return (
            <li key={it.title} className="border-b border-line">
              <button
                type="button"
                onClick={() => setActive(i)}
                aria-expanded={on}
                aria-controls={`priority-${i}`}
                className="group flex w-full items-baseline gap-5 py-5 text-left"
              >
                <span className={`font-display text-sm tabular-nums transition-colors ${on ? "text-accent" : "text-steel"}`}>{i + 1}</span>
                <span className={`font-display text-xl tracking-tight transition-colors md:text-2xl ${on ? "text-white" : "text-silver group-hover:text-white"}`}>{it.title}</span>
              </button>
              <div id={`priority-${i}`} className={`grid transition-[grid-template-rows] duration-500 ease-out-expo ${on ? "grid-rows-[1fr]" : "grid-rows-[0fr]"}`}>
                <div className="overflow-hidden">
                  <div className="pb-6 pl-9">
                    <p className="text-silver">{it.body}</p>
                    <ul className="mt-4 space-y-2">
                      {it.points.map((p) => (
                        <li key={p} className="flex gap-3 text-sm text-silver">
                          <span className="mt-[0.55rem] h-px w-4 shrink-0 bg-cyan" />
                          {p}
                        </li>
                      ))}
                    </ul>
                    <div className="mt-6 rounded-2xl border border-line bg-graphite p-4 lg:hidden">
                      <it.Diagram />
                    </div>
                  </div>
                </div>
              </div>
            </li>
          );
        })}
      </ol>
      <div className="hidden lg:block">
        <div className="sticky top-28 overflow-hidden rounded-[28px] border border-line bg-graphite p-8">
          <div className="blueprint-grid absolute inset-0 opacity-50" />
          <div key={active} className="relative animate-[fadein_0.6s_ease]">
            <p className="label mb-6">{A.title}</p>
            <A.Diagram />
          </div>
        </div>
      </div>
    </div>
  );
}
