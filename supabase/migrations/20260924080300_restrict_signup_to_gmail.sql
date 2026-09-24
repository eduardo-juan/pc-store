create or replace function public.hook_restringir_registro_gmail(event jsonb)
returns jsonb
language plpgsql
as $$
declare
  email text;
  dominio text;
begin
  email := lower(trim(event->'user'->>'email'));
  dominio := split_part(email, '@', 2);

  if dominio <> 'gmail.com' then
    return jsonb_build_object(
      'error', jsonb_build_object(
        'http_code', 400,
        'message', 'Solo se permiten correos de Gmail (@gmail.com).'
      )
    );
  end if;

  return '{}'::jsonb;
end;
$$;

grant usage on schema public to supabase_auth_admin;
grant execute on function public.hook_restringir_registro_gmail(jsonb)
to supabase_auth_admin;
revoke execute on function public.hook_restringir_registro_gmail(jsonb)
from anon, authenticated, public;
