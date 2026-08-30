"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { getRegionFeatures } from "@/lib/data";
import { toRelocationSite } from "@/lib/planning";
import { assessCapacity } from "@/lib/capacity";
import type { CapacityStatus } from "@/types/relocation";
import type { RegionId } from "@/lib/types";
import { RegionSelector } from "@/components/RegionSelector";

const statusTone: Record<CapacityStatus, { badge: string; text: string; bg: string }> = {
  SUFFICIENT: { badge: "bg-emerald-950/80 text-emerald-300 border-emerald-800", text: "text-emerald-400", bg: "bg-emerald-500" },
  LIMITED: { badge: "bg-amber-950/80 text-amber-300 border-amber-800", text: "text-amber-400", bg: "bg-amber-500" },
  INSUFFICIENT: { badge: "bg-red-950/80 text-red-300 border-red-800", text: "text-red-400", bg: "bg-red-500" },
  UNKNOWN: { badge: "bg-slate-800 text-slate-400 border-slate-700", text: "text-slate-400", bg: "bg-slate-500" }
};

export default function CapacityPage() {
  const [region, setRegion] = useState<RegionId>("assam");
  const features = useMemo(() => getRegionFeatures(region), [region]);
  const candidateFeatures = useMemo(() => features.filter((f) => f.properties.role === "candidate"), [features]);
  const originFeatures = useMemo(() => features.filter((f) => f.properties.role === "origin"), [features]);

  const [selectedSiteId, setSelectedSiteId] = useState<string>("");
  const activeSelectedSiteId = candidateFeatures.some((f) => f.properties.id === selectedSiteId)
    ? selectedSiteId
    : candidateFeatures[0]?.properties.id ?? "";

  const [targetPopulation, setTargetPopulation] = useState<number>(1500);
  const [densityOverride, setDensityOverride] = useState<number>(140);
  const [multiplierOverride, setMultiplierOverride] = useState<number>(0.9);
  const [shelterOverride, setShelterOverride] = useState<number | null>(null);
  const [waterOverride, setWaterOverride] = useState<number | null>(null);
  const [healthcareOverride, setHealthcareOverride] = useState<number | null>(null);
  const [infrastructureOverride, setInfrastructureOverride] = useState<number | null>(null);
  const [isAvailable, setIsAvailable] = useState<boolean>(true);

  const selectedFeature = candidateFeatures.find((f) => f.properties.id === activeSelectedSiteId) ?? candidateFeatures[0];
  const baseSite = useMemo(() => (selectedFeature ? toRelocationSite(selectedFeature) : null), [selectedFeature]);

  const assessment = useMemo(() => {
    if (!baseSite) return null;
    return assessCapacity(baseSite, targetPopulation, {
      max_safe_density_per_hectare: densityOverride,
      resource_multiplier: multiplierOverride,
      shelter_capacity: shelterOverride ?? baseSite.shelter_capacity,
      water_capacity: waterOverride ?? baseSite.water_capacity,
      healthcare_capacity: healthcareOverride ?? baseSite.healthcare_capacity,
      infrastructure_capacity: infrastructureOverride ?? baseSite.infrastructure_capacity,
      available: isAvailable
    });
  }, [baseSite, targetPopulation, densityOverride, multiplierOverride, shelterOverride, waterOverride, healthcareOverride, infrastructureOverride, isAvailable]);

  // All sites summary with current global scenario
  const allAssessments = useMemo(() => {
    return candidateFeatures.map((feat) => {
      const site = toRelocationSite(feat);
      const isCurrent = site.site_id === activeSelectedSiteId;
      const res = isCurrent && assessment
        ? assessment
        : assessCapacity(site, targetPopulation, {
            max_safe_density_per_hectare: densityOverride,
            resource_multiplier: multiplierOverride
          });
      return { feature: feat, site, assessment: res };
    });
  }, [candidateFeatures, activeSelectedSiteId, assessment, targetPopulation, densityOverride, multiplierOverride]);

  const totalHeadroom = allAssessments.reduce((sum, item) => sum + (item.assessment.available_headroom ?? 0), 0);
  const totalCapacity = allAssessments.reduce((sum, item) => sum + (item.assessment.final_capacity ?? 0), 0);

  return (
    <main className="min-h-screen bg-[#090d16] p-4 text-slate-200 md:p-8">
      <div className="mx-auto max-w-7xl space-y-8">
        {/* Navigation & Header */}
        <header className="border-b border-slate-800 pb-4 space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="space-y-0.5">
              <span className="text-[11px] font-mono uppercase text-slate-400 block tracking-wider">
                SIH26191 • SDMA / NDRF Decision Support
              </span>
              <h1 className="text-xl md:text-2xl font-bold tracking-tight text-white">
                Relocation Site Carrying Capacity & Infrastructure Stress Model
              </h1>
              <p className="text-xs text-slate-400">
                Multi-criteria carrying capacity model: safe land area, density limits, and infrastructure stress constraints.
              </p>
            </div>
            <nav className="flex items-center gap-4 text-xs text-slate-400">
              <Link href="/" className="hover:text-white transition">
                ← Main Platform
              </Link>
              <Link href="/resources" className="hover:text-white transition">
                Relief Logistics Matrix →
              </Link>
            </nav>
          </div>

          <div className="flex items-center justify-between pt-1">
            <RegionSelector
              region={region}
              onSelectRegion={(r) => {
                setRegion(r);
                setSelectedSiteId("");
              }}
            />
          </div>
        </header>

        {/* Global Summary Cards */}
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          <div className="rounded border border-slate-800 bg-slate-900 p-4 space-y-1">
            <span className="text-xs text-slate-400 font-medium">Total Candidate Hubs</span>
            <p className="text-2xl font-bold font-mono text-white">{candidateFeatures.length}</p>
            <span className="text-[11px] text-slate-500 block">{region === "assam" ? "Assam regional shelters" : "Wayanad safe zones"}</span>
          </div>
          <div className="rounded border border-slate-800 bg-slate-900 p-4 space-y-1">
            <span className="text-xs text-slate-400 font-medium">Combined Capacity</span>
            <p className="text-2xl font-bold font-mono text-white">{totalCapacity.toLocaleString()}</p>
            <span className="text-[11px] text-slate-500 block">Maximum safe intake</span>
          </div>
          <div className="rounded border border-slate-800 bg-slate-900 p-4 space-y-1">
            <span className="text-xs text-slate-400 font-medium">Combined Headroom</span>
            <p className="text-2xl font-bold font-mono text-white">{totalHeadroom.toLocaleString()}</p>
            <span className="text-[11px] text-slate-500 block">Available safe headroom</span>
          </div>
          <div className="rounded border border-slate-800 bg-slate-900 p-4 space-y-1">
            <span className="text-xs text-slate-400 font-medium">Displaced Target</span>
            <p className="text-2xl font-bold font-mono text-white">{targetPopulation.toLocaleString()}</p>
            <span className="text-[11px] text-slate-500 block">People needing relocation</span>
          </div>
        </div>


        {/* Candidate Sites Comparison Grid */}
        <section className="rounded-lg border border-slate-800 bg-slate-900 p-4 md:p-5 space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-800 pb-3">
            <div>
              <h2 className="text-sm font-bold uppercase tracking-wider text-slate-200">Candidate Relocation Sites Overview</h2>
              <p className="text-xs text-slate-400">Select a site card to inspect detailed bottleneck constraints and run stress test scenarios.</p>
            </div>
            <div className="flex items-center gap-1.5 text-xs">
              <span className="text-slate-400 text-[11px]">Preset Origins:</span>
              {originFeatures.slice(0, 4).map((f) => (
                <button
                  key={f.properties.id}
                  onClick={() => setTargetPopulation(f.properties.affected_population ?? f.properties.current_population)}
                  className={`rounded border px-2 py-0.5 text-xs transition ${
                    targetPopulation === (f.properties.affected_population ?? f.properties.current_population)
                      ? "border-sky-500 bg-sky-950 text-sky-300 font-semibold"
                      : "border-slate-700 bg-slate-800 text-slate-300 hover:bg-slate-750"
                  }`}
                >
                  {f.properties.name} ({f.properties.affected_population ?? f.properties.current_population})
                </button>
              ))}
            </div>
          </div>

          <div className="grid gap-3 md:grid-cols-3">
            {allAssessments.map(({ site, assessment: itemAssessment }) => {
              const isSelected = site.site_id === activeSelectedSiteId;
              const tone = statusTone[itemAssessment.capacity_status];
              const occupancyPct =
                itemAssessment.final_capacity && itemAssessment.current_population
                  ? Math.min(100, Math.round((itemAssessment.current_population / itemAssessment.final_capacity) * 100))
                  : 0;

              return (
                <div
                  key={site.site_id}
                  onClick={() => {
                    setSelectedSiteId(site.site_id);
                    setShelterOverride(null);
                    setWaterOverride(null);
                    setHealthcareOverride(null);
                    setInfrastructureOverride(null);
                  }}
                  className={`cursor-pointer rounded-md border p-3.5 transition space-y-3 ${
                    isSelected
                      ? "border-sky-500 bg-slate-850 ring-1 ring-sky-500/20"
                      : "border-slate-800 bg-slate-850/60 hover:border-slate-700"
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="text-sm font-bold text-slate-100">{site.site_name}</h3>
                      <p className="text-[11px] text-slate-400">Safe land: <b className="font-mono">{site.safe_land_area_hectares} ha</b></p>
                    </div>
                    <span className={`rounded border px-2 py-0.5 text-[9px] font-semibold font-mono ${tone.badge}`}>
                      {itemAssessment.capacity_status}
                    </span>
                  </div>

                  <div className="space-y-1.5 text-xs border-t border-slate-800 pt-2">
                    <div className="flex justify-between text-slate-300">
                      <span className="text-slate-400">Available Headroom:</span>
                      <b className={`font-mono ${tone.text}`}>{itemAssessment.available_headroom?.toLocaleString() ?? "N/A"}</b>
                    </div>
                    <div className="flex justify-between text-slate-300">
                      <span className="text-slate-400">Safe Capacity:</span>
                      <span className="font-mono text-slate-200">{itemAssessment.final_capacity?.toLocaleString() ?? "N/A"}</span>
                    </div>
                    <div className="flex justify-between text-slate-300">
                      <span className="text-slate-400">Current Occupancy:</span>
                      <span className="font-mono text-slate-400">{site.current_population?.toLocaleString() ?? "0"}</span>
                    </div>
                    <div className="flex justify-between text-slate-300">
                      <span className="text-slate-400">Hazard Safety Score:</span>
                      <span className="font-mono text-sky-400">{((site.hazard_safety_score ?? 0.85) * 100).toFixed(0)}%</span>
                    </div>
                  </div>

                  {/* Visual Capacity Bar */}
                  <div>
                    <div className="flex justify-between text-[10px] text-slate-400 mb-1">
                      <span>Occupancy Load</span>
                      <span className="font-mono">{occupancyPct}%</span>
                    </div>
                    <div className="h-1.5 w-full overflow-hidden rounded bg-slate-800">
                      <div
                        className={`h-full ${tone.bg}`}
                        style={{ width: `${occupancyPct}%` }}
                      />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* Detailed Single Site Deep-Dive & Sandbox */}
        {assessment && baseSite && selectedFeature && (
          <div className="grid gap-4 lg:grid-cols-[1.3fr_1fr]">
            {/* Left Column: Detailed Site Assessment */}
            <section className="space-y-4">
              <div className="rounded-lg border border-slate-800 bg-slate-900 p-4 space-y-4">
                <div className="flex items-center justify-between border-b border-slate-800 pb-2.5">
                  <div>
                    <span className="text-[10px] uppercase font-bold tracking-wider text-sky-400">Site Assessment Breakdown</span>
                    <h2 className="text-lg font-bold text-slate-100 mt-0.5">{assessment.site_name}</h2>
                  </div>
                  <span className={`rounded border px-2.5 py-0.5 text-[10px] font-semibold font-mono ${statusTone[assessment.capacity_status].badge}`}>
                    {assessment.capacity_status}
                  </span>
                </div>

                {/* Step-by-Step Breakdown */}
                <div className="space-y-2.5">
                  <div className="rounded border border-slate-800 bg-slate-850 p-3">
                    <div className="flex justify-between text-xs">
                      <span className="font-semibold text-slate-200">1. Physical Capacity</span>
                      <span className="font-mono font-bold text-sky-400">{assessment.physical_capacity?.toLocaleString()} persons</span>
                    </div>
                    <p className="mt-1 text-[11px] text-slate-400">
                      Safe Land Area ({baseSite.safe_land_area_hectares} ha) × Density ({densityOverride} people/ha)
                    </p>
                  </div>

                  <div className="rounded border border-slate-800 bg-slate-850 p-3">
                    <div className="flex justify-between text-xs">
                      <span className="font-semibold text-slate-200">2. Adjusted Capacity (Resource Buffer)</span>
                      <span className="font-mono font-bold text-sky-400">{assessment.adjusted_capacity?.toLocaleString()} persons</span>
                    </div>
                    <p className="mt-1 text-[11px] text-slate-400">
                      Physical Capacity × Resource Multiplier ({multiplierOverride})
                    </p>
                  </div>

                  <div className="rounded border border-slate-800 bg-slate-850 p-3">
                    <div className="flex justify-between text-xs">
                      <span className="font-semibold text-slate-200">3. Sector Infrastructure Caps</span>
                      <span className="text-[10px] text-slate-400">Limiting Constraints</span>
                    </div>
                    <div className="mt-2 grid grid-cols-2 gap-2 text-xs">
                      <div className="rounded border border-slate-800 bg-slate-900 p-2">
                        <span className="text-[10px] uppercase font-semibold text-slate-400 block">Shelter Cap</span>
                        <p className="font-mono font-semibold text-slate-200 mt-0.5">{assessment.constraints.shelter_capacity?.toLocaleString() ?? "N/A"}</p>
                      </div>
                      <div className="rounded border border-slate-800 bg-slate-900 p-2">
                        <span className="text-[10px] uppercase font-semibold text-slate-400 block">Water Cap</span>
                        <p className="font-mono font-semibold text-slate-200 mt-0.5">{assessment.constraints.water_capacity?.toLocaleString() ?? "N/A"}</p>
                      </div>
                      <div className="rounded border border-slate-800 bg-slate-900 p-2">
                        <span className="text-[10px] uppercase font-semibold text-slate-400 block">Healthcare Cap</span>
                        <p className="font-mono font-semibold text-slate-200 mt-0.5">{assessment.constraints.healthcare_capacity?.toLocaleString() ?? "N/A"}</p>
                      </div>
                      <div className="rounded border border-slate-800 bg-slate-900 p-2">
                        <span className="text-[10px] uppercase font-semibold text-slate-400 block">Infra Cap</span>
                        <p className="font-mono font-semibold text-slate-200 mt-0.5">{assessment.constraints.infrastructure_capacity?.toLocaleString() ?? "N/A"}</p>
                      </div>
                    </div>
                  </div>

                  <div className="rounded border border-sky-600/60 bg-sky-950/30 p-3">
                    <div className="flex justify-between text-xs">
                      <span className="font-bold text-sky-300">Final Safe Carrying Capacity</span>
                      <span className="font-mono text-base font-bold text-sky-200">
                        {assessment.final_capacity?.toLocaleString() ?? "N/A"} persons
                      </span>
                    </div>
                    <div className="mt-1.5 flex justify-between text-xs text-slate-300 border-t border-slate-800/80 pt-1.5">
                      <span>Available Safe Headroom:</span>
                      <b className={`font-mono ${statusTone[assessment.capacity_status].text}`}>
                        {assessment.available_headroom?.toLocaleString() ?? "N/A"} persons
                      </b>
                    </div>
                  </div>
                </div>

                {/* Methodology details */}
                <div className="rounded border border-slate-800 bg-slate-950 p-2.5 text-[11px] text-slate-400">
                  <span className="text-slate-300 font-medium">Methodology: </span> {assessment.calculation_details}
                </div>
              </div>
            </section>

            {/* Right Column: Interactive Scenario & Override Controls */}
            <section className="space-y-4">
              <div className="rounded-lg border border-slate-800 bg-slate-900 p-4 space-y-3.5">
                <div>
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-200">Scenario Parameter Controls</h3>
                  <p className="text-[11px] text-slate-400 mt-0.5">
                    Modify demographic assumptions, planning density, and infrastructure constraints in real-time.
                  </p>
                </div>

                <div className="space-y-3 text-xs">
                  <div>
                    <label className="block text-slate-300 font-medium mb-1">
                      Target Displaced Population to Relocate:
                    </label>
                    <input
                      type="number"
                      min="1"
                      max="20000"
                      value={targetPopulation}
                      onChange={(e) => setTargetPopulation(Math.max(1, Number(e.target.value)))}
                      className="w-full rounded bg-slate-850 p-2 text-slate-100 border border-slate-700 focus:border-sky-500 focus:outline-none font-mono text-sm"
                    />
                  </div>

                  <div>
                    <div className="flex justify-between text-slate-300">
                      <span>Planning Density (people/ha):</span>
                      <b className="text-sky-400 font-mono">{densityOverride}</b>
                    </div>
                    <input
                      type="range"
                      min="50"
                      max="300"
                      step="10"
                      value={densityOverride}
                      onChange={(e) => setDensityOverride(Number(e.target.value))}
                      className="w-full mt-1"
                    />
                  </div>

                  <div>
                    <div className="flex justify-between text-slate-300">
                      <span>Resource Multiplier:</span>
                      <b className="text-sky-400 font-mono">{multiplierOverride.toFixed(2)}</b>
                    </div>
                    <input
                      type="range"
                      min="0.5"
                      max="1.2"
                      step="0.05"
                      value={multiplierOverride}
                      onChange={(e) => setMultiplierOverride(Number(e.target.value))}
                      className="w-full mt-1"
                    />
                  </div>

                  <div className="border-t border-slate-800 pt-3 space-y-2">
                    <h4 className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                      Site Specific Constraint Overrides ({selectedFeature.properties.name})
                    </h4>
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="text-[10px] text-slate-400 block mb-0.5">Shelter Cap</label>
                        <input
                          type="number"
                          placeholder={String(baseSite.shelter_capacity ?? "")}
                          value={shelterOverride ?? ""}
                          onChange={(e) => setShelterOverride(e.target.value ? Number(e.target.value) : null)}
                          className="w-full rounded bg-slate-850 p-1.5 text-xs text-slate-100 border border-slate-700 font-mono"
                        />
                      </div>
                      <div>
                        <label className="text-[10px] text-slate-400 block mb-0.5">Water Cap</label>
                        <input
                          type="number"
                          placeholder={String(baseSite.water_capacity ?? "")}
                          value={waterOverride ?? ""}
                          onChange={(e) => setWaterOverride(e.target.value ? Number(e.target.value) : null)}
                          className="w-full rounded bg-slate-850 p-1.5 text-xs text-slate-100 border border-slate-700 font-mono"
                        />
                      </div>
                      <div>
                        <label className="text-[10px] text-slate-400 block mb-0.5">Healthcare Cap</label>
                        <input
                          type="number"
                          placeholder={String(baseSite.healthcare_capacity ?? "")}
                          value={healthcareOverride ?? ""}
                          onChange={(e) => setHealthcareOverride(e.target.value ? Number(e.target.value) : null)}
                          className="w-full rounded bg-slate-850 p-1.5 text-xs text-slate-100 border border-slate-700 font-mono"
                        />
                      </div>
                      <div>
                        <label className="text-[10px] text-slate-400 block mb-0.5">Infra Cap</label>
                        <input
                          type="number"
                          placeholder={String(baseSite.infrastructure_capacity ?? "")}
                          value={infrastructureOverride ?? ""}
                          onChange={(e) => setInfrastructureOverride(e.target.value ? Number(e.target.value) : null)}
                          className="w-full rounded bg-slate-850 p-1.5 text-xs text-slate-100 border border-slate-700 font-mono"
                        />
                      </div>
                    </div>

                    <div className="mt-2.5 flex items-center justify-between pt-2 border-t border-slate-800">
                      <label className="flex items-center gap-2 text-xs text-slate-300 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={isAvailable}
                          onChange={(e) => setIsAvailable(e.target.checked)}
                          className="rounded bg-slate-800 text-sky-500"
                        />
                        Hub Available
                      </label>
                      <button
                        onClick={() => {
                          setShelterOverride(null);
                          setWaterOverride(null);
                          setHealthcareOverride(null);
                          setInfrastructureOverride(null);
                          setIsAvailable(true);
                        }}
                        className="text-[11px] text-sky-400 hover:underline"
                      >
                        Reset Overrides
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </section>
          </div>
        )}
      </div>
    </main>
  );
}
