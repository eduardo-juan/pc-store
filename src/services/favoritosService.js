import { supabase } from '../supabaseClient'

export async function obtenerFavoritos(usuarioId) {
  return await supabase
    .from('favoritos')
    .select(`
      id,
      producto_id,
      created_at,
      productos (
        id,
        nombre,
        precio,
        precio_descuento,
        stock,
        imagen_principal,
        marca,
        modelo,
        activo
      )
    `)
    .eq('usuario_id', usuarioId)
    .order('created_at', { ascending: false })
}

export async function agregarFavorito(usuarioId, productoId) {
  return await supabase
    .from('favoritos')
    .insert({
      usuario_id: usuarioId,
      producto_id: productoId,
    })
    .select()
    .single()
}

export async function eliminarFavorito(usuarioId, productoId) {
  return await supabase
    .from('favoritos')
    .delete()
    .eq('usuario_id', usuarioId)
    .eq('producto_id', productoId)
}