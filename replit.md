# Envoiz

Smart invoicing app for freelancers and businesses. Built with TanStack Start (SSR), React 19, TypeScript, Tailwind CSS v4, Supabase (auth + database), and shadcn/ui components.

## Running the app

```bash
npm run dev   # starts the dev server on port 5000
```

The workflow "Start application" runs `npm run dev` automatically.

## Stack

- **Framework**: TanStack Start (SSR) + TanStack Router
- **Styling**: Tailwind CSS v4 via `@tailwindcss/vite`
- **UI components**: shadcn/ui (Radix primitives)
- **Backend**: Supabase — auth + two tables: `envoiz_invoices`, `envoiz_invoice_items`
- **PDF export**: `@react-pdf/renderer`
- **PNG export**: `html2canvas-pro`
- **Build config**: `@lovable.dev/vite-tanstack-config` (wraps Vite + Nitro)

## Supabase tables

| Table | Key columns |
|---|---|
| `envoiz_invoices` | `id`, `user_id`, `invoice_number`, `client_name`, `client_email`, `billing_address`, `issue_date`, `due_date`, `payment_status`, `currency`, `company_name`, `company_address`, `discount`, `notes` |
| `envoiz_invoice_items` | `id`, `invoice_id`, `product`, `quantity`, `unit_price` |

RLS policies must allow authenticated users to SELECT, INSERT, UPDATE, DELETE their own rows (filter by `user_id`).

## Environment variables

| Variable | Purpose |
|---|---|
| `VITE_SUPABASE_URL` | Supabase project URL |
| `VITE_SUPABASE_ANON_KEY` | Supabase anon/public key |
| `SESSION_SECRET` | Session signing secret |

## Replit-specific notes

- The `@lovable.dev/vite-tanstack-config` package defaults to IPv6 (`::`) on port 8080. On Replit (IPv4 only), this is overridden in `vite.config.ts` to `host: "0.0.0.0", port: 5000`.
- Node.js 20 (Replit default) lacks native WebSocket. `src/lib/supabase.ts` polyfills `globalThis.WebSocket` with the `ws` package before the Supabase Realtime client initialises during SSR.

## User preferences

- Push code changes directly to GitHub (origin remote: https://github.com/adiwritesalways/Envoiz)
