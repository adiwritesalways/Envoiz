-- Store pre-signup invoice drafts in Supabase instead of browser storage.

CREATE TABLE IF NOT EXISTS public.envoiz_invoice_drafts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  draft_token UUID NOT NULL UNIQUE,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  payload JSONB NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  claimed_at TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS envoiz_invoice_drafts_user_id_idx
  ON public.envoiz_invoice_drafts(user_id);

ALTER TABLE public.envoiz_invoice_drafts ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename = 'envoiz_invoice_drafts'
      AND policyname = 'Anyone can create invoice drafts'
  ) THEN
    CREATE POLICY "Anyone can create invoice drafts"
      ON public.envoiz_invoice_drafts
      FOR INSERT
      WITH CHECK (draft_token IS NOT NULL);
  END IF;
END
$$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename = 'envoiz_invoice_drafts'
      AND policyname = 'Users can view their own invoice drafts'
  ) THEN
    CREATE POLICY "Users can view their own invoice drafts"
      ON public.envoiz_invoice_drafts
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
      AND tablename = 'envoiz_invoice_drafts'
      AND policyname = 'Users can update their own invoice drafts'
  ) THEN
    CREATE POLICY "Users can update their own invoice drafts"
      ON public.envoiz_invoice_drafts
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
      AND tablename = 'envoiz_invoice_drafts'
      AND policyname = 'Users can delete their own invoice drafts'
  ) THEN
    CREATE POLICY "Users can delete their own invoice drafts"
      ON public.envoiz_invoice_drafts
      FOR DELETE
      USING (auth.uid() = user_id);
  END IF;
END
$$;

CREATE OR REPLACE FUNCTION public.claim_envoiz_invoice_draft(draft_token UUID)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  claimed_payload JSONB;
BEGIN
  UPDATE public.envoiz_invoice_drafts
  SET user_id = auth.uid(),
      claimed_at = now()
  WHERE public.envoiz_invoice_drafts.draft_token = claim_envoiz_invoice_draft.draft_token
    AND (public.envoiz_invoice_drafts.user_id IS NULL OR public.envoiz_invoice_drafts.user_id = auth.uid())
  RETURNING payload INTO claimed_payload;

  RETURN claimed_payload;
END;
$$;
