import { Link } from "@tanstack/react-router";
import { Check, ShieldCheck } from "lucide-react";
import type { ReactNode } from "react";
import { BrandLogo } from "@/components/BrandLogo";

interface AuthShellProps {
  title: string;
  /** Text before the CTA link */
  subtitleText?: string;
  /** Link label */
  subtitleLinkLabel?: string;
  /** Link destination */
  subtitleLinkTo?: string;
  children: ReactNode;
  footer: ReactNode;
  mode?: "login" | "signup" | "forgot";
}

function Brand({ mobile = false }: { mobile?: boolean }) {
  return (
    <Link className={`auth-brand${mobile ? " auth-brand-mobile" : ""}`} to="/">
      <BrandLogo className="auth-brand-logo" />
    </Link>
  );
}

function AuthAside() {
  return (
    <aside className="auth-aside">
      <Brand />
      <div className="auth-aside-orbit" aria-hidden="true" />
      <div className="auth-aside-content">
        <h1>
          A little less chasing.
          <br />
          <span>A lot more clarity.</span>
        </h1>
        <p>Invoices, clients, and exports—together in a workspace made for the way you work.</p>
        <div className="auth-payment-card">
          <div className="auth-payment-top">
            <span className="auth-payment-icon">
              <Check size={17} />
            </span>
            <span>INVOICE SAVED</span>
            <span className="auth-payment-status">READY</span>
          </div>
          <div className="auth-payment-details">
            <span>Northlight Studio</span>
            <b>$4,850.00</b>
          </div>
          <div className="auth-payment-rule">
            <i />
          </div>
          <div className="auth-payment-footer">
            <span>Invoice INV-2025-041</span>
            <span>Today · 10:42 AM</span>
          </div>
        </div>
      </div>
      <div className="auth-aside-foot">
        <ShieldCheck size={15} /> Your work and client details stay yours.
      </div>
    </aside>
  );
}

export function AuthShell({ title, subtitle, children, footer, mode = "login" }: AuthShellProps) {
  const isSignup = mode === "signup";

  return (
    <main className="auth-page">
      <AuthAside />
      <section className="auth-main">
        <header className="auth-topbar">
          <Brand mobile />
          <p className="auth-top-prompt">{footer}</p>
        </header>
        <div className={`auth-content${mode === "forgot" ? " auth-content-recovery" : ""}`}>
          {!isSignup && (
            <span className="auth-overline">
              {mode === "forgot" ? "ACCOUNT ACCESS" : "WELCOME BACK"}
            </span>
          )}
          <h2 className="auth-title">{title}</h2>
          <p className="auth-description">{subtitle}</p>

          <div className="mt-6">{children}</div>

          <p className="auth-legal">
            By continuing, you agree to Envoiz's{" "}
            <Link to="/terms" className="underline hover:text-foreground">
              Terms
            </Link>{" "}
            and{" "}
            <Link to="/privacy-policy" className="underline hover:text-foreground">
              Privacy Policy
            </Link>
            .
          </p>
        </div>
      </section>
    </main>
  );
}
