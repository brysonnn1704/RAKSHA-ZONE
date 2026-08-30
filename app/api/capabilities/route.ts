import { NextResponse } from "next/server";
export async function GET() {
  const endpoint = "https://bhuvan-vec2.nrsc.gov.in/bhuvan/wms";
  let layer: string | null = null;
  try {
    const response = await fetch(`${endpoint}?service=WMS&request=GetCapabilities`, { signal: AbortSignal.timeout(4000), next: { revalidate: 3600 } });
    const xml = await response.text();
    layer = xml.match(/<Name>([^<]+)<\/Name>/)?.[1] ?? null;
  } catch { /* Optional service: an unavailable endpoint must never degrade the dashboard. */ }
  return NextResponse.json({ bhuvanWms: { endpoint, layer, reachable: Boolean(layer) }, bhuvanRest: Boolean(process.env.BHUVAN_API_TOKEN), dataGov: Boolean(process.env.DATA_GOV_API_KEY), mapbox: Boolean(process.env.NEXT_PUBLIC_MAPBOX_TOKEN) });
}
