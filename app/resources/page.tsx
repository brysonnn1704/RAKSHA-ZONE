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
  const [region, setRegion] = useState<RegionId>("nepal");
  const features = useMemo(() => getRegionFeatures(region), [region]);
  const originFeatures = useMemo(() => features.filter((f) => f.properties.role === "origin"), [features]);

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

  return (
    <main className="min-h-screen bg-slate-50 p-4 text-slate-900 md:p-8">
      <div className="mx-auto max-w-7xl space-y-6">
        {/* Navigation & Header */}
        <header className="border-b border-slate-200 pb-4 space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="space-y-0.5">
              <span className="text-[11px] font-mono uppercase text-slate-500 block tracking-wider font-bold">
                SIH26191 • NDRF / SDMA Logistics Support
              </span>
              <h1 className="text-xl md:text-2xl font-bold tracking-tight text-slate-900">
                Disaster Response Lifeline Resource Planning & Logistics Engine
              </h1>
              <p className="text-xs text-slate-600">
                Logistics and material requirements modeling for emergency relocation and shelter operations.
              </p>
            </div>
            <nav className="flex items-center gap-4 text-xs font-semibold text-slate-600">
              <Link href="/" className="text-sky-700 hover:underline">
                ← Main Platform
              </Link>
              <Link href="/capacity" className="text-sky-700 hover:underline">
                Capacity Dashboard →
              </Link>
            </nav>
          </div>

          <div className="flex items-center justify-between pt-1">
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
        <section className="rounded-lg border border-slate-200 bg-white p-4 space-y-3.5 shadow-2xs">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-2.5">
            <div>
              <h2 className="text-sm font-bold uppercase tracking-wider text-slate-800">Displacement Scenario Parameters</h2>
              <p className="text-xs text-slate-500">Select an affected origin village or input a custom disaster population.</p>
            </div>
            <div className="flex flex-wrap items-center gap-1.5 text-xs">
              <span className="text-slate-500 text-[11px] font-semibold">Origins:</span>
              {originFeatures.slice(0, 6).map((feat) => (
                <button
                  key={feat.properties.id}
                  onClick={() => {
                    setSelectedOriginId(feat.properties.id);
                    setCustomPopulation(null);
                  }}
                  className={`rounded border px-2 py-0.5 text-xs transition font-semibold ${
                    activeSelectedOriginId === feat.properties.id && customPopulation === null
                      ? "border-sky-500 bg-sky-50 text-sky-900"
                      : "border-slate-300 bg-slate-100 text-slate-700 hover:bg-slate-200"
                  }`}
                >
                  {feat.properties.name} ({feat.properties.affected_population ?? feat.properties.current_population})
                </button>
              ))}
            </div>
          </div>

          {selectedOrigin && (
            <div className="grid gap-3 md:grid-cols-3 text-xs">
              <div className="rounded-lg border border-slate-200 bg-slate-50 p-2.5">
                <span className="text-[10px] uppercase font-bold text-slate-500">Target Settlement</span>
                <p className="text-sm font-bold text-slate-900 mt-0.5">{selectedOrigin.properties.name}</p>
                <p className="text-[11px] text-orange-700 font-medium mt-0.5">
                  {selectedOrigin.properties.district ? `District: ${selectedOrigin.properties.district} · ` : ""}
                  Hazard: {selectedOrigin.properties.flood_hazard_class ?? selectedOrigin.properties.hazard_class_landslide}
                </p>
              </div>
              <div className="rounded-lg border border-slate-200 bg-slate-50 p-2.5">
                <span className="text-[10px] uppercase font-bold text-slate-500">Target Displaced Population</span>
                <p className="text-sm font-bold font-mono text-sky-700 mt-0.5">{activePopulation.toLocaleString()} persons</p>
                <p className="text-[11px] text-slate-500 mt-0.5">{customPopulation ? "Custom count override" : "Verified SitRep baseline"}</p>
              </div>
              <div className="rounded-lg border border-slate-200 bg-slate-50 p-2.5">
                <label className="text-[10px] uppercase font-bold text-slate-500 block mb-1">Custom Population Input</label>
                <input
                  type="number"
                  min="1"
                  max="50000"
                  value={activePopulation}
                  onChange={(e) => setCustomPopulation(Math.max(1, Number(e.target.value)))}
                  className="w-full rounded bg-white px-2 py-1 text-xs text-slate-900 border border-slate-300 focus:border-sky-500 focus:outline-none font-mono font-bold"
                />
              </div>
            </div>
          )}
        </section>

        {/* Global Resource Requirements Cards */}
        <section className="space-y-3">
          <h2 className="text-xs font-bold uppercase tracking-wider text-slate-700">Total Commodity & Lifeline Requirements</h2>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {dynamicEstimates.map((item) => (
              <div
                key={item.resource}
                className="rounded-lg border border-slate-200 bg-white p-3.5 space-y-2 shadow-2xs"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-800">
                    {item.assumption.name}
                  </span>
                  <span className="rounded bg-slate-100 border border-slate-300 px-1.5 py-0.5 text-[9px] font-mono font-bold text-slate-700">
                    {item.confidence}
                  </span>
                </div>
                <p className="font-mono text-xl font-bold text-sky-700">
                  {item.required.toLocaleString()} <span className="text-xs font-medium text-slate-500">{item.unit}</span>
                </p>
                <p className="text-[11px] text-slate-600 leading-snug">{item.calculation}</p>
                <div className="border-t border-slate-100 pt-1.5 text-[10px] text-slate-500">
                  Norm: {item.assumption.value} {item.assumption.unit} ({item.assumption.source})
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Allocation per Site and Dynamic Assumptions */}
        {plan && (
          <div className="grid gap-4 lg:grid-cols-[1.2fr_1fr]">
            {/* Per-Site Relocation Breakdown */}
            <section className="rounded-lg border border-slate-200 bg-white p-4 space-y-3 shadow-2xs">
              <h2 className="text-xs font-bold uppercase tracking-wider text-slate-800">Per-Site Relocation & Commodity Breakdown</h2>
              <p className="text-[11px] text-slate-500">
                Displaced population allocated across candidate sites with site-specific daily commodity demand.
              </p>

              <div className="space-y-2.5">
                {plan.allocation.allocations.map((alloc) => {
                  const pop = alloc.allocated_population;
                  const waterPerDay = pop * assumptions.water_litres;
                  const shelterUnits = Math.ceil(pop / assumptions.shelter_occupancy);
                  const mealsPerDay = pop * assumptions.meals_per_day;

                  return (
                    <div key={alloc.site_id} className="rounded-lg border border-slate-200 bg-slate-50 p-3 space-y-2">
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <div>
                          <h3 className="text-xs font-bold text-slate-900">{alloc.site_name}</h3>
                          <p className="text-[11px] text-slate-600">
                            Allocated: <b className="font-mono text-emerald-700 font-bold">{pop.toLocaleString()}</b> · Distance: <span className="font-mono">{alloc.distance_km} km</span>
                          </p>
                        </div>
                        <span className="rounded bg-sky-50 border border-sky-300 px-2 py-0.5 text-[10px] font-mono font-bold text-sky-800">
                          Suitability: {alloc.suitability_score.toFixed(3)}
                        </span>
                      </div>

                      <div className="grid grid-cols-3 gap-2 text-[11px] border-t border-slate-200 pt-2">
                        <div className="rounded bg-white p-1.5 border border-slate-200">
                          <span className="text-[10px] text-slate-500 block">Water / Day</span>
                          <p className="font-mono font-bold text-slate-900">{waterPerDay.toLocaleString()} L</p>
                        </div>
                        <div className="rounded bg-white p-1.5 border border-slate-200">
                          <span className="text-[10px] text-slate-500 block">Shelters</span>
                          <p className="font-mono font-bold text-slate-900">{shelterUnits.toLocaleString()} units</p>
                        </div>
                        <div className="rounded bg-white p-1.5 border border-slate-200">
                          <span className="text-[10px] text-slate-500 block">Meals / Day</span>
                          <p className="font-mono font-bold text-slate-900">{mealsPerDay.toLocaleString()}</p>
                        </div>
                      </div>
                    </div>
                  );
                })}

                {plan.allocation.unallocated_population > 0 && (
                  <div className="rounded-lg border border-red-200 bg-red-50/80 p-3 text-xs">
                    <b className="text-red-900 font-bold">Unallocated Demand: {plan.allocation.unallocated_population.toLocaleString()} persons</b>
                    <p className="mt-0.5 text-[11px] text-red-800">
                      Existing candidate site headroom is insufficient for the full displaced target. Additional safe land or higher density assumptions required.
                    </p>
                  </div>
                )}
              </div>
            </section>

            {/* Configurable Assumption Sliders */}
            <section className="rounded-lg border border-slate-200 bg-white p-4 space-y-3 shadow-2xs">
              <div className="flex items-center justify-between">
                <h2 className="text-xs font-bold uppercase tracking-wider text-slate-800">Planning Norm Controls</h2>
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
                  className="text-[11px] text-sky-700 hover:underline font-bold"
                >
                  Reset Defaults
                </button>
              </div>
              <p className="text-[11px] text-slate-500">
                Modify standard disaster relief factors (Sphere Standards vs field operational scenarios).
              </p>

              <div className="space-y-3 text-xs">
                <div>
                  <div className="flex justify-between text-slate-700">
                    <span>Water (Litres/person/day):</span>
                    <b className="text-sky-700 font-mono font-bold">{assumptions.water_litres} L</b>
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
                  <span className="text-[10px] text-slate-500 block">Sphere minimum is ~15-20L; 50L covers domestic buffer.</span>
                </div>

                <div>
                  <div className="flex justify-between text-slate-700">
                    <span>Shelter Occupancy (people/unit):</span>
                    <b className="text-sky-700 font-mono font-bold">{assumptions.shelter_occupancy}</b>
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
                  <div className="flex justify-between text-slate-700">
                    <span>Meals per Person / Day:</span>
                    <b className="text-sky-700 font-mono font-bold">{assumptions.meals_per_day}</b>
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
                  <div className="flex justify-between text-slate-700">
                    <span>Transport Vehicle Capacity:</span>
                    <b className="text-sky-700 font-mono font-bold">{assumptions.vehicle_capacity} people/bus</b>
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
                  <div className="flex justify-between text-slate-700">
                    <span>Healthcare Unit Coverage:</span>
                    <b className="text-sky-700 font-mono font-bold">{assumptions.healthcare_unit_coverage} people/unit</b>
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
                  <div className="flex justify-between text-slate-700">
                    <span>Sanitation Unit Coverage:</span>
                    <b className="text-sky-700 font-mono font-bold">{assumptions.sanitation_unit_coverage} people/unit</b>
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
