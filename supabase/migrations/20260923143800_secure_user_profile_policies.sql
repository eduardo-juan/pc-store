create or replace function public.usuario_actual_rol()
returns text
language sql
stable
security definer
set search_path = public
as $$
  select rol from public.usuarios where id = auth.uid();
$$;

create or replace function public.usuario_actual_bloqueado()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select coalesce(bloqueado, false) from public.usuarios where id = auth.uid();
$$;

create or replace function public.usuario_actual_activo()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select coalesce(activo, true) from public.usuarios where id = auth.uid();
$$;

drop policy if exists "usuarios_insertar_propio" on public.usuarios;
create policy "usuarios_insertar_propio"
on public.usuarios
for insert
to authenticated
with check (
  id = auth.uid()
  and rol = 'user'
  and coalesce(bloqueado, false) = false
  and coalesce(activo, true) = true
  and email = (auth.jwt() ->> 'email')
);

drop policy if exists "usuarios_actualizar" on public.usuarios;
create policy "usuarios_actualizar"
on public.usuarios
for update
to authenticated
using (id = auth.uid() or es_admin())
with check (
  (
    id = auth.uid()
    and rol = usuario_actual_rol()
    and coalesce(bloqueado, false) = usuario_actual_bloqueado()
    and (rol = 'empleado' or coalesce(activo, true) = usuario_actual_activo())
    and email = (auth.jwt() ->> 'email')
  )
  or es_admin()
);
