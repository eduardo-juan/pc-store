// ============================================================
// SERVICIO DE INVENTARIO
// Centraliza las operaciones para consultar el inventario,
// actualizar existencias y registrar cambios de stock.
// ============================================================
import { supabase } from '../supabaseClient'

// Servicio utilizado para administrar las existencias
// de los productos y su historial de movimientos.
export const inventarioService = {

// Obtiene los productos junto con su stock actual
// para mostrar y controlar las existencias.  
  async obtenerInventario() {
 
// Consulta únicamente los datos necesarios para el inventario.    
    return await supabase.from('productos').select('id, nombre, stock')
  },

// Actualiza la cantidad disponible de un producto
// utilizando el nuevo valor de stock recibido.  
  async actualizarStock(productoId, nuevoStock) {
    return await supabase
      .from('productos')
      .update({ stock: nuevoStock })
      .eq('id', productoId)
  },

// Registra en el historial la modificación realizada
// sobre el stock y la razón del cambio.  
  async registrarCambio(productoId, cantidadAnterior, cantidadNueva, razon) {

// Guarda las cantidades anterior y nueva junto con el motivo
// para mantener trazabilidad de los movimientos de inventario.    
    return await supabase.from('inventario_historial').insert([{
      producto_id: productoId,
      cantidad_anterior: cantidadAnterior,
      cantidad_nueva: cantidadNueva,
      razón: razon
    }])
  }
}