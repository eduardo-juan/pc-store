-- Estas RPC no son llamadas por el frontend actual y no deben quedar
-- expuestas a cualquier usuario autenticado.
revoke execute on function public.cancelar_orden_pc_store(bigint) from authenticated, anon, public;
revoke execute on function public.eliminar_usuario_pc_store(uuid) from authenticated, anon, public;
