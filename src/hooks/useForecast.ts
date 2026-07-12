"use client";

import { useMemo } from "react";
import type { ForecastItem } from "@/types/weather";

export function useForecast(items: ForecastItem[] = []) {
  return useMemo(() => {
    const hourly = items.slice(0, 8);

    const groupedByDay = items.reduce<Record<string, ForecastItem[]>>((accumulator, item) => {
      const date = new Date(item.dt * 1000).toDateString();
      accumulator[date] = accumulator[date] ? [...accumulator[date], item] : [item];
      return accumulator;
    }, {});

    const daily = Object.entries(groupedByDay)
      .map(([dateKey, entries]) => {
        const midday = entries[Math.floor(entries.length / 2)] ?? entries[0];
        const lows = entries.map((entry) => entry.main.temp_min);
        const highs = entries.map((entry) => entry.main.temp_max);
        const dayLabel = new Intl.DateTimeFormat("en", { weekday: "short" }).format(new Date(dateKey));
        const dateLabel = new Intl.DateTimeFormat("en", { month: "short", day: "numeric" }).format(new Date(dateKey));

        return {
          dateKey,
          day: dayLabel,
          date: dateLabel,
          temperature: midday.main.temp,
          icon: midday.weather[0]?.icon ?? "01d",
          description: midday.weather[0]?.description ?? "Clear skies",
          low: Math.min(...lows),
          high: Math.max(...highs),
        };
      })
      .slice(0, 5);

    return { hourly, daily };
  }, [items]);
}
