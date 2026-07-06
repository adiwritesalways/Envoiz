import { brandName, logoUrl } from "@/lib/envoiz";

type BrandLogoProps = {
  variant?: "horizontal" | "icon";
  className?: string;
};

export function BrandLogo({ variant = "horizontal", className }: BrandLogoProps) {
  if (variant === "icon") {
    return (
      <img
        src={logoUrl}
        alt={brandName}
        width={248}
        height={80}
        loading="eager"
        decoding="async"
        fetchPriority="high"
        style={{ objectFit: "contain" }}
        className={className ?? "h-8 w-auto"}
      />
    );
  }

  return (
    <img
      src={logoUrl}
      alt={brandName}
      width={248}
      height={80}
      loading="eager"
      decoding="async"
      fetchPriority="high"
      style={{ objectFit: "contain" }}
      className={className ?? "h-10 w-auto"}
    />
  );
}
