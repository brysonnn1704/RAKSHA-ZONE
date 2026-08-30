"use client";

import { useState, type ReactNode } from "react";
import type { FloodStatisticsData } from "@/lib/types";
import { SourceReferenceModal, type SourceReferenceDetails } from "./SourceReferenceModal";
import { NepalCascadePanel } from "./NepalCascadePanel";

interface NepalOverviewProps {
  floodStats: FloodStatisticsData;
  demandedPopulation: number;
  availableCapacity: number;
  capacityDeficit: number;
  criticalResourceCount: number;
  children?: ReactNode;
}

export function NepalOverview({
  floodStats,
  demandedPopulation,
  availableCapacity,
  capacityDeficit,
  criticalResourceCount,
  children
}: NepalOverviewProps) {
  const [isSituationExpanded, setIsSituationExpanded] = useState(false);
  const [isImpactExpanded, setIsImpactExpanded] = useState(false);
  const [activeSourceDetails, setActiveSourceDetails] = useState<SourceReferenceDetails | null>(null);

  const peakSnapshot = floodStats.historical_snapshots.find(
    (s) => s.date === "2026-08-27"
  ) ?? floodStats.historical_snapshots[1];

  return (
    <section className="space-y-6">
      {/* Research & Demonstration Notice Banner */}
      <div className="rounded-lg border border-amber-200 bg-amber-50/80 p-3.5 flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2">
          <span className="rounded bg-amber-100 border border-amber-300 px-2 py-0.5 font-bold font-mono text-amber-800 text-[10px] uppercase">
            Research & Simulation Scenario
          </span>
          <p className="text-amber-900 font-medium">
            Cross-Border Cascading Hazard: High-Altitude Glacier/Rock Collapse → Trishuli River Flash Flood
          </p>
        </div>
        <span className="text-amber-700 font-mono text-[11px]">
          Physical trigger & casualties under multi-agency investigation
        </span>
      </div>

      {/* 1. Tier 1 Primary Decision-Level KPIs — Always visible by default (Light Theme) */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {/* 1. Total Affected Population */}
        <div className="rounded-lg border border-slate-200 bg-white p-4 flex flex-col justify-between space-y-2 shadow-2xs">
          <span className="text-xs text-slate-500 font-medium">Total Affected Corridor Pop</span>
          <p className="text-2xl font-bold font-mono text-slate-900 tracking-tight">
            {peakSnapshot.affected_population.toLocaleString()}
          </p>
          <span className="text-[11px] text-slate-500">Rasuwa, Nuwakot, Dhading & Tibet</span>
        </div>

        {/* 2. Displacement Target */}
        <div className="rounded-lg border border-slate-200 bg-white p-4 flex flex-col justify-between space-y-2 shadow-2xs">
          <span className="text-xs text-slate-500 font-medium">Displacement Target</span>
          <p className="text-2xl font-bold font-mono text-slate-900 tracking-tight">
            {demandedPopulation.toLocaleString()}
          </p>
          <span className="text-[11px] text-slate-500">Requires safe highland evacuation</span>
        </div>

        {/* 3. Candidate Safe Headroom */}
        <div className="rounded-lg border border-slate-200 bg-white p-4 flex flex-col justify-between space-y-2 shadow-2xs">
          <span className="text-xs text-slate-500 font-medium">Candidate Safe Headroom</span>
          <p className="text-2xl font-bold font-mono text-slate-900 tracking-tight">
            {availableCapacity.toLocaleString()}
          </p>
          <span className="text-[11px] text-slate-500">Across 4 safe terrace & ridge hubs</span>
        </div>

        {/* 4. Net Capacity Gap */}
        <div className="rounded-lg border border-slate-200 bg-white p-4 flex flex-col justify-between space-y-2 shadow-2xs">
          <span className="text-xs text-slate-500 font-medium">Net Capacity Gap</span>
          <p className={`text-2xl font-bold font-mono tracking-tight ${capacityDeficit > 0 ? "text-red-600" : "text-emerald-600"}`}>
            {capacityDeficit > 0 ? `-${capacityDeficit.toLocaleString()}` : "Sufficient"}
          </p>
          <span className="text-[11px] text-slate-500">
            {capacityDeficit > 0 ? "Regional safe site deficit" : "All demand absorbed in safe hubs"}
          </span>
        </div>
      </div>

      {/* 2. Cascading Hazard Vector Panel */}
      <NepalCascadePanel />

      {/* 3. Map & Selected Habitation Profile (Rendered between KPIs and Accordions) */}
      {children}

      {/* 4. Accordion 1: Situation details — Collapsed by default */}
      <div className="rounded-lg border border-slate-200 bg-white shadow-2xs">
        <button
          type="button"
          aria-expanded={isSituationExpanded}
          aria-controls="nepal-situation-details"
          onClick={() => setIsSituationExpanded(!isSituationExpanded)}
          className="w-full p-4 flex items-center justify-between text-left text-xs font-semibold text-slate-700 hover:text-slate-900 hover:bg-slate-50 transition"
        >
          <span className="flex items-center gap-2">
            <span className="font-mono text-slate-400">{isSituationExpanded ? "[ − ]" : "[ + ]"}</span>
            <span className="text-sm font-semibold text-slate-900">Situation details</span>
            <span className="text-xs font-normal text-slate-500 hidden sm:inline">— NDRRMA / DHM Telemetry & River Gauge Telemetry</span>
          </span>
          <span className="text-xs font-mono text-slate-500">{isSituationExpanded ? "Hide ▲" : "Expand ▼"}</span>
        </button>

        {isSituationExpanded && (
          <div id="nepal-situation-details" className="p-4 border-t border-slate-100 space-y-3">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div className="space-y-1.5 max-w-2xl">
                <p className="text-sm font-semibold text-slate-900 leading-snug">
                  {peakSnapshot.headline}
                </p>
                <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500">
                  <span className="font-medium text-slate-700">NDRRMA SitRep</span>
                  <span>•</span>
                  <span className="font-mono text-slate-600">{peakSnapshot.date} ({peakSnapshot.phase})</span>
                  <span>•</span>
                  <button
                    type="button"
                    onClick={() =>
                      setActiveSourceDetails({
                        title: peakSnapshot.source,
                        organization: "National Disaster Risk Reduction and Management Authority (NDRRMA) & DHM Nepal",
                        date: peakSnapshot.date,
                        sourceUrl: peakSnapshot.source_url,
                        confidence: "OFFICIAL",
                        notes: "Official river watch and flash flood impact bulletin for the Rasuwa–Trishuli corridor."
                      })
                    }
                    className="text-sky-600 hover:underline font-medium cursor-pointer"
                  >
                    {peakSnapshot.source} ↗
                  </button>
                </div>
              </div>

              <div className="text-right text-xs text-slate-600">
                <span className="text-slate-500 block font-medium">Rivers Above Warning/Danger:</span>
                <span className="text-slate-800 font-mono block mt-0.5">
                  {peakSnapshot.rivers_above_danger.join(", ")}
                </span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* 5. Accordion 2: Impact & capacity details — Collapsed by default */}
      <div className="rounded-lg border border-slate-200 bg-white shadow-2xs">
        <button
          type="button"
          aria-expanded={isImpactExpanded}
          aria-controls="nepal-impact-details"
          onClick={() => setIsImpactExpanded(!isImpactExpanded)}
          className="w-full p-4 flex items-center justify-between text-left text-xs font-semibold text-slate-700 hover:text-slate-900 hover:bg-slate-50 transition"
        >
          <span className="flex items-center gap-2">
            <span className="font-mono text-slate-400">{isImpactExpanded ? "[ − ]" : "[ + ]"}</span>
            <span className="text-sm font-semibold text-slate-900">Impact & capacity details</span>
            <span className="text-xs font-normal text-slate-500 hidden sm:inline">— Corridor Habitations, Relief Staging Camps & Critical Lifelines</span>
          </span>
          <span className="text-xs font-mono text-slate-500">{isImpactExpanded ? "Hide ▲" : "Expand ▼"}</span>
        </button>

        {isImpactExpanded && (
          <div id="nepal-impact-details" className="p-4 border-t border-slate-100 space-y-4">
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
              <div className="rounded border border-slate-200 bg-slate-50 p-3 space-y-1">
                <span className="text-xs text-slate-500 font-medium block">Affected Settlements</span>
                <p className="text-lg font-semibold font-mono text-slate-900">{peakSnapshot.affected_villages_count}</p>
                <span className="text-[11px] text-slate-500 block">Cross-border corridor nodes</span>
              </div>

              <div className="rounded border border-slate-200 bg-slate-50 p-3 space-y-1">
                <span className="text-xs text-slate-500 font-medium block">Districts Impacted</span>
                <p className="text-lg font-semibold font-mono text-slate-900">{peakSnapshot.affected_districts_count}</p>
                <span className="text-[11px] text-slate-500 block">Rasuwa, Nuwakot, Dhading, Gyirong</span>
              </div>

              <div className="rounded border border-slate-200 bg-slate-50 p-3 space-y-1">
                <span className="text-xs text-slate-500 font-medium block">Active Relief Centers</span>
                <p className="text-lg font-semibold font-mono text-slate-900">{peakSnapshot.relief_camps_active}</p>
                <span className="text-[11px] text-slate-500 block">+{peakSnapshot.distribution_centers_active} supply distribution hubs</span>
              </div>

              <div className="rounded border border-slate-200 bg-slate-50 p-3 space-y-1">
                <span className="text-xs text-slate-500 font-medium block">Stock Deficit Alerts</span>
                <p className={`text-lg font-semibold font-mono ${criticalResourceCount > 0 ? "text-amber-700" : "text-emerald-700"}`}>
                  {criticalResourceCount > 0 ? `${criticalResourceCount} Critical Stock Deficits` : "Adequate Readiness"}
                </p>
                <span className="text-[11px] text-slate-500 block">Humanitarian buffer standards</span>
              </div>
            </div>

            {/* Infrastructure and Highway Notes */}
            <div className="rounded border border-slate-200 bg-slate-50 p-3 text-xs text-slate-600 space-y-1">
              <p><b className="text-slate-800">Key Highway Status:</b> Pasang Lhamu Highway (NH-03 / Syapru Besi–Timure sector) severed by landslide deposition and river scouring.</p>
              <p><b className="text-slate-800">Hydropower Status:</b> Rasuwagadhi (111 MW) and Upper Trishuli 3A sustained headworks inundation and heavy silt blockages.</p>
            </div>
          </div>
        )}
      </div>

      {/* Source Reference Modal for graceful document link handling */}
      <SourceReferenceModal
        details={activeSourceDetails}
        onClose={() => setActiveSourceDetails(null)}
      />
    </section>
  );
}
