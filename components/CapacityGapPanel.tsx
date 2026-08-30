"use client";

import type { CapacityGapResult } from "@/lib/capacity";

interface CapacityGapPanelProps {
  gapResult: CapacityGapResult;
}

export function CapacityGapPanel({ gapResult }: CapacityGapPanelProps) {
  const isDeficit = gapResult.capacity_deficit > 0;

  return (
    <section className="rounded-xl border border-slate-700 bg-slate-900/70 p-5 space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800 pb-4">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-sky-400">
            Regional Carrying-Capacity Model
          </span>
          <h2 className="text-xl font-bold text-slate-100 mt-0.5">
            Relocation Capacity Gap Analysis
          </h2>
          <p className="text-xs text-slate-400">
            Aggregate comparison between regional displaced population demand and verified safe shelter headroom.
          </p>
        </div>

        <span
          className={`rounded-full border px-3 py-1 text-xs font-bold uppercase ${
            isDeficit
              ? "bg-red-950/80 text-red-300 border-red-700"
              : "bg-emerald-950/80 text-emerald-300 border-emerald-700"
          }`}
        >
          {gapResult.capacity_status}
        </span>
      </div>

      {/* Primary KPI Metrics */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="rounded-xl border border-slate-800 bg-slate-900 p-4">
          <p className="text-xs text-slate-400">Total People Requiring Relocation</p>
          <p className="mt-1 text-3xl font-bold text-orange-300 font-mono">
            {gapResult.total_requiring_relocation.toLocaleString()}
          </p>
          <p className="text-xs text-slate-500 mt-1">Displaced population across selected origins</p>
        </div>

        <div className="rounded-xl border border-slate-800 bg-slate-900 p-4">
          <p className="text-xs text-slate-400">Total Available Safe Capacity</p>
          <p className="mt-1 text-3xl font-bold text-emerald-300 font-mono">
            {gapResult.total_available_capacity.toLocaleString()}
          </p>
          <p className="text-xs text-slate-500 mt-1">Verified headroom in candidate safe zones</p>
        </div>

        <div
          className={`rounded-xl border p-4 ${
            isDeficit
              ? "border-red-800/80 bg-red-950/30"
              : "border-emerald-800/80 bg-emerald-950/30"
          }`}
        >
          <p className="text-xs text-slate-400">Capacity Gap</p>
          <p
            className={`mt-1 text-3xl font-bold font-mono ${
              isDeficit ? "text-red-400" : "text-emerald-300"
            }`}
          >
            {isDeficit
              ? `-${gapResult.capacity_deficit.toLocaleString()}`
              : `+${(gapResult.total_available_capacity - gapResult.total_requiring_relocation).toLocaleString()}`}
          </p>
          <p className="text-xs text-slate-400 mt-1">
            {isDeficit ? "Capacity Deficit Shortfall" : "Safe Surplus Headroom"}
          </p>
        </div>
      </div>

      {/* Operational Callout Message */}
      <div
        className={`rounded-lg border p-4 text-sm ${
          isDeficit
            ? "border-red-800 bg-red-950/40 text-red-200"
            : "border-emerald-800 bg-emerald-950/40 text-emerald-200"
        }`}
      >
        <div className="flex items-start gap-3">
          <span className="text-xl">{isDeficit ? "⚠️" : "✅"}</span>
          <div>
            <h4 className="font-bold text-slate-100">
              {isDeficit ? "Shelter Capacity Shortfall Identified" : "Regional Capacity Sufficient"}
            </h4>
            <p className="mt-1 text-xs">{gapResult.summary_message}</p>
            {isDeficit && (
              <p className="mt-2 text-xs text-slate-300">
                <b>Recommended SDMA Action:</b> Identify additional high-elevation public infrastructure (e.g. colleges, stadiums) or expand temporary shelter density buffers in adjacent non-inundated sub-districts.
              </p>
            )}
          </div>
        </div>
      </div>

      {/* District Deficit Breakdown Table */}
      <div>
        <h3 className="text-sm font-semibold uppercase tracking-wider text-slate-300 mb-3">
          District-Level Demand vs. Relocation Headroom
        </h3>
        <div className="overflow-x-auto rounded-lg border border-slate-800">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-800/80 text-slate-400 uppercase text-[10px]">
              <tr>
                <th className="p-3">District</th>
                <th className="p-3">Displaced Demand</th>
                <th className="p-3">Available Safe Headroom</th>
                <th className="p-3">Net District Gap</th>
                <th className="p-3">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800 bg-slate-900/60">
              {gapResult.district_breakdown.map((row) => {
                const districtDeficit = row.gap > 0;
                return (
                  <tr key={row.district} className="hover:bg-slate-800/50">
                    <td className="p-3 font-semibold text-slate-100">{row.district}</td>
                    <td className="p-3 font-mono">{row.population_demanding.toLocaleString()}</td>
                    <td className="p-3 font-mono">{row.available_capacity.toLocaleString()}</td>
                    <td
                      className={`p-3 font-mono font-bold ${
                        districtDeficit ? "text-red-400" : "text-emerald-300"
                      }`}
                    >
                      {districtDeficit ? `-${row.gap.toLocaleString()}` : `+${(-row.gap).toLocaleString()}`}
                    </td>
                    <td className="p-3">
                      <span
                        className={`rounded px-2 py-0.5 text-[10px] font-semibold ${
                          districtDeficit
                            ? "bg-red-950/80 text-red-300 border border-red-800"
                            : "bg-emerald-950/80 text-emerald-300 border border-emerald-800"
                        }`}
                      >
                        {districtDeficit ? "Deficit" : "Covered"}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
}
