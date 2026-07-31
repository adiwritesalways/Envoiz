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

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
      if (event === "PASSWORD_RECOVERY") setIsRecovery(true);
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    if (newPassword !== confirmPassword) { setError("Passwords don't match."); return; }
    if (newPassword.length < 8) { setError("Password must be at least 8 characters."); return; }
    setLoading(true);
    try {
      const { error: updateError } = await supabase.auth.updateUser({ password: newPassword });
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
    <div className="relative min-h-screen bg-[#050505] text-[#F5F5F5] font-sans antialiased">
      <div className="pointer-events-none fixed inset-x-0 top-0 z-0 flex justify-center overflow-hidden">
        <div className="h-[500px] w-[900px] -translate-y-1/3 rounded-full bg-white/[0.03] blur-[140px]" />
      </div>
      <main className="relative mx-auto flex min-h-screen w-full max-w-[440px] items-center px-4 py-10 sm:px-6">
        <section className="w-full animate-fade-up">
          <div className="mb-8 text-center">
            <a href="/" className="inline-flex items-center justify-center hover:opacity-80 transition-opacity" aria-label="Envoiz">
              <BrandLogo className="h-14 w-auto invert" />
            </a>
          </div>
          <div className="rounded-[2rem] border border-[#1A1A1A] bg-[#0D0D0D] p-6 sm:p-8">
            {success ? (
              <div className="text-center space-y-3">
                <div className="text-2xl">✓</div>
                <h1 className="text-[18px] font-semibold tracking-tight">Password updated!</h1>
                <p className="text-[13px] text-[#888888]">Redirecting you to the dashboard…</p>
              </div>
            ) : !isRecovery ? (
              <div className="text-center space-y-3">
                <h1 className="text-[18px] font-semibold tracking-tight">Invalid reset link</h1>
                <p className="text-[13px] text-[#888888]">
                  This link has expired or is invalid. Please request a new password reset from the login page.
                </p>
                <a href="/login" className="inline-block mt-2 text-[13px] font-medium underline hover:opacity-70">
                  Back to login
                </a>
              </div>
            ) : (
              <>
                <div className="mb-6">
                  <h1 className="text-[20px] font-semibold tracking-tight">Set a new password</h1>
                  <p className="mt-1 text-[13px] text-[#888888]">Choose a strong password for your account.</p>
                </div>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="space-y-1.5">
                    <label htmlFor="newPassword" className="text-[12.5px] font-medium text-white">New Password</label>
                    <div className="relative">
                      <input
                        id="newPassword"
                        type={showPassword ? "text" : "password"}
                        required minLength={8} autoComplete="new-password"
                        value={newPassword} onChange={(e) => setNewPassword(e.target.value)}
                        placeholder="At least 8 characters"
                        className="w-full h-11 pl-3.5 pr-10 rounded-lg bg-[#0D0D0D] border border-[#2A2A2A] text-white text-[14px] placeholder:text-[#555555] focus:outline-none focus:border-[#555555] transition"
                      />
                      <button type="button" onClick={() => setShowPassword((v) => !v)} aria-label={showPassword ? "Hide password" : "Show password"}
                        className="absolute right-2.5 top-1/2 -translate-y-1/2 h-7 w-7 grid place-items-center rounded-md text-[#888888] hover:text-white hover:bg-[#1A1A1A] transition">
                        {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                  </div>
                  <div className="space-y-1.5">
                    <label htmlFor="confirmPassword" className="text-[12.5px] font-medium text-white">Confirm Password</label>
                    <input
                      id="confirmPassword"
                      type={showPassword ? "text" : "password"}
                      required minLength={8} autoComplete="new-password"
                      value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="Re-enter your password"
                      className="w-full h-11 px-3.5 rounded-lg bg-[#0D0D0D] border border-[#2A2A2A] text-white text-[14px] placeholder:text-[#555555] focus:outline-none focus:border-[#555555] transition"
                    />
                  </div>
                  {error && (
                    <div className="rounded-2xl border border-rose-900/50 bg-rose-950/20 px-4 py-3 text-[13px] leading-relaxed text-rose-400">{error}</div>
                  )}
                  <button type="submit" disabled={loading}
                    className="w-full h-11 inline-flex items-center justify-center gap-2 rounded-lg bg-white text-black text-[14px] font-bold hover:bg-[#e0e0e0] active:bg-[#cccccc] transition-colors disabled:opacity-70 disabled:cursor-not-allowed">
                    {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Update password"}
                  </button>
                </form>
              </>
            )}
          </div>
        </section>
      </main>
    </div>
  );
}
