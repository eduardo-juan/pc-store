// ============================================================
// SERVICIO DE ÓRDENES
// Centraliza las operaciones para consultar órdenes
// y actualizar su estado.
// ============================================================
import { supabase } from '../supabaseClient'

// Servicio encargado de gestionar la información
// de las órdenes almacenadas en Supabase.
export const ordenesService = {

// Obtiene todas las órdenes pertenecientes a un usuari  
  async obtenerOrdenes(usuarioId) {
    return await supabase
      .from('ordenes')
      .select('id,usuario_id,email,items,subtotal,impuestos,envío,total,estado,método_pago,dirección_envío,ciudad_envío,teléfono_contacto,notas,tracking_code,created_at,updated_at,nombre_cliente,apellido_cliente,referencia,moneda,numero_orden,empleado_id,motivo_cancelacion,cupon_codigo,descuento,tipo_orden')
      .eq('usuario_id', usuarioId)
  },

// Obtiene una orden específica mediante su identificador.  
  async obtenerOrden(ordenId) {

// Consulta los datos completos necesarios para mostrar
// y administrar las órdenes del usuario.    
    return await supabase
      .from('ordenes')
      .select('id,usuario_id,email,items,subtotal,impuestos,envío,total,estado,método_pago,dirección_envío,ciudad_envío,teléfono_contacto,notas,tracking_code,created_at,updated_at,nombre_cliente,apellido_cliente,referencia,moneda,numero_orden,empleado_id,motivo_cancelacion,cupon_codigo,descuento,tipo_orden')
      .eq('id', ordenId)

// Indica que se espera una única orden como resultado.      
      .single()
  },

// Cambia el estado actual de una orden.  
  async actualizarEstado(ordenId, nuevoEstado) {
    return await supabase
      .from('ordenes')

// Guarda el nuevo estado asociado a la orden indicada.      
      .update({ estado: nuevoEstado })
      .eq('id', ordenId)
  }
}