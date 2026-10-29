import { useEffect } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

/**
 * Initialises Lenis smooth scroll only on explicitly whitelisted routes.
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
    let tickerHandler: ((time: number) => void) | null = null;
    let destroyed = false;

    async function init() {
      const { default: Lenis } = await import("lenis");

      // Guard against the route changing while the async import was in-flight
      if (destroyed) return;

      lenis = new Lenis({
        duration: 1.0,
        easing: (t: number) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
        orientation: "vertical",
        gestureOrientation: "vertical",
        smoothWheel: true,
        wheelMultiplier: 1.0,
        touchMultiplier: 1.5,
        infinite: false,
      });

      // Synchronize Lenis scroll updates with GSAP ScrollTrigger
      lenis.on("scroll", ScrollTrigger.update);

      // Bind Lenis RAF to GSAP ticker for frame-perfect lockstep animation
      tickerHandler = (time: number) => {
        lenis?.raf(time * 1000);
      };
      gsap.ticker.add(tickerHandler);
      gsap.ticker.lagSmoothing(0);

      // Refresh ScrollTrigger so all pin positions and trigger points align with Lenis
      ScrollTrigger.refresh();
    }

    init();

    return () => {
      destroyed = true;
      if (tickerHandler) {
        gsap.ticker.remove(tickerHandler);
      }
      lenis?.destroy();
    };
  }, [pathname]);
}
