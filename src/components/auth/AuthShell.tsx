import { Link } from "@tanstack/react-router";
import type { ReactNode } from "react";

function LogoMark() {
  return (
    <div className="h-9 w-9 rounded-[10px] bg-black text-white grid place-items-center">
      <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
        <path d="M5 4h10l4 4v12H5z" />
        <path d="M9 10h6M9 14h6M9 18h4" />
      </svg>
    </div>
  );
}

interface AuthShellProps {
  title: string;
  subtitle: string;
  children: ReactNode;
  footer: ReactNode;
}

export function AuthShell({ title, subtitle, children, footer }: AuthShellProps) {
  return (
    <div className="min-h-screen bg-background text-foreground font-sans antialiased relative overflow-hidden">
      <div className="absolute inset-0 grid-bg pointer-events-none opacity-70" />
      <div className="relative min-h-screen flex flex-col">
        <header className="px-6 py-6">
          <Link to="/" className="inline-flex items-center gap-2.5 font-semibold tracking-tight">
            <LogoMark />
            <span className="text-[17px]">Receiptly</span>
          </Link>
        </header>

        <main className="flex-1 flex items-center justify-center px-6 pb-16">
          <div className="w-full max-w-[420px] animate-fade-up">
            <div className="text-center mb-8">
              <h1 className="text-[32px] font-semibold tracking-[-0.03em] leading-tight">{title}</h1>
              <p className="mt-2 text-[14.5px] text-muted-foreground">{subtitle}</p>
            </div>

            <div className="glass rounded-2xl p-7">
              {children}
            </div>

            <p className="mt-6 text-center text-[13.5px] text-muted-foreground">
              {footer}
            </p>

            <p className="mt-8 text-center text-[11.5px] text-muted-foreground/80 leading-relaxed">
              By continuing, you agree to Receiptly's{" "}
              <a href="#" className="underline hover:text-foreground">Terms</a> and{" "}
              <a href="#" className="underline hover:text-foreground">Privacy Policy</a>.
            </p>
          </div>
        </main>
      </div>
    </div>
  );
}
