"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { getRegionFeatures } from "@/lib/data";
import { buildRelocationPlan } from "@/lib/planning";
import { RESOURCE_ASSUMPTIONS } from "@/lib/resourceConfig";
import type { ResourceEstimate } from "@/types/relocation";
import type { RegionId } from "@/lib/types";
import { RegionSelector } from "@/components/RegionSelector";

interface ResourceConfigState {
  water_litres: number;
  shelter_occupancy: number;
  meals_per_day: number;
  vehicle_capacity: number;
  healthcare_unit_coverage: number;
  sanitation_unit_coverage: number;
}

export default function ResourcesPage() {
  const [region, setRegion] = useState<RegionId>("assam");
  const features = useMemo(() => getRegionFeatures(region), [region]);
  const originFeatures = useMemo(() => features.filter((f) => f.properties.role === "origin"), [features]);
  const candidateFeatures = useMemo(() => features.filter((f) => f.properties.role === "candidate"), [features]);

  const [selectedOriginId, setSelectedOriginId] = useState<string>("");
  const activeSelectedOriginId = originFeatures.some((f) => f.properties.id === selectedOriginId)
    ? selectedOriginId
    : originFeatures[0]?.properties.id ?? "";

  const [customPopulation, setCustomPopulation] = useState<number | null>(null);

  // Dynamic assumptions state
  const [assumptions, setAssumptions] = useState<ResourceConfigState>({
    water_litres: RESOURCE_ASSUMPTIONS.water_litres_per_person_per_day.value,
    shelter_occupancy: RESOURCE_ASSUMPTIONS.people_per_shelter_unit.value,
    meals_per_day: RESOURCE_ASSUMPTIONS.meals_per_person_per_day.value,
    vehicle_capacity: RESOURCE_ASSUMPTIONS.people_per_transport_vehicle.value,
    healthcare_unit_coverage: RESOURCE_ASSUMPTIONS.healthcare_capacity_per_unit.value,
    sanitation_unit_coverage: RESOURCE_ASSUMPTIONS.people_per_sanitation_unit.value
  });

  const selectedOrigin =
    originFeatures.find((f) => f.properties.id === activeSelectedOriginId) ?? originFeatures[0];
  const activePopulation =
    customPopulation ??
    (selectedOrigin?.properties?.affected_population ??
      selectedOrigin?.properties?.current_population ??
      1000);

  // Build relocation plan to get per-site allocation
  const plan = useMemo(() => {
    if (!selectedOrigin) return null;
    return buildRelocationPlan(selectedOrigin, features, activePopulation);
  }, [selectedOrigin, features, activePopulation]);

  // Compute resource estimates with current dynamic assumptions
  const dynamicEstimates: ResourceEstimate[] = useMemo(() => {
    const p = activePopulation;
    const ceil = Math.ceil;
    return [
      {
        resource: "water",
        required: p * assumptions.water_litres,
        available: null,
        deficit: null,
        unit: "litres/day",
        assumption: {
          ...RESOURCE_ASSUMPTIONS.water_litres_per_person_per_day,
          value: assumptions.water_litres
        },
        calculation: `Daily: ${p.toLocaleString()} people × ${assumptions.water_litres} L = ${(p * assumptions.water_litres).toLocaleString()} L (7-day buffer: ${(p * assumptions.water_litres * 7).toLocaleString()} L)`,
        confidence: "modeled"
      },
      {
        resource: "shelter",
        required: ceil(p / assumptions.shelter_occupancy),
        available: null,
        deficit: null,
        unit: "shelter units",
        assumption: {
          ...RESOURCE_ASSUMPTIONS.people_per_shelter_unit,
          value: assumptions.shelter_occupancy
        },
        calculation: `ceil(${p.toLocaleString()} ÷ ${assumptions.shelter_occupancy} people/unit) = ${ceil(p / assumptions.shelter_occupancy).toLocaleString()} shelter units`,
        confidence: "modeled"
      },
      {
        resource: "food",
        required: p * assumptions.meals_per_day,
        available: null,
        deficit: null,
        unit: "meals/day",
        assumption: {
          ...RESOURCE_ASSUMPTIONS.meals_per_person_per_day,
          value: assumptions.meals_per_day
        },
        calculation: `Daily: ${p.toLocaleString()} people × ${assumptions.meals_per_day} meals = ${(p * assumptions.meals_per_day).toLocaleString()} meals (7-day total: ${(p * assumptions.meals_per_day * 7).toLocaleString()} meals)`,
        confidence: "modeled"
      },
      {
        resource: "healthcare",
        required: ceil(p / assumptions.healthcare_unit_coverage),
        available: null,
        deficit: null,
        unit: "medical units",
        assumption: {
          ...RESOURCE_ASSUMPTIONS.healthcare_capacity_per_unit,
          value: assumptions.healthcare_unit_coverage
        },
        calculation: `ceil(${p.toLocaleString()} ÷ ${assumptions.healthcare_unit_coverage} people/unit) = ${ceil(p / assumptions.healthcare_unit_coverage).toLocaleString()} medical triage units`,
        confidence: "modeled"
      },
      {
        resource: "transport",
        required: ceil(p / assumptions.vehicle_capacity),
        available: null,
        deficit: null,
        unit: "vehicles / buses",
        assumption: {
          ...RESOURCE_ASSUMPTIONS.people_per_transport_vehicle,
          value: assumptions.vehicle_capacity
        },
        calculation: `ceil(${p.toLocaleString()} ÷ ${assumptions.vehicle_capacity} people/bus) = ${ceil(p / assumptions.vehicle_capacity).toLocaleString()} evacuation vehicles`,
        confidence: "modeled"
      },
      {
        resource: "sanitation",
        required: ceil(p / assumptions.sanitation_unit_coverage),
        available: null,
        deficit: null,
        unit: "sanitation units",
        assumption: {
          ...RESOURCE_ASSUMPTIONS.people_per_sanitation_unit,
          value: assumptions.sanitation_unit_coverage
        },
        calculation: `ceil(${p.toLocaleString()} ÷ ${assumptions.sanitation_unit_coverage} people/unit) = ${ceil(p / assumptions.sanitation_unit_coverage).toLocaleString()} hygiene/latrine units`,
        confidence: "modeled"
      }
    ];
  }, [activePopulation, assumptions]);

  const icons: Record<string, string> = {
    water: "💧",
    shelter: "⛺",
    food: "🍲",
    healthcare: "🚑",
    transport: "🚌",
    sanitation: "🚻"
  };

  return (
    <main className="min-h-screen bg-[#07111f] p-4 text-slate-100 md:p-7">
      <div className="mx-auto max-w-7xl">
        {/* Navigation & Header */}
        <header className="mb-6 border-b border-slate-700 pb-4 space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="text-xs font-bold uppercase tracking-[.2em] text-sky-400">SIH26191 · NDRF / SDMA Logistics Support</p>
              <h1 className="mt-1 text-3xl font-bold">Disaster Response Resource Planning Dashboard</h1>
              <p className="text-sm text-slate-400">
                Logistics and material requirements modeling for emergency relocation and shelter operations.
              </p>
            </div>
            <nav className="flex items-center gap-3 text-sm">
              <Link href="/" className="rounded-lg border border-slate-700 bg-slate-800/80 px-3 py-2 text-sky-300 hover:bg-slate-700">
                ← Main Platform
              </Link>
              <Link href="/capacity" className="rounded-lg border border-slate-700 bg-slate-800/80 px-3 py-2 text-sky-300 hover:bg-slate-700">
                Capacity Dashboard →
              </Link>
            </nav>
          </div>

          <div className="flex items-center justify-between pt-2 border-t border-slate-800">
            <RegionSelector
              region={region}
              onSelectRegion={(r) => {
                setRegion(r);
                setSelectedOriginId("");
                setCustomPopulation(null);
              }}
            />
          </div>
        </header>

        {/* Population & Scenario Selector */}
        <section className="mb-6 rounded-xl border border-slate-700 bg-slate-900/70 p-5">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <h2 className="text-lg font-semibold text-slate-100">Displacement Scenario</h2>
              <p className="text-xs text-slate-400">Select an affected origin village or input a custom disaster population.</p>
            </div>
            <div className="flex flex-wrap items-center gap-2 text-sm">
              <span className="text-xs text-slate-400">High-Risk Origins:</span>
              {originFeatures.slice(0, 6).map((feat) => (
                <button
                  key={feat.properties.id}
                  onClick={() => {
                    setSelectedOriginId(feat.properties.id);
                    setCustomPopulation(null);
                  }}
                  className={`rounded-lg border px-3 py-1.5 text-xs transition ${
                    activeSelectedOriginId === feat.properties.id && customPopulation === null
                      ? "border-sky-400 bg-sky-500/20 text-sky-200 font-semibold"
                      : "border-slate-700 bg-slate-800 text-slate-300 hover:bg-slate-700"
                  }`}
                >
                  {feat.properties.name} ({feat.properties.affected_population ?? feat.properties.current_population})
                </button>
              ))}
            </div>
          </div>

          {selectedOrigin && (
            <div className="mt-4 grid gap-4 md:grid-cols-3">
              <div className="rounded-lg bg-slate-800/80 p-3">
                <span className="text-xs text-slate-400">Target Settlement:</span>
                <p className="text-lg font-bold text-slate-100">{selectedOrigin.properties.name}</p>
                <p className="text-xs text-red-300">
                  {selectedOrigin.properties.district ? `District: ${selectedOrigin.properties.district} · ` : ""}
                  Hazard: {selectedOrigin.properties.flood_hazard_class ?? selectedOrigin.properties.hazard_class_landslide}
                </p>
              </div>
              <div className="rounded-lg bg-slate-800/80 p-3">
                <span className="text-xs text-slate-400">Population to Provision:</span>
                <p className="text-lg font-bold text-sky-300">{activePopulation.toLocaleString()} people</p>
                <p className="text-xs text-slate-400">{customPopulation ? "Custom count override" : "Verified SitRep baseline"}</p>
              </div>
              <div className="rounded-lg bg-slate-800/80 p-3">
                <label className="text-xs text-slate-400 block mb-1">Custom Population Input:</label>
                <input
                  type="number"
                  min="1"
                  max="50000"
                  value={activePopulation}
                  onChange={(e) => setCustomPopulation(Math.max(1, Number(e.target.value)))}
                  className="w-full rounded bg-slate-900 px-3 py-1 text-sm text-slate-100 border border-slate-700 focus:border-sky-400 focus:outline-none"
                />
              </div>
            </div>
          )}
        </section>

        {/* Global Resource Requirements Cards */}
        <section className="mb-6">
          <h2 className="text-lg font-semibold text-slate-100 mb-3">Estimated Resource Requirements</h2>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {dynamicEstimates.map((item) => (
              <div
                key={item.resource}
                className="rounded-xl border border-slate-700 bg-slate-900/70 p-5 transition hover:border-slate-600"
              >
                <div className="flex items-center justify-between">
                  <span className="text-2xl">{icons[item.resource] ?? "📦"}</span>
                  <span className="rounded-full bg-slate-800 border border-slate-700 px-2 py-0.5 text-xs text-slate-400">
                    {item.confidence}
                  </span>
                </div>
                <h3 className="mt-3 text-base font-semibold capitalize text-slate-100">
                  {item.assumption.name}
                </h3>
                <p className="mt-1 font-mono text-2xl font-bold text-sky-300">
                  {item.required.toLocaleString()} <span className="text-xs font-normal text-slate-400">{item.unit}</span>
                </p>
                <p className="mt-2 text-xs text-slate-400">{item.calculation}</p>
                <div className="mt-3 border-t border-slate-800 pt-2 text-[11px] text-slate-500">
                  Assumption: {item.assumption.value} {item.assumption.unit} ({item.assumption.source})
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Allocation per Site and Dynamic Assumptions */}
        {plan && (
          <div className="grid gap-6 lg:grid-cols-[1.2fr_1fr]">
            {/* Per-Site Relocation Breakdown */}
            <section className="rounded-xl border border-slate-700 bg-slate-900/70 p-5">
              <h2 className="text-lg font-semibold text-slate-100">Per-Site Relocation & Resource Breakdown</h2>
              <p className="text-xs text-slate-400 mb-4">
                Displaced population allocated across candidate sites with site-specific daily resource demand.
              </p>

              <div className="space-y-3">
                {plan.allocation.allocations.map((alloc) => {
                  const pop = alloc.allocated_population;
                  const waterPerDay = pop * assumptions.water_litres;
                  const shelterUnits = Math.ceil(pop / assumptions.shelter_occupancy);
                  const mealsPerDay = pop * assumptions.meals_per_day;

                  return (
                    <div key={alloc.site_id} className="rounded-lg border border-slate-800 bg-slate-900/90 p-4">
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <div>
                          <h3 className="font-bold text-slate-100">{alloc.site_name}</h3>
                          <p className="text-xs text-slate-400">
                            Allocated: <b className="text-emerald-300">{pop.toLocaleString()} people</b> · Distance: {alloc.distance_km} km
                          </p>
                        </div>
                        <span className="rounded-full bg-slate-800 px-2.5 py-1 text-xs text-sky-300">
                          Suitability: {alloc.suitability_score.toFixed(3)}
                        </span>
                      </div>

                      <div className="mt-3 grid grid-cols-3 gap-2 text-xs">
                        <div className="rounded bg-slate-800/80 p-2">
                          <span className="text-slate-400">💧 Water:</span>
                          <p className="font-semibold text-slate-200">{waterPerDay.toLocaleString()} L/day</p>
                        </div>
                        <div className="rounded bg-slate-800/80 p-2">
                          <span className="text-slate-400">⛺ Shelter:</span>
                          <p className="font-semibold text-slate-200">{shelterUnits.toLocaleString()} units</p>
                        </div>
                        <div className="rounded bg-slate-800/80 p-2">
                          <span className="text-slate-400">🍲 Meals:</span>
                          <p className="font-semibold text-slate-200">{mealsPerDay.toLocaleString()} /day</p>
                        </div>
                      </div>
                    </div>
                  );
                })}

                {plan.allocation.unallocated_population > 0 && (
                  <div className="rounded-lg border border-red-800 bg-red-950/40 p-4 text-sm">
                    <b className="text-red-300">⚠️ Unallocated Population: {plan.allocation.unallocated_population.toLocaleString()}</b>
                    <p className="mt-1 text-xs text-red-200">
                      Existing candidate site headroom is insufficient for the full displaced target. Additional safe land or higher density assumptions required.
                    </p>
                  </div>
                )}
              </div>
            </section>

            {/* Configurable Assumption Sliders */}
            <section className="rounded-xl border border-slate-700 bg-slate-900/70 p-5">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold text-slate-100">Logistics Assumption Controls</h2>
                <button
                  onClick={() =>
                    setAssumptions({
                      water_litres: RESOURCE_ASSUMPTIONS.water_litres_per_person_per_day.value,
                      shelter_occupancy: RESOURCE_ASSUMPTIONS.people_per_shelter_unit.value,
                      meals_per_day: RESOURCE_ASSUMPTIONS.meals_per_person_per_day.value,
                      vehicle_capacity: RESOURCE_ASSUMPTIONS.people_per_transport_vehicle.value,
                      healthcare_unit_coverage: RESOURCE_ASSUMPTIONS.healthcare_capacity_per_unit.value,
                      sanitation_unit_coverage: RESOURCE_ASSUMPTIONS.people_per_sanitation_unit.value
                    })
                  }
                  className="text-xs text-sky-400 hover:underline"
                >
                  Reset Defaults
                </button>
              </div>
              <p className="mt-1 text-xs text-slate-400 mb-4">
                Modify standard disaster relief factors (Sphere Standards vs NDRF field scenario).
              </p>

              <div className="space-y-4 text-sm">
                <div>
                  <div className="flex justify-between">
                    <span className="text-slate-300">Water (Litres/person/day)</span>
                    <b className="text-sky-300">{assumptions.water_litres} L</b>
                  </div>
                  <input
                    type="range"
                    min="15"
                    max="100"
                    step="5"
                    value={assumptions.water_litres}
                    onChange={(e) => setAssumptions({ ...assumptions, water_litres: Number(e.target.value) })}
                    className="w-full mt-1"
                  />
                  <span className="text-[11px] text-slate-500">Sphere emergency minimum is ~15-20L; 50L covers domestic buffer.</span>
                </div>

                <div>
                  <div className="flex justify-between">
                    <span className="text-slate-300">Shelter Occupancy (people/unit)</span>
                    <b className="text-sky-300">{assumptions.shelter_occupancy} people</b>
                  </div>
                  <input
                    type="range"
                    min="2"
                    max="10"
                    step="1"
                    value={assumptions.shelter_occupancy}
                    onChange={(e) => setAssumptions({ ...assumptions, shelter_occupancy: Number(e.target.value) })}
                    className="w-full mt-1"
                  />
                </div>

                <div>
                  <div className="flex justify-between">
                    <span className="text-slate-300">Meals per Person / Day</span>
                    <b className="text-sky-300">{assumptions.meals_per_day}</b>
                  </div>
                  <input
                    type="range"
                    min="1"
                    max="4"
                    step="1"
                    value={assumptions.meals_per_day}
                    onChange={(e) => setAssumptions({ ...assumptions, meals_per_day: Number(e.target.value) })}
                    className="w-full mt-1"
                  />
                </div>

                <div>
                  <div className="flex justify-between">
                    <span className="text-slate-300">Evacuation Vehicle Capacity</span>
                    <b className="text-sky-300">{assumptions.vehicle_capacity} people/bus</b>
                  </div>
                  <input
                    type="range"
                    min="10"
                    max="60"
                    step="5"
                    value={assumptions.vehicle_capacity}
                    onChange={(e) => setAssumptions({ ...assumptions, vehicle_capacity: Number(e.target.value) })}
                    className="w-full mt-1"
                  />
                </div>

                <div>
                  <div className="flex justify-between">
                    <span className="text-slate-300">Healthcare Unit Coverage</span>
                    <b className="text-sky-300">{assumptions.healthcare_unit_coverage} people/unit</b>
                  </div>
                  <input
                    type="range"
                    min="50"
                    max="1000"
                    step="25"
                    value={assumptions.healthcare_unit_coverage}
                    onChange={(e) => setAssumptions({ ...assumptions, healthcare_unit_coverage: Number(e.target.value) })}
                    className="w-full mt-1"
                  />
                </div>

                <div>
                  <div className="flex justify-between">
                    <span className="text-slate-300">Sanitation Unit Coverage</span>
                    <b className="text-sky-300">{assumptions.sanitation_unit_coverage} people/unit</b>
                  </div>
                  <input
                    type="range"
                    min="10"
                    max="50"
                    step="5"
                    value={assumptions.sanitation_unit_coverage}
                    onChange={(e) => setAssumptions({ ...assumptions, sanitation_unit_coverage: Number(e.target.value) })}
                    className="w-full mt-1"
                  />
                </div>
              </div>
            </section>
          </div>
        )}
      </div>
    </main>
  );
}
