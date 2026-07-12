export type TemperatureUnit = "celsius" | "fahrenheit";
export type ThemeMode = "light" | "dark";

export interface Settings {
  temperatureUnit: TemperatureUnit;
  theme: ThemeMode;
}

export interface SavedCity {
  id: string;
  name: string;
  country: string;
  latitude: number;
  longitude: number;
}

export interface RecentSearch {
  id: string;
  city: string;
  country: string;
  timestamp: number;
}

export interface WeatherCondition {
  id: number;
  main: string;
  description: string;
  icon: string;
}

export interface WeatherDetails {
  current: number;
  feelsLike: number;
  humidity: number;
  pressure: number;
  visibility: number;
  windSpeed: number;
  windDirection: number;
  tempMin: number;
  tempMax: number;
  sunrise: number;
  sunset: number;
  dt: number;
  uvi?: number;
}

export interface WeatherResponse {
  coord: {
    lat: number;
    lon: number;
  };
  weather: WeatherCondition[];
  main: {
    temp: number;
    feels_like: number;
    temp_min: number;
    temp_max: number;
    pressure: number;
    humidity: number;
  };
  wind: {
    speed: number;
    deg: number;
  };
  sys: {
    country: string;
    sunrise: number;
    sunset: number;
  };
  visibility: number;
  name: string;
  dt: number;
  uvi?: number;
}

export interface ForecastItem {
  dt: number;
  main: {
    temp: number;
    feels_like: number;
    temp_min: number;
    temp_max: number;
    pressure: number;
    humidity: number;
  };
  weather: WeatherCondition[];
  wind: {
    speed: number;
    deg: number;
  };
}

export interface ForecastResponse {
  list: ForecastItem[];
  city: {
    name: string;
    country: string;
    coord: {
      lat: number;
      lon: number;
    };
  };
}

export interface AirQualityResponse {
  list: Array<{
    main: {
      aqi: number;
    };
    components: {
      pm2_5: number;
      pm10: number;
      o3: number;
      no2: number;
      so2: number;
    };
  }>;
}

export interface LocationState {
  latitude: number;
  longitude: number;
  message?: string;
}
