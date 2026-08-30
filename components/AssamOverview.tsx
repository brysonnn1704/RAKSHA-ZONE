"use client";

import type { FloodStatisticsData } from "@/lib/types";

interface AssamOverviewProps {
  floodStats: FloodStatisticsData;
  demandedPopulation: number;
  availableCapacity: number;
  capacityDeficit: number;
  criticalResourceCount: number;
}

export function AssamOverview({
  floodStats,
  demandedPopulation,
  availableCapacity,
  capacityDeficit,
  criticalResourceCount
}: AssamOverviewProps) {
  const peakSnapshot = floodStats.historical_snapshots.find(
    (s) => s.date === "2026-08-08"
  ) ?? floodStats.historical_snapshots[1];

  return (
    <section className="space-y-3">
      {/* Official Situation Report Header Banner */}
      <div className="rounded-md border border-slate-800 border-l-4 border-l-teal-500 bg-slate-900/90 p-3.5 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-bold uppercase tracking-wider text-teal-400">
                ASDMA Official Situation Snapshot
              </span>
              <span className="text-slate-500">|</span>
              <span className="text-xs text-slate-300 font-mono">Date: {peakSnapshot.date}</span>
              <span className="rounded bg-teal-950 border border-teal-800/80 px-1.5 py-0.2 text-[9px] font-semibold text-teal-300">
                OFFICIAL
              </span>
            </div>
            <p className="mt-1 text-xs text-slate-300 leading-snug">{peakSnapshot.headline}</p>
          </div>
          <div className="text-right text-xs text-slate-400">
            <span className="block font-medium text-slate-300">Doc: {peakSnapshot.source}</span>
            <span className="text-[11px] text-slate-500">Rivers exceeding danger: {peakSnapshot.rivers_above_danger.slice(0, 3).join(", ")}</span>
          </div>
        </div>
      </div>

      {/* Primary KPI Grid */}
      <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-4 lg:grid-cols-8">
        {/* 1. Affected Population */}
        <div className="rounded-md border border-slate-800 bg-slate-900/90 p-3">
          <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">Affected Pop.</p>
          <p className="mt-1 text-lg font-bold font-mono text-slate-100">
            {peakSnapshot.affected_population.toLocaleString()}
          </p>
          <p className="text-[10px] text-teal-400 mt-0.5">ASDMA 08 Aug</p>
        </div>

        {/* 2. Affected Villages */}
        <div className="rounded-md border border-slate-800 bg-slate-900/90 p-3">
          <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">Inundated Habitations</p>
          <p className="mt-1 text-lg font-bold font-mono text-slate-100">
            {peakSnapshot.affected_villages_count}
          </p>
          <p className="text-[10px] text-slate-400 mt-0.5">Revenue mouzas</p>
        </div>

        {/* 3. Active Districts */}
        <div className="rounded-md border border-slate-800 bg-slate-900/90 p-3">
          <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">Flood Districts</p>
          <p className="mt-1 text-lg font-bold font-mono text-slate-100">
            {peakSnapshot.affected_districts_count}
          </p>
          <p className="text-[10px] text-slate-400 mt-0.5">Declared active</p>
        </div>

        {/* 4. Displaced Demand */}
        <div className="rounded-md border border-slate-800 bg-slate-900/90 p-3">
          <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">Evacuation Target</p>
          <p className="mt-1 text-lg font-bold font-mono text-orange-300">
            {demandedPopulation.toLocaleString()}
          </p>
          <p className="text-[10px] text-slate-400 mt-0.5">Displaced persons</p>
        </div>

        {/* 5. Available Capacity */}
        <div className="rounded-md border border-slate-800 bg-slate-900/90 p-3">
          <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">Safe Headroom</p>
          <p className="mt-1 text-lg font-bold font-mono text-emerald-400">
            {availableCapacity.toLocaleString()}
          </p>
          <p className="text-[10px] text-slate-400 mt-0.5">Candidate sites</p>
        </div>

        {/* 6. Capacity Gap */}
        <div className="rounded-md border border-slate-800 bg-slate-900/90 p-3">
          <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">Capacity Gap</p>
          <p className={`mt-1 text-lg font-bold font-mono ${capacityDeficit > 0 ? "text-red-400" : "text-emerald-400"}`}>
            {capacityDeficit > 0 ? `-${capacityDeficit.toLocaleString()}` : "Sufficient"}
          </p>
          <p className="text-[10px] text-slate-400 mt-0.5">{capacityDeficit > 0 ? "Deficit shortfall" : "Covered"}</p>
        </div>

        {/* 7. Relief Camps */}
        <div className="rounded-md border border-slate-800 bg-slate-900/90 p-3">
          <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">Relief Camps</p>
          <p className="mt-1 text-lg font-bold font-mono text-slate-100">
            {peakSnapshot.relief_camps_active}
          </p>
          <p className="text-[10px] text-slate-400 mt-0.5">+{peakSnapshot.distribution_centers_active} dist. hubs</p>
        </div>

        {/* 8. Resource Status */}
        <div className="rounded-md border border-slate-800 bg-slate-900/90 p-3">
          <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">Critical Stocks</p>
          <p className={`mt-1 text-lg font-bold font-mono ${criticalResourceCount > 0 ? "text-amber-400" : "text-emerald-400"}`}>
            {criticalResourceCount > 0 ? `${criticalResourceCount} Critical` : "Adequate"}
          </p>
          <p className="text-[10px] text-slate-400 mt-0.5">Lifeline buffers</p>
        </div>
      </div>
    </section>
  );
}
