-- Hardening for order creation:
-- limits cart size/component count and revalidates aggregate quantities
-- so repeated product IDs cannot drive inventory below zero.

create or replace function public.crear_orden_pc_store(
  p_items jsonb,
  p_nombre_cliente text,
  p_apellido_cliente text,
  p_telefono text,
  p_direccion text,
  p_ciudad text,
  p_metodo_pago text,
  p_notas text default null,
  p_referencia text default null,
  p_empleado_id uuid default null,
  p_cupon_codigo text default null
)
returns bigint
language plpgsql
security definer
set search_path = public
as $function$
declare
  v_usuario uuid := auth.uid();
  v_email text;
  v_item jsonb;
  v_componente jsonb;
  v_producto record;
  v_producto_id bigint;
  v_cantidad integer;
  v_precio numeric(10,2);
  v_subtotal numeric(10,2) := 0;
  v_envio numeric(10,2) := 100;
  v_total numeric(10,2);
  v_orden_id bigint;
  v_numero_orden text;
  v_items_finales jsonb := '[]'::jsonb;
  v_tiene_producto boolean := false;
  v_tiene_configurador boolean := false;
  v_costo_armado numeric(10,2) := 1500;
  v_descuento numeric(10,2) := 0;
  v_cupon_codigo text := null;
  v_cupon_id bigint := null;
  v_cupon public.cupones%rowtype;
begin
  if v_usuario is null then
    raise exception 'Debes iniciar sesión para crear una orden';
  end if;

  select email into v_email from auth.users where id = v_usuario;

  if p_items is null
     or jsonb_typeof(p_items) <> 'array'
     or jsonb_array_length(p_items) = 0 then
    raise exception 'El carrito está vacío';
  end if;

  if jsonb_array_length(p_items) > 50 then
    raise exception 'El carrito contiene demasiadas líneas';
  end if;

  for v_item in select value from jsonb_array_elements(p_items)
  loop
    if coalesce(v_item->>'tipo','producto') = 'configurador' then
      v_tiene_configurador := true;

      if jsonb_typeof(v_item->'componentes') <> 'array'
         or jsonb_array_length(v_item->'componentes') = 0 then
        raise exception 'La PC configurada no contiene componentes';
      end if;

      if jsonb_array_length(v_item->'componentes') > 8 then
        raise exception 'La PC configurada contiene demasiados componentes';
      end if;

      v_subtotal := v_subtotal + v_costo_armado;

      for v_componente in select value from jsonb_array_elements(v_item->'componentes')
      loop
        v_producto_id := (v_componente->>'producto_id')::bigint;
        v_cantidad := coalesce((v_componente->>'cantidad')::integer,1);

        if v_producto_id is null or v_cantidad <= 0 then
          raise exception 'Componente inválido en la PC configurada';
        end if;

        select id,nombre,precio,precio_descuento,stock,activo
        into v_producto
        from public.productos
        where id = v_producto_id
        for update;

        if not found then raise exception 'Componente no encontrado'; end if;
        if v_producto.activo is not true then
          raise exception 'El componente % no está disponible', v_producto.nombre;
        end if;
        if v_producto.stock < v_cantidad then
          raise exception 'Stock insuficiente para %', v_producto.nombre;
        end if;

        v_precio := coalesce(v_producto.precio_descuento,v_producto.precio);
        v_subtotal := v_subtotal + (v_precio * v_cantidad);

        v_item := jsonb_set(
          v_item,
          '{componentes}',
          (
            select jsonb_agg(
              case
                when (x->>'producto_id')::bigint = v_producto_id then
                  x || jsonb_build_object(
                    'nombre',v_producto.nombre,
                    'precio',v_precio,
                    'subtotal',v_precio*v_cantidad
                  )
                else x
              end
            )
            from jsonb_array_elements(v_item->'componentes') x
          )
        );
      end loop;

      v_item := v_item || jsonb_build_object(
        'tipo','configurador',
        'costo_armado',v_costo_armado,
        'precio_componentes',
          (select coalesce(sum((x->>'subtotal')::numeric),0)
           from jsonb_array_elements(v_item->'componentes') x),
        'precio',
          (select coalesce(sum((x->>'subtotal')::numeric),0)
           from jsonb_array_elements(v_item->'componentes') x) + v_costo_armado
      );

      v_items_finales := v_items_finales || jsonb_build_array(v_item);
    else
      v_tiene_producto := true;
      v_producto_id := (v_item->>'producto_id')::bigint;
      v_cantidad := coalesce((v_item->>'cantidad')::integer,0);

      if v_producto_id is null or v_cantidad <= 0 then
        raise exception 'Producto o cantidad inválida';
      end if;

      select id,nombre,precio,precio_descuento,stock,activo
      into v_producto
      from public.productos
      where id = v_producto_id
      for update;

      if not found then raise exception 'Producto no encontrado'; end if;
      if v_producto.activo is not true then
        raise exception 'El producto % no está disponible',v_producto.nombre;
      end if;
      if v_producto.stock < v_cantidad then
        raise exception 'Stock insuficiente para %',v_producto.nombre;
      end if;

      v_precio := coalesce(v_producto.precio_descuento,v_producto.precio);
      v_subtotal := v_subtotal + (v_precio * v_cantidad);

      v_items_finales := v_items_finales || jsonb_build_array(
        jsonb_build_object(
          'tipo','producto',
          'producto_id',v_producto.id,
          'nombre',v_producto.nombre,
          'cantidad',v_cantidad,
          'precio',v_precio,
          'subtotal',v_precio*v_cantidad
        )
      );
    end if;
  end loop;

  -- Revalidación agregada: un mismo producto puede aparecer en varias líneas.
  if exists (
    select 1
    from (
      select (x->>'producto_id')::bigint as producto_id,
             sum((x->>'cantidad')::integer) as cantidad
      from jsonb_array_elements(v_items_finales) i
      cross join lateral jsonb_array_elements(
        case
          when i->>'tipo'='configurador' then i->'componentes'
          else jsonb_build_array(i)
        end
      ) x
      group by 1
    ) t
    join public.productos p on p.id=t.producto_id
    where t.cantidad > p.stock
  ) then
    raise exception 'Stock insuficiente para uno o más productos';
  end if;

  if nullif(btrim(p_cupon_codigo),'') is not null then
    select * into v_cupon
    from public.cupones
    where upper(btrim(codigo))=upper(btrim(p_cupon_codigo))
    limit 1
    for update;

    if not found then raise exception 'Cupón no encontrado'; end if;

    if exists (
      select 1 from public.cupones_usos u
      where u.cupon_id=v_cupon.id and u.usuario_id=v_usuario
    ) then
      raise exception 'Ya utilizaste este cupón anteriormente';
    end if;

    if v_cupon.activo is not true then raise exception 'Cupón inactivo'; end if;
    if v_cupon.fecha_inicio is not null and now() < v_cupon.fecha_inicio then
      raise exception 'El cupón aún no está disponible';
    end if;
    if v_cupon.fecha_fin is not null and now() > v_cupon.fecha_fin then
      raise exception 'El cupón ha vencido';
    end if;
    if v_cupon.limite_usos is not null and v_cupon.usos_actuales >= v_cupon.limite_usos then
      raise exception 'Límite de usos alcanzado';
    end if;
    if v_subtotal < coalesce(v_cupon.compra_minima,0) then
      raise exception 'No alcanza la compra mínima';
    end if;

    v_cupon_id := v_cupon.id;
    v_cupon_codigo := v_cupon.codigo;

    if v_cupon.tipo='porcentaje' then
      v_descuento := round(v_subtotal*(v_cupon.valor/100),2);
    else
      v_descuento := least(v_cupon.valor,v_subtotal);
    end if;
  end if;

  v_total := greatest(v_subtotal + v_envio - v_descuento,0);
  v_numero_orden := 'PC-' || to_char(now(),'YYYYMMDD') || '-' ||
                    upper(substring(gen_random_uuid()::text,1,8));

  insert into public.ordenes(
    usuario_id,empleado_id,email,nombre_cliente,apellido_cliente,items,
    subtotal,impuestos,envío,total,estado,método_pago,dirección_envío,
    ciudad_envío,teléfono_contacto,notas,referencia,numero_orden,moneda,
    cupon_codigo,descuento,tipo_orden
  )
  values(
    v_usuario,null,v_email,p_nombre_cliente,p_apellido_cliente,v_items_finales,
    v_subtotal,0,v_envio,v_total,'pendiente',p_metodo_pago,p_direccion,
    p_ciudad,p_telefono,p_notas,p_referencia,v_numero_orden,'HNL',
    v_cupon_codigo,v_descuento,
    case when v_tiene_configurador and v_tiene_producto then 'mixta'
         when v_tiene_configurador then 'configurador'
         else 'producto' end
  )
  returning id into v_orden_id;

  if v_cupon_id is not null then
    insert into public.cupones_usos(cupon_id,usuario_id,orden_id)
    values(v_cupon_id,v_usuario,v_orden_id);

    update public.cupones
    set usos_actuales=usos_actuales+1,updated_at=now()
    where id=v_cupon_id;
  end if;

  for v_item in select value from jsonb_array_elements(v_items_finales)
  loop
    if coalesce(v_item->>'tipo','producto')='configurador' then
      for v_componente in select value from jsonb_array_elements(v_item->'componentes')
      loop
        v_producto_id := (v_componente->>'producto_id')::bigint;
        v_cantidad := coalesce((v_componente->>'cantidad')::integer,1);

        select id,stock into v_producto
        from public.productos where id=v_producto_id for update;

        update public.productos
        set stock=stock-v_cantidad,updated_at=now()
        where id=v_producto.id;

        insert into public.inventario_historial(
          producto_id,cantidad_anterior,cantidad_nueva,razón,usuario_id
        )
        values(v_producto.id,v_producto.stock,v_producto.stock-v_cantidad,
               'venta - PC configurada',v_usuario);
      end loop;
    else
      v_producto_id := (v_item->>'producto_id')::bigint;
      v_cantidad := (v_item->>'cantidad')::integer;

      select id,stock into v_producto
      from public.productos where id=v_producto_id for update;

      update public.productos
      set stock=stock-v_cantidad,updated_at=now()
      where id=v_producto.id;

      insert into public.inventario_historial(
        producto_id,cantidad_anterior,cantidad_nueva,razón,usuario_id
      )
      values(v_producto.id,v_producto.stock,v_producto.stock-v_cantidad,
             'venta',v_usuario);
    end if;
  end loop;

  return v_orden_id;
end;
$function$;
