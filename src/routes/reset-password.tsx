import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { Eye, EyeOff, Loader2 } from "lucide-react";
import { useEffect, useState, type FormEvent } from "react";
import { supabase } from "@/lib/supabase";
import { brandName } from "@/lib/envoiz";
import { BrandLogo } from "@/components/BrandLogo";

export const Route = createFileRoute("/reset-password")({
  head: () => ({
    meta: [{ title: `Reset Password — ${brandName}` }],
  }),
  component: ResetPasswordPage,
});

function ResetPasswordPage() {
  const navigate = useNavigate();
  const [isRecovery, setIsRecovery] = useState(false);
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    const hashParams = new URLSearchParams(
      typeof window !== "undefined" ? window.location.hash.slice(1) : "",
    );
    const type = hashParams.get("type");
    if (type === "recovery") {
      setIsRecovery(true);
    } else {
      supabase.auth.getSession().then(({ data: { session } }) => {
        if (session) setIsRecovery(true);
      });
    }

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event) => {
      if (event === "PASSWORD_RECOVERY") {
        setIsRecovery(true);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);

    if (newPassword !== confirmPassword) {
      setError("Passwords don't match.");
      return;
    }
    if (newPassword.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }

    setLoading(true);
    try {
      const { error: updateError } = await supabase.auth.updateUser({
        password: newPassword,
      });
      if (updateError) throw updateError;
      setSuccess(true);
      setTimeout(() => navigate({ to: "/dashboard" }), 2000);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update password.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f8f8f7] flex flex-col items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <div className="mb-8 flex justify-center">
          <a href="/" className="hover:opacity-80 transition-opacity">
            <BrandLogo className="h-10 w-auto" />
          </a>
        </div>

        <div className="rounded-3xl border border-hairline bg-white p-8 shadow-[0_2px_16px_rgba(0,0,0,0.06)]">
          {success ? (
            <div className="text-center space-y-3">
              <div className="text-2xl">✓</div>
              <h1 className="text-[18px] font-semibold tracking-tight">Password updated!</h1>
              <p className="text-[13px] text-muted-foreground">Redirecting you to the dashboard…</p>
            </div>
          ) : !isRecovery ? (
            <div className="text-center space-y-3">
              <h1 className="text-[18px] font-semibold tracking-tight">Invalid reset link</h1>
              <p className="text-[13px] text-muted-foreground">
                This link has expired or is invalid. Please request a new password reset from the
                login page.
              </p>
              <a
                href="/login"
                className="inline-block mt-2 text-[13px] font-medium underline hover:opacity-70"
              >
                Back to login
              </a>
            </div>
          ) : (
            <>
              <div className="mb-6">
                <h1 className="text-[20px] font-semibold tracking-tight">Set a new password</h1>
                <p className="mt-1 text-[13px] text-muted-foreground">
                  Choose a strong password for your account.
                </p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-1.5">
                  <label
                    htmlFor="newPassword"
                    className="text-[12.5px] font-medium text-foreground"
                  >
                    New Password
                  </label>
                  <div className="relative">
                    <input
                      id="newPassword"
                      type={showPassword ? "text" : "password"}
                      required
                      minLength={8}
                      autoComplete="new-password"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder="At least 8 characters"
                      className="w-full h-11 pl-3.5 pr-10 rounded-lg bg-white border border-hairline text-[14px] placeholder:text-muted-foreground/70 focus:outline-none focus:ring-2 focus:ring-black/10 focus:border-black/30 transition"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword((v) => !v)}
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 h-7 w-7 grid place-items-center rounded-md text-muted-foreground hover:text-foreground hover:bg-secondary transition"
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label
                    htmlFor="confirmPassword"
                    className="text-[12.5px] font-medium text-foreground"
                  >
                    Confirm Password
                  </label>
                  <input
                    id="confirmPassword"
                    type={showPassword ? "text" : "password"}
                    required
                    minLength={8}
                    autoComplete="new-password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Re-enter your password"
                    className="w-full h-11 px-3.5 rounded-lg bg-white border border-hairline text-[14px] placeholder:text-muted-foreground/70 focus:outline-none focus:ring-2 focus:ring-black/10 focus:border-black/30 transition"
                  />
                </div>

                {error && (
                  <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-[13px] leading-relaxed text-rose-700">
                    {error}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full h-11 inline-flex items-center justify-center gap-2 rounded-lg bg-black text-white text-[14px] font-medium hover:bg-black/85 transition-colors shadow-[0_8px_24px_rgba(0,0,0,0.18)] disabled:opacity-70 disabled:cursor-not-allowed"
                >
                  {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Update password"}
                </button>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
