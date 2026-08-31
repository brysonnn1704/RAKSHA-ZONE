"use client";

import { useMemo, useState } from "react";
import dynamic from "next/dynamic";
import type { CapacityGapResult, RegionId, VillageAssessment, VillageFeature } from "@/lib/types";
import type { RelocationPlan } from "@/lib/planning";
import { useRoadRoute } from "@/hooks/useRoadRoute";
import { usePredictiveRisk } from "@/hooks/usePredictiveRisk";

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

  const selectedFeature = features.find((f) => f.properties.id === selectedId);

  // Predictive Red-Zone Risk Screening Hook
  const {
    result: predictiveResult,
    isEnabled: isPredictiveEnabled,
    setIsEnabled: setIsPredictiveEnabled
  } = usePredictiveRisk({ features, region });

  // Determine top relocation candidate destination coordinates [lon, lat]
  const topCandidateCoords: [number, number] | null = useMemo(() => {
    if (!selectedFeature || selectedFeature.properties.role !== "origin") return null;

    const topSmart = assessment?.smart_relocation_options?.[0];
    if (topSmart?.coordinates) {
      return topSmart.coordinates;
    }

    if (plan?.allocation?.allocations?.[0]) {
      const topAllocSiteId = plan.allocation.allocations[0].site_id;
      const topSiteFeature = features.find((f) => f.properties.id === topAllocSiteId);
      if (topSiteFeature) {
        return topSiteFeature.geometry.coordinates;
      }
    }

    if (candidateFeatures[0]) {
      return candidateFeatures[0].geometry.coordinates;
    }

    return null;
  }, [selectedFeature, assessment, plan, features, candidateFeatures]);

  // Hook into OSRM road routing engine with graceful fallback
  const originCoords = selectedFeature ? selectedFeature.geometry.coordinates : null;
  const {
    route,
    isLoading: isLoadingRoute,
    error: routeError,
    activeGeometryCoords,
    alternativeGeometries,
    activeStats,
    selectedAlternativeIndex,
    setSelectedAlternativeIndex,
    refetch: refetchRoadRoute
  } = useRoadRoute({
    origin: originCoords,
    destination: topCandidateCoords,
    enabled: !!originCoords && !!topCandidateCoords,
    alternatives: true
  });

  // Region subtitle for KPI 1
  const corridorSubtitle =
    region === "assam"
      ? "Brahmaputra flood basin"
      : region === "nepal"
      ? "Rasuwa–Trishuli corridor"
      : "Meppadi / Chooralmala sector";

  const topDestinationName =
    assessment?.smart_relocation_options?.[0]?.site_name ??
    plan?.allocation?.allocations?.[0]?.site_name ??
    candidateFeatures[0]?.properties.name ??
    "Designated Safe Hub";

  const geodesicDistKm =
    assessment?.smart_relocation_options?.[0]?.distance_km ??
    route?.geodesic_distance_km ??
    0;

  const isRoadRouteActive = !!(route && route.status === "success" && activeStats);

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
        {/* Left: GIS Map with Real Road Network Route & Predictive Screening */}
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
            roadRouteCoords={activeGeometryCoords}
            alternativeRouteCoords={alternativeGeometries}
            routeStats={
              activeStats
                ? {
                    distance_km: activeStats.distance_km,
                    duration_minutes: activeStats.duration_minutes,
                    isRoadRoute: isRoadRouteActive,
                    summary: activeStats.summary,
                    source: route?.source
                  }
                : null
            }
            isLoadingRoute={isLoadingRoute}
            predictiveResult={predictiveResult}
            showPredictiveRisk={isPredictiveEnabled}
            onTogglePredictiveRisk={setIsPredictiveEnabled}
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
                  {topDestinationName}
                </span>
              </div>
            </div>

            {/* Real Road Network Routing Telemetry Box */}
            <div className="rounded-lg border border-sky-200 bg-sky-50/60 p-3 space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <span className="flex h-2 w-2 rounded-full bg-sky-600" />
                  <span className="text-[11px] font-bold uppercase tracking-wider text-sky-950 font-mono">
                    Relocation Road Route
                  </span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span
                    className={`rounded px-1.5 py-0.2 text-[9px] font-bold uppercase font-mono border ${
                      isRoadRouteActive
                        ? "bg-emerald-100 text-emerald-800 border-emerald-300"
                        : "bg-amber-100 text-amber-800 border-amber-300"
                    }`}
                  >
                    {isRoadRouteActive ? "OSRM Highway Route" : "Geodesic Fallback"}
                  </span>
                  <button
                    type="button"
                    onClick={() => refetchRoadRoute()}
                    title="Recalculate route via OSRM"
                    className="text-slate-400 hover:text-sky-700 text-xs transition"
                  >
                    ↻
                  </button>
                </div>
              </div>

              {isLoadingRoute ? (
                <div className="flex items-center gap-2 text-xs text-slate-600 py-1">
                  <span className="h-2 w-2 rounded-full bg-sky-500 animate-ping" />
                  <span>Calculating actual road network path...</span>
                </div>
              ) : isRoadRouteActive && activeStats ? (
                <div className="space-y-1.5 text-xs text-slate-800">
                  <div className="grid grid-cols-2 gap-2">
                    <div className="bg-white/80 rounded border border-sky-100 p-2">
                      <span className="text-[10px] text-slate-500 block">Road Distance</span>
                      <b className="font-mono text-sky-950 text-sm">{activeStats.distance_km} km</b>
                      <span className="text-[10px] text-slate-500 block mt-0.5">
                        (Geodesic: {geodesicDistKm} km)
                      </span>
                    </div>
                    <div className="bg-white/80 rounded border border-sky-100 p-2">
                      <span className="text-[10px] text-slate-500 block">Estimated Transit Time</span>
                      <b className="font-mono text-emerald-800 text-sm">
                        {activeStats.duration_minutes !== null ? `~${activeStats.duration_minutes} min` : "Calculating"}
                      </b>
                      <span className="text-[10px] text-slate-500 block mt-0.5">
                        Via {activeStats.summary || "Main Road"}
                      </span>
                    </div>
                  </div>

                  {/* Alternative Routes Selector (if multiple available) */}
                  {route?.alternatives && route.alternatives.length > 0 && (
                    <div className="pt-1.5 border-t border-sky-200/60 flex items-center gap-1.5 flex-wrap">
                      <span className="text-[10px] font-bold text-slate-600">Routes:</span>
                      <button
                        type="button"
                        onClick={() => setSelectedAlternativeIndex(0)}
                        className={`px-2 py-0.5 rounded text-[10px] font-mono font-medium border transition ${
                          selectedAlternativeIndex === 0
                            ? "bg-sky-600 text-white border-sky-600 shadow-2xs font-bold"
                            : "bg-white text-slate-700 border-slate-300 hover:bg-slate-100"
                        }`}
                      >
                        Route 1 ({route.distance_km} km • {route.duration_minutes}m)
                      </button>
                      {route.alternatives.map((alt, idx) => (
                        <button
                          key={alt.id}
                          type="button"
                          onClick={() => setSelectedAlternativeIndex(idx + 1)}
                          className={`px-2 py-0.5 rounded text-[10px] font-mono font-medium border transition ${
                            selectedAlternativeIndex === idx + 1
                              ? "bg-sky-600 text-white border-sky-600 shadow-2xs font-bold"
                              : "bg-white text-slate-700 border-slate-300 hover:bg-slate-100"
                          }`}
                        >
                          Route {idx + 2} ({alt.distance_km} km • {alt.duration_minutes}m)
                        </button>
                      ))}
                    </div>
                  )}

                  <div className="flex items-center justify-between text-[10px] text-slate-500 pt-0.5">
                    <span>Source: {route?.source}</span>
                    <span>Safety: Multi-factor compliant</span>
                  </div>
                </div>
              ) : (
                <div className="space-y-1 text-xs text-slate-600 bg-white/70 p-2 rounded border border-amber-200">
                  <p className="text-[11px] text-amber-800 font-medium">
                    Road route unavailable — approximate geographic connection shown.
                  </p>
                  <p className="text-[11px] text-slate-600">
                    Geodesic distance: <b className="font-mono">{geodesicDistKm} km</b>
                  </p>
                </div>
              )}
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
