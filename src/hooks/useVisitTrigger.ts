/**
 * useVisitTrigger.ts
 *
 * Tracks qualifying page visits in localStorage.
 * Fires onTrigger() once the visitor has hit enough qualifying pages
 * and has not already been shown the lightbox.
 *
 * Waits for the HubSpot contact check to complete (isLoading) before
 * evaluating so we never show the lightbox to a known contact.
 */

import { useEffect } from "react";

interface UseVisitTriggerOptions {
  triggerPages: string;
  triggerAfter: number;
  triggerDelay: number;
  singleVisitDelay?: number; // 👈 delay in ms to show on first visit alone
  isKnown: boolean;
  isLoading: boolean;
  onTrigger: () => void;
}

export function useVisitTrigger({
  triggerPages,
  triggerAfter,
  triggerDelay,
  singleVisitDelay = 20000,
  isKnown,
  isLoading,
  onTrigger,
}: UseVisitTriggerOptions): void {
  useEffect(() => {
    if (isLoading) return;
    if (isKnown) return;
    if (localStorage.getItem("lb_shown")) return;
    if (!triggerPages) return;

    // 👇 add these logs here
    console.log("[useVisitTrigger] currentPath:", window.location.pathname);
    console.log("[useVisitTrigger] triggerPages:", triggerPages);
    console.log("[useVisitTrigger] isLoading:", isLoading);
    console.log("[useVisitTrigger] isKnown:", isKnown);

    const pages = triggerPages
      .split(",")
      .map((p) => p.trim())
      .filter(Boolean);
    const currentPath = window.location.pathname;

    const visited: string[] = JSON.parse(
      localStorage.getItem("lb_visited") ?? "[]",
    );
    if (!visited.includes(currentPath)) {
      visited.push(currentPath);
      localStorage.setItem("lb_visited", JSON.stringify(visited));
    }

    const matchCount = pages.filter((p) => visited.includes(p)).length;

    // Met the multi-visit threshold — fire after triggerDelay
    if (matchCount >= triggerAfter) {
      const timer = setTimeout(() => {
        onTrigger();
        localStorage.setItem("lb_shown", "true");
      }, triggerDelay);
      return () => clearTimeout(timer);
    }

    // Single qualifying page visit — fire after singleVisitDelay
    if (matchCount === 1) {
      const timer = setTimeout(() => {
        onTrigger();
        localStorage.setItem("lb_shown", "true");
      }, singleVisitDelay);
      return () => clearTimeout(timer);
    }
  }, [
    isLoading,
    isKnown,
    triggerPages,
    triggerAfter,
    triggerDelay,
    singleVisitDelay,
    onTrigger,
  ]);
}
