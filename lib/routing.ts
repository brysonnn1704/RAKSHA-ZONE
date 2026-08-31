import distance from "@turf/distance";
import { point } from "@turf/helpers";

export interface LatLon {
  lat: number;
  lon: number;
}

export interface RouteGeometry {
  type: "LineString";
  coordinates: [number, number][]; // [lon, lat]
}

export interface RouteAlternative {
  id: string;
  summary: string;
  distance_m: number;
  duration_s: number;
  distance_km: number;
  duration_minutes: number;
  geometry: RouteGeometry;
}

export interface RouteResult {
  status: "success" | "no_route" | "error";
  source: string;
  distance_m: number;
  duration_s: number | null;
  distance_km: number;
  duration_minutes: number | null;
  geometry: RouteGeometry | null;
  geodesic_distance_km: number;
  alternatives?: RouteAlternative[];
  message?: string;
}

export interface RouteOptions {
  alternatives?: boolean;
  timeoutMs?: number;
}

export interface RoutingProvider {
  name: string;
  getRoute(
    origin: LatLon,
    destination: LatLon,
    options?: RouteOptions
  ): Promise<RouteResult>;
}

// In-memory cache for server and client side route reuse
const routeCache = new Map<string, RouteResult>();

function getCacheKey(origin: LatLon, destination: LatLon, alternatives = false): string {
  return `${origin.lat.toFixed(5)},${origin.lon.toFixed(5)}->${destination.lat.toFixed(5)},${destination.lon.toFixed(5)}:${alternatives}`;
}

/**
 * Calculates geodesic (straight-line) distance using Turf.js in kilometers.
 */
export function calculateGeodesicDistance(origin: LatLon, destination: LatLon): number {
  return Number(
    distance(point([origin.lon, origin.lat]), point([destination.lon, destination.lat]), {
      units: "kilometers"
    }).toFixed(2)
  );
}

/**
 * Standard OSRM HTTP Route API Provider.
 * Calls public OSRM router with timeout and response normalization.
 */
export class OSRMProvider implements RoutingProvider {
  name = "OSRM (OpenStreetMap)";

  async getRoute(
    origin: LatLon,
    destination: LatLon,
    options: RouteOptions = {}
  ): Promise<RouteResult> {
    const geodesicKm = calculateGeodesicDistance(origin, destination);
    const cacheKey = getCacheKey(origin, destination, options.alternatives);

    if (routeCache.has(cacheKey)) {
      return routeCache.get(cacheKey)!;
    }

    const timeoutMs = options.timeoutMs ?? 5000;
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), timeoutMs);

    const alternativesParam = options.alternatives ? "&alternatives=true" : "";
    const url = `https://router.project-osrm.org/route/v1/driving/${origin.lon},${origin.lat};${destination.lon},${destination.lat}?overview=full&geometries=geojson${alternativesParam}`;

    try {
      const response = await fetch(url, {
        signal: controller.signal,
        headers: {
          Accept: "application/json"
        }
      });
      clearTimeout(timer);

      if (!response.ok) {
        throw new Error(`OSRM HTTP error status ${response.status}`);
      }

      const data = await response.json();

      if (data.code !== "Ok" || !data.routes || data.routes.length === 0) {
        const noRouteRes: RouteResult = {
          status: "no_route",
          source: this.name,
          distance_m: Math.round(geodesicKm * 1000),
          duration_s: null,
          distance_km: geodesicKm,
          duration_minutes: null,
          geometry: null,
          geodesic_distance_km: geodesicKm,
          message: "No connected road network found between coordinates. Approximate straight-line connection shown."
        };
        routeCache.set(cacheKey, noRouteRes);
        return noRouteRes;
      }

      const primaryRoute = data.routes[0];
      const distanceM = Math.round(primaryRoute.distance);
      const durationS = Math.round(primaryRoute.duration);
      const distanceKm = Number((distanceM / 1000).toFixed(1));
      const durationMinutes = Math.round(durationS / 60);

      // Parse alternative routes if present
      const alternatives: RouteAlternative[] = [];
      if (data.routes.length > 1) {
        for (let i = 1; i < data.routes.length; i++) {
          const alt = data.routes[i];
          const altDistM = Math.round(alt.distance);
          const altDurS = Math.round(alt.duration);
          alternatives.push({
            id: `alt-${i}`,
            summary: alt.legs?.[0]?.summary || `Alternative Route ${i}`,
            distance_m: altDistM,
            duration_s: altDurS,
            distance_km: Number((altDistM / 1000).toFixed(1)),
            duration_minutes: Math.round(altDurS / 60),
            geometry: alt.geometry
          });
        }
      }

      const successResult: RouteResult = {
        status: "success",
        source: this.name,
        distance_m: distanceM,
        duration_s: durationS,
        distance_km: distanceKm,
        duration_minutes: durationMinutes,
        geometry: primaryRoute.geometry,
        geodesic_distance_km: geodesicKm,
        alternatives: alternatives.length > 0 ? alternatives : undefined
      };

      routeCache.set(cacheKey, successResult);
      return successResult;
    } catch (err: unknown) {
      clearTimeout(timer);
      const isAbort = err instanceof Error && err.name === "AbortError";
      const errorResult: RouteResult = {
        status: "error",
        source: this.name,
        distance_m: Math.round(geodesicKm * 1000),
        duration_s: null,
        distance_km: geodesicKm,
        duration_minutes: null,
        geometry: null,
        geodesic_distance_km: geodesicKm,
        message: isAbort
          ? "Routing request timed out. Showing approximate geodesic connection."
          : "Road routing service unavailable. Showing approximate geodesic connection."
      };
      return errorResult;
    }
  }
}

/**
 * Placeholder for future ISRO Bhuvan Shortest Path API provider.
 * Follows identical RoutingProvider contract.
 */
export class BhuvanRoutingProvider implements RoutingProvider {
  name = "ISRO Bhuvan Route Engine (Future)";

  constructor(private apiKey?: string) {}

  async getRoute(
    origin: LatLon,
    destination: LatLon,
    options?: RouteOptions
  ): Promise<RouteResult> {
    // Fallback to OSRM provider when Bhuvan credentials are not configured
    const osrm = new OSRMProvider();
    return osrm.getRoute(origin, destination, options);
  }
}

/**
 * Default routing provider instance.
 */
const defaultProvider: RoutingProvider = new OSRMProvider();

/**
 * Top-level road route calculation function.
 */
export async function getRoadRoute(
  origin: LatLon,
  destination: LatLon,
  options?: RouteOptions
): Promise<RouteResult> {
  return defaultProvider.getRoute(origin, destination, options);
}

/**
 * Future route safety & cost model (evaluates route exposure to hazard polygons).
 */
export function calculateRouteSafetyScore(
  route: RouteResult,
  hazardExposurePct = 0,
  accessibilityScore = 1
): number {
  const normalizedDistanceScore = 1 / (1 + route.distance_km / 15);
  const hazardScore = 1 - Math.min(1, Math.max(0, hazardExposurePct));
  const composite = 0.4 * normalizedDistanceScore + 0.4 * hazardScore + 0.2 * accessibilityScore;
  return Number(composite.toFixed(3));
}
