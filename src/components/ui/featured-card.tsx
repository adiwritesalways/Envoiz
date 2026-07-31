import * as React from "react";
import { cn } from "@/lib/utils";

export interface FeaturedCardProps
  extends React.HTMLAttributes<HTMLDivElement> {
  children?: React.ReactNode;
  glowCorner?: "top-left" | "top-right" | "bottom-left" | "bottom-right";
}

const cornerGradients = {
  "top-left": "bg-[radial-gradient(circle_at_top_left,var(--glow),transparent_65%)]",
  "top-right": "bg-[radial-gradient(circle_at_top_right,var(--glow),transparent_65%)]",
  "bottom-left": "bg-[radial-gradient(circle_at_bottom_left,var(--glow),transparent_65%)]",
  "bottom-right": "bg-[radial-gradient(circle_at_bottom_right,var(--glow),transparent_65%)]",
};

export function FeaturedCard({
  className,
  children,
  glowCorner = "top-right",
  ...props
}: FeaturedCardProps) {
  return (
    <div
      className={cn(
        "group relative overflow-hidden rounded-2xl border border-white/10 bg-black/40 p-6 backdrop-blur-xl transition-all duration-300 ease-out hover:border-white/20 hover:bg-black/55",
        className
      )}
      {...props}
    >
      <div
        className={cn(
          "pointer-events-none absolute -inset-px opacity-[0.18] transition-opacity duration-300 ease-out group-hover:opacity-[0.48]",
          cornerGradients[glowCorner]
        )}
        style={{ "--glow": "oklch(0.85 0 0 / 0.45)" } as React.CSSProperties}
      />
      <div className="relative z-10">{children}</div>
    </div>
  );
}
