import type { RegionId } from "./types";

export interface WeatherForecast {
  windSpeed: number; // km/h
  windDirection: number; // degrees (0-360)
  precipitation: number; // mm (current / hourly rate)
  rainfallAccumulation24h: number; // mm in 24h
  temperature: number; // °C
  relativeHumidity: number; // %
  weatherCondition: string;
  forecastTime: string;
  source: string;
  isFallback: boolean;
}

// In-memory cache with 15-minute expiry
interface CacheEntry {
  data: WeatherForecast;
  timestamp: number;
}
const weatherCache = new Map<string, CacheEntry>();
const CACHE_TTL_MS = 15 * 60 * 1000;

const SCENARIO_DEFAULTS: Record<RegionId, WeatherForecast> = {
  wayanad: {
    windSpeed: 28,
    windDirection: 240, // SW monsoon vector
    precipitation: 18.5,
    rainfallAccumulation24h: 142.0,
    temperature: 22.4,
    relativeHumidity: 94,
    weatherCondition: "Monsoon Surge / Heavy Rainfall",
    forecastTime: new Date().toISOString(),
    source: "IMD / Open-Meteo Synoptic Baseline",
    isFallback: true
  },
  assam: {
    windSpeed: 34,
    windDirection: 215, // SSW riverine vector
    precipitation: 24.0,
    rainfallAccumulation24h: 185.0,
    temperature: 27.8,
    relativeHumidity: 92,
    weatherCondition: "Brahmaputra Basin Flood Wave",
    forecastTime: new Date().toISOString(),
    source: "ASDMA / Open-Meteo Synoptic Baseline",
    isFallback: true
  },
  nepal: {
    windSpeed: 42,
    windDirection: 195, // Gorge funneling vector
    precipitation: 14.0,
    rainfallAccumulation24h: 96.0,
    temperature: 13.5,
    relativeHumidity: 88,
    weatherCondition: "Glacial Detachment / Gorge Surge",
    forecastTime: new Date().toISOString(),
    source: "DHM Nepal / Open-Meteo Synoptic Baseline",
    isFallback: true
  }
};

/**
 * Fetches forecast weather variables from Open-Meteo API with fallback.
 */
export async function getWeatherForecast(
  lat: number,
  lon: number,
  region: RegionId = "wayanad",
  timeoutMs = 3500
): Promise<WeatherForecast> {
  const cacheKey = `${region}:${lat.toFixed(2)},${lon.toFixed(2)}`;
  const now = Date.now();

  const cached = weatherCache.get(cacheKey);
  if (cached && now - cached.timestamp < CACHE_TTL_MS) {
    return cached.data;
  }

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);

  const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,relative_humidity_2m,precipitation,wind_speed_10m,wind_direction_10m&hourly=precipitation&forecast_days=1`;

  try {
    const res = await fetch(url, {
      signal: controller.signal,
      headers: { Accept: "application/json" }
    });
    clearTimeout(timer);

    if (!res.ok) {
      throw new Error(`Open-Meteo HTTP ${res.status}`);
    }

    const data = await res.json();
    const current = data.current;

    // Estimate 24h accumulation from hourly or extrapolate
    let total24h = 0;
    if (data.hourly?.precipitation && Array.isArray(data.hourly.precipitation)) {
      total24h = data.hourly.precipitation.slice(0, 24).reduce((acc: number, val: number) => acc + (val || 0), 0);
    }
    if (total24h === 0 && current.precipitation > 0) {
      total24h = current.precipitation * 12;
    }
    if (total24h === 0) {
      total24h = SCENARIO_DEFAULTS[region].rainfallAccumulation24h;
    }

    const result: WeatherForecast = {
      windSpeed: Number(current.wind_speed_10m.toFixed(1)),
      windDirection: Math.round(current.wind_direction_10m),
      precipitation: Number(current.precipitation.toFixed(1)),
      rainfallAccumulation24h: Number(total24h.toFixed(1)),
      temperature: Number(current.temperature_2m.toFixed(1)),
      relativeHumidity: Math.round(current.relative_humidity_2m),
      weatherCondition:
        current.precipitation > 10
          ? "Heavy Precipitation"
          : current.precipitation > 2
          ? "Moderate Precipitation"
          : current.wind_speed_10m > 30
          ? "High Wind Vector"
          : "Synoptic Flow",
      forecastTime: current.time || new Date().toISOString(),
      source: "Open-Meteo ECMWF/GFS Forecast API",
      isFallback: false
    };

    weatherCache.set(cacheKey, { data: result, timestamp: now });
    return result;
  } catch (err) {
    clearTimeout(timer);
    console.warn(`Weather fetch failed for (${lat}, ${lon}), using scenario baseline:`, err);
    const fallback = SCENARIO_DEFAULTS[region] || SCENARIO_DEFAULTS.wayanad;
    weatherCache.set(cacheKey, { data: fallback, timestamp: now });
    return fallback;
  }
}
