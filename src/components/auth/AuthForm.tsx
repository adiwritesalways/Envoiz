import { useNavigate } from "@tanstack/react-router";
import { ArrowRight, Eye, EyeOff, Loader2 } from "lucide-react";
import { useState, type FormEvent, type ReactNode } from "react";

import { supabase } from "@/lib/supabase";

interface AuthFormProps {
  mode: "login" | "signup";
}

export function AuthForm({ mode }: AuthFormProps) {
  const navigate = useNavigate();
  const oauthRedirectTo =
    typeof window !== "undefined" ? `${window.location.origin}/dashboard` : "/dashboard";
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [oauthProvider, setOauthProvider] = useState<"google" | "github" | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<ReactNode>(null);

  const [resetMode, setResetMode] = useState(false);
  const [resetEmail, setResetEmail] = useState("");
  const [resetLoading, setResetLoading] = useState(false);

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setInfo(null);

    try {
      if (mode === "signup") {
        if (password !== confirmPassword) {
          setError("Passwords don't match.");
          return;
        }

        const { data, error: signUpError } = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: oauthRedirectTo,
            data: {
              full_name: fullName,
              onboarding_pending: true,
            },
          },
        });

        if (signUpError) {
          throw signUpError;
        }

        const isNewAccount = (data.user?.identities?.length ?? 0) > 0;
        if (!isNewAccount) {
          setInfo(
            <>
              An account with this email already exists.{" "}
              <a href="/login" className="underline font-medium hover:opacity-70">
                Please sign in →
              </a>
            </>,
          );
          return;
        }

        if (data.session) {
          await navigate({ to: "/dashboard" });
          return;
        }

        setInfo("Check your email to verify your account before signing in.");
        return;
      }

      const { error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (signInError) {
        if (signInError.message.toLowerCase().includes("invalid login credentials")) {
          const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
            email,
            password,
            options: {
              emailRedirectTo: oauthRedirectTo,
              data: { onboarding_pending: true },
            },
          });

          if (signUpError) throw signUpError;

          const isNewAccount = (signUpData.user?.identities?.length ?? 0) > 0;

          if (!isNewAccount) {
            throw new Error("Incorrect password. Please try again.");
          }

          if (signUpData.session) {
            await navigate({ to: "/dashboard" });
            return;
          }

          setInfo("Check your email to verify your account before signing in.");
          return;
        }

        throw signInError;
      }

      await navigate({ to: "/dashboard" });
    } catch (authError) {
      setError(authError instanceof Error ? authError.message : "Authentication failed.");
    } finally {
      setLoading(false);
    }
  };

  const onResetSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setResetLoading(true);
    setError(null);
    setInfo(null);
    try {
      const redirectTo =
        typeof window !== "undefined"
          ? `${window.location.origin}/reset-password`
          : "/reset-password";
      const { error: resetError } = await supabase.auth.resetPasswordForEmail(resetEmail, {
        redirectTo,
      });
      if (resetError) throw resetError;
      setInfo("Check your email for a reset link.");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to send reset link.");
    } finally {
      setResetLoading(false);
    }
  };

  const onSocialSignIn = async (provider: "google" | "github") => {
    setOauthProvider(provider);
    setError(null);
    setInfo(null);

    try {
      const { data, error: oauthError } = await supabase.auth.signInWithOAuth({
        provider,
        options: {
          redirectTo: oauthRedirectTo,
        },
      });

      if (oauthError) {
        throw oauthError;
      }

      if (data.url) {
        window.location.assign(data.url);
      }
    } catch (authError) {
      setError(authError instanceof Error ? authError.message : "OAuth sign-in failed.");
      setOauthProvider(null);
    }
  };

  const isBusy = loading || oauthProvider !== null;

  if (mode === "login" && resetMode) {
    return (
      <div className="space-y-6">
        <div>
          <h2 className="text-[15px] font-semibold">Reset your password</h2>
          <p className="mt-1 text-[13px] text-muted-foreground">
            Enter your email and we'll send you a reset link.
          </p>
        </div>
        <form onSubmit={onResetSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <label htmlFor="resetEmail" className="text-[12.5px] font-medium text-foreground">
              Email
            </label>
            <input
              id="resetEmail"
              type="email"
              required
              autoComplete="email"
              value={resetEmail}
              onChange={(event) => setResetEmail(event.target.value)}
              placeholder="you@company.com"
              className="w-full h-11 px-3.5 rounded-lg bg-white border border-hairline text-[14px] placeholder:text-muted-foreground/70 focus:outline-none focus:ring-2 focus:ring-black/10 focus:border-black/30 transition"
            />
          </div>

          {(error || info) && (
            <div
              className={`rounded-2xl border px-4 py-3 text-[13px] leading-relaxed ${
                error
                  ? "border-rose-200 bg-rose-50 text-rose-700"
                  : "border-emerald-200 bg-emerald-50 text-emerald-700"
              }`}
            >
              {error ?? info}
            </div>
          )}

          <button
            type="submit"
            disabled={resetLoading}
            className="w-full h-11 inline-flex items-center justify-center gap-2 rounded-lg bg-black text-white text-[14px] font-medium hover:bg-black/85 active:bg-black transition-colors shadow-[0_8px_24px_rgba(0,0,0,0.18)] disabled:opacity-70 disabled:cursor-not-allowed"
          >
            {resetLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Send reset link"}
          </button>
        </form>

        <button
          type="button"
          onClick={() => { setResetMode(false); setError(null); setInfo(null); }}
          className="text-[13px] text-muted-foreground hover:text-foreground transition-colors"
        >
          ← Back to sign in
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <form onSubmit={onSubmit} className="space-y-4">
        {mode === "signup" && (
          <div className="space-y-1.5">
            <label htmlFor="fullName" className="text-[12.5px] font-medium text-foreground">
              Full Name
            </label>
            <input
              id="fullName"
              type="text"
              required
              autoComplete="name"
              value={fullName}
              onChange={(event) => setFullName(event.target.value)}
              placeholder="John Doe"
              className="w-full h-11 px-3.5 rounded-lg bg-white border border-hairline text-[14px] placeholder:text-muted-foreground/70 focus:outline-none focus:ring-2 focus:ring-black/10 focus:border-black/30 transition"
            />
          </div>
        )}
        <div className="space-y-1.5">
          <label htmlFor="email" className="text-[12.5px] font-medium text-foreground">
            Email
          </label>
          <input
            id="email"
            type="email"
            required
            autoComplete="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            placeholder="you@company.com"
            className="w-full h-11 px-3.5 rounded-lg bg-white border border-hairline text-[14px] placeholder:text-muted-foreground/70 focus:outline-none focus:ring-2 focus:ring-black/10 focus:border-black/30 transition"
          />
        </div>

        <div className="space-y-1.5">
          <div className="flex items-center justify-between gap-3">
            <label htmlFor="password" className="text-[12.5px] font-medium text-foreground">
              Password
            </label>
          </div>
          <div className="relative">
            <input
              id="password"
              type={showPassword ? "text" : "password"}
              required
              minLength={8}
              autoComplete={mode === "login" ? "current-password" : "new-password"}
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              placeholder={mode === "signup" ? "At least 8 characters" : "Enter your password"}
              className="w-full h-11 pl-3.5 pr-10 rounded-lg bg-white border border-hairline text-[14px] placeholder:text-muted-foreground/70 focus:outline-none focus:ring-2 focus:ring-black/10 focus:border-black/30 transition"
            />
            <button
              type="button"
              onClick={() => setShowPassword((current) => !current)}
              aria-label={showPassword ? "Hide password" : "Show password"}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 h-7 w-7 grid place-items-center rounded-md text-muted-foreground hover:text-foreground hover:bg-secondary transition"
            >
              {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
          {mode === "login" && (
            <button
              type="button"
              onClick={() => { setResetMode(true); setError(null); setInfo(null); }}
              className="text-[12px] text-muted-foreground hover:text-foreground transition-colors"
            >
              Forgot password?
            </button>
          )}
        </div>

        {mode === "signup" && (
          <div className="space-y-1.5">
            <label htmlFor="confirmPassword" className="text-[12.5px] font-medium text-foreground">
              Confirm Password
            </label>
            <div className="relative">
              <input
                id="confirmPassword"
                type={showPassword ? "text" : "password"}
                required
                minLength={8}
                autoComplete="new-password"
                value={confirmPassword}
                onChange={(event) => setConfirmPassword(event.target.value)}
                placeholder="Re-enter your password"
                className="w-full h-11 pl-3.5 pr-10 rounded-lg bg-white border border-hairline text-[14px] placeholder:text-muted-foreground/70 focus:outline-none focus:ring-2 focus:ring-black/10 focus:border-black/30 transition"
              />
            </div>
          </div>
        )}

        {(error || info) && (
          <div
            className={`rounded-2xl border px-4 py-3 text-[13px] leading-relaxed ${
              error
                ? "border-rose-200 bg-rose-50 text-rose-700"
                : "border-emerald-200 bg-emerald-50 text-emerald-700"
            }`}
          >
            {error ?? info}
          </div>
        )}

        <button
          type="submit"
          disabled={isBusy}
          className="w-full h-11 inline-flex items-center justify-center gap-2 rounded-lg bg-black text-white text-[14px] font-medium hover:bg-black/85 active:bg-black transition-colors shadow-[0_8px_24px_rgba(0,0,0,0.18)] disabled:opacity-70 disabled:cursor-not-allowed"
        >
          {loading ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <>
              {mode === "login" ? "Sign in" : "Create account"}
              <ArrowRight className="h-4 w-4" />
            </>
          )}
        </button>
      </form>

      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-hairline" />
        </div>
        <div className="relative flex justify-center text-[11.5px] uppercase tracking-[0.18em]">
          <span className="bg-white px-3 text-muted-foreground">or continue with</span>
        </div>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        <SocialButton
          provider="google"
          loading={oauthProvider === "google"}
          onClick={() => onSocialSignIn("google")}
        />
        <SocialButton
          provider="github"
          loading={oauthProvider === "github"}
          onClick={() => onSocialSignIn("github")}
        />
      </div>
    </div>
  );
}

function SocialButton({
  provider,
  loading,
  onClick,
}: {
  provider: "google" | "github";
  loading: boolean;
  onClick: () => void;
}) {
  const label = provider === "google" ? "Google" : "GitHub";

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={loading}
      className="h-11 inline-flex items-center justify-center gap-2 rounded-2xl border border-hairline bg-white text-[13.5px] font-medium text-foreground transition-colors hover:bg-secondary disabled:cursor-not-allowed disabled:opacity-70"
    >
      {provider === "google" ? <GoogleIcon /> : <GitHubIcon />}
      {loading ? "Connecting..." : label}
    </button>
  );
}

function GoogleIcon() {
  return (
    <svg className="h-4 w-4" viewBox="0 0 24 24" aria-hidden="true">
      <path
        fill="#4285F4"
        d="M21.35 11.1h-9.18v2.97h5.28c-.23 1.4-1.64 4.09-5.28 4.09-3.18 0-5.78-2.63-5.78-5.86s2.6-5.86 5.78-5.86c1.82 0 3.04.77 3.74 1.43l2.55-2.46C16.57 3.83 14.64 3 12.17 3 6.92 3 2.67 7.2 2.67 12.38c0 5.18 4.25 9.38 9.5 9.38 5.48 0 9.12-3.82 9.12-9.2 0-.62-.06-1.09-.14-1.46z"
      />
      <path
        fill="#34A853"
        d="m3.94 7.95 3.15 2.31A5.68 5.68 0 0 1 12.17 6c1.36 0 2.59.49 3.56 1.29l2.58-2.48A9.08 9.08 0 0 0 12.17 3C8.07 3 4.55 5.3 3.94 7.95z"
      />
      <path
        fill="#FBBC05"
        d="M12.17 21.76c2.47 0 4.54-.79 6.06-2.16l-2.8-2.19c-.83.55-1.95.94-3.26.94-2.54 0-4.69-1.65-5.45-3.86L3.47 18.1c1.45 2.87 4.48 3.66 8.7 3.66z"
      />
      <path
        fill="#EA4335"
        d="M21.35 11.1H12.17v2.97h5.28c-.35 2.08-2.08 3.36-4.39 3.36-2.54 0-4.69-1.65-5.45-3.86L3.47 18.1c1.45 2.87 4.48 3.66 8.7 3.66 5.48 0 9.12-3.82 9.12-9.2 0-.62-.06-1.09-.14-1.46z"
      />
    </svg>
  );
}

function GitHubIcon() {
  return (
    <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M12 .5C5.73.5.99 5.24.99 11.5c0 4.85 3.15 8.96 7.52 10.41.55.1.75-.24.75-.53 0-.26-.01-1.13-.02-2.05-3.06.67-3.71-1.3-3.71-1.3-.5-1.27-1.22-1.6-1.22-1.6-1-.68.08-.67.08-.67 1.1.08 1.68 1.13 1.68 1.13.98 1.68 2.57 1.2 3.2.92.1-.71.38-1.2.69-1.48-2.44-.28-5.01-1.22-5.01-5.43 0-1.2.43-2.18 1.13-2.95-.11-.28-.49-1.4.11-2.92 0 0 .92-.3 3.02 1.13.88-.24 1.82-.36 2.76-.37.94.01 1.88.13 2.76.37 2.1-1.43 3.02-1.13 3.02-1.13.6 1.52.22 2.64.11 2.92.7.77 1.13 1.75 1.13 2.95 0 4.22-2.57 5.15-5.02 5.42.39.34.74 1 .74 2.02 0 1.46-.01 2.64-.01 3 0 .29.2.64.76.53A11.01 11.01 0 0 0 23 11.5C23 5.24 18.27.5 12 .5z" />
    </svg>
  );
}
