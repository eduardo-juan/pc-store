-- Reduce anonymous Data API privileges to read-only on intentionally public tables.
revoke all on table public.auditoria_accesos, public.carrito_sesiones, public.categorias, public.configuracion_empleados, public.configurador_componentes, public.cupones, public.cupones_usos, public.empleado_comisiones, public.favoritos, public.inventario_historial, public.notificaciones_empleados, public.ordenes, public.pcs_armadas, public.producto_proveedores, public.productos, public.resenas_valoraciones, public.reseñas, public.usuarios from anon;

grant select on table public.categorias, public.configurador_componentes, public.cupones, public.pcs_armadas, public.productos, public.resenas_valoraciones, public.reseñas to anon;
