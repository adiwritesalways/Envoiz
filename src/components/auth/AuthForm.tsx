import { ArrowRight, Loader2 } from "lucide-react";
import { useState } from "react";

import { supabase } from "@/lib/supabase";

interface AuthFormProps {
  mode: "login" | "signup";
}

export function AuthForm({ mode }: AuthFormProps) {
  const [providerLoading, setProviderLoading] = useState<"google" | "github" | null>(null);
  const [error, setError] = useState<string | null>(null);
  const redirectTo =
    typeof window !== "undefined" ? `${window.location.origin}/auth/callback` : "/auth/callback";

  const startOAuth = async (provider: "google" | "github") => {
    setProviderLoading(provider);
    setError(null);
    try {
      const { data, error: authError } = await supabase.auth.signInWithOAuth({
        provider,
        options: { redirectTo },
      });
      if (authError) throw authError;
      if (data.url) window.location.assign(data.url);
      else throw new Error(`Unable to start ${provider} sign in.`);
    } catch (authError) {
      setError(
        authError instanceof Error
          ? authError.message
          : "Sign in could not be started. Please try again.",
      );
      setProviderLoading(null);
    }
  };

  return (
    <div className="space-y-4">
      <p className="text-[13px] leading-6 text-muted-foreground">
        {mode === "signup"
          ? "Create your Envoiz account securely with Google or GitHub."
          : "Continue to your Envoiz workspace with Google or GitHub."}
      </p>
      <div className="auth-provider-list">
        <SocialButton
          provider="google"
          loading={providerLoading === "google"}
          disabled={providerLoading !== null}
          onClick={() => void startOAuth("google")}
        />
        <SocialButton
          provider="github"
          loading={providerLoading === "github"}
          disabled={providerLoading !== null}
          onClick={() => void startOAuth("github")}
        />
      </div>
      {error && (
        <div
          role="alert"
          className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-[13px] leading-relaxed text-rose-700"
        >
          {error}
        </div>
      )}
    </div>
  );
}

function SocialButton({
  provider,
  loading,
  disabled,
  onClick,
}: {
  provider: "google" | "github";
  loading: boolean;
  disabled: boolean;
  onClick: () => void;
}) {
  const label = provider === "google" ? "Google" : "GitHub";

  return (
    <button type="button" onClick={onClick} disabled={disabled} className="auth-provider-button">
      <span className="auth-provider-mark">
        {provider === "google" ? <GoogleIcon /> : <GitHubIcon />}
      </span>
      <span>{loading ? "Connecting…" : `Continue with ${label}`}</span>
      {loading ? (
        <Loader2 className="h-4 w-4 animate-spin" />
      ) : (
        <ArrowRight className="auth-provider-arrow" size={16} />
      )}
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
