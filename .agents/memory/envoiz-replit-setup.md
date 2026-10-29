---
name: Replit Envoiz setup quirks
description: Fixes required to run this TanStack Start + @lovable.dev/vite-tanstack-config app on Replit
---

## IPv6 → IPv4 fix
`@lovable.dev/vite-tanstack-config` defaults to `host: "::"` (IPv6) + `port: 8080` outside Lovable sandbox.
Replit only supports IPv4. Fix: add to `vite.config.ts`:
```ts
vite: { server: { host: "0.0.0.0", port: 5000 } }
```
The user-supplied config wins via `mergeConfig(defaults, userConfig)` when `isSandbox` is false.

**Why:** Replit containers don't support IPv6 — `EAFNOSUPPORT: address family not supported :::8080`.

## Node.js 20 WebSocket (SSR) fix
TanStack Start evaluates `src/lib/supabase.ts` server-side. Supabase Realtime client throws on init in Node 20 (no native WebSocket). Fix in `src/lib/supabase.ts`:
```ts
import { createRequire } from "module";
if (typeof WebSocket === "undefined") {
  try {
    const require = createRequire(import.meta.url);
    (globalThis as any).WebSocket = require("ws");
  } catch {}
}
```
Requires `ws` package installed (`npm install ws @types/ws`).

**Why:** `@supabase/realtime-js` checks `WebSocket` in its constructor and throws if absent.

## Workflow command
`npm run dev` on port 5000, webview output type.
