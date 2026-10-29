import { brandName, faviconUrl } from "@/lib/envoiz";

type BrandLogoProps = {
  variant?: "horizontal" | "icon";
  className?: string;
};

export function BrandLogo({ variant = "horizontal", className }: BrandLogoProps) {
  if (variant === "icon") {
    return (
      <img
        src={faviconUrl}
        alt={brandName}
        width={512}
        height={512}
        loading="eager"
        decoding="async"
        fetchPriority="high"
        style={{ objectFit: "contain" }}
        className={className ?? "h-6 w-6"}
      />
    );
  }

  return (
    <span
      className={className ?? "inline-flex h-11 w-auto items-center gap-2"}
      style={{ display: "inline-flex", alignItems: "center", gap: "0.42em" }}
    >
      <img
        src={faviconUrl}
        alt=""
        width={512}
        height={512}
        loading="eager"
        decoding="async"
        fetchPriority="high"
        style={{ objectFit: "contain", width: "auto", height: "100%", flexShrink: 0 }}
      />
      <span style={{ fontSize: "0.58em", fontWeight: 700, letterSpacing: "-0.045em" }}>
        {brandName}
      </span>
    </span>
  );
}
