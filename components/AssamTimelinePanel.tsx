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
      <div className="border-b border-slate-200 pb-3">
        <h2 className="text-base font-bold text-slate-900">
          Situation Evolution Timeline ({floodStats.title})
        </h2>
        <p className="text-xs text-slate-600">
          Chronological record of disaster events, water level peaks, and displacement evolution based on official disaster management authority bulletins.
        </p>
      </div>

      {/* Timeline Steps */}
      <div className="relative border-l-2 border-slate-200 ml-2.5 space-y-6 pl-4">
        {floodStats.historical_snapshots.map((snap) => (
          <div key={snap.date} className="relative">
            {/* Timeline dot */}
            <div className="absolute -left-[23px] top-1.5 h-3.5 w-3.5 rounded-full border-2 border-white bg-sky-600 shadow-xs" />

            <div className="rounded-lg border border-slate-200 bg-white p-4 space-y-3 shadow-2xs">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div>
                  <span className="text-xs font-mono font-semibold text-slate-500">
                    {snap.period} • {snap.date}
                  </span>
                  <h3 className="text-sm font-bold text-slate-900 mt-0.5">{snap.phase}</h3>
                </div>
                <span className="rounded border border-slate-300 bg-slate-100 px-2 py-0.5 text-[10px] font-bold font-mono text-slate-700">
                  {snap.confidence}
                </span>
              </div>

              <p className="text-xs text-slate-700 leading-relaxed font-medium">{snap.headline}</p>

              {/* Snapshot Stats Grid */}
              <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-4 rounded-lg bg-slate-50 p-2.5 border border-slate-200 text-xs">
                <div>
                  <span className="text-[11px] text-slate-500 block font-medium">Affected Population</span>
                  <p className="font-bold text-slate-900 font-mono text-sm mt-0.5">{snap.affected_population.toLocaleString()}</p>
                </div>
                <div>
                  <span className="text-[11px] text-slate-500 block font-medium">Inundated Habitations</span>
                  <p className="font-bold text-slate-900 font-mono text-sm mt-0.5">{snap.affected_villages_count}</p>
                </div>
                <div>
                  <span className="text-[11px] text-slate-500 block font-medium">Declared Districts</span>
                  <p className="font-bold text-slate-900 font-mono text-sm mt-0.5">{snap.affected_districts_count}</p>
                </div>
                <div>
                  <span className="text-[11px] text-slate-500 block font-medium">Relief Camps Active</span>
                  <p className="font-bold text-emerald-700 font-mono text-sm mt-0.5">{snap.relief_camps_active}</p>
                </div>
              </div>

              {/* Rivers & Source Citation */}
              <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-slate-600 pt-2 border-t border-slate-100">
                <div>
                  <span className="text-slate-500">Rivers Above Danger: </span>
                  <span className="text-slate-900 font-mono font-semibold">{snap.rivers_above_danger.join(", ")}</span>
                </div>
                <div>
                  <span className="text-slate-500">Source: </span>
                  <button
                    type="button"
                    onClick={() =>
                      setActiveSourceDetails({
                        title: snap.source,
                        organization: "Disaster Management Authority Situation Report",
                        date: snap.date,
                        sourceUrl: snap.source_url,
                        confidence: snap.confidence,
                        notes: `Official disaster management situation bulletin for ${snap.phase} (${snap.date}). External server link preserved as reference.`
                      })
                    }
                    className="text-sky-700 hover:underline font-semibold cursor-pointer"
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
