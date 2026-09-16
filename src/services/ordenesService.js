import { supabase } from '../supabaseClient'

export const ordenesService = {
  async obtenerOrdenes(usuarioId) {
    return await supabase.from('ordenes').select('*').eq('usuario_id', usuarioId)
  },

  async obtenerOrden(ordenId) {
    return await supabase.from('ordenes').select('*').eq('id', ordenId).single()
  },

  async actualizarEstado(ordenId, nuevoEstado) {
    return await supabase.from('ordenes').update({ estado: nuevoEstado }).eq('id', ordenId)
  },
}
