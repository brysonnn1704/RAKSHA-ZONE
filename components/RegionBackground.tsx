"use client";

import type { RegionId } from "@/lib/types";

const REGION_BACKGROUNDS: Record<RegionId, { src: string; alt: string; focus: string }> = {
  wayanad: {
    src: "/images/regions/wayanad-bg.jpg",
    alt: "Western Ghats mountain terrain in Wayanad, Kerala",
    focus: "center 35%"
  },
  assam: {
    src: "/images/regions/assam-bg.jpg",
    alt: "Brahmaputra river basin and Assam alluvial floodplain",
    focus: "center 45%"
  },
  nepal: {
    src: "/images/regions/nepal-tibet-bg.jpg",
    alt: "High-altitude Himalayan valley and glacial hazard corridor",
    focus: "center 30%"
  }
};

export function RegionBackground({ region }: { region: RegionId }) {
  const currentBg = REGION_BACKGROUNDS[region] ?? REGION_BACKGROUNDS.wayanad;

  return (
    <div
      aria-hidden="true"
      className="pointer-events-none fixed inset-0 z-0 overflow-hidden select-none"
    >
      {/* 1. Base light canvas */}
      <div className="absolute inset-0 bg-slate-100/60" />

      {/* 2. Photographic Regional Landscape Layer — Calibrated 20-30% boost (18-22% net visibility) */}
      <div
        key={region}
        className="absolute inset-0 bg-cover bg-no-repeat transition-opacity duration-200 ease-out motion-reduce:transition-none opacity-30 sm:opacity-32 md:opacity-35"
        style={{
          backgroundImage: `url('${currentBg.src}')`,
          backgroundPosition: currentBg.focus,
          filter: "blur(3px) saturate(0.90) brightness(1.02)",
          transform: "scale(1.03)" /* Prevents edge blur fringing */
        }}
      />

      {/* 3. Light translucent protective veil (rgba(248, 250, 252, 0.52)) guaranteeing high-contrast text */}
      <div className="absolute inset-0 bg-slate-50/50 backdrop-blur-[0.5px]" />
    </div>
  );
}
