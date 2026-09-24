-- Restringir una RPC que ya no utiliza el frontend.
-- La función queda disponible solo para uso interno del backend.
revoke execute on function public.obtener_empleados_disponibles() from authenticated, anon, public;
