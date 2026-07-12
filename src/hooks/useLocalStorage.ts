"use client";

import { useEffect, useState } from "react";

export function useLocalStorage<T>(key: string, initialValue: T) {
  const [storedValue, setStoredValue] = useState<T>(initialValue);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const timeoutId = window.setTimeout(() => {
      try {
        const item = window.localStorage.getItem(key);
        setStoredValue(item ? (JSON.parse(item) as T) : initialValue);
      } catch {
        setStoredValue(initialValue);
      }
    }, 0);

    return () => window.clearTimeout(timeoutId);
  }, [initialValue, key]);

  const updateValue = (value: T | ((prev: T) => T)) => {
    setStoredValue((previousValue) => {
      const nextValue = typeof value === "function" ? (value as (prev: T) => T)(previousValue) : value;

      if (typeof window !== "undefined") {
        window.localStorage.setItem(key, JSON.stringify(nextValue));
      }

      return nextValue;
    });
  };

  return [storedValue, updateValue] as const;
}
