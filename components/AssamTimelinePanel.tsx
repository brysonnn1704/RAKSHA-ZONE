"use client";

import type { FloodStatisticsData } from "@/lib/types";

interface AssamTimelinePanelProps {
  floodStats: FloodStatisticsData;
}

export function AssamTimelinePanel({ floodStats }: AssamTimelinePanelProps) {
  return (
    <section className="rounded-xl border border-slate-700 bg-slate-900/70 p-5 space-y-6">
      {/* Header */}
      <div className="border-b border-slate-800 pb-4">
        <span className="text-xs font-bold uppercase tracking-wider text-teal-400">
          Historical Situation Snapshots (2026 Monsoon Season)
        </span>
        <h2 className="text-xl font-bold text-slate-100 mt-0.5">
          Assam Flood Impact Timeline & ASDMA Situation Reports
        </h2>
        <p className="text-xs text-slate-400">
          Chronological record of monsoon flood waves across Assam river basins based on official disaster management authority bulletins.
        </p>
      </div>

      {/* Timeline Steps */}
      <div className="relative border-l-2 border-slate-700 ml-4 space-y-8 pl-6">
        {floodStats.historical_snapshots.map((snap, i) => (
          <div key={snap.date} className="relative">
            {/* Dot icon */}
            <div className="absolute -left-[31px] top-1 h-4 w-4 rounded-full border-2 border-teal-400 bg-slate-900" />

            <div className="rounded-xl border border-slate-800 bg-slate-900/90 p-5 space-y-3">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div>
                  <span className="text-xs font-mono font-bold text-teal-300">
                    {snap.period} · {snap.date}
                  </span>
                  <h3 className="text-base font-bold text-slate-100 mt-0.5">{snap.phase}</h3>
                </div>
                <span className="rounded bg-teal-950/60 border border-teal-600/60 px-2.5 py-1 text-xs font-bold text-teal-200">
                  {snap.confidence}
                </span>
              </div>

              <p className="text-xs text-slate-300 leading-relaxed">{snap.headline}</p>

              {/* Snapshot Stats Grid */}
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 rounded-lg bg-slate-800/60 p-3 border border-slate-800 text-xs">
                <div>
                  <span className="text-slate-400">Affected Population:</span>
                  <p className="font-bold text-slate-100 font-mono text-sm">{snap.affected_population.toLocaleString()}</p>
                </div>
                <div>
                  <span className="text-slate-400">Affected Villages:</span>
                  <p className="font-bold text-slate-100 font-mono text-sm">{snap.affected_villages_count}</p>
                </div>
                <div>
                  <span className="text-slate-400">Declared Districts:</span>
                  <p className="font-bold text-sky-300 font-mono text-sm">{snap.affected_districts_count}</p>
                </div>
                <div>
                  <span className="text-slate-400">Relief Camps Active:</span>
                  <p className="font-bold text-emerald-300 font-mono text-sm">{snap.relief_camps_active}</p>
                </div>
              </div>

              {/* Rivers & Source Link */}
              <div className="flex flex-wrap items-center justify-between gap-2 text-[11px] text-slate-400 pt-2 border-t border-slate-800">
                <div>
                  <span className="text-red-400 font-semibold">Rivers Above Danger Mark: </span>
                  {snap.rivers_above_danger.join(", ")}
                </div>
                <div>
                  <span>Source: </span>
                  <a
                    href={snap.source_url}
                    target="_blank"
                    rel="noreferrer"
                    className="text-sky-400 underline hover:text-sky-300"
                  >
                    {snap.source}
                  </a>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
