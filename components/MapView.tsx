"use client";

import "leaflet/dist/leaflet.css";
import { useEffect } from "react";
import {
  CircleMarker,
  MapContainer,
  Polygon,
  Polyline,
  Popup,
  TileLayer,
  useMap,
  WMSTileLayer
} from "react-leaflet";
import type { RegionId, VillageAssessment, VillageFeature } from "@/lib/types";
import type { RelocationPlan } from "@/lib/planning";
import type { PredictiveRiskResult } from "@/lib/predictiveRisk";

const colors: Record<string, string> = {
  Immediate: "#dc2626", // High-contrast Red
  "Short-term": "#d97706", // Amber
  "Medium-term": "#16a34a", // Green
  candidate: "#0284c7", // Sky Blue
  candidate_critical: "#7c3aed" // Violet
};

function MapViewRecenter({ center, zoom }: { center: [number, number]; zoom: number }) {
  const map = useMap();
  useEffect(() => {
    map.setView(center, zoom, { animate: true });
  }, [center, zoom, map]);
  return null;
}

export interface MapViewProps {
  features: VillageFeature[];
  assessments: VillageAssessment[];
  selectedId?: string;
  onSelect: (id: string) => void;
  bhuvanOverlay?: boolean;
  bhuvanLayer?: string | null;
  plan?: RelocationPlan;
  region?: RegionId;
  roadRouteCoords?: [number, number][] | null; // [lat, lon]
  alternativeRouteCoords?: { id: string; coords: [number, number][] }[];
  routeStats?: {
    distance_km: number;
    duration_minutes: number | null;
    source?: string;
    isRoadRoute: boolean;
    summary?: string;
  } | null;
  isLoadingRoute?: boolean;
  predictiveResult?: PredictiveRiskResult | null;
  showPredictiveRisk?: boolean;
  onTogglePredictiveRisk?: (enabled: boolean) => void;
}

export function MapView({
  features,
  assessments,
  selectedId,
  onSelect,
  bhuvanOverlay = false,
  bhuvanLayer = null,
  plan,
  region = "wayanad",
  roadRouteCoords = null,
  alternativeRouteCoords = [],
  routeStats = null,
  isLoadingRoute = false,
  predictiveResult = null,
  showPredictiveRisk = true,
  onTogglePredictiveRisk
}: MapViewProps) {
  const assessmentById = new Map(assessments.map((a) => [a.id, a]));
  const predictiveById = new Map(
    predictiveResult?.assessments.map((pa) => [pa.featureId, pa]) || []
  );

  const mapbox = process.env.NEXT_PUBLIC_MAPBOX_TOKEN;
  const tileUrl = mapbox
    ? `https://api.mapbox.com/styles/v1/mapbox/outdoors-v12/tiles/256/{z}/{x}/{y}?access_token=${mapbox}`
    : "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png";

  const defaultCenter: [number, number] =
    region === "assam"
      ? [26.55, 93.30]
      : region === "nepal"
      ? [28.18, 85.30]
      : [11.535, 76.12];

  const defaultZoom = region === "assam" ? 8 : region === "nepal" ? 10 : 12;

  // Selected feature coordinates
  const selectedFeature = features.find((f) => f.properties.id === selectedId);
  const selectedAssessment = selectedFeature ? assessmentById.get(selectedFeature.properties.id) : undefined;

  // Geodesic fallback straight line coordinates [lat, lon]
  let geodesicCoords: [number, number][] | null = null;
  if (selectedFeature && selectedFeature.properties.role === "origin") {
    const topSmart = selectedAssessment?.smart_relocation_options?.[0];
    if (topSmart) {
      geodesicCoords = [
        [selectedFeature.geometry.coordinates[1], selectedFeature.geometry.coordinates[0]],
        [topSmart.coordinates[1], topSmart.coordinates[0]]
      ];
    } else if (plan?.allocation?.allocations?.[0]) {
      const topAllocSiteId = plan.allocation.allocations[0].site_id;
      const topSiteFeature = features.find((f) => f.properties.id === topAllocSiteId);
      if (topSiteFeature) {
        geodesicCoords = [
          [selectedFeature.geometry.coordinates[1], selectedFeature.geometry.coordinates[0]],
          [topSiteFeature.geometry.coordinates[1], topSiteFeature.geometry.coordinates[0]]
        ];
      }
    }
  }

  const hasValidRoadRoute = roadRouteCoords && roadRouteCoords.length > 1;

  // Convert GeoJSON sector polygon coordinates [lon, lat] to Leaflet [lat, lon]
  const sectorPolygonCoords: [number, number][] | null = (() => {
    if (!showPredictiveRisk || !predictiveResult?.sectorPolygon?.geometry?.coordinates?.[0]) {
      return null;
    }
    return predictiveResult.sectorPolygon.geometry.coordinates[0].map(
      ([lon, lat]) => [lat, lon] as [number, number]
    );
  })();

  return (
    <div className="relative h-full w-full">
      <MapContainer
        center={defaultCenter}
        zoom={defaultZoom}
        scrollWheelZoom
        className="rounded-lg border border-slate-200 h-full w-full shadow-2xs"
      >
        <MapViewRecenter center={defaultCenter} zoom={defaultZoom} />

        <TileLayer
          url={tileUrl}
          attribution={
            mapbox
              ? "© Mapbox © OpenStreetMap"
              : "© OpenStreetMap contributors | RAKSHA-ZONE"
          }
        />

        {bhuvanOverlay && bhuvanLayer && (
          <WMSTileLayer
            url="https://bhuvan-vec2.nrsc.gov.in/bhuvan/wms"
            layers={bhuvanLayer}
            format="image/png"
            transparent
            opacity={0.45}
          />
        )}

        {/* 1. Potential Red-Zone Spatial Influence Sector Polygon (Forecast Model) */}
        {sectorPolygonCoords && (
          <Polygon
            positions={sectorPolygonCoords}
            pathOptions={{
              color: "#dc2626",
              fillColor: "#ef4444",
              fillOpacity: 0.12,
              weight: 1.5,
              dashArray: "4, 6"
            }}
          />
        )}

        {/* 2. Inactive Alternative Routes (Subtle Dash) */}
        {alternativeRouteCoords.map((alt) => (
          <Polyline
            key={alt.id}
            positions={alt.coords}
            pathOptions={{
              color: "#64748b",
              weight: 3,
              dashArray: "5, 7",
              opacity: 0.6
            }}
          />
        ))}

        {/* 3. Primary Road Network Route (Solid with Outline) */}
        {hasValidRoadRoute && (
          <>
            {/* Soft Casing / Glow */}
            <Polyline
              positions={roadRouteCoords}
              pathOptions={{
                color: "#0369a1",
                weight: 6.5,
                opacity: 0.25
              }}
            />
            {/* Active Highway Line */}
            <Polyline
              positions={roadRouteCoords}
              pathOptions={{
                color: "#0284c7",
                weight: 4,
                opacity: 0.95
              }}
            />
          </>
        )}

        {/* 4. Fallback Geodesic Straight Vector (Shown when road route is unavailable or loading) */}
        {!hasValidRoadRoute && geodesicCoords && (
          <Polyline
            positions={geodesicCoords}
            pathOptions={{
              color: "#0284c7",
              weight: 3,
              dashArray: "6, 6",
              opacity: 0.85
            }}
          />
        )}

        {/* 5. Origin Settlements and Candidate Relocation Site Markers */}
        {features.map((feature) => {
          const p = feature.properties;
          const assessment = assessmentById.get(p.id);
          const predictive = predictiveById.get(p.id);
          const isCandidate = p.role === "candidate";

          let color = isCandidate ? colors.candidate : colors[assessment?.priority_tier ?? "Medium-term"];
          if (isCandidate && p.flood_safety === "moderate") {
            color = colors.candidate_critical;
          }

          const isSelected = selectedId === p.id;
          const isPotentialRedZone = showPredictiveRisk && predictive?.impactTier === "Potential Red Zone";
          const radius = isSelected ? 11 : isCandidate ? 7 : 8;

          return (
            <CircleMarker
              key={p.id}
              center={[feature.geometry.coordinates[1], feature.geometry.coordinates[0]]}
              radius={radius}
              pathOptions={{
                color: isSelected ? "#0f172a" : isPotentialRedZone ? "#991b1b" : color,
                fillColor: color,
                fillOpacity: 0.9,
                weight: isSelected ? 3.5 : isPotentialRedZone ? 2.5 : 1.5
              }}
              eventHandlers={{ click: () => onSelect(p.id) }}
            >
              <Popup>
                <div className="p-1 space-y-2 text-xs text-slate-800">
                  <div className="flex items-center justify-between gap-2 border-b border-slate-200 pb-1">
                    <strong className="text-xs font-bold text-slate-900">{p.name}</strong>
                    <span
                      className={`rounded px-1.5 py-0.5 text-[9px] font-bold uppercase font-mono border ${
                        isCandidate
                          ? "bg-sky-50 text-sky-700 border-sky-200"
                          : assessment?.priority_tier === "Immediate"
                          ? "bg-red-50 text-red-700 border-red-200"
                          : "bg-emerald-50 text-emerald-700 border-emerald-200"
                      }`}
                    >
                      {isCandidate ? "Candidate Safe Zone" : assessment?.priority_tier ?? "Origin"}
                    </span>
                  </div>

                  {p.district && (
                    <p className="text-[11px] text-slate-500">
                      {p.district} {p.country ? `(${p.country})` : p.state ? `(${p.state})` : ""}
                    </p>
                  )}

                  {isCandidate ? (
                    <div className="space-y-0.5 text-slate-700 text-[11px]">
                      <p>Safe Land Area: <b className="font-mono text-slate-900">{p.safe_land_area_hectares} ha</b></p>
                      <p>Safe Capacity: <b className="font-mono text-slate-900">{Math.round(p.safe_land_area_hectares * p.max_safe_density_per_hectare).toLocaleString()}</b></p>
                      <p>Available Headroom: <b className="font-mono text-emerald-700">{p.available_capacity?.toLocaleString() ?? "Calculated"}</b></p>
                      <p>Safety Rating: <b className="capitalize text-sky-700">{p.flood_safety ?? "Safe"}</b></p>
                    </div>
                  ) : (
                    <div className="space-y-1 text-slate-700 text-[11px]">
                      <p>Evacuation Target: <b className="font-mono text-slate-900">{(p.affected_population ?? p.current_population).toLocaleString()}</b></p>
                      <p>Hazard Level: <span className="capitalize text-orange-700 font-semibold">{p.flood_hazard_class ?? p.hazard_class_flood ?? p.hazard_class_landslide}</span></p>
                      <p>Priority Score (RPS): <b className="text-sky-700 font-mono">{assessment?.rps.toFixed(3) ?? "N/A"}</b></p>
                      {assessment?.smart_relocation_options?.[0] && (
                        <div className="rounded bg-sky-50 p-1.5 mt-1 border border-sky-200 text-[10px] text-sky-900 font-medium">
                          Top Rec: {assessment.smart_relocation_options[0].site_name} ({assessment.smart_relocation_options[0].distance_km} km)
                        </div>
                      )}
                    </div>
                  )}

                  {/* Predictive Risk Screening Section */}
                  {showPredictiveRisk && predictive && (
                    <div className="mt-2 pt-1.5 border-t border-slate-200 bg-slate-50 p-1.5 rounded space-y-1">
                      <div className="flex items-center justify-between text-[10px]">
                        <span className="font-bold text-slate-700 uppercase tracking-tight">Forecast Screening</span>
                        <span
                          className={`rounded px-1 py-0.2 font-mono font-bold text-[9px] border ${
                            predictive.impactTier === "Potential Red Zone"
                              ? "bg-red-100 text-red-800 border-red-300"
                              : predictive.impactTier === "High Potential Impact"
                              ? "bg-amber-100 text-amber-800 border-amber-300"
                              : "bg-emerald-50 text-emerald-700 border-emerald-200"
                          }`}
                        >
                          {predictive.impactTier}
                        </span>
                      </div>
                      <p className="text-[10px] text-slate-600 leading-tight">
                        Score: <b className="font-mono text-slate-900">{predictive.potentialImpactScore.toFixed(3)}</b> · {predictive.explanation}
                      </p>
                      <p className="text-[9px] text-slate-400 italic">
                        *Model-based screening — not an official warning.
                      </p>
                    </div>
                  )}
                </div>
              </Popup>
            </CircleMarker>
          );
        })}
      </MapContainer>

      {/* Floating Route Telemetry Badge (Top Right) */}
      {selectedFeature && (
        <div className="absolute top-3 right-3 z-[1000] pointer-events-none">
          <div className="rounded-lg bg-white/95 backdrop-blur-xs border border-slate-200 px-3 py-1.5 shadow-md flex items-center gap-2 text-xs font-mono">
            {isLoadingRoute ? (
              <span className="flex items-center gap-1.5 text-slate-600">
                <span className="h-2 w-2 rounded-full bg-sky-500 animate-ping" />
                <span>Computing OSRM Road Route...</span>
              </span>
            ) : hasValidRoadRoute && routeStats ? (
              <span className="flex items-center gap-2 text-slate-800">
                <span className="h-2 w-2 rounded-full bg-emerald-500" />
                <span className="font-bold text-sky-900">{routeStats.distance_km} km</span>
                {routeStats.duration_minutes !== null && (
                  <span className="text-slate-500">· ~{routeStats.duration_minutes} min ETA</span>
                )}
                <span className="rounded bg-sky-100 px-1 py-0.2 text-[9px] font-bold text-sky-800 uppercase">
                  OSRM Route
                </span>
              </span>
            ) : geodesicCoords ? (
              <span className="flex items-center gap-1.5 text-slate-600">
                <span className="h-2 w-2 rounded-full bg-amber-500" />
                <span>Geodesic Vector</span>
              </span>
            ) : null}
          </div>
        </div>
      )}

      {/* Floating Forecast Predictive Screening Badge & Toggle (Bottom Left) */}
      {predictiveResult && (
        <div className="absolute bottom-3 left-3 z-[1000]">
          <div className="rounded-lg bg-white/95 backdrop-blur-xs border border-slate-200 px-3 py-2 shadow-md space-y-1 text-xs max-w-[320px]">
            <div className="flex items-center justify-between gap-2">
              <label className="flex items-center gap-1.5 cursor-pointer select-none font-bold text-slate-900 text-[11px]">
                <input
                  type="checkbox"
                  checked={showPredictiveRisk}
                  onChange={(e) => onTogglePredictiveRisk?.(e.target.checked)}
                  className="rounded border-slate-300 text-sky-600 focus:ring-sky-500 h-3.5 w-3.5"
                />
                <span>Forecast Potential Red-Zone Screening</span>
              </label>
            </div>

            {showPredictiveRisk && (
              <div className="space-y-1 pt-1 border-t border-slate-100 text-[10px] text-slate-600 font-mono">
                <div className="flex items-center justify-between">
                  <span>🌧️ Rain: {predictiveResult.weather.rainfallAccumulation24h}mm/24h</span>
                  <span>💨 Wind: {predictiveResult.weather.windSpeed}km/h ({predictiveResult.weather.windDirection}°)</span>
                </div>
                <div className="flex items-center justify-between text-slate-700">
                  <span>Sector: {predictiveResult.redZoneCount} Potential Red Zones</span>
                  <span className="text-emerald-700 font-bold">Open-Meteo</span>
                </div>
                <p className="text-[9px] text-slate-400 italic pt-0.5">
                  *Model-based screening — not an official warning.
                </p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
