-- Preserve the exchange rate used for a newly saved invoice so dashboard
-- reporting does not change when current market rates change.
alter table public.envoiz_invoices
  add column if not exists exchange_rate_to_usd numeric;

alter table public.envoiz_invoices
  drop constraint if exists envoiz_invoices_exchange_rate_to_usd_check;
alter table public.envoiz_invoices
  add constraint envoiz_invoices_exchange_rate_to_usd_check
  check (exchange_rate_to_usd is null or (exchange_rate_to_usd > 0 and exchange_rate_to_usd <= 1000000));

drop function if exists public.save_envoiz_invoice(uuid,text,text,text,date,date,text,text,numeric,text,text,text,jsonb);

create or replace function public.save_envoiz_invoice(
  p_invoice_id uuid,
  p_client_name text,
  p_client_email text,
  p_billing_address text,
  p_issue_date date,
  p_due_date date,
  p_payment_status text,
  p_currency text,
  p_exchange_rate_to_usd numeric,
  p_discount numeric,
  p_notes text,
  p_company_name text,
  p_company_address text,
  p_items jsonb
)
returns jsonb
language plpgsql
security definer
set search_path = public, pg_temp
as $function$
declare
  v_user_id uuid := (select auth.uid());
  v_invoice_id uuid;
  v_invoice_number text;
  v_subtotal numeric;
begin
  if v_user_id is null then raise exception 'Authentication is required.' using errcode = '28000'; end if;
  if p_client_name is null or length(trim(p_client_name)) = 0 or length(p_client_name) > 200 then raise exception 'Enter a client name (up to 200 characters).' using errcode = '22023'; end if;
  if p_client_email is not null and length(p_client_email) > 320 then raise exception 'Client email is too long.' using errcode = '22023'; end if;
  if p_issue_date is null or p_due_date is null or p_due_date < p_issue_date then raise exception 'Enter valid invoice and due dates.' using errcode = '22023'; end if;
  if p_payment_status is null or p_payment_status not in ('Draft', 'Paid', 'Due', 'Overdue') then raise exception 'Choose a valid invoice status.' using errcode = '22023'; end if;
  if p_currency is null or p_currency !~ '^[A-Z]{3}$' then raise exception 'Choose a valid currency code.' using errcode = '22023'; end if;
  if p_exchange_rate_to_usd is not null and (p_exchange_rate_to_usd <= 0 or p_exchange_rate_to_usd > 1000000) then raise exception 'Enter a valid exchange rate.' using errcode = '22023'; end if;
  if coalesce(p_discount, 0) < 0 or coalesce(p_discount, 0) > 1000000000000 then raise exception 'Enter a valid discount.' using errcode = '22023'; end if;
  if length(coalesce(p_notes, '')) > 5000 or length(coalesce(p_company_name, '')) > 200 or length(coalesce(p_company_address, '')) > 1000 or length(coalesce(p_billing_address, '')) > 1000 then raise exception 'One or more invoice fields are too long.' using errcode = '22023'; end if;
  if p_items is null or jsonb_typeof(p_items) <> 'array' or jsonb_array_length(p_items) = 0 or jsonb_array_length(p_items) > 100 then raise exception 'An invoice must have between 1 and 100 line items.' using errcode = '22023'; end if;
  select coalesce(sum((item->>'quantity')::numeric * (item->>'unit_price')::numeric), 0) into v_subtotal from jsonb_array_elements(p_items) as item;
  if exists (select 1 from jsonb_array_elements(p_items) as item where coalesce(length(trim(item->>'product')), 0) = 0 or length(item->>'product') > 240 or coalesce((item->>'quantity')::numeric, 0) <= 0 or coalesce((item->>'quantity')::numeric, 0) > 1000000 or coalesce((item->>'unit_price')::numeric, -1) < 0 or coalesce((item->>'unit_price')::numeric, 0) > 1000000000000) then raise exception 'Each line needs a product, a positive quantity, and a valid unit price.' using errcode = '22023'; end if;
  if coalesce(p_discount, 0) > v_subtotal then raise exception 'The discount cannot exceed the invoice subtotal.' using errcode = '22023'; end if;
  if p_invoice_id is null then
    v_invoice_id := gen_random_uuid(); v_invoice_number := 'ENV-' || lpad(nextval('public.envoiz_invoice_number_seq')::text, 6, '0');
    insert into public.envoiz_invoices (id, user_id, invoice_number, client_name, client_email, billing_address, issue_date, due_date, payment_status, currency, exchange_rate_to_usd, discount, notes, company_name, company_address)
    values (v_invoice_id, v_user_id, v_invoice_number, trim(p_client_name), nullif(trim(coalesce(p_client_email, '')), ''), nullif(trim(coalesce(p_billing_address, '')), ''), p_issue_date, p_due_date, p_payment_status, p_currency, p_exchange_rate_to_usd, coalesce(p_discount, 0), nullif(p_notes, ''), nullif(trim(coalesce(p_company_name, '')), ''), nullif(trim(coalesce(p_company_address, '')), ''));
  else
    update public.envoiz_invoices set client_name = trim(p_client_name), client_email = nullif(trim(coalesce(p_client_email, '')), ''), billing_address = nullif(trim(coalesce(p_billing_address, '')), ''), issue_date = p_issue_date, due_date = p_due_date, payment_status = p_payment_status, currency = p_currency, exchange_rate_to_usd = coalesce(p_exchange_rate_to_usd, exchange_rate_to_usd), discount = coalesce(p_discount, 0), notes = nullif(p_notes, ''), company_name = nullif(trim(coalesce(p_company_name, '')), ''), company_address = nullif(trim(coalesce(p_company_address, '')), '') where id = p_invoice_id and user_id = v_user_id returning id, invoice_number into v_invoice_id, v_invoice_number;
    if not found then raise exception 'Invoice not found.' using errcode = 'P0002'; end if;
    delete from public.envoiz_invoice_items where invoice_id = v_invoice_id;
  end if;
  insert into public.envoiz_invoice_items (invoice_id, product, quantity, unit_price) select v_invoice_id, item->>'product', (item->>'quantity')::numeric, (item->>'unit_price')::numeric from jsonb_array_elements(p_items) as item;
  return jsonb_build_object('id', v_invoice_id, 'invoice_number', v_invoice_number);
end;
$function$;

revoke all on function public.save_envoiz_invoice(uuid,text,text,text,date,date,text,text,numeric,numeric,text,text,text,jsonb) from public, anon;
grant execute on function public.save_envoiz_invoice(uuid,text,text,text,date,date,text,text,numeric,numeric,text,text,text,jsonb) to authenticated;
