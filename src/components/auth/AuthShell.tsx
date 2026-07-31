import { Link } from "@tanstack/react-router";
import type { ReactNode } from "react";

import { BrandLogo } from "@/components/BrandLogo";
import { brandName } from "@/lib/envoiz";

interface AuthShellProps {
  title: string;
  /** Text before the CTA link */
  subtitleText?: string;
  /** Link label */
  subtitleLinkLabel?: string;
  /** Link destination */
  subtitleLinkTo?: string;
  children: ReactNode;
}

export function AuthShell({
  title,
  subtitleText,
  subtitleLinkLabel,
  subtitleLinkTo = "/login",
  children,
}: AuthShellProps) {
  return (
    <div className="relative min-h-screen bg-[#0a0a0a] text-[#F5F5F5] font-sans antialiased overflow-hidden flex flex-col items-center justify-center">
      {/* ── Background lighting ── */}
      <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden">
        {/* Top-right gray glow */}
        <div
          className="absolute -top-40 -right-40 h-[800px] w-[800px] rounded-full"
          style={{
            background:
              "radial-gradient(ellipse at 65% 25%, rgba(140,140,140,0.45) 0%, rgba(90,90,90,0.2) 35%, rgba(50,50,50,0.08) 60%, transparent 80%)",
            filter: "blur(40px)",
          }}
        />
        {/* Bottom-left gray glow */}
        <div
          className="absolute -bottom-40 -left-40 h-[750px] w-[750px] rounded-full"
          style={{
            background:
              "radial-gradient(ellipse at 35% 75%, rgba(130,130,130,0.40) 0%, rgba(80,80,80,0.18) 35%, rgba(45,45,45,0.06) 60%, transparent 80%)",
            filter: "blur(45px)",
          }}
        />
      </div>

      {/* Back to home — top-left */}
      <div className="fixed top-5 left-5 z-20">
        <Link
          to="/"
          className="inline-flex items-center gap-1.5 text-[13px] text-neutral-500 hover:text-neutral-300 transition-colors duration-200"
        >
          <svg
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M15 18l-6-6 6-6" />
          </svg>
          Home
        </Link>
      </div>

      {/* ── Centered content ── */}
      <div className="relative z-10 flex flex-col items-center w-full px-4">
        {/* Icon logo */}
        <div className="mb-6 flex items-center justify-center rounded-[14px] border border-[#222] bg-[#111] p-2.5 shadow-lg">
          <BrandLogo variant="icon" className="h-7 w-7" />
        </div>

        {/* Title */}
        <h1 className="mb-2 text-[26px] sm:text-[28px] font-semibold tracking-[-0.03em] text-white text-center">
          {title}
        </h1>

        {/* Subtitle */}
        {subtitleText && subtitleLinkLabel && (
          <p className="mb-7 text-[14px] text-neutral-500 text-center">
            {subtitleText}{" "}
            <Link
              to={subtitleLinkTo}
              className="text-white font-medium hover:underline underline-offset-2 transition-all"
            >
              {subtitleLinkLabel}
            </Link>
          </p>
        )}

        {/* Form */}
        <div className="w-full max-w-[360px]">{children}</div>

        {/* Legal */}
        <p className="mt-7 text-center text-[12px] leading-relaxed text-neutral-600 max-w-[320px]">
          By continuing, you agree to {brandName}'s{" "}
          <a
            href="/terms"
            className="underline underline-offset-2 hover:text-neutral-400 transition-colors"
          >
            Terms
          </a>{" "}
          and{" "}
          <a
            href="/privacy-policy"
            className="underline underline-offset-2 hover:text-neutral-400 transition-colors"
          >
            Privacy Policy
          </a>
          .
        </p>
      </div>
    </div>
  );
}
