"use client";

import { useState } from "react";
import dynamic from "next/dynamic";
import type { CapacityGapResult, RegionId, VillageAssessment, VillageFeature } from "@/lib/types";
import type { RelocationPlan } from "@/lib/planning";

const MapView = dynamic(() => import("./MapView").then((m) => m.MapView), {
  ssr: false,
  loading: () => <div className="h-[520px] rounded-lg bg-slate-100 animate-pulse border border-slate-200" />
});

interface CommandCenterProps {
  region: RegionId;
  features: VillageFeature[];
  assessments: VillageAssessment[];
  selectedId: string;
  onSelectOrigin: (id: string) => void;
  plan?: RelocationPlan;
  assessment?: VillageAssessment;
  requiredPop: number;
  capacityGapResult: CapacityGapResult;
  priorityTitle: string;
  onOpenRelocation: () => void;
}

export function CommandCenter({
  region,
  features,
  assessments,
  selectedId,
  onSelectOrigin,
  plan,
  assessment,
  requiredPop,
  capacityGapResult,
  priorityTitle,
  onOpenRelocation
}: CommandCenterProps) {
  const [showAssessmentDetails, setShowAssessmentDetails] = useState(false);

  const originFeatures = features.filter((f) => f.properties.role === "origin");
  const candidateFeatures = features.filter((f) => f.properties.role === "candidate");

  // Region subtitle for KPI 1
  const corridorSubtitle =
    region === "assam"
      ? "Brahmaputra flood basin"
      : region === "nepal"
      ? "Rasuwa–Trishuli corridor"
      : "Meppadi / Chooralmala sector";

  return (
    <div className="space-y-6">
      {/* 1. Canonical 4-Card KPI Row */}
      <div className="grid grid-cols-2 gap-2.5 sm:gap-3 sm:grid-cols-4">
        {/* KPI 1: Origin/Affected Settlements */}
        <div className="rounded-lg border border-slate-200 bg-white p-3.5 sm:p-4 space-y-0.5 sm:space-y-1 shadow-2xs">
          <span className="text-[11px] sm:text-xs text-slate-500 font-medium">Origin Settlements</span>
          <p className="text-xl sm:text-2xl font-bold font-mono text-slate-900">{originFeatures.length}</p>
          <span className="text-[10px] sm:text-[11px] text-slate-500 line-clamp-1">{corridorSubtitle}</span>
        </div>

        {/* KPI 2: Displacement Target */}
        <div className="rounded-lg border border-slate-200 bg-white p-3.5 sm:p-4 space-y-0.5 sm:space-y-1 shadow-2xs">
          <span className="text-[11px] sm:text-xs text-slate-500 font-medium">Displacement Target</span>
          <p className="text-xl sm:text-2xl font-bold font-mono text-slate-900">
            {capacityGapResult.total_requiring_relocation.toLocaleString()}
          </p>
          <span className="text-[10px] sm:text-[11px] text-slate-500 line-clamp-1">Immediate & short-term demand</span>
        </div>

        {/* KPI 3: Candidate Safe Headroom */}
        <div className="rounded-lg border border-slate-200 bg-white p-3.5 sm:p-4 space-y-0.5 sm:space-y-1 shadow-2xs">
          <span className="text-[11px] sm:text-xs text-slate-500 font-medium">Candidate Safe Headroom</span>
          <p className="text-xl sm:text-2xl font-bold font-mono text-slate-900">
            {capacityGapResult.total_available_capacity.toLocaleString()}
          </p>
          <span className="text-[10px] sm:text-[11px] text-slate-500 line-clamp-1">
            Across {candidateFeatures.length} safe candidate hubs
          </span>
        </div>

        {/* KPI 4: Capacity Balance */}
        <div className="rounded-lg border border-slate-200 bg-white p-3.5 sm:p-4 space-y-0.5 sm:space-y-1 shadow-2xs">
          <span className="text-[11px] sm:text-xs text-slate-500 font-medium">Capacity Balance</span>
          <p
            className={`text-xl sm:text-2xl font-bold font-mono ${
              capacityGapResult.capacity_deficit > 0 ? "text-red-600" : "text-emerald-600"
            }`}
          >
            {capacityGapResult.capacity_deficit > 0
              ? `-${capacityGapResult.capacity_deficit.toLocaleString()}`
              : "Sufficient"}
          </p>
          <span className="text-[10px] sm:text-[11px] text-slate-500 line-clamp-1">
            {capacityGapResult.capacity_deficit > 0
              ? "Regional safe site deficit"
              : "Safe carrying capacity headroom"}
          </span>
        </div>
      </div>

      {/* 2. Main Content: Map (Left) + Selected Habitation Profile (Right) */}
      <div className="grid gap-4 sm:gap-5 lg:grid-cols-[1.8fr_1.1fr]">
        {/* Left: GIS Map */}
        <div className="h-[340px] sm:h-[420px] lg:h-[520px] rounded-lg border border-slate-200 overflow-hidden bg-white shadow-2xs">
          <MapView
            features={features}
            assessments={assessments}
            selectedId={selectedId}
            onSelect={(id) => {
              if (features.find((f) => f.properties.id === id)?.properties.role === "origin") {
                onSelectOrigin(id);
              }
            }}
            bhuvanOverlay={false}
            bhuvanLayer={null}
            plan={plan}
            region={region}
          />
        </div>

        {/* Right: Selected Habitation Profile */}
        <section className="rounded-lg border border-slate-200 bg-white p-5 space-y-4 flex flex-col justify-between shadow-2xs">
          <div className="space-y-4">
            {/* Header */}
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
                  Selected Habitation Profile
                </span>
                <h2 className="text-lg font-bold text-slate-900 mt-0.5">{assessment?.name}</h2>
                {assessment?.district && (
                  <p className="text-xs text-slate-500">
                    {assessment.district} ({assessment.country ?? assessment.state ?? (region === "assam" ? "Assam" : region === "nepal" ? "Nepal" : "Kerala")})
                  </p>
                )}
              </div>
              <span
                className={`rounded border px-2.5 py-0.5 text-xs font-mono font-bold ${
                  assessment?.priority_tier === "Immediate"
                    ? "bg-red-50 text-red-700 border-red-200"
                    : assessment?.priority_tier === "Short-term"
                    ? "bg-amber-50 text-amber-700 border-amber-200"
                    : "bg-emerald-50 text-emerald-700 border-emerald-200"
                }`}
              >
                {assessment?.priority_tier} Tier
              </span>
            </div>

            {/* Level 1 Core Metrics */}
            <div className="grid grid-cols-2 gap-3">
              <div className="rounded-lg border border-slate-200 bg-slate-50 p-3 space-y-0.5">
                <span className="text-xs text-slate-500 font-medium block">{priorityTitle}</span>
                <p className="text-xl font-bold font-mono text-slate-900">
                  {assessment?.rps.toFixed(3)}
                </p>
              </div>
              <div className="rounded-lg border border-slate-200 bg-slate-50 p-3 space-y-0.5">
                <span className="text-xs text-slate-500 font-medium block">Evacuation Target</span>
                <p className="text-xl font-bold font-mono text-slate-900">
                  {requiredPop.toLocaleString()}
                </p>
              </div>
            </div>

            {/* Level 2 Secondary Metrics */}
            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="rounded border border-slate-200 bg-slate-50 p-2.5 space-y-0.5">
                <span className="text-slate-500 block">Hazard Severity</span>
                <span className="font-mono text-slate-900 font-bold">
                  HSS: {assessment?.hss.toFixed(2)}
                </span>
              </div>
              <div className="rounded border border-slate-200 bg-slate-50 p-2.5 space-y-0.5">
                <span className="text-slate-500 block">Optimal Destination</span>
                <span className="text-sky-700 font-bold truncate block">
                  {assessment?.smart_relocation_options?.[0]?.site_name ?? "Evaluating..."}
                </span>
              </div>
            </div>

            {/* Level 3 Expandable Details */}
            <div className="border-t border-slate-100 pt-2">
              <button
                type="button"
                onClick={() => setShowAssessmentDetails(!showAssessmentDetails)}
                className="text-xs text-slate-600 hover:text-slate-900 transition font-medium flex items-center justify-between w-full"
              >
                <span>{showAssessmentDetails ? "Hide breakdown ▴" : "Assessment breakdown ▾"}</span>
                <span className="text-[10px] text-slate-400 font-mono">{showAssessmentDetails ? "▲" : "▼"}</span>
              </button>

              {showAssessmentDetails && (
                <div className="mt-2 space-y-1.5 text-xs bg-slate-50 p-3 rounded-lg border border-slate-200 text-slate-700">
                  <div className="flex justify-between">
                    <span className="text-slate-500">Stress Index:</span>
                    <span className="font-mono text-slate-900 font-bold">{assessment?.stress_index.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Normalized Stress:</span>
                    <span className="font-mono text-slate-900 font-bold">{assessment?.normalized_stress.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Vulnerability Index:</span>
                    <span className="font-mono text-slate-900 font-bold">{assessment?.vulnerability_index.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between border-t border-slate-200 pt-1 text-[11px] text-slate-500">
                    <span>Data Provenance:</span>
                    <span className="font-bold text-slate-800">{assessment?.data_confidence ?? "OFFICIAL"}</span>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Action CTA Button */}
          <div className="space-y-2 pt-3 border-t border-slate-100">
            <button
              onClick={onOpenRelocation}
              className="w-full rounded-md bg-slate-900 hover:bg-slate-800 px-3.5 py-2 font-bold text-xs text-white transition shadow-2xs"
            >
              Open Relocation Planner for {assessment?.name} →
            </button>
            <p className="text-[11px] text-slate-500 text-center">
              Multi-criteria destination ranking by distance, safety, and capacity.
            </p>
          </div>
        </section>
      </div>
    </div>
  );
}
