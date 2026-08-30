"use client";

import type { RegionId } from "@/lib/types";

interface RegionSelectorProps {
  region: RegionId;
  onSelectRegion: (r: RegionId) => void;
}

export function RegionSelector({ region, onSelectRegion }: RegionSelectorProps) {
  return (
    <div className="flex items-center gap-2">
      <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
        Active Scenario:
      </span>
      <div className="inline-flex rounded-md border border-slate-300 bg-slate-100 p-0.5">
        <button
          type="button"
          onClick={() => onSelectRegion("wayanad")}
          className={`flex items-center gap-1.5 rounded px-2.5 py-1 text-xs transition ${
            region === "wayanad"
              ? "bg-white text-slate-900 font-bold shadow-2xs"
              : "text-slate-600 hover:text-slate-900"
          }`}
        >
          <span>Wayanad</span>
          <span className="text-[10px] text-slate-500">• Landslide</span>
        </button>

        <button
          type="button"
          onClick={() => onSelectRegion("assam")}
          className={`flex items-center gap-1.5 rounded px-2.5 py-1 text-xs transition ${
            region === "assam"
              ? "bg-white text-slate-900 font-bold shadow-2xs"
              : "text-slate-600 hover:text-slate-900"
          }`}
        >
          <span>Assam</span>
          <span className="text-[10px] text-slate-500">• Flood</span>
        </button>

        <button
          type="button"
          onClick={() => onSelectRegion("nepal")}
          className={`flex items-center gap-1.5 rounded px-2.5 py-1 text-xs transition ${
            region === "nepal"
              ? "bg-white text-slate-900 font-bold shadow-2xs"
              : "text-slate-600 hover:text-slate-900"
          }`}
        >
          <span>Nepal–Tibet</span>
          <span className="text-[10px] text-slate-500">• Cascade</span>
        </button>
      </div>
    </div>
  );
}
