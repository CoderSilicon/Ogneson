"use client";

import { useMemo, useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import * as THREE from "three";

type Subshell = "s" | "p" | "d" | "f";

interface SubshellToken {
  n: number;
  l: number; // 0=s, 1=p, 2=d, 3=f
  count: number;
}

const L_MAP: Record<string, number> = { s: 0, p: 1, d: 2, f: 3 };
const MAX_ELECTRONS: Record<Subshell, number> = { s: 2, p: 6, d: 10, f: 14 };


const GRADIENTS: Record<Subshell, [string, string, string]> = {
  s: ["#f0feff", "#22d3ee", "#1e3a8a"], // cyan -> blue
  p: ["#fff7e6", "#fb923c", "#7c2d12"], // amber -> ember
  d: ["#fdf4ff", "#d946ef", "#581c87"], // pink -> violet
  f: ["#ecfdf5", "#10b981", "#134e4a"], // mint -> teal
};
const NUCLEUS_COLOR = "#ff5a36";


function parseConfig(config: string): SubshellToken[] {
  return config
    .replace(/\[[A-Za-z]+\]/g, "")
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .map((token) => {
      const match = token.match(/^(\d+)([spdf])(\d+)$/i);
      if (!match) return null;
      const [, n, l, count] = match;
      return {
        n: parseInt(n, 10),
        l: L_MAP[l.toLowerCase()],
        count: parseInt(count, 10),
      };
    })
    .filter((t): t is SubshellToken => t !== null);
}


function getCharacteristicSubshell(
  config: string,
  category = "",
): { subshell: Subshell; maxN: number } {
  const tokens = parseConfig(config);
  const maxN = tokens.length ? Math.max(...tokens.map((t) => t.n)) : 1;


  const categoryBlock: Partial<Record<string, Subshell>> = {
    Alkali: "s",
    "Alkaline Earth": "s",
    Transition: "d",
    Lanthanide: "f",
    Actinide: "f",
  };
  if (categoryBlock[category]) {
    return { subshell: categoryBlock[category]!, maxN };
  }


  if (maxN >= 2) {
    const dToken = tokens.find(
      (t) => t.n === maxN - 1 && t.l === 2 && t.count >= 1 && t.count <= 9,
    );
    if (dToken) {
      return { subshell: "d", maxN };
    }
  }

  if (maxN >= 3) {
    const fToken = tokens.find(
      (t) => t.n === maxN - 2 && t.l === 3 && t.count >= 1 && t.count <= 13,
    );
    if (fToken) {
      return { subshell: "f", maxN };
    }

    const fFull = tokens.find(
      (t) => t.n === maxN - 2 && t.l === 3 && t.count >= 14,
    );
    if (fFull) {
      const outer = tokens.filter((t) => t.n === maxN && t.count > 0);
      const hasP = outer.some((t) => t.l === 1);
      if (!hasP) {
        return { subshell: "f", maxN };
      }
    }
  }


  if (tokens.length === 0) return { subshell: "s", maxN };
  const outer = tokens.filter((t) => t.n === maxN && t.count > 0);
  if (outer.length === 0) return { subshell: "s", maxN };
  const best = outer.reduce((a, b) => (b.l > a.l ? b : a));
  return { subshell: (["s", "p", "d", "f"] as const)[best.l], maxN };
}

// ---------- particle-cloud sampling helpers ----------

function gaussian(): number {
  let u = 0;
  let v = 0;
  while (u === 0) u = Math.random();
  while (v === 0) v = Math.random();
  return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v);
}

function randomUnitVector(): THREE.Vector3 {
  const z = Math.random() * 2 - 1;
  const theta = Math.random() * Math.PI * 2;
  const r = Math.sqrt(1 - z * z);
  return new THREE.Vector3(r * Math.cos(theta), r * Math.sin(theta), z);
}

function gradientColor(
  stops: [string, string, string],
  t: number,
): THREE.Color {
  const clamped = Math.min(1, Math.max(0, t));
  const [c0, c1, c2] = stops;
  const a = new THREE.Color(clamped < 0.5 ? c0 : c1);
  const b = new THREE.Color(clamped < 0.5 ? c1 : c2);
  const localT = clamped < 0.5 ? clamped * 2 : (clamped - 0.5) * 2;
  return a.clone().lerp(b, localT);
}

/** Writes `count` gaussian-distributed points centered at `center` into positions/colors starting at `offset`. */
function writeGaussianCluster(
  positions: Float32Array,
  colors: Float32Array,
  offset: number,
  count: number,
  center: THREE.Vector3,
  std: THREE.Vector3,
  stops: [string, string, string],
) {
  const maxStd = Math.max(std.x, std.y, std.z);
  for (let i = 0; i < count; i++) {
    const dx = gaussian() * std.x;
    const dy = gaussian() * std.y;
    const dz = gaussian() * std.z;
    const idx = offset + i;
    positions[idx * 3] = center.x + dx;
    positions[idx * 3 + 1] = center.y + dy;
    positions[idx * 3 + 2] = center.z + dz;
    const dist = Math.sqrt(dx * dx + dy * dy + dz * dz);
    const c = gradientColor(stops, dist / (maxStd * 2.2));
    colors[idx * 3] = c.r;
    colors[idx * 3 + 1] = c.g;
    colors[idx * 3 + 2] = c.b;
  }
}

/** Writes `count` points scattered around a torus ring (radius, tube jitter, then rotated). */
function writeRingCluster(
  positions: Float32Array,
  colors: Float32Array,
  offset: number,
  count: number,
  radius: number,
  tubeStd: number,
  rotation: THREE.Euler,
  stops: [string, string, string],
) {
  const m = new THREE.Matrix4().makeRotationFromEuler(rotation);
  for (let i = 0; i < count; i++) {
    const theta = Math.random() * Math.PI * 2;
    const jr = gaussian() * tubeStd;
    const jz = gaussian() * tubeStd;
    const local = new THREE.Vector3(
      Math.cos(theta) * (radius + jr),
      Math.sin(theta) * (radius + jr),
      jz,
    );
    local.applyMatrix4(m);
    const idx = offset + i;
    positions[idx * 3] = local.x;
    positions[idx * 3 + 1] = local.y;
    positions[idx * 3 + 2] = local.z;
    const c = gradientColor(
      stops,
      Math.sqrt(jr * jr + jz * jz) / (tubeStd * 2.2),
    );
    colors[idx * 3] = c.r;
    colors[idx * 3 + 1] = c.g;
    colors[idx * 3 + 2] = c.b;
  }
}

function generateSPoints(): { positions: Float32Array; colors: Float32Array } {
  const count = 6000;
  const positions = new Float32Array(count * 3);
  const colors = new Float32Array(count * 3);
  const stops = GRADIENTS.s;
  const std = 0.55;
  for (let i = 0; i < count; i++) {
    const r = Math.abs(gaussian()) * std;
    const p = randomUnitVector().multiplyScalar(r);
    positions[i * 3] = p.x;
    positions[i * 3 + 1] = p.y;
    positions[i * 3 + 2] = p.z;
    const c = gradientColor(stops, r / (std * 2.2));
    colors[i * 3] = c.r;
    colors[i * 3 + 1] = c.g;
    colors[i * 3 + 2] = c.b;
  }
  return { positions, colors };
}

function generatePPoints(): { positions: Float32Array; colors: Float32Array } {
  const perLobe = 700;
  const total = perLobe * 6;
  const positions = new Float32Array(total * 3);
  const colors = new Float32Array(total * 3);
  const stops = GRADIENTS.p;
  const axes: [number, number, number][] = [
    [1, 0, 0],
    [0, 1, 0],
    [0, 0, 1],
  ];
  let offset = 0;
  axes.forEach((axis) => {
    [1, -1].forEach((sign) => {
      const center = new THREE.Vector3(
        axis[0] * sign,
        axis[1] * sign,
        axis[2] * sign,
      ).multiplyScalar(0.9);
      const std = new THREE.Vector3(
        axis[0] ? 0.4 : 0.22,
        axis[1] ? 0.4 : 0.22,
        axis[2] ? 0.4 : 0.22,
      );
      writeGaussianCluster(
        positions,
        colors,
        offset,
        perLobe,
        center,
        std,
        stops,
      );
      offset += perLobe;
    });
  });
  return { positions, colors };
}

function generateDPoints(): { positions: Float32Array; colors: Float32Array } {
  const perLobe = 900;
  const ringCount = 1800;
  const total = perLobe * 4 + ringCount;
  const positions = new Float32Array(total * 3);
  const colors = new Float32Array(total * 3);
  const stops = GRADIENTS.d;
  const lobes: { center: THREE.Vector3; std: THREE.Vector3 }[] = [
    {
      center: new THREE.Vector3(0.85, 0, 0),
      std: new THREE.Vector3(0.38, 0.2, 0.2),
    },
    {
      center: new THREE.Vector3(-0.85, 0, 0),
      std: new THREE.Vector3(0.38, 0.2, 0.2),
    },
    {
      center: new THREE.Vector3(0, 0.85, 0),
      std: new THREE.Vector3(0.2, 0.38, 0.2),
    },
    {
      center: new THREE.Vector3(0, -0.85, 0),
      std: new THREE.Vector3(0.2, 0.38, 0.2),
    },
  ];
  let offset = 0;
  lobes.forEach((lobe) => {
    writeGaussianCluster(
      positions,
      colors,
      offset,
      perLobe,
      lobe.center,
      lobe.std,
      stops,
    );
    offset += perLobe;
  });
  writeRingCluster(
    positions,
    colors,
    offset,
    ringCount,
    0.85,
    0.08,
    new THREE.Euler(Math.PI / 2, 0, Math.PI / 4),
    stops,
  );
  return { positions, colors };
}

function generateFPoints(): { positions: Float32Array; colors: Float32Array } {
  const perLobe = 500;
  const ringCount = 900;
  const total = perLobe * 8 + ringCount * 2;
  const positions = new Float32Array(total * 3);
  const colors = new Float32Array(total * 3);
  const stops = GRADIENTS.f;
  const corners: [number, number, number][] = [
    [1, 1, 1],
    [1, 1, -1],
    [1, -1, 1],
    [1, -1, -1],
    [-1, 1, 1],
    [-1, 1, -1],
    [-1, -1, 1],
    [-1, -1, -1],
  ];
  let offset = 0;
  corners.forEach((c) => {
    const len = Math.sqrt(c[0] ** 2 + c[1] ** 2 + c[2] ** 2);
    const center = new THREE.Vector3(
      (c[0] / len) * 0.85,
      (c[1] / len) * 0.85,
      (c[2] / len) * 0.85,
    );
    const std = new THREE.Vector3(0.26, 0.26, 0.26);
    writeGaussianCluster(
      positions,
      colors,
      offset,
      perLobe,
      center,
      std,
      stops,
    );
    offset += perLobe;
  });
  writeRingCluster(
    positions,
    colors,
    offset,
    ringCount,
    0.7,
    0.1,
    new THREE.Euler(Math.PI / 3, 0, 0),
    stops,
  );
  offset += ringCount;
  writeRingCluster(
    positions,
    colors,
    offset,
    ringCount,
    0.7,
    0.1,
    new THREE.Euler(-Math.PI / 3, 0, Math.PI / 2),
    stops,
  );
  return { positions, colors };
}

const GENERATORS: Record<
  Subshell,
  () => { positions: Float32Array; colors: Float32Array }
> = {
  s: generateSPoints,
  p: generatePPoints,
  d: generateDPoints,
  f: generateFPoints,
};

export function Orbital3D({
  config,
  category,
}: {
  bgClass?: string;
  config: string;
  category?: string;
}) {
  const { subshell, maxN } = useMemo(
    () => getCharacteristicSubshell(config, category),
    [config, category],
  );
  const scale = Math.min(1.4, Math.max(0.8, 0.75 + maxN * 0.06));

  return (
    <div className="w-full h-64 md:h-80 relative cursor-grab active:cursor-grabbing">
      <Canvas camera={{ position: [0, 0, 5], fov: 45 }}>
        <ambientLight intensity={0.4} />
        <pointLight position={[10, 10, 10]} intensity={0.8} />

        <OrbitalCloud subshell={subshell} scale={scale} />

        <OrbitControls enableZoom={false} autoRotate autoRotateSpeed={1.5} />
      </Canvas>
    </div>
  );
}

function OrbitalCloud({
  subshell,
  scale,
}: {
  subshell: Subshell;
  scale: number;
}) {
  const groupRef = useRef<THREE.Group>(null);

  useFrame((_, delta) => {
    if (groupRef.current) {
      groupRef.current.rotation.y += delta * 0.3;
    }
  });

  const { positions, colors } = useMemo(
    () => GENERATORS[subshell](),
    [subshell],
  );

  return (
    <group ref={groupRef} scale={scale}>
      {/* Nucleus */}
      <mesh>
        <sphereGeometry args={[0.12, 16, 16]} />
        <meshBasicMaterial color={NUCLEUS_COLOR} />
      </mesh>

      <points>
        <bufferGeometry>
          <bufferAttribute
            attach="attributes-position"
            args={[positions, 3]}
            count={positions.length / 3}
            array={positions}
            itemSize={3}
          />
          <bufferAttribute
            attach="attributes-color"
            args={[colors, 3]}
            count={colors.length / 3}
            array={colors}
            itemSize={3}
          />
        </bufferGeometry>
        <pointsMaterial
          size={0.045}
          vertexColors
          transparent
          opacity={0.85}
          sizeAttenuation
          depthWrite={false}
          blending={THREE.AdditiveBlending}
        />
      </points>
    </group>
  );
}
