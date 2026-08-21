"use client";

import type { ReactNode } from "react";
import { useEffect } from "react";

/**
 * Client-side providers: keeps the pre-paint theme in sync with the OS when the
 * learner has never made an explicit choice.
 */
export function Providers({ children }: { children: ReactNode }) {
  useEffect(() => {
    const media = window.matchMedia("(prefers-color-scheme: dark)");
    const onChange = (e: MediaQueryListEvent) => {
      let stored: string | null = null;
      try {
        stored = window.localStorage.getItem("mcc-theme");
      } catch {
        /* ignore */
      }
      if (!stored) document.documentElement.classList.toggle("dark", e.matches);
    };
    media.addEventListener("change", onChange);
    return () => media.removeEventListener("change", onChange);
  }, []);

  return <>{children}</>;
}
