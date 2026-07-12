"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { useClock } from "@/hooks/useClock";
import { useGeolocation } from "@/hooks/useGeolocation";
import { useLocalStorage } from "@/hooks/useLocalStorage";
import { useWeather } from "@/hooks/useWeather";
import type { AirQualityResponse, ForecastResponse, RecentSearch, SavedCity, Settings, WeatherResponse } from "@/types/weather";

interface OrbitContextValue {
  settings: Settings;
  setSettings: (value: Settings | ((previous: Settings) => Settings)) => void;
  savedCities: SavedCity[];
  recentSearches: RecentSearch[];
  currentWeather: WeatherResponse | null;
  forecast: ForecastResponse | null;
  airQuality: AirQualityResponse | null;
  isLoading: boolean;
  error: string | null;
  clock: Date | null;
  activeView: string;
  setActiveView: (view: string) => void;
  searchCity: (city: string) => Promise<void>;
  searchByCoordinates: (latitude: number, longitude: number) => Promise<void>;
  requestCurrentLocation: () => Promise<void>;
  toggleFavorite: (city: SavedCity) => void;
  loadFavoriteCity: (city: SavedCity) => Promise<void>;
  removeFavorite: (cityId: string) => void;
  locationMessage: string | null;
}

const OrbitContext = createContext<OrbitContextValue | undefined>(undefined);

const defaultSettings: Settings = {
  temperatureUnit: "celsius",
  theme: "dark",
};

export function OrbitProvider({ children }: { children: React.ReactNode }) {
  const [settings, setSettings] = useLocalStorage<Settings>("orbit-settings", defaultSettings);
  const [savedCities, setSavedCities] = useLocalStorage<SavedCity[]>("orbit-saved-cities", []);
  const [recentSearches, setRecentSearches] = useLocalStorage<RecentSearch[]>("orbit-recent-searches", []);
  const [activeView, setActiveView] = useState("dashboard");
  const [locationMessage, setLocationMessage] = useState<string | null>(null);
  const [booted, setBooted] = useState(false);

  const clock = useClock();
  const { getLocation, error: geolocationError } = useGeolocation();
  const { weather, forecast, airQuality, loading, error, loadWeatherByCity, loadWeatherByCoordinates } = useWeather();

  useEffect(() => {
    document.documentElement.classList.toggle("dark", settings.theme === "dark");
    document.documentElement.style.colorScheme = settings.theme;
  }, [settings.theme]);

  useEffect(() => {
    if (booted) return;

    const initializeLocation = async () => {
      try {
        const location = await getLocation();
        await loadWeatherByCoordinates(location.latitude, location.longitude);
        setLocationMessage(null);
      } catch (caughtError) {
        if (caughtError instanceof Error) {
          setLocationMessage(caughtError.message);
        }
      } finally {
        setBooted(true);
      }
    };

    void initializeLocation();
  }, [booted, getLocation, loadWeatherByCoordinates]);

  const searchCity = useCallback(async (cityName: string) => {
    const trimmed = cityName.trim();

    if (!trimmed) {
      throw new Error("Please enter a city name.");
    }

    const result = await loadWeatherByCity(trimmed);
    const nextSearch = {
      id: `${Date.now()}-${trimmed}`,
      city: result.current.name,
      country: result.current.sys.country,
      timestamp: Date.now(),
    };

    setRecentSearches((previous) => [nextSearch, ...previous.filter((item) => item.city !== nextSearch.city)].slice(0, 5));
  }, [loadWeatherByCity, setRecentSearches]);

  const searchByCoordinates = useCallback(async (latitude: number, longitude: number) => {
    const result = await loadWeatherByCoordinates(latitude, longitude);
    const nextSearch = {
      id: `${Date.now()}-${latitude}-${longitude}`,
      city: result.current.name,
      country: result.current.sys.country,
      timestamp: Date.now(),
    };

    setRecentSearches((previous) => [nextSearch, ...previous.filter((item) => item.city !== nextSearch.city)].slice(0, 5));
  }, [loadWeatherByCoordinates, setRecentSearches]);

  const requestCurrentLocation = useCallback(async () => {
    const location = await getLocation();
    await searchByCoordinates(location.latitude, location.longitude);
    setLocationMessage(null);
  }, [getLocation, searchByCoordinates]);

  const toggleFavorite = useCallback((city: SavedCity) => {
    setSavedCities((previous) => {
      const exists = previous.some((item) => item.id === city.id);
      if (exists) {
        return previous.filter((item) => item.id !== city.id);
      }
      return [city, ...previous].slice(0, 8);
    });
  }, [setSavedCities]);

  const removeFavorite = useCallback((cityId: string) => {
    setSavedCities((previous) => previous.filter((item) => item.id !== cityId));
  }, [setSavedCities]);

  const loadFavoriteCity = useCallback(async (city: SavedCity) => {
    await loadWeatherByCoordinates(city.latitude, city.longitude);
    setLocationMessage(null);
  }, [loadWeatherByCoordinates]);

  const value = useMemo<OrbitContextValue>(() => ({
    settings,
    setSettings,
    savedCities,
    recentSearches,
    currentWeather: weather,
    forecast,
    airQuality,
    isLoading: loading,
    error,
    clock,
    activeView,
    setActiveView,
    searchCity,
    searchByCoordinates,
    requestCurrentLocation,
    toggleFavorite,
    loadFavoriteCity,
    removeFavorite,
    locationMessage: geolocationError ?? locationMessage,
  }), [settings, setSettings, savedCities, recentSearches, weather, forecast, airQuality, loading, error, clock, activeView, searchCity, searchByCoordinates, requestCurrentLocation, toggleFavorite, loadFavoriteCity, removeFavorite, geolocationError, locationMessage]);

  return <OrbitContext.Provider value={value}>{children}</OrbitContext.Provider>;
}

export function useOrbitContext() {
  const context = useContext(OrbitContext);

  if (!context) {
    throw new Error("useOrbitContext must be used within OrbitProvider.");
  }

  return context;
}
