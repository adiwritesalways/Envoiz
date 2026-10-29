-- Create a secure RPC to delete the authenticated user and their data
CREATE OR REPLACE FUNCTION public.delete_user()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  target_user_id uuid := auth.uid();
BEGIN
  IF target_user_id IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;

  -- Delete application data
  -- (Assuming envoiz_invoice_items cascades from envoiz_invoices, but we explicitly delete invoices here)
  DELETE FROM public.envoiz_invoices WHERE user_id = target_user_id;

  -- Delete the user from auth.users
  -- This will cascade to delete the user's sessions and identities
  DELETE FROM auth.users WHERE id = target_user_id;
END;
$$;

GRANT EXECUTE ON FUNCTION public.delete_user() TO authenticated;
