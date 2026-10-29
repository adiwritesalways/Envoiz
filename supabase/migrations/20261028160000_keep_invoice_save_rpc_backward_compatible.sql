-- Keep the previous RPC signature available during frontend rollouts. It
-- delegates to the validated current function and simply omits the optional
-- exchange-rate snapshot for older clients.
create or replace function public.save_envoiz_invoice(
  p_invoice_id uuid,
  p_client_name text,
  p_client_email text,
  p_billing_address text,
  p_issue_date date,
  p_due_date date,
  p_payment_status text,
  p_currency text,
  p_discount numeric,
  p_notes text,
  p_company_name text,
  p_company_address text,
  p_items jsonb
)
returns jsonb
language sql
security definer
set search_path = public, pg_temp
as $function$
  select public.save_envoiz_invoice(
    p_invoice_id,
    p_client_name,
    p_client_email,
    p_billing_address,
    p_issue_date,
    p_due_date,
    p_payment_status,
    p_currency,
    null,
    p_discount,
    p_notes,
    p_company_name,
    p_company_address,
    p_items
  );
$function$;

revoke all on function public.save_envoiz_invoice(uuid,text,text,text,date,date,text,text,numeric,text,text,text,jsonb) from public, anon;
grant execute on function public.save_envoiz_invoice(uuid,text,text,text,date,date,text,text,numeric,text,text,text,jsonb) to authenticated;
