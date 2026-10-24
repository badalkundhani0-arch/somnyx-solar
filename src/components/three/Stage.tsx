"use client";

import { Suspense, useEffect, useMemo, useRef } from "react";
import { ContactShadows, Environment, Lightformer, useGLTF } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { JunctionBoxModel, type ExplodeRef, type FocusState } from "./JunctionBoxModel";
import { PARTS, PART_MAP, type PartId } from "@/lib/parts";

/** Studio lighting built from procedural light-formers: no HDR downloads. */
export function StudioLights({ intensity = 1 }: { intensity?: number }) {
  return (
    <>
      <ambientLight intensity={0.15 * intensity} />
      <directionalLight position={[3, 6, 4]} intensity={1.6 * intensity} castShadow shadow-mapSize={[1024, 1024]} />
      <pointLight position={[-4, 1.5, -3]} intensity={18 * intensity} color="#00D9FF" distance={12} />
      <pointLight position={[4, -1, 3]} intensity={6 * intensity} color="#7fb8ff" distance={10} />
      <Environment resolution={256} frames={1}>
        <color attach="background" args={["#dfe6ec"]} />
        <Lightformer intensity={2.2} position={[0, 5, -2]} rotation-x={Math.PI / 2} scale={[10, 3, 1]} />
        <Lightformer intensity={1.2} position={[-5, 1, 1]} rotation-y={Math.PI / 2} scale={[6, 2, 1]} color="#9fe9ff" />
        <Lightformer intensity={1.6} position={[5, 2, 0]} rotation-y={-Math.PI / 2} scale={[4, 8, 1]} />
        <Lightformer form="ring" intensity={1.5} position={[0, 2, 5]} scale={2} color="#00D9FF" />
      </Environment>
    </>
  );
}

export function Floor({ y = -0.75, opacity = 0.65 }: { y?: number; opacity?: number }) {
  return <ContactShadows position={[0, y, 0]} scale={9} blur={2.6} far={3} opacity={opacity} resolution={512} color="#000000" frames={Infinity} />;
}

type ModelProps = {
  modelUrl?: string | null;
  explode: ExplodeRef;
  state?: { current: FocusState };
  onSelect?: (id: PartId) => void;
  onHover?: (id: PartId | null) => void;
};

/** Renders an approved GLB when one is uploaded, otherwise the conceptual procedural model. */
export function JunctionBox(props: ModelProps) {
  if (props.modelUrl) {
    return (
      <Suspense fallback={null}>
        <GLBModel {...props} url={props.modelUrl} />
      </Suspense>
    );
  }
  return <JunctionBoxModel {...props} />;
}

/**
 * GLB support. To enable exploded views and part selection, name the top-level
 * nodes in the exported GLB after the part ids: enclosure, cover, terminals,
 * diodes, cablePos, cableNeg, connectors, conductors, sealing. The model should
 * be in metres-scaled units with ~2.4 units across the enclosure width, centred
 * on the origin. Unnamed nodes are shown but not exploded.
 */
function GLBModel({ url, explode, state, onSelect, onHover }: ModelProps & { url: string }) {
  const { scene } = useGLTF(url);
  const cloned = useMemo(() => scene.clone(true), [scene]);
  const parts = useMemo(() => {
    const found: { id: PartId; obj: THREE.Object3D; origin: THREE.Vector3; mats: THREE.MeshStandardMaterial[] }[] = [];
    for (const p of PARTS) {
      const obj = cloned.getObjectByName(p.id);
      if (!obj) continue;
      const mats: THREE.MeshStandardMaterial[] = [];
      obj.traverse((o) => {
        const mesh = o as THREE.Mesh;
        if (mesh.isMesh) {
          mesh.material = (mesh.material as THREE.MeshStandardMaterial).clone();
          mesh.userData.part = p.id;
          mesh.castShadow = true;
          mats.push(mesh.material as THREE.MeshStandardMaterial);
        }
      });
      found.push({ id: p.id, obj, origin: obj.position.clone(), mats });
    }
    return found;
  }, [cloned]);

  useFrame(() => {
    const e = explode.current;
    for (const p of parts) {
      const o = PART_MAP[p.id].explode;
      p.obj.position.set(p.origin.x + o[0] * e, p.origin.y + o[1] * e, p.origin.z + o[2] * e);
      if (state) {
        const { focus, hover } = state.current;
        const dim = focus !== null && focus !== p.id;
        const lit = focus === p.id || (hover === p.id && !focus);
        for (const m of p.mats) {
          m.transparent = dim;
          m.opacity = dim ? 0.12 : 1;
          if (m.emissive) {
            m.emissive.set(lit ? "#00D9FF" : "#000000");
            m.emissiveIntensity = lit ? 0.4 : 0;
          }
        }
      }
    }
  });

  return (
    <primitive
      object={cloned}
      onClick={(e: { stopPropagation: () => void; object: THREE.Object3D }) => {
        let o: THREE.Object3D | null = e.object;
        while (o && !o.userData.part) o = o.parent;
        if (o && onSelect) {
          e.stopPropagation();
          onSelect(o.userData.part);
        }
      }}
      onPointerOver={(e: { object: THREE.Object3D }) => onHover?.((e.object.userData.part as PartId) ?? null)}
      onPointerOut={() => onHover?.(null)}
    />
  );
}

/** Pauses rendering while a canvas container is off-screen. */
export function useInView<T extends HTMLElement>() {
  const ref = useRef<T>(null);
  const visible = useRef(true);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(([en]) => (visible.current = en.isIntersecting), { rootMargin: "200px" });
    io.observe(el);
    return () => io.disconnect();
  }, []);
  return { ref, visible };
}

export { webglAvailable } from "./webgl";
