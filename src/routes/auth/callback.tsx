import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";

import { supabase } from "@/lib/supabase";

export const Route = createFileRoute("/auth/callback")({
  component: AuthCallbackPage,
});

function AuthCallbackPage() {
  const [message, setMessage] = useState("Finishing sign in…");

  useEffect(() => {
    let active = true;
    const finish = async () => {
      try {
        const { data, error } = await supabase.auth.getSession();
        if (error) throw error;
        if (!data.session) throw new Error("No active session was returned.");
        const account = data.session.user;
        const metadata = account.user_metadata || {};
        const createdRecently = Date.now() - new Date(account.created_at).getTime() < 120_000;
        if (createdRecently && !metadata.onboarding_pending && !metadata.onboarding_complete) {
          const { error: onboardingError } = await supabase.auth.updateUser({
            data: { onboarding_pending: true },
          });
          if (onboardingError) throw onboardingError;
        }
        window.location.replace("/dashboard");
      } catch (error) {
        console.error("Auth callback failed", error);
        if (active)
          setMessage("We couldn't finish signing you in. Please return to sign in and try again.");
      }
    };
    void finish();
    return () => {
      active = false;
    };
  }, []);

  return (
    <main className="grid min-h-screen place-items-center bg-background px-6 text-center">
      <div className="max-w-sm">
        <div className="mx-auto mb-4 grid h-10 w-10 place-items-center rounded-full border border-border text-sm font-semibold">
          E
        </div>
        <p className="text-sm text-muted-foreground">{message}</p>
        {message.startsWith("We couldn't") && (
          <a
            className="mt-5 inline-flex rounded-lg bg-foreground px-4 py-2 text-sm text-background"
            href="/login"
          >
            Return to sign in
          </a>
        )}
      </div>
    </main>
  );
}
