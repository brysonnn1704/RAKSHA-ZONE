import { distance, point } from "@turf/turf";
import { allocatePopulation, type AllocationResult } from "./allocation";
import { assessCapacity } from "./capacity";
import { estimateResources } from "./resources";
import type { VillageFeature } from "./types";
import type { RelocationCandidate, RelocationSite, ResourcePlan } from "@/types/relocation";

export function toRelocationSite(feature: VillageFeature): RelocationSite {
  const p = feature.properties;
  return {
    site_id: p.id,
    site_name: p.name,
    safe_land_area_hectares: p.safe_land_area_hectares,
    current_population: p.current_occupancy ?? p.current_population,
    max_safe_density_per_hectare: p.max_safe_density_per_hectare,
    resource_multiplier: p.resource_multiplier ?? 1,
    shelter_capacity: p.shelter_capacity ?? null,
    water_capacity: p.water_capacity ?? null,
    healthcare_capacity: p.healthcare_capacity ?? null,
    infrastructure_capacity: p.infrastructure_capacity ?? null,
    hazard_safety_score: p.hazard_safety_score ?? null,
    accessibility_score: p.accessibility_score ?? null,
    available: p.available ?? true
  };
}

export function rankCandidates(
  origin: VillageFeature,
  features: VillageFeature[],
  population: number,
  scenario: Partial<
    Pick<
      RelocationSite,
      | "resource_multiplier"
      | "max_safe_density_per_hectare"
      | "shelter_capacity"
      | "water_capacity"
      | "healthcare_capacity"
      | "infrastructure_capacity"
    >
  > = {}
): RelocationCandidate[] {
  return features
    .filter((feature) => feature.properties.role === "candidate")
    .map((feature) => {
      const site = toRelocationSite(feature);
      const capacity = assessCapacity(site, population, scenario);
      const km = distance(
        point(origin.geometry.coordinates),
        point(feature.geometry.coordinates),
        { units: "kilometers" }
      );
      const safety = site.hazard_safety_score ?? 0.85;
      const access = site.accessibility_score ?? 0.85;
      const headroom = capacity.available_headroom ?? 0;
      const distWeight = Math.max(0, 1 - km / 120);

      const score =
        safety * 0.35 +
        access * 0.2 +
        Math.min(1, headroom / Math.max(population, 1)) * 0.3 +
        distWeight * 0.15;

      return {
        site,
        distance_km: Number(km.toFixed(1)),
        suitability_score: Number(score.toFixed(3)),
        capacity
      };
    })
    .sort((a, b) => b.suitability_score - a.suitability_score);
}

export interface RelocationPlan {
  candidates: RelocationCandidate[];
  allocation: AllocationResult;
  resourcePlans: Record<string, ResourcePlan>;
  totalResourcePlan: ResourcePlan;
}

export function buildRelocationPlan(
  origin: VillageFeature,
  features: VillageFeature[],
  population: number,
  scenario: Partial<
    Pick<
      RelocationSite,
      | "resource_multiplier"
      | "max_safe_density_per_hectare"
      | "shelter_capacity"
      | "water_capacity"
      | "healthcare_capacity"
      | "infrastructure_capacity"
    >
  > = {}
): RelocationPlan {
  const candidates = rankCandidates(origin, features, population, scenario);
  const allocation = allocatePopulation(population, candidates);
  const resourcePlans = Object.fromEntries(
    allocation.allocations.map((alloc) => {
      const candidateItem = candidates.find((c) => c.site.site_id === alloc.site_id)!;
      return [
        alloc.site_id,
        estimateResources(alloc.allocated_population, {
          shelter: candidateItem.site.shelter_capacity ?? undefined,
          water: candidateItem.site.water_capacity ?? undefined,
          healthcare: candidateItem.site.healthcare_capacity ?? undefined
        })
      ];
    })
  );
  return {
    candidates,
    allocation,
    resourcePlans,
    totalResourcePlan: estimateResources(allocation.total_allocated)
  };
}
