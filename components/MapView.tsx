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
import type { VillageAssessment, VillageFeature } from "@/lib/types";
import type { RelocationPlan } from "@/lib/planning";

const colors: Record<string, string> = {
  Immediate: "#ef4444", // Red
  "Short-term": "#f97316", // Orange
  "Medium-term": "#22c55e", // Green
  candidate: "#38bdf8", // Blue
  candidate_critical: "#a855f7" // Purple
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
  region?: "wayanad" | "assam";
}) {
  const assessmentById = new Map(assessments.map((a) => [a.id, a]));
  const mapbox = process.env.NEXT_PUBLIC_MAPBOX_TOKEN;
  const tileUrl = mapbox
    ? `https://api.mapbox.com/styles/v1/mapbox/outdoors-v12/tiles/256/{z}/{x}/{y}?access_token=${mapbox}`
    : "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png";

  const isAssam = region === "assam";
  const defaultCenter: [number, number] = isAssam ? [26.55, 93.30] : [11.535, 76.12];
  const defaultZoom = isAssam ? 8 : 12;

  // Selected feature coordinates
  const selectedFeature = features.find((f) => f.properties.id === selectedId);
  const selectedAssessment = selectedFeature ? assessmentById.get(selectedFeature.properties.id) : undefined;

  // Find destination coordinates for route line
  let routeCoords: [number, number][] | null = null;
  if (selectedFeature && selectedFeature.properties.role === "origin") {
    // Check smart relocation option first
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
      className="rounded-xl border border-slate-700 h-full w-full"
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
            color: "#38bdf8",
            weight: 3,
            dashArray: "6, 8",
            opacity: 0.85
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
        const radius = isSelected ? 12 : isCandidate ? 8 : 9;

        return (
          <CircleMarker
            key={p.id}
            center={[feature.geometry.coordinates[1], feature.geometry.coordinates[0]]}
            radius={radius}
            pathOptions={{
              color: isSelected ? "#ffffff" : color,
              fillColor: color,
              fillOpacity: 0.85,
              weight: isSelected ? 3 : 2
            }}
            eventHandlers={{ click: () => onSelect(p.id) }}
          >
            <Popup>
              <div className="p-1 space-y-1 text-xs">
                <div className="flex items-center justify-between gap-2">
                  <strong className="text-sm font-bold text-slate-100">{p.name}</strong>
                  <span
                    className={`rounded px-1.5 py-0.2 text-[9px] font-bold uppercase ${
                      isCandidate
                        ? "bg-sky-950 text-sky-300"
                        : assessment?.priority_tier === "Immediate"
                        ? "bg-red-950 text-red-300"
                        : "bg-emerald-950 text-emerald-300"
                    }`}
                  >
                    {isCandidate ? "Candidate Safe Zone" : assessment?.priority_tier ?? "Origin"}
                  </span>
                </div>

                {p.district && <p className="text-slate-400">District: {p.district}</p>}

                {isCandidate ? (
                  <div className="space-y-0.5 text-slate-300 border-t border-slate-700 pt-1 mt-1">
                    <p>Safe Land Area: {p.safe_land_area_hectares} ha</p>
                    <p>Safe Capacity: {Math.round(p.safe_land_area_hectares * p.max_safe_density_per_hectare)}</p>
                    <p>Available Headroom: {p.available_capacity ?? "Calculated"}</p>
                    <p>Flood Safety: <b className="capitalize text-sky-300">{p.flood_safety ?? "Safe"}</b></p>
                  </div>
                ) : (
                  <div className="space-y-0.5 text-slate-300 border-t border-slate-700 pt-1 mt-1">
                    <p>Displaced Population: <b>{(p.affected_population ?? p.current_population).toLocaleString()}</b></p>
                    <p>Hazard Severity: <span className="capitalize text-orange-300">{p.flood_hazard_class ?? p.hazard_class_flood}</span></p>
                    <p>Priority Score (RPS): <b className="text-sky-300">{assessment?.rps.toFixed(3) ?? "N/A"}</b></p>
                    {assessment?.smart_relocation_options?.[0] && (
                      <p className="text-[11px] text-teal-300 border-t border-slate-700/60 pt-1">
                        Recommended: {assessment.smart_relocation_options[0].site_name} ({assessment.smart_relocation_options[0].distance_km} km)
                      </p>
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
