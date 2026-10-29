-- Complete account deletion for the Settings page.
-- The function runs as the database owner so the client only needs the
-- authenticated user's permission to invoke it.
create or replace function public.delete_user()
returns void
language plpgsql
security definer
set search_path = public, pg_temp
as $function$
declare
  target_user_id uuid := auth.uid();
begin
  if target_user_id is null then
    raise exception 'Not authenticated';
  end if;

  -- Remove profile images stored under the user's id before removing auth data.
  delete from storage.objects
  where bucket_id = 'avatars'
    and name like target_user_id::text || '/%';

  -- Invoice items are removed by the invoice foreign-key cascade where
  -- configured; this explicit delete also supports older schemas safely.
  delete from public.envoiz_invoice_items
  where invoice_id in (
    select id from public.envoiz_invoices where user_id = target_user_id
  );
  delete from public.envoiz_invoices where user_id = target_user_id;

  -- Auth deletion cascades through auth identities and sessions.
  delete from auth.users where id = target_user_id;
end;
$function$;

revoke all on function public.delete_user() from public, anon;
grant execute on function public.delete_user() to authenticated;
