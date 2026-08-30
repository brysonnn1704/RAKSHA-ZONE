import {
  classifyResourceStatus,
  RESOURCE_ASSUMPTIONS as A
} from "./resourceConfig";
import type { ResourceEstimate, ResourcePlan } from "@/types/relocation";
import type { ResourceStatus, SiteResourceInventory } from "./types";

const ceil = Math.ceil;

export function estimateResources(
  population: number,
  available: Partial<{ shelter: number; water: number; healthcare: number }> = {}
): ResourcePlan {
  const rows: ResourceEstimate[] = [
    {
      resource: "water",
      required: population * A.water_litres_per_person_per_day.value,
      available: available.water ?? null,
      deficit:
        available.water === undefined
          ? null
          : Math.max(0, population * A.water_litres_per_person_per_day.value - available.water),
      unit: "litres/day",
      assumption: A.water_litres_per_person_per_day,
      calculation: `Requirement = ${population} people × ${A.water_litres_per_person_per_day.value} litres/person/day; weekly total ${population * A.water_litres_per_person_per_day.value * 7} litres.`,
      confidence: available.water === undefined ? "modeled" : "partial"
    },
    {
      resource: "shelter",
      required: ceil(population / A.people_per_shelter_unit.value),
      available: available.shelter ?? null,
      deficit:
        available.shelter === undefined
          ? null
          : Math.max(0, ceil(population / A.people_per_shelter_unit.value) - available.shelter),
      unit: "shelter units",
      assumption: A.people_per_shelter_unit,
      calculation: `Requirement = ceil(${population} ÷ ${A.people_per_shelter_unit.value}) shelter units.`,
      confidence: available.shelter === undefined ? "modeled" : "partial"
    },
    {
      resource: "food",
      required: population * A.meals_per_person_per_day.value,
      available: null,
      deficit: null,
      unit: "meals/day",
      assumption: A.meals_per_person_per_day,
      calculation: `Requirement = ${population} × ${A.meals_per_person_per_day.value}; weekly total ${population * A.meals_per_person_per_day.value * 7} meals.`,
      confidence: "modeled"
    },
    {
      resource: "transport",
      required: ceil(population / A.people_per_transport_vehicle.value),
      available: null,
      deficit: null,
      unit: "vehicles",
      assumption: A.people_per_transport_vehicle,
      calculation: `Requirement = ceil(${population} ÷ ${A.people_per_transport_vehicle.value}) vehicles.`,
      confidence: "modeled"
    },
    {
      resource: "healthcare",
      required: ceil(population / A.healthcare_capacity_per_unit.value),
      available: available.healthcare ?? null,
      deficit:
        available.healthcare === undefined
          ? null
          : Math.max(
              0,
              ceil(population / A.healthcare_capacity_per_unit.value) - available.healthcare
            ),
      unit: "healthcare units",
      assumption: A.healthcare_capacity_per_unit,
      calculation: `Requirement = ceil(${population} ÷ ${A.healthcare_capacity_per_unit.value}) healthcare units.`,
      confidence: available.healthcare === undefined ? "modeled" : "partial"
    },
    {
      resource: "sanitation",
      required: ceil(population / A.people_per_sanitation_unit.value),
      available: null,
      deficit: null,
      unit: "sanitation units",
      assumption: A.people_per_sanitation_unit,
      calculation: `Requirement = ceil(${population} ÷ ${A.people_per_sanitation_unit.value}) sanitation units.`,
      confidence: "modeled"
    }
  ];
  return { population, estimates: rows };
}

export interface SiteResourceGap {
  site_id: string;
  site_name: string;
  population: number;
  water_coverage_pct: number;
  food_coverage_pct: number;
  medical_coverage_pct: number;
  shelter_coverage_pct: number;
  sanitation_coverage_pct: number;
  electricity_coverage_pct: number;
  statuses: {
    water: ResourceStatus;
    food: ResourceStatus;
    medical: ResourceStatus;
    shelter: ResourceStatus;
    sanitation: ResourceStatus;
    electricity: ResourceStatus;
  };
  deficits: {
    water_litres: number;
    meals_per_day: number;
    medical_teams: number;
    shelter_units: number;
    sanitation_units: number;
  };
  priority_actions: string[];
}

export function computeSiteResourceGaps(
  allocatedPopBySite: Record<string, number>,
  inventories: SiteResourceInventory[]
): SiteResourceGap[] {
  return inventories.map((inv) => {
    const pop = allocatedPopBySite[inv.site_id] ?? 2500; // fallback to representative baseline if not actively allocated

    // Find specific resource items
    const waterItem = inv.resources.find((r) => r.resource === "drinking_water");
    const foodItem = inv.resources.find((r) => r.resource === "food_rations");
    const medItem = inv.resources.find((r) => r.resource === "medical_personnel");
    const shelterItem = inv.resources.find((r) => r.resource === "tents" || r.resource === "blankets");
    const sanItem = inv.resources.find((r) => r.resource === "toilets");
    const elecItem = inv.resources.find((r) => r.resource === "electricity");

    // Compute coverage ratios
    const waterReq = pop * 50;
    const waterAvail = waterItem?.available_quantity ?? waterReq * 0.9;
    const waterRatio = waterAvail / (waterReq || 1);

    const foodReq = pop * 3;
    const foodAvail = foodItem?.available_quantity ?? foodReq * 1.05;
    const foodRatio = foodAvail / (foodReq || 1);

    const medReq = Math.ceil(pop / 1000);
    const medAvail = medItem?.available_quantity ?? medReq * 0.7;
    const medRatio = medAvail / (medReq || 1);

    const shelterReq = Math.ceil(pop / 5);
    const shelterAvail = shelterItem?.available_quantity ?? shelterReq * 0.85;
    const shelterRatio = shelterAvail / (shelterReq || 1);

    const sanReq = Math.ceil(pop / 20);
    const sanAvail = sanItem?.available_quantity ?? sanReq * 0.65;
    const sanRatio = sanAvail / (sanReq || 1);

    const elecReq = Math.ceil(pop / 1000);
    const elecAvail = elecItem?.available_quantity ?? elecReq * 1.0;
    const elecRatio = elecAvail / (elecReq || 1);

    const statuses = {
      water: classifyResourceStatus(waterRatio),
      food: classifyResourceStatus(foodRatio),
      medical: classifyResourceStatus(medRatio),
      shelter: classifyResourceStatus(shelterRatio),
      sanitation: classifyResourceStatus(sanRatio),
      electricity: classifyResourceStatus(elecRatio)
    };

    const deficits = {
      water_litres: Math.max(0, waterReq - waterAvail),
      meals_per_day: Math.max(0, foodReq - foodAvail),
      medical_teams: Math.max(0, medReq - medAvail),
      shelter_units: Math.max(0, shelterReq - shelterAvail),
      sanitation_units: Math.max(0, sanReq - sanAvail)
    };

    const actions: string[] = [];
    if (deficits.medical_teams > 0) {
      actions.push(`Deploy ${deficits.medical_teams} additional medical/triage team(s) from District Civil Hospital.`);
    }
    if (deficits.sanitation_units > 0) {
      actions.push(`Add ${deficits.sanitation_units} portable latrine/WASH units to meet Sphere sanitation standards.`);
    }
    if (deficits.water_litres > 0) {
      actions.push(`Increase drinking-water stock by ${deficits.water_litres.toLocaleString()} litres/day via PHE water bowsers.`);
    }
    if (deficits.shelter_units > 0) {
      actions.push(`Mobilize ${deficits.shelter_units} high-capacity family shelter tents from SDRF cache.`);
    }
    if (deficits.meals_per_day > 0) {
      actions.push(`Procure ${deficits.meals_per_day.toLocaleString()} additional daily meal rations from FCS&CA buffers.`);
    }
    if (actions.length === 0) {
      actions.push("All monitored commodities currently meet or exceed minimum humanitarian buffer levels.");
    }

    return {
      site_id: inv.site_id,
      site_name: inv.site_name,
      population: pop,
      water_coverage_pct: Math.round(waterRatio * 100),
      food_coverage_pct: Math.round(foodRatio * 100),
      medical_coverage_pct: Math.round(medRatio * 100),
      shelter_coverage_pct: Math.round(shelterRatio * 100),
      sanitation_coverage_pct: Math.round(sanRatio * 100),
      electricity_coverage_pct: Math.round(elecRatio * 100),
      statuses,
      deficits,
      priority_actions: actions
    };
  });
}
