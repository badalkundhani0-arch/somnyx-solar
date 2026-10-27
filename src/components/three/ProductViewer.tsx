"use client";

import { Canvas } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { Floor, JunctionBox, StudioLights } from "./Stage";
import { webglAvailable } from "./webgl";
import { JunctionBoxIllustration } from "./Fallback";
import { useFrame } from "@react-three/fiber";

function ExplodeDriver({ target, explode }: { target: number; explode: { current: number } }) {
  useFrame((_, dt) => {
    explode.current += (target - explode.current) * (1 - Math.pow(0.003, dt));
  });
  return null;
}

/** Drag-to-rotate product view with an optional "show inside" toggle. */
export default function ProductViewer({ modelUrl, label }: { modelUrl?: string | null; label: string }) {
  const explode = useRef(0);
  const wrap = useRef<HTMLDivElement>(null);
  const [inside, setInside] = useState(false);
  const [ok, setOk] = useState<boolean | null>(null);
  const [active, setActive] = useState(false);
  const [reduced, setReduced] = useState(false);

  useEffect(() => {
    setOk(webglAvailable());
    setReduced(window.matchMedia("(prefers-reduced-motion: reduce)").matches);
    const el = wrap.current;
    if (!el) return;
    const io = new IntersectionObserver(([e]) => setActive(e.isIntersecting), { rootMargin: "150px" });
    io.observe(el);
    return () => io.disconnect();
  }, []);

  return (
    <div ref={wrap} className="relative h-full w-full touch-pan-y">
      {ok === false && (
          <div className="absolute inset-0 flex items-center justify-center p-8">
            <JunctionBoxIllustration className="h-auto w-full max-w-lg" />
          </div>
        )}
      {ok && active && (
        <Canvas
          shadows
          dpr={[1, 1.6]}
          camera={{ fov: 30, position: [6.8, 5.2, 11.2] }}
          gl={{ antialias: true, alpha: true }}
          onCreated={({ gl }) => {
            gl.toneMapping = THREE.ACESFilmicToneMapping;
          }}
          aria-label={label}
          role="img"
        >
          <StudioLights />
          <group position={[0, 0.1, -0.3]}>
            <JunctionBox explode={explode} modelUrl={modelUrl} />
          </group>
          <ExplodeDriver target={inside ? 0.8 : 0} explode={explode} />
          <Floor y={-0.7} />
          <OrbitControls
            enablePan={false}
            enableZoom={false}
            autoRotate={!reduced && !inside}
            autoRotateSpeed={0.7}
            enableDamping
            minPolarAngle={0.35}
            maxPolarAngle={1.45}
            target={[0, 0.2, 0]}
          />
        </Canvas>
      )}
      <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between gap-3">
        <span className="label">Drag to rotate.</span>
        <button type="button" onClick={() => setInside((v) => !v)} aria-pressed={inside} className="btn btn-ghost btn-sm bg-obsidian/60 backdrop-blur">
          {inside ? "Close the box" : "Show inside"}
        </button>
      </div>
    </div>
  );
}
