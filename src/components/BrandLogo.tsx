import { brandName, faviconUrl, logoUrl } from "@/lib/envoiz";

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
    <img
      src={logoUrl}
      alt={brandName}
      width={591}
      height={225}
      loading="eager"
      decoding="async"
      fetchPriority="high"
      style={{ objectFit: "contain" }}
      className={className ?? "h-11 w-auto max-w-[320px]"}
    />
  );
}
