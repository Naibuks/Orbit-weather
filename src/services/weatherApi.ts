import axios from "axios";
import type {
  AirQualityResponse,
  ForecastResponse,
  WeatherResponse,
} from "@/types/weather";

const apiClient = axios.create({
  baseURL: "https://api.openweathermap.org/data/2.5",
  timeout: 10000,
});

const apiKey = process.env.NEXT_PUBLIC_OPENWEATHER_API_KEY ?? process.env.OPENWEATHER_API_KEY;

const buildQuery = (params: Record<string, string | number>) => ({
  ...params,
  appid: apiKey,
});

const handleApiError = (error: unknown, fallbackMessage: string) => {
  if (axios.isAxiosError(error)) {
    const status = error.response?.status;
    if (!navigator.onLine) {
      return new Error("You appear to be offline. Please reconnect and try again.");
    }

    if (status === 401) {
      return new Error("OpenWeather API key is missing or invalid.");
    }

    if (status === 404) {
      return new Error("The requested city could not be found.");
    }

    if (status === 429) {
      return new Error("OpenWeather rate limit reached. Please try again shortly.");
    }
  }

  return new Error(fallbackMessage);
};

export const getWeatherIconUrl = (icon: string) =>
  `https://openweathermap.org/img/wn/${icon}@2x.png`;

export async function fetchWeatherByCity(city: string): Promise<WeatherResponse> {
  if (!apiKey) {
    throw new Error("OpenWeather API key is not configured.");
  }

  try {
    const { data } = await apiClient.get<WeatherResponse>("/weather", {
      params: buildQuery({ q: city }),
    });
    return data;
  } catch (error) {
    throw handleApiError(error, `Unable to load weather for ${city}.`);
  }
}

export async function fetchWeatherByCoordinates(
  latitude: number,
  longitude: number,
): Promise<WeatherResponse> {
  if (!apiKey) {
    throw new Error("OpenWeather API key is not configured.");
  }

  try {
    const { data } = await apiClient.get<WeatherResponse>("/weather", {
      params: buildQuery({ lat: latitude, lon: longitude }),
    });
    return data;
  } catch (error) {
    throw handleApiError(error, "Unable to load your current location weather.");
  }
}

export async function fetchForecastByCity(city: string): Promise<ForecastResponse> {
  if (!apiKey) {
    throw new Error("OpenWeather API key is not configured.");
  }

  try {
    const { data } = await apiClient.get<ForecastResponse>("/forecast", {
      params: buildQuery({ q: city, cnt: 40 }),
    });
    return data;
  } catch (error) {
    throw handleApiError(error, `Unable to load forecast for ${city}.`);
  }
}

export async function fetchForecastByCoordinates(
  latitude: number,
  longitude: number,
): Promise<ForecastResponse> {
  if (!apiKey) {
    throw new Error("OpenWeather API key is not configured.");
  }

  try {
    const { data } = await apiClient.get<ForecastResponse>("/forecast", {
      params: buildQuery({ lat: latitude, lon: longitude, cnt: 40 }),
    });
    return data;
  } catch (error) {
    throw handleApiError(error, "Unable to load the forecast for your current location.");
  }
}

export async function fetchAirQuality(
  latitude: number,
  longitude: number,
): Promise<AirQualityResponse> {
  if (!apiKey) {
    throw new Error("OpenWeather API key is not configured.");
  }

  try {
    const { data } = await apiClient.get<AirQualityResponse>("/air_pollution", {
      params: buildQuery({ lat: latitude, lon: longitude }),
    });
    return data;
  } catch (error) {
    throw handleApiError(error, "Unable to load air quality data.");
  }
}
