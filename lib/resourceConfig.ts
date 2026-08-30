import type { ResourceAssumption } from "@/types/relocation";
import type { ResourceStatus } from "./types";

export const RESOURCE_STATUS_THRESHOLDS = {
  ADEQUATE: 1.2, // >= 120%
  WARNING_LOWER: 0.8, // >= 80% and < 120%
  CRITICAL: 0.8 // < 80%
};

export function classifyResourceStatus(coverageRatio: number): ResourceStatus {
  if (coverageRatio >= RESOURCE_STATUS_THRESHOLDS.ADEQUATE) return "adequate";
  if (coverageRatio >= RESOURCE_STATUS_THRESHOLDS.WARNING_LOWER) return "warning";
  return "critical";
}

export const RESOURCE_ASSUMPTIONS = {
  water_litres_per_person_per_day: {
    name: "Water requirement",
    value: 50,
    unit: "litres/person/day",
    source: "Sphere India Standards",
    source_url: "https://spherestandards.org",
    official: false,
    notes: "50L/person/day covers drinking, cooking, and sanitation hygiene buffer."
  },
  people_per_shelter_unit: {
    name: "Shelter unit occupancy",
    value: 5,
    unit: "people/shelter unit",
    source: "NDMA Camp Management Standard",
    source_url: null,
    official: false,
    notes: "Planning standard assumption for 1 family shelter unit."
  },
  meals_per_person_per_day: {
    name: "Meal requirement",
    value: 3,
    unit: "meals/person/day",
    source: "FCS&CA Emergency Ration Scale",
    source_url: null,
    official: false,
    notes: "Standard cooked/dry meal packet allocation."
  },
  people_per_transport_vehicle: {
    name: "Transport vehicle occupancy",
    value: 30,
    unit: "people/vehicle",
    source: "ASTC / SDRF Evacuation Norm",
    source_url: null,
    official: false,
    notes: "Standard medium bus seating capacity with personal baggage."
  },
  healthcare_capacity_per_unit: {
    name: "Healthcare unit coverage",
    value: 1000,
    unit: "people/medical unit",
    source: "NHM Mobile Medical Unit Standard",
    source_url: null,
    official: false,
    notes: "1 primary medical triage & paramedic team per 1,000 displaced persons."
  },
  people_per_sanitation_unit: {
    name: "Sanitation unit coverage",
    value: 20,
    unit: "people/sanitation unit",
    source: "Sphere WASH Standard",
    source_url: null,
    official: false,
    notes: "Minimum 1 toilet/latrine block per 20 persons."
  }
} satisfies Record<string, ResourceAssumption>;
