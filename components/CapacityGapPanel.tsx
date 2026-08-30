"use client";

import { useState } from "react";
import type { CapacityGapResult } from "@/lib/types";

interface CapacityGapPanelProps {
  gapResult: CapacityGapResult;
}

export function CapacityGapPanel({ gapResult }: CapacityGapPanelProps) {
  const [expandedDistricts, setExpandedDistricts] = useState<Record<string, boolean>>({});

  const toggleDistrict = (district: string) => {
    setExpandedDistricts((prev) => ({ ...prev, [district]: !prev[district] }));
  };

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
    <section className="space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800 pb-3">
        <div>
          <h2 className="text-base font-semibold text-white">
            Regional Relocation Capacity Gap Analysis
          </h2>
          <p className="text-xs text-slate-400">
            Aggregate comparison of total displaced population requiring relocation versus safe highland candidate shelter headroom.
          </p>
        </div>

        <span
          className={`rounded border px-2.5 py-1 text-xs font-mono font-medium ${
            isDeficit
              ? "bg-red-950/60 text-red-300 border-red-800/80"
              : "bg-emerald-950/60 text-emerald-300 border-emerald-800/80"
          }`}
        >
          {gapResult.capacity_status}
        </span>
      </div>

      {/* Aggregate Metrics Callouts - Uniform restrained cards */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <div className="rounded border border-slate-800 bg-slate-900 p-4 space-y-1">
          <span className="text-xs text-slate-400 font-medium">Total Displaced Demand</span>
          <p className="text-2xl font-bold font-mono text-white">
            {gapResult.total_requiring_relocation.toLocaleString()}
          </p>
          <span className="text-[11px] text-slate-500 block">Persons requiring shelter</span>
        </div>

        <div className="rounded border border-slate-800 bg-slate-900 p-4 space-y-1">
          <span className="text-xs text-slate-400 font-medium">Total Safe Capacity</span>
          <p className="text-2xl font-bold font-mono text-white">
            {gapResult.total_available_capacity.toLocaleString()}
          </p>
          <span className="text-[11px] text-slate-500 block">Candidate site headroom</span>
        </div>

        <div className="rounded border border-slate-800 bg-slate-900 p-4 space-y-1">
          <span className="text-xs text-slate-400 font-medium">Net Regional Balance</span>
          <p className={`text-2xl font-bold font-mono ${isDeficit ? "text-red-400" : "text-emerald-400"}`}>
            {isDeficit ? `-${gapResult.capacity_deficit.toLocaleString()}` : `+${(gapResult.total_available_capacity - gapResult.total_requiring_relocation).toLocaleString()}`}
          </p>
          <span className="text-[11px] text-slate-500 block">{isDeficit ? "Shortfall deficit" : "Surplus headroom"}</span>
        </div>

        <div className="rounded border border-slate-800 bg-slate-900 p-4 space-y-1">
          <span className="text-xs text-slate-400 font-medium">Regional Intake Rate</span>
          <p className="text-2xl font-bold font-mono text-white">
            {coveragePct}%
          </p>
          <span className="text-[11px] text-slate-500 block">Capacity demand ratio</span>
        </div>
      </div>

      {/* Capacity Deficit Warning Callout */}
      {isDeficit && (
        <div className="rounded border border-red-800/80 bg-red-950/40 p-4 flex flex-wrap items-center justify-between gap-3 text-xs">
          <div>
            <b className="text-red-300 font-medium">Operational Deficit Alert:</b>
            <p className="text-red-200/90 text-xs mt-0.5">
              Available safe candidate hubs cannot safely absorb {gapResult.capacity_deficit.toLocaleString()} displaced persons. Additional highland grounds, higher temporary density factors, or inter-district transit corridors required.
            </p>
          </div>
          <span className="rounded bg-red-900/60 px-2 py-1 text-xs font-mono font-semibold text-red-200 border border-red-700">
            SHORTFALL: {gapResult.capacity_deficit.toLocaleString()}
          </span>
        </div>
      )}

      {/* District Breakdown Table */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-300">
            District Displacement Demand vs. Candidate Safe Capacity
          </h3>
          <span className="text-xs text-slate-500">Click any row to inspect district balance</span>
        </div>

        <div className="overflow-x-auto rounded border border-slate-800">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-900 text-slate-400 uppercase text-[10px] border-b border-slate-800">
              <tr>
                <th className="p-3">District</th>
                <th className="p-3">Displaced Demand</th>
                <th className="p-3">Safe Headroom</th>
                <th className="p-3">Net District Balance</th>
                <th className="p-3">Status</th>
                <th className="p-3 text-right">Details</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800 bg-slate-900/40">
              {gapResult.district_breakdown.map((row) => {
                const isDistrictDeficit = row.gap > 0;
                const isExpanded = !!expandedDistricts[row.district];

                return (
                  <tr
                    key={row.district}
                    onClick={() => toggleDistrict(row.district)}
                    className="cursor-pointer hover:bg-slate-850/60 transition"
                  >
                    <td className="p-3 font-medium text-white">{row.district}</td>
                    <td className="p-3 font-mono text-slate-200">{row.population_demanding.toLocaleString()}</td>
                    <td className="p-3 font-mono text-emerald-400">{row.available_capacity.toLocaleString()}</td>
                    <td className={`p-3 font-mono font-semibold ${isDistrictDeficit ? "text-red-400" : "text-emerald-400"}`}>
                      {isDistrictDeficit ? `-${row.gap.toLocaleString()}` : `+${Math.abs(row.gap).toLocaleString()}`}
                    </td>
                    <td className="p-3">
                      <span
                        className={`rounded px-2 py-0.5 text-[10px] font-medium ${
                          isDistrictDeficit
                            ? "bg-red-950/80 text-red-300 border border-red-800/80"
                            : "bg-emerald-950/80 text-emerald-300 border border-emerald-800/80"
                        }`}
                      >
                        {isDistrictDeficit ? "Deficit" : "Sufficient"}
                      </span>
                    </td>
                    <td className="p-3 text-right text-xs text-slate-400">
                      {isExpanded ? "▲ Hide" : "▼ Details"}
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
