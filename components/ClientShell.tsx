"use client";

import { SpectralHarmonies } from "@/components/SpectralHarmonies";

export function ClientShell({ children }: { children: React.ReactNode }) {
  return (
    <>
      {children}
      <SpectralHarmonies />
    </>
  );
}
