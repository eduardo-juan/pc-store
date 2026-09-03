import { supabase } from '../supabaseClient'

// Obtener todos los productos
export const obtenerProductos = async (filtros = {}) => {
  try {
    let query = supabase
      .from('productos')
      .select('*, categorias(nombre)')
      .eq('activo', true)

    // Aplicar filtros
    if (filtros.categoria_id) {
      query = query.eq('categoria_id', filtros.categoria_id)
    }
    if (filtros.marca) {
      query = query.eq('marca', filtros.marca)
    }
    if (filtros.busqueda) {
      query = query.ilike('nombre', `%${filtros.busqueda}%`)
    }

    const { data, error } = await query

    if (error) throw error
    return { success: true, data }
  } catch (error) {
    return { success: false, error: error.message }
  }
}

// Obtener un producto
export const obtenerProducto = async (id) => {
  try {
    const { data, error } = await supabase
      .from('productos')
      .select('*, categorias(nombre), reseñas(*)')
      .eq('id', id)
      .single()

    if (error) throw error
    return { success: true, data }
  } catch (error) {
    return { success: false, error: error.message }
  }
}

// Crear producto (SOLO ADMIN)
export const crearProducto = async (producto) => {
  try {
    const { data, error } = await supabase
      .from('productos')
      .insert([producto])
      .select()

    if (error) throw error
    return { success: true, data: data[0] }
  } catch (error) {
    return { success: false, error: error.message }
  }
}

// Actualizar producto (SOLO ADMIN)
export const actualizarProducto = async (id, cambios) => {
  try {
    const { data, error } = await supabase
      .from('productos')
      .update(cambios)
      .eq('id', id)
      .select()

    if (error) throw error
    return { success: true, data: data[0] }
  } catch (error) {
    return { success: false, error: error.message }
  }
}

// Eliminar producto (SOLO ADMIN)
export const eliminarProducto = async (id) => {
  try {
    const { error } = await supabase
      .from('productos')
      .delete()
      .eq('id', id)

    if (error) throw error
    return { success: true }
  } catch (error) {
    return { success: false, error: error.message }
  }
}

// Obtener categorías
export const obtenerCategorias = async () => {
  try {
    const { data, error } = await supabase
      .from('categorias')
      .select('*')

    if (error) throw error
    return { success: true, data }
  } catch (error) {
    return { success: false, error: error.message }
  }
}