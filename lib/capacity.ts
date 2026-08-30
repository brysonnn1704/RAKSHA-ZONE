import type { CapacityAssessment, RelocationSite } from "@/types/relocation";
import type { VillageFeature } from "./types";
import { safeCarryingCapacity } from "./scoring";

const isKnown = (value: number | null): value is number => value !== null && Number.isFinite(value);

export function assessCapacity(
  site: RelocationSite,
  populationRequiringRelocation: number,
  overrides: Partial<
    Pick<
      RelocationSite,
      | "max_safe_density_per_hectare"
      | "resource_multiplier"
      | "shelter_capacity"
      | "water_capacity"
      | "healthcare_capacity"
      | "infrastructure_capacity"
      | "available"
    >
  > = {}
): CapacityAssessment {
  const input = { ...site, ...overrides };
  const physical =
    isKnown(input.safe_land_area_hectares) && isKnown(input.max_safe_density_per_hectare)
      ? input.safe_land_area_hectares * input.max_safe_density_per_hectare
      : null;
  const adjusted =
    physical !== null && isKnown(input.resource_multiplier)
      ? physical * input.resource_multiplier
      : null;
  const constraints = {
    shelter_capacity: input.shelter_capacity,
    water_capacity: input.water_capacity,
    healthcare_capacity: input.healthcare_capacity,
    infrastructure_capacity: input.infrastructure_capacity
  };
  const allKnown =
    adjusted !== null &&
    isKnown(input.current_population) &&
    Object.values(constraints).every(isKnown);
  const finalCapacity =
    allKnown && input.available
      ? Math.min(adjusted, ...(Object.values(constraints) as number[]))
      : null;
  const headroom =
    finalCapacity !== null && input.current_population !== null
      ? Math.max(0, finalCapacity - input.current_population)
      : null;
  const deficit =
    adjusted !== null && input.current_population !== null
      ? Math.max(0, input.current_population - adjusted)
      : null;
  const status =
    finalCapacity === null || headroom === null
      ? "UNKNOWN"
      : headroom === 0
      ? "INSUFFICIENT"
      : headroom >= populationRequiringRelocation
      ? "SUFFICIENT"
      : "LIMITED";

  return {
    site_id: input.site_id,
    site_name: input.site_name,
    physical_capacity: physical,
    adjusted_capacity: adjusted,
    current_population: input.current_population,
    available_headroom: headroom,
    capacity_deficit: deficit,
    constraints,
    final_capacity: finalCapacity,
    capacity_confidence: allKnown ? "complete" : adjusted === null ? "unknown" : "partial",
    capacity_status: status,
    assumptions: {
      density_per_hectare: input.max_safe_density_per_hectare,
      resource_multiplier: input.resource_multiplier
    },
    calculation_details:
      "Physical capacity = safe land area × planning density. Adjusted capacity = physical capacity × resource multiplier. Final capacity is the minimum of adjusted, shelter, water, healthcare and infrastructure capacity only when every critical input is known."
  };
}

export interface CapacityGapResult {
  total_requiring_relocation: number;
  total_available_capacity: number;
  capacity_deficit: number;
  capacity_status: "Capacity Deficit" | "Capacity Sufficient";
  summary_message: string;
  district_breakdown: {
    district: string;
    population_demanding: number;
    available_capacity: number;
    gap: number;
  }[];
}

export function calculateCapacityGap(
  origins: VillageFeature[],
  candidates: VillageFeature[]
): CapacityGapResult {
  const totalDemand = origins.reduce(
    (sum, o) => sum + (o.properties.affected_population ?? o.properties.current_population),
    0
  );

  const totalCap = candidates.reduce((sum, c) => {
    const p = c.properties;
    const occ = p.current_occupancy ?? p.current_population ?? 0;
    const scc = Math.round(safeCarryingCapacity(c));
    const avail = p.available_capacity ?? Math.max(0, scc - occ);
    return sum + avail;
  }, 0);

  const deficit = Math.max(0, totalDemand - totalCap);
  const status = deficit > 0 ? "Capacity Deficit" : "Capacity Sufficient";
  const summaryMessage =
    deficit > 0
      ? `${deficit.toLocaleString()} additional people require safe accommodation beyond verified regional candidate headroom.`
      : `Regional safe shelter capacity is sufficient to accommodate all ${totalDemand.toLocaleString()} displaced persons.`;

  // District breakdown
  const districtMap = new Map<string, { demanding: number; available: number }>();
  origins.forEach((o) => {
    const d = o.properties.district ?? "Default District";
    const cur = districtMap.get(d) ?? { demanding: 0, available: 0 };
    cur.demanding += o.properties.affected_population ?? o.properties.current_population;
    districtMap.set(d, cur);
  });

  candidates.forEach((c) => {
    const d = c.properties.district ?? "Default District";
    const cur = districtMap.get(d) ?? { demanding: 0, available: 0 };
    const occ = c.properties.current_occupancy ?? c.properties.current_population ?? 0;
    const scc = Math.round(safeCarryingCapacity(c));
    const avail = c.properties.available_capacity ?? Math.max(0, scc - occ);
    cur.available += avail;
    districtMap.set(d, cur);
  });

  const districtBreakdown = Array.from(districtMap.entries()).map(([district, data]) => ({
    district,
    population_demanding: data.demanding,
    available_capacity: data.available,
    gap: data.demanding - data.available
  })).sort((a, b) => b.gap - a.gap);

  return {
    total_requiring_relocation: totalDemand,
    total_available_capacity: totalCap,
    capacity_deficit: deficit,
    capacity_status: status,
    summary_message: summaryMessage,
    district_breakdown: districtBreakdown
  };
}
