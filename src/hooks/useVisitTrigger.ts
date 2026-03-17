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
  triggerPages: string; // comma-separated list of qualifying paths
  triggerAfter: number; // number of qualifying pages needed
  triggerDelay: number; // ms delay before firing onTrigger
  isKnown: boolean; // from useHubSpotContactCheck
  isLoading: boolean; // from useHubSpotContactCheck
  onTrigger: () => void; // called when all conditions are met
}

export function useVisitTrigger({
  triggerPages,
  triggerAfter,
  triggerDelay,
  isKnown,
  isLoading,
  onTrigger,
}: UseVisitTriggerOptions): void {
  useEffect(() => {
    // Wait for HubSpot check to finish
    if (isLoading) return;

    // Known contact — don't show
    if (isKnown) return;

    // Already shown
    if (localStorage.getItem("lb_shown")) return;

    // No pages configured
    if (!triggerPages) return;

    const pages = triggerPages
      .split(",")
      .map((p) => p.trim())
      .filter(Boolean);
    const currentPath = window.location.pathname;

    // Record current page visit
    const visited: string[] = JSON.parse(
      localStorage.getItem("lb_visited") ?? "[]",
    );
    if (!visited.includes(currentPath)) {
      visited.push(currentPath);
      localStorage.setItem("lb_visited", JSON.stringify(visited));
    }

    // Check qualifying page count
    const matchCount = pages.filter((p) => visited.includes(p)).length;
    if (matchCount < triggerAfter) return;

    // All conditions met — fire after delay
    const timer = setTimeout(() => {
      onTrigger();
      localStorage.setItem("lb_shown", "true");
    }, triggerDelay);
    console.log("[useVisitTrigger] isLoading:", isLoading);
    console.log("[useVisitTrigger] isKnown:", isKnown);
    console.log(
      "[useVisitTrigger] lb_shown:",
      localStorage.getItem("lb_shown"),
    );
    console.log(
      "[useVisitTrigger] visited:",
      JSON.parse(localStorage.getItem("lb_visited") ?? "[]"),
    );
    console.log(
      "[useVisitTrigger] matchCount:",
      pages.filter((p) => visited.includes(p)).length,
    );

    return () => clearTimeout(timer);
  }, [isLoading, isKnown, triggerPages, triggerAfter, triggerDelay, onTrigger]);
}
