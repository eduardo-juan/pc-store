-- Keep administrative sales reports inaccessible to anonymous clients.
revoke execute on function public.reporte_clientes_por_periodo(timestamptz,timestamptz) from anon, public;
revoke execute on function public.reporte_productos_vendidos_por_periodo(timestamptz,timestamptz) from anon, public;
