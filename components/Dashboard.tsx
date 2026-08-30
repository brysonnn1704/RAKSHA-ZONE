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
  loading: () => <div className="h-[520px] rounded-xl bg-slate-800 animate-pulse" />
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

const tone: Record<string, string> = {
  Immediate: "text-red-300",
  "Short-term": "text-orange-300",
  "Medium-term": "text-emerald-300",
  SUFFICIENT: "text-emerald-300",
  LIMITED: "text-orange-300",
  INSUFFICIENT: "text-red-300",
  UNKNOWN: "text-slate-400"
};

export function Dashboard() {
  const [region, setRegion] = useState<RegionId>("assam");
  const [activeTab, setActiveTab] = useState<TabKey>("overview");
  const [weights, setWeights] = useState<WeightSet>(DEFAULT_WEIGHTS);
  const [multiplier, setMultiplier] = useState(0.9);
  const [density, setDensity] = useState(140);
  const [affectedOverride, setAffectedOverride] = useState<number | null>(null);
  const [generate, setGenerate] = useState(false);

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
    <main className="min-h-screen bg-[#07111f] p-3 text-slate-100 md:p-6">
      <div className="mx-auto max-w-7xl space-y-5">
        {/* Top App Header & Region Switcher */}
        <header className="border-b border-slate-700/80 pb-4 space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <div className="flex items-center gap-2">
                <span className="rounded bg-sky-500/20 border border-sky-500/40 px-2 py-0.5 text-[10px] font-bold uppercase tracking-widest text-sky-300">
                  SIH26191 · NDRF / MHA Decision Support
                </span>
                <span className="rounded bg-slate-800 px-2 py-0.5 text-[10px] font-semibold text-slate-400">
                  Prototype v2.1
                </span>
              </div>
              <h1 className="mt-1 text-2xl md:text-3xl font-extrabold tracking-tight">
                RAKSHA-ZONE <span className="text-sky-400 font-normal">| Multi-Hazard Decision Platform</span>
              </h1>
              <p className="text-xs text-slate-400">
                Connecting multi-hazard exposure with vulnerable populations, safe carrying capacity, and lifeline resources.
              </p>
            </div>

            {/* Region Selector */}
            <RegionSelector
              region={region}
              onSelectRegion={(r) => {
                setRegion(r);
                setAffectedOverride(null);
                setGenerate(false);
                setSelectedId(r === "assam" ? "assam-nagaon-kaliabor" : "mundakkai");
              }}
            />
          </div>

          {/* Quick Sub-navigation */}
          <div className="flex flex-wrap items-center justify-between gap-2 pt-1 text-xs text-slate-400">
            <div className="flex items-center gap-2">
              <span className="font-semibold text-slate-300">Active Scenario:</span>
              <span className="text-teal-300 font-medium">
                {isAssam ? "Assam Monsoon Riverine Flood Inundation" : "Wayanad Mountain Landslide & Debris Flow"}
              </span>
            </div>
            <nav className="flex items-center gap-4 text-sky-300">
              <Link href="/capacity" className="hover:text-sky-200 hover:underline">
                Standalone Capacity Dashboard →
              </Link>
              <Link href="/resources" className="hover:text-sky-200 hover:underline">
                Standalone Resource Dashboard →
              </Link>
            </nav>
          </div>
        </header>

        {/* 8 Tab Navigation Bar */}
        <nav className="flex flex-wrap gap-1 rounded-xl bg-slate-900/90 p-1.5 border border-slate-800 shadow-md">
          {[
            { id: "overview", label: "Overview", icon: "📊" },
            { id: "risk_map", label: "Risk Map", icon: "🗺️" },
            { id: "relocation", label: "Relocation Planning", icon: "🧭" },
            { id: "capacity", label: "Population & Capacity", icon: "🏢" },
            { id: "resources", label: "Resource Planning", icon: "📦" },
            { id: "priority_villages", label: "Priority Villages", icon: "📋" },
            ...(isAssam ? [{ id: "timeline", label: "Assam Flood Situation", icon: "⏱️" }] : []),
            { id: "sources", label: "Sources & Provenance", icon: "🔍" }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as TabKey)}
              className={`flex items-center gap-1.5 rounded-lg px-3.5 py-2 text-xs font-semibold transition ${
                activeTab === tab.id
                  ? "bg-sky-500 text-slate-950 shadow-md"
                  : "text-slate-300 hover:bg-slate-800 hover:text-slate-100"
              }`}
            >
              <span>{tab.icon}</span>
              <span>{tab.label}</span>
            </button>
          ))}
        </nav>

        {/* Tab 1: Overview */}
        {activeTab === "overview" && (
          <div className="space-y-6">
            {isAssam && (
              <AssamOverview
                floodStats={assamFloodStats}
                demandedPopulation={capacityGapResult.total_requiring_relocation}
                availableCapacity={capacityGapResult.total_available_capacity}
                capacityDeficit={capacityGapResult.capacity_deficit}
                criticalResourceCount={siteResourceGaps.filter((s) => Object.values(s.statuses).includes("critical")).length}
              />
            )}

            {/* Split Screen Map + Selected Settlement Quick View */}
            <div className="grid gap-5 lg:grid-cols-[1.5fr_1fr]">
              <div className="h-[480px]">
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

              <section className="rounded-xl border border-slate-700 bg-slate-900/80 p-5 space-y-4 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold uppercase tracking-wider text-sky-400">
                      Active Inundation Zone
                    </span>
                    <span
                      className={`rounded border px-2 py-0.5 text-[10px] font-bold ${
                        assessment?.priority_tier === "Immediate"
                          ? "bg-red-950 text-red-300 border-red-800"
                          : "bg-orange-950 text-orange-300 border-orange-800"
                      }`}
                    >
                      {assessment?.priority_tier}
                    </span>
                  </div>

                  <h2 className="mt-1 text-2xl font-bold text-slate-100">{assessment?.name}</h2>
                  {assessment?.district && (
                    <p className="text-xs text-slate-400">District: {assessment.district} ({assessment.state ?? "Assam"})</p>
                  )}

                  <div className="mt-4 grid grid-cols-2 gap-3">
                    <div className="rounded-lg bg-slate-800/80 p-3">
                      <p className="text-xs text-slate-400">{priorityTitle}</p>
                      <p className="mt-1 text-xl font-bold font-mono text-sky-300">
                        {assessment?.rps.toFixed(3)}
                      </p>
                    </div>
                    <div className="rounded-lg bg-slate-800/80 p-3">
                      <p className="text-xs text-slate-400">Displaced Evacuees</p>
                      <p className="mt-1 text-xl font-bold font-mono text-slate-100">
                        {requiredPop.toLocaleString()}
                      </p>
                    </div>
                    <div className="rounded-lg bg-slate-800/80 p-3">
                      <p className="text-xs text-slate-400">Hazard Exposure (HSS)</p>
                      <p className="mt-1 text-lg font-bold font-mono text-orange-300">
                        {assessment?.hss.toFixed(2)}
                      </p>
                    </div>
                    <div className="rounded-lg bg-slate-800/80 p-3">
                      <p className="text-xs text-slate-400">Top Recommended Site</p>
                      <p className="mt-1 text-xs font-bold text-emerald-300 truncate">
                        {assessment?.smart_relocation_options?.[0]?.site_name ?? "Evaluating..."}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="space-y-3 pt-3 border-t border-slate-800">
                  <button
                    onClick={() => {
                      setGenerate(true);
                      setActiveTab("relocation");
                    }}
                    className="w-full rounded-lg bg-sky-500 px-4 py-2.5 font-bold text-slate-950 hover:bg-sky-400 transition shadow-lg"
                  >
                    Generate Relocation Plan & Smart Matching →
                  </button>
                  <p className="text-[11px] text-slate-500 text-center">
                    Uses multi-factor composite suitability: distance, safe headroom, and resource readiness.
                  </p>
                </div>
              </section>
            </div>
          </div>
        )}

        {/* Tab 2: Risk Map */}
        {activeTab === "risk_map" && (
          <div className="space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-slate-800 bg-slate-900/80 p-4">
              <div>
                <h3 className="text-base font-bold text-slate-100">Interactive GIS Multi-Hazard Map</h3>
                <p className="text-xs text-slate-400">
                  Visualizing flood inundation zones, candidate safe highlands, and automated relocation vectors.
                </p>
              </div>
              <div className="flex flex-wrap items-center gap-3 text-xs">
                <span className="flex items-center gap-1.5"><span className="h-3 w-3 rounded-full bg-red-500" /> Immediate Risk</span>
                <span className="flex items-center gap-1.5"><span className="h-3 w-3 rounded-full bg-orange-500" /> Short-term</span>
                <span className="flex items-center gap-1.5"><span className="h-3 w-3 rounded-full bg-emerald-500" /> Medium-term</span>
                <span className="flex items-center gap-1.5"><span className="h-3 w-3 rounded-full bg-sky-400" /> Candidate Safe Zone</span>
                <span className="flex items-center gap-1.5"><span className="h-3 w-3 rounded-full bg-purple-500" /> Resource Constrained</span>
              </div>
            </div>

            <div className="h-[600px] rounded-xl overflow-hidden border border-slate-700">
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

        {/* Tab 6: Priority Villages Table */}
        {activeTab === "priority_villages" && (
          <section className="rounded-xl border border-slate-700 bg-slate-900/70 p-5 space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800 pb-4">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-sky-400">
                  Priority Scoring Registry
                </span>
                <h2 className="text-xl font-bold text-slate-100 mt-0.5">
                  Ranked Priority Settlements ({assessments.length} Habitations)
                </h2>
                <p className="text-xs text-slate-400">
                  Sorted by {priorityTitle} descending based on current alpha, beta, and gamma weightings.
                </p>
              </div>
            </div>

            <div className="overflow-x-auto rounded-lg border border-slate-800">
              <table className="w-full text-left text-xs text-slate-300">
                <thead className="bg-slate-800/80 text-slate-400 uppercase text-[10px]">
                  <tr>
                    <th className="p-3">Rank</th>
                    <th className="p-3">Settlement Name</th>
                    <th className="p-3">District</th>
                    <th className="p-3">Displaced Count</th>
                    <th className="p-3">Hazard (HSS)</th>
                    <th className="p-3">Stress Index</th>
                    <th className="p-3">Vulnerability</th>
                    <th className="p-3">RPS Score</th>
                    <th className="p-3">Priority Tier</th>
                    <th className="p-3">Top Recommended Site</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800 bg-slate-900/60">
                  {assessments.map((item, idx) => {
                    const topMatch = item.smart_relocation_options?.[0];
                    return (
                      <tr
                        key={item.id}
                        onClick={() => {
                          setSelectedId(item.id);
                          setActiveTab("relocation");
                        }}
                        className="cursor-pointer hover:bg-slate-800/60 transition"
                      >
                        <td className="p-3 font-mono font-bold text-sky-400">#{idx + 1}</td>
                        <td className="p-3 font-bold text-slate-100">{item.name}</td>
                        <td className="p-3 text-slate-400">{item.district ?? "—"}</td>
                        <td className="p-3 font-mono text-slate-200">
                          {(item.affected_population ?? item.population).toLocaleString()}
                        </td>
                        <td className="p-3 font-mono text-orange-300">{item.hss.toFixed(2)}</td>
                        <td className="p-3 font-mono text-slate-300">{item.stress_index.toFixed(2)}</td>
                        <td className="p-3 font-mono text-slate-300">{item.vulnerability_index.toFixed(2)}</td>
                        <td className="p-3 font-mono font-bold text-sky-300 text-sm">{item.rps.toFixed(3)}</td>
                        <td className="p-3">
                          <span
                            className={`rounded px-2 py-0.5 text-[10px] font-bold ${
                              item.priority_tier === "Immediate"
                                ? "bg-red-950/80 text-red-300 border border-red-800"
                                : item.priority_tier === "Short-term"
                                ? "bg-orange-950/80 text-orange-300 border border-orange-800"
                                : "bg-emerald-950/80 text-emerald-300 border border-emerald-800"
                            }`}
                          >
                            {item.priority_tier}
                          </span>
                        </td>
                        <td className="p-3 text-emerald-300 font-medium">
                          {topMatch ? `${topMatch.site_name} (${topMatch.distance_km} km)` : "—"}
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
