import React, { useRef, useEffect } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { Zap, Globe, Shield, Sparkles, ArrowRight } from "lucide-react";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

export interface ScrollStackPanel {
  id: string;
  eyebrow: string;
  title: string;
  description: string;
  gradient: string;
  badge: string;
  icon: React.ReactNode;
  highlights: string[];
}

const DEFAULT_PANELS: ScrollStackPanel[] = [
  {
    id: "vector-engine",
    eyebrow: "01 // VECTOR RENDERING",
    title: "Sub-50ms Lossless Vector Engine",
    description:
      "Documents are compiled mathematically in the browser using dedicated vector rendering rails. Lightweight files (< 60KB), crisp at 1000% zoom, and strictly conforming to PDF/A archival guidelines.",
    gradient: "from-[#081f18] via-[#051410] to-[#010805]",
    badge: "Vector PDF Engine",
    icon: <Zap className="w-6 h-6 text-[#0c8c5e]" />,
    highlights: ["Sub-50ms render time", "< 60KB compact bundle", "100% loss-free vector scale"],
  },
  {
    id: "global-routing",
    eyebrow: "02 // GLOBAL ROUTING",
    title: "Dynamic Multi-Currency Router",
    description:
      "Native formatting across USD, EUR, GBP, INR, CAD, AUD, JPY, and 10+ currencies. Zero floating-point rounding errors and automated exchange rate notation.",
    gradient: "from-[#09222c] via-[#05151c] to-[#020b0f]",
    badge: "Global Settlement",
    icon: <Globe className="w-6 h-6 text-[#38bdf8]" />,
    highlights: ["14+ fiat currencies", "Zero floating-point bugs", "Automated ISO symbols"],
  },
  {
    id: "settlement-rails",
    eyebrow: "03 // SETTLEMENT RAILS",
    title: "Direct Payouts, Zero Middlemen",
    description:
      "Connect your Stripe account or embed bank wire/ACH instructions directly into your hosted invoice. Payments land straight in your account with zero platform hold or hidden processing fees.",
    gradient: "from-[#1c1809] via-[#120f05] to-[#0a0802]",
    badge: "Direct Payouts",
    icon: <Shield className="w-6 h-6 text-[#fbbf24]" />,
    highlights: ["Direct Stripe Connect", "Zero intermediary hold", "Wire & ACH native fields"],
  },
  {
    id: "studio-identity",
    eyebrow: "04 // STUDIO IDENTITY",
    title: "Bespoke Letterheads & Typography",
    description:
      "Upload custom SVG logos, define strict font stacks, and maintain your studio's brand integrity across every transaction. Designed for agencies and independent craftspeople.",
    gradient: "from-[#1f0920] via-[#130514] to-[#09020a]",
    badge: "Studio Identity",
    icon: <Sparkles className="w-6 h-6 text-[#c084fc]" />,
    highlights: ["Vector SVG logo embeds", "Inter & Custom Typography", "Editorial layout grid"],
  },
];

export const ScrollStack: React.FC<{ panels?: ScrollStackPanel[] }> = ({
  panels = DEFAULT_PANELS,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const ctx = gsap.context(() => {
      const mm = gsap.matchMedia();

      // Desktop: 100vh stacked panel reveal choreography
      mm.add("(min-width: 768px)", () => {
        const panelElements = gsap.utils.toArray<HTMLElement>(".scroll-panel-card");

        const tl = gsap.timeline({
          scrollTrigger: {
            trigger: containerRef.current,
            start: "top top",
            end: `+=${panels.length * 100}%`,
            scrub: 0.8,
            pin: stageRef.current,
            anticipatePin: 1,
            invalidateOnRefresh: true,
          },
        });

        panelElements.forEach((panel, index) => {
          if (index === 0) return;

          // Incoming panel slides up over previous panel
          tl.fromTo(
            panel,
            {
              yPercent: 100,
            },
            {
              yPercent: 0,
              ease: "none",
            },
            index - 1
          );

          // Subtle depth scaling on previous panel
          if (panelElements[index - 1]) {
            tl.to(
              panelElements[index - 1],
              {
                scale: 0.96,
                opacity: 0.75,
                ease: "none",
              },
              index - 1
            );
          }
        });
      });
    }, containerRef);

    return () => ctx.revert();
  }, [panels.length]);

  return (
    <div
      ref={containerRef}
      id="capabilities"
      className="relative w-full"
      style={{ height: `${panels.length * 100}vh` }}
    >
      <div
        ref={stageRef}
        className="sticky top-0 h-screen w-full overflow-hidden bg-[#08090a] flex flex-col justify-center items-center px-4 sm:px-6 lg:px-8"
      >
        {/* Editorial Header Bar inside viewport */}
        <div className="absolute top-8 left-6 right-6 sm:left-12 sm:right-12 z-40 flex items-center justify-between pointer-events-none">
          <span className="text-[12px] font-mono tracking-[0.15em] text-emerald-400 uppercase">
            ENVOIZ CAPABILITIES // SCROLL-DRIVEN STACK
          </span>
          <span className="text-[12px] font-mono text-gray-500">
            01 — 0{panels.length}
          </span>
        </div>

        {/* Stacked Panels Viewport */}
        <div className="relative w-full max-w-5xl h-[80vh] sm:h-[75vh] mx-auto rounded-2xl overflow-hidden border border-white/10 shadow-2xl">
          {panels.map((panel, idx) => (
            <div
              key={panel.id}
              className={`scroll-panel-card absolute inset-0 w-full h-full p-8 sm:p-12 lg:p-16 flex flex-col justify-between bg-gradient-to-br ${panel.gradient} text-white shadow-2xl border border-white/10 rounded-2xl overflow-hidden`}
              style={{ zIndex: idx + 10 }}
            >
              {/* Subtle Meshy Ambient Background Glow */}
              <div className="absolute -top-24 -right-24 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
              <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />

              {/* Panel Header */}
              <div className="relative z-10 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 rounded-xl bg-white/5 border border-white/10 backdrop-blur-md">
                    {panel.icon}
                  </div>
                  <span className="text-xs font-mono tracking-widest text-emerald-400/90 uppercase">
                    {panel.eyebrow}
                  </span>
                </div>
                <span className="px-3 py-1 rounded-full text-xs font-medium bg-white/10 text-white/80 border border-white/10 backdrop-blur-md">
                  {panel.badge}
                </span>
              </div>

              {/* Panel Content Body */}
              <div className="relative z-10 my-auto max-w-2xl">
                <h3 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-white mb-6 leading-[1.15]">
                  {panel.title}
                </h3>
                <p className="text-base sm:text-lg text-gray-300 font-normal leading-relaxed mb-8">
                  {panel.description}
                </p>

                {/* Capability Key Highlights */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 border-t border-white/10 pt-6">
                  {panel.highlights.map((item, i) => (
                    <div key={i} className="flex items-center gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                      <span className="text-xs font-medium text-gray-300">{item}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Panel Footer CTA */}
              <div className="relative z-10 flex items-center justify-between border-t border-white/10 pt-6">
                <span className="text-xs font-mono text-gray-400">
                  SCENARIO 0{idx + 1} OF 0{panels.length}
                </span>
                <a
                  href="#workbench"
                  className="inline-flex items-center gap-2 text-xs font-semibold text-emerald-400 hover:text-emerald-300 transition-colors group"
                >
                  <span>Explore in live sandbox</span>
                  <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                </a>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
