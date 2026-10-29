/**
 * demo-mode.ts
 *
 * Utilities for detecting and managing the public demo mode.
 * When a user visits /dashboard without being logged in, the app renders
 * a fully functional demo with local sample data instead of redirecting to /login.
 */

import { DEMO_USER_META } from "@/lib/demo-data";
import type { User, Session } from "@supabase/supabase-js";

/** Returns true when there is no real Supabase session. */
export function isDemoMode(session: Session | null, loading: boolean): boolean {
  return !loading && !session;
}

/**
 * A fake Supabase User-shaped object used to satisfy components that call useAuth().
 * Only safe to use in demo mode — none of the IDs are real.
 */
export const DEMO_USER: User = {
  id: "demo-user-00000000-0000-0000-0000-000000000000",
  aud: "authenticated",
  role: "authenticated",
  email: DEMO_USER_META.email,
  email_confirmed_at: "2025-01-01T00:00:00Z",
  phone: "",
  confirmed_at: "2025-01-01T00:00:00Z",
  last_sign_in_at: new Date().toISOString(),
  app_metadata: {
    provider: "email",
    providers: ["email"],
    is_pro: true,
  },
  user_metadata: {
    full_name: DEMO_USER_META.full_name,
    company_name: DEMO_USER_META.company_name,
    default_currency: DEMO_USER_META.default_currency,
    is_pro: true,
    pro_since: DEMO_USER_META.pro_since,
    onboarding_complete: true,
  },
  identities: [],
  created_at: "2025-01-01T00:00:00Z",
  updated_at: new Date().toISOString(),
  is_anonymous: false,
};

export const DEMO_BANNER_MESSAGE =
  "🎭 Demo mode — all data is sample data and is not saved to any server.";
