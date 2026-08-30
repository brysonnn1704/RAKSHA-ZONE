export type RegionId = "wayanad" | "assam" | "nepal";

export const HAZARD_TYPES = ["landslide", "flood", "glof", "coastal_erosion", "cloudburst", "glacier_collapse"] as const;
export type HazardType = (typeof HAZARD_TYPES)[number];
export type HazardClass = "very_high" | "high" | "moderate" | "low";
export type InundationStatus = "active" | "affected" | "recovering" | "safe";
export type FloodSafety = "safe" | "moderate" | "unsafe";
export type DataConfidence = "OFFICIAL" | "VERIFIED SECONDARY" | "ESTIMATED" | "PROTOTYPE";
export type ResourceStatus = "adequate" | "warning" | "critical";

export interface CascadeStep {
  id: string;
  stage: string;
  location: string;
  description: string;
  hazard_type: string;
  severity: string;
  status: string;
}

export type VillageRole = "origin" | "candidate";

export interface VillageProperties {
  id: string;
  name: string;
  role: VillageRole;
  district?: string;
  state?: string;
  country?: string;
  population?: number;
  affected_population?: number;
  inundation_status?: InundationStatus;
  elevation_m?: number;
  hazard_class_landslide?: HazardClass;
  hazard_class_flood?: HazardClass;
  flood_hazard_class?: HazardClass;
  primary_hazard?: HazardType;
  current_population: number;
  safe_land_area_hectares: number;
  max_safe_density_per_hectare: number;
  vulnerability_index: number;
  resource_multiplier?: number | null;
  shelter_capacity?: number | null;
  water_capacity?: number | null;
  healthcare_capacity?: number | null;
  infrastructure_capacity?: number | null;
  hazard_safety_score?: number | null;
  accessibility_score?: number | null;
  available?: boolean;
  type?: "relief_camp" | "school" | "community_center" | "shelter" | "temporary_site" | "permanent_site" | string;
  flood_safety?: FloodSafety;
  water_available?: boolean;
  toilets_available?: boolean;
  medical_support?: boolean;
  food_support?: boolean;
  base_capacity?: number;
  current_occupancy?: number;
  available_capacity?: number;
  data_confidence?: DataConfidence;
  data_status?: "official" | "prototype";
  data_sources?: string[];
}

export interface VillageFeature {
  type: "Feature";
  properties: VillageProperties;
  geometry: {
    type: "Point";
    coordinates: [number, number];
  };
}

export interface WeightSet {
  alpha: number;
  beta: number;
  gamma: number;
}

export interface RelocationMatch {
  site_id: string;
  site_name: string;
  distance_km: number;
  remaining_headroom: number;
  capacity: number;
}

export interface SmartRelocationOption {
  site_id: string;
  site_name: string;
  district?: string;
  type?: string;
  distance_km: number;
  available_capacity: number;
  resource_coverage_pct: number;
  flood_safety: FloodSafety;
  accessibility_score: number;
  suitability_score: number;
  coordinates: [number, number];
  explanation: string;
}

export interface VillageAssessment {
  id: string;
  name: string;
  district?: string;
  state?: string;
  country?: string;
  role?: VillageRole;
  hss: number;
  hazard_breakdown: Record<string, number>;
  population: number;
  affected_population?: number;
  inundation_status?: InundationStatus;
  elevation_m?: number;
  stress_index: number;
  normalized_stress: number;
  vulnerability_index: number;
  rps: number;
  priority_tier: "Immediate" | "Short-term" | "Medium-term";
  weights_used: WeightSet;
  top_relocation_matches: RelocationMatch[];
  smart_relocation_options?: SmartRelocationOption[];
  data_confidence?: DataConfidence;
  data_sources: string[];
}

export interface SiteResourceItem {
  resource: string;
  name: string;
  available_quantity: number;
  unit: string;
  daily_requirement_per_person: number;
  population_supported: number;
  coverage_days: number;
  status: ResourceStatus;
  data_source: string;
}

export interface SiteResourceInventory {
  site_id: string;
  site_name: string;
  resources: SiteResourceItem[];
}

export interface FloodStatisticSnapshot {
  period: string;
  date: string;
  phase: string;
  headline: string;
  affected_districts_count: number;
  affected_villages_count: number;
  affected_population: number;
  relief_camps_active: number;
  distribution_centers_active: number;
  crop_area_hectares: number;
  rivers_above_danger: string[];
  source: string;
  source_url: string;
  confidence: string;
}

export interface DistrictSummary {
  district: string;
  affected_population: number;
  villages_affected: number;
  relief_camps: number;
  status: string;
}

export interface FloodStatisticsData {
  region: string;
  title: string;
  historical_snapshots: FloodStatisticSnapshot[];
  district_summary_aug08: DistrictSummary[];
}

export interface SourceRecord {
  id: string;
  title: string;
  organization: string;
  date: string;
  type: string;
  confidence: DataConfidence;
  metrics_covered: string[];
  source_url: string | null;
  notes: string;
}

export interface SourcesRegistryData {
  region: string;
  sources: SourceRecord[];
}

export type { CapacityGapResult } from "./capacity";
export type { SiteResourceGap } from "./resources";

