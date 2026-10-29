import { createClient } from "@supabase/supabase-js";

// Node.js 20 has no native WebSocket. Polyfill before createClient runs so
// @supabase/realtime-js can initialise without throwing during SSR.
// import.meta.env.SSR is replaced with `false` in the browser build by Vite,
// so the entire block is dead code and the `ws` package never enters the client bundle.
if (import.meta.env.SSR && typeof globalThis.WebSocket === "undefined") {
  const { WebSocket: WS } = await import("ws");
  // @ts-expect-error ws exports a WebSocket compatible with the Supabase realtime client
  globalThis.WebSocket = WS;
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
