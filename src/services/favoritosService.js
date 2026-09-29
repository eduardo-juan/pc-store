// ============================================================
// SERVICIO DE FAVORITOS
// Centraliza las operaciones para consultar, agregar
// y eliminar productos de los favoritos del usuario.
// ============================================================
import { supabase } from '../supabaseClient'

// Obtiene los productos favoritos del usuario junto
// con la información necesaria para mostrarlos en la tienda.
export async function obtenerFavoritos(usuarioId) {

// Consulta los favoritos asociados al usuario y los ordena
// desde el más reciente hasta el más antiguo.  
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

// Guarda la relación entre el usuario y el producto seleccionado
// como un nuevo favorito.  
export async function agregarFavorito(usuarioId, productoId) {

// Consulta los favoritos asociados al usuario y los ordena
// desde el más reciente hasta el más antiguo.  
  return await supabase
    .from('favoritos')
    .insert({
      usuario_id: usuarioId,
      producto_id: productoId,
    })
    .select()
    .single()
}

// Elimina el producto de los favoritos del usuario.
export async function eliminarFavorito(usuarioId, productoId) {
  return await supabase
    .from('favoritos')
    .delete()
    .eq('usuario_id', usuarioId)
    .eq('producto_id', productoId)
}