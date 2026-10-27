"use client";

import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { Html } from "@react-three/drei";
import { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { anchorFor, type ExplodeRef } from "./JunctionBoxModel";
import { Floor, JunctionBox, StudioLights } from "./Stage";
import type { PartId } from "@/lib/parts";

const ease = (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);
const seg = (p: number, a: number, b: number) => Math.min(1, Math.max(0, (p - a) / (b - a)));

const NOTES: { id: PartId; label: string; detail: string; at: number }[] = [
  { id: "cover", label: "Split covers", detail: "Seal each box after termination", at: 0.6 },
  { id: "sealing", label: "Gasket and potting", detail: "IP68 moisture protection", at: 0.63 },
  { id: "diodes", label: "Bypass diodes", detail: "One in each split box", at: 0.66 },
  { id: "terminals", label: "Terminal strips", detail: "Receive the module bus ribbons", at: 0.69 },
  { id: "connectors", label: "PV connectors", detail: "Join modules into a string", at: 0.72 },
];

function Annotation({ id, label, detail, at, progress, explode }: (typeof NOTES)[number] & { progress: { current: number }; explode: ExplodeRef }) {
  const group = useRef<THREE.Group>(null);
  const el = useRef<HTMLDivElement>(null);
  useFrame(() => {
    const p = progress.current;
    const o = seg(p, at, at + 0.06) * (1 - seg(p, 0.86, 0.92));
    const [x, y, z] = anchorFor(id, explode.current);
    group.current?.position.set(x, y, z);
    if (el.current) {
      el.current.style.opacity = String(o);
      el.current.style.transform = `translate3d(0, ${(1 - o) * 10}px, 0)`;
      el.current.style.visibility = o < 0.01 ? "hidden" : "visible";
    }
  });
  const left = id === "cableNeg" || id === "sealing" || id === "cover" || id === "diodes";
  return (
    <group ref={group}>
      <Html zIndexRange={[5, 0]} style={{ pointerEvents: "none" }}>
        <div ref={el} className="relative" style={{ opacity: 0, visibility: "hidden" }}>
          <span className="absolute -left-[5px] -top-[5px] h-[10px] w-[10px] rounded-full border border-cyan bg-obsidian shadow-[0_0_14px_rgba(255,163,25,0.9)]" />
          <span className={`absolute top-0 h-px w-14 bg-cyan/70 ${left ? "right-[5px]" : "left-[5px]"}`} />
          <div className={`absolute -top-[22px] w-max max-w-[11rem] ${left ? "right-[66px] text-right" : "left-[66px]"}`}>
            <p className="font-display text-[0.9rem] leading-tight text-white">{label}</p>
            <p className="mt-0.5 text-[0.72rem] leading-snug text-silver">{detail}</p>
          </div>
        </div>
      </Html>
    </group>
  );
}

function Rig({ progress, explode, reduced }: { progress: { current: number }; explode: ExplodeRef; reduced: boolean }) {
  const model = useRef<THREE.Group>(null);
  const smooth = useRef(0);
  const pointer = useRef({ x: 0, y: 0 });
  const { camera, size } = useThree();
  const look = useRef(new THREE.Vector3());

  useEffect(() => {
    const move = (e: PointerEvent) => {
      pointer.current.x = (e.clientX / window.innerWidth) * 2 - 1;
      pointer.current.y = (e.clientY / window.innerHeight) * 2 - 1;
    };
    window.addEventListener("pointermove", move, { passive: true });
    return () => window.removeEventListener("pointermove", move);
  }, []);

  useFrame((state, dt) => {
    const k = 1 - Math.pow(0.002, dt);
    smooth.current += (progress.current - smooth.current) * k;
    const p = smooth.current;
    const t = state.clock.elapsedTime;
    const narrow = size.width / size.height < 0.9;
    const dist = narrow ? 1.75 : 1;

    const rotA = ease(seg(p, 0, 0.3));
    const approach = ease(seg(p, 0.15, 0.45));
    const ex = ease(seg(p, 0.38, 0.62));
    const out = ease(seg(p, 0.86, 1));
    explode.current = ex * (1 - out * 0.4);

    if (model.current) {
      const float = reduced ? 0 : Math.sin(t * 0.9) * 0.07 * (1 - ex);
      model.current.rotation.y = -0.55 + rotA * 1.25 - ex * 0.55 + (reduced ? 0 : pointer.current.x * 0.08) + out * 0.6;
      model.current.rotation.x = 0.28 - approach * 0.12 + (reduced ? 0 : pointer.current.y * 0.04);
      model.current.position.y = float + ex * -0.35 - out * 0.4;
      const s = 1 - out * 0.25;
      model.current.scale.setScalar(s);
    }

    // Start wide with the box riding high and left of centre (the headline owns the lower
    // third, the copy owns the right), then dolly in, rise over the exploded stack and pull away.
    const shift = narrow ? 0 : 0.85 * (1 - approach) + ex * 1.75 * (1 - out);
    camera.position.set(
      (0.3 - approach * 0.3 + ex * 1.2) * dist + shift,
      (1.3 + ex * 1.6 + out * 1.6) * (narrow ? 1.25 : 1),
      (10.9 - approach * 3.6 + ex * 3.4 + out * 2.0) * dist,
    );
    const lift = narrow ? 2.1 : 1.05; // on phones the copy fills the lower half, so the box rides higher
    look.current.set(shift, -lift + approach * lift * 0.9 + ex * 0.55 - out * 0.5, 0);
    camera.lookAt(look.current);
  });

  return (
    <group ref={model}>
      <JunctionBox explode={explode} />
      {NOTES.map((n) => (
        <Annotation key={n.id} {...n} progress={progress} explode={explode} />
      ))}
    </group>
  );
}

export default function HeroScene({ progress, reduced }: { progress: { current: number }; reduced: boolean }) {
  const explode = useRef(0);
  const wrap = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState(true);

  useEffect(() => {
    const el = wrap.current;
    if (!el) return;
    const io = new IntersectionObserver(([e]) => setActive(e.isIntersecting), { rootMargin: "100px" });
    io.observe(el);
    return () => io.disconnect();
  }, []);

  return (
    <div ref={wrap} className="absolute inset-0">
      <Canvas
        frameloop={active ? "always" : "never"}
        shadows
        dpr={[1, typeof window !== "undefined" && window.innerWidth < 768 ? 1.4 : 1.8]}
        camera={{ fov: 32, position: [0, 1, 7.4], near: 0.1, far: 60 }}
        gl={{ antialias: true, alpha: true, powerPreference: "high-performance" }}
        onCreated={({ gl }) => {
          gl.toneMapping = THREE.ACESFilmicToneMapping;
          gl.toneMappingExposure = 1.05;
        }}
        aria-label="3D model of the Somnyx 3-split PV junction box"
        role="img"
      >
        <StudioLights />
        <Rig progress={progress} explode={explode} reduced={reduced} />
        <Floor y={-0.95} opacity={0.55} />
      </Canvas>
    </div>
  );
}
