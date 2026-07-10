import { Link } from "@tanstack/react-router";
import type { ReactNode } from "react";

import { BrandLogo } from "@/components/BrandLogo";
import { brandName } from "@/lib/envoiz";

interface AuthShellProps {
  title: string;
  subtitle: string;
  children: ReactNode;
  footer: ReactNode;
}

export function AuthShell({ title, subtitle, children, footer }: AuthShellProps) {
  return (
    <div className="min-h-screen bg-background text-foreground font-sans antialiased relative overflow-hidden">
      <div className="absolute inset-0 grid-bg pointer-events-none opacity-60" />
      <main className="relative mx-auto flex min-h-screen w-full max-w-[440px] items-center px-4 py-10 sm:px-6">
        <section className="w-full animate-fade-up">
          <div className="mb-8 text-center">
            <Link to="/" className="inline-flex items-center justify-center" aria-label={brandName}>
              <BrandLogo className="h-14 w-auto" />
            </Link>
            <h1 className="mt-6 text-[32px] font-semibold tracking-[-0.03em] leading-tight">
              {title}
            </h1>
            <p className="mt-2 text-[14.5px] text-muted-foreground">{subtitle}</p>
          </div>

          <div className="rounded-[2rem] border border-hairline bg-white/90 p-6 shadow-[0_1px_2px_rgba(0,0,0,0.03),0_20px_60px_rgba(0,0,0,0.08)] sm:p-8">
            {children}
          </div>

          <p className="mt-6 text-center text-[13.5px] text-muted-foreground">{footer}</p>

          <p className="mt-8 text-center text-[11.5px] leading-relaxed text-muted-foreground/80">
            By continuing, you agree to {brandName}'s{" "}
            <a href="#" className="underline hover:text-foreground">
              Terms
            </a>{" "}
            and{" "}
            <a href="#" className="underline hover:text-foreground">
              Privacy Policy
            </a>
            .
          </p>
        </section>
      </main>
    </div>
  );
}
