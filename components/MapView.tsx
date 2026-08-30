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
  "Short-term": "#f59e0b", // Amber
  "Medium-term": "#22c55e", // Green
  candidate: "#0284c7", // Blue
  candidate_critical: "#8b5cf6" // Violet
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
      className="rounded-lg border border-slate-800 h-full w-full"
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
            weight: 2.5,
            dashArray: "5, 6",
            opacity: 0.9
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
              color: isSelected ? "#ffffff" : color,
              fillColor: color,
              fillOpacity: 0.85,
              weight: isSelected ? 2.5 : 1.5
            }}
            eventHandlers={{ click: () => onSelect(p.id) }}
          >
            <Popup>
              <div className="p-0.5 space-y-1.5 text-xs">
                <div className="flex items-center justify-between gap-2 border-b border-slate-700 pb-1">
                  <strong className="text-xs font-bold text-slate-100">{p.name}</strong>
                  <span
                    className={`rounded px-1.5 py-0.2 text-[9px] font-bold uppercase font-mono ${
                      isCandidate
                        ? "bg-sky-950 text-sky-300 border border-sky-800"
                        : assessment?.priority_tier === "Immediate"
                        ? "bg-red-950 text-red-300 border border-red-800"
                        : "bg-emerald-950 text-emerald-300 border border-emerald-800"
                    }`}
                  >
                    {isCandidate ? "Candidate Safe Zone" : assessment?.priority_tier ?? "Origin"}
                  </span>
                </div>

                {p.district && <p className="text-[11px] text-slate-400">District: {p.district}</p>}

                {isCandidate ? (
                  <div className="space-y-0.5 text-slate-300 text-[11px]">
                    <p>Safe Land: <b className="font-mono">{p.safe_land_area_hectares} ha</b></p>
                    <p>Safe Capacity: <b className="font-mono">{Math.round(p.safe_land_area_hectares * p.max_safe_density_per_hectare).toLocaleString()}</b></p>
                    <p>Available Headroom: <b className="font-mono text-emerald-400">{p.available_capacity?.toLocaleString() ?? "Calculated"}</b></p>
                    <p>Flood Safety: <b className="capitalize text-sky-300">{p.flood_safety ?? "Safe"}</b></p>
                  </div>
                ) : (
                  <div className="space-y-0.5 text-slate-300 text-[11px]">
                    <p>Displaced Target: <b className="font-mono text-slate-100">{(p.affected_population ?? p.current_population).toLocaleString()}</b></p>
                    <p>Hazard Level: <span className="capitalize text-orange-400 font-medium">{p.flood_hazard_class ?? p.hazard_class_flood}</span></p>
                    <p>Priority Score (RPS): <b className="text-sky-400 font-mono">{assessment?.rps.toFixed(3) ?? "N/A"}</b></p>
                    {assessment?.smart_relocation_options?.[0] && (
                      <div className="rounded bg-slate-850 p-1 mt-1 border border-slate-700/60 text-[10px] text-teal-300">
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
