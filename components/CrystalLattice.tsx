"use client";

import { useMemo, useState } from "react";
import { Canvas } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import * as THREE from "three";
import type { LatticeParameters } from "@/data/elementData";

const ATOM_COLOR = "#60a5fa";
const ATOM_COLOR_B = "#818cf8";
const EDGE_COLOR = "#334155";

function latticeBasis(type: LatticeParameters["type"]): [number, number, number][] {
  switch (type) {
    case "fcc":
      return [
        [0, 0, 0],
        [0.5, 0.5, 0],
        [0.5, 0, 0.5],
        [0, 0.5, 0.5],
      ];
    case "bcc":
      return [
        [0, 0, 0],
        [0.5, 0.5, 0.5],
      ];
    case "hcp":
      return [
        [0, 0, 0],
        [2 / 3, 1 / 3, 0.5],
      ];
    case "dhcp":
      return [
        [0, 0, 0],
        [2 / 3, 1 / 3, 0.25],
        [1 / 3, 2 / 3, 0.75],
      ];
    case "diamond":
      return [
        [0, 0, 0],
        [0.5, 0.5, 0],
        [0.5, 0, 0.5],
        [0, 0.5, 0.5],
        [0.25, 0.25, 0.25],
        [0.75, 0.75, 0.25],
        [0.75, 0.25, 0.75],
        [0.25, 0.75, 0.75],
      ];
    case "simple-cubic":
      return [[0, 0, 0]];
    case "rhombohedral":
      return [
        [0, 0, 0],
        [0.5, 0.5, 0.5],
      ];
    case "orthorhombic":
      return [
        [0, 0, 0],
        [0.5, 0.5, 0],
        [0.5, 0, 0.5],
        [0, 0.5, 0.5],
      ];
    case "tetragonal":
      return [
        [0, 0, 0],
        [0.5, 0.5, 0.5],
      ];
    case "monoclinic":
      return [
        [0, 0, 0],
        [0.5, 0.5, 0],
        [0.5, 0, 0.5],
        [0, 0.5, 0.5],
      ];
    case "graphite":
      return [
        [0, 0, 0],
        [1 / 3, 2 / 3, 0],
        [0, 0, 0.5],
        [2 / 3, 1 / 3, 0.5],
      ];
    default:
      return [[0, 0, 0]];
  }
}

function latticeVectors(p: LatticeParameters): THREE.Vector3[] {
  const a = 2;
  const b = a * (p.b / p.a || 1);
  const c = a * (p.c / p.a || 1);
  const alphaRad = (p.alpha * Math.PI) / 180;
  const betaRad = (p.beta * Math.PI) / 180;
  const gammaRad = (p.gamma * Math.PI) / 180;

  const va = new THREE.Vector3(a, 0, 0);
  const vb = new THREE.Vector3(
    b * Math.cos(gammaRad),
    b * Math.sin(gammaRad),
    0,
  );
  const cx = c * Math.cos(betaRad);
  const cy =
    (c * Math.cos(alphaRad) - c * Math.cos(betaRad) * Math.cos(gammaRad)) /
    Math.sin(gammaRad);
  const cz = Math.sqrt(
    Math.max(0, c * c - cx * cx - cy * cy),
  );
  const vc = new THREE.Vector3(cx, cy, cz);

  return [va, vb, vc];
}

function UnitCellWireframe({
  vectors,
  color,
}: {
  vectors: THREE.Vector3[];
  color: string;
}) {
  const [va, vb, vc] = vectors;
  const o = new THREE.Vector3(0, 0, 0);
  const corners = [
    o,
    va.clone(),
    vb.clone(),
    va.clone().add(vb),
    vc.clone(),
    va.clone().add(vc),
    vb.clone().add(vc),
    va.clone().add(vb).add(vc),
  ];

  const edges: [number, number][] = [
    [0, 1], [0, 2], [0, 4],
    [1, 3], [1, 5],
    [2, 3], [2, 6],
    [3, 7],
    [4, 5], [4, 6],
    [5, 7],
    [6, 7],
  ];

  const lineGeo = useMemo(() => {
    const pts: number[] = [];
    edges.forEach(([a, b]) => {
      pts.push(corners[a].x, corners[a].y, corners[a].z);
      pts.push(corners[b].x, corners[b].y, corners[b].z);
    });
    const geo = new THREE.BufferGeometry();
    geo.setAttribute(
      "position",
      new THREE.Float32BufferAttribute(pts, 3),
    );
    return geo;
  }, []);

  return (
    <lineSegments geometry={lineGeo}>
      <lineBasicMaterial
        color={color}
        transparent
        opacity={0.35}
        linewidth={1}
      />
    </lineSegments>
  );
}

function LatticeAtoms({
  params,
  showCell,
  radius,
}: {
  params: LatticeParameters;
  showCell: boolean;
  radius: number;
}) {
  const atoms = useMemo(() => {
    const basis = latticeBasis(params.type);
    const vectors = latticeVectors(params);
    const [va, vb, vc] = vectors;
    const allAtoms: { pos: THREE.Vector3; corner: boolean }[] = [];

    const offsets = showCell
      ? [
          [0, 0, 0],
          [1, 0, 0],
          [-1, 0, 0],
          [0, 1, 0],
          [0, -1, 0],
          [0, 0, 1],
          [0, 0, -1],
          [1, 1, 0],
          [1, -1, 0],
          [-1, 1, 0],
          [-1, -1, 0],
          [1, 0, 1],
          [1, 0, -1],
          [-1, 0, 1],
          [-1, 0, -1],
          [0, 1, 1],
          [0, 1, -1],
          [0, -1, 1],
          [0, -1, -1],
          [1, 1, 1],
          [1, 1, -1],
          [1, -1, 1],
          [-1, 1, 1],
          [1, -1, -1],
          [-1, 1, -1],
          [-1, -1, 1],
          [-1, -1, -1],
        ]
      : [[0, 0, 0]];

    const seen = new Set<string>();

    offsets.forEach(([oi, oj, ok]) => {
      basis.forEach(([bi, bj, bk]) => {
        const i = bi + oi;
        const j = bj + oj;
        const k = bk + ok;
        const key = `${i.toFixed(3)}_${j.toFixed(3)}_${k.toFixed(3)}`;
        if (seen.has(key)) return;
        seen.add(key);
        const pos = va
          .clone()
          .multiplyScalar(i)
          .add(vb.clone().multiplyScalar(j))
          .add(vc.clone().multiplyScalar(k));
        const center = va
          .clone()
          .multiplyScalar(0.5)
          .add(vb.clone().multiplyScalar(0.5))
          .add(vc.clone().multiplyScalar(0.5));
        const distFromCenter = pos.distanceTo(center);
        const inCell =
          i >= -0.01 &&
          i <= 1.01 &&
          j >= -0.01 &&
          j <= 1.01 &&
          k >= -0.01 &&
          k <= 1.01;
        allAtoms.push({ pos, corner: !inCell || distFromCenter < 0.01 });
      });
    });

    return allAtoms;
  }, [params, showCell]);

  return (
    <>
      {atoms.map((atom, i) => (
        <mesh key={i} position={atom.pos}>
          <sphereGeometry args={[radius, 24, 24]} />
          <meshStandardMaterial
            color={atom.corner ? ATOM_COLOR : ATOM_COLOR_B}
            metalness={0.4}
            roughness={0.3}
            emissive={atom.corner ? ATOM_COLOR : ATOM_COLOR_B}
            emissiveIntensity={0.15}
          />
        </mesh>
      ))}
    </>
  );
}

export function CrystalLatticeViewer({
  params,
  textClass,
}: {
  params: LatticeParameters;
  textClass: string;
}) {
  const [showCell, setShowCell] = useState(true);
  const vectors = useMemo(() => latticeVectors(params), [params]);

  return (
    <div className="flex flex-col gap-3 sm:gap-4 w-full">
      <div className="w-full h-56 sm:h-72 md:h-80 relative cursor-grab active:cursor-grabbing border border-zinc-900 bg-zinc-950/60">
        <Canvas camera={{ position: [4, 3, 4], fov: 40 }}>
          <ambientLight intensity={0.5} />
          <pointLight position={[10, 10, 10]} intensity={0.7} />
          <pointLight position={[-10, -5, -10]} intensity={0.3} />

          <LatticeAtoms params={params} showCell={showCell} radius={0.22} />
          {showCell && (
            <UnitCellWireframe vectors={vectors} color={EDGE_COLOR} />
          )}

          <OrbitControls
            enableZoom={true}
            autoRotate
            autoRotateSpeed={1.2}
            minDistance={2}
            maxDistance={15}
          />
        </Canvas>

        <button
          onClick={() => setShowCell((p) => !p)}
          className="absolute top-2 right-2 sm:top-3 sm:right-3 px-2 sm:px-3 py-1 sm:py-1.5 bg-zinc-800/80 backdrop-blur-sm border border-zinc-700 text-zinc-300 text-[9px] sm:text-[10px] font-mono uppercase tracking-wider hover:bg-zinc-700/80 transition-colors z-10"
        >
          {showCell ? "Hide" : "Show"} Unit Cell
        </button>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 gap-2 sm:gap-3">
        <div className="flex flex-col gap-0.5 sm:gap-1 p-2 sm:p-3 border border-zinc-900 bg-zinc-950/40">
          <span className="text-[8px] sm:text-[9px] uppercase tracking-wider font-mono text-zinc-500">
            Structure
          </span>
          <span className={`text-xs sm:text-sm font-mono font-bold ${textClass} truncate`}>
            {params.label}
          </span>
        </div>
        <div className="flex flex-col gap-0.5 sm:gap-1 p-2 sm:p-3 border border-zinc-900 bg-zinc-950/40">
          <span className="text-[8px] sm:text-[9px] uppercase tracking-wider font-mono text-zinc-500">
            Lattice Constants
          </span>
          <span className="text-[11px] sm:text-sm font-mono text-zinc-200 truncate">
            a={params.a.toFixed(2)}
            {params.type !== "fcc" && params.type !== "bcc" && params.type !== "diamond" && params.type !== "simple-cubic"
              ? ` b=${params.b.toFixed(2)} c=${params.c.toFixed(2)}`
              : ""}
          </span>
        </div>
        <div className="flex flex-col gap-0.5 sm:gap-1 p-2 sm:p-3 border border-zinc-900 bg-zinc-950/40">
          <span className="text-[8px] sm:text-[9px] uppercase tracking-wider font-mono text-zinc-500">
            Angles
          </span>
          <span className="text-[11px] sm:text-sm font-mono text-zinc-200 truncate">
            {params.alpha === params.beta && params.beta === params.gamma
              ? `α=β=γ=${params.alpha}°`
              : `α=${params.alpha}° β=${params.beta}° γ=${params.gamma}°`}
          </span>
        </div>
        <div className="flex flex-col gap-0.5 sm:gap-1 p-2 sm:p-3 border border-zinc-900 bg-zinc-950/40">
          <span className="text-[8px] sm:text-[9px] uppercase tracking-wider font-mono text-zinc-500">
            Coord. Number
          </span>
          <span className="text-[11px] sm:text-sm font-mono text-zinc-200">
            {params.type === "fcc"
              ? "12"
              : params.type === "bcc"
                ? "8"
                : params.type === "hcp"
                  ? "12"
                  : params.type === "simple-cubic"
                    ? "6"
                    : params.type === "diamond"
                      ? "4"
                      : "—"}
          </span>
        </div>
        <div className="flex flex-col gap-0.5 sm:gap-1 p-2 sm:p-3 border border-zinc-900 bg-zinc-950/40 col-span-2 md:col-span-1">
          <span className="text-[8px] sm:text-[9px] uppercase tracking-wider font-mono text-zinc-500">
            Atoms / Cell
          </span>
          <span className="text-[11px] sm:text-sm font-mono text-zinc-200">
            {params.type === "fcc"
              ? "4"
              : params.type === "bcc"
                ? "2"
                : params.type === "hcp"
                  ? "2"
                  : params.type === "simple-cubic"
                    ? "1"
                    : params.type === "diamond"
                      ? "8"
                      : params.type === "dhcp"
                        ? "4"
                        : "—"}
          </span>
        </div>
        <div className="flex flex-col gap-0.5 sm:gap-1 p-2 sm:p-3 border border-zinc-900 bg-zinc-950/40">
          <span className="text-[8px] sm:text-[9px] uppercase tracking-wider font-mono text-zinc-500">
            Packing Factor
          </span>
          <div className="flex items-end gap-1.5 sm:gap-2">
            <span className={`text-base sm:text-xl font-mono font-bold ${textClass}`}>
              {params.apf.toFixed(2)}
            </span>
            <div className="flex-1 h-1.5 sm:h-2 bg-zinc-900 rounded-full overflow-hidden mb-0.5 sm:mb-1">
              <div
                className="h-full bg-gradient-to-r from-cyan-500 to-blue-500 rounded-full transition-all duration-500"
                style={{ width: `${params.apf * 100}%` }}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
