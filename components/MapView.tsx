"use client";

import "leaflet/dist/leaflet.css";
import { useEffect } from "react";
import {
  CircleMarker,
  MapContainer,
  Polyline,
  Popup,
  TileLayer,
  useMap,
  WMSTileLayer
} from "react-leaflet";
import type { RegionId, VillageAssessment, VillageFeature } from "@/lib/types";
import type { RelocationPlan } from "@/lib/planning";

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

export function MapView({
  features,
  assessments,
  selectedId,
  onSelect,
  bhuvanOverlay,
  bhuvanLayer,
  plan,
  region = "wayanad"
}: {
  features: VillageFeature[];
  assessments: VillageAssessment[];
  selectedId?: string;
  onSelect: (id: string) => void;
  bhuvanOverlay: boolean;
  bhuvanLayer: string | null;
  plan?: RelocationPlan;
  region?: RegionId;
}) {
  const assessmentById = new Map(assessments.map((a) => [a.id, a]));
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

  // Find destination coordinates for route line
  let routeCoords: [number, number][] | null = null;
  if (selectedFeature && selectedFeature.properties.role === "origin") {
    const topSmart = selectedAssessment?.smart_relocation_options?.[0];
    if (topSmart) {
      routeCoords = [
        [selectedFeature.geometry.coordinates[1], selectedFeature.geometry.coordinates[0]],
        [topSmart.coordinates[1], topSmart.coordinates[0]]
      ];
    } else if (plan?.allocation?.allocations?.[0]) {
      const topAllocSiteId = plan.allocation.allocations[0].site_id;
      const topSiteFeature = features.find((f) => f.properties.id === topAllocSiteId);
      if (topSiteFeature) {
        routeCoords = [
          [selectedFeature.geometry.coordinates[1], selectedFeature.geometry.coordinates[0]],
          [topSiteFeature.geometry.coordinates[1], topSiteFeature.geometry.coordinates[0]]
        ];
      }
    }
  }

  return (
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

      {/* Relocation Route Vector */}
      {routeCoords && (
        <Polyline
          positions={routeCoords}
          pathOptions={{
            color: "#0284c7",
            weight: 3,
            dashArray: "6, 6",
            opacity: 0.95
          }}
        />
      )}

      {/* Village & Relocation Site Markers */}
      {features.map((feature) => {
        const p = feature.properties;
        const assessment = assessmentById.get(p.id);
        const isCandidate = p.role === "candidate";

        let color = isCandidate ? colors.candidate : colors[assessment?.priority_tier ?? "Medium-term"];
        if (isCandidate && p.flood_safety === "moderate") {
          color = colors.candidate_critical;
        }

        const isSelected = selectedId === p.id;
        const radius = isSelected ? 11 : isCandidate ? 7 : 8;

        return (
          <CircleMarker
            key={p.id}
            center={[feature.geometry.coordinates[1], feature.geometry.coordinates[0]]}
            radius={radius}
            pathOptions={{
              color: isSelected ? "#0f172a" : color,
              fillColor: color,
              fillOpacity: 0.9,
              weight: isSelected ? 3 : 1.5
            }}
            eventHandlers={{ click: () => onSelect(p.id) }}
          >
            <Popup>
              <div className="p-1 space-y-1.5 text-xs text-slate-800">
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
                  <div className="space-y-0.5 text-slate-700 text-[11px]">
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
              </div>
            </Popup>
          </CircleMarker>
        );
      })}
    </MapContainer>
  );
}
