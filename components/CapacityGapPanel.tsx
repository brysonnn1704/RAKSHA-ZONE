"use client";

import type { CapacityGapResult } from "@/lib/types";

interface CapacityGapPanelProps {
  gapResult: CapacityGapResult;
}

export function CapacityGapPanel({ gapResult }: CapacityGapPanelProps) {
  const isDeficit = gapResult.capacity_deficit > 0;
  const coveragePct =
    gapResult.total_requiring_relocation > 0
      ? Math.min(
          100,
          Math.round(
            (gapResult.total_available_capacity / gapResult.total_requiring_relocation) * 100
          )
        )
      : 100;

  return (
    <section className="rounded-lg border border-slate-800 bg-slate-900/90 p-4 md:p-5 space-y-5">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800 pb-3.5">
        <div>
          <span className="text-[10px] font-bold uppercase tracking-wider text-sky-400">
            Carrying Capacity & Relocation Demand Analysis
          </span>
          <h2 className="text-lg font-bold text-slate-100 mt-0.5">
            Regional Relocation Capacity Gap Analysis
          </h2>
          <p className="text-xs text-slate-400">
            Aggregate comparison of total displaced population requiring relocation versus safe highland candidate shelter headroom.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span
            className={`rounded border px-2.5 py-1 text-xs font-bold font-mono ${
              isDeficit
                ? "bg-red-950/80 text-red-300 border-red-800"
                : "bg-emerald-950/80 text-emerald-300 border-emerald-800"
            }`}
          >
            {gapResult.capacity_status}
          </span>
        </div>
      </div>

      {/* Aggregate Metrics Callouts */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <div className="rounded border border-slate-800 bg-slate-850 p-3">
          <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">
            Total Displaced Demand
          </p>
          <p className="mt-1 text-xl font-bold font-mono text-orange-300">
            {gapResult.total_requiring_relocation.toLocaleString()}
          </p>
          <p className="text-[10px] text-slate-400 mt-0.5">Persons requiring shelter</p>
        </div>

        <div className="rounded border border-slate-800 bg-slate-850 p-3">
          <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">
            Total Safe Capacity
          </p>
          <p className="mt-1 text-xl font-bold font-mono text-emerald-400">
            {gapResult.total_available_capacity.toLocaleString()}
          </p>
          <p className="text-[10px] text-slate-400 mt-0.5">Safe Highland Headroom</p>
        </div>

        <div className="rounded border border-slate-800 bg-slate-850 p-3">
          <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">
            Net Regional Balance
          </p>
          <p className={`mt-1 text-xl font-bold font-mono ${isDeficit ? "text-red-400" : "text-emerald-400"}`}>
            {isDeficit ? `-${gapResult.capacity_deficit.toLocaleString()}` : `+${(gapResult.total_available_capacity - gapResult.total_requiring_relocation).toLocaleString()}`}
          </p>
          <p className="text-[10px] text-slate-400 mt-0.5">{isDeficit ? "Shortfall deficit" : "Surplus headroom"}</p>
        </div>

        <div className="rounded border border-slate-800 bg-slate-850 p-3">
          <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">
            Regional Intake Rate
          </p>
          <p className="mt-1 text-xl font-bold font-mono text-sky-400">
            {coveragePct}%
          </p>
          <p className="text-[10px] text-slate-400 mt-0.5">Capacity demand ratio</p>
        </div>
      </div>

      {/* Capacity Deficit Warning Callout */}
      {isDeficit && (
        <div className="rounded border border-red-800/80 bg-red-950/40 p-3.5 flex flex-wrap items-center justify-between gap-3 text-xs">
          <div>
            <b className="text-red-300 font-semibold">Operational Deficit Alert:</b>
            <p className="text-red-200/90 text-[11px] mt-0.5">
              Available safe candidate hubs cannot safely absorb {gapResult.capacity_deficit.toLocaleString()} displaced persons. Additional highland grounds, higher temporary density factors, or inter-district transit corridors required.
            </p>
          </div>
          <span className="rounded bg-red-900/60 px-2 py-1 text-[10px] font-mono font-bold text-red-200 border border-red-700">
            SHORTFALL: {gapResult.capacity_deficit.toLocaleString()}
          </span>
        </div>
      )}

      {/* District-by-District Breakdown Table */}
      <div className="space-y-2.5">
        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300">
          District-by-District Displacement Demand vs. Candidate Safe Capacity
        </h3>

        <div className="overflow-x-auto rounded border border-slate-800">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-800/80 text-slate-400 uppercase text-[10px]">
              <tr>
                <th className="p-3">District</th>
                <th className="p-3">Displaced Demand</th>
                <th className="p-3">Safe Headroom</th>
                <th className="p-3">Net District Balance</th>
                <th className="p-3">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800 bg-slate-900/60">
              {gapResult.district_breakdown.map((row) => {
                const isDistrictDeficit = row.gap > 0;
                return (
                  <tr key={row.district} className="hover:bg-slate-850 transition">
                    <td className="p-3 font-semibold text-slate-100">{row.district}</td>
                    <td className="p-3 font-mono text-orange-300">{row.population_demanding.toLocaleString()}</td>
                    <td className="p-3 font-mono text-emerald-400">{row.available_capacity.toLocaleString()}</td>
                    <td className={`p-3 font-mono font-bold ${isDistrictDeficit ? "text-red-400" : "text-emerald-400"}`}>
                      {isDistrictDeficit ? `-${row.gap.toLocaleString()}` : `+${Math.abs(row.gap).toLocaleString()}`}
                    </td>
                    <td className="p-3">
                      <span
                        className={`rounded px-2 py-0.5 text-[10px] font-semibold ${
                          isDistrictDeficit
                            ? "bg-red-950 text-red-300 border border-red-800"
                            : "bg-emerald-950 text-emerald-300 border border-emerald-800"
                        }`}
                      >
                        {isDistrictDeficit ? "Deficit" : "Sufficient"}
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
