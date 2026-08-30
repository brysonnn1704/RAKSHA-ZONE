"use client";

import type { FloodStatisticsData } from "@/lib/types";

interface AssamTimelinePanelProps {
  floodStats: FloodStatisticsData;
}

export function AssamTimelinePanel({ floodStats }: AssamTimelinePanelProps) {
  return (
    <section className="rounded-lg border border-slate-800 bg-slate-900/90 p-4 md:p-5 space-y-5">
      {/* Header */}
      <div className="border-b border-slate-800 pb-3.5">
        <span className="text-[10px] font-bold uppercase tracking-wider text-teal-400">
          Monsoon Inundation Audit Log (2026 Season)
        </span>
        <h2 className="text-lg font-bold text-slate-100 mt-0.5">
          Assam Flood Situation Evolution & ASDMA Bulletins
        </h2>
        <p className="text-xs text-slate-400">
          Chronological record of monsoon flood waves across Assam river basins based on official disaster management authority daily bulletins.
        </p>
      </div>

      {/* Timeline Steps */}
      <div className="relative border-l border-slate-800 ml-3 space-y-6 pl-5">
        {floodStats.historical_snapshots.map((snap) => (
          <div key={snap.date} className="relative">
            {/* Dot icon */}
            <div className="absolute -left-[25px] top-1 h-3 w-3 rounded-full border border-teal-500 bg-slate-900" />

            <div className="rounded-md border border-slate-800 bg-slate-850 p-4 space-y-3">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div>
                  <span className="text-[11px] font-mono font-bold text-teal-400">
                    {snap.period} · {snap.date}
                  </span>
                  <h3 className="text-sm font-bold text-slate-100 mt-0.5">{snap.phase}</h3>
                </div>
                <span className="rounded bg-teal-950/80 border border-teal-800 px-2 py-0.5 text-[10px] font-semibold text-teal-300">
                  {snap.confidence}
                </span>
              </div>

              <p className="text-xs text-slate-300 leading-relaxed">{snap.headline}</p>

              {/* Snapshot Stats Grid */}
              <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-4 rounded bg-slate-900 p-2.5 border border-slate-800 text-xs">
                <div>
                  <span className="text-[10px] uppercase font-semibold text-slate-400 block">Affected Pop.</span>
                  <p className="font-bold text-slate-100 font-mono text-sm mt-0.5">{snap.affected_population.toLocaleString()}</p>
                </div>
                <div>
                  <span className="text-[10px] uppercase font-semibold text-slate-400 block">Inundated Mouzas</span>
                  <p className="font-bold text-slate-100 font-mono text-sm mt-0.5">{snap.affected_villages_count}</p>
                </div>
                <div>
                  <span className="text-[10px] uppercase font-semibold text-slate-400 block">Declared Districts</span>
                  <p className="font-bold text-slate-200 font-mono text-sm mt-0.5">{snap.affected_districts_count}</p>
                </div>
                <div>
                  <span className="text-[10px] uppercase font-semibold text-slate-400 block">Relief Camps Active</span>
                  <p className="font-bold text-emerald-400 font-mono text-sm mt-0.5">{snap.relief_camps_active}</p>
                </div>
              </div>

              {/* Rivers & Source Link */}
              <div className="flex flex-wrap items-center justify-between gap-2 text-[11px] text-slate-400 pt-2 border-t border-slate-800">
                <div>
                  <span className="text-red-400 font-medium">Rivers Above Danger Mark: </span>
                  <span className="text-slate-300">{snap.rivers_above_danger.join(", ")}</span>
                </div>
                <div>
                  <span>Source: </span>
                  <a
                    href={snap.source_url}
                    target="_blank"
                    rel="noreferrer"
                    className="text-sky-400 hover:underline"
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
