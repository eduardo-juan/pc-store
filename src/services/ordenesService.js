import { supabase } from '../supabaseClient'

export const ordenesService = {
  async obtenerOrdenes(usuarioId) {
    return await supabase
      .from('ordenes')
      .select('id,usuario_id,email,items,subtotal,impuestos,envío,total,estado,método_pago,dirección_envío,ciudad_envío,teléfono_contacto,notas,tracking_code,created_at,updated_at,nombre_cliente,apellido_cliente,referencia,moneda,numero_orden,empleado_id,motivo_cancelacion,cupon_codigo,descuento,tipo_orden')
      .eq('usuario_id', usuarioId)
  },

  async obtenerOrden(ordenId) {
    return await supabase
      .from('ordenes')
      .select('id,usuario_id,email,items,subtotal,impuestos,envío,total,estado,método_pago,dirección_envío,ciudad_envío,teléfono_contacto,notas,tracking_code,created_at,updated_at,nombre_cliente,apellido_cliente,referencia,moneda,numero_orden,empleado_id,motivo_cancelacion,cupon_codigo,descuento,tipo_orden')
      .eq('id', ordenId)
      .single()
  },

  async actualizarEstado(ordenId, nuevoEstado) {
    return await supabase
      .from('ordenes')
      .update({ estado: nuevoEstado })
      .eq('id', ordenId)
  }
}