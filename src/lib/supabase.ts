import { createClient } from "@supabase/supabase-js";
import { createRequire } from "module";

// Node.js 20 (Replit's runtime) lacks native WebSocket.
// TanStack Start evaluates this module on the server during SSR, so we
// polyfill globalThis.WebSocket with the "ws" package before the Supabase
// Realtime client is initialised (it checks for WebSocket in its constructor).
if (typeof WebSocket === "undefined") {
  try {
    const require = createRequire(import.meta.url);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (globalThis as any).WebSocket = require("ws");
  } catch {
    // ws package not installed; realtime subscriptions will not work server-side
  }
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
