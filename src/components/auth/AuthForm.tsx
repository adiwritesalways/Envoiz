import { useState, type FormEvent } from "react";
import { Eye, EyeOff, Loader2, ArrowRight } from "lucide-react";

interface AuthFormProps {
  mode: "login" | "signup";
}

export function AuthForm({ mode }: AuthFormProps) {
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const onSubmit = (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => setLoading(false), 900);
  };

  return (
    <div className="space-y-5">
      {/* Social providers */}
      <div className="grid grid-cols-2 gap-3">
        <SocialButton provider="google" />
        <SocialButton provider="github" />
      </div>

      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-hairline" />
        </div>
        <div className="relative flex justify-center text-[11.5px] uppercase tracking-wider">
          <span className="bg-white/80 px-3 text-muted-foreground">or continue with email</span>
        </div>
      </div>

      <form onSubmit={onSubmit} className="space-y-4">
        <div className="space-y-1.5">
          <label htmlFor="email" className="text-[12.5px] font-medium text-foreground">
            Email
          </label>
          <input
            id="email"
            type="email"
            required
            autoComplete="email"
            placeholder="you@company.com"
            className="w-full h-11 px-3.5 rounded-lg bg-white border border-hairline text-[14px] placeholder:text-muted-foreground/70 focus:outline-none focus:ring-2 focus:ring-black/10 focus:border-black/30 transition"
          />
        </div>

        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <label htmlFor="password" className="text-[12.5px] font-medium text-foreground">
              Password
            </label>
            {mode === "login" && (
              <a href="#" className="text-[12px] text-muted-foreground hover:text-foreground transition-colors">
                Forgot password?
              </a>
            )}
          </div>
          <div className="relative">
            <input
              id="password"
              type={showPassword ? "text" : "password"}
              required
              minLength={8}
              autoComplete={mode === "login" ? "current-password" : "new-password"}
              placeholder={mode === "signup" ? "At least 8 characters" : "Enter your password"}
              className="w-full h-11 pl-3.5 pr-10 rounded-lg bg-white border border-hairline text-[14px] placeholder:text-muted-foreground/70 focus:outline-none focus:ring-2 focus:ring-black/10 focus:border-black/30 transition"
            />
            <button
              type="button"
              onClick={() => setShowPassword((s) => !s)}
              aria-label={showPassword ? "Hide password" : "Show password"}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 h-7 w-7 grid place-items-center rounded-md text-muted-foreground hover:text-foreground hover:bg-secondary transition"
            >
              {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
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
    </div>
  );
}

function SocialButton({ provider }: { provider: "google" | "github" }) {
  const label = provider === "google" ? "Google" : "GitHub";
  return (
    <button
      type="button"
      className="h-11 inline-flex items-center justify-center gap-2 rounded-lg bg-white border border-hairline text-[13.5px] font-medium text-foreground hover:bg-secondary transition-colors"
    >
      {provider === "google" ? <GoogleIcon /> : <GitHubIcon />}
      {label}
    </button>
  );
}

function GoogleIcon() {
  return (
    <svg className="h-4 w-4" viewBox="0 0 24 24" aria-hidden="true">
      <path fill="#EA4335" d="M12 10.2v3.9h5.5c-.24 1.4-1.66 4.1-5.5 4.1-3.3 0-6-2.74-6-6.1s2.7-6.1 6-6.1c1.88 0 3.14.8 3.86 1.48l2.64-2.54C16.86 3.4 14.66 2.4 12 2.4 6.86 2.4 2.7 6.56 2.7 11.7s4.16 9.3 9.3 9.3c5.36 0 8.92-3.76 8.92-9.06 0-.6-.06-1.06-.16-1.54H12z"/>
    </svg>
  );
}

function GitHubIcon() {
  return (
    <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M12 .5C5.73.5.99 5.24.99 11.5c0 4.85 3.15 8.96 7.52 10.41.55.1.75-.24.75-.53 0-.26-.01-1.13-.02-2.05-3.06.67-3.71-1.3-3.71-1.3-.5-1.27-1.22-1.6-1.22-1.6-1-.68.08-.67.08-.67 1.1.08 1.68 1.13 1.68 1.13.98 1.68 2.57 1.2 3.2.92.1-.71.38-1.2.69-1.48-2.44-.28-5.01-1.22-5.01-5.43 0-1.2.43-2.18 1.13-2.95-.11-.28-.49-1.4.11-2.92 0 0 .92-.3 3.02 1.13.88-.24 1.82-.36 2.76-.37.94.01 1.88.13 2.76.37 2.1-1.43 3.02-1.13 3.02-1.13.6 1.52.22 2.64.11 2.92.7.77 1.13 1.75 1.13 2.95 0 4.22-2.57 5.15-5.02 5.42.39.34.74 1 .74 2.02 0 1.46-.01 2.64-.01 3 0 .29.2.64.76.53A11.01 11.01 0 0 0 23 11.5C23 5.24 18.27.5 12 .5z"/>
    </svg>
  );
}
