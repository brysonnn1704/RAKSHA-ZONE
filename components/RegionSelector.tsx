"use client";

import type { RegionId } from "@/lib/types";

interface RegionSelectorProps {
  region: RegionId;
  onSelectRegion: (r: RegionId) => void;
}

export function RegionSelector({ region, onSelectRegion }: RegionSelectorProps) {
  return (
    <div className="flex items-center gap-2">
      <span className="text-[11px] font-medium uppercase tracking-wider text-slate-400">
        Region:
      </span>
      <div className="inline-flex rounded border border-slate-800 bg-slate-900 p-0.5">
        <button
          type="button"
          onClick={() => onSelectRegion("wayanad")}
          className={`flex items-center gap-1.5 rounded px-2.5 py-1 text-xs transition ${
            region === "wayanad"
              ? "bg-slate-800 text-white font-medium"
              : "text-slate-400 hover:text-slate-200"
          }`}
        >
          <span>Wayanad, Kerala</span>
          <span className="text-[10px] text-slate-500">• Landslide</span>
        </button>

        <button
          type="button"
          onClick={() => onSelectRegion("assam")}
          className={`flex items-center gap-1.5 rounded px-2.5 py-1 text-xs transition ${
            region === "assam"
              ? "bg-slate-800 text-white font-medium"
              : "text-slate-400 hover:text-slate-200"
          }`}
        >
          <span>Assam Scenario</span>
          <span className="text-[10px] text-slate-500">• Flood</span>
        </button>
      </div>
    </div>
  );
}
