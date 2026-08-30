"use client";

import { useState } from "react";
import type { FloodStatisticsData } from "@/lib/types";
import { SourceReferenceModal, type SourceReferenceDetails } from "./SourceReferenceModal";

interface AssamTimelinePanelProps {
  floodStats: FloodStatisticsData;
}

export function AssamTimelinePanel({ floodStats }: AssamTimelinePanelProps) {
  const [activeSourceDetails, setActiveSourceDetails] = useState<SourceReferenceDetails | null>(null);

  return (
    <section className="space-y-6">
      {/* Header */}
      <div className="border-b border-slate-800 pb-3">
        <h2 className="text-base font-semibold text-white">
          Monsoon Inundation Timeline (2026 Season)
        </h2>
        <p className="text-xs text-slate-400">
          Chronological record of monsoon flood waves across Assam river basins based on official disaster management authority daily bulletins.
        </p>
      </div>

      {/* Timeline Steps */}
      <div className="relative border-l border-slate-800 ml-2.5 space-y-6 pl-4">
        {floodStats.historical_snapshots.map((snap) => (
          <div key={snap.date} className="relative">
            {/* Timeline dot */}
            <div className="absolute -left-[21px] top-1.5 h-2.5 w-2.5 rounded-full border border-slate-700 bg-slate-900" />

            <div className="rounded border border-slate-800 bg-slate-900 p-4 space-y-3">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div>
                  <span className="text-xs font-mono text-slate-400">
                    {snap.period} • {snap.date}
                  </span>
                  <h3 className="text-sm font-semibold text-white mt-0.5">{snap.phase}</h3>
                </div>
                <span className="rounded border border-slate-700 bg-slate-800 px-2 py-0.5 text-[10px] font-mono text-slate-300">
                  {snap.confidence}
                </span>
              </div>

              <p className="text-xs text-slate-300 leading-relaxed">{snap.headline}</p>

              {/* Snapshot Stats Grid */}
              <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-4 rounded bg-slate-950 p-2.5 border border-slate-800/80 text-xs">
                <div>
                  <span className="text-[11px] text-slate-500 block">Affected Population</span>
                  <p className="font-bold text-white font-mono text-sm mt-0.5">{snap.affected_population.toLocaleString()}</p>
                </div>
                <div>
                  <span className="text-[11px] text-slate-500 block">Inundated Mouzas</span>
                  <p className="font-bold text-white font-mono text-sm mt-0.5">{snap.affected_villages_count}</p>
                </div>
                <div>
                  <span className="text-[11px] text-slate-500 block">Declared Districts</span>
                  <p className="font-bold text-slate-200 font-mono text-sm mt-0.5">{snap.affected_districts_count}</p>
                </div>
                <div>
                  <span className="text-[11px] text-slate-500 block">Relief Camps Active</span>
                  <p className="font-bold text-emerald-400 font-mono text-sm mt-0.5">{snap.relief_camps_active}</p>
                </div>
              </div>

              {/* Rivers & Source Citation */}
              <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-slate-400 pt-2 border-t border-slate-800/80">
                <div>
                  <span>Rivers above danger: </span>
                  <span className="text-slate-200 font-mono">{snap.rivers_above_danger.join(", ")}</span>
                </div>
                <div>
                  <span>Source Reference: </span>
                  <button
                    type="button"
                    onClick={() =>
                      setActiveSourceDetails({
                        title: snap.source,
                        organization: "Assam State Disaster Management Authority (ASDMA)",
                        date: snap.date,
                        sourceUrl: snap.source_url,
                        confidence: snap.confidence,
                        notes: `Official ASDMA situation bulletin for ${snap.phase} (${snap.date}). External server link preserved as reference.`
                      })
                    }
                    className="text-sky-400 hover:underline font-medium cursor-pointer"
                  >
                    {snap.source} ↗
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Source Reference Modal for graceful document link handling */}
      <SourceReferenceModal
        details={activeSourceDetails}
        onClose={() => setActiveSourceDetails(null)}
      />
    </section>
  );
}
