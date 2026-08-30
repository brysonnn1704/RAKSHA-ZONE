"use client";

import type { RegionId } from "@/lib/types";

interface RegionSelectorProps {
  region: RegionId;
  onSelectRegion: (r: RegionId) => void;
}

export function RegionSelector({ region, onSelectRegion }: RegionSelectorProps) {
  return (
    <div className="flex flex-wrap items-center gap-2.5">
      <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
        Region:
      </span>
      <div className="inline-flex rounded-md bg-slate-900/90 p-1 border border-slate-700/80">
        <button
          type="button"
          onClick={() => onSelectRegion("wayanad")}
          className={`flex items-center gap-2 rounded px-3 py-1.5 text-xs font-medium transition ${
            region === "wayanad"
              ? "bg-slate-800 text-sky-400 border border-sky-500/30 shadow-sm"
              : "text-slate-400 hover:text-slate-200 hover:bg-slate-850"
          }`}
        >
          <span className="font-semibold text-slate-200">Wayanad, Kerala</span>
          <span className="text-[10px] text-slate-400 border-l border-slate-700 pl-1.5">
            Slope & Debris Flow
          </span>
        </button>

        <button
          type="button"
          onClick={() => onSelectRegion("assam")}
          className={`flex items-center gap-2 rounded px-3 py-1.5 text-xs font-medium transition ${
            region === "assam"
              ? "bg-slate-800 text-teal-400 border border-teal-500/30 shadow-sm"
              : "text-slate-400 hover:text-slate-200 hover:bg-slate-850"
          }`}
        >
          <span className="font-semibold text-slate-200">Assam Scenario</span>
          <span className="text-[10px] text-slate-400 border-l border-slate-700 pl-1.5">
            Brahmaputra Inundation
          </span>
        </button>
      </div>
    </div>
  );
}
