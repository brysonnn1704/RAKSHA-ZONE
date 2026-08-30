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
  SUFFICIENT: { badge: "bg-emerald-950/80 text-emerald-300 border-emerald-700", text: "text-emerald-300", bg: "bg-emerald-500" },
  LIMITED: { badge: "bg-orange-950/80 text-orange-300 border-orange-700", text: "text-orange-300", bg: "bg-orange-500" },
  INSUFFICIENT: { badge: "bg-red-950/80 text-red-300 border-red-700", text: "text-red-300", bg: "bg-red-500" },
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
    <main className="min-h-screen bg-[#07111f] p-4 text-slate-100 md:p-7">
      <div className="mx-auto max-w-7xl">
        {/* Navigation & Header */}
        <header className="mb-6 border-b border-slate-700 pb-4 space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="text-xs font-bold uppercase tracking-[.2em] text-sky-400">SIH26191 · SDMA / NDRF Decision Support</p>
              <h1 className="mt-1 text-3xl font-bold">Relocation Site Carrying Capacity Dashboard</h1>
              <p className="text-sm text-slate-400">
                Multi-criteria carrying capacity model: safe land area, density limits, and infrastructure stress constraints.
              </p>
            </div>
            <nav className="flex items-center gap-3 text-sm">
              <Link href="/" className="rounded-lg border border-slate-700 bg-slate-800/80 px-3 py-2 text-sky-300 hover:bg-slate-700">
                ← Main Platform
              </Link>
              <Link href="/resources" className="rounded-lg border border-slate-700 bg-slate-800/80 px-3 py-2 text-sky-300 hover:bg-slate-700">
                Resource Dashboard →
              </Link>
            </nav>
          </div>

          <div className="flex items-center justify-between pt-2 border-t border-slate-800">
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
        <div className="mb-6 grid grid-cols-2 gap-4 sm:grid-cols-4">
          <div className="rounded-xl border border-slate-700 bg-slate-900/70 p-4">
            <p className="text-xs text-slate-400">Total Candidate Sites</p>
            <p className="mt-1 text-2xl font-bold text-sky-300">{candidateFeatures.length}</p>
            <p className="text-xs text-slate-500">{region === "assam" ? "Assam regional shelters" : "Wayanad safe zones"}</p>
          </div>
          <div className="rounded-xl border border-slate-700 bg-slate-900/70 p-4">
            <p className="text-xs text-slate-400">Combined Final Capacity</p>
            <p className="mt-1 text-2xl font-bold text-slate-100">{totalCapacity.toLocaleString()}</p>
            <p className="text-xs text-slate-500">Maximum safe intake</p>
          </div>
          <div className="rounded-xl border border-slate-700 bg-slate-900/70 p-4">
            <p className="text-xs text-slate-400">Combined Headroom</p>
            <p className="mt-1 text-2xl font-bold text-emerald-300">{totalHeadroom.toLocaleString()}</p>
            <p className="text-xs text-slate-500">Available across all sites</p>
          </div>
          <div className="rounded-xl border border-slate-700 bg-slate-900/70 p-4">
            <p className="text-xs text-slate-400">Displaced Target</p>
            <p className="mt-1 text-2xl font-bold text-orange-300">{targetPopulation.toLocaleString()}</p>
            <p className="text-xs text-slate-500">People needing relocation</p>
          </div>
        </div>

        {/* Candidate Sites Comparison Grid */}
        <section className="mb-6 rounded-xl border border-slate-700 bg-slate-900/70 p-5">
          <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
            <div>
              <h2 className="text-lg font-semibold text-slate-100">Candidate Relocation Sites Overview</h2>
              <p className="text-xs text-slate-400">Click a site card to inspect detailed bottleneck constraints and stress test scenarios.</p>
            </div>
            <div className="flex items-center gap-2 text-xs">
              <span className="text-slate-400">Preset Origin Pop:</span>
              {originFeatures.slice(0, 4).map((f) => (
                <button
                  key={f.properties.id}
                  onClick={() => setTargetPopulation(f.properties.affected_population ?? f.properties.current_population)}
                  className={`rounded border px-2 py-1 transition ${
                    targetPopulation === (f.properties.affected_population ?? f.properties.current_population)
                      ? "border-sky-400 bg-sky-500/20 text-sky-200"
                      : "border-slate-700 bg-slate-800 text-slate-300 hover:bg-slate-700"
                  }`}
                >
                  {f.properties.name} ({f.properties.affected_population ?? f.properties.current_population})
                </button>
              ))}
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-3">
            {allAssessments.map(({ feature, site, assessment: itemAssessment }) => {
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
                  className={`cursor-pointer rounded-xl border p-5 transition ${
                    isSelected
                      ? "border-sky-400 bg-sky-950/30 shadow-lg ring-1 ring-sky-400"
                      : "border-slate-800 bg-slate-900/90 hover:border-slate-700 hover:bg-slate-850"
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="text-lg font-bold text-slate-100">{site.site_name}</h3>
                      <p className="text-xs text-slate-400">Safe land: {site.safe_land_area_hectares} ha</p>
                    </div>
                    <span className={`rounded-full border px-2.5 py-0.5 text-xs font-semibold ${tone.badge}`}>
                      {itemAssessment.capacity_status}
                    </span>
                  </div>

                  <div className="mt-4 space-y-2 text-sm">
                    <div className="flex justify-between text-slate-300">
                      <span>Available Headroom:</span>
                      <b className={tone.text}>{itemAssessment.available_headroom?.toLocaleString() ?? "N/A"} people</b>
                    </div>
                    <div className="flex justify-between text-slate-400 text-xs">
                      <span>Final Safe Capacity:</span>
                      <span>{itemAssessment.final_capacity?.toLocaleString() ?? "N/A"}</span>
                    </div>
                    <div className="flex justify-between text-slate-400 text-xs">
                      <span>Current Occupancy:</span>
                      <span>{site.current_population?.toLocaleString() ?? "0"}</span>
                    </div>
                    <div className="flex justify-between text-slate-400 text-xs">
                      <span>Hazard Safety Score:</span>
                      <span className="text-sky-300">{((site.hazard_safety_score ?? 0.85) * 100).toFixed(0)}%</span>
                    </div>
                  </div>

                  {/* Visual Capacity Bar */}
                  <div className="mt-4">
                    <div className="flex justify-between text-xs text-slate-400 mb-1">
                      <span>Current Load</span>
                      <span>{occupancyPct}%</span>
                    </div>
                    <div className="h-2 w-full overflow-hidden rounded-full bg-slate-800">
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
          <div className="grid gap-6 lg:grid-cols-[1.3fr_1fr]">
            {/* Left Column: Detailed Site Assessment */}
            <section className="space-y-6">
              <div className="rounded-xl border border-slate-700 bg-slate-900/70 p-5">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs uppercase tracking-wider text-sky-400">Deep-Dive Analysis</p>
                    <h2 className="text-2xl font-bold text-slate-100">{assessment.site_name}</h2>
                  </div>
                  <span className={`rounded-full border px-3 py-1 text-xs font-semibold ${statusTone[assessment.capacity_status].badge}`}>
                    {assessment.capacity_status}
                  </span>
                </div>

                {/* Step-by-Step Breakdown */}
                <div className="mt-6 space-y-4">
                  <div className="rounded-lg bg-slate-800/80 p-4">
                    <div className="flex justify-between text-sm">
                      <span className="font-semibold text-slate-200">1. Physical Capacity</span>
                      <span className="font-mono text-sky-300">{assessment.physical_capacity?.toLocaleString()} people</span>
                    </div>
                    <p className="mt-1 text-xs text-slate-400">
                      Safe Land Area ({baseSite.safe_land_area_hectares} ha) × Density ({densityOverride} people/ha)
                    </p>
                  </div>

                  <div className="rounded-lg bg-slate-800/80 p-4">
                    <div className="flex justify-between text-sm">
                      <span className="font-semibold text-slate-200">2. Adjusted Capacity (Resource Buffer)</span>
                      <span className="font-mono text-sky-300">{assessment.adjusted_capacity?.toLocaleString()} people</span>
                    </div>
                    <p className="mt-1 text-xs text-slate-400">
                      Physical Capacity × Resource Multiplier ({multiplierOverride})
                    </p>
                  </div>

                  <div className="rounded-lg bg-slate-800/80 p-4">
                    <div className="flex justify-between text-sm">
                      <span className="font-semibold text-slate-200">3. Sector Infrastructure Caps</span>
                      <span className="text-xs text-slate-400">Limiting Constraints</span>
                    </div>
                    <div className="mt-3 grid grid-cols-2 gap-3 text-xs">
                      <div className="rounded border border-slate-700 bg-slate-900 p-2">
                        <span className="text-slate-400">🏠 Shelter Cap:</span>
                        <p className="font-semibold text-slate-200">{assessment.constraints.shelter_capacity?.toLocaleString() ?? "N/A"}</p>
                      </div>
                      <div className="rounded border border-slate-700 bg-slate-900 p-2">
                        <span className="text-slate-400">💧 Water Cap:</span>
                        <p className="font-semibold text-slate-200">{assessment.constraints.water_capacity?.toLocaleString() ?? "N/A"}</p>
                      </div>
                      <div className="rounded border border-slate-700 bg-slate-900 p-2">
                        <span className="text-slate-400">🚑 Healthcare Cap:</span>
                        <p className="font-semibold text-slate-200">{assessment.constraints.healthcare_capacity?.toLocaleString() ?? "N/A"}</p>
                      </div>
                      <div className="rounded border border-slate-700 bg-slate-900 p-2">
                        <span className="text-slate-400">⚡ Infra Cap:</span>
                        <p className="font-semibold text-slate-200">{assessment.constraints.infrastructure_capacity?.toLocaleString() ?? "N/A"}</p>
                      </div>
                    </div>
                  </div>

                  <div className="rounded-lg border border-sky-500/40 bg-sky-950/30 p-4">
                    <div className="flex justify-between text-sm">
                      <span className="font-bold text-sky-300">Final Binding Capacity</span>
                      <span className="font-mono text-lg font-bold text-sky-200">
                        {assessment.final_capacity?.toLocaleString() ?? "N/A"} people
                      </span>
                    </div>
                    <div className="mt-2 flex justify-between text-xs text-slate-300">
                      <span>Available Headroom for Relocation:</span>
                      <b className={statusTone[assessment.capacity_status].text}>
                        {assessment.available_headroom?.toLocaleString() ?? "N/A"} people
                      </b>
                    </div>
                  </div>
                </div>

                {/* Methodology details */}
                <div className="mt-5 rounded-lg border border-slate-800 bg-slate-950/50 p-3 text-xs text-slate-400">
                  <b>Calculation Methodology:</b> {assessment.calculation_details}
                </div>
              </div>
            </section>

            {/* Right Column: Interactive Scenario & Override Controls */}
            <section className="space-y-6">
              <div className="rounded-xl border border-slate-700 bg-slate-900/70 p-5">
                <h3 className="font-semibold text-slate-100">Live Scenario & Stress Testing</h3>
                <p className="mt-1 text-xs text-slate-400">
                  Adjust demographic, land planning, and critical infrastructure assumptions in real-time.
                </p>

                <div className="mt-4 space-y-4 text-sm">
                  <div>
                    <label className="block text-slate-300">
                      Target Displaced Population to Relocate
                    </label>
                    <input
                      type="number"
                      min="1"
                      max="20000"
                      value={targetPopulation}
                      onChange={(e) => setTargetPopulation(Math.max(1, Number(e.target.value)))}
                      className="mt-1 w-full rounded bg-slate-800 p-2 text-slate-100 border border-slate-700 focus:border-sky-400 focus:outline-none"
                    />
                  </div>

                  <div>
                    <div className="flex justify-between">
                      <span className="text-slate-300">Planning Density (people/ha)</span>
                      <b className="text-sky-300">{densityOverride}</b>
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
                    <div className="flex justify-between">
                      <span className="text-slate-300">Resource Multiplier</span>
                      <b className="text-sky-300">{multiplierOverride.toFixed(2)}</b>
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

                  <div className="border-t border-slate-800 pt-3">
                    <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">
                      Site-Specific Constraint Overrides ({selectedFeature.properties.name})
                    </h4>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="text-xs text-slate-400">Shelter Cap</label>
                        <input
                          type="number"
                          placeholder={String(baseSite.shelter_capacity ?? "")}
                          value={shelterOverride ?? ""}
                          onChange={(e) => setShelterOverride(e.target.value ? Number(e.target.value) : null)}
                          className="mt-1 w-full rounded bg-slate-800 p-1.5 text-xs text-slate-100 border border-slate-700"
                        />
                      </div>
                      <div>
                        <label className="text-xs text-slate-400">Water Cap</label>
                        <input
                          type="number"
                          placeholder={String(baseSite.water_capacity ?? "")}
                          value={waterOverride ?? ""}
                          onChange={(e) => setWaterOverride(e.target.value ? Number(e.target.value) : null)}
                          className="mt-1 w-full rounded bg-slate-800 p-1.5 text-xs text-slate-100 border border-slate-700"
                        />
                      </div>
                      <div>
                        <label className="text-xs text-slate-400">Healthcare Cap</label>
                        <input
                          type="number"
                          placeholder={String(baseSite.healthcare_capacity ?? "")}
                          value={healthcareOverride ?? ""}
                          onChange={(e) => setHealthcareOverride(e.target.value ? Number(e.target.value) : null)}
                          className="mt-1 w-full rounded bg-slate-800 p-1.5 text-xs text-slate-100 border border-slate-700"
                        />
                      </div>
                      <div>
                        <label className="text-xs text-slate-400">Infrastructure Cap</label>
                        <input
                          type="number"
                          placeholder={String(baseSite.infrastructure_capacity ?? "")}
                          value={infrastructureOverride ?? ""}
                          onChange={(e) => setInfrastructureOverride(e.target.value ? Number(e.target.value) : null)}
                          className="mt-1 w-full rounded bg-slate-800 p-1.5 text-xs text-slate-100 border border-slate-700"
                        />
                      </div>
                    </div>

                    <div className="mt-3 flex items-center justify-between">
                      <label className="flex items-center gap-2 text-xs text-slate-300 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={isAvailable}
                          onChange={(e) => setIsAvailable(e.target.checked)}
                          className="rounded bg-slate-800 text-sky-500"
                        />
                        Site Available for Relocation
                      </label>
                      <button
                        onClick={() => {
                          setShelterOverride(null);
                          setWaterOverride(null);
                          setHealthcareOverride(null);
                          setInfrastructureOverride(null);
                          setIsAvailable(true);
                        }}
                        className="text-xs text-sky-400 hover:underline"
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
