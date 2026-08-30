"use client";

import { useMemo, useState } from "react";
import {
  getAssamFloodStatistics,
  getAssamSiteResources,
  getAssamSources,
  getNepalFloodStatistics,
  getNepalSiteResources,
  getNepalSources,
  getRegionFeatures,
  getWayanadFloodStatistics,
  getWayanadSources
} from "@/lib/data";
import { assessVillages, DEFAULT_WEIGHTS } from "@/lib/scoring";
import { buildRelocationPlan } from "@/lib/planning";
import { calculateCapacityGap } from "@/lib/capacity";
import { computeSiteResourceGaps } from "@/lib/resources";
import type { RegionId, WeightSet } from "@/lib/types";

import { Sidebar, type DashboardTab } from "./Sidebar";
import { RegionSelector } from "./RegionSelector";
import { RegionBackground } from "./RegionBackground";
import { CommandCenter } from "./CommandCenter";
import { HazardCascadePanel } from "./HazardCascadePanel";
import { SmartMatchingPanel } from "./SmartMatchingPanel";
import { CapacityGapPanel } from "./CapacityGapPanel";
import { ResourceGapPanel } from "./ResourceGapPanel";
import { AssamTimelinePanel } from "./AssamTimelinePanel";
import { SourcesPanel } from "./SourcesPanel";
import dynamic from "next/dynamic";

const MapView = dynamic(() => import("./MapView").then((m) => m.MapView), {
  ssr: false,
  loading: () => <div className="h-[600px] rounded-lg bg-slate-100 animate-pulse border border-slate-200" />
});

export function Dashboard() {
  const [region, setRegion] = useState<RegionId>("wayanad");
  const [activeTab, setActiveTab] = useState<DashboardTab>("overview");
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [weights, setWeights] = useState<WeightSet>(DEFAULT_WEIGHTS);
  const [multiplier] = useState(0.9);
  const [density] = useState(140);
  const [affectedOverride, setAffectedOverride] = useState<number | null>(null);

  const [expandedVillageRows, setExpandedVillageRows] = useState<Record<string, boolean>>({});

  const toggleVillageRow = (id: string) => {
    setExpandedVillageRows((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  // Load features based on active region
  const features = useMemo(() => getRegionFeatures(region), [region]);
  const originFeatures = useMemo(() => features.filter((f) => f.properties.role === "origin"), [features]);
  const candidateFeatures = useMemo(() => features.filter((f) => f.properties.role === "candidate"), [features]);

  // Selected Origin settlement
  const defaultOriginId =
    region === "assam"
      ? "assam-nagaon-kaliabor"
      : region === "nepal"
      ? "nep-timure"
      : "mundakkai";

  const [selectedId, setSelectedId] = useState<string>(defaultOriginId);

  // When region switches, ensure valid selected ID
  const activeSelectedId = originFeatures.some((f) => f.properties.id === selectedId)
    ? selectedId
    : originFeatures[0]?.properties.id ?? defaultOriginId;

  const selectedFeature =
    features.find((f) => f.properties.id === activeSelectedId && f.properties.role === "origin") ??
    originFeatures[0];

  // Assessments for all origin habitations
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

  // Regional Resource, Statistics & Provenance Data
  const currentResources = useMemo(() => {
    if (region === "nepal") return getNepalSiteResources();
    return getAssamSiteResources();
  }, [region]);

  const currentFloodStats = useMemo(() => {
    if (region === "nepal") return getNepalFloodStatistics();
    if (region === "wayanad") return getWayanadFloodStatistics();
    return getAssamFloodStatistics();
  }, [region]);

  const currentSources = useMemo(() => {
    if (region === "nepal") return getNepalSources();
    if (region === "wayanad") return getWayanadSources();
    return getAssamSources();
  }, [region]);

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
    return computeSiteResourceGaps(allocatedPopBySite, currentResources);
  }, [allocatedPopBySite, currentResources]);

  const priorityTitle =
    region === "assam"
      ? "Flood Relocation Priority Score"
      : region === "nepal"
      ? "Himalayan Relocation Priority Score"
      : "Relocation Priority Score";

  return (
    <div className="relative min-h-screen text-slate-900 flex">
      {/* Subtle Photographic Regional Background Layer */}
      <RegionBackground region={region} />

      {/* 1. Left Sidebar Navigation */}
      <Sidebar
        activeTab={activeTab}
        onSelectTab={setActiveTab}
        region={region}
        onSelectRegion={(r) => {
          setRegion(r);
          setAffectedOverride(null);
          setSelectedId(
            r === "assam"
              ? "assam-nagaon-kaliabor"
              : r === "nepal"
              ? "nep-timure"
              : "mundakkai"
          );
        }}
        isOpenMobile={isMobileSidebarOpen}
        onCloseMobile={() => setIsMobileSidebarOpen(false)}
      />

      {/* 2. Main Content Area */}
      <div className="relative z-10 flex-1 flex flex-col min-w-0">
        {/* Top Header Bar */}
        <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-slate-200 bg-white/95 backdrop-blur-xs px-4 md:px-8">
          <div className="flex items-center gap-3">
            {/* Mobile Hamburger Toggle */}
            <button
              type="button"
              onClick={() => setIsMobileSidebarOpen(true)}
              className="rounded p-1.5 text-slate-600 hover:bg-slate-100 md:hidden"
              aria-label="Open navigation menu"
            >
              ☰
            </button>

            <div>
              <div className="flex items-center gap-2">
                <span className="rounded bg-slate-100 border border-slate-200 px-2 py-0.5 font-bold font-mono text-[10px] uppercase text-slate-700">
                  {region === "nepal" ? "Nepal–Tibet Corridor" : region === "assam" ? "Assam Flood Basin" : "Wayanad Landslide Zone"}
                </span>
                <span className="text-xs font-semibold text-slate-800 hidden sm:inline">
                  {region === "nepal"
                    ? "Cascading Glacial & Flash Flood DSS"
                    : region === "assam"
                    ? "Brahmaputra Basin Flood Inundation"
                    : "Western Ghats Landslide Vulnerability"}
                </span>
              </div>
            </div>
          </div>

          {/* Quick Scenario Selector */}
          <RegionSelector
            region={region}
            onSelectRegion={(r) => {
              setRegion(r);
              setAffectedOverride(null);
              setSelectedId(
                r === "assam"
                  ? "assam-nagaon-kaliabor"
                  : r === "nepal"
                  ? "nep-timure"
                  : "mundakkai"
              );
            }}
          />
        </header>

        {/* Dynamic View Body */}
        <main className="flex-1 p-4 md:p-8 max-w-7xl w-full mx-auto space-y-6">
          {/* TAB 1: Canonical Command Center (Identical across Wayanad, Assam, and Nepal!) */}
          {activeTab === "overview" && (
            <CommandCenter
              region={region}
              features={features}
              assessments={assessments}
              selectedId={activeSelectedId}
              onSelectOrigin={(id) => {
                setSelectedId(id);
                setAffectedOverride(null);
              }}
              plan={plan}
              assessment={assessment}
              requiredPop={requiredPop}
              capacityGapResult={capacityGapResult}
              priorityTitle={priorityTitle}
              onOpenRelocation={() => setActiveTab("relocation")}
            />
          )}

          {/* TAB 2: GIS Hazard Map */}
          {activeTab === "risk_map" && (
            <div className="space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 pb-3">
                <div>
                  <h3 className="text-base font-bold text-slate-900">GIS Hazard & Relocation Corridor Map</h3>
                  <p className="text-xs text-slate-600">
                    Spatial distribution of origin habitations, designated safe highland hubs, and modeled evacuation vectors.
                  </p>
                </div>
                <div className="flex flex-wrap items-center gap-4 text-xs text-slate-700">
                  <span className="flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded-full bg-red-600" /> Immediate</span>
                  <span className="flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded-full bg-amber-600" /> Short-term</span>
                  <span className="flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded-full bg-emerald-600" /> Medium-term</span>
                  <span className="flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded-full bg-sky-600" /> Safe Hub</span>
                </div>
              </div>

              <div className="h-[600px] rounded-lg border border-slate-200 overflow-hidden bg-white shadow-2xs">
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

          {/* TAB 3: Population & Capacity */}
          {activeTab === "capacity" && (
            <CapacityGapPanel gapResult={capacityGapResult} />
          )}

          {/* TAB 4: Relocation Planning */}
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

          {/* TAB 5: Relief Resources & Stocks */}
          {activeTab === "resources" && (
            <ResourceGapPanel siteGaps={siteResourceGaps} />
          )}

          {/* TAB 6: Hazard Cascade (Multi-Stage Cascading Propagation) */}
          {activeTab === "cascade" && (
            <HazardCascadePanel region={region} />
          )}

          {/* TAB 7: Scenario Simulator & Priority Table */}
          {activeTab === "weights" && (
            <section className="space-y-6">
              <div className="border-b border-slate-200 pb-3">
                <h2 className="text-base font-bold text-slate-900">
                  Prioritized Settlement Registry ({assessments.length} Habitations)
                </h2>
                <p className="text-xs text-slate-600">
                  Ranked by {priorityTitle} descending based on current alpha, beta, and gamma weightings.
                </p>
              </div>

              <div className="overflow-x-auto rounded-lg border border-slate-200 bg-white shadow-2xs">
                <table className="w-full text-left text-xs text-slate-700">
                  <thead className="bg-slate-50 text-slate-500 uppercase text-[10px] border-b border-slate-200">
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
                  <tbody className="divide-y divide-slate-100">
                    {assessments.map((item, idx) => {
                      const topMatch = item.smart_relocation_options?.[0];
                      const isExpanded = !!expandedVillageRows[item.id];

                      return (
                        <tr
                          key={item.id}
                          onClick={() => toggleVillageRow(item.id)}
                          className="cursor-pointer hover:bg-slate-50 transition"
                        >
                          <td className="p-3 font-mono font-bold text-slate-500">#{idx + 1}</td>
                          <td className="p-3">
                            <span className="font-bold text-slate-900 block">{item.name}</span>
                            {isExpanded && (
                              <div className="mt-2 text-xs text-slate-600 space-y-1 bg-slate-50 p-2.5 rounded-lg border border-slate-200">
                                <div><b className="text-slate-800">Stress Index:</b> {item.stress_index.toFixed(2)} (Norm: {item.normalized_stress.toFixed(2)})</div>
                                <div><b className="text-slate-800">Vulnerability:</b> {item.vulnerability_index.toFixed(2)}</div>
                                <div><b className="text-slate-800">Provenance:</b> {item.data_confidence ?? "OFFICIAL"}</div>
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setSelectedId(item.id);
                                    setActiveTab("relocation");
                                  }}
                                  className="mt-1 text-sky-700 hover:underline inline-block font-bold"
                                >
                                  Plan Relocation for {item.name} →
                                </button>
                              </div>
                            )}
                          </td>
                          <td className="p-3 text-slate-600">{item.district ?? "—"}</td>
                          <td className="p-3 font-mono text-slate-900">
                            {(item.affected_population ?? item.population).toLocaleString()}
                          </td>
                          <td className="p-3 font-mono text-slate-800">{item.hss.toFixed(2)}</td>
                          <td className="p-3 font-mono font-bold text-slate-900">{item.rps.toFixed(3)}</td>
                          <td className="p-3">
                            <span
                              className={`rounded px-2 py-0.5 text-[10px] font-bold border ${
                                item.priority_tier === "Immediate"
                                  ? "bg-red-50 text-red-700 border-red-200"
                                  : item.priority_tier === "Short-term"
                                  ? "bg-amber-50 text-amber-700 border-amber-200"
                                  : "bg-emerald-50 text-emerald-700 border-emerald-200"
                              }`}
                            >
                              {item.priority_tier}
                            </span>
                          </td>
                          <td className="p-3 text-slate-700">
                            {topMatch ? `${topMatch.site_name} (${topMatch.distance_km} km)` : "—"}
                          </td>
                          <td className="p-3 text-right text-xs text-slate-500">
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

          {/* TAB 8: Situation Timeline */}
          {activeTab === "timeline" && (
            <AssamTimelinePanel floodStats={currentFloodStats} />
          )}

          {/* TAB 9: Data Provenance */}
          {activeTab === "sources" && (
            <SourcesPanel sourcesData={currentSources} />
          )}
        </main>
      </div>
    </div>
  );
}
