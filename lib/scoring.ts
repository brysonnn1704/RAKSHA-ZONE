import { distance, point } from "@turf/turf";
import type {
  HazardClass,
  RelocationMatch,
  SmartRelocationOption,
  VillageAssessment,
  VillageFeature,
  WeightSet
} from "./types";

export const HAZARD_SCORE: Record<HazardClass, number> = {
  very_high: 1,
  high: 0.75,
  moderate: 0.4,
  low: 0.15
};

export const DEFAULT_WEIGHTS: WeightSet = {
  alpha: 0.5,
  beta: 0.3,
  gamma: 0.2
};

export const DATA_SOURCES = [
  "RAKSHA-ZONE Multi-Hazard Decision Support Model",
  "NDMA / ASDMA Hazard Zonation & Vulnerability Guidance",
  "Operational validation required: capacities, populations, and site coordinates are planning inputs."
];

export function hazardSusceptibility(feature: VillageFeature): number {
  const p = feature.properties;
  if (p.flood_hazard_class && (!p.hazard_class_landslide || p.hazard_class_landslide === "low")) {
    return HAZARD_SCORE[p.flood_hazard_class];
  }
  if (p.hazard_class_landslide && p.hazard_class_flood) {
    return (HAZARD_SCORE[p.hazard_class_landslide] + HAZARD_SCORE[p.hazard_class_flood]) / 2;
  }
  if (p.hazard_class_flood) {
    return HAZARD_SCORE[p.hazard_class_flood];
  }
  if (p.hazard_class_landslide) {
    return HAZARD_SCORE[p.hazard_class_landslide];
  }
  return 0.5;
}

export function safeCarryingCapacity(feature: VillageFeature, resourceMultiplier = 1): number {
  const p = feature.properties;
  const multiplier = p.resource_multiplier ?? resourceMultiplier;
  return p.safe_land_area_hectares * p.max_safe_density_per_hectare * multiplier;
}

export function stressIndex(feature: VillageFeature): number {
  const pop = feature.properties.affected_population ?? feature.properties.current_population;
  const scc = safeCarryingCapacity(feature);
  return scc > 0 ? pop / scc : 1;
}

export function normalize(values: number[]): number[] {
  const max = Math.max(...values, 0);
  return max === 0 ? values.map(() => 0) : values.map((value) => value / max);
}

export function priorityTier(rps: number): VillageAssessment["priority_tier"] {
  return rps >= 0.75 ? "Immediate" : rps >= 0.5 ? "Short-term" : "Medium-term";
}

export function computeSmartRelocationOptions(
  origin: VillageFeature,
  candidates: VillageFeature[],
  count = 3
): SmartRelocationOption[] {
  const originPop = origin.properties.affected_population ?? origin.properties.current_population;

  return candidates
    .map((site) => {
      const p = site.properties;
      const distKm = Number(
        distance(point(origin.geometry.coordinates), point(site.geometry.coordinates), {
          units: "kilometers"
        }).toFixed(1)
      );

      const scc = Math.round(safeCarryingCapacity(site));
      const currentOcc = p.current_occupancy ?? p.current_population ?? 0;
      const availableCap = p.available_capacity ?? Math.max(0, scc - currentOcc);

      // Distance score (scales up to 100km buffer for wide-area riverine floods)
      const maxDistThreshold = 100;
      const sDist = Math.max(0, 1 - distKm / maxDistThreshold);

      // Capacity headroom score
      const sCap = Math.min(1, availableCap / Math.max(originPop, 1));

      // Flood safety score
      const safetyMap = { safe: 1.0, moderate: 0.65, unsafe: 0.15 };
      const floodSafety = p.flood_safety ?? "safe";
      const sSafe = safetyMap[floodSafety] ?? 0.8;

      // Accessibility score
      const sAccess = p.accessibility_score ?? 0.85;

      // Resource coverage proxy
      const sRes = p.water_available && p.food_support ? (p.medical_support ? 0.95 : 0.8) : 0.6;
      const resourceCoveragePct = Math.round(sRes * 100);

      // Composite Suitability Score
      const suitability =
        0.25 * sDist + 0.25 * sCap + 0.2 * sRes + 0.15 * sSafe + 0.15 * sAccess;

      const explanation = `Distance: ${distKm}km (${(sDist * 100).toFixed(0)}%), Headroom: ${availableCap.toLocaleString()} (${(sCap * 100).toFixed(0)}%), Flood Safety: ${floodSafety.toUpperCase()}, Resource buffer: ${resourceCoveragePct}%.`;

      return {
        site_id: p.id,
        site_name: p.name,
        district: p.district,
        type: p.type,
        distance_km: distKm,
        available_capacity: availableCap,
        resource_coverage_pct: resourceCoveragePct,
        flood_safety: floodSafety,
        accessibility_score: sAccess,
        suitability_score: Number(suitability.toFixed(3)),
        coordinates: site.geometry.coordinates,
        explanation
      };
    })
    .sort((a, b) => b.suitability_score - a.suitability_score)
    .slice(0, count);
}

export function rankedMatches(
  origin: VillageFeature,
  candidates: VillageFeature[],
  count = 3
): RelocationMatch[] {
  return candidates
    .map((site) => ({
      site_id: site.properties.id,
      site_name: site.properties.name,
      distance_km: Number(
        distance(point(origin.geometry.coordinates), point(site.geometry.coordinates), {
          units: "kilometers"
        }).toFixed(1)
      ),
      remaining_headroom: Math.round(
        safeCarryingCapacity(site) - (origin.properties.current_population ?? 0)
      ),
      capacity: Math.round(safeCarryingCapacity(site))
    }))
    .sort((a, b) => a.distance_km - b.distance_km || b.remaining_headroom - a.remaining_headroom)
    .slice(0, count);
}

export function assessVillages(
  features: VillageFeature[],
  weights: WeightSet = DEFAULT_WEIGHTS
): VillageAssessment[] {
  const origins = features.filter((feature) => feature.properties.role === "origin");
  const candidates = features.filter((feature) => feature.properties.role === "candidate");
  const normalizedStress = normalize(origins.map(stressIndex));

  return origins
    .map((feature, index) => {
      const p = feature.properties;
      const hss = hazardSusceptibility(feature);
      const rps =
        weights.alpha * hss +
        weights.beta * normalizedStress[index] +
        weights.gamma * p.vulnerability_index;

      const smartMatches = computeSmartRelocationOptions(feature, candidates, 3);
      const standardMatches = rankedMatches(feature, candidates, 3);

      return {
        id: p.id,
        name: p.name,
        district: p.district,
        state: p.state,
        country: p.country,
        role: p.role,
        hss: Number(hss.toFixed(3)),
        hazard_breakdown: {
          landslide: HAZARD_SCORE[p.hazard_class_landslide ?? "low"],
          flood: HAZARD_SCORE[p.flood_hazard_class ?? p.hazard_class_flood ?? "low"]
        },
        population: p.current_population,
        affected_population: p.affected_population,
        inundation_status: p.inundation_status,
        elevation_m: p.elevation_m,
        stress_index: Number(stressIndex(feature).toFixed(3)),
        normalized_stress: Number(normalizedStress[index].toFixed(3)),
        vulnerability_index: p.vulnerability_index,
        rps: Number(rps.toFixed(3)),
        priority_tier: priorityTier(rps),
        weights_used: weights,
        top_relocation_matches: standardMatches,
        smart_relocation_options: smartMatches,
        data_confidence: p.data_confidence ?? "PROTOTYPE",
        data_sources: p.data_sources ?? DATA_SOURCES
      };
    })
    .sort((a, b) => b.rps - a.rps);
}
