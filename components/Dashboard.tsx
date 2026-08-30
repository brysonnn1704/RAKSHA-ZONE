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
  loading: () => <div className="h-[480px] rounded-lg bg-slate-850 animate-pulse border border-slate-800" />
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
    <main className="min-h-screen bg-[#070d18] p-3 text-slate-100 md:p-6">
      <div className="mx-auto max-w-7xl space-y-4">
        {/* Top App Header & Region Switcher */}
        <header className="border-b border-slate-800 pb-3 space-y-2.5">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <div className="flex items-center gap-2">
                <span className="rounded bg-sky-950 border border-sky-800/80 px-2 py-0.5 text-[10px] font-bold uppercase tracking-widest text-sky-400">
                  SIH26191 · NDRF / SDMA Decision Support System
                </span>
                <span className="text-[10px] font-mono text-slate-500">v2.1 Operational Release</span>
              </div>
              <h1 className="mt-1 text-xl md:text-2xl font-bold tracking-tight text-white">
                RAKSHA-ZONE <span className="text-slate-400 font-normal text-lg">| Multi-Hazard Relocation & Carrying-Capacity Platform</span>
              </h1>
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

          {/* Sub-bar with Navigation Links */}
          <div className="flex flex-wrap items-center justify-between gap-2 pt-1 text-xs text-slate-400 border-t border-slate-850">
            <div className="flex items-center gap-2">
              <span className="font-semibold text-slate-300">Active Scenario:</span>
              <span className="text-slate-200">
                {isAssam ? "Assam Riverine Flood Inundation (Brahmaputra Basin)" : "Wayanad Debris Flow & Landslide Vulnerability (Western Ghats)"}
              </span>
            </div>
            <nav className="flex items-center gap-4 text-sky-400">
              <Link href="/capacity" className="hover:text-sky-300 hover:underline">
                Capacity Deep Dive →
              </Link>
              <Link href="/resources" className="hover:text-sky-300 hover:underline">
                Relief Logistics Matrix →
              </Link>
            </nav>
          </div>
        </header>

        {/* 8 Tab Navigation Bar */}
        <nav className="flex flex-wrap gap-1 rounded-md bg-slate-900 p-1 border border-slate-800">
          {[
            { id: "overview", label: "Operational Overview" },
            { id: "risk_map", label: "GIS Hazard Map" },
            { id: "relocation", label: "Relocation Planning" },
            { id: "capacity", label: "Population & Capacity" },
            { id: "resources", label: "Relief Resources & Stocks" },
            { id: "priority_villages", label: "Prioritized Settlements" },
            ...(isAssam ? [{ id: "timeline", label: "Situation Timeline" }] : []),
            { id: "sources", label: "Data Provenance" }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as TabKey)}
              className={`rounded px-3 py-1.5 text-xs font-medium transition ${
                activeTab === tab.id
                  ? "bg-slate-800 text-sky-400 border border-slate-700 shadow-sm font-semibold"
                  : "text-slate-400 hover:text-slate-200 hover:bg-slate-850"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </nav>

        {/* Tab 1: Overview */}
        {activeTab === "overview" && (
          <div className="space-y-4">
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
            <div className="grid gap-4 lg:grid-cols-[1.5fr_1fr]">
              <div className="h-[460px]">
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

              <section className="rounded-lg border border-slate-800 bg-slate-900 p-4 space-y-3.5 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-sky-400">
                      Selected Habitation Profile
                    </span>
                    <span
                      className={`rounded px-2 py-0.5 text-[10px] font-semibold ${
                        assessment?.priority_tier === "Immediate"
                          ? "bg-red-950 text-red-300 border border-red-800"
                          : "bg-amber-950 text-amber-300 border border-amber-800"
                      }`}
                    >
                      Tier: {assessment?.priority_tier}
                    </span>
                  </div>

                  <h2 className="mt-2 text-xl font-bold text-slate-100">{assessment?.name}</h2>
                  {assessment?.district && (
                    <p className="text-xs text-slate-400">District: {assessment.district} ({assessment.state ?? "Assam"})</p>
                  )}

                  <div className="mt-3 grid grid-cols-2 gap-2.5">
                    <div className="rounded border border-slate-800 bg-slate-850 p-2.5">
                      <p className="text-[10px] uppercase font-semibold text-slate-400">{priorityTitle}</p>
                      <p className="mt-0.5 text-lg font-bold font-mono text-sky-400">
                        {assessment?.rps.toFixed(3)}
                      </p>
                    </div>
                    <div className="rounded border border-slate-800 bg-slate-850 p-2.5">
                      <p className="text-[10px] uppercase font-semibold text-slate-400">Evacuation Target</p>
                      <p className="mt-0.5 text-lg font-bold font-mono text-slate-100">
                        {requiredPop.toLocaleString()}
                      </p>
                    </div>
                    <div className="rounded border border-slate-800 bg-slate-850 p-2.5">
                      <p className="text-[10px] uppercase font-semibold text-slate-400">Hazard Exposure (HSS)</p>
                      <p className="mt-0.5 text-base font-bold font-mono text-orange-400">
                        {assessment?.hss.toFixed(2)}
                      </p>
                    </div>
                    <div className="rounded border border-slate-800 bg-slate-850 p-2.5">
                      <p className="text-[10px] uppercase font-semibold text-slate-400">Optimal Destination</p>
                      <p className="mt-0.5 text-xs font-bold text-emerald-400 truncate">
                        {assessment?.smart_relocation_options?.[0]?.site_name ?? "Evaluating..."}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="space-y-2 pt-3 border-t border-slate-800">
                  <button
                    onClick={() => setActiveTab("relocation")}
                    className="w-full rounded bg-sky-600 px-3.5 py-2 font-semibold text-xs text-white hover:bg-sky-500 transition shadow-sm"
                  >
                    Open Multi-Criteria Relocation Planner →
                  </button>
                  <p className="text-[10px] text-slate-500 text-center">
                    Automated allocation matching origin settlements to candidate safe zones by geodesic distance and capacity headroom.
                  </p>
                </div>
              </section>
            </div>
          </div>
        )}

        {/* Tab 2: Risk Map */}
        {activeTab === "risk_map" && (
          <div className="space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-2.5 rounded-lg border border-slate-800 bg-slate-900 p-3">
              <div>
                <h3 className="text-sm font-bold text-slate-100">GIS Inundation & Relocation Corridor Map</h3>
                <p className="text-xs text-slate-400">
                  Spatial distribution of origin habitations, designated safe highland hubs, and modeled evacuation vectors.
                </p>
              </div>
              <div className="flex flex-wrap items-center gap-3 text-xs">
                <span className="flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded-full bg-red-500" /> Immediate Risk</span>
                <span className="flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded-full bg-amber-500" /> Short-term</span>
                <span className="flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded-full bg-emerald-500" /> Medium-term</span>
                <span className="flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded-full bg-sky-500" /> Candidate Safe Zone</span>
                <span className="flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded-full bg-purple-500" /> Resource Constrained</span>
              </div>
            </div>

            <div className="h-[560px] rounded-lg overflow-hidden border border-slate-800">
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
          <section className="rounded-lg border border-slate-800 bg-slate-900 p-4 md:p-5 space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800 pb-3.5">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-sky-400">
                  Priority Scoring Registry
                </span>
                <h2 className="text-lg font-bold text-slate-100 mt-0.5">
                  Prioritized Settlement Registry ({assessments.length} Habitations)
                </h2>
                <p className="text-xs text-slate-400">
                  Ranked by {priorityTitle} descending based on current alpha, beta, and gamma weightings.
                </p>
              </div>
            </div>

            <div className="overflow-x-auto rounded border border-slate-800">
              <table className="w-full text-left text-xs text-slate-300">
                <thead className="bg-slate-800/80 text-slate-400 uppercase text-[10px]">
                  <tr>
                    <th className="p-3">Rank</th>
                    <th className="p-3">Habitation</th>
                    <th className="p-3">District</th>
                    <th className="p-3">Displaced Pop.</th>
                    <th className="p-3">Hazard (HSS)</th>
                    <th className="p-3">Stress Index</th>
                    <th className="p-3">Vulnerability</th>
                    <th className="p-3">RPS Score</th>
                    <th className="p-3">Priority Tier</th>
                    <th className="p-3">Optimal Shelter Hub</th>
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
                        className="cursor-pointer hover:bg-slate-850 transition"
                      >
                        <td className="p-3 font-mono font-bold text-sky-400">#{idx + 1}</td>
                        <td className="p-3 font-bold text-slate-100">{item.name}</td>
                        <td className="p-3 text-slate-400">{item.district ?? "—"}</td>
                        <td className="p-3 font-mono text-slate-200">
                          {(item.affected_population ?? item.population).toLocaleString()}
                        </td>
                        <td className="p-3 font-mono text-orange-400">{item.hss.toFixed(2)}</td>
                        <td className="p-3 font-mono text-slate-300">{item.stress_index.toFixed(2)}</td>
                        <td className="p-3 font-mono text-slate-300">{item.vulnerability_index.toFixed(2)}</td>
                        <td className="p-3 font-mono font-bold text-sky-400 text-sm">{item.rps.toFixed(3)}</td>
                        <td className="p-3">
                          <span
                            className={`rounded px-2 py-0.5 text-[10px] font-semibold ${
                              item.priority_tier === "Immediate"
                                ? "bg-red-950/80 text-red-300 border border-red-800"
                                : item.priority_tier === "Short-term"
                                ? "bg-amber-950/80 text-amber-300 border border-amber-800"
                                : "bg-emerald-950/80 text-emerald-300 border border-emerald-800"
                            }`}
                          >
                            {item.priority_tier}
                          </span>
                        </td>
                        <td className="p-3 text-emerald-400 font-medium">
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
