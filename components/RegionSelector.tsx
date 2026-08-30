"use client";

import type { RegionId } from "@/lib/types";

interface RegionSelectorProps {
  region: RegionId;
  onSelectRegion: (r: RegionId) => void;
}

export function RegionSelector({ region, onSelectRegion }: RegionSelectorProps) {
  return (
    <div className="flex flex-wrap items-center gap-3">
      <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
        Demonstration Region:
      </span>
      <div className="inline-flex rounded-lg bg-slate-900/90 p-1 border border-slate-700 shadow-inner">
        <button
          onClick={() => onSelectRegion("wayanad")}
          className={`flex items-center gap-2 rounded-md px-3.5 py-1.5 text-xs font-medium transition ${
            region === "wayanad"
              ? "bg-sky-500 text-slate-950 font-bold shadow"
              : "text-slate-300 hover:text-white hover:bg-slate-800"
          }`}
        >
          <span>🌲</span>
          <span>Wayanad, Kerala</span>
          <span className="rounded bg-sky-950/40 px-1.5 py-0.2 text-[10px] text-slate-900 font-normal">
            Landslide / Flood
          </span>
        </button>

        <button
          onClick={() => onSelectRegion("assam")}
          className={`flex items-center gap-2 rounded-md px-3.5 py-1.5 text-xs font-medium transition ${
            region === "assam"
              ? "bg-teal-500 text-slate-950 font-bold shadow"
              : "text-slate-300 hover:text-white hover:bg-slate-800"
          }`}
        >
          <span>🌊</span>
          <span>Assam Flood Scenario</span>
          <span className="rounded bg-teal-950/40 px-1.5 py-0.2 text-[10px] text-slate-900 font-normal">
            Brahmaputra Basin
          </span>
        </button>
      </div>
    </div>
  );
}
