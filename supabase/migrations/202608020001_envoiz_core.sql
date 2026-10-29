-- Envoiz core database setup
-- Apply this migration in Supabase to keep the frontend, RLS, and storage rules reproducible.

ALTER TABLE public.envoiz_invoices
  ADD COLUMN IF NOT EXISTS tax_rate NUMERIC DEFAULT 0;

ALTER TABLE public.envoiz_invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.envoiz_invoice_items ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename = 'envoiz_invoices'
      AND policyname = 'Users can view their own invoices'
  ) THEN
    CREATE POLICY "Users can view their own invoices"
      ON public.envoiz_invoices
      FOR SELECT
      USING (auth.uid() = user_id);
  END IF;
END
$$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename = 'envoiz_invoices'
      AND policyname = 'Users can insert their own invoices'
  ) THEN
    CREATE POLICY "Users can insert their own invoices"
      ON public.envoiz_invoices
      FOR INSERT
      WITH CHECK (auth.uid() = user_id);
  END IF;
END
$$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename = 'envoiz_invoices'
      AND policyname = 'Users can update their own invoices'
  ) THEN
    CREATE POLICY "Users can update their own invoices"
      ON public.envoiz_invoices
      FOR UPDATE
      USING (auth.uid() = user_id)
      WITH CHECK (auth.uid() = user_id);
  END IF;
END
$$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename = 'envoiz_invoices'
      AND policyname = 'Users can delete their own invoices'
  ) THEN
    CREATE POLICY "Users can delete their own invoices"
      ON public.envoiz_invoices
      FOR DELETE
      USING (auth.uid() = user_id);
  END IF;
END
$$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename = 'envoiz_invoice_items'
      AND policyname = 'Users can view their own invoice items'
  ) THEN
    CREATE POLICY "Users can view their own invoice items"
      ON public.envoiz_invoice_items
      FOR SELECT
      USING (
        invoice_id IN (
          SELECT id
          FROM public.envoiz_invoices
          WHERE user_id = auth.uid()
        )
      );
  END IF;
END
$$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename = 'envoiz_invoice_items'
      AND policyname = 'Users can insert their own invoice items'
  ) THEN
    CREATE POLICY "Users can insert their own invoice items"
      ON public.envoiz_invoice_items
      FOR INSERT
      WITH CHECK (
        invoice_id IN (
          SELECT id
          FROM public.envoiz_invoices
          WHERE user_id = auth.uid()
        )
      );
  END IF;
END
$$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename = 'envoiz_invoice_items'
      AND policyname = 'Users can update their own invoice items'
  ) THEN
    CREATE POLICY "Users can update their own invoice items"
      ON public.envoiz_invoice_items
      FOR UPDATE
      USING (
        invoice_id IN (
          SELECT id
          FROM public.envoiz_invoices
          WHERE user_id = auth.uid()
        )
      )
      WITH CHECK (
        invoice_id IN (
          SELECT id
          FROM public.envoiz_invoices
          WHERE user_id = auth.uid()
        )
      );
  END IF;
END
$$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename = 'envoiz_invoice_items'
      AND policyname = 'Users can delete their own invoice items'
  ) THEN
    CREATE POLICY "Users can delete their own invoice items"
      ON public.envoiz_invoice_items
      FOR DELETE
      USING (
        invoice_id IN (
          SELECT id
          FROM public.envoiz_invoices
          WHERE user_id = auth.uid()
        )
      );
  END IF;
END
$$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_policies
    WHERE schemaname = 'storage'
      AND tablename = 'objects'
      AND policyname = 'Users can upload avatar images'
  ) THEN
    CREATE POLICY "Users can upload avatar images"
      ON storage.objects
      FOR INSERT
      WITH CHECK (
        bucket_id = 'avatars'
        AND auth.uid()::text = owner
      );
  END IF;
END
$$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_policies
    WHERE schemaname = 'storage'
      AND tablename = 'objects'
      AND policyname = 'Users can update avatar images'
  ) THEN
    CREATE POLICY "Users can update avatar images"
      ON storage.objects
      FOR UPDATE
      USING (
        bucket_id = 'avatars'
        AND auth.uid()::text = owner
      )
      WITH CHECK (
        bucket_id = 'avatars'
        AND auth.uid()::text = owner
      );
  END IF;
END
$$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_policies
    WHERE schemaname = 'storage'
      AND tablename = 'objects'
      AND policyname = 'Users can delete avatar images'
  ) THEN
    CREATE POLICY "Users can delete avatar images"
      ON storage.objects
      FOR DELETE
      USING (
        bucket_id = 'avatars'
        AND auth.uid()::text = owner
      );
  END IF;
END
$$;
