"use client";

import { useState } from "react";
import type { ResourceStatus, SiteResourceGap } from "@/lib/types";

interface ResourceGapPanelProps {
  siteGaps: SiteResourceGap[];
}

const statusBadgeStyles: Record<ResourceStatus, string> = {
  adequate: "bg-emerald-950/60 text-emerald-300 border-emerald-800/80",
  warning: "bg-amber-950/60 text-amber-300 border-amber-800/80",
  critical: "bg-red-950/60 text-red-300 border-red-800/80"
};

export function ResourceGapPanel({ siteGaps }: ResourceGapPanelProps) {
  const [selectedSiteId, setSelectedSiteId] = useState<string>(siteGaps[0]?.site_id ?? "");
  const [expandedRows, setExpandedRows] = useState<Record<string, boolean>>({});

  const activeSiteId = siteGaps.some((s) => s.site_id === selectedSiteId)
    ? selectedSiteId
    : siteGaps[0]?.site_id ?? "";

  const currentSite = siteGaps.find((s) => s.site_id === activeSiteId) ?? siteGaps[0];

  const toggleRow = (key: string) => {
    setExpandedRows((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  // Aggregate summary counts across all candidate sites
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

  if (!currentSite) {
    return (
      <div className="p-4 text-xs text-slate-400">
        No candidate shelter resource inventory records available.
      </div>
    );
  }

  // Construct structured rows for the current site
  const pop = currentSite.population;
  const commodityRows = [
    {
      id: "water",
      name: "Drinking Water (Potable)",
      norm: "50 Litres / person / day (Sphere Standards + Buffer)",
      required: `${(pop * 50).toLocaleString()} Litres/day`,
      available: `${Math.round(pop * 50 * (currentSite.water_coverage_pct / 100)).toLocaleString()} Litres`,
      coverage: currentSite.water_coverage_pct,
      status: currentSite.statuses.water,
      deficit: currentSite.deficits.water_litres > 0 ? `-${currentSite.deficits.water_litres.toLocaleString()} L/day` : "Surplus",
      action: currentSite.deficits.water_litres > 0
        ? `Deploy PHE water bowsers to replenish ${currentSite.deficits.water_litres.toLocaleString()} L/day.`
        : "Current water buffer meets 7-day emergency operational standard."
    },
    {
      id: "food",
      name: "Food Rations (Dry Meals)",
      norm: "3 Ready-to-Eat (RTE) meals / person / day",
      required: `${(pop * 3).toLocaleString()} Meals/day`,
      available: `${Math.round(pop * 3 * (currentSite.food_coverage_pct / 100)).toLocaleString()} Meals`,
      coverage: currentSite.food_coverage_pct,
      status: currentSite.statuses.food,
      deficit: currentSite.deficits.meals_per_day > 0 ? `-${currentSite.deficits.meals_per_day.toLocaleString()} Meals/day` : "Surplus",
      action: currentSite.deficits.meals_per_day > 0
        ? `Procure ${currentSite.deficits.meals_per_day.toLocaleString()} additional daily meal rations from FCS&CA buffer.`
        : "Food ration stocks sufficient for planned intake."
    },
    {
      id: "medical",
      name: "Medical Teams & Triage",
      norm: "1 Medical Team per 1,000 displaced persons",
      required: `${Math.ceil(pop / 1000)} Triage Teams`,
      available: `${Math.round(Math.ceil(pop / 1000) * (currentSite.medical_coverage_pct / 100))} Teams`,
      coverage: currentSite.medical_coverage_pct,
      status: currentSite.statuses.medical,
      deficit: currentSite.deficits.medical_teams > 0 ? `-${currentSite.deficits.medical_teams} Teams` : "Surplus",
      action: currentSite.deficits.medical_teams > 0
        ? `Deploy ${currentSite.deficits.medical_teams} additional medical/triage team(s) from District Civil Hospital.`
        : "Medical personnel deployed and operational on site."
    },
    {
      id: "shelter",
      name: "Shelter Units & Bedding",
      norm: "1 Family Tent unit per 5 displaced persons",
      required: `${Math.ceil(pop / 5).toLocaleString()} Shelter Units`,
      available: `${Math.round(Math.ceil(pop / 5) * (currentSite.shelter_coverage_pct / 100)).toLocaleString()} Units`,
      coverage: currentSite.shelter_coverage_pct,
      status: currentSite.statuses.shelter,
      deficit: currentSite.deficits.shelter_units > 0 ? `-${currentSite.deficits.shelter_units} Units` : "Surplus",
      action: currentSite.deficits.shelter_units > 0
        ? `Mobilize ${currentSite.deficits.shelter_units} high-capacity family shelter tents from SDRF cache.`
        : "Shelter structures adequate for assigned displaced capacity."
    },
    {
      id: "sanitation",
      name: "Sanitation & Latrine Units",
      norm: "1 Toilet/Hygiene unit per 20 persons (Sphere Guidelines)",
      required: `${Math.ceil(pop / 20).toLocaleString()} Latrine Units`,
      available: `${Math.round(Math.ceil(pop / 20) * (currentSite.sanitation_coverage_pct / 100)).toLocaleString()} Units`,
      coverage: currentSite.sanitation_coverage_pct,
      status: currentSite.statuses.sanitation,
      deficit: currentSite.deficits.sanitation_units > 0 ? `-${currentSite.deficits.sanitation_units} Units` : "Surplus",
      action: currentSite.deficits.sanitation_units > 0
        ? `Add ${currentSite.deficits.sanitation_units} portable latrine/WASH units to meet Sphere sanitation standards.`
        : "Sanitation ratios conform to minimum public health requirements."
    },
    {
      id: "electricity",
      name: "Emergency Power & Gen-sets",
      norm: "1 Heavy Gen-set per 1,000 persons capacity",
      required: `${Math.ceil(pop / 1000)} Power Units`,
      available: `${Math.round(Math.ceil(pop / 1000) * (currentSite.electricity_coverage_pct / 100))} Units`,
      coverage: currentSite.electricity_coverage_pct,
      status: currentSite.statuses.electricity,
      deficit: currentSite.electricity_coverage_pct < 100 ? "Shortfall" : "Adequate",
      action: currentSite.electricity_coverage_pct < 100
        ? "Mobilize standby diesel generators for emergency lighting and medical refrigeration."
        : "Primary and backup electrical power lines operational."
    }
  ];

  return (
    <section className="space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800 pb-3">
        <div>
          <h2 className="text-base font-semibold text-white">
            Relief Resource Sufficiency Matrix
          </h2>
          <p className="text-xs text-slate-400">
            Sphere Minimum Standards & NDRF norms: Drinking Water (50L/p/d), Food (3 meals/d), Medical Triage, Sanitation, and Backup Power.
          </p>
        </div>

        {/* Global Summary Badges */}
        <div className="flex items-center gap-2 text-xs">
          <span className="rounded border border-red-800/80 bg-red-950/60 px-2 py-0.5 font-mono font-medium text-red-300">
            {criticalCount} Critical Deficits
          </span>
          <span className="rounded border border-amber-800/80 bg-amber-950/60 px-2 py-0.5 font-mono font-medium text-amber-300">
            {warningCount} Warnings
          </span>
          <span className="rounded border border-emerald-800/80 bg-emerald-950/60 px-2 py-0.5 font-mono font-medium text-emerald-300">
            {adequateCount} Adequate
          </span>
        </div>
      </div>

      {/* Shelter Site Selector Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 rounded border border-slate-800 bg-slate-900 p-3">
        <div className="flex items-center gap-2 text-xs">
          <label className="text-slate-400">Inspect Relocation Site:</label>
          <select
            value={activeSiteId}
            onChange={(e) => setSelectedSiteId(e.target.value)}
            className="rounded border border-slate-700 bg-slate-850 px-2.5 py-1 text-xs text-slate-100 focus:border-slate-500 focus:outline-none"
          >
            {siteGaps.map((s) => (
              <option key={s.site_id} value={s.site_id}>
                {s.site_name} (Intake: {s.population.toLocaleString()} people)
              </option>
            ))}
          </select>
        </div>

        <div className="text-xs text-slate-400">
          Intake Target: <b className="font-mono text-white">{pop.toLocaleString()} persons</b>
        </div>
      </div>

      {/* Operational Table */}
      <div className="overflow-x-auto rounded border border-slate-800">
        <table className="w-full text-left text-xs text-slate-300">
          <thead className="bg-slate-900 text-slate-400 uppercase text-[10px] border-b border-slate-800">
            <tr>
              <th className="p-3">Lifeline Commodity</th>
              <th className="p-3">Required Demand</th>
              <th className="p-3">Available Stock</th>
              <th className="p-3">Net Balance / Gap</th>
              <th className="p-3">Coverage Ratio</th>
              <th className="p-3">Status</th>
              <th className="p-3 text-right">Logistics Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800 bg-slate-900/40">
            {commodityRows.map((row) => {
              const isExpanded = !!expandedRows[row.id];
              return (
                <tr
                  key={row.id}
                  onClick={() => toggleRow(row.id)}
                  className="cursor-pointer hover:bg-slate-850/60 transition"
                >
                  <td className="p-3">
                    <span className="font-semibold text-white block">{row.name}</span>
                    {isExpanded && <span className="text-[11px] text-slate-500 block mt-0.5">{row.norm}</span>}
                  </td>
                  <td className="p-3 font-mono text-slate-200">{row.required}</td>
                  <td className="p-3 font-mono text-slate-300">{row.available}</td>
                  <td className={`p-3 font-mono font-semibold ${row.deficit.startsWith("-") ? "text-red-400" : "text-emerald-400"}`}>
                    {row.deficit}
                  </td>
                  <td className="p-3 font-mono text-slate-200">{row.coverage}%</td>
                  <td className="p-3">
                    <span
                      className={`rounded px-2 py-0.5 text-[9px] font-medium uppercase font-mono ${
                        statusBadgeStyles[row.status]
                      }`}
                    >
                      {row.status}
                    </span>
                  </td>
                  <td className="p-3 text-right text-xs text-slate-400">
                    <span className="block">{isExpanded ? "▲ Hide" : "▼ Action"}</span>
                    {isExpanded && (
                      <span className="text-slate-300 text-xs block mt-1.5 text-left bg-slate-950 p-2.5 rounded border border-slate-800">
                        {row.action}
                      </span>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </section>
  );
}
