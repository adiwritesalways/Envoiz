import { createFileRoute, Link } from "@tanstack/react-router";
import { Loader2 } from "lucide-react";
import { useEffect, useState } from "react";
import { BrandLogo } from "@/components/BrandLogo";
import { brandName } from "@/lib/envoiz";
import { supabase } from "@/lib/supabase";

export const Route = createFileRoute("/confirm-email-change")({
  head: () => ({
    meta: [{ title: `Confirm Email Change — ${brandName}` }],
  }),
  component: ConfirmEmailChangePage,
});

type Status = "detecting" | "success" | "invalid";

function ConfirmEmailChangePage() {
  const [status, setStatus] = useState<Status>("detecting");

  useEffect(() => {
    const hashParams = new URLSearchParams(
      typeof window !== "undefined" ? window.location.hash.slice(1) : "",
    );
    if (hashParams.get("type") === "email_change") { setStatus("success"); return; }

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
      if (event === "USER_UPDATED") setStatus("success");
    });

    const timer = setTimeout(() => {
      setStatus((current) => (current === "detecting" ? "invalid" : current));
    }, 4000);

    return () => { subscription.unsubscribe(); clearTimeout(timer); };
  }, []);

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
            {status === "detecting" && <DetectingState />}
            {status === "success" && <SuccessState />}
            {status === "invalid" && <InvalidState />}
          </div>
        </section>
      </main>
    </div>
  );
}

function DetectingState() {
  return (
    <div className="flex flex-col items-center text-center space-y-3 py-4">
      <Loader2 className="h-6 w-6 animate-spin text-[#888888]" />
      <p className="text-[14px] text-[#888888]">Confirming your email change…</p>
    </div>
  );
}

function SuccessState() {
  return (
    <div className="text-center space-y-3">
      <div className="text-2xl">✓</div>
      <h1 className="text-[18px] font-semibold tracking-tight">Email address updated</h1>
      <p className="text-[13px] text-[#888888] leading-relaxed">
        Your account email has been changed. You can now sign in with your new address.
      </p>
      <div className="pt-2">
        <Link to="/dashboard" className="inline-flex items-center justify-center rounded-lg bg-white px-5 py-2.5 text-[13px] font-bold text-black hover:bg-[#e0e0e0] transition-colors">
          Go to Dashboard →
        </Link>
      </div>
    </div>
  );
}

function InvalidState() {
  return (
    <div className="text-center space-y-3">
      <div className="text-2xl">✗</div>
      <h1 className="text-[18px] font-semibold tracking-tight">Invalid or expired link</h1>
      <p className="text-[13px] text-[#888888] leading-relaxed">
        This confirmation link may have already been used or has expired. Request a new one from your settings.
      </p>
      <div className="pt-2">
        <Link to="/dashboard/settings" className="inline-flex items-center justify-center rounded-lg border border-[#2A2A2A] bg-[#0D0D0D] px-5 py-2.5 text-[13px] font-medium text-white hover:bg-[#1A1A1A] transition-colors">
          Back to Settings
        </Link>
      </div>
    </div>
  );
}
