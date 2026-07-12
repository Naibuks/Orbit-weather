"use client";

import { useEffect, useState } from "react";

export function useClock() {
  const [now, setNow] = useState<number | null>(null);

  useEffect(() => {
    let intervalId: number | undefined;
    const timeoutId = window.setTimeout(() => {
      setNow(Date.now());
      intervalId = window.setInterval(() => setNow(Date.now()), 1000);
    }, 0);

    return () => {
      window.clearTimeout(timeoutId);
      if (intervalId) {
        window.clearInterval(intervalId);
      }
    };
  }, []);

  return now ? new Date(now) : null;
}
