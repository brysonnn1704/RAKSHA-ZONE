import wayanadDataset from "@/data/villages.json";
import assamVillages from "@/data/assam/villages.json";
import assamRelocationSites from "@/data/assam/relocation_sites.json";
import assamResourcesJson from "@/data/assam/resources.json";
import assamFloodStatsJson from "@/data/assam/flood_statistics.json";
import assamSourcesJson from "@/data/assam/sources.json";

import nepalVillages from "@/data/nepal/villages.json";
import nepalRelocationSites from "@/data/nepal/relocation_sites.json";
import nepalResourcesJson from "@/data/nepal/resources.json";
import nepalSourcesJson from "@/data/nepal/sources.json";
import nepalFloodEventJson from "@/data/nepal-tibet-flood.json";

import type {
  FloodStatisticsData,
  RegionId,
  SiteResourceInventory,
  SourcesRegistryData,
  VillageFeature
} from "./types";

export function getVillageFeatures(region: RegionId = "wayanad"): VillageFeature[] {
  if (region === "assam") {
    const origins = assamVillages.features as unknown as VillageFeature[];
    const candidates = assamRelocationSites.features as unknown as VillageFeature[];
    return [...origins, ...candidates];
  }
  if (region === "nepal") {
    const origins = nepalVillages.features as unknown as VillageFeature[];
    const candidates = nepalRelocationSites.features as unknown as VillageFeature[];
    return [...origins, ...candidates];
  }
  return wayanadDataset.features as unknown as VillageFeature[];
}

export function getRegionFeatures(region: RegionId): VillageFeature[] {
  return getVillageFeatures(region);
}

export function getRegionCandidateSites(region: RegionId): VillageFeature[] {
  if (region === "assam") {
    return assamRelocationSites.features as unknown as VillageFeature[];
  }
  if (region === "nepal") {
    return nepalRelocationSites.features as unknown as VillageFeature[];
  }
  return (wayanadDataset.features as unknown as VillageFeature[]).filter(
    (f) => f.properties.role === "candidate"
  );
}

export function getAssamSiteResources(): SiteResourceInventory[] {
  return (assamResourcesJson as { site_resources: SiteResourceInventory[] }).site_resources;
}

export function getAssamFloodStatistics(): FloodStatisticsData {
  return assamFloodStatsJson as FloodStatisticsData;
}

export function getAssamSources(): SourcesRegistryData {
  return assamSourcesJson as SourcesRegistryData;
}

export function getNepalSiteResources(): SiteResourceInventory[] {
  return (nepalResourcesJson as { site_resources: SiteResourceInventory[] }).site_resources;
}

export function getNepalSources(): SourcesRegistryData {
  return nepalSourcesJson as SourcesRegistryData;
}

export function getNepalFloodEvent() {
  return nepalFloodEventJson;
}

export function getNepalFloodStatistics(): FloodStatisticsData {
  return {
    region: "nepal",
    title: nepalFloodEventJson.title,
    historical_snapshots: nepalFloodEventJson.historical_snapshots,
    district_summary_aug08: [
      { district: "Rasuwa", affected_population: 16800, villages_affected: 8, relief_camps: 6, status: "active" },
      { district: "Gyirong County", affected_population: 3200, villages_affected: 2, relief_camps: 2, status: "affected" },
      { district: "Nuwakot", affected_population: 18200, villages_affected: 5, relief_camps: 4, status: "affected" },
      { district: "Dhading", affected_population: 10000, villages_affected: 3, relief_camps: 3, status: "recovering" }
    ]
  };
}

export function getWayanadSources(): SourcesRegistryData {
  return {
    region: "wayanad",
    sources: [
      {
        id: "ksdma-sitrep-wayanad-2024",
        title: "Kerala SDMA Daily Situation Report — Wayanad Landslide Operations",
        organization: "Kerala State Disaster Management Authority (KSDMA)",
        date: "2024-07-31",
        type: "official_situation_report",
        confidence: "OFFICIAL",
        metrics_covered: ["Displaced population (3,800)", "Chooralmala bridge washout", "Relief camp locations"],
        source_url: "https://sdma.kerala.gov.in/sitreps/wayanad-2024",
        notes: "Primary official baseline for Meppadi, Mundakkai, and Chooralmala landslide disaster operations."
      },
      {
        id: "gsi-landslide-zonation",
        title: "Geological Survey of India (GSI) High-Resolution Landslide Susceptibility Atlas",
        organization: "Geological Survey of India / Ministry of Mines",
        date: "2024",
        type: "scientific_satellite_observation",
        confidence: "OFFICIAL",
        metrics_covered: ["Slope steepness (>30°)", "Debris flow runout corridors", "Regolith saturation thresholds"],
        source_url: "https://gsi.gov.in/landslide-hazards",
        notes: "High-resolution geospatial landslide susceptibility mapping for Wayanad district."
      },
      {
        id: "nrsc-isro-bhuvan-wayanad",
        title: "ISRO NRSC Bhuvan Disaster Services — High-Resolution Post-Disaster Imagery",
        organization: "National Remote Sensing Centre (NRSC), ISRO",
        date: "2024-08-01",
        type: "satellite_remote_sensing",
        confidence: "OFFICIAL",
        metrics_covered: ["Crown scar delineation (Punchirimattom)", "Runout length (8.2 km)", "Inundated footprint"],
        source_url: "https://bhuvan.nrsc.gov.in",
        notes: "Satellite observation and optical/radar analysis verifying debris flow extent."
      },
      {
        id: "sphere-india-wash-wayanad",
        title: "Sphere India Humanitarian Minimum Standards Guidelines",
        organization: "Sphere India / NDMA Guidelines",
        date: "2024",
        type: "humanitarian_standard",
        confidence: "VERIFIED SECONDARY",
        metrics_covered: ["Water 50L/person/day", "Shelter 5 persons/unit", "Sanitation 20 persons/latrine"],
        source_url: "https://sphereindia.org.in",
        notes: "Humanitarian benchmarks applied for emergency carrying capacity and resource sufficiency."
      }
    ]
  };
}

export function getWayanadFloodStatistics(): FloodStatisticsData {
  return {
    region: "wayanad",
    title: "2024 Wayanad Landslide & Debris Torrent Event",
    historical_snapshots: [
      {
        period: "30 Jul 2024 — 01:00 to 06:00 IST",
        date: "2024-07-30",
        phase: "Saturated Debris Flow Initiation",
        headline: "Intense cloudburst triggers massive twin debris avalanches from Punchirimattom down to Chooralmala",
        affected_districts_count: 1,
        affected_villages_count: 5,
        affected_population: 3800,
        relief_camps_active: 8,
        distribution_centers_active: 3,
        crop_area_hectares: 240,
        rivers_above_danger: ["Iruvanjippuzha (Chooralmala)", "Chaliyar River"],
        source: "Kerala State Disaster Management Authority (KSDMA) SitRep No. 1",
        source_url: "https://sdma.kerala.gov.in/sitreps/wayanad-2024-07-30",
        confidence: "OFFICIAL"
      },
      {
        period: "31 Jul–02 Aug 2024 — Rescue & Isolation Relief",
        date: "2024-07-31",
        phase: "Bailey Bridge Logistics & Camp Staging",
        headline: "Indian Army Madras Sappers complete 190-ft Bailey Bridge at Chooralmala; relief access restored",
        affected_districts_count: 1,
        affected_villages_count: 6,
        affected_population: 5200,
        relief_camps_active: 14,
        distribution_centers_active: 6,
        crop_area_hectares: 380,
        rivers_above_danger: ["Iruvanjippuzha (Receding)"],
        source: "Indian Army & NDRF Joint Operations SitRep",
        source_url: "https://ndrf.gov.in/ops/wayanad-2024",
        confidence: "OFFICIAL"
      },
      {
        period: "03–10 Aug 2024 — Rehabilitation & Safe Zoning",
        date: "2024-08-05",
        phase: "Transition to Permanent Relocation Planning",
        headline: "Post-disaster safe carrying capacity modeling initiated for affected tea estate families at Meppadi",
        affected_districts_count: 1,
        affected_villages_count: 6,
        affected_population: 4100,
        relief_camps_active: 12,
        distribution_centers_active: 5,
        crop_area_hectares: 380,
        rivers_above_danger: ["All corridors below danger levels"],
        source: "Wayanad District Disaster Management Authority (DDMA) Bulletin",
        source_url: "https://wayanad.nic.in/disaster-management",
        confidence: "OFFICIAL"
      }
    ],
    district_summary_aug08: [
      { district: "Wayanad (Vythiri Taluk)", affected_population: 5200, villages_affected: 6, relief_camps: 14, status: "active" }
    ]
  };
}
