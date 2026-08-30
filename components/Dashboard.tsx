"use client";

import dynamic from "next/dynamic";
import Link from "next/link";
import { useMemo, useState } from "react";
import {
  getAssamFloodStatistics,
  getAssamSiteResources,
  getAssamSources,
  getRegionFeatures
} from "@/lib/data";
import { assessVillages, DEFAULT_WEIGHTS } from "@/lib/scoring";
import { buildRelocationPlan } from "@/lib/planning";
import { calculateCapacityGap } from "@/lib/capacity";
import { computeSiteResourceGaps } from "@/lib/resources";
import type { RegionId, WeightSet } from "@/lib/types";

import { RegionSelector } from "./RegionSelector";
import { AssamOverview } from "./AssamOverview";
import { SmartMatchingPanel } from "./SmartMatchingPanel";
import { CapacityGapPanel } from "./CapacityGapPanel";
import { ResourceGapPanel } from "./ResourceGapPanel";
import { AssamTimelinePanel } from "./AssamTimelinePanel";
import { SourcesPanel } from "./SourcesPanel";

const MapView = dynamic(() => import("./MapView").then((m) => m.MapView), {
  ssr: false,
  loading: () => <div className="h-[520px] rounded bg-slate-900 animate-pulse border border-slate-800" />
});

type TabKey =
  | "overview"
  | "risk_map"
  | "relocation"
  | "capacity"
  | "resources"
  | "priority_villages"
  | "timeline"
  | "sources";

export function Dashboard() {
  const [region, setRegion] = useState<RegionId>("assam");
  const [activeTab, setActiveTab] = useState<TabKey>("overview");
  const [weights, setWeights] = useState<WeightSet>(DEFAULT_WEIGHTS);
  const [multiplier, setMultiplier] = useState(0.9);
  const [density, setDensity] = useState(140);
  const [affectedOverride, setAffectedOverride] = useState<number | null>(null);

  // Progressive disclosure states
  const [showAssessmentDetails, setShowAssessmentDetails] = useState(false);
  const [expandedVillageRows, setExpandedVillageRows] = useState<Record<string, boolean>>({});

  const toggleVillageRow = (id: string) => {
    setExpandedVillageRows((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  // Load features based on active region
  const features = useMemo(() => getRegionFeatures(region), [region]);
  const originFeatures = useMemo(() => features.filter((f) => f.properties.role === "origin"), [features]);
  const candidateFeatures = useMemo(() => features.filter((f) => f.properties.role === "candidate"), [features]);

  // Selected Origin settlement
  const defaultOriginId = region === "assam" ? "assam-nagaon-kaliabor" : "mundakkai";
  const [selectedId, setSelectedId] = useState<string>(defaultOriginId);

  // When region switches, ensure valid selected ID
  const activeSelectedId = originFeatures.some((f) => f.properties.id === selectedId)
    ? selectedId
    : originFeatures[0]?.properties.id ?? defaultOriginId;

  const selectedFeature =
    features.find((f) => f.properties.id === activeSelectedId && f.properties.role === "origin") ??
    originFeatures[0];

  // Assessments for all origin villages
  const assessments = useMemo(() => assessVillages(features, weights), [features, weights]);
  const assessment =
    assessments.find((a) => a.id === selectedFeature?.properties?.id) ?? assessments[0];

  const requiredPop =
    affectedOverride ??
    (selectedFeature?.properties?.affected_population ??
      selectedFeature?.properties?.current_population ??
      500);

  // Build relocation plan
  const plan = useMemo(() => {
    if (!selectedFeature) return undefined;
    return buildRelocationPlan(selectedFeature, features, requiredPop, {
      resource_multiplier: multiplier,
      max_safe_density_per_hectare: density
    });
  }, [selectedFeature, features, requiredPop, multiplier, density]);

  // Capacity Gap Analysis
  const capacityGapResult = useMemo(() => {
    return calculateCapacityGap(originFeatures, candidateFeatures);
  }, [originFeatures, candidateFeatures]);

  // Resource Data (Assam / Wayanad)
  const assamResources = useMemo(getAssamSiteResources, []);
  const assamFloodStats = useMemo(getAssamFloodStatistics, []);
  const assamSources = useMemo(getAssamSources, []);

  // Allocated population dictionary for resource gap modeling
  const allocatedPopBySite = useMemo(() => {
    const map: Record<string, number> = {};
    if (plan?.allocation?.allocations) {
      plan.allocation.allocations.forEach((a) => {
        map[a.site_id] = a.allocated_population;
      });
    }
    return map;
  }, [plan]);

  const siteResourceGaps = useMemo(() => {
    return computeSiteResourceGaps(allocatedPopBySite, assamResources);
  }, [allocatedPopBySite, assamResources]);

  const isAssam = region === "assam";
  const priorityTitle = isAssam ? "Flood Relocation Priority Score" : "Relocation Priority Score";

  return (
    <main className="min-h-screen bg-[#090d16] p-4 text-slate-200 md:p-8">
      <div className="mx-auto max-w-7xl space-y-8">
        {/* Header - Minimal, plain typography */}
        <header className="space-y-4 border-b border-slate-800 pb-4">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="space-y-0.5">
              <span className="text-[11px] font-mono uppercase text-slate-400 block tracking-wider">
                SIH26191 • NDRF / SDMA Decision Support
              </span>
              <h1 className="text-xl md:text-2xl font-bold tracking-tight text-white">
                RAKSHA-ZONE
              </h1>
              <p className="text-xs text-slate-400">
                Multi-hazard carrying capacity and relocation decision platform.
              </p>
            </div>

            {/* Region Selector */}
            <RegionSelector
              region={region}
              onSelectRegion={(r) => {
                setRegion(r);
                setAffectedOverride(null);
                setSelectedId(r === "assam" ? "assam-nagaon-kaliabor" : "mundakkai");
              }}
            />
          </div>

          {/* Sub-bar with Navigation Links (Plain text links) */}
          <div className="flex flex-wrap items-center justify-between gap-2 pt-1 text-xs text-slate-400">
            <div>
              <span className="text-slate-400">Active Scenario: </span>
              <span className="text-slate-200 font-medium">
                {isAssam ? "Assam Riverine Flood Inundation (Brahmaputra Basin)" : "Wayanad Debris Flow & Landslide Vulnerability (Western Ghats)"}
              </span>
            </div>
            <nav className="flex items-center gap-4 text-slate-400">
              <Link href="/capacity" className="hover:text-white transition">
                Capacity Deep Dive →
              </Link>
              <Link href="/resources" className="hover:text-white transition">
                Relief Logistics Matrix →
              </Link>
            </nav>
          </div>
        </header>

        {/* Minimal Navigation Bar (Plain text tabs with underline active indicator) */}
        <nav className="flex flex-wrap items-center gap-6 border-b border-slate-800 text-xs">
          {[
            { id: "overview", label: "Operational Overview" },
            { id: "risk_map", label: "GIS Hazard Map" },
            { id: "relocation", label: "Relocation Planning" },
            { id: "capacity", label: "Population & Capacity" },
            { id: "resources", label: "Relief Resources & Stocks" },
            { id: "priority_villages", label: "Prioritized Settlements" },
            ...(isAssam ? [{ id: "timeline", label: "Situation Timeline" }] : []),
            { id: "sources", label: "Data Provenance" }
          ].map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as TabKey)}
                className={`pb-2.5 transition font-medium relative ${
                  isActive
                    ? "text-white border-b-2 border-sky-400 font-semibold"
                    : "text-slate-400 hover:text-slate-200"
                }`}
              >
                {tab.label}
              </button>
            );
          })}
        </nav>

        {/* Tab 1: Overview */}
        {activeTab === "overview" && (() => {
          const mapAndProfileView = (
            <div className="grid gap-6 lg:grid-cols-[1.75fr_1fr]">
              {/* Map Anchor */}
              <div className="h-[520px] rounded border border-slate-800 overflow-hidden bg-slate-900">
                <MapView
                  features={features}
                  assessments={assessments}
                  selectedId={activeSelectedId}
                  onSelect={(id) => {
                    if (features.find((f) => f.properties.id === id)?.properties.role === "origin") {
                      setSelectedId(id);
                      setAffectedOverride(null);
                    }
                  }}
                  bhuvanOverlay={false}
                  bhuvanLayer={null}
                  plan={plan}
                  region={region}
                />
              </div>

              {/* Settlement Profile Card */}
              <section className="rounded border border-slate-800 bg-slate-900 p-5 space-y-4 flex flex-col justify-between">
                <div className="space-y-4">
                  {/* Header */}
                  <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                    <div>
                      <span className="text-[11px] font-medium text-slate-400 block">
                        Selected Habitation Profile
                      </span>
                      <h2 className="text-lg font-bold text-white mt-0.5">{assessment?.name}</h2>
                      {assessment?.district && (
                        <p className="text-xs text-slate-400">
                          District: {assessment.district} ({assessment.state ?? (isAssam ? "Assam" : "Kerala")})
                        </p>
                      )}
                    </div>
                    <span
                      className={`rounded px-2.5 py-0.5 text-xs font-mono font-medium ${
                        assessment?.priority_tier === "Immediate"
                          ? "bg-red-950/80 text-red-300 border border-red-800/80"
                          : "bg-amber-950/80 text-amber-300 border border-amber-800/80"
                      }`}
                    >
                      {assessment?.priority_tier}
                    </span>
                  </div>

                  {/* Level 1 Core Metrics */}
                  <div className="grid grid-cols-2 gap-3">
                    <div className="rounded border border-slate-800 bg-slate-950 p-3 space-y-1">
                      <span className="text-xs text-slate-400 block">{priorityTitle}</span>
                      <p className="text-lg font-bold font-mono text-white">
                        {assessment?.rps.toFixed(3)}
                      </p>
                    </div>
                    <div className="rounded border border-slate-800 bg-slate-950 p-3 space-y-1">
                      <span className="text-xs text-slate-400 block">Evacuation Target</span>
                      <p className="text-lg font-bold font-mono text-white">
                        {requiredPop.toLocaleString()}
                      </p>
                    </div>
                  </div>

                  {/* Level 2 Secondary Metrics */}
                  <div className="grid grid-cols-2 gap-3 text-xs">
                    <div className="rounded border border-slate-800 bg-slate-950 p-2.5 space-y-0.5">
                      <span className="text-slate-400 block">Hazard Severity</span>
                      <span className="font-mono text-white font-semibold">
                        HSS: {assessment?.hss.toFixed(2)}
                      </span>
                    </div>
                    <div className="rounded border border-slate-800 bg-slate-950 p-2.5 space-y-0.5">
                      <span className="text-slate-400 block">Optimal Destination</span>
                      <span className="text-emerald-400 font-medium truncate block">
                        {assessment?.smart_relocation_options?.[0]?.site_name ?? "Evaluating..."}
                      </span>
                    </div>
                  </div>

                  {/* Level 3 Expandable Details */}
                  <div className="border-t border-slate-800 pt-2">
                    <button
                      type="button"
                      onClick={() => setShowAssessmentDetails(!showAssessmentDetails)}
                      className="text-xs text-slate-400 hover:text-slate-200 transition font-medium flex items-center justify-between w-full"
                    >
                      <span>{showAssessmentDetails ? "Hide breakdown ▴" : "Assessment breakdown ▾"}</span>
                      <span className="text-[10px] text-slate-500 font-mono">{showAssessmentDetails ? "▲" : "▼"}</span>
                    </button>

                    {showAssessmentDetails && (
                      <div className="mt-2 space-y-1.5 text-xs bg-slate-950 p-3 rounded border border-slate-800 text-slate-300">
                        <div className="flex justify-between">
                          <span className="text-slate-400">Stress Index:</span>
                          <span className="font-mono text-slate-200">{assessment?.stress_index.toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-400">Normalized Stress:</span>
                          <span className="font-mono text-slate-200">{assessment?.normalized_stress.toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-400">Vulnerability Index:</span>
                          <span className="font-mono text-slate-200">{assessment?.vulnerability_index.toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between border-t border-slate-800 pt-1 text-[11px] text-slate-400">
                          <span>Confidence:</span>
                          <span className="font-semibold text-slate-300">{assessment?.data_confidence ?? "OFFICIAL"}</span>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Action CTA Button */}
                <div className="space-y-2 pt-3 border-t border-slate-800">
                  <button
                    onClick={() => setActiveTab("relocation")}
                    className="w-full rounded bg-slate-800 hover:bg-slate-750 border border-slate-700 px-3.5 py-2 font-medium text-xs text-white transition"
                  >
                    Open Relocation Planner →
                  </button>
                  <p className="text-[11px] text-slate-500 text-center">
                    Automated allocation matching by distance and safe capacity.
                  </p>
                </div>
              </section>
            </div>
          );

          return (
            <div className="space-y-8">
              {isAssam ? (
                <AssamOverview
                  floodStats={assamFloodStats}
                  demandedPopulation={capacityGapResult.total_requiring_relocation}
                  availableCapacity={capacityGapResult.total_available_capacity}
                  capacityDeficit={capacityGapResult.capacity_deficit}
                  criticalResourceCount={siteResourceGaps.filter((s) => Object.values(s.statuses).includes("critical")).length}
                >
                  {mapAndProfileView}
                </AssamOverview>
              ) : (
                mapAndProfileView
              )}
            </div>
          );
        })()}



        {/* Tab 2: Risk Map */}
        {activeTab === "risk_map" && (
          <div className="space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800 pb-3">
              <div>
                <h3 className="text-base font-semibold text-white">GIS Inundation & Relocation Corridor Map</h3>
                <p className="text-xs text-slate-400">
                  Spatial distribution of origin habitations, designated safe highland hubs, and modeled evacuation vectors.
                </p>
              </div>
              <div className="flex flex-wrap items-center gap-4 text-xs text-slate-400">
                <span className="flex items-center gap-1.5"><span className="h-2 w-2 rounded-full bg-red-500" /> Immediate</span>
                <span className="flex items-center gap-1.5"><span className="h-2 w-2 rounded-full bg-amber-500" /> Short-term</span>
                <span className="flex items-center gap-1.5"><span className="h-2 w-2 rounded-full bg-emerald-500" /> Medium-term</span>
                <span className="flex items-center gap-1.5"><span className="h-2 w-2 rounded-full bg-sky-500" /> Safe Zone</span>
              </div>
            </div>

            <div className="h-[600px] rounded border border-slate-800 overflow-hidden bg-slate-900">
              <MapView
                features={features}
                assessments={assessments}
                selectedId={activeSelectedId}
                onSelect={(id) => {
                  if (features.find((f) => f.properties.id === id)?.properties.role === "origin") {
                    setSelectedId(id);
                    setAffectedOverride(null);
                  }
                }}
                bhuvanOverlay={false}
                bhuvanLayer={null}
                plan={plan}
                region={region}
              />
            </div>
          </div>
        )}

        {/* Tab 3: Relocation Planning */}
        {activeTab === "relocation" && (
          <SmartMatchingPanel
            origins={originFeatures}
            selectedOriginId={activeSelectedId}
            onSelectOrigin={(id) => {
              setSelectedId(id);
              setAffectedOverride(null);
            }}
            assessment={assessment}
            weights={weights}
            onWeightsChange={setWeights}
            region={region}
          />
        )}

        {/* Tab 4: Population & Capacity */}
        {activeTab === "capacity" && (
          <CapacityGapPanel gapResult={capacityGapResult} />
        )}

        {/* Tab 5: Resource Planning */}
        {activeTab === "resources" && (
          <ResourceGapPanel siteGaps={siteResourceGaps} />
        )}

        {/* Tab 6: Priority Villages Table with Row Expansion */}
        {activeTab === "priority_villages" && (
          <section className="space-y-4">
            <div className="border-b border-slate-800 pb-3">
              <h2 className="text-base font-semibold text-white">
                Prioritized Settlement Registry ({assessments.length} Habitations)
              </h2>
              <p className="text-xs text-slate-400">
                Ranked by {priorityTitle} descending based on current alpha, beta, and gamma weightings.
              </p>
            </div>

            <div className="overflow-x-auto rounded border border-slate-800">
              <table className="w-full text-left text-xs text-slate-300">
                <thead className="bg-slate-900 text-slate-400 uppercase text-[10px] border-b border-slate-800">
                  <tr>
                    <th className="p-3">Rank</th>
                    <th className="p-3">Habitation</th>
                    <th className="p-3">District</th>
                    <th className="p-3">Displaced Pop.</th>
                    <th className="p-3">Hazard (HSS)</th>
                    <th className="p-3">RPS Score</th>
                    <th className="p-3">Priority Tier</th>
                    <th className="p-3">Optimal Shelter Hub</th>
                    <th className="p-3 text-right">Details</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800 bg-slate-900/40">
                  {assessments.map((item, idx) => {
                    const topMatch = item.smart_relocation_options?.[0];
                    const isExpanded = !!expandedVillageRows[item.id];

                    return (
                      <tr
                        key={item.id}
                        onClick={() => toggleVillageRow(item.id)}
                        className="cursor-pointer hover:bg-slate-850/60 transition"
                      >
                        <td className="p-3 font-mono text-slate-400">#{idx + 1}</td>
                        <td className="p-3">
                          <span className="font-medium text-white block">{item.name}</span>
                          {isExpanded && (
                            <div className="mt-2 text-xs text-slate-400 space-y-1 bg-slate-950 p-2.5 rounded border border-slate-800">
                              <div><b className="text-slate-300">Stress Index:</b> {item.stress_index.toFixed(2)} (Norm: {item.normalized_stress.toFixed(2)})</div>
                              <div><b className="text-slate-300">Vulnerability:</b> {item.vulnerability_index.toFixed(2)}</div>
                              <div><b className="text-slate-300">Confidence:</b> {item.data_confidence ?? "OFFICIAL"}</div>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setSelectedId(item.id);
                                  setActiveTab("relocation");
                                }}
                                className="mt-1 text-sky-400 hover:underline inline-block font-medium"
                              >
                                Plan Relocation for {item.name} →
                              </button>
                            </div>
                          )}
                        </td>
                        <td className="p-3 text-slate-400">{item.district ?? "—"}</td>
                        <td className="p-3 font-mono text-slate-200">
                          {(item.affected_population ?? item.population).toLocaleString()}
                        </td>
                        <td className="p-3 font-mono text-slate-200">{item.hss.toFixed(2)}</td>
                        <td className="p-3 font-mono font-semibold text-white">{item.rps.toFixed(3)}</td>
                        <td className="p-3">
                          <span
                            className={`rounded px-2 py-0.5 text-[10px] font-medium ${
                              item.priority_tier === "Immediate"
                                ? "bg-red-950/80 text-red-300 border border-red-800/80"
                                : item.priority_tier === "Short-term"
                                ? "bg-amber-950/80 text-amber-300 border border-amber-800/80"
                                : "bg-emerald-950/80 text-emerald-300 border border-emerald-800/80"
                            }`}
                          >
                            {item.priority_tier}
                          </span>
                        </td>
                        <td className="p-3 text-slate-300">
                          {topMatch ? `${topMatch.site_name} (${topMatch.distance_km} km)` : "—"}
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
          </section>
        )}

        {/* Tab 7: Assam Flood Situation Timeline */}
        {activeTab === "timeline" && isAssam && (
          <AssamTimelinePanel floodStats={assamFloodStats} />
        )}

        {/* Tab 8: Sources & Provenance */}
        {activeTab === "sources" && (
          <SourcesPanel sourcesData={assamSources} />
        )}
      </div>
    </main>
  );
}
