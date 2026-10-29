import React from "react";

interface EnvoizLogoSvgProps extends React.SVGProps<SVGSVGElement> {
  size?: number | string;
  withBackground?: boolean;
}

export function EnvoizLogoSvg({
  size = 32,
  withBackground = true,
  className = "",
  style,
  ...props
}: EnvoizLogoSvgProps) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 1024 1024"
      fill="none"
      width={size}
      height={size}
      className={className}
      style={{ display: "inline-block", verticalAlign: "middle", ...style }}
      {...props}
    >
      {withBackground && (
        <rect width="1024" height="1024" rx="224" fill="#0b0b0c" />
      )}
      {/* Top rhombus - color #421d24 */}
      <polygon
        points="512,192 806,339 512,487 217,339"
        fill="#421d24"
        stroke="#421d24"
        strokeWidth="2"
        strokeLinejoin="round"
      />
      {/* Middle chevron - white #ffffff */}
      <polyline
        points="214,474 512,634 810,474"
        stroke="#ffffff"
        strokeWidth="64"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
      {/* Bottom chevron - grey #7a7a7a */}
      <polyline
        points="214,646 512,806 810,646"
        stroke="#7a7a7a"
        strokeWidth="64"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
    </svg>
  );
}
