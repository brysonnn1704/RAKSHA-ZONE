"use client";

import { useState, type ReactNode } from "react";
import type { FloodStatisticsData } from "@/lib/types";
import { SourceReferenceModal, type SourceReferenceDetails } from "./SourceReferenceModal";

interface AssamOverviewProps {
  floodStats: FloodStatisticsData;
  demandedPopulation: number;
  availableCapacity: number;
  capacityDeficit: number;
  criticalResourceCount: number;
  children?: ReactNode;
}

export function AssamOverview({
  floodStats,
  demandedPopulation,
  availableCapacity,
  capacityDeficit,
  criticalResourceCount,
  children
}: AssamOverviewProps) {
  // Collapsed by default as requested in Task 2
  const [isSituationExpanded, setIsSituationExpanded] = useState(false);
  const [isImpactExpanded, setIsImpactExpanded] = useState(false);

  // Source reference modal state for Task 1
  const [activeSourceDetails, setActiveSourceDetails] = useState<SourceReferenceDetails | null>(null);

  const peakSnapshot = floodStats.historical_snapshots.find(
    (s) => s.date === "2026-08-08"
  ) ?? floodStats.historical_snapshots[1];

  return (
    <section className="space-y-8">
      {/* 1. Tier 1 Primary Decision-Level KPIs — Always visible by default */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {/* 1. Total Affected Population */}
        <div className="rounded border border-slate-800 bg-slate-900 p-4 flex flex-col justify-between space-y-2">
          <span className="text-xs text-slate-400 font-medium">Total Affected Population</span>
          <p className="text-2xl font-bold font-mono text-white tracking-tight">
            {peakSnapshot.affected_population.toLocaleString()}
          </p>
          <span className="text-[11px] text-slate-500">Official ASDMA baseline</span>
        </div>

        {/* 2. Displacement Evacuation Target */}
        <div className="rounded border border-slate-800 bg-slate-900 p-4 flex flex-col justify-between space-y-2">
          <span className="text-xs text-slate-400 font-medium">Displacement Target</span>
          <p className="text-2xl font-bold font-mono text-white tracking-tight">
            {demandedPopulation.toLocaleString()}
          </p>
          <span className="text-[11px] text-slate-500">Requires safe relocation</span>
        </div>

        {/* 3. Candidate Safe Headroom */}
        <div className="rounded border border-slate-800 bg-slate-900 p-4 flex flex-col justify-between space-y-2">
          <span className="text-xs text-slate-400 font-medium">Candidate Safe Headroom</span>
          <p className="text-2xl font-bold font-mono text-white tracking-tight">
            {availableCapacity.toLocaleString()}
          </p>
          <span className="text-[11px] text-slate-500">Capacity across 7 hubs</span>
        </div>

        {/* 4. Net Capacity Gap */}
        <div className="rounded border border-slate-800 bg-slate-900 p-4 flex flex-col justify-between space-y-2">
          <span className="text-xs text-slate-400 font-medium">Net Capacity Gap</span>
          <p className={`text-2xl font-bold font-mono tracking-tight ${capacityDeficit > 0 ? "text-red-400" : "text-emerald-400"}`}>
            {capacityDeficit > 0 ? `-${capacityDeficit.toLocaleString()}` : "Sufficient"}
          </p>
          <span className="text-[11px] text-slate-500">
            {capacityDeficit > 0 ? "Regional safe site shortfall" : "All demand safely absorbed"}
          </span>
        </div>
      </div>

      {/* 2. Map & Selected Habitation Profile (Rendered between KPIs and Accordions) */}
      {children}

      {/* 3. Accordion 1: Situation details — Collapsed by default */}
      <div className="rounded border border-slate-800 bg-slate-900">
        <button
          type="button"
          aria-expanded={isSituationExpanded}
          aria-controls="situation-details-content"
          onClick={() => setIsSituationExpanded(!isSituationExpanded)}
          className="w-full p-4 flex items-center justify-between text-left text-xs font-semibold text-slate-200 hover:text-white hover:bg-slate-850/60 transition"
        >
          <span className="flex items-center gap-2">
            <span className="font-mono text-slate-400">{isSituationExpanded ? "[ − ]" : "[ + ]"}</span>
            <span className="text-sm font-semibold text-white">Situation details</span>
            <span className="text-xs font-normal text-slate-400 hidden sm:inline">— ASDMA SitRep & River Gauge Levels</span>
          </span>
          <span className="text-xs font-mono text-slate-400">{isSituationExpanded ? "Hide ▲" : "Expand ▼"}</span>
        </button>

        {isSituationExpanded && (
          <div id="situation-details-content" className="p-4 border-t border-slate-800 space-y-3">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div className="space-y-1.5 max-w-2xl">
                <p className="text-sm font-semibold text-slate-100 leading-snug">
                  {peakSnapshot.headline}
                </p>
                <div className="flex flex-wrap items-center gap-2 text-xs text-slate-400">
                  <span className="font-medium text-slate-300">ASDMA SitRep</span>
                  <span>•</span>
                  <span className="font-mono text-slate-300">{peakSnapshot.date} ({peakSnapshot.phase})</span>
                  <span>•</span>
                  <button
                    type="button"
                    onClick={() =>
                      setActiveSourceDetails({
                        title: peakSnapshot.source,
                        organization: "Assam State Disaster Management Authority (ASDMA)",
                        date: peakSnapshot.date,
                        sourceUrl: peakSnapshot.source_url,
                        confidence: peakSnapshot.confidence,
                        notes: "Official ASDMA Daily Flood Report document citation for August 2026 monsoon wave."
                      })
                    }
                    className="text-sky-400 hover:underline font-medium cursor-pointer"
                  >
                    {peakSnapshot.source} ↗
                  </button>
                </div>
              </div>

              <div className="text-right text-xs text-slate-400">
                <span className="text-slate-400 block font-medium">Rivers Above Danger Mark:</span>
                <span className="text-slate-200 font-mono block mt-0.5">
                  {peakSnapshot.rivers_above_danger.join(", ")}
                </span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* 4. Accordion 2: Impact & capacity details — Collapsed by default */}
      <div className="rounded border border-slate-800 bg-slate-900">
        <button
          type="button"
          aria-expanded={isImpactExpanded}
          aria-controls="impact-capacity-content"
          onClick={() => setIsImpactExpanded(!isImpactExpanded)}
          className="w-full p-4 flex items-center justify-between text-left text-xs font-semibold text-slate-200 hover:text-white hover:bg-slate-850/60 transition"
        >
          <span className="flex items-center gap-2">
            <span className="font-mono text-slate-400">{isImpactExpanded ? "[ − ]" : "[ + ]"}</span>
            <span className="text-sm font-semibold text-white">Impact & capacity details</span>
            <span className="text-xs font-normal text-slate-400 hidden sm:inline">— Habitations, Relief Camps, Crop Area & Supply Buffers</span>
          </span>
          <span className="text-xs font-mono text-slate-400">{isImpactExpanded ? "Hide ▲" : "Expand ▼"}</span>
        </button>

        {isImpactExpanded && (
          <div id="impact-capacity-content" className="p-4 border-t border-slate-800 space-y-4">
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
              <div className="rounded border border-slate-800 bg-slate-950 p-3 space-y-1">
                <span className="text-xs text-slate-400 font-medium block">Inundated Habitations</span>
                <p className="text-lg font-semibold font-mono text-slate-200">{peakSnapshot.affected_villages_count}</p>
                <span className="text-[11px] text-slate-500 block">Revenue mouzas affected</span>
              </div>

              <div className="rounded border border-slate-800 bg-slate-950 p-3 space-y-1">
                <span className="text-xs text-slate-400 font-medium block">Flood Districts Declared</span>
                <p className="text-lg font-semibold font-mono text-slate-200">{peakSnapshot.affected_districts_count}</p>
                <span className="text-[11px] text-slate-500 block">Official disaster notification</span>
              </div>

              <div className="rounded border border-slate-800 bg-slate-950 p-3 space-y-1">
                <span className="text-xs text-slate-400 font-medium block">Active Relief Centers</span>
                <p className="text-lg font-semibold font-mono text-slate-200">{peakSnapshot.relief_camps_active}</p>
                <span className="text-[11px] text-slate-500 block">+{peakSnapshot.distribution_centers_active} distribution hubs</span>
              </div>

              <div className="rounded border border-slate-800 bg-slate-950 p-3 space-y-1">
                <span className="text-xs text-slate-400 font-medium block">Supply Stock Alerts</span>
                <p className={`text-lg font-semibold font-mono ${criticalResourceCount > 0 ? "text-amber-400" : "text-emerald-400"}`}>
                  {criticalResourceCount > 0 ? `${criticalResourceCount} Critical Deficits` : "Adequate"}
                </p>
                <span className="text-[11px] text-slate-500 block">Lifeline resource buffers</span>
              </div>
            </div>

            {/* Crop area & district notes */}
            <div className="rounded border border-slate-800 bg-slate-950 p-3 flex flex-wrap items-center justify-between gap-2 text-xs text-slate-400">
              <div>
                <span className="font-medium text-slate-300">Agricultural Inundation: </span>
                <span className="font-mono text-slate-200">{peakSnapshot.crop_area_hectares.toLocaleString()} hectares</span>
              </div>
              <div>
                <span className="text-slate-400">13 Active districts: Nagaon, Golaghat, Jorhat, Dhemaji, Sivasagar, Lakhimpur, Sonitpur...</span>
              </div>
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
