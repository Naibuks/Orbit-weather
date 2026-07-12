"use client";

import { useState } from "react";

export function useGeolocation() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const getLocation = () =>
    new Promise<{ latitude: number; longitude: number }>((resolve, reject) => {
      if (typeof window === "undefined" || !navigator.geolocation) {
        reject(new Error("Geolocation is not supported on this device."));
        return;
      }

      setLoading(true);
      setError(null);

      navigator.geolocation.getCurrentPosition(
        (position) => {
          setLoading(false);
          resolve({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
          });
        },
        (geoError) => {
          setLoading(false);
          const message = geoError.code === 1
            ? "Location access was denied. You can still search for any city manually."
            : geoError.code === 2
              ? "Location is unavailable right now. Try searching a city instead."
              : "Unable to determine your location at the moment.";
          setError(message);
          reject(new Error(message));
        },
        { enableHighAccuracy: true, timeout: 10000 }
      );
    });

  return { getLocation, loading, error };
}
