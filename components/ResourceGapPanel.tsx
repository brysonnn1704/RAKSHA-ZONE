"use client";

import type { SiteResourceGap } from "@/lib/resources";
import type { ResourceStatus } from "@/lib/types";

interface ResourceGapPanelProps {
  siteGaps: SiteResourceGap[];
}

const statusBadge: Record<ResourceStatus, { label: string; className: string }> = {
  adequate: { label: "ADEQUATE", className: "bg-emerald-950/80 text-emerald-300 border-emerald-700" },
  warning: { label: "WARNING", className: "bg-amber-950/80 text-amber-300 border-amber-700" },
  critical: { label: "CRITICAL", className: "bg-red-950/80 text-red-300 border-red-700" }
};

export function ResourceGapPanel({ siteGaps }: ResourceGapPanelProps) {
  return (
    <section className="rounded-xl border border-slate-700 bg-slate-900/70 p-5 space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800 pb-4">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-sky-400">
            Emergency Logistics & Lifeline Support
          </span>
          <h2 className="text-xl font-bold text-slate-100 mt-0.5">
            Resource Gap Analysis & Operational Action List
          </h2>
          <p className="text-xs text-slate-400">
            Site-by-site commodity coverage thresholds evaluated against Sphere Humanitarian Standards.
          </p>
        </div>

        <div className="flex items-center gap-3 text-xs">
          <span className="flex items-center gap-1.5 text-slate-300">
            <span className="h-2 w-2 rounded-full bg-emerald-500" /> &ge;120% (Adequate)
          </span>
          <span className="flex items-center gap-1.5 text-slate-300">
            <span className="h-2 w-2 rounded-full bg-amber-500" /> 80–119% (Warning)
          </span>
          <span className="flex items-center gap-1.5 text-slate-300">
            <span className="h-2 w-2 rounded-full bg-red-500" /> &lt;80% (Critical)
          </span>
        </div>
      </div>

      {/* Site Cards with Resource Matrix & Action Plans */}
      <div className="grid gap-6">
        {siteGaps.map((site) => (
          <div
            key={site.site_id}
            className="rounded-xl border border-slate-800 bg-slate-900/90 p-5 transition hover:border-slate-700"
          >
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-800 pb-3">
              <div>
                <h3 className="text-base font-bold text-slate-100">{site.site_name}</h3>
                <p className="text-xs text-slate-400">
                  Allocated Displaced Load: <b className="text-sky-300">{site.population.toLocaleString()} people</b>
                </p>
              </div>
              <span className="text-xs text-slate-400 font-mono">ID: {site.site_id}</span>
            </div>

            {/* 6 Lifeline Commodities Grid */}
            <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
              {/* Drinking Water */}
              <div className="rounded-lg bg-slate-800/70 p-3 border border-slate-700/60">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-400">💧 Water</span>
                  <span className={`rounded border px-1.5 py-0.2 text-[9px] font-bold ${statusBadge[site.statuses.water].className}`}>
                    {statusBadge[site.statuses.water].label}
                  </span>
                </div>
                <p className="mt-2 text-lg font-bold font-mono text-slate-100">{site.water_coverage_pct}%</p>
                <p className="text-[10px] text-slate-400">50 L/person/day</p>
              </div>

              {/* Food / Meals */}
              <div className="rounded-lg bg-slate-800/70 p-3 border border-slate-700/60">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-400">🍲 Food</span>
                  <span className={`rounded border px-1.5 py-0.2 text-[9px] font-bold ${statusBadge[site.statuses.food].className}`}>
                    {statusBadge[site.statuses.food].label}
                  </span>
                </div>
                <p className="mt-2 text-lg font-bold font-mono text-slate-100">{site.food_coverage_pct}%</p>
                <p className="text-[10px] text-slate-400">3 meals/day</p>
              </div>

              {/* Medical Teams */}
              <div className="rounded-lg bg-slate-800/70 p-3 border border-slate-700/60">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-400">🚑 Medical</span>
                  <span className={`rounded border px-1.5 py-0.2 text-[9px] font-bold ${statusBadge[site.statuses.medical].className}`}>
                    {statusBadge[site.statuses.medical].label}
                  </span>
                </div>
                <p className="mt-2 text-lg font-bold font-mono text-slate-100">{site.medical_coverage_pct}%</p>
                <p className="text-[10px] text-slate-400">1 team/1000 pop</p>
              </div>

              {/* Shelter */}
              <div className="rounded-lg bg-slate-800/70 p-3 border border-slate-700/60">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-400">⛺ Shelter</span>
                  <span className={`rounded border px-1.5 py-0.2 text-[9px] font-bold ${statusBadge[site.statuses.shelter].className}`}>
                    {statusBadge[site.statuses.shelter].label}
                  </span>
                </div>
                <p className="mt-2 text-lg font-bold font-mono text-slate-100">{site.shelter_coverage_pct}%</p>
                <p className="text-[10px] text-slate-400">5 people/unit</p>
              </div>

              {/* Sanitation / Latrines */}
              <div className="rounded-lg bg-slate-800/70 p-3 border border-slate-700/60">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-400">🚻 Sanitation</span>
                  <span className={`rounded border px-1.5 py-0.2 text-[9px] font-bold ${statusBadge[site.statuses.sanitation].className}`}>
                    {statusBadge[site.statuses.sanitation].label}
                  </span>
                </div>
                <p className="mt-2 text-lg font-bold font-mono text-slate-100">{site.sanitation_coverage_pct}%</p>
                <p className="text-[10px] text-slate-400">20 people/toilet</p>
              </div>

              {/* Electricity & Grid */}
              <div className="rounded-lg bg-slate-800/70 p-3 border border-slate-700/60">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-400">⚡ Power</span>
                  <span className={`rounded border px-1.5 py-0.2 text-[9px] font-bold ${statusBadge[site.statuses.electricity].className}`}>
                    {statusBadge[site.statuses.electricity].label}
                  </span>
                </div>
                <p className="mt-2 text-lg font-bold font-mono text-slate-100">{site.electricity_coverage_pct}%</p>
                <p className="text-[10px] text-slate-400">Gen-Set & Solar</p>
              </div>
            </div>

            {/* Model-Derived Priority Action List */}
            <div className="mt-4 rounded-lg bg-slate-950/60 p-3 border border-slate-800">
              <h4 className="text-xs font-semibold uppercase tracking-wider text-amber-300 flex items-center gap-1.5">
                <span>📋</span> Priority Operational Actions
              </h4>
              <ul className="mt-2 space-y-1 text-xs text-slate-300 list-disc list-inside">
                {site.priority_actions.map((act, i) => (
                  <li key={i}>{act}</li>
                ))}
              </ul>
              <p className="mt-2 text-[10px] text-slate-500 italic">
                * Model-derived planning recommendations for relief coordinators; not an official government dispatch order.
              </p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
