import { NextRequest, NextResponse } from "next/server";
import { getVillageFeatures } from "@/lib/data";
import type { RegionId } from "@/lib/types";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const regionParam = searchParams.get("region");
  const region: RegionId = regionParam === "assam" ? "assam" : "wayanad";
  return NextResponse.json(getVillageFeatures(region));
}
