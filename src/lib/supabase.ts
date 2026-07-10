import { createClient } from "@supabase/supabase-js";

// Node.js 20 (Replit's runtime) lacks native WebSocket.
// This block only runs during SSR — import.meta.env.SSR is replaced with
// `false` at build time for browser bundles, dead-code eliminating the ws import.
if (import.meta.env.SSR && typeof WebSocket === "undefined") {
  const { default: ws } = await import("ws");
  (globalThis as any).WebSocket = ws; // eslint-disable-line @typescript-eslint/no-explicit-any
}

export const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL!,
  import.meta.env.VITE_SUPABASE_ANON_KEY!,
  {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true,
      flowType: "pkce",
    },
  },
);
