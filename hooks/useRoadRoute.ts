"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import type { LatLon, RouteAlternative, RouteGeometry, RouteResult } from "@/lib/routing";

interface UseRoadRouteProps {
  origin?: [number, number] | null; // [lon, lat]
  destination?: [number, number] | null; // [lon, lat]
  enabled?: boolean;
  alternatives?: boolean;
}

// Client-side session cache to avoid repeated HTTP calls
const clientRouteCache = new Map<string, RouteResult>();

export function useRoadRoute({
  origin,
  destination,
  enabled = true,
  alternatives = true
}: UseRoadRouteProps) {
  const [route, setRoute] = useState<RouteResult | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedAlternativeIndex, setSelectedAlternativeIndex] = useState<number>(0);

  const abortRef = useRef<AbortController | null>(null);

  const fetchRoute = useCallback(async () => {
    if (!origin || !destination || !enabled) {
      setRoute(null);
      setIsLoading(false);
      return;
    }

    const cacheKey = `${origin[0].toFixed(5)},${origin[1].toFixed(5)}->${destination[0].toFixed(5)},${destination[1].toFixed(5)}:${alternatives}`;

    if (clientRouteCache.has(cacheKey)) {
      setRoute(clientRouteCache.get(cacheKey)!);
      setIsLoading(false);
      setError(null);
      return;
    }

    if (abortRef.current) {
      abortRef.current.abort();
    }

    const controller = new AbortController();
    abortRef.current = controller;

    setIsLoading(true);
    setError(null);

    try {
      const payload = {
        origin: { lat: origin[1], lon: origin[0] } as LatLon,
        destination: { lat: destination[1], lon: destination[0] } as LatLon,
        alternatives
      };

      const res = await fetch("/api/route", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
        signal: controller.signal
      });

      if (!res.ok) {
        throw new Error(`HTTP error ${res.status}`);
      }

      const data = (await res.json()) as RouteResult;
      clientRouteCache.set(cacheKey, data);
      setRoute(data);
      setSelectedAlternativeIndex(0);
    } catch (err: unknown) {
      if (err instanceof Error && err.name === "AbortError") {
        return;
      }
      console.warn("Client route fetch failed, falling back:", err);
      setError("Road route unavailable — showing geodesic fallback");
      setRoute(null);
    } finally {
      setIsLoading(false);
    }
  }, [origin, destination, enabled, alternatives]);

  useEffect(() => {
    fetchRoute();
    return () => {
      if (abortRef.current) {
        abortRef.current.abort();
      }
    };
  }, [fetchRoute]);

  // Active geometry coordinates [lat, lon] for Leaflet
  const activeGeometryCoords: [number, number][] | null = (() => {
    if (!route || route.status !== "success") return null;

    let targetGeo: RouteGeometry | null = route.geometry;
    if (selectedAlternativeIndex > 0 && route.alternatives && route.alternatives[selectedAlternativeIndex - 1]) {
      targetGeo = route.alternatives[selectedAlternativeIndex - 1].geometry;
    }

    if (!targetGeo || !targetGeo.coordinates) return null;

    // Convert GeoJSON [lon, lat] to Leaflet [lat, lon]
    return targetGeo.coordinates.map(([lon, lat]) => [lat, lon] as [number, number]);
  })();

  // Inactive alternative geometry coordinates for subtle map rendering
  const alternativeGeometries: { id: string; coords: [number, number][] }[] = (() => {
    if (!route || route.status !== "success" || !route.alternatives) return [];

    const list: { id: string; coords: [number, number][] }[] = [];

    if (selectedAlternativeIndex !== 0 && route.geometry?.coordinates) {
      list.push({
        id: "primary",
        coords: route.geometry.coordinates.map(([lon, lat]) => [lat, lon] as [number, number])
      });
    }

    route.alternatives.forEach((alt, idx) => {
      if (selectedAlternativeIndex !== idx + 1 && alt.geometry?.coordinates) {
        list.push({
          id: alt.id,
          coords: alt.geometry.coordinates.map(([lon, lat]) => [lat, lon] as [number, number])
        });
      }
    });

    return list;
  })();

  // Currently active route stats (primary or alternative)
  const activeStats = (() => {
    if (!route || route.status !== "success") return null;
    if (selectedAlternativeIndex > 0 && route.alternatives && route.alternatives[selectedAlternativeIndex - 1]) {
      const alt = route.alternatives[selectedAlternativeIndex - 1];
      return {
        distance_km: alt.distance_km,
        duration_minutes: alt.duration_minutes,
        summary: alt.summary
      };
    }
    return {
      distance_km: route.distance_km,
      duration_minutes: route.duration_minutes,
      summary: "Primary Route"
    };
  })();

  return {
    route,
    isLoading,
    error,
    refetch: fetchRoute,
    activeGeometryCoords,
    alternativeGeometries,
    activeStats,
    selectedAlternativeIndex,
    setSelectedAlternativeIndex
  };
}
