-- Envoiz invoice integrity, atomic writes, and server-side invoice numbering.
-- Assumes the existing public.envoiz_invoices and public.envoiz_invoice_items tables
-- contain the columns used by the current frontend.

ALTER TABLE public.envoiz_invoices
  ADD COLUMN IF NOT EXISTS user_invoice_seq INTEGER,
  ADD COLUMN IF NOT EXISTS subtotal NUMERIC DEFAULT 0,
  ADD COLUMN IF NOT EXISTS total NUMERIC DEFAULT 0,
  ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT now();

CREATE UNIQUE INDEX IF NOT EXISTS envoiz_invoices_user_invoice_number_key
  ON public.envoiz_invoices (user_id, invoice_number)
  WHERE invoice_number IS NOT NULL;

CREATE UNIQUE INDEX IF NOT EXISTS envoiz_invoices_user_invoice_seq_key
  ON public.envoiz_invoices (user_id, user_invoice_seq)
  WHERE user_invoice_seq IS NOT NULL;

CREATE INDEX IF NOT EXISTS envoiz_invoices_user_created_idx
  ON public.envoiz_invoices (user_id, created_at DESC);

CREATE INDEX IF NOT EXISTS envoiz_invoice_items_invoice_id_idx
  ON public.envoiz_invoice_items (invoice_id);

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'envoiz_invoice_items_invoice_id_fkey'
  ) THEN
    ALTER TABLE public.envoiz_invoice_items
      ADD CONSTRAINT envoiz_invoice_items_invoice_id_fkey
      FOREIGN KEY (invoice_id)
      REFERENCES public.envoiz_invoices(id)
      ON DELETE CASCADE;
  END IF;
END
$$;

CREATE OR REPLACE FUNCTION public.next_envoiz_invoice_number(target_user_id UUID)
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  next_seq INTEGER;
BEGIN
  IF auth.uid() IS NULL OR auth.uid() <> target_user_id THEN
    RAISE EXCEPTION 'Not authorized to generate invoice numbers';
  END IF;

  SELECT COALESCE(MAX(user_invoice_seq), 0) + 1
    INTO next_seq
  FROM public.envoiz_invoices
  WHERE user_id = target_user_id;

  RETURN 'ENV-' || LPAD(next_seq::TEXT, 6, '0');
END;
$$;

CREATE OR REPLACE FUNCTION public.upsert_envoiz_invoice(
  invoice_payload JSONB,
  item_payload JSONB
)
RETURNS public.envoiz_invoices
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  target_user_id UUID := auth.uid();
  target_invoice_id UUID;
  next_seq INTEGER;
  saved_invoice public.envoiz_invoices;
  calculated_subtotal NUMERIC := 0;
  calculated_total NUMERIC := 0;
BEGIN
  IF target_user_id IS NULL THEN
    RAISE EXCEPTION 'Authentication required';
  END IF;

  IF jsonb_typeof(item_payload) <> 'array' THEN
    RAISE EXCEPTION 'Invoice items must be an array';
  END IF;

  SELECT COALESCE(SUM(
    GREATEST(0, COALESCE((item->>'quantity')::NUMERIC, 0))
    * GREATEST(0, COALESCE((item->>'unit_price')::NUMERIC, 0))
  ), 0)
    INTO calculated_subtotal
  FROM jsonb_array_elements(item_payload) item;

  calculated_total :=
    GREATEST(
      0,
      calculated_subtotal
      - LEAST(GREATEST(0, COALESCE((invoice_payload->>'discount')::NUMERIC, 0)), calculated_subtotal)
    );
  calculated_total := calculated_total
    + calculated_total * (LEAST(GREATEST(0, COALESCE((invoice_payload->>'tax_rate')::NUMERIC, 0)), 100) / 100);

  target_invoice_id := NULLIF(invoice_payload->>'id', '')::UUID;

  IF target_invoice_id IS NOT NULL THEN
    UPDATE public.envoiz_invoices
    SET
      client_name = invoice_payload->>'client_name',
      client_email = invoice_payload->>'client_email',
      billing_address = invoice_payload->>'billing_address',
      issue_date = NULLIF(invoice_payload->>'issue_date', '')::DATE,
      due_date = NULLIF(invoice_payload->>'due_date', '')::DATE,
      payment_status = COALESCE(invoice_payload->>'payment_status', payment_status),
      currency = COALESCE(invoice_payload->>'currency', currency),
      company_name = invoice_payload->>'company_name',
      company_address = invoice_payload->>'company_address',
      discount = COALESCE((invoice_payload->>'discount')::NUMERIC, 0),
      tax_rate = COALESCE((invoice_payload->>'tax_rate')::NUMERIC, 0),
      notes = invoice_payload->>'notes',
      subtotal = calculated_subtotal,
      total = calculated_total,
      updated_at = now()
    WHERE id = target_invoice_id
      AND user_id = target_user_id
    RETURNING * INTO saved_invoice;

    IF saved_invoice.id IS NULL THEN
      RAISE EXCEPTION 'Invoice not found or not owned by current user';
    END IF;

    DELETE FROM public.envoiz_invoice_items WHERE invoice_id = saved_invoice.id;
  ELSE
    SELECT COALESCE(MAX(user_invoice_seq), 0) + 1
      INTO next_seq
    FROM public.envoiz_invoices
    WHERE user_id = target_user_id;

    INSERT INTO public.envoiz_invoices (
      user_id,
      user_invoice_seq,
      invoice_number,
      client_name,
      client_email,
      billing_address,
      issue_date,
      due_date,
      payment_status,
      currency,
      company_name,
      company_address,
      discount,
      tax_rate,
      notes,
      subtotal,
      total
    )
    VALUES (
      target_user_id,
      next_seq,
      'ENV-' || LPAD(next_seq::TEXT, 6, '0'),
      invoice_payload->>'client_name',
      invoice_payload->>'client_email',
      invoice_payload->>'billing_address',
      NULLIF(invoice_payload->>'issue_date', '')::DATE,
      NULLIF(invoice_payload->>'due_date', '')::DATE,
      COALESCE(invoice_payload->>'payment_status', 'Pending'),
      COALESCE(invoice_payload->>'currency', 'USD'),
      invoice_payload->>'company_name',
      invoice_payload->>'company_address',
      COALESCE((invoice_payload->>'discount')::NUMERIC, 0),
      COALESCE((invoice_payload->>'tax_rate')::NUMERIC, 0),
      invoice_payload->>'notes',
      calculated_subtotal,
      calculated_total
    )
    RETURNING * INTO saved_invoice;
  END IF;

  INSERT INTO public.envoiz_invoice_items (invoice_id, product, quantity, unit_price)
  SELECT
    saved_invoice.id,
    item->>'product',
    GREATEST(0, COALESCE((item->>'quantity')::NUMERIC, 0)),
    GREATEST(0, COALESCE((item->>'unit_price')::NUMERIC, 0))
  FROM jsonb_array_elements(item_payload) item;

  RETURN saved_invoice;
END;
$$;

GRANT EXECUTE ON FUNCTION public.next_envoiz_invoice_number(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION public.upsert_envoiz_invoice(JSONB, JSONB) TO authenticated;
