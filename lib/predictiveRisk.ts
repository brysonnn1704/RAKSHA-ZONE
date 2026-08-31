import distance from "@turf/distance";
import bearing from "@turf/bearing";
import destination from "@turf/destination";
import { point } from "@turf/helpers";
import type { RegionId, VillageFeature } from "./types";
import type { WeatherForecast } from "./weather";

export type PotentialImpactTier =
  | "Potential Red Zone"
  | "High Potential Impact"
  | "Moderate Potential Impact"
  | "Lower Potential Impact";

export interface PredictiveAssessment {
  featureId: string;
  name: string;
  role: "origin" | "candidate";
  baseSusceptibility: number;
  weatherFactor: number;
  directionalFactor: number;
  terrainFactor: number;
  distanceKm: number;
  potentialImpactScore: number; // 0.000 to 1.000
  impactTier: PotentialImpactTier;
  inProjectedSector: boolean;
  explanation: string;
}

export interface SpatialInfluenceSector {
  type: "Feature";
  geometry: {
    type: "Polygon";
    coordinates: [number, number][][]; // [lon, lat]
  };
  properties: {
    windDirection: number;
    windSpeed: number;
    spreadAngle: number;
    radiusKm: number;
    center: [number, number];
    disclaimer: string;
  };
}

export interface PredictiveRiskResult {
  assessments: PredictiveAssessment[];
  sectorPolygon: SpatialInfluenceSector;
  weather: WeatherForecast;
  redZoneCount: number;
  highImpactCount: number;
  epicenter: [number, number]; // [lon, lat]
  disclaimer: string;
}

export interface ModelThresholds {
  redZone: number; // default 0.80
  highImpact: number; // default 0.60
  moderateImpact: number; // default 0.40
}

export const DEFAULT_THRESHOLDS: ModelThresholds = {
  redZone: 0.80,
  highImpact: 0.60,
  moderateImpact: 0.40
};

export const SCIENTIFIC_DISCLAIMER = "Model-based screening — not an official warning.";

/**
 * Classifies a normalized 0-1 potential impact score into standardized screening tiers.
 */
export function classifyImpactTier(
  score: number,
  thresholds: ModelThresholds = DEFAULT_THRESHOLDS
): PotentialImpactTier {
  if (score >= thresholds.redZone) return "Potential Red Zone";
  if (score >= thresholds.highImpact) return "High Potential Impact";
  if (score >= thresholds.moderateImpact) return "Moderate Potential Impact";
  return "Lower Potential Impact";
}

/**
 * Computes shortest angular difference between two compass bearings in degrees (0-180).
 */
export function getAngularDifference(bearing1: number, bearing2: number): number {
  const diff = Math.abs((bearing1 - bearing2) % 360);
  return diff > 180 ? 360 - diff : diff;
}

/**
 * Generates a GeoJSON Sector Polygon for the downwind spatial influence area.
 */
export function generateInfluenceSectorPolygon(
  center: [number, number], // [lon, lat]
  windDirectionDeg: number,
  radiusKm = 18,
  spreadAngleDeg = 75
): SpatialInfluenceSector {
  const centerPt = point(center);
  const halfAngle = spreadAngleDeg / 2;
  const startAngle = (windDirectionDeg - halfAngle + 360) % 360;
  const endAngle = (windDirectionDeg + halfAngle) % 360;

  const arcCoords: [number, number][] = [center];
  const steps = 16;

  for (let i = 0; i <= steps; i++) {
    const angle = (startAngle + (i / steps) * spreadAngleDeg + 360) % 360;
    // Convert 0=N compass bearing to turf destination bearing (-180 to 180)
    const turfBearing = angle > 180 ? angle - 360 : angle;
    const dest = destination(centerPt, radiusKm, turfBearing, { units: "kilometers" });
    arcCoords.push(dest.geometry.coordinates as [number, number]);
  }

  // Close polygon
  arcCoords.push(center);

  return {
    type: "Feature",
    geometry: {
      type: "Polygon",
      coordinates: [arcCoords]
    },
    properties: {
      windDirection: windDirectionDeg,
      windSpeed: 0,
      spreadAngle: spreadAngleDeg,
      radiusKm,
      center,
      disclaimer: SCIENTIFIC_DISCLAIMER
    }
  };
}

/**
 * Runs the prototype predictive red-zone screening model on a set of village features.
 */
export function assessPredictiveRisk(
  features: VillageFeature[],
  weather: WeatherForecast,
  region: RegionId = "wayanad",
  epicenterOverride?: [number, number],
  thresholds: ModelThresholds = DEFAULT_THRESHOLDS
): PredictiveRiskResult {
  // Determine reference epicenter / storm front if not overridden
  const defaultEpicenters: Record<RegionId, [number, number]> = {
    wayanad: [76.13, 11.51], // Chooralmala / Vellarmala ridge
    assam: [92.95, 26.56], // Upstream Brahmaputra bend
    nepal: [85.34, 28.24] // Upper Langtang / Rasuwa glacial tongue
  };

  const epicenter = epicenterOverride || defaultEpicenters[region] || defaultEpicenters.wayanad;
  const epicenterPt = point(epicenter);

  // Weather intensity factor (scales with rain accumulation and wind speed)
  const rainNorm = Math.min(1.4, 0.6 + (weather.rainfallAccumulation24h / 140) * 0.6);
  const windNorm = Math.min(1.3, 0.7 + (weather.windSpeed / 45) * 0.4);
  const weatherFactor = Number((0.65 * rainNorm + 0.35 * windNorm).toFixed(3));

  const sectorRadiusKm = region === "assam" ? 28 : region === "nepal" ? 22 : 16;
  const sectorSpreadDeg = 75;

  const sectorPolygon = generateInfluenceSectorPolygon(
    epicenter,
    weather.windDirection,
    sectorRadiusKm,
    sectorSpreadDeg
  );
  sectorPolygon.properties.windSpeed = weather.windSpeed;

  const assessments: PredictiveAssessment[] = features.map((f) => {
    const p = f.properties;
    const isOrigin = p.role === "origin";
    const featPt = point(f.geometry.coordinates);

    // 1. Base Hazard Susceptibility
    let baseSusceptibility = 0.30;
    const hClass = p.hazard_class_landslide || p.flood_hazard_class || p.hazard_class_flood;
    if (hClass === "very_high") baseSusceptibility = 0.92;
    else if (hClass === "high") baseSusceptibility = 0.74;
    else if (hClass === "moderate") baseSusceptibility = 0.48;
    else if (hClass === "low") baseSusceptibility = 0.24;

    if (!isOrigin) {
      baseSusceptibility = p.flood_safety === "unsafe" ? 0.45 : p.flood_safety === "moderate" ? 0.28 : 0.12;
    }

    // 2. Directional exposure factor from storm vector
    const dKm = Number(distance(epicenterPt, featPt, { units: "kilometers" }).toFixed(2));
    const bDeg = (bearing(epicenterPt, featPt) + 360) % 360;
    const angleDiff = getAngularDifference(weather.windDirection, bDeg);

    let directionalFactor = 0.35;
    let inProjectedSector = false;

    if (angleDiff <= sectorSpreadDeg / 2 && dKm <= sectorRadiusKm) {
      inProjectedSector = true;
      directionalFactor = 1.0 - (angleDiff / (sectorSpreadDeg / 2)) * 0.25; // 0.75 - 1.00
    } else if (angleDiff <= 90) {
      directionalFactor = 0.65 - ((angleDiff - sectorSpreadDeg / 2) / (90 - sectorSpreadDeg / 2)) * 0.30; // 0.35 - 0.65
    }

    // 3. Terrain & Vulnerability factor
    const vuln = p.vulnerability_index ?? 0.5;
    const terrainFactor = Number((0.85 + 0.30 * vuln).toFixed(3));

    // 4. Distance attenuation
    let distFactor = 1.0;
    if (dKm > 8) {
      distFactor = Math.max(0.45, 1.0 - ((dKm - 8) / sectorRadiusKm) * 0.40);
    }

    // Composite Screening Calculation
    const rawScore = baseSusceptibility * weatherFactor * directionalFactor * terrainFactor * distFactor;
    const potentialImpactScore = Number(Math.min(1.0, Math.max(0.0, rawScore)).toFixed(3));
    const impactTier = classifyImpactTier(potentialImpactScore, thresholds);

    const explanation =
      impactTier === "Potential Red Zone"
        ? `Direct alignment with ${weather.windDirection}° storm vector (${weather.rainfallAccumulation24h}mm rain forecast) + High terrain susceptibility.`
        : impactTier === "High Potential Impact"
        ? `Elevated forecast exposure with ${dKm} km proximity to inflow front.`
        : impactTier === "Moderate Potential Impact"
        ? "Peripheral weather influence with moderate baseline terrain buffering."
        : "Lower modeled impact due to favorable orientation and buffer distance.";

    return {
      featureId: p.id,
      name: p.name,
      role: p.role,
      baseSusceptibility,
      weatherFactor,
      directionalFactor: Number(directionalFactor.toFixed(3)),
      terrainFactor,
      distanceKm: dKm,
      potentialImpactScore,
      impactTier,
      inProjectedSector,
      explanation
    };
  });

  const redZoneCount = assessments.filter((a) => a.impactTier === "Potential Red Zone").length;
  const highImpactCount = assessments.filter((a) => a.impactTier === "High Potential Impact").length;

  return {
    assessments,
    sectorPolygon,
    weather,
    redZoneCount,
    highImpactCount,
    epicenter,
    disclaimer: SCIENTIFIC_DISCLAIMER
  };
}
