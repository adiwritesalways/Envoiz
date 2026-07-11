import { type Session } from "@supabase/supabase-js";
import { useEffect, useState, type ReactNode } from "react";

import { AuthContext } from "@/components/auth/auth-context";
import { supabase } from "@/lib/supabase";

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;

    void supabase.auth
      .getSession()
      .then(({ data }) => {
        if (!active) return;
        setSession(data.session);
      })
      .catch((error) => {
        console.error("Unable to restore Supabase session", error);
      })
      .finally(() => {
        if (active) {
          setLoading(false);
        }
      });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, nextSession) => {
      setSession(nextSession);
      setLoading(false);

      // Detect brand-new OAuth accounts (Google / GitHub).
      // Email signups stamp onboarding_pending at signUp() call time.
      // OAuth signups have no equivalent hook, so we infer "new account"
      // by checking whether created_at is within the last 2 minutes and
      // neither onboarding flag has been set yet.
      if (event === "SIGNED_IN" && nextSession?.user) {
        const u = nextSession.user;
        const ageMs = Date.now() - new Date(u.created_at).getTime();
        const isNew = ageMs < 120_000; // 2 minutes
        const alreadyFlagged =
          u.user_metadata?.onboarding_pending ||
          u.user_metadata?.onboarding_complete;
        if (isNew && !alreadyFlagged) {
          void supabase.auth.updateUser({ data: { onboarding_pending: true } });
        }
      }
    });

    return () => {
      active = false;
      subscription.unsubscribe();
    };
  }, []);

  const refreshSession = async () => {
    setLoading(true);
    try {
      const { data } = await supabase.auth.getSession();
      setSession(data.session);
    } finally {
      setLoading(false);
    }
  };

  const signOut = async () => {
    await supabase.auth.signOut();
  };

  return (
    <AuthContext.Provider
      value={{
        session,
        user: session?.user ?? null,
        loading,
        refreshSession,
        signOut,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}
