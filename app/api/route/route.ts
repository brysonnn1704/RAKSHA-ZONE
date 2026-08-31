import { NextRequest, NextResponse } from "next/server";
import { getRoadRoute, type LatLon, type RouteResult } from "@/lib/routing";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { origin, destination, alternatives } = body as {
      origin?: LatLon;
      destination?: LatLon;
      alternatives?: boolean;
    };

    if (
      !origin ||
      typeof origin.lat !== "number" ||
      typeof origin.lon !== "number" ||
      !destination ||
      typeof destination.lat !== "number" ||
      typeof destination.lon !== "number"
    ) {
      return NextResponse.json(
        {
          status: "error",
          source: "OSRM",
          message: "Invalid origin or destination coordinates provided.",
          distance_m: 0,
          duration_s: null,
          distance_km: 0,
          duration_minutes: null,
          geometry: null,
          geodesic_distance_km: 0
        } as RouteResult,
        { status: 400 }
      );
    }

    // Coordinate range validation
    if (
      origin.lat < -90 ||
      origin.lat > 90 ||
      origin.lon < -180 ||
      origin.lon > 180 ||
      destination.lat < -90 ||
      destination.lat > 90 ||
      destination.lon < -180 ||
      destination.lon > 180
    ) {
      return NextResponse.json(
        {
          status: "error",
          source: "OSRM",
          message: "Coordinates out of valid geographical bounds.",
          distance_m: 0,
          duration_s: null,
          distance_km: 0,
          duration_minutes: null,
          geometry: null,
          geodesic_distance_km: 0
        } as RouteResult,
        { status: 400 }
      );
    }

    const routeResult = await getRoadRoute(origin, destination, {
      alternatives: !!alternatives,
      timeoutMs: 4500
    });

    return NextResponse.json(routeResult);
  } catch (error: unknown) {
    console.error("API /api/route error:", error);
    return NextResponse.json(
      {
        status: "error",
        source: "OSRM",
        message: "Internal route calculation error. Fallback connection available.",
        distance_m: 0,
        duration_s: null,
        distance_km: 0,
        duration_minutes: null,
        geometry: null,
        geodesic_distance_km: 0
      } as RouteResult,
      { status: 500 }
    );
  }
}
