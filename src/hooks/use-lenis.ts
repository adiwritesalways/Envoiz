import { useEffect } from "react";

/**
 * Initialises Lenis smooth scroll only on explicitly whitelisted routes.
 *
 * Lenis targets window scroll. The dashboard uses a fixed-position layout
 * with an internal scroll container (#dashboard-scroll) — running Lenis
 * there intercepts wheel events and breaks scrolling entirely. Auth pages
 * are short single-screen forms that don't need smooth scroll either.
 *
 * Whitelisted: / (landing), /about, /security, /privacy-policy, /terms,
 *              /resources and all /resources/* sub-pages.
 *
 * All other routes (dashboard, auth, 404, etc.) use native browser scroll.
 *
 * SSR-safe: all DOM access is guarded by typeof window checks.
 */

const LENIS_ROUTES = [
  "/",
  "/about",
  "/security",
  "/privacy-policy",
  "/terms",
  "/resources",
];

function shouldUseLenis(pathname: string): boolean {
  if (LENIS_ROUTES.includes(pathname)) return true;
  if (pathname.startsWith("/resources/")) return true;
  return false;
}

export function useLenis(pathname: string) {
  useEffect(() => {
    if (typeof window === "undefined") return;
    if (!shouldUseLenis(pathname)) return;

    let lenis: InstanceType<typeof import("lenis").default> | null = null;
    let rafId: number;
    let destroyed = false;

    async function init() {
      const { default: Lenis } = await import("lenis");

      // Guard against the route changing while the async import was in-flight
      if (destroyed) return;

      lenis = new Lenis({
        duration: 1.2,
        easing: (t: number) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
        orientation: "vertical",
        gestureOrientation: "vertical",
        smoothWheel: true,
        wheelMultiplier: 1,
        touchMultiplier: 2,
        infinite: false,
      });

      function raf(time: number) {
        lenis!.raf(time);
        rafId = requestAnimationFrame(raf);
      }

      rafId = requestAnimationFrame(raf);
    }

    init();

    return () => {
      destroyed = true;
      cancelAnimationFrame(rafId);
      lenis?.destroy();
    };
  }, [pathname]);
}
