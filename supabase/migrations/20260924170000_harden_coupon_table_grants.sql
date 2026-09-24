-- Harden coupon table grants: keep direct access minimal and rely on RLS/RPCs.
revoke all on table public.cupones, public.cupones_usos from anon;
revoke all on table public.cupones_usos from authenticated;

grant select on table public.cupones to anon;
grant select, insert, update, delete on table public.cupones to authenticated;
