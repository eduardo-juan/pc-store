// ============================================================
// SERVICIO DE FAVORITOS
// Centraliza las consultas y cambios de favoritos asociados
// a un usuario dentro de Supabase.
// ============================================================
import { supabase } from '../supabaseClient'

// Obtiene los favoritos del usuario y trae los datos básicos del producto
// relacionados para poder mostrarlos directamente en la interfaz.
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

// Crea la relación usuario-producto que representa un nuevo favorito.
// Devuelve el registro insertado para que la interfaz pueda actualizarse.
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

// Elimina únicamente el favorito que pertenece al usuario y producto indicados.
export async function eliminarFavorito(usuarioId, productoId) {
  return await supabase
    .from('favoritos')
    .delete()
    .eq('usuario_id', usuarioId)
    .eq('producto_id', productoId)
}
