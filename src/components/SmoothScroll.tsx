import { useEffect } from "react";
import Lenis from "lenis";

/** Provides a single accessible smooth-scroll controller for in-page links. */
export function SmoothScroll() {
  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const lenis = new Lenis({
      duration: 1.05,
      easing: (progress) => 1 - Math.pow(1 - progress, 4),
      smoothWheel: true,
      syncTouch: false,
    });
    let frameId = 0;
    const onFrame = (time: number) => {
      lenis.raf(time);
      frameId = window.requestAnimationFrame(onFrame);
    };
    frameId = window.requestAnimationFrame(onFrame);

    const scrollToHash = (hash: string, updateHistory: boolean) => {
      if (!hash || hash === "#") return;
      const target = document.getElementById(decodeURIComponent(hash.slice(1)));
      if (!target) return;
      if (updateHistory) window.history.pushState(null, "", hash);
      lenis.scrollTo(target, { offset: -24 });
    };

    const onDocumentClick = (event: MouseEvent) => {
      const origin = event.target;
      if (!(origin instanceof Element)) return;
      const link = origin.closest<HTMLAnchorElement>('a[href^="#"]');
      if (!link || event.defaultPrevented || event.metaKey || event.ctrlKey || event.shiftKey)
        return;
      const url = new URL(link.href, window.location.href);
      if (url.pathname !== window.location.pathname || !url.hash) return;
      const target = document.getElementById(decodeURIComponent(url.hash.slice(1)));
      if (!target) return;
      event.preventDefault();
      scrollToHash(url.hash, true);
    };

    document.addEventListener("click", onDocumentClick);
    if (window.location.hash)
      window.requestAnimationFrame(() => scrollToHash(window.location.hash, false));

    return () => {
      window.cancelAnimationFrame(frameId);
      document.removeEventListener("click", onDocumentClick);
      lenis.destroy();
    };
  }, []);

  return null;
}
