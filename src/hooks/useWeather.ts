"use client";

import { useCallback, useState } from "react";
import {
  fetchAirQuality,
  fetchForecastByCity,
  fetchForecastByCoordinates,
  fetchWeatherByCity,
  fetchWeatherByCoordinates,
} from "@/services/weatherApi";
import type { AirQualityResponse, ForecastResponse, WeatherResponse } from "@/types/weather";

export function useWeather() {
  const [weather, setWeather] = useState<WeatherResponse | null>(null);
  const [forecast, setForecast] = useState<ForecastResponse | null>(null);
  const [airQuality, setAirQuality] = useState<AirQualityResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadWeatherByCity = useCallback(async (city: string) => {
    setLoading(true);
    setError(null);

    try {
      const current = await fetchWeatherByCity(city);
      const nextForecast = await fetchForecastByCity(city);
      const quality = await fetchAirQuality(current.coord.lat, current.coord.lon);

      setWeather(current);
      setForecast(nextForecast);
      setAirQuality(quality);

      return { current, forecast: nextForecast, airQuality: quality };
    } catch (caughtError) {
      const message = caughtError instanceof Error ? caughtError.message : "Unable to load weather.";
      setWeather(null);
      setForecast(null);
      setAirQuality(null);
      setError(message);
      throw new Error(message);
    } finally {
      setLoading(false);
    }
  }, []);

  const loadWeatherByCoordinates = useCallback(async (latitude: number, longitude: number) => {
    setLoading(true);
    setError(null);

    try {
      const current = await fetchWeatherByCoordinates(latitude, longitude);
      const nextForecast = await fetchForecastByCoordinates(latitude, longitude);
      const quality = await fetchAirQuality(current.coord.lat, current.coord.lon);

      setWeather(current);
      setForecast(nextForecast);
      setAirQuality(quality);

      return { current, forecast: nextForecast, airQuality: quality };
    } catch (caughtError) {
      const message = caughtError instanceof Error ? caughtError.message : "Unable to load weather.";
      setWeather(null);
      setForecast(null);
      setAirQuality(null);
      setError(message);
      throw new Error(message);
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    weather,
    forecast,
    airQuality,
    loading,
    error,
    loadWeatherByCity,
    loadWeatherByCoordinates,
  };
}
