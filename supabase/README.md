# Supabase setup

This project expects a Supabase schema with:

- `public.envoiz_invoices`
- `public.envoiz_invoice_items`
- `storage` bucket named `avatars`

Apply the migration in [`migrations/202608020001_envoiz_core.sql`](./migrations/202608020001_envoiz_core.sql) to enable:

- Row Level Security for invoice tables
- owner-scoped invoice item access
- avatar storage policies
- the `tax_rate` column on `envoiz_invoices`

The frontend assumes these environment variables are set:

- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`
- `SESSION_SECRET`
