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
    <section className="space-y-4">
      {/* Time-sensitive Official Situation Snapshot Banner */}
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-teal-700/60 bg-gradient-to-r from-teal-950/60 via-slate-900 to-slate-900 p-4">
        <div className="flex items-center gap-3">
          <span className="text-2xl">🌊</span>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold uppercase tracking-wider text-teal-300">
                Official ASDMA Situation Snapshot
              </span>
              <span className="rounded bg-teal-500/20 border border-teal-500/40 px-2 py-0.5 text-[10px] font-semibold text-teal-200">
                OFFICIAL · {peakSnapshot.date}
              </span>
            </div>
            <p className="mt-0.5 text-sm text-slate-200">{peakSnapshot.headline}</p>
          </div>
        </div>
        <div className="text-right text-xs text-slate-400">
          <span className="block font-medium text-slate-300">Source: {peakSnapshot.source}</span>
          <span className="text-[11px] text-slate-500">Rivers in spate: {peakSnapshot.rivers_above_danger.slice(0, 3).join(", ")}</span>
        </div>
      </div>

      {/* Primary KPI Grid */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-8">
        {/* 1. Affected Population */}
        <div className="rounded-xl border border-slate-700 bg-slate-900/80 p-3">
          <p className="text-[11px] text-slate-400">Affected Population</p>
          <p className="mt-1 text-xl font-bold text-slate-100">
            {peakSnapshot.affected_population.toLocaleString()}
          </p>
          <p className="text-[10px] text-teal-400">ASDMA 08 Aug 2026</p>
        </div>

        {/* 2. Affected Villages */}
        <div className="rounded-xl border border-slate-700 bg-slate-900/80 p-3">
          <p className="text-[11px] text-slate-400">Affected Villages</p>
          <p className="mt-1 text-xl font-bold text-slate-100">
            {peakSnapshot.affected_villages_count}
          </p>
          <p className="text-[10px] text-slate-400">Revenue mouzas</p>
        </div>

        {/* 3. Active Districts */}
        <div className="rounded-xl border border-slate-700 bg-slate-900/80 p-3">
          <p className="text-[11px] text-slate-400">Active Districts</p>
          <p className="mt-1 text-xl font-bold text-sky-400">
            {peakSnapshot.affected_districts_count}
          </p>
          <p className="text-[10px] text-slate-400">Flood-declared</p>
        </div>

        {/* 4. Displaced Demand */}
        <div className="rounded-xl border border-slate-700 bg-slate-900/80 p-3">
          <p className="text-[11px] text-slate-400">Requiring Relocation</p>
          <p className="mt-1 text-xl font-bold text-orange-300">
            {demandedPopulation.toLocaleString()}
          </p>
          <p className="text-[10px] text-slate-400">Displaced target</p>
        </div>

        {/* 5. Available Capacity */}
        <div className="rounded-xl border border-slate-700 bg-slate-900/80 p-3">
          <p className="text-[11px] text-slate-400">Safe Headroom</p>
          <p className="mt-1 text-xl font-bold text-emerald-300">
            {availableCapacity.toLocaleString()}
          </p>
          <p className="text-[10px] text-slate-400">Candidate sites</p>
        </div>

        {/* 6. Capacity Gap */}
        <div className="rounded-xl border border-slate-700 bg-slate-900/80 p-3">
          <p className="text-[11px] text-slate-400">Capacity Gap</p>
          <p className={`mt-1 text-xl font-bold ${capacityDeficit > 0 ? "text-red-400" : "text-emerald-400"}`}>
            {capacityDeficit > 0 ? `-${capacityDeficit.toLocaleString()}` : "Sufficient"}
          </p>
          <p className="text-[10px] text-slate-400">{capacityDeficit > 0 ? "Deficit" : "Surplus buffer"}</p>
        </div>

        {/* 7. Relief Camps */}
        <div className="rounded-xl border border-slate-700 bg-slate-900/80 p-3">
          <p className="text-[11px] text-slate-400">Relief Camps</p>
          <p className="mt-1 text-xl font-bold text-slate-100">
            {peakSnapshot.relief_camps_active}
          </p>
          <p className="text-[10px] text-slate-400">+{peakSnapshot.distribution_centers_active} food centers</p>
        </div>

        {/* 8. Resource Status */}
        <div className="rounded-xl border border-slate-700 bg-slate-900/80 p-3">
          <p className="text-[11px] text-slate-400">Stock Status</p>
          <p className={`mt-1 text-xl font-bold ${criticalResourceCount > 0 ? "text-amber-400" : "text-emerald-400"}`}>
            {criticalResourceCount > 0 ? `${criticalResourceCount} Critical` : "Stable"}
          </p>
          <p className="text-[10px] text-slate-400">WASH & Medical</p>
        </div>
      </div>
    </section>
  );
}
