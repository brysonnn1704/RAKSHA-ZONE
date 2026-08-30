import wayanadDataset from "@/data/villages.json";
import assamVillages from "@/data/assam/villages.json";
import assamRelocationSites from "@/data/assam/relocation_sites.json";
import assamResourcesJson from "@/data/assam/resources.json";
import assamFloodStatsJson from "@/data/assam/flood_statistics.json";
import assamSourcesJson from "@/data/assam/sources.json";

import type {
  FloodStatisticsData,
  RegionId,
  SiteResourceInventory,
  SourcesRegistryData,
  VillageFeature
} from "./types";

export function getVillageFeatures(region: RegionId = "wayanad"): VillageFeature[] {
  if (region === "assam") {
    const origins = assamVillages.features as VillageFeature[];
    const candidates = assamRelocationSites.features as VillageFeature[];
    return [...origins, ...candidates];
  }
  return wayanadDataset.features as VillageFeature[];
}

export function getRegionFeatures(region: RegionId): VillageFeature[] {
  return getVillageFeatures(region);
}

export function getRegionCandidateSites(region: RegionId): VillageFeature[] {
  if (region === "assam") {
    return assamRelocationSites.features as VillageFeature[];
  }
  return (wayanadDataset.features as VillageFeature[]).filter(
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
