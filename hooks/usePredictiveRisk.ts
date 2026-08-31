"use client";

import { useEffect, useState, useCallback } from "react";
import type { RegionId, VillageFeature } from "@/lib/types";
import { getWeatherForecast, type WeatherForecast } from "@/lib/weather";
import { assessPredictiveRisk, type PredictiveRiskResult } from "@/lib/predictiveRisk";

interface UsePredictiveRiskProps {
  features: VillageFeature[];
  region: RegionId;
}

export function usePredictiveRisk({ features, region }: UsePredictiveRiskProps) {
  const [isEnabled, setIsEnabled] = useState<boolean>(true);
  const [weather, setWeather] = useState<WeatherForecast | null>(null);
  const [result, setResult] = useState<PredictiveRiskResult | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const loadRiskModel = useCallback(async () => {
    setIsLoading(true);
    try {
      const defaultCoordinates: Record<RegionId, [number, number]> = {
        wayanad: [11.53, 76.12],
        assam: [26.55, 93.30],
        nepal: [28.18, 85.30]
      };

      const [lat, lon] = defaultCoordinates[region] || defaultCoordinates.wayanad;
      const forecast = await getWeatherForecast(lat, lon, region);
      setWeather(forecast);

      const computed = assessPredictiveRisk(features, forecast, region);
      setResult(computed);
    } catch (err) {
      console.warn("Failed to load predictive risk model:", err);
    } finally {
      setIsLoading(false);
    }
  }, [features, region]);

  useEffect(() => {
    loadRiskModel();
  }, [loadRiskModel]);

  return {
    isEnabled,
    setIsEnabled,
    weather,
    result,
    isLoading,
    refetch: loadRiskModel
  };
}
