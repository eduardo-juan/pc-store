-- Elimina una sobrecarga antigua de cancelar_orden_pc_store que ya no se utiliza.
-- La versión vigente exige motivo de cancelación y mantiene la validación de sesión,
-- rol, estado y propiedad de la orden.
drop function if exists public.cancelar_orden_pc_store(bigint);
