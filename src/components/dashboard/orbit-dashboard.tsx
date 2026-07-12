"use client";

import Image from "next/image";
import { motion, useReducedMotion } from "framer-motion";
import {
  Activity,
  CloudFog,
  Heart,
  HeartOff,
  History,
  LoaderCircle,
  LocateFixed,
  MapPin,
  Menu,
  Radar,
  Search,
  Settings2,
  Sun,
  SunMoon,
  Sunrise,
  Sunset,
  Thermometer,
  Wind,
} from "lucide-react";
import { useMemo, useRef, useState } from "react";
import { Sidebar } from "@/components/layout/sidebar";
import { useForecast } from "@/hooks/useForecast";
import { useOrbitContext } from "@/context/orbit-context";
import { getWeatherIconUrl } from "@/services/weatherApi";
import {
  formatClock,
  formatDate,
  formatTemperature,
  formatTime,
  formatWindDirection,
  getAirQualityLabel,
  getGreeting,
} from "@/utils/formatters";

const navItems = [
  { key: "dashboard", label: "Dashboard" },
  { key: "saved", label: "Saved Cities" },
  { key: "recent", label: "Recent Searches" },
  { key: "current", label: "Current Location" },
  { key: "settings", label: "Settings" },
];

const bottomNav = [
  { key: "dashboard", label: "Today", icon: Sun },
  { key: "recent", label: "History", icon: History },
  { key: "current", label: "Explore", icon: Radar },
  { key: "settings", label: "Settings", icon: Settings2 },
];

const backgroundMap: Record<string, string> = {
  clear: "weather-clear",
  clouds: "weather-cloudy",
  rain: "weather-rain",
  thunderstorm: "weather-storm",
  snow: "weather-snow",
  mist: "weather-cloudy",
  drizzle: "weather-rain",
  default: "weather-default",
};

export function OrbitDashboard() {
  const reduceMotion = useReducedMotion();
  const dashboardSectionRef = useRef<HTMLElement | null>(null);
  const [query, setQuery] = useState("");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const {
    settings,
    setSettings,
    savedCities,
    recentSearches,
    currentWeather,
    forecast,
    airQuality,
    isLoading,
    error,
    clock,
    activeView,
    setActiveView,
    searchCity,
    toggleFavorite,
    loadFavoriteCity,
    removeFavorite,
    locationMessage,
    requestCurrentLocation,
  } = useOrbitContext();

  const forecastData = useForecast(forecast?.list ?? []);

  const weatherKey = currentWeather?.weather[0]?.main.toLowerCase() ?? "default";
  const backgroundClass = backgroundMap[weatherKey] ?? backgroundMap.default;

  const savedCityPayload = currentWeather
    ? {
        id: `${currentWeather.name}-${currentWeather.sys.country}`,
        name: currentWeather.name,
        country: currentWeather.sys.country,
        latitude: currentWeather.coord.lat,
        longitude: currentWeather.coord.lon,
      }
    : null;

  const isFavorite = Boolean(
    savedCityPayload && savedCities.some((city) => city.id === savedCityPayload.id),
  );

  const detailCards = useMemo(() => {
    if (!currentWeather) return [];

    return [
      {
        label: "Humidity",
        value: `${currentWeather.main.humidity}%`,
        icon: CloudFog,
      },
      {
        label: "Pressure",
        value: `${currentWeather.main.pressure} hPa`,
        icon: Activity,
      },
      {
        label: "Visibility",
        value: `${Math.round(currentWeather.visibility / 1000)} km`,
        icon: MapPin,
      },
      {
        label: "Wind Speed",
        value: `${currentWeather.wind.speed.toFixed(1)} m/s`,
        icon: Wind,
      },
      {
        label: "Wind Direction",
        value: formatWindDirection(currentWeather.wind.deg),
        icon: Wind,
      },
      {
        label: "Feels Like",
        value: formatTemperature(currentWeather.main.feels_like, settings.temperatureUnit),
        icon: Thermometer,
      },
      {
        label: "Sunrise",
        value: formatTime(currentWeather.sys.sunrise),
        icon: Sunrise,
      },
      {
        label: "Sunset",
        value: formatTime(currentWeather.sys.sunset),
        icon: Sunset,
      },
      {
        label: "UV Index",
        value: currentWeather.uvi ? `${currentWeather.uvi.toFixed(1)}` : "Unavailable",
        icon: SunMoon,
      },
      {
        label: "Air Quality",
        value: airQuality?.list[0] ? getAirQualityLabel(airQuality.list[0].main.aqi) : "Unavailable",
        icon: Activity,
      },
    ];
  }, [airQuality, currentWeather, settings.temperatureUnit]);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSubmitError(null);

    try {
      await searchCity(query);
      setQuery("");
    } catch (caughtError) {
      setSubmitError(caughtError instanceof Error ? caughtError.message : "Search failed.");
    }
  };

  const handleSearchByCoordinates = async () => {
    try {
      await requestCurrentLocation();
      setActiveView("dashboard");
    } catch (caughtError) {
      setSubmitError(caughtError instanceof Error ? caughtError.message : "Unable to find your location.");
    }
  };

  const handleLoadRecent = async (city: string) => {
    try {
      await searchCity(city);
      setActiveView("dashboard");
    } catch (caughtError) {
      setSubmitError(caughtError instanceof Error ? caughtError.message : "Unable to load that city.");
    }
  };

  const headerGreeting = clock ? getGreeting(clock.getHours()) : "Good Day";
  const dateLabel = clock ? formatDate(clock.getTime() / 1000) : "Loading date";
  const clockLabel = clock ? formatClock(clock.getTime()) : "--:--:--";
  const currentHour = clock ? clock.getHours() : 0;

  const airQualityIndex = airQuality?.list[0]?.main.aqi ?? null;
  const airQualityEmoji = airQualityIndex === null
    ? "—"
    : airQualityIndex <= 1
      ? "🙂"
      : airQualityIndex <= 2
        ? "😌"
        : airQualityIndex <= 3
          ? "😐"
          : "😷";

  const handleNavigation = async (view: string) => {
    setActiveView(view);

    if (view === "dashboard") {
      dashboardSectionRef.current?.scrollIntoView({
        behavior: reduceMotion ? "auto" : "smooth",
        block: "start",
      });
      return;
    }

    if (view === "current") {
      try {
        await requestCurrentLocation();
        setActiveView("dashboard");
        dashboardSectionRef.current?.scrollIntoView({
          behavior: reduceMotion ? "auto" : "smooth",
          block: "start",
        });
      } catch (caughtError) {
        setSubmitError(caughtError instanceof Error ? caughtError.message : "Unable to find your location.");
      }
    }
  };

  return (
    <div className={`weather-shell ${backgroundClass} min-h-screen text-slate-950 transition-all duration-700 dark:text-white`}>
      <div className="weather-cloud weather-cloudy left-[8%] top-[16%] h-20 w-40" />
      <div className="weather-cloud weather-cloudy right-[6%] top-[18%] h-16 w-32" />
      {weatherKey === "rain" ? <div className="weather-rain-layer" /> : null}
      {weatherKey === "snow" ? <div className="weather-snow-layer" /> : null}
      {weatherKey === "thunderstorm" ? <div className="weather-storm-flash" /> : null}

      <div className="relative mx-auto max-w-7xl px-4 py-4 md:px-6 lg:px-8">
        <div className="grid gap-4 lg:grid-cols-[240px_minmax(0,1fr)]">
          <aside className="hidden rounded-[24px] border border-white/10 bg-black/35 p-4 text-white shadow-[0_20px_70px_-30px_rgba(0,0,0,0.9)] backdrop-blur-xl lg:block">
            <div className="mb-7"> 
              <p className="text-xs uppercase tracking-[0.42em] text-cyan-300">Orbit</p>
              <h1 className="mt-2 text-2xl font-semibold">Weather Dashboard</h1>
            </div>
            <nav className="space-y-2">
              {navItems.map((item) => {
                const active = activeView === item.key;
                return (
                  <button
                    key={item.key}
                    type="button"
                    onClick={() => void handleNavigation(item.key)}
                    className={`flex w-full items-center justify-between rounded-2xl px-4 py-3 text-sm transition ${active ? "bg-white/15 text-white" : "text-slate-300 hover:bg-white/8"}`}
                  >
                    <span>{item.label}</span>
                    <span className="rounded-full bg-white/10 px-2 text-[10px] uppercase tracking-[0.24em]">{item.key === "dashboard" ? "Live" : "Open"}</span>
                  </button>
                );
              })}
            </nav>

            <div className="mt-8 rounded-3xl border border-white/10 bg-white/6 p-4">
              <p className="text-xs uppercase tracking-[0.28em] text-slate-300">Quick actions</p>
              <div className="mt-3 space-y-2">
                <button
                  type="button"
                  onClick={() => void handleNavigation("current")}
                  className="flex w-full items-center gap-2 rounded-2xl bg-cyan-400/20 px-3 py-2 text-sm text-cyan-100"
                >
                  <LocateFixed size={16} />
                  Use current location
                </button>
                <button
                  type="button"
                  onClick={() => setActiveView("settings")}
                  className="flex w-full items-center gap-2 rounded-2xl bg-white/8 px-3 py-2 text-sm text-slate-100"
                >
                  <Settings2 size={16} />
                  Preferences
                </button>
              </div>
            </div>
          </aside>

          <div className="space-y-4">
            <header className="flex items-center justify-between rounded-[24px] border border-white/10 bg-black/35 px-4 py-4 text-white shadow-[0_20px_60px_-30px_rgba(0,0,0,0.9)] backdrop-blur-xl">
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => setSidebarOpen(true)}
                  className="rounded-2xl border border-white/10 bg-white/10 p-2 lg:hidden"
                  aria-label="Open navigation"
                >
                  <Menu size={18} />
                </button>
                <div>
                  <p className="text-xs uppercase tracking-[0.34em] text-slate-400">Updating...</p>
                  <div className="mt-1 flex items-center gap-2">
                    <span className="text-sm text-slate-300">{headerGreeting}</span>
                    <span className="text-slate-500">•</span>
                    <span className="text-sm font-medium text-white">{dateLabel}</span>
                  </div>
                </div>
              </div>
              <div className="text-right">
                <p className="text-xs uppercase tracking-[0.4em] text-cyan-300">Live clock</p>
                <p className="text-sm font-medium">{clockLabel}</p>
              </div>
            </header>

            <motion.section
              ref={dashboardSectionRef}
              initial={reduceMotion ? false : { y: 8, opacity: 0 }}
              animate={reduceMotion ? undefined : { y: 0, opacity: 1 }}
              className="rounded-[24px] border border-white/10 bg-black/30 p-4 shadow-[0_20px_60px_-30px_rgba(0,0,0,0.9)] backdrop-blur-xl md:p-5"
            >
              <form onSubmit={handleSubmit} className="grid gap-3 md:grid-cols-[1fr_auto_auto]">
                <label className="flex items-center gap-3 rounded-2xl bg-slate-950/45 px-4 py-3 text-white shadow-lg">
                  <Search size={18} className="text-cyan-300" />
                  <input
                    aria-label="Search any city worldwide"
                    value={query}
                    onChange={(event) => setQuery(event.target.value)}
                    placeholder="Search city, country or region"
                    className="w-full bg-transparent text-sm outline-none placeholder:text-slate-300"
                  />
                </label>
                <button
                  type="submit"
                  disabled={isLoading}
                  className="flex items-center justify-center gap-2 rounded-2xl bg-cyan-400 px-4 py-3 font-medium text-slate-950 transition hover:bg-cyan-300 disabled:opacity-70"
                >
                  {isLoading ? <LoaderCircle className="animate-spin" size={18} /> : <Search size={18} />}
                  Search
                </button>
                <button
                  type="button"
                  onClick={handleSearchByCoordinates}
                  className="flex items-center justify-center gap-2 rounded-2xl border border-white/20 bg-white/10 px-4 py-3 text-sm font-medium text-white"
                >
                  <LocateFixed size={18} />
                  Current Location
                </button>
              </form>

              {(error || submitError || locationMessage) && (
                <div className="mt-4 rounded-2xl border border-rose-200/40 bg-rose-500/20 p-3 text-sm text-rose-50">
                  {error ?? submitError ?? locationMessage}
                </div>
              )}
            </motion.section>

            {isLoading ? (
              <section className="rounded-[32px] border border-white/20 bg-white/12 p-5 backdrop-blur-xl">
                <div className="grid gap-3 md:grid-cols-3">
                  <div className="h-28 animate-pulse rounded-3xl bg-white/10" />
                  <div className="h-28 animate-pulse rounded-3xl bg-white/10" />
                  <div className="h-28 animate-pulse rounded-3xl bg-white/10" />
                </div>
              </section>
            ) : currentWeather ? (
              <motion.section
                layout
                className="grid gap-4 rounded-[24px] border border-white/10 bg-black/35 p-4 text-white shadow-[0_20px_60px_-30px_rgba(0,0,0,0.9)] backdrop-blur-xl md:grid-cols-[1.35fr_0.65fr] md:p-5"
              >
                <div className="flex flex-col gap-4">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="text-sm text-slate-300">{currentWeather.name}, {currentWeather.sys.country}</p>
                      <div className="mt-2 flex items-center gap-3">
                        <div className="weather-icon-wrap rounded-[20px] bg-white/8 p-3 shadow-[0_16px_40px_-24px_rgba(0,0,0,0.95)]">
                          <Image
                            src={getWeatherIconUrl(currentWeather.weather[0]?.icon ?? "01d")}
                            alt={currentWeather.weather[0]?.description ?? "Weather icon"}
                            width={76}
                            height={76}
                            className="h-[76px] w-[76px]"
                          />
                        </div>
                        <div>
                          <p className="text-[72px] font-semibold leading-none md:text-[88px]">
                            {formatTemperature(currentWeather.main.temp, settings.temperatureUnit)}
                          </p>
                          <p className="mt-1 text-lg font-medium capitalize text-slate-200">{currentWeather.weather[0]?.description}</p>
                          <p className="text-sm text-slate-300">
                            High {formatTemperature(currentWeather.main.temp_max, settings.temperatureUnit)} · Low {formatTemperature(currentWeather.main.temp_min, settings.temperatureUnit)}
                          </p>
                        </div>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => savedCityPayload && toggleFavorite(savedCityPayload)}
                      className="rounded-2xl border border-white/10 bg-white/10 p-3 text-cyan-100"
                      aria-label={isFavorite ? "Remove city from saved list" : "Save city"}
                    >
                      {isFavorite ? <HeartOff size={18} /> : <Heart size={18} />}
                    </button>
                  </div>

                  <div className="grid gap-3 sm:grid-cols-2">
                    <div className="rounded-2xl bg-white/8 p-3">
                      <p className="text-xs uppercase tracking-[0.24em] text-slate-300">Last updated</p>
                      <p className="mt-1 text-sm font-medium">{formatTime(currentWeather.dt)}</p>
                    </div>
                    <div className="rounded-2xl bg-white/8 p-3">
                      <p className="text-xs uppercase tracking-[0.24em] text-slate-300">Date</p>
                      <p className="mt-1 text-sm font-medium">{dateLabel}</p>
                    </div>
                  </div>
                </div>

                <div className="grid gap-3 sm:grid-cols-2 md:grid-cols-1 xl:grid-cols-2">
                  <div className="rounded-2xl bg-white/8 p-3">
                    <p className="text-xs uppercase tracking-[0.24em] text-slate-300">Air Quality</p>
                    <p className="mt-2 text-lg font-semibold">{airQualityEmoji} {airQualityIndex === null ? "Unavailable" : getAirQualityLabel(airQualityIndex)}</p>
                  </div>
                  <div className="rounded-2xl bg-white/8 p-3">
                    <p className="text-xs uppercase tracking-[0.24em] text-slate-300">RealFeel</p>
                    <p className="mt-2 text-lg font-semibold">{formatTemperature(currentWeather.main.feels_like, settings.temperatureUnit)}</p>
                  </div>
                  <div className="rounded-2xl bg-white/8 p-3">
                    <p className="text-xs uppercase tracking-[0.24em] text-slate-300">Wind</p>
                    <p className="mt-2 text-lg font-semibold">{currentWeather.wind.speed.toFixed(1)} m/s</p>
                  </div>
                  <div className="rounded-2xl bg-white/8 p-3">
                    <p className="text-xs uppercase tracking-[0.24em] text-slate-300">Chance of Rain</p>
                    <p className="mt-2 text-lg font-semibold">{currentWeather.main.humidity}%</p>
                  </div>
                </div>
              </motion.section>
            ) : (
              <section className="rounded-[32px] border border-white/20 bg-white/10 p-6 text-slate-900 shadow-2xl backdrop-blur-xl">
                <p className="text-lg font-semibold">Orbit is ready for your first weather search.</p>
                <p className="mt-2 text-sm text-slate-700">Search any city worldwide or let the app use your current location.</p>
              </section>
            )}

            <section className="space-y-4">
              <div className="rounded-[24px] border border-white/10 bg-black/30 p-4 text-white shadow-[0_20px_60px_-30px_rgba(0,0,0,0.9)] backdrop-blur-xl">
                <div className="mb-3 flex items-center justify-between">
                  <div>
                    <p className="text-xs uppercase tracking-[0.24em] text-cyan-300">Hourly forecast</p>
                    <h4 className="text-lg font-semibold">Next 8 hours</h4>
                  </div>
                  <span className="rounded-full bg-cyan-400/15 px-3 py-1 text-[10px] uppercase tracking-[0.28em] text-cyan-100">Live</span>
                </div>
                <div className="flex gap-3 overflow-x-auto pb-1">
                  {forecastData.hourly.map((item) => {
                    const isCurrentHour = clock ? new Date(item.dt * 1000).getHours() === currentHour : false;
                    return (
                      <div
                        key={item.dt}
                        className={`min-w-[96px] rounded-[18px] border px-3 py-3 text-center transition ${isCurrentHour ? "border-cyan-300/40 bg-cyan-400/18" : "border-white/6 bg-slate-950/45"}`}
                      >
                        <p className="text-[11px] font-medium uppercase tracking-[0.24em] text-slate-300">
                          {isCurrentHour ? "Now" : formatTime(item.dt)}
                        </p>
                        <Image
                          src={getWeatherIconUrl(item.weather[0]?.icon ?? "01d")}
                          alt={item.weather[0]?.description ?? "Forecast icon"}
                          width={48}
                          height={48}
                          className="mx-auto my-1 h-12 w-12"
                        />
                        <p className="text-sm font-semibold">{formatTemperature(item.main.temp, settings.temperatureUnit)}</p>
                        <p className="mt-1 text-[11px] text-slate-300">{item.main.humidity}% rain</p>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="rounded-[24px] border border-white/10 bg-black/30 p-4 text-white shadow-[0_20px_60px_-30px_rgba(0,0,0,0.9)] backdrop-blur-xl">
                <div className="mb-3 flex items-center justify-between">
                  <div>
                    <p className="text-xs uppercase tracking-[0.24em] text-cyan-300">5-day outlook</p>
                    <h4 className="text-lg font-semibold">Weekly snapshot</h4>
                  </div>
                  <span className="rounded-full bg-white/8 px-3 py-1 text-[10px] uppercase tracking-[0.28em] text-slate-200">5 days</span>
                </div>
                <div className="grid gap-3 xl:grid-cols-5">
                  {forecastData.daily.map((day) => (
                    <div key={day.dateKey} className="min-h-[96px] rounded-[18px] border border-white/6 bg-slate-950/45 p-3">
                      <div className="flex items-center justify-between gap-2">
                        <div className="min-w-0">
                          <p className="text-[11px] uppercase tracking-[0.24em] text-slate-400">{day.day}</p>
                          <p className="mt-1 text-xs text-slate-300">{day.date}</p>
                        </div>
                        <Image src={getWeatherIconUrl(day.icon)} alt={day.description} width={40} height={40} className="h-10 w-10 flex-shrink-0" />
                        <div className="text-right">
                          <p className="text-sm font-semibold">{formatTemperature(day.high, settings.temperatureUnit)}</p>
                          <p className="text-xs text-slate-300">{formatTemperature(day.low, settings.temperatureUnit)}</p>
                        </div>
                      </div>
                      <p className="mt-3 max-w-full overflow-hidden text-[12px] font-medium capitalize text-slate-200 text-ellipsis whitespace-nowrap">
                        {day.description}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </section>

            <section className="grid gap-4 lg:grid-cols-2">
              <div className="rounded-[24px] border border-white/10 bg-black/35 p-4 text-white shadow-[0_20px_60px_-30px_rgba(0,0,0,0.9)] backdrop-blur-xl">
                <p className="text-xs uppercase tracking-[0.24em] text-cyan-300">Weather details</p>
                <div className="mt-3 grid grid-cols-2 gap-3">
                  {detailCards.map((card) => {
                    const Icon = card.icon;
                    return (
                      <div key={`${card.label}-detail`} className="rounded-2xl bg-white/10 p-3">
                        <div className="flex items-center gap-2 text-sm text-slate-300">
                          <Icon size={16} />
                          <span>{card.label}</span>
                        </div>
                        <p className="mt-2 text-base font-semibold">{card.value}</p>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="rounded-[24px] border border-white/10 bg-black/35 p-4 text-white shadow-[0_20px_60px_-30px_rgba(0,0,0,0.9)] backdrop-blur-xl">
                <p className="text-xs uppercase tracking-[0.24em] text-cyan-300">Saved & recent</p>
                {activeView === "saved" || activeView === "dashboard" ? (
                  <div className="mt-3 space-y-2">
                    {savedCities.length === 0 ? (
                      <p className="text-sm text-slate-300">No saved cities yet. Use the heart button on the current card.</p>
                    ) : (
                      savedCities.map((city) => (
                        <div key={city.id} className="flex items-center justify-between rounded-2xl bg-white/8 px-3 py-2">
                          <button type="button" onClick={() => void loadFavoriteCity(city)} className="text-left">
                            <p className="text-sm font-medium">{city.name}</p>
                            <p className="text-xs text-slate-300">{city.country}</p>
                          </button>
                          <button type="button" onClick={() => removeFavorite(city.id)} className="rounded-full bg-white/10 p-2 text-sm">Remove</button>
                        </div>
                      ))
                    )}
                  </div>
                ) : null}

                {activeView === "recent" || activeView === "dashboard" ? (
                  <div className="mt-3 space-y-2">
                    {recentSearches.length === 0 ? (
                      <p className="text-sm text-slate-300">Recent searches will show up after your first successful lookup.</p>
                    ) : (
                      recentSearches.map((search) => (
                        <button
                          key={search.id}
                          type="button"
                          onClick={() => void handleLoadRecent(search.city)}
                          className="flex w-full items-center justify-between rounded-2xl bg-white/8 px-3 py-2 text-left"
                        >
                          <span>
                            <span className="block text-sm font-medium">{search.city}</span>
                            <span className="block text-xs text-slate-300">{search.country}</span>
                          </span>
                          <span className="text-xs text-slate-400">{new Date(search.timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</span>
                        </button>
                      ))
                    )}
                  </div>
                ) : null}

                {activeView === "settings" ? (
                  <div className="mt-3 space-y-3">
                    <label className="block rounded-2xl bg-white/8 p-3">
                      <span className="mb-2 block text-sm text-slate-300">Temperature unit</span>
                      <select
                        aria-label="Temperature unit preference"
                        value={settings.temperatureUnit}
                        onChange={(event) => setSettings((previous) => ({ ...previous, temperatureUnit: event.target.value as "celsius" | "fahrenheit" }))}
                        className="w-full rounded-xl bg-slate-900 px-3 py-2 text-sm"
                      >
                        <option value="celsius">Celsius</option>
                        <option value="fahrenheit">Fahrenheit</option>
                      </select>
                    </label>

                    <label className="block rounded-2xl bg-white/8 p-3">
                      <span className="mb-2 block text-sm text-slate-300">Theme mode</span>
                      <select
                        aria-label="Theme mode preference"
                        value={settings.theme}
                        onChange={(event) => setSettings((previous) => ({ ...previous, theme: event.target.value as "light" | "dark" }))}
                        className="w-full rounded-xl bg-slate-900 px-3 py-2 text-sm"
                      >
                        <option value="dark">Dark</option>
                        <option value="light">Light</option>
                      </select>
                    </label>
                  </div>
                ) : null}
              </div>
            </section>
          </div>
        </div>
      </div>

      <nav className="fixed inset-x-0 bottom-0 z-40 mx-auto flex w-[min(92vw,480px)] items-center justify-between rounded-[22px] border border-white/10 bg-black/40 px-3 py-2 text-white shadow-[0_20px_70px_-40px_rgba(0,0,0,0.95)] backdrop-blur-xl lg:hidden">
        {bottomNav.map((item) => {
          const Icon = item.icon;
          const active = activeView === item.key;
          return (
            <button
              key={item.key}
              type="button"
              onClick={() => void handleNavigation(item.key)}
              className={`flex flex-1 flex-col items-center gap-1 rounded-2xl px-2 py-2 text-[11px] ${active ? "bg-white/12 text-white" : "text-slate-300"}`}
            >
              <Icon size={16} />
              <span>{item.label}</span>
            </button>
          );
        })}
      </nav>

      <Sidebar
        open={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        activeView={activeView}
        onSelectView={(view) => {
          void handleNavigation(view);
          setSidebarOpen(false);
        }}
        savedCities={savedCities}
        recentSearches={recentSearches}
        onSelectCity={(city) => {
          void loadFavoriteCity(city);
          setSidebarOpen(false);
        }}
        onSelectRecent={(city) => {
          void handleLoadRecent(city);
          setSidebarOpen(false);
        }}
      />
    </div>
  );
}
