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

// Each split box is a long, slim housing (x = length along the module edge).
const BW = 1.25; // housing length (x)
const BD = 0.52; // housing width (z)
const BR = 0.17; // corner radius
const BOX_X = [-1.85, 0, 1.85];
const FLOOR_Y = -0.2;
const FLOOR_T = 0.07;
const WALL_H = 0.22;
const TOP_Y = FLOOR_Y + FLOOR_T + WALL_H; // 0.09
const PAD = 0.25; // terminal clamp offset from box centre (x)
const END_X = BOX_X[2] + BW / 2; // outer end of the end boxes

/** Cover outline: rounded rectangle with a shallow step near each end. */
function steppedRect(w: number, d: number, r: number, stepLen: number, stepDepth: number) {
  const s = new THREE.Shape();
  const x0 = -w / 2;
  const x1 = w / 2;
  const z0 = -d / 2;
  const z1 = d / 2;
  const zi0 = z0 + stepDepth;
  const zi1 = z1 - stepDepth;
  const xa = x0 + stepLen;
  const xb = x1 - stepLen;
  s.moveTo(xa, z0);
  s.lineTo(xb, z0);
  s.lineTo(xb, zi0);
  s.lineTo(x1 - r, zi0);
  s.quadraticCurveTo(x1, zi0, x1, zi0 + r);
  s.lineTo(x1, zi1 - r);
  s.quadraticCurveTo(x1, zi1, x1 - r, zi1);
  s.lineTo(xb, zi1);
  s.lineTo(xb, z1);
  s.lineTo(xa, z1);
  s.lineTo(xa, zi1);
  s.lineTo(x0 + r, zi1);
  s.quadraticCurveTo(x0, zi1, x0, zi1 - r);
  s.lineTo(x0, zi0 + r);
  s.quadraticCurveTo(x0, zi0, x0 + r, zi0);
  s.lineTo(xa, zi0);
  s.lineTo(xa, z0);
  return s;
}

function cablePath(side: 1 | -1) {
  return new THREE.CatmullRomCurve3(
    [
      new THREE.Vector3(side * (END_X + 0.06), -0.08, 0),
      new THREE.Vector3(side * (END_X + 0.45), -0.08, 0),
      new THREE.Vector3(side * (END_X + 0.72), -0.2, 0.28),
      new THREE.Vector3(side * (END_X + 0.72), -0.4, 0.82),
      new THREE.Vector3(side * (END_X + 0.6), -0.48, 1.25),
      new THREE.Vector3(side * (END_X + 0.6), -0.48, 1.45),
    ],
    false,
    "catmullrom",
    0.5,
  );
}

const CONNECTOR_POS = (side: 1 | -1) => new THREE.Vector3(side * (END_X + 0.6), -0.48, 1.45);

function Cable({ side, m }: { side: 1 | -1; m: ReturnType<typeof useMaterials> }) {
  const geo = useMemo(() => new THREE.TubeGeometry(cablePath(side), 96, 0.062, 20, false), [side]);
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
      {/* gland on the outer end of the end box */}
      <mesh position={[side * (END_X + 0.05), -0.08, 0]} rotation={[0, 0, Math.PI / 2]} material={m.housing} castShadow>
        <cylinderGeometry args={[0.11, 0.12, 0.12, 20]} />
      </mesh>
      <mesh position={band.p} quaternion={band.q} material={side === 1 ? m.red : m.blue}>
        <cylinderGeometry args={[0.068, 0.068, 0.06, 24]} />
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
  const outer = useMemo(() => roundedRect(BW, BD, BR), []);
  const wallShape = useMemo(() => {
    const s = roundedRect(BW, BD, BR);
    s.holes.push(holePath(BW - 0.12, BD - 0.12, BR - 0.05));
    return s;
  }, []);
  const gasketShape = useMemo(() => {
    const s = roundedRect(BW - 0.05, BD - 0.05, BR - 0.02);
    s.holes.push(holePath(BW - 0.11, BD - 0.11, BR - 0.05));
    return s;
  }, []);
  const coverShape = useMemo(() => steppedRect(BW + 0.02, BD + 0.04, BR, 0.2, 0.035), []);
  const flangeShape = useMemo(() => roundedRect(BW + 0.06, BD + 0.06, BR + 0.02), []);
  const tabShape = useMemo(() => roundedRect(0.16, 0.24, 0.07), []);
  const floorGeo = useExtruded(outer, FLOOR_T, 0.012);
  const wallGeo = useExtruded(wallShape, WALL_H, 0.01);
  const gasketGeo = useExtruded(gasketShape, 0.024, 0);
  const coverGeo = useExtruded(coverShape, 0.075, 0.02);
  const flangeGeo = useExtruded(flangeShape, 0.02, 0.006);
  const tabGeo = useExtruded(tabShape, 0.045, 0.008);

  const common = { explode, state, onSelect, onHover };

  return (
    <group>
      {/* ── Enclosures: three slim split housings with end tabs ── */}
      <Part id="enclosure" {...common}>
        {BOX_X.map((x) => (
          <group key={x} position={[x, 0, 0]}>
            <mesh geometry={floorGeo} position={[0, FLOOR_Y, 0]} material={m.housing} castShadow receiveShadow />
            <mesh geometry={wallGeo} position={[0, FLOOR_Y + FLOOR_T, 0]} material={m.housing} castShadow receiveShadow />
            <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, FLOOR_Y + FLOOR_T + 0.002, 0]} material={m.housingInner} receiveShadow>
              <planeGeometry args={[BW - 0.14, BD - 0.14]} />
            </mesh>
            <mesh geometry={flangeGeo} position={[0, FLOOR_Y - 0.01, 0]} material={m.housing} receiveShadow />
            {[-1, 1].map((sx) => (
              <mesh key={sx} geometry={tabGeo} position={[sx * (BW / 2 + 0.05), FLOOR_Y - 0.01, 0]} material={m.housing} castShadow />
            ))}
          </group>
        ))}
      </Part>

      {/* ── Bus ribbons from the module, two per box ── */}
      <Part id="conductors" {...common}>
        {BOX_X.flatMap((bx) =>
          [-PAD, PAD].map((dx) => (
            <group key={`${bx}${dx}`} position={[bx + dx, 0, 0]}>
              <mesh position={[0, FLOOR_Y - 0.12, 0.08]} material={m.copper} castShadow>
                <boxGeometry args={[0.07, 0.4, 0.012]} />
              </mesh>
              <mesh position={[0, FLOOR_Y + 0.08, 0.04]} material={m.copper}>
                <boxGeometry args={[0.07, 0.012, 0.09]} />
              </mesh>
            </group>
          )),
        )}
      </Part>

      {/* ── Terminal clamps: two per box, either side of the diode ── */}
      <Part id="terminals" {...common}>
        {BOX_X.map((bx, i) => (
          <group key={bx} position={[bx, 0, 0]}>
            {[-PAD, PAD].map((dx) => (
              <group key={dx} position={[dx, 0, 0]}>
                <mesh position={[0, -0.1, 0]} material={m.tin} castShadow receiveShadow>
                  <boxGeometry args={[0.22, 0.04, 0.3]} />
                </mesh>
                {/* spring clamp */}
                <mesh position={[0, -0.04, 0]} rotation={[0, 0, Math.PI / 2]} material={m.tin} castShadow>
                  <torusGeometry args={[0.06, 0.016, 10, 24]} />
                </mesh>
                <mesh position={[0, -0.05, 0]} material={m.tin}>
                  <boxGeometry args={[0.16, 0.05, 0.2]} />
                </mesh>
              </group>
            ))}
            {i !== 1 && (
              <mesh position={[(i === 0 ? -1 : 1) * (BW / 2 - 0.12), -0.07, 0]} rotation={[0, 0, Math.PI / 2]} material={m.tin} castShadow>
                <cylinderGeometry args={[0.045, 0.045, 0.16, 16]} />
              </mesh>
            )}
          </group>
        ))}
      </Part>

      {/* ── One bypass diode per box, bridging the two clamps ── */}
      <Part id="diodes" {...common}>
        {BOX_X.map((bx) => (
          <group key={bx} position={[bx, -0.045, 0]}>
            <mesh material={m.epoxy} castShadow>
              <boxGeometry args={[0.2, 0.09, 0.3]} />
            </mesh>
            <mesh position={[-0.07, 0.046, 0]} material={m.band}>
              <boxGeometry args={[0.022, 0.004, 0.3]} />
            </mesh>
            {[-1, 1].map((s) => (
              <mesh key={s} position={[s * 0.13, -0.03, 0]} material={m.tin} castShadow>
                <boxGeometry args={[0.08, 0.016, 0.16]} />
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
            <mesh position={[0, -0.07, 0]} material={m.potting}>
              <boxGeometry args={[BW - 0.16, 0.12, BD - 0.16]} />
            </mesh>
          </group>
        ))}
      </Part>

      {/* ── Covers: stepped outline, label panel and polarity marks ── */}
      <Part id="cover" {...common}>
        {BOX_X.map((bx, i) => (
          <group key={bx} position={[bx, TOP_Y + 0.02, 0]}>
            <mesh geometry={coverGeo} material={m.cover} castShadow receiveShadow />
            <mesh position={[-0.12, 0.098, 0]} material={m.cover} castShadow>
              <boxGeometry args={[0.5, 0.012, 0.26]} />
            </mesh>
            <mesh position={[-0.12, 0.106, 0.06]} material={m.band}>
              <boxGeometry args={[0.34, 0.004, 0.035]} />
            </mesh>
            <mesh position={[0.32, 0.1, -0.08]} material={m.accent}>
              <boxGeometry args={[0.2, 0.01, 0.024]} />
            </mesh>
            {i === 2 && (
              <group position={[0.36, 0.1, 0.08]}>
                <mesh material={m.band}>
                  <boxGeometry args={[0.08, 0.008, 0.018]} />
                </mesh>
                <mesh material={m.band}>
                  <boxGeometry args={[0.018, 0.008, 0.08]} />
                </mesh>
              </group>
            )}
            {i === 0 && (
              <mesh position={[0.36, 0.1, 0.08]} material={m.band}>
                <boxGeometry args={[0.08, 0.008, 0.018]} />
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
    enclosure: [1.85 + BW / 2, -0.12, 0.2],
    cover: [-1.85, TOP_Y + 0.12, 0.1],
    terminals: [1.85 + PAD, -0.05, 0.12],
    diodes: [-1.85, 0.0, 0],
    cablePos: [END_X + 0.72, -0.3, 0.55],
    cableNeg: [-(END_X + 0.72), -0.3, 0.55],
    connectors: [END_X + 0.6, -0.38, 1.75],
    conductors: [-1.85 - PAD, FLOOR_Y - 0.3, 0.08],
    sealing: [-1.85 - BW / 2, TOP_Y, 0.15],
  };
  const b = base[id];
  const side = id === "cableNeg" ? -1 : 1;
  return [b[0] + o[0] * side * e, b[1] + o[1] * e, b[2] + o[2] * e];
}
