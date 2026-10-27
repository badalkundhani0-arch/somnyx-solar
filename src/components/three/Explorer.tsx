"use client";

import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import type { OrbitControls as OrbitImpl } from "three-stdlib";
import { anchorFor, type FocusState } from "./JunctionBoxModel";
import { Floor, JunctionBox, StudioLights } from "./Stage";
import { webglAvailable } from "./webgl";
import { JunctionBoxIllustration } from "./Fallback";
import { PARTS, PART_MAP, type PartId } from "@/lib/parts";

const HOME_POS = new THREE.Vector3(6.4, 5.4, 9.8);
const HOME_TARGET = new THREE.Vector3(0, 0.45, 0.2);

function CameraDirector({ focus, controls }: { focus: PartId | null; controls: React.RefObject<OrbitImpl | null> }) {
  const { camera } = useThree();
  const flying = useRef(false);
  const goalPos = useRef(HOME_POS.clone());
  const goalTarget = useRef(HOME_TARGET.clone());

  useEffect(() => {
    if (focus) {
      const [x, y, z] = anchorFor(focus, 1);
      const t = new THREE.Vector3(x, y, z);
      const dir = new THREE.Vector3().subVectors(camera.position, controls.current?.target ?? HOME_TARGET).normalize();
      dir.y = Math.max(dir.y, 0.35);
      dir.normalize();
      goalTarget.current.copy(t);
      goalPos.current.copy(t).addScaledVector(dir, focus === "connectors" || focus.startsWith("cable") ? 4.2 : 4.8);
    } else {
      goalTarget.current.copy(HOME_TARGET);
      goalPos.current.copy(HOME_POS);
    }
    flying.current = true;
  }, [focus, camera, controls]);

  useFrame((_, dt) => {
    if (!flying.current || !controls.current) return;
    const k = 1 - Math.pow(0.02, dt);
    camera.position.lerp(goalPos.current, k);
    controls.current.target.lerp(goalTarget.current, k);
    controls.current.update();
    if (camera.position.distanceTo(goalPos.current) < 0.02) flying.current = false;
  });
  return null;
}

export default function Explorer({ modelUrl }: { modelUrl?: string | null }) {
  const [focus, setFocus] = useState<PartId | null>(null);
  const [hover, setHover] = useState<PartId | null>(null);
  const state = useRef<FocusState>({ focus: null, hover: null });
  const explode = useRef(1);
  const controls = useRef<OrbitImpl | null>(null);
  const wrap = useRef<HTMLDivElement>(null);
  const [ok, setOk] = useState<boolean | null>(null);
  const [active, setActive] = useState(false);

  state.current = { focus, hover };

  useEffect(() => {
    setOk(webglAvailable());
    const el = wrap.current;
    if (!el) return;
    const io = new IntersectionObserver(([e]) => setActive(e.isIntersecting), { rootMargin: "200px" });
    io.observe(el);
    return () => io.disconnect();
  }, []);

  const select = (id: PartId | null) => setFocus((cur) => (cur === id ? null : id));
  const info = focus ? PART_MAP[focus] : null;

  return (
    <div className="grid grid-cols-1 overflow-hidden rounded-[28px] border border-line bg-graphite lg:grid-cols-[1.6fr_1fr]">
      <div ref={wrap} className="relative min-w-0 h-[58vh] min-h-[380px] touch-pan-y bg-[radial-gradient(ellipse_at_center,#ffffff,#F1EEE9_75%)] lg:h-[680px]">
        <div className="blueprint-grid absolute inset-0 opacity-70" />
        {ok === false && (
          <div className="absolute inset-0 flex items-center justify-center p-8">
            <JunctionBoxIllustration className="h-auto w-full max-w-lg" />
          </div>
        )}
        {ok && active && (
          <Canvas
            shadows
            dpr={[1, 1.6]}
            camera={{ fov: 32, position: HOME_POS.toArray() as [number, number, number] }}
            gl={{ antialias: true, alpha: true }}
            onCreated={({ gl }) => (gl.toneMapping = THREE.ACESFilmicToneMapping)}
            onPointerMissed={() => setFocus(null)}
            aria-label="Interactive exploded view of the Somnyx 3-split PV junction box"
            role="img"
          >
            <StudioLights />
            <JunctionBox explode={explode} state={state} onSelect={select} onHover={setHover} modelUrl={modelUrl} />
            <Floor y={-1.0} opacity={0.5} />
            <OrbitControls ref={controls} makeDefault enablePan={false} enableZoom={false} enableDamping minDistance={2.5} maxDistance={16} maxPolarAngle={1.5} target={HOME_TARGET.toArray() as [number, number, number]} />
            <CameraDirector focus={focus} controls={controls} />
          </Canvas>
        )}
        <div className="pointer-events-none absolute left-4 top-4 flex flex-wrap gap-2">
          <span className="label rounded-full border border-line bg-obsidian/70 px-3 py-1 backdrop-blur">3-split junction box, exploded</span>
        </div>
        <p className="pointer-events-none absolute bottom-4 left-4 text-xs text-steel">
          <span className="hidden md:inline">Click a part to inspect it. Drag to rotate.</span>
          <span className="md:hidden">Tap a part. Swipe sideways to rotate.</span>
        </p>
        {focus && (
          <button type="button" onClick={() => setFocus(null)} className="btn btn-ghost btn-sm absolute bottom-3 right-3 bg-obsidian/70 backdrop-blur">
            Show all parts
          </button>
        )}
      </div>

      <div className="flex min-w-0 flex-col border-t border-line lg:border-l lg:border-t-0">
        <div className="border-b border-line p-4 md:p-6">
          <p className="label mb-3" id="parts-label">
            Components
          </p>
          <div role="group" aria-labelledby="parts-label" className="-mx-1 flex gap-1.5 overflow-x-auto pb-1 lg:flex-wrap lg:overflow-visible">
            {PARTS.map((p) => {
              const on = focus === p.id;
              return (
                <button
                  key={p.id}
                  type="button"
                  aria-pressed={on}
                  onClick={() => select(p.id)}
                  onMouseEnter={() => setHover(p.id)}
                  onMouseLeave={() => setHover(null)}
                  className={`shrink-0 rounded-full border px-3.5 py-1.5 text-sm transition-colors ${
                    on ? "border-cyan bg-cyan text-ink" : "border-line-strong text-silver hover:border-cyan hover:text-white"
                  }`}
                >
                  {p.name}
                </button>
              );
            })}
          </div>
        </div>
        <div className="flex-1 p-5 md:p-7" aria-live="polite">
          {info ? (
            <div key={info.id} className="animate-[fadein_0.5s_ease]">
              <h3 className="display-s">{info.name}</h3>
              <p className="mt-4 text-silver">{info.fn}</p>
              <p className="label mb-3 mt-7">Engineering focus</p>
              <ul className="space-y-3">
                {info.considerations.map((c) => (
                  <li key={c} className="flex gap-3 text-[0.95rem] text-silver">
                    <span className="mt-[0.6rem] h-px w-4 shrink-0 bg-cyan" />
                    {c}
                  </li>
                ))}
              </ul>
            </div>
          ) : (
            <div>
              <h3 className="display-s">Three boxes, one job</h3>
              <p className="mt-4 text-silver">
                Carry a module&rsquo;s full current safely for its whole life. Select a component to see what it does and the engineering questions that shape it.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
