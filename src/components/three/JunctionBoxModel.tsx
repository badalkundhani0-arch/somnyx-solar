"use client";

/**
 * Procedural 3-split PV junction box: three separate enclosures, one bypass
 * diode in each, with the PV cables leaving the two outer boxes.
 * Built from primitives; replace with a CAD-derived GLB from the admin
 * dashboard at any time (see README: "Replacing the 3D model").
 */

import { useLayoutEffect, useMemo, useRef, type ReactNode } from "react";
import { useFrame, type ThreeEvent } from "@react-three/fiber";
import * as THREE from "three";
import { PART_MAP, type PartId } from "@/lib/parts";

export type ExplodeRef = { current: number };
export type FocusState = { focus: PartId | null; hover: PartId | null };

const CYAN = new THREE.Color("#FFA319");

function roundedRect(w: number, h: number, r: number) {
  const s = new THREE.Shape();
  const x = -w / 2;
  const y = -h / 2;
  s.moveTo(x + r, y);
  s.lineTo(x + w - r, y);
  s.quadraticCurveTo(x + w, y, x + w, y + r);
  s.lineTo(x + w, y + h - r);
  s.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
  s.lineTo(x + r, y + h);
  s.quadraticCurveTo(x, y + h, x, y + h - r);
  s.lineTo(x, y + r);
  s.quadraticCurveTo(x, y, x + r, y);
  return s;
}

function holePath(w: number, h: number, r: number) {
  const s = roundedRect(w, h, r);
  const p = new THREE.Path(s.getPoints(24).reverse());
  return p;
}

/** Extrude a shape upward (Y) by `depth`, base at y=0. */
function useExtruded(shape: THREE.Shape, depth: number, bevel = 0.012) {
  return useMemo(() => {
    const g = new THREE.ExtrudeGeometry(shape, { depth, bevelEnabled: bevel > 0, bevelThickness: bevel, bevelSize: bevel, bevelSegments: 3, curveSegments: 18 });
    g.rotateX(-Math.PI / 2);
    g.translate(0, 0, 0);
    g.computeVertexNormals();
    return g;
  }, [shape, depth, bevel]);
}

/* ─────────────────────────── Materials ─────────────────────────── */

function useMaterials() {
  return useMemo(
    () => ({
      housing: new THREE.MeshPhysicalMaterial({ color: "#0d1015", roughness: 0.42, metalness: 0.05, clearcoat: 0.35, clearcoatRoughness: 0.4 }),
      housingInner: new THREE.MeshStandardMaterial({ color: "#07090c", roughness: 0.9 }),
      cover: new THREE.MeshPhysicalMaterial({ color: "#11151b", roughness: 0.35, metalness: 0.08, clearcoat: 0.6, clearcoatRoughness: 0.25 }),
      tin: new THREE.MeshStandardMaterial({ color: "#c9d0d8", roughness: 0.3, metalness: 0.7 }),
      copper: new THREE.MeshStandardMaterial({ color: "#d58a55", roughness: 0.3, metalness: 0.75 }),
      epoxy: new THREE.MeshStandardMaterial({ color: "#16181c", roughness: 0.55 }),
      band: new THREE.MeshStandardMaterial({ color: "#c7ccd3", roughness: 0.4, metalness: 0.5 }),
      cable: new THREE.MeshStandardMaterial({ color: "#0b0c0e", roughness: 0.62 }),
      connector: new THREE.MeshPhysicalMaterial({ color: "#1a1f26", roughness: 0.38, clearcoat: 0.4 }),
      red: new THREE.MeshStandardMaterial({ color: "#e5484d", roughness: 0.5 }),
      blue: new THREE.MeshStandardMaterial({ color: "#3f7fe6", roughness: 0.5 }),
      gasket: new THREE.MeshStandardMaterial({ color: "#2a4651", roughness: 0.7 }),
      potting: new THREE.MeshPhysicalMaterial({ color: "#FFC56B", roughness: 0.15, transmission: 0, transparent: true, opacity: 0.16, depthWrite: false }),
      accent: new THREE.MeshStandardMaterial({ color: "#FFA319", emissive: "#FFA319", emissiveIntensity: 1.4, roughness: 0.3 }),
    }),
    [],
  );
}

/* ─────────────────────────── Part wrapper ─────────────────────────── */

type PartProps = {
  id: PartId;
  side?: 1 | -1;
  explode: ExplodeRef;
  state?: { current: FocusState };
  onSelect?: (id: PartId) => void;
  onHover?: (id: PartId | null) => void;
  children: ReactNode;
};

/**
 * Moves its children by the part's explode offset and handles highlight/dim.
 * Materials are cloned per part so dimming one part never affects another.
 */
function Part({ id, side = 1, explode, state, onSelect, onHover, children }: PartProps) {
  const ref = useRef<THREE.Group>(null);
  const mats = useRef<{ m: THREE.MeshStandardMaterial; baseOpacity: number; baseTransparent: boolean; baseEmissive: THREE.Color; baseEI: number }[]>([]);
  const off = PART_MAP[id].explode;

  useLayoutEffect(() => {
    const list: typeof mats.current = [];
    ref.current?.traverse((o) => {
      const mesh = o as THREE.Mesh;
      if (!mesh.isMesh) return;
      const m = (mesh.material as THREE.MeshStandardMaterial).clone();
      mesh.material = m;
      mesh.userData.part = id;
      list.push({ m, baseOpacity: m.opacity, baseTransparent: m.transparent, baseEmissive: m.emissive.clone(), baseEI: m.emissiveIntensity });
    });
    mats.current = list;
  }, [id]);

  useFrame((_, dt) => {
    const g = ref.current;
    if (!g) return;
    const e = explode.current;
    g.position.set(id === "connectors" ? 0 : off[0] * side * e, off[1] * e, off[2] * e);
    // Ribbons belong to the module, not the box: only show them once the stack opens.
    if (id === "conductors") g.visible = e > 0.06;
    if (!state) return;
    const { focus, hover } = state.current;
    const dim = focus !== null && focus !== id;
    const lit = focus === id || (hover === id && focus === null);
    const k = 1 - Math.pow(0.0015, dt);
    for (const it of mats.current) {
      const targetOpacity = dim ? Math.min(0.12, it.baseOpacity) : it.baseOpacity;
      it.m.opacity += (targetOpacity - it.m.opacity) * k;
      it.m.transparent = it.baseTransparent || it.m.opacity < 0.999;
      it.m.depthWrite = !it.m.transparent;
      const targetEI = lit ? 0.55 : it.baseEI;
      it.m.emissiveIntensity += (targetEI - it.m.emissiveIntensity) * k;
      it.m.emissive.lerpColors(it.baseEmissive, CYAN, lit ? Math.min(1, it.m.emissiveIntensity / 0.55) : 0);
    }
  });

  const interactive = Boolean(onSelect);
  return (
    <group
      ref={ref}
      name={id}
      onClick={
        interactive
          ? (e: ThreeEvent<MouseEvent>) => {
              e.stopPropagation();
              onSelect!(id);
            }
          : undefined
      }
      onPointerOver={
        interactive
          ? (e: ThreeEvent<PointerEvent>) => {
              e.stopPropagation();
              onHover?.(id);
              document.body.style.cursor = "pointer";
            }
          : undefined
      }
      onPointerOut={
        interactive
          ? () => {
              onHover?.(null);
              document.body.style.cursor = "";
            }
          : undefined
      }
    >
      {children}
    </group>
  );
}

/* ─────────────────────────── Geometry ─────────────────────────── */

const BW = 0.8; // single split-box width (x)
const BD = 1.0; // single split-box depth (z)
const BOX_X = [-1.12, 0, 1.12];
const FLOOR_Y = -0.2;
const FLOOR_T = 0.08;
const WALL_H = 0.3;
const TOP_Y = FLOOR_Y + FLOOR_T + WALL_H; // 0.18
const PAD = 0.2; // terminal offset from box centre

function cablePath(side: 1 | -1) {
  return new THREE.CatmullRomCurve3(
    [
      new THREE.Vector3(side * 1.5, -0.04, 0),
      new THREE.Vector3(side * 1.95, -0.04, 0),
      new THREE.Vector3(side * 2.35, -0.13, 0.12),
      new THREE.Vector3(side * 2.6, -0.32, 0.55),
      new THREE.Vector3(side * 2.7, -0.45, 1.05),
      new THREE.Vector3(side * 2.72, -0.48, 1.35),
    ],
    false,
    "catmullrom",
    0.5,
  );
}

const CONNECTOR_POS = (side: 1 | -1) => new THREE.Vector3(side * 2.72, -0.48, 1.35);

function Cable({ side, m }: { side: 1 | -1; m: ReturnType<typeof useMaterials> }) {
  const geo = useMemo(() => new THREE.TubeGeometry(cablePath(side), 96, 0.066, 20, false), [side]);
  const band = useMemo(() => {
    const curve = cablePath(side);
    const p = curve.getPointAt(0.9);
    const t = curve.getTangentAt(0.9);
    const q = new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 1, 0), t);
    return { p, q };
  }, [side]);
  return (
    <group>
      <mesh geometry={geo} material={m.cable} castShadow />
      {/* gland on the outer wall of the end box */}
      <mesh position={[side * 1.53, -0.04, 0]} rotation={[0, 0, Math.PI / 2]} material={m.housing} castShadow>
        <cylinderGeometry args={[0.13, 0.15, 0.12, 6]} />
      </mesh>
      <mesh position={band.p} quaternion={band.q} material={side === 1 ? m.red : m.blue}>
        <cylinderGeometry args={[0.072, 0.072, 0.06, 24]} />
      </mesh>
    </group>
  );
}

function Connector({ side, m }: { side: 1 | -1; m: ReturnType<typeof useMaterials> }) {
  const male = side === 1;
  return (
    <group position={CONNECTOR_POS(side)}>
      <mesh rotation={[Math.PI / 2, 0, 0]} position={[0, 0, 0.18]} material={m.connector} castShadow>
        <cylinderGeometry args={[0.12, 0.1, 0.36, 28]} />
      </mesh>
      <mesh rotation={[Math.PI / 2, 0, 0]} position={[0, 0, 0.03]} material={m.connector} castShadow>
        <cylinderGeometry args={[0.135, 0.135, 0.12, 6]} />
      </mesh>
      {[-1, 1].map((s) => (
        <mesh key={s} position={[s * 0.115, 0, 0.36]} material={m.connector}>
          <boxGeometry args={[0.04, 0.09, 0.22]} />
        </mesh>
      ))}
      {male ? (
        <mesh rotation={[Math.PI / 2, 0, 0]} position={[0, 0, 0.47]} material={m.tin}>
          <cylinderGeometry args={[0.03, 0.03, 0.18, 16]} />
        </mesh>
      ) : (
        <mesh rotation={[Math.PI / 2, 0, 0]} position={[0, 0, 0.44]} material={m.connector}>
          <cylinderGeometry args={[0.1, 0.12, 0.14, 28]} />
        </mesh>
      )}
      <mesh rotation={[Math.PI / 2, 0, 0]} position={[0, 0, 0.3]} material={male ? m.red : m.blue}>
        <cylinderGeometry args={[0.104, 0.104, 0.03, 28]} />
      </mesh>
    </group>
  );
}

export type JunctionBoxProps = {
  explode: ExplodeRef;
  state?: { current: FocusState };
  onSelect?: (id: PartId) => void;
  onHover?: (id: PartId | null) => void;
  annotations?: ReactNode;
};

export function JunctionBoxModel({ explode, state, onSelect, onHover }: JunctionBoxProps) {
  const m = useMaterials();
  const outer = useMemo(() => roundedRect(BW, BD, 0.12), []);
  const wallShape = useMemo(() => {
    const s = roundedRect(BW, BD, 0.12);
    s.holes.push(holePath(BW - 0.16, BD - 0.16, 0.06));
    return s;
  }, []);
  const gasketShape = useMemo(() => {
    const s = roundedRect(BW - 0.06, BD - 0.06, 0.1);
    s.holes.push(holePath(BW - 0.14, BD - 0.14, 0.06));
    return s;
  }, []);
  const coverShape = useMemo(() => roundedRect(BW + 0.03, BD + 0.03, 0.13), []);
  const flangeShape = useMemo(() => roundedRect(BW + 0.1, BD + 0.1, 0.16), []);
  const floorGeo = useExtruded(outer, FLOOR_T, 0.012);
  const wallGeo = useExtruded(wallShape, WALL_H, 0.01);
  const gasketGeo = useExtruded(gasketShape, 0.028, 0);
  const coverGeo = useExtruded(coverShape, 0.09, 0.025);
  const flangeGeo = useExtruded(flangeShape, 0.022, 0.008);

  const common = { explode, state, onSelect, onHover };

  return (
    <group>
      {/* ── Enclosures (three split boxes) ── */}
      <Part id="enclosure" {...common}>
        {BOX_X.map((x) => (
          <group key={x} position={[x, 0, 0]}>
            <mesh geometry={floorGeo} position={[0, FLOOR_Y, 0]} material={m.housing} castShadow receiveShadow />
            <mesh geometry={wallGeo} position={[0, FLOOR_Y + FLOOR_T, 0]} material={m.housing} castShadow receiveShadow />
            <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, FLOOR_Y + FLOOR_T + 0.002, 0]} material={m.housingInner} receiveShadow>
              <planeGeometry args={[BW - 0.18, BD - 0.18]} />
            </mesh>
            <mesh position={[0, FLOOR_Y + FLOOR_T + 0.004, 0.3]} material={m.epoxy}>
              <boxGeometry args={[0.6, 0.004, 0.07]} />
            </mesh>
            <mesh geometry={flangeGeo} position={[0, FLOOR_Y - 0.01, 0]} material={m.housing} receiveShadow />
          </group>
        ))}
      </Part>

      {/* ── Bus ribbons from the module, two per box ── */}
      <Part id="conductors" {...common}>
        {BOX_X.flatMap((bx) =>
          [-PAD, PAD].map((dx) => (
            <group key={`${bx}${dx}`} position={[bx + dx, 0, 0]}>
              <mesh position={[0, FLOOR_Y - 0.12, 0.3]} material={m.copper} castShadow>
                <boxGeometry args={[0.07, 0.42, 0.012]} />
              </mesh>
              <mesh position={[0, FLOOR_Y + 0.085, 0.25]} material={m.copper}>
                <boxGeometry args={[0.07, 0.012, 0.1]} />
              </mesh>
            </group>
          )),
        )}
      </Part>

      {/* ── Terminals: two per box, plus cable crimps in the end boxes ── */}
      <Part id="terminals" {...common}>
        {BOX_X.map((bx, i) => (
          <group key={bx} position={[bx, 0, 0]}>
            {[-PAD, PAD].map((dx) => (
              <group key={dx}>
                <mesh position={[dx, -0.085, 0]} material={m.tin} castShadow receiveShadow>
                  <boxGeometry args={[0.17, 0.045, 0.66]} />
                </mesh>
                <mesh position={[dx, -0.05, 0.33]} material={m.tin} castShadow>
                  <boxGeometry args={[0.12, 0.03, 0.1]} />
                </mesh>
              </group>
            ))}
            {i !== 1 && (
              <mesh position={[(i === 0 ? -1 : 1) * 0.31, -0.05, 0]} rotation={[0, 0, Math.PI / 2]} material={m.tin} castShadow>
                <cylinderGeometry args={[0.05, 0.05, 0.16, 16]} />
              </mesh>
            )}
          </group>
        ))}
      </Part>

      {/* ── One bypass diode per box ── */}
      <Part id="diodes" {...common}>
        {BOX_X.map((bx) => (
          <group key={bx} position={[bx, -0.015, -0.08]}>
            <mesh material={m.epoxy} castShadow>
              <boxGeometry args={[0.2, 0.09, 0.28]} />
            </mesh>
            <mesh position={[-0.06, 0.046, 0]} material={m.band}>
              <boxGeometry args={[0.025, 0.004, 0.28]} />
            </mesh>
            {[-1, 1].map((s) => (
              <mesh key={s} position={[s * 0.15, -0.04, 0]} material={m.tin} castShadow>
                <boxGeometry args={[0.11, 0.018, 0.15]} />
              </mesh>
            ))}
          </group>
        ))}
      </Part>

      {/* ── Gaskets and potting ── */}
      <Part id="sealing" {...common}>
        {BOX_X.map((bx) => (
          <group key={bx} position={[bx, 0, 0]}>
            <mesh geometry={gasketGeo} position={[0, TOP_Y - 0.01, 0]} material={m.gasket} />
            <mesh position={[0, -0.04, 0]} material={m.potting}>
              <boxGeometry args={[BW - 0.2, 0.16, BD - 0.2]} />
            </mesh>
          </group>
        ))}
      </Part>

      {/* ── Covers ── */}
      <Part id="cover" {...common}>
        {BOX_X.map((bx, i) => (
          <group key={bx} position={[bx, TOP_Y + 0.02, 0]}>
            <mesh geometry={coverGeo} material={m.cover} castShadow receiveShadow />
            {[-0.12, 0, 0.12].map((z) => (
              <mesh key={z} position={[0, 0.125, z - 0.18]} material={m.cover} castShadow>
                <boxGeometry args={[0.46, 0.022, 0.045]} />
              </mesh>
            ))}
            <mesh position={[0, 0.12, 0.3]} material={m.accent}>
              <boxGeometry args={[0.3, 0.012, 0.028]} />
            </mesh>
            {i === 2 && (
              <group position={[0.24, 0.125, 0.12]}>
                <mesh material={m.band}>
                  <boxGeometry args={[0.1, 0.01, 0.022]} />
                </mesh>
                <mesh material={m.band}>
                  <boxGeometry args={[0.022, 0.01, 0.1]} />
                </mesh>
              </group>
            )}
            {i === 0 && (
              <mesh position={[-0.24, 0.125, 0.12]} material={m.band}>
                <boxGeometry args={[0.1, 0.01, 0.022]} />
              </mesh>
            )}
          </group>
        ))}
      </Part>

      {/* ── Cables & connectors on the end boxes ── */}
      <Part id="cablePos" side={1} {...common}>
        <Cable side={1} m={m} />
      </Part>
      <Part id="cableNeg" side={-1} {...common}>
        <Cable side={-1} m={m} />
      </Part>
      <Part id="connectors" {...common}>
        <group>
          <ConnectorSide side={1} m={m} explode={explode} />
          <ConnectorSide side={-1} m={m} explode={explode} />
        </group>
      </Part>
    </group>
  );
}

/** Connectors explode outward per side; the shared Part handles the z offset. */
function ConnectorSide({ side, m, explode }: { side: 1 | -1; m: ReturnType<typeof useMaterials>; explode: ExplodeRef }) {
  const ref = useRef<THREE.Group>(null);
  useFrame(() => {
    if (ref.current) ref.current.position.x = side * PART_MAP.connectors.explode[0] * explode.current;
  });
  return (
    <group ref={ref}>
      <Connector side={side} m={m} />
    </group>
  );
}

/** World-space anchor points for annotations, at a given explode amount. */
export function anchorFor(id: PartId, e: number): [number, number, number] {
  const o = PART_MAP[id].explode;
  const base: Record<PartId, [number, number, number]> = {
    enclosure: [1.5, -0.1, 0.5],
    cover: [-1.12, TOP_Y + 0.15, 0.25],
    terminals: [1.32, -0.06, 0.3],
    diodes: [-1.12, 0.04, -0.08],
    cablePos: [2.4, -0.15, 0.2],
    cableNeg: [-2.4, -0.15, 0.2],
    connectors: [2.72, -0.38, 1.6],
    conductors: [-1.32, FLOOR_Y - 0.3, 0.3],
    sealing: [-1.5, TOP_Y + 0.02, 0.45],
  };
  const b = base[id];
  const side = id === "cableNeg" ? -1 : 1;
  return [b[0] + o[0] * side * e, b[1] + o[1] * e, b[2] + o[2] * e];
}
