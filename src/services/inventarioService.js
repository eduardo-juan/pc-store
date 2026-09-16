import { supabase } from '../supabaseClient'

export const inventarioService = {
  async obtenerInventario() {
    return await supabase.from('productos').select('id, nombre, stock')
  },

  async actualizarStock(productoId, nuevoStock) {
    return await supabase.from('productos').update({ stock: nuevoStock }).eq('id', productoId)
  },

  async registrarCambio(productoId, cantidadAnterior, cantidadNueva, razon) {
    return await supabase.from('inventario_historial').insert([
      {
        producto_id: productoId,
        cantidad_anterior: cantidadAnterior,
        cantidad_nueva: cantidadNueva,
        razón: razon,
      },
    ])
  },
}
