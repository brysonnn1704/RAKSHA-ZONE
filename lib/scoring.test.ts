import test from "node:test";
import assert from "node:assert/strict";
import {
  assessVillages,
  computeSmartRelocationOptions,
  DEFAULT_WEIGHTS,
  HAZARD_SCORE,
  hazardSusceptibility,
  priorityTier,
  safeCarryingCapacity,
  stressIndex
} from "./scoring";
import { calculateCapacityGap } from "./capacity";
import { classifyResourceStatus } from "./resourceConfig";
import { computeSiteResourceGaps } from "./resources";
import { getRegionFeatures } from "./data";
import type { SiteResourceInventory, VillageFeature } from "./types";

// Base Wayanad test feature
const wayanadFeature: VillageFeature = {
  type: "Feature",
  geometry: { type: "Point", coordinates: [76.13, 11.51] },
  properties: {
    id: "wayanad-x",
    name: "Wayanad Village X",
    role: "origin",
    hazard_class_landslide: "very_high",
    hazard_class_flood: "high",
    current_population: 240,
    safe_land_area_hectares: 2,
    max_safe_density_per_hectare: 100,
    vulnerability_index: 0.5
  }
};

// Assam flood test origin feature
const assamOriginFeature: VillageFeature = {
  type: "Feature",
  geometry: { type: "Point", coordinates: [92.98, 26.58] },
  properties: {
    id: "assam-origin-1",
    name: "Assam Flood Origin 1",
    role: "origin",
    district: "Nagaon",
    state: "Assam",
    flood_hazard_class: "very_high",
    inundation_status: "active",
    current_population: 4000,
    affected_population: 3500,
    safe_land_area_hectares: 2.0,
    max_safe_density_per_hectare: 120,
    vulnerability_index: 0.85
  }
};

// Assam candidate relocation site feature
const assamCandidateSite: VillageFeature = {
  type: "Feature",
  geometry: { type: "Point", coordinates: [92.68, 26.34] },
  properties: {
    id: "assam-candidate-1",
    name: "Assam Candidate Safe Hub 1",
    role: "candidate",
    district: "Nagaon",
    type: "school",
    safe_land_area_hectares: 20,
    max_safe_density_per_hectare: 150,
    resource_multiplier: 0.9,
    base_capacity: 2700,
    current_population: 300,
    current_occupancy: 300,
    available_capacity: 2400,
    accessibility_score: 0.92,
    hazard_safety_score: 0.95,
    flood_safety: "safe",
    available: true,
    water_available: true,
    toilets_available: true,
    medical_support: true,
    food_support: true,
    vulnerability_index: 0.1
  }
};

// 1. Hazard class scoring mapping
test("hazard class scale follows the specified mapping", () => {
  assert.equal(HAZARD_SCORE.very_high, 1.0);
  assert.equal(HAZARD_SCORE.high, 0.75);
  assert.equal(HAZARD_SCORE.moderate, 0.4);
  assert.equal(HAZARD_SCORE.low, 0.15);
});

// 2. Wayanad composite HSS and SCC
test("Wayanad composite HSS and SCC use their specified formulas", () => {
  assert.equal(safeCarryingCapacity(wayanadFeature), 200);
  assert.equal(stressIndex(wayanadFeature), 1.2);
  assert.equal(hazardSusceptibility(wayanadFeature), (1.0 + 0.75) / 2); // 0.875
});

// 3. Assam Flood-specific HSS
test("Assam flood-specific HSS correctly isolates flood hazard class", () => {
  assert.equal(hazardSusceptibility(assamOriginFeature), 1.0);
});

// 4. Official priority labels follow cutoffs
test("official priority labels follow cutoffs", () => {
  assert.equal(priorityTier(0.75), "Immediate");
  assert.equal(priorityTier(0.5), "Short-term");
  assert.equal(priorityTier(0.49), "Medium-term");
});

// 5. Safe Carrying Capacity and Available Capacity calculations
test("candidate site SCC and available capacity follow headroom formulas", () => {
  const scc = safeCarryingCapacity(assamCandidateSite);
  assert.equal(scc, 20 * 150 * 0.9); // 2,700
  const available = Math.max(0, scc - (assamCandidateSite.properties.current_occupancy ?? 0));
  assert.equal(available, 2400);
});

// 6. Resource Status Classification (Sphere Standards)
test("resource status classifies correctly into adequate, warning, critical", () => {
  assert.equal(classifyResourceStatus(1.3), "adequate"); // >= 120%
  assert.equal(classifyResourceStatus(1.2), "adequate");
  assert.equal(classifyResourceStatus(1.0), "warning"); // 80% - 119%
  assert.equal(classifyResourceStatus(0.8), "warning");
  assert.equal(classifyResourceStatus(0.79), "critical"); // < 80%
  assert.equal(classifyResourceStatus(0.45), "critical");
});

// 7. Capacity Deficit and Gap Analysis
test("calculateCapacityGap correctly detects deficit vs sufficiency", () => {
  // 3500 demand vs 2400 available capacity -> 1100 deficit
  const result = calculateCapacityGap([assamOriginFeature], [assamCandidateSite]);
  assert.equal(result.total_requiring_relocation, 3500);
  assert.equal(result.total_available_capacity, 2400);
  assert.equal(result.capacity_deficit, 1100);
  assert.equal(result.capacity_status, "Capacity Deficit");
});

// 8. Smart Multi-Factor Relocation Ranking
test("computeSmartRelocationOptions ranks candidates with multi-factor suitability", () => {
  const options = computeSmartRelocationOptions(assamOriginFeature, [assamCandidateSite], 3);
  assert.equal(options.length, 1);
  const top = options[0];
  assert.equal(top.site_id, "assam-candidate-1");
  assert.equal(top.flood_safety, "safe");
  assert.ok(top.distance_km > 0);
  assert.ok(top.suitability_score > 0 && top.suitability_score <= 1);
});

// 9. Resource Gap & Action Generator
test("computeSiteResourceGaps identifies commodity deficits and generates actions", () => {
  const dummyInventory: SiteResourceInventory = {
    site_id: "assam-candidate-1",
    site_name: "Assam Candidate Safe Hub 1",
    resources: [
      {
        resource: "drinking_water",
        name: "Water",
        available_quantity: 50000,
        unit: "litres",
        daily_requirement_per_person: 50,
        population_supported: 1000,
        coverage_days: 5,
        status: "critical",
        data_source: "Test"
      }
    ]
  };

  const gaps = computeSiteResourceGaps({ "assam-candidate-1": 2000 }, [dummyInventory]);
  assert.equal(gaps.length, 1);
  assert.ok(gaps[0].priority_actions.length > 0);
});

// 10. Region switching between Wayanad, Assam, and Nepal
test("getRegionFeatures returns independent, isolated datasets for Wayanad, Assam, and Nepal", () => {
  const wayanad = getRegionFeatures("wayanad");
  const assam = getRegionFeatures("assam");
  const nepal = getRegionFeatures("nepal");

  assert.ok(wayanad.length > 0);
  assert.ok(assam.length > 0);
  assert.ok(nepal.length > 0);

  // Wayanad contains mundakkai
  assert.ok(wayanad.some((f) => f.properties.id === "mundakkai"));
  assert.equal(assam.some((f) => f.properties.id === "mundakkai"), false);
  assert.equal(nepal.some((f) => f.properties.id === "mundakkai"), false);

  // Assam contains kaliabor
  assert.ok(assam.some((f) => f.properties.id === "assam-nagaon-kaliabor"));
  assert.equal(nepal.some((f) => f.properties.id === "assam-nagaon-kaliabor"), false);

  // Nepal contains timure and syapru besi
  assert.ok(nepal.some((f) => f.properties.id === "nep-timure"));
  assert.ok(nepal.some((f) => f.properties.id === "nep-syaprubesi"));
});

// 11. assessVillages generates full assessment records with smart options across all regions
test("assessVillages computes valid RPS and smart relocation matches for Wayanad, Assam, and Nepal", () => {
  const wayanadAssessments = assessVillages(getRegionFeatures("wayanad"), DEFAULT_WEIGHTS);
  assert.ok(wayanadAssessments.length > 0);
  assert.ok(wayanadAssessments[0].rps >= 0 && wayanadAssessments[0].rps <= 1);

  const assamAssessments = assessVillages(getRegionFeatures("assam"), DEFAULT_WEIGHTS);
  assert.ok(assamAssessments.length > 0);
  assert.ok(assamAssessments[0].smart_relocation_options!.length > 0);

  const nepalAssessments = assessVillages(getRegionFeatures("nepal"), DEFAULT_WEIGHTS);
  assert.ok(nepalAssessments.length > 0);
  assert.ok(nepalAssessments[0].smart_relocation_options!.length > 0);
  assert.ok(nepalAssessments[0].rps >= 0 && nepalAssessments[0].rps <= 1);
});

