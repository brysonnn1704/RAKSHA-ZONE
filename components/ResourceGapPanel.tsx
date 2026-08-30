"use client";

import type { ResourceStatus, SiteResourceGap } from "@/lib/types";

interface ResourceGapPanelProps {
  siteGaps: SiteResourceGap[];
}

const statusBadgeStyles: Record<ResourceStatus, string> = {
  adequate: "bg-emerald-950/80 text-emerald-300 border-emerald-800",
  warning: "bg-amber-950/80 text-amber-300 border-amber-800",
  critical: "bg-red-950/80 text-red-300 border-red-800"
};

export function ResourceGapPanel({ siteGaps }: ResourceGapPanelProps) {
  // Aggregate status counts across all sites
  let criticalCount = 0;
  let warningCount = 0;
  let adequateCount = 0;

  siteGaps.forEach((site) => {
    Object.values(site.statuses).forEach((s) => {
      if (s === "critical") criticalCount++;
      else if (s === "warning") warningCount++;
      else if (s === "adequate") adequateCount++;
    });
  });

  return (
    <section className="rounded-lg border border-slate-800 bg-slate-900/90 p-4 md:p-5 space-y-5">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800 pb-3.5">
        <div>
          <span className="text-[10px] font-bold uppercase tracking-wider text-sky-400">
            Lifeline Relief Logistics & Stock Readiness
          </span>
          <h2 className="text-lg font-bold text-slate-100 mt-0.5">
            Resource Gap & Stock Sufficiency Matrix
          </h2>
          <p className="text-xs text-slate-400">
            Sphere Minimum Standards & NDRF operational norms: Drinking Water (50L/p/d), Food Rations (3 meals/d), Medical Triage, Sanitation, and Backup Power.
          </p>
        </div>

        {/* Global Summary Badges */}
        <div className="flex items-center gap-2 text-xs">
          <span className="rounded border border-red-800 bg-red-950/80 px-2 py-1 font-mono font-semibold text-red-300">
            {criticalCount} Critical Deficits
          </span>
          <span className="rounded border border-amber-800 bg-amber-950/80 px-2 py-1 font-mono font-semibold text-amber-300">
            {warningCount} Warnings
          </span>
          <span className="rounded border border-emerald-800 bg-emerald-950/80 px-2 py-1 font-mono font-semibold text-emerald-300">
            {adequateCount} Adequate
          </span>
        </div>
      </div>

      {/* Threshold Reference Legend */}
      <div className="flex flex-wrap items-center gap-4 text-xs rounded border border-slate-800 bg-slate-850 p-2.5">
        <span className="text-slate-400 font-medium">Standard Coverage Thresholds:</span>
        <span className="flex items-center gap-1.5 text-emerald-300">
          <span className="h-2 w-2 rounded-full bg-emerald-500" /> Adequate (≥ 120% target)
        </span>
        <span className="flex items-center gap-1.5 text-amber-300">
          <span className="h-2 w-2 rounded-full bg-amber-500" /> Warning Buffer (80% – 119%)
        </span>
        <span className="flex items-center gap-1.5 text-red-300">
          <span className="h-2 w-2 rounded-full bg-red-500" /> Critical Deficit (&lt; 80%)
        </span>
      </div>

      {/* Site-by-Site Matrix */}
      <div className="space-y-4">
        {siteGaps.map((site) => {
          return (
            <div
              key={site.site_id}
              className="rounded-md border border-slate-800 bg-slate-850 p-4 space-y-3"
            >
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div>
                  <h3 className="text-sm font-bold text-slate-100">{site.site_name}</h3>
                  <p className="text-xs text-slate-400">
                    Allocated Population Intake:{" "}
                    <b className="font-mono text-slate-200">
                      {site.population.toLocaleString()} people
                    </b>
                  </p>
                </div>
              </div>

              {/* 6 Lifeline Commodities Grid */}
              <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-6 text-xs">
                {/* 1. Drinking Water */}
                <div className="rounded border border-slate-800 bg-slate-900 p-2.5 space-y-1">
                  <span className="text-[10px] uppercase font-semibold text-slate-400 block">Drinking Water</span>
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-slate-200">{site.water_coverage_pct}%</span>
                    <span className={`rounded border px-1.5 py-0.2 text-[9px] font-semibold uppercase ${statusBadgeStyles[site.statuses.water]}`}>
                      {site.statuses.water}
                    </span>
                  </div>
                </div>

                {/* 2. Food Rations */}
                <div className="rounded border border-slate-800 bg-slate-900 p-2.5 space-y-1">
                  <span className="text-[10px] uppercase font-semibold text-slate-400 block">Food Rations</span>
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-slate-200">{site.food_coverage_pct}%</span>
                    <span className={`rounded border px-1.5 py-0.2 text-[9px] font-semibold uppercase ${statusBadgeStyles[site.statuses.food]}`}>
                      {site.statuses.food}
                    </span>
                  </div>
                </div>

                {/* 3. Medical Teams */}
                <div className="rounded border border-slate-800 bg-slate-900 p-2.5 space-y-1">
                  <span className="text-[10px] uppercase font-semibold text-slate-400 block">Medical Teams</span>
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-slate-200">{site.medical_coverage_pct}%</span>
                    <span className={`rounded border px-1.5 py-0.2 text-[9px] font-semibold uppercase ${statusBadgeStyles[site.statuses.medical]}`}>
                      {site.statuses.medical}
                    </span>
                  </div>
                </div>

                {/* 4. Shelter Units */}
                <div className="rounded border border-slate-800 bg-slate-900 p-2.5 space-y-1">
                  <span className="text-[10px] uppercase font-semibold text-slate-400 block">Shelter Units</span>
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-slate-200">{site.shelter_coverage_pct}%</span>
                    <span className={`rounded border px-1.5 py-0.2 text-[9px] font-semibold uppercase ${statusBadgeStyles[site.statuses.shelter]}`}>
                      {site.statuses.shelter}
                    </span>
                  </div>
                </div>

                {/* 5. Sanitation */}
                <div className="rounded border border-slate-800 bg-slate-900 p-2.5 space-y-1">
                  <span className="text-[10px] uppercase font-semibold text-slate-400 block">Sanitation Units</span>
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-slate-200">{site.sanitation_coverage_pct}%</span>
                    <span className={`rounded border px-1.5 py-0.2 text-[9px] font-semibold uppercase ${statusBadgeStyles[site.statuses.sanitation]}`}>
                      {site.statuses.sanitation}
                    </span>
                  </div>
                </div>

                {/* 6. Power Backup */}
                <div className="rounded border border-slate-800 bg-slate-900 p-2.5 space-y-1">
                  <span className="text-[10px] uppercase font-semibold text-slate-400 block">Power Gen-sets</span>
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-slate-200">{site.electricity_coverage_pct}%</span>
                    <span className={`rounded border px-1.5 py-0.2 text-[9px] font-semibold uppercase ${statusBadgeStyles[site.statuses.electricity]}`}>
                      {site.statuses.electricity}
                    </span>
                  </div>
                </div>
              </div>

              {/* Model-Derived Priority Actions */}
              {site.priority_actions.length > 0 && (
                <div className="rounded bg-slate-900/90 p-3 border border-slate-800 space-y-1.5">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                    Recommended Operational Actions
                  </p>
                  <ul className="space-y-1 text-xs">
                    {site.priority_actions.map((act: string, i: number) => (
                      <li key={i} className="flex items-start gap-2 text-slate-300">
                        <span className="text-sky-400 font-mono">▸</span>
                        <span>{act}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </section>
  );
}
