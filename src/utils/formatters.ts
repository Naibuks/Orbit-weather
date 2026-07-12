import type { TemperatureUnit } from "@/types/weather";

export const toCelsius = (value: number) => Math.round(value - 273.15);
export const toFahrenheit = (value: number) => Math.round((value - 273.15) * 9 / 5 + 32);

export const formatTemperature = (value: number, unit: TemperatureUnit) => {
  const converted = unit === "fahrenheit" ? toFahrenheit(value) : toCelsius(value);
  return `${converted}°${unit === "fahrenheit" ? "F" : "C"}`;
};

export const formatWindDirection = (degrees: number) => {
  const directions = ["N", "NE", "E", "SE", "S", "SW", "W", "NW"];
  const normalized = ((degrees % 360) + 360) % 360;
  const index = Math.round(normalized / 45) % 8;
  return directions[index];
};

export const formatDate = (timestamp: number) =>
  new Intl.DateTimeFormat("en", {
    weekday: "short",
    month: "short",
    day: "numeric",
  }).format(new Date(timestamp * 1000));

export const formatTime = (timestamp: number) =>
  new Intl.DateTimeFormat("en", {
    hour: "numeric",
    minute: "2-digit",
  }).format(new Date(timestamp * 1000));

export const formatClock = (timestamp: number) =>
  new Intl.DateTimeFormat("en", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  }).format(new Date(timestamp));

export const getGreeting = (hour: number) => {
  if (hour < 12) return "Good Morning";
  if (hour < 18) return "Good Afternoon";
  return "Good Evening";
};

export const getAirQualityLabel = (aqi: number) => {
  if (aqi <= 1) return "Good";
  if (aqi === 2) return "Fair";
  if (aqi === 3) return "Moderate";
  if (aqi === 4) return "Poor";
  return "Very Poor";
};
